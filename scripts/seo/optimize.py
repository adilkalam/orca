#!/Users/adilkalam/.claude/venv/bin/python
"""
SEO Content Optimizer

Analyzes content against SERP competitors using NLP techniques.
Generates optimization reports and consumer-focused schema markup.

Usage:
    python optimize.py analyze --content FILE --competitors JSON --keyword KW --output-dir DIR
    python optimize.py tfidf --content FILE --competitors JSON --output FILE
    python optimize.py entities --content FILE --competitors JSON --output FILE
    python optimize.py structure --content FILE --competitors JSON --output FILE
    python optimize.py readability --content FILE --output FILE
    python optimize.py schema --content FILE --output FILE [--faq]

Requirements:
    pip install scikit-learn spacy textstat
    python -m spacy download en_core_web_sm
"""

import argparse
import json
import re
import sys
from abc import ABC, abstractmethod
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Protocol, Optional
from datetime import datetime


# =============================================================================
# Data Provider Abstraction
# =============================================================================

@dataclass
class KeywordData:
    """Keyword metrics from SERP data provider."""
    keyword: str
    volume: int
    difficulty: float
    cpc: float
    
@dataclass
class SERPResult:
    """Single SERP result."""
    url: str
    title: str
    position: int
    description: Optional[str] = None


class SERPDataProvider(Protocol):
    """Abstract interface for SERP data providers.
    
    Implementations:
    - DataForSEOProvider (future)
    """
    
    def get_keyword_data(self, keyword: str, country: str = "us") -> KeywordData:
        """Get keyword metrics (volume, difficulty, CPC)."""
        ...
    
    def get_serp_results(self, keyword: str, limit: int = 10, country: str = "us") -> list[SERPResult]:
        """Get organic SERP results for keyword."""
        ...


