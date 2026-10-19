# Guide

Please read the [Disclaimer](DISCLAIMER.md) first.

## Install

You need Node.js 20 or newer. I tested it on 20 and 24.

```bash
git clone https://github.com/rennystar/ncode2epub && cd ncode2epub
npm install
npx ncode2epub --help
```

## Interactive mode

```bash
npx ncode2epub
```

1. Type a title, author, N-code, novel URL or romaji, and pick the novel with ↑↓ and Enter.
2. You get a link to the novel page. Open it (⌘-click or Ctrl-click) and scroll to the very bottom. Under the 「+注意+」 box there is a row 「作者マイページ ｜ 縦書きPDF ｜ 情報提供」. Click 「縦書きPDF」 in the middle. If your browser opens the PDF instead of saving it, save it from there.
3. Once the PDF is in `~/Downloads`, it gets converted and `title.epub` appears next to it.

Esc takes you back to search, Ctrl+C quits. The tool doesn't open your browser or download anything on its own.

## Commands

| Command | What it does |
|---|---|
| `ncode2epub` | Interactive mode |
| `ncode2epub search <words>` | List novels with their page links |
| `ncode2epub convert <pdf>` | Convert one PDF. The EPUB is saved next to it |
| `ncode2epub watch` | Convert every official PDF that shows up in the folder |

Options: `--dir <folder>` (default `~/Downloads`) and `--lang ja|en|ko` (default is your system language).

## Search tips

The site's API only finds exact substrings, so 「薬屋の独り言」 or 「kusuriya no hitorigoto」 return nothing at first. When that happens, the query is split into pieces (at spaces, and at particles like 「の」 between kanji), romaji is turned into kana, and each piece is searched separately. Both examples above end up finding 『薬屋のひとりごと』. English titles of licensed translations aren't in the site's data, so they won't work.

## What you get

A vertical EPUB that reads right to left, with ruby (furigana), a cover made from the title and author, the author and synopsis in the book info, a table of contents by episode, and 前書き/後書き kept with their episode.

Send it with Send to Kindle (web, app or email). Kindles can't open an EPUB copied over USB.

## Known limits

- The official PDF has no illustrations. Where one was, you get a 「［挿絵］」 link to it.
- Arc (章) titles aren't in the PDF either, so the table of contents only lists episodes.
- Ruby is matched by position. When a short reading sits on a longer word, it can land one character off, like 玄《プロ》人 instead of 玄人《プロ》. In 『薬屋のひとりごと』 about 94% matched a Narou.rb build.
- A line that is exactly 30 characters long can merge with the next one, because the PDF looks the same either way. That was about 1.5% of lines in the same test.
- When a novel gets new episodes, you download the whole PDF again.
- The layout values were measured on PDFs from January 2026. If the site changes its PDF, they need measuring again (top of `core.js`).
