# Guide

Read the [Disclaimer](DISCLAIMER.md) first.

## Install

Node.js 20 or newer (tested on 20 and 24).

```bash
git clone https://github.com/rennystar/ncode2epub && cd ncode2epub
npm install
npx ncode2epub --help
```

## Interactive mode

```bash
npx ncode2epub
```

1. Type a title, author, N-code, novel URL or romaji, then pick the novel with ↑↓ and Enter.
2. The tool shows the novel page link. Open it (⌘-click / Ctrl-click), scroll to the very bottom, and press **縦書きPDF** in the row 「作者マイページ ｜ 縦書きPDF ｜ 情報提供」 under the 「+注意+」 box. If the browser shows the PDF instead of saving it, save it from the viewer.
3. As soon as that novel's PDF lands in `~/Downloads`, it is converted and `title.epub` is written next to it.

Esc goes back to search, Ctrl+C quits. The tool never opens the browser or downloads anything by itself.

## Commands

| Command | What it does |
|---|---|
| `ncode2epub` | Interactive mode (above) |
| `ncode2epub search <words>` | List matching novels with their page links |
| `ncode2epub convert <pdf>` | Convert one downloaded PDF (the EPUB goes next to it) |
| `ncode2epub watch` | Convert every official PDF that lands in the folder |

Options: `--dir <folder>` (default `~/Downloads`), `--lang ja|en|ko` (default: system language).

## Search

The official API only matches substrings. When a query finds nothing, it is split at spaces and at particles such as 「の」 between kanji, romaji is turned into kana, each piece is searched, and the results are ranked by how many pieces match, then by total points. 「薬屋の独り言」 and 「kusuriya no hitorigoto」 both find 『薬屋のひとりごと』. English (licensed) titles are not in the site's data.

## What the EPUB contains

Vertical writing (right-to-left pages), ruby, a cover drawn from the title and author, author and synopsis metadata, a table of contents by episode, and 前書き/後書き attached to their episode.

Send it with **Send to Kindle** (web, app or email). Kindle e-readers do not read EPUB copied over USB.

## Known limits

- Illustrations are not in the official PDF; each becomes a 「［挿絵］」 link to its page.
- Arc (章) titles are not in the PDF either, so the table of contents lists episodes only.
- Ruby is rebuilt from positions: when a short reading sits on a longer word the base can be off by a character (e.g. 玄人《プロ》 → 玄《プロ》人). About 94% match a Narou.rb build of 『薬屋のひとりごと』.
- A line of exactly 30 characters may join the next one, because the PDF does not distinguish a line break from wrapping (about 1.5% of lines in the same test).
- An updated novel needs its whole PDF downloaded again.
- Layout constants match the PDFs of January 2026; if the site changes its PDF, re-measure the values at the top of `core.js`.