class DataForSEOProvider:
    """DataForSEO SERP data provider.
    
    Future implementation for when DataForSEO API is configured.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
    
    def get_keyword_data(self, keyword: str, country: str = "us") -> KeywordData:
        raise NotImplementedError(
            "DataForSEO provider not yet implemented. "
            "Configure DATAFORSEO_API_KEY and implement API calls."
        )
    
    def get_serp_results(self, keyword: str, limit: int = 10, country: str = "us") -> list[SERPResult]:
        raise NotImplementedError(
            "DataForSEO provider not yet implemented. "
            "Configure DATAFORSEO_API_KEY and implement API calls."
        )


# =============================================================================
# Analysis Functions
# =============================================================================

def analyze_tfidf(content: str, competitors: list[dict]) -> dict:
    """TF-IDF semantic analysis comparing content to competitors.
    
    Args:
        content: The content to analyze
        competitors: List of competitor content dicts with 'content' key
    
    Returns:
        Analysis results with coverage score and missing terms
    """
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        import numpy as np
    except ImportError:
        return {
            "error": "scikit-learn not installed. Run: pip install scikit-learn",
            "coverage_score": 0,
            "missing_terms": [],
            "term_recommendations": []
        }
    
    # Combine all competitor content
    competitor_texts = [c.get('content', '') for c in competitors if c.get('content')]
    if not competitor_texts:
        return {
            "coverage_score": 0,
            "missing_terms": [],
            "term_recommendations": ["No competitor content available for analysis"]
        }
    
    # Create TF-IDF matrix
    all_docs = [content] + competitor_texts
    vectorizer = TfidfVectorizer(
        max_features=500,
        stop_words='english',
        ngram_range=(1, 2),
        min_df=1
    )
    
    try:
        tfidf_matrix = vectorizer.fit_transform(all_docs)
    except ValueError:
        return {
            "coverage_score": 0,
            "missing_terms": [],
            "term_recommendations": ["Insufficient content for TF-IDF analysis"]
        }
    
    feature_names = vectorizer.get_feature_names_out()
    
    # Get content and competitor term scores
    content_scores = tfidf_matrix[0].toarray().flatten()
    competitor_avg = np.mean(tfidf_matrix[1:].toarray(), axis=0)
    
    # Find terms where competitors score high but content scores low
    missing_terms = []
    overused_terms = []
    
    for i, term in enumerate(feature_names):
        comp_score = competitor_avg[i]
        our_score = content_scores[i]
        
        if comp_score > 0.05 and our_score < comp_score * 0.3:
            missing_terms.append({
                "term": term,
                "importance": float(comp_score),
                "competitor_frequency": float(comp_score * len(competitors))
            })
        elif our_score > comp_score * 2 and our_score > 0.1:
            overused_terms.append({
                "term": term,
                "frequency": float(our_score),
                "competitor_avg": float(comp_score)
            })
    
    # Sort by importance
    missing_terms.sort(key=lambda x: x['importance'], reverse=True)
    overused_terms.sort(key=lambda x: x['frequency'], reverse=True)
    
    # Calculate coverage score
    # Compare how many important competitor terms we cover
    important_terms = [i for i, score in enumerate(competitor_avg) if score > 0.03]
    covered = sum(1 for i in important_terms if content_scores[i] > 0.01)
    coverage_score = (covered / max(len(important_terms), 1)) * 100
    
    # Generate recommendations
    recommendations = []
    for term in missing_terms[:5]:
        count = sum(1 for c in competitor_texts if term['term'].lower() in c.lower())
        recommendations.append(f"Add '{term['term']}' - appears in {count}/{len(competitors)} top competitors")
    
    return {
        "coverage_score": round(coverage_score, 1),
        "missing_terms": missing_terms[:20],
        "overused_terms": overused_terms[:10],
        "term_recommendations": recommendations
    }


def analyze_entities(content: str, competitors: list[dict]) -> dict:
    """Entity extraction and coverage analysis using spaCy.
    
    Args:
        content: The content to analyze
        competitors: List of competitor content dicts
    
    Returns:
        Entity coverage analysis
    """
    try:
        import spacy
        nlp = spacy.load("en_core_web_sm")
    except (ImportError, OSError):
        return {
            "error": "spaCy not installed or model missing. Run: pip install spacy && python -m spacy download en_core_web_sm",
            "coverage_score": 0,
            "entities_found": {},
            "missing_entities": []
        }
    
    # Extract entities from content
    doc = nlp(content[:100000])  # Limit for performance
    content_entities = {}
    for ent in doc.ents:
        ent_type = ent.label_
        if ent_type not in content_entities:
            content_entities[ent_type] = set()
        content_entities[ent_type].add(ent.text.lower())
    
    # Extract entities from competitors
    competitor_entities = {}
    for comp in competitors:
        comp_text = comp.get('content', '')[:100000]
        if not comp_text:
            continue
        comp_doc = nlp(comp_text)
        for ent in comp_doc.ents:
            ent_type = ent.label_
            ent_text = ent.text.lower()
            if ent_type not in competitor_entities:
                competitor_entities[ent_type] = {}
            if ent_text not in competitor_entities[ent_type]:
                competitor_entities[ent_type][ent_text] = 0
            competitor_entities[ent_type][ent_text] += 1
    
    # Find missing entities
    missing_entities = []
    for ent_type, entities in competitor_entities.items():
        content_ents = content_entities.get(ent_type, set())
        for entity, count in entities.items():
            if entity not in content_ents and count >= 2:
                missing_entities.append({
                    "entity": entity,
                    "type": ent_type,
                    "competitor_coverage": count
                })
    
    missing_entities.sort(key=lambda x: x['competitor_coverage'], reverse=True)
    
    # Calculate coverage score
    total_important = sum(1 for ents in competitor_entities.values() 
                         for e, c in ents.items() if c >= 2)
    covered = sum(1 for ent_type, ents in competitor_entities.items()
                  for e, c in ents.items() 
                  if c >= 2 and e in content_entities.get(ent_type, set()))
    
    coverage_score = (covered / max(total_important, 1)) * 100
    
    # Convert sets to lists for JSON serialization
    entities_found = {k: list(v) for k, v in content_entities.items()}
    
    return {
        "coverage_score": round(coverage_score, 1),
        "entities_found": entities_found,
        "missing_entities": missing_entities[:15]
    }


def analyze_structure(content: str, competitors: list[dict]) -> dict:
    """Analyze content structure compared to competitors.
    
    Args:
        content: The content to analyze
        competitors: List of competitor content dicts
    
    Returns:
        Structure analysis with recommendations
    """
    def count_headings(text: str, level: int) -> int:
        pattern = rf'^{"#" * level} [^#]'
        return len(re.findall(pattern, text, re.MULTILINE))
    
    def count_words(text: str) -> int:
        return len(text.split())
    
    def has_faq_section(text: str) -> bool:
        faq_patterns = [
            r'##?\s*(FAQ|Frequently Asked Questions)',
            r'##?\s*Common Questions',
            r'\?\s*\n+[A-Z]'  # Q&A pattern
        ]
        return any(re.search(p, text, re.IGNORECASE) for p in faq_patterns)
    
    def count_links(text: str, internal: bool = True) -> int:
        if internal:
            # Internal links typically don't have http
            pattern = r'\[([^\]]+)\]\((?!https?://)[^)]+\)'
        else:
            pattern = r'\[([^\]]+)\]\(https?://[^)]+\)'
        return len(re.findall(pattern, text))
    
    # Analyze content
    content_h1 = count_headings(content, 1)
    content_h2 = count_headings(content, 2)
    content_h3 = count_headings(content, 3)
    content_words = count_words(content)
    content_faq = has_faq_section(content)
    content_internal = count_links(content, internal=True)
    content_external = count_links(content, internal=False)
    
    # Analyze competitors
    comp_h2s = []
    comp_h3s = []
    comp_words = []
    comp_faq = 0
    
    for comp in competitors:
        comp_text = comp.get('content', '')
        if comp_text:
            comp_h2s.append(count_headings(comp_text, 2))
            comp_h3s.append(count_headings(comp_text, 3))
            comp_words.append(count_words(comp_text))
            if has_faq_section(comp_text):
                comp_faq += 1
    
    avg_h2 = sum(comp_h2s) / max(len(comp_h2s), 1)
    avg_h3 = sum(comp_h3s) / max(len(comp_h3s), 1)
    avg_words = sum(comp_words) / max(len(comp_words), 1)
    faq_rate = comp_faq / max(len(competitors), 1)
    
    # Calculate structure score
    score_components = []
    
    # H1 check (should have exactly 1)
    score_components.append(100 if content_h1 == 1 else 50)
    
    # H2 comparison
    h2_ratio = content_h2 / max(avg_h2, 1)
    score_components.append(min(100, h2_ratio * 100))
    
    # Word count comparison
    word_ratio = content_words / max(avg_words, 1)
    score_components.append(min(100, word_ratio * 100))
    
    # FAQ presence (if competitors have it)
    if faq_rate > 0.5:
        score_components.append(100 if content_faq else 40)
    
    structure_score = sum(score_components) / len(score_components)
    
    # Generate recommendations
    recommendations = []
    
    if content_words < avg_words * 0.8:
        diff = int(avg_words - content_words)
        recommendations.append(f"Increase word count by ~{diff} words to match competitors")
    
    if content_h2 < avg_h2 - 1:
        recommendations.append(f"Add {int(avg_h2 - content_h2)} more H2 sections for better structure")
    
    if faq_rate > 0.5 and not content_faq:
        recommendations.append(f"Add FAQ section - {int(faq_rate * 100)}% of competitors have one")
    
    if content_internal < 3:
        recommendations.append("Add more internal links (target: 3-5)")
    
    if content_external < 5:
        recommendations.append("Add more external citations (target: 5-8)")
    
    return {
        "structure_score": round(structure_score, 1),
        "heading_analysis": {
            "h1_count": content_h1,
            "h2_count": content_h2,
            "h3_count": content_h3,
            "competitor_avg_h2": round(avg_h2, 1),
            "competitor_avg_h3": round(avg_h3, 1)
        },
        "word_count": content_words,
        "competitor_avg_word_count": round(avg_words),
        "has_faq_section": content_faq,
        "competitor_faq_rate": round(faq_rate, 2),
        "internal_links": content_internal,
        "external_links": content_external,
        "recommendations": recommendations
    }


def analyze_readability(content: str) -> dict:
    """Analyze content readability using textstat.
    
    Args:
        content: The content to analyze
    
    Returns:
        Readability metrics and issues
    """
    try:
        import textstat
    except ImportError:
        return {
            "error": "textstat not installed. Run: pip install textstat",
            "readability_score": 0,
            "flesch_reading_ease": 0,
            "flesch_kincaid_grade": 0
        }
    
    # Calculate metrics
    flesch_ease = textstat.flesch_reading_ease(content)
    fk_grade = textstat.flesch_kincaid_grade(content)
    
    # Sentence analysis
    sentences = re.split(r'[.!?]+', content)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    avg_sentence_len = sum(len(s.split()) for s in sentences) / max(len(sentences), 1)
    
    # Find long sentences
    issues = []
    for i, sentence in enumerate(sentences):
        words = len(sentence.split())
        if words > 35:
            issues.append({
                "type": "long_sentence",
                "line": i + 1,
                "length": words,
                "recommendation": "Split into 2 sentences"
            })
    
    # Calculate readability score (normalized 0-100)
    # Flesch Reading Ease is 0-100 where higher is easier
    # Target for consumer content: 60-70
    if 60 <= flesch_ease <= 70:
        readability_score = 100
    elif 50 <= flesch_ease < 60 or 70 < flesch_ease <= 80:
        readability_score = 85
    elif 40 <= flesch_ease < 50 or 80 < flesch_ease <= 90:
        readability_score = 70
    else:
        readability_score = 50
    
    # Adjust for sentence length
    if 15 <= avg_sentence_len <= 20:
        pass  # Good
    elif 12 <= avg_sentence_len < 15 or 20 < avg_sentence_len <= 25:
        readability_score -= 10
    else:
        readability_score -= 20
    
    return {
        "readability_score": max(0, min(100, round(readability_score, 1))),
        "flesch_reading_ease": round(flesch_ease, 1),
        "flesch_kincaid_grade": round(fk_grade, 1),
        "avg_sentence_length": round(avg_sentence_len, 1),
        "avg_word_length": round(textstat.avg_letter_per_word(content), 1),
        "issues": issues[:10]
    }


def generate_schema(content: str, include_faq: bool = False) -> dict:
    """Generate consumer-focused schema markup.
    
    Args:
        content: The content to generate schema for
        include_faq: Whether to include FAQPage schema
    
    Returns:
        Schema.org JSON-LD markup
    """
    # Extract title (first H1)
    title_match = re.search(r'^# (.+)$', content, re.MULTILINE)
    title = title_match.group(1) if title_match else "Article Title"
    
    # Extract description (first paragraph after title)
    desc_match = re.search(r'^# .+\n+(.+?)(?:\n\n|\n#)', content, re.MULTILINE | re.DOTALL)
    description = desc_match.group(1).strip()[:160] if desc_match else ""
    
    # Extract citations
    citation_pattern = r'\[([^\]]+)\]\((https?://[^)]+)\)'
    citations = []
    for match in re.finditer(citation_pattern, content):
        citations.append({
            "@type": "CreativeWork",
            "name": match.group(1),
            "url": match.group(2)
        })
    
    # Article schema (consumer-focused, NOT medical)
    article_schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        "author": {
            "@type": "Person",
            "name": "{{AUTHOR_NAME}}"
        },
        "publisher": {
            "@type": "Organization",
            "name": "{{PUBLISHER_NAME}}",
            "logo": {
                "@type": "ImageObject",
                "url": "{{LOGO_URL}}"
            }
        },
        "datePublished": datetime.now().strftime("%Y-%m-%d"),
        "dateModified": datetime.now().strftime("%Y-%m-%d"),
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "{{PAGE_URL}}"
        }
    }
    
    if citations:
        article_schema["citation"] = citations[:10]
    
    schemas = [article_schema]
    
    # FAQ schema if requested and FAQ section exists
    if include_faq:
        faq_pattern = r'(?:^|\n)##?\s*(?:FAQ|Frequently Asked Questions|Common Questions).*?\n((?:###?\s*.+?\n.+?\n?)+)'
        faq_match = re.search(faq_pattern, content, re.IGNORECASE | re.DOTALL)
        
        if faq_match:
            faq_content = faq_match.group(1)
            qa_pattern = r'###?\s*(.+?)\n([^#]+?)(?=###?|$)'
            qa_pairs = re.findall(qa_pattern, faq_content)
            
            if qa_pairs:
                faq_schema = {
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": [
                        {
                            "@type": "Question",
                            "name": q.strip(),
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": a.strip()
                            }
                        }
                        for q, a in qa_pairs[:10]
                    ]
                }
                schemas.append(faq_schema)
    
    return schemas[0] if len(schemas) == 1 else schemas


def run_full_analysis(content: str, competitors: list[dict], keyword: str, output_dir: Path) -> dict:
    """Run complete analysis pipeline.
    
    Args:
        content: Content to analyze
        competitors: Competitor content list
        keyword: Target keyword
        output_dir: Output directory for results
    
    Returns:
        Combined analysis results
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Run all analyses
    tfidf_result = analyze_tfidf(content, competitors)
    entity_result = analyze_entities(content, competitors)
    structure_result = analyze_structure(content, competitors)
    readability_result = analyze_readability(content)
    
    # Calculate composite score
    composite = (
        tfidf_result.get('coverage_score', 0) * 0.35 +
        entity_result.get('coverage_score', 0) * 0.25 +
        structure_result.get('structure_score', 0) * 0.20 +
        readability_result.get('readability_score', 0) * 0.20
    )
    
    # Determine grade
    if composite >= 85:
        grade = 'A'
    elif composite >= 70:
        grade = 'B'
    elif composite >= 55:
        grade = 'C'
    elif composite >= 40:
        grade = 'D'
    else:
        grade = 'F'
    
    # Generate schema
    has_faq = structure_result.get('has_faq_section', False)
    schema = generate_schema(content, include_faq=has_faq)
    
    # Compile results
    results = {
        "keyword": keyword,
        "timestamp": datetime.now().isoformat(),
        "composite_score": round(composite, 1),
        "grade": grade,
        "tfidf": tfidf_result,
        "entities": entity_result,
        "structure": structure_result,
        "readability": readability_result,
        "schema": schema
    }
    
    return results


