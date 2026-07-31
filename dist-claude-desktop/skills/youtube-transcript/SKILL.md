---
name: youtube-transcript
description: Get the transcript/captions/subtitles of a YouTube video from its URL. Use when the user provides a YouTube URL and wants the transcript, asks to "get the transcript of this video", "what does this YouTube video say", or wants text content from a YouTube video without watching it.
---

# YouTube Transcript

Retrieves the spoken-word transcript of a YouTube video as plain text.

## Environment note

This skill depends on outbound network access and (for the full pipeline) a shell with `yt-dlp` installed. Claude.ai's code-execution sandbox is ephemeral and may not have `yt-dlp` pre-installed or may not have unrestricted internet access. Try the methods below in order and fall back honestly — do not fabricate a transcript.

## Method 1: Direct fetch of the timedtext endpoint (no extra tools)

YouTube exposes caption tracks via a public endpoint. If the code-execution sandbox has network access, try:

1. Fetch the video's watch page HTML and look for the `captionTracks` list in the embedded player config (a `baseUrl` per language).
2. Fetch that `baseUrl` (append `&fmt=json3` or leave as XML) to get the raw caption payload.
3. Parse out the text cues in order, deduplicating consecutive/overlapping lines (auto-generated captions repeat lines as they scroll).

## Method 2: yt-dlp (if the sandbox allows installing/using it)

```bash
command -v yt-dlp || pip3 install yt-dlp
yt-dlp --list-subs "VIDEO_URL"                                   # see what's available
yt-dlp --write-sub --skip-download --output "transcript" "VIDEO_URL"      # manual subs, preferred
# if none:
yt-dlp --write-auto-sub --skip-download --output "transcript" "VIDEO_URL" # auto-generated
```

This produces a `.vtt` file. Convert to plain text by stripping `WEBVTT`/`Kind:`/`Language:` header lines, timestamp lines (containing `-->`), and inline `<...>` tags, then deduplicating consecutive repeated lines (auto-captions overlap).

## Method 3: Ask the user

If neither method works (no network access in the sandbox, private/age-restricted video, no captions exist at all), tell the user plainly and ask them to paste the transcript text themselves, or point to YouTube's own "Show transcript" panel under the video.

## Do not attempt audio transcription

Downloading audio and running Whisper is a multi-GB, multi-minute operation that is very unlikely to be feasible in a Claude.ai code-execution sandbox. Do not attempt it silently — if captions are unavailable, say so and stop at Method 3.

## Output

Plain text transcript, deduplicated, in speaking order. Note which method produced it (direct fetch / yt-dlp manual subs / yt-dlp auto subs) so the user knows the likely quality (manual > auto-generated).
