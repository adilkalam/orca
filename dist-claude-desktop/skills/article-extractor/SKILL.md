---
name: article-extractor
description: Extract clean article content from a URL (blog post, tutorial, news article) and return it as readable text, stripped of ads, navigation, and clutter. Use when the user provides an article/blog URL and wants the text content, asks to "extract this article", "get the clean text of this page", or "save this blog post as text".
---

# Article Extractor

Extracts the main content from a web article, removing navigation, ads, newsletter signups, and other clutter.

## Primary method: WebFetch

Always try this first — it works with no setup:

1. Fetch the URL with the built-in web-fetch tool, asking it to return the full article body (title, byline if present, section headings, body paragraphs) and explicitly to drop navigation, ads, related-article rails, comment sections, and cookie/newsletter banners.
2. If the fetch returns a paywall notice, login wall, or mostly-empty body, tell the user directly: "This page requires authentication or renders content client-side — I can't extract it via fetch." Do not guess at content.
3. Present the cleaned text back to the user (or write it to a file if the code-execution environment is available and the user wants a saved file).

## Fallback method: code execution (when available)

If the skill's bundled code-execution sandbox has internet access and the primary fetch produced a low-quality result (e.g. the site is heavy client-side JS), you may attempt a Python-based extraction:

```python
import urllib.request

req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
html = urllib.request.urlopen(req, timeout=15).read().decode("utf-8", errors="ignore")
```

Then run a readability-style extraction (strip `<script>`, `<style>`, `<nav>`, `<header>`, `<footer>`, `<aside>`; keep `<article>`, `<main>`, `<p>`, `<h1>`-`<h6>`). If the `trafilatura` or `readability-lxml` Python packages are installable in the sandbox, prefer them over hand-rolled HTML parsing — they handle a much wider variety of page structures correctly.

## Output

- Article title (if available)
- Author/byline (if available)
- Body text with section headings preserved
- No navigation, ads, or newsletter clutter

Always show the user a short preview (first ~10 lines) before treating the extraction as final, and offer to try again if it looks wrong (e.g. mostly boilerplate, truncated, or clearly not the article).

## Known limitations in this environment

Sites that require login, heavy client-side rendering with no server-rendered fallback, or that actively block automated fetches will not extract cleanly. Say so plainly rather than returning a near-empty or garbled result as if it were the article.