# =============================================================================
# CLI Interface
# =============================================================================

def main():
    parser = argparse.ArgumentParser(description="SEO Content Optimizer")
    subparsers = parser.add_subparsers(dest='command', help='Analysis command')
    
    # Full analysis command
    analyze_parser = subparsers.add_parser('analyze', help='Run full analysis')
    analyze_parser.add_argument('--content', required=True, help='Content file path')
    analyze_parser.add_argument('--competitors', required=True, help='Competitors JSON file')
    analyze_parser.add_argument('--keyword', required=True, help='Target keyword')
    analyze_parser.add_argument('--output-dir', required=True, help='Output directory')
    
    # Individual analysis commands
    tfidf_parser = subparsers.add_parser('tfidf', help='TF-IDF analysis')
    tfidf_parser.add_argument('--content', required=True)
    tfidf_parser.add_argument('--competitors', required=True)
    tfidf_parser.add_argument('--output', required=True)
    
    entity_parser = subparsers.add_parser('entities', help='Entity extraction')
    entity_parser.add_argument('--content', required=True)
    entity_parser.add_argument('--competitors', required=True)
    entity_parser.add_argument('--output', required=True)
    
    struct_parser = subparsers.add_parser('structure', help='Structure analysis')
    struct_parser.add_argument('--content', required=True)
    struct_parser.add_argument('--competitors', required=True)
    struct_parser.add_argument('--output', required=True)
    
    read_parser = subparsers.add_parser('readability', help='Readability analysis')
    read_parser.add_argument('--content', required=True)
    read_parser.add_argument('--output', required=True)
    
    schema_parser = subparsers.add_parser('schema', help='Generate schema')
    schema_parser.add_argument('--content', required=True)
    schema_parser.add_argument('--output', required=True)
    schema_parser.add_argument('--faq', action='store_true', help='Include FAQ schema')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # Load content
    content = Path(args.content).read_text()
    
    # Load competitors if needed
    competitors = []
    if hasattr(args, 'competitors') and args.competitors:
        competitors = json.loads(Path(args.competitors).read_text())
    
    # Run appropriate command
    if args.command == 'analyze':
        result = run_full_analysis(content, competitors, args.keyword, args.output_dir)
        
        # Save individual files
        output_dir = Path(args.output_dir)
        (output_dir / 'analysis.json').write_text(json.dumps(result, indent=2))
        (output_dir / 'schema.json').write_text(json.dumps(result['schema'], indent=2))
        
        print(f"Analysis complete. Composite score: {result['composite_score']}/100 ({result['grade']})")
        print(f"Results saved to: {output_dir}")
        
    elif args.command == 'tfidf':
        result = analyze_tfidf(content, competitors)
        Path(args.output).write_text(json.dumps(result, indent=2))
        print(f"TF-IDF coverage: {result.get('coverage_score', 0)}/100")
        
    elif args.command == 'entities':
        result = analyze_entities(content, competitors)
        Path(args.output).write_text(json.dumps(result, indent=2))
        print(f"Entity coverage: {result.get('coverage_score', 0)}/100")
        
    elif args.command == 'structure':
        result = analyze_structure(content, competitors)
        Path(args.output).write_text(json.dumps(result, indent=2))
        print(f"Structure score: {result.get('structure_score', 0)}/100")
        
    elif args.command == 'readability':
        result = analyze_readability(content)
        Path(args.output).write_text(json.dumps(result, indent=2))
        print(f"Readability score: {result.get('readability_score', 0)}/100")
        
    elif args.command == 'schema':
        result = generate_schema(content, include_faq=args.faq)
        Path(args.output).write_text(json.dumps(result, indent=2))
        print(f"Schema generated: {args.output}")


if __name__ == '__main__':
    main()
