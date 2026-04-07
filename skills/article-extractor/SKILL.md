---
name: article-extractor
description: "Extract clean article content from URLs and save as readable text. Use when user wants to download, extract, or save an article or blog post from a URL, removing ads, navigation, and clutter."
allowed-tools: Bash, Write
---

# Article Extractor

Extracts main content from web articles and blog posts, removing navigation, ads, newsletter signups, and clutter. Saves clean, readable text.

## When to Use

Activate when the user:
- Provides an article/blog URL and wants text content
- Asks to "download this article" or "extract the content from [URL]"
- Wants to save a blog post as clean text

## Tool Priority

Check for extraction tools in order:

1. **reader** (recommended — Mozilla Readability): `command -v reader` / install: `npm install -g @mozilla/readability-cli`
2. **trafilatura** (Python-based, very good for blogs/news): `command -v trafilatura` / install: `pip3 install trafilatura`
3. **Fallback** (curl + basic HTML parsing — less reliable)

## Extraction Workflow

```bash
ARTICLE_URL="https://example.com/article"

# Detect best available tool
if command -v reader &> /dev/null; then
    TOOL="reader"
elif command -v trafilatura &> /dev/null; then
    TOOL="trafilatura"
else
    TOOL="fallback"
fi

# Extract based on tool
case $TOOL in
    reader)
        reader "$ARTICLE_URL" > temp_article.txt
        TITLE=$(head -n 1 temp_article.txt | sed 's/^# //')
        ;;
    trafilatura)
        METADATA=$(trafilatura --URL "$ARTICLE_URL" --json)
        TITLE=$(echo "$METADATA" | python3 -c "import json, sys; print(json.load(sys.stdin).get('title', 'Article'))")
        trafilatura --URL "$ARTICLE_URL" --output-format txt --no-comments > temp_article.txt
        ;;
    fallback)
        TITLE=$(curl -s "$ARTICLE_URL" | grep -oP '<title>\K[^<]+' | head -n 1)
        TITLE=${TITLE%% - *}
        curl -s "$ARTICLE_URL" | python3 -c "
from html.parser import HTMLParser
import sys

class ArticleExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_content = False
        self.content = []
        self.skip_tags = {'script', 'style', 'nav', 'header', 'footer', 'aside', 'form'}

    def handle_starttag(self, tag, attrs):
        if tag not in self.skip_tags and tag in {'p', 'article', 'main'}:
            self.in_content = True

    def handle_data(self, data):
        if self.in_content and data.strip():
            self.content.append(data.strip())

    def get_content(self):
        return '\n\n'.join(self.content)

parser = ArticleExtractor()
parser.feed(sys.stdin.read())
print(parser.get_content())
" > temp_article.txt
        ;;
esac

# Clean filename and save
FILENAME=$(echo "$TITLE" | tr '/:?\"<>|' '-------' | cut -c 1-80 | sed 's/ *$//')
mv temp_article.txt "${FILENAME}.txt"
echo "Extracted: $TITLE → ${FILENAME}.txt"
```

## Error Handling

| Problem | Solution |
|---------|----------|
| Tool not installed | Try next tool in priority order; offer install command |
| Paywall or login required | Inform user: "This article requires authentication" |
| No content extracted | Try fallback method; inform user if all methods fail |
| Special characters in title | Strip `/ : ? " < > |` and limit to 80 chars |

## After Extraction

1. Show: "Extracted: [Article Title]" and "Saved to: [filename]"
2. Preview first 10 lines of extracted content
3. Report file size and which tool was used
4. Offer: "Create a Ship-Learn-Next plan from this?" (if ship-learn-next skill available)
