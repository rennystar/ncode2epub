# Guide

Read the [Disclaimer](DISCLAIMER.md) first.

## Install

Node.js 20+.

```bash
npx github:rennystar/ncode2epub              # run without installing
npm install -g github:rennystar/ncode2epub   # or install the ncode2epub command
```

## Usage

```bash
ncode2epub
```

1. Search by title, author, N-code, URL or romaji. Pick a novel with ↑↓ and Enter.
2. Open the novel page link (⌘-click or Ctrl-click). At the bottom, under the 「+注意+」 box, click 「縦書きPDF」. If the browser opens the PDF, save it.
3. When the PDF lands in `~/Downloads`, `title.epub` is written next to it.

Esc goes back to search. Ctrl+C quits. The tool never opens the browser or downloads anything itself.

## Commands

| Command | Description |
|---|---|
| `ncode2epub` | Interactive mode |
| `ncode2epub search <words>` | List novels with their page links |
| `ncode2epub convert <pdf>` | Convert one PDF. The EPUB is saved next to it |
| `ncode2epub watch` | Convert each official PDF that appears in the folder |

Options: `--dir <folder>` (default `~/Downloads`), `--lang ja|en|ko` (default: system language).

## Search

The API matches exact substrings only. When nothing matches, the query is split at spaces and at particles like 「の」, romaji is turned into kana, and each piece is searched. 「薬屋の独り言」 and 「kusuriya no hitorigoto」 both find 『薬屋のひとりごと』. English titles of translations are not in the site's data.

## Output

A vertical, right-to-left EPUB with ruby (furigana), a cover made from the title and author, author and synopsis in the book info, a table of contents by episode, and 前書き/後書き kept with their episode.

Send it with Send to Kindle (web, app or email). Kindles don't open EPUBs copied over USB.

## Limits

- The official PDF has no illustrations. Each becomes a 「［挿絵］」 link.
- The PDF has no arc (章) titles, so the table of contents lists episodes only.
- Ruby is placed by position and can land one character off (玄《プロ》人 for 玄人《プロ》). About 94% matched a Narou.rb build of 『薬屋のひとりごと』.
- A line of exactly 30 characters can merge with the next one (about 1.5% of lines).
- When a novel is updated, download the whole PDF again.
- Layout values match the PDFs of January 2026 (top of `core.js`).
