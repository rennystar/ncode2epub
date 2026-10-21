// 小説家になろう official 「縦書きPDF」 → vertical EPUB for Kindle.
// Never touches the site: reads only the PDF (a pdf.js document) the user downloaded.
import { zipSync, strToU8 } from 'fflate';
import { createCanvas } from '@napi-rs/canvas';

// Layout of the official PDF (ToriiHina no PDF Maker, A4 landscape), measured on 2026-01 PDFs.
// ponytail: if the site changes its PDF, re-measure these first
const COL0 = 748.4, PITCH = 22.68, COLS = 30;  // first column centre x, column pitch, columns per page (pt)
const TOP = 97.4, BODY = 14, RUBY = 7;         // top of a column's first char (from top), body / ruby size
const ASCENT = 0.8826;                         // pdf.js baseline y → glyph top: pageHeight - y + ASCENT*size
const RUBY_DX = 11.4, RUBY_DY = 6.2;           // ruby sits 11.4pt right of and 6.2pt above its base column
const FULL = TOP + COLS * BODY - 0.5;          // bottom of a full 30-char column
const BREAK_AFTER = '」』）';                   // a full column ending in these, followed by an opening bracket, ends the line
const SP = '　';

const colIndex = (x) => Math.round((COL0 - x) / PITCH);
const isKanji = (c) => { const o = c.codePointAt(0); return (o >= 0x4e00 && o <= 0x9fff) || (o >= 0x3400 && o <= 0x4dbf) || o >= 0x20000 || '々〆ヵヶ'.includes(c); };
// pdf.js returns vertical presentation forms (︒︑︵…); map them back. NFKC would turn ︵︖ into half-width ( ?.
const VERT = Object.fromEntries([...'︐︑︒︓︔︕︖︗︘︙︰︱︲︳︴︵︶︷︸︹︺︻︼︽︾︿﹀﹁﹂﹃﹄﹇﹈']
  .map((c, i) => [c, [...'，、。：；！？〖〗…‥―–＿＿（）｛｝〔〕【】《》〈〉「」『』［］'][i]]));
const norm = (c) => VERT[c] ?? c;
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Official PDF = made by ToriiHina, titled with an N-code.
export async function isOfficial(doc) {
  const { info } = await doc.getMetadata();
  return /ToriiHina/.test(info.Creator || '') && /^N\d{4}[A-Z]{1,2}$/i.test(info.Title || '');
}

// The PDF never draws spaces: restore gaps (and leading indents) as full-width spaces.
function fillSpaces(chars, start) {
  const out = [];
  let y = start;
  for (const ch of chars) {
    for (; ch[0] - y > BODY * 0.5; y += BODY) out.push([y, y + BODY, SP]);
    out.push(ch);
    y = ch[1];
  }
  return out;
}

async function parsePage(page, bold) {
  const H = page.view[3];
  const cols = {}, ruby = {}, title = [];
  for (const it of (await page.getTextContent()).items) {
    const text = it.str.replace(/ /g, '');           // fake spaces inserted by pdf.js
    if (!text.trim()) continue;
    const size = Math.round(Math.hypot(it.transform[0], it.transform[1]));
    if (size !== BODY && size !== RUBY) continue;     // skip 12pt page numbers, 20pt cover title…
    if (!(it.fontName in bold)) {                     // look up each font's name once
      await page.getOperatorList();
      bold[it.fontName] = /Bold/.test(page.commonObjs.get(it.fontName)?.name || '');
    }
    const chars = [...text], step = it.height / chars.length;
    const x = it.transform[4], y = H - it.transform[5] + ASCENT * size;
    const list = size === RUBY ? (ruby[colIndex(x - RUBY_DX)] ??= [])
      : bold[it.fontName] ? title : (cols[colIndex(x)] ??= []);
    chars.forEach((c, i) => list.push([y + i * step, y + (i + 1) * step, norm(c)]));
  }
  const byY = (a, b) => a[0] - b[0];
  for (const k in cols) cols[k] = fillSpaces(cols[k].sort(byY), TOP);
  for (const k in ruby) ruby[k].sort(byY);
  title.sort(byY);
  return { title: title.length ? fillSpaces(title, title[0][0]).map((c) => c[2]).join('') : null, cols, ruby };
}

// One column's body and ruby chars → ['char' | ['base', 'ruby']].
// Touching ruby chars form a run; body chars overlapping the run (moved down 6.2pt) are its base:
// kanji need ≥5pt overlap, other chars almost full overlap (long ruby overhangs its neighbours).
// ponytail: ~94% match a Narou.rb build of 『薬屋』; short ruby on a long word (長椅子《カウチ》)
// cannot be told apart by position, so the base may be off by a char or two.
function rubyTokens(base, ruby) {
  const runs = [];
  for (const r of ruby) {
    const last = runs.at(-1);
    if (last && r[0] - last.at(-1)[1] < 0.5) last.push(r); else runs.push([r]);
  }
  const groups = [];                                  // [first base, last base, ruby]
  for (const run of runs) {
    const ry0 = run[0][0] + RUBY_DY, ry1 = run.at(-1)[1] + RUBY_DY;
    const ov = base.map(([y0, y1]) => Math.min(y1, ry1) - Math.max(y0, ry0));
    let hit = base.flatMap((b, i) => (ov[i] >= BODY * 0.9 || (ov[i] >= 5 && isKanji(b[2])) ? [i] : []));
    if (!hit.length) hit = [ov.indexOf(Math.max(...ov))];
    const rt = run.map((r) => r[2]).join('');
    const g = groups.at(-1);
    if (g && hit[0] <= g[1]) { g[1] = Math.max(g[1], hit.at(-1)); g[2] += rt; }
    else groups.push([hit[0], hit.at(-1), rt]);
  }
  const out = [];
  let i = 0;
  for (const [lo, hi, rt] of groups) {
    out.push(...base.slice(i, lo).map((b) => b[2]), [base.slice(lo, hi + 1).map((b) => b[2]).join(''), rt]);
    i = hi + 1;
  }
  return out.concat(base.slice(i).map((b) => b[2]));
}

// Pages → [[title, lines]]; a line is rubyTokens output, a blank line is [].
export function buildSections(pages) {
  const sections = [];
  let title, lines = null, cur = null, prevFull = true;
  const flush = () => { if (cur) { lines.push(cur); cur = null; } };
  for (const p of pages) {
    // 短編 has no episode titles: its body starts on a fresh page after a part-filled 注意事項 page.
    const untitled = p.title === null && title === '注意事項' && !prevFull;
    if (p.title !== null || untitled) {
      if (lines) { flush(); sections.push([title, lines]); }
      title = p.title ?? ''; lines = [];
    }
    if (!lines) continue;                             // pages before 注意事項 = cover
    for (let k = p.title !== null ? 1 : 0; k < COLS; k++) {
      const base = p.cols[k];
      if (!base) { flush(); lines.push([]); continue; }
      const toks = rubyTokens(base, p.ruby[k] || []);
      cur = cur ? cur.concat(toks) : toks;
      const next = p.cols[k + 1];
      // line ends at a non-full column, or at 」「 between dialogue lines
      if (base.at(-1)[1] < FULL || (BREAK_AFTER.includes(base.at(-1)[2]) && next && '「『（'.includes(next[0][2]))) flush();
    }
    prevFull = Boolean(p.cols[COLS - 1]);
  }
  if (lines) { flush(); sections.push([title, lines]); }
  for (const [, ls] of sections) {                    // trim blank lines after titles and at the end
    while (ls.length && !ls[0].length) ls.shift();
    while (ls.length && !ls.at(-1).length) ls.pop();
  }
  return sections;
}

const plain = (line) => line.map((t) => (typeof t === 'string' ? t : t[0])).join('');

// 注意事項 section → title, N-code, author, synopsis.
export function parseInfo(lines) {
  const keys = { '【作品タイトル】': 'title', '【Ｎコード】': 'ncode', '【作者名】': 'author', '【あらすじ】': 'story' };
  const info = {};
  let key = null;
  for (const line of lines) {
    const t = plain(line).trim();
    if (keys[t]) info[key = keys[t]] = [];
    else if (key) info[key].push(t.replace(/^　+/, ''));
  }
  const out = Object.fromEntries(Object.entries(info).map(([k, v]) => [k, v.join('\n').trim()]));
  out.ncode = (out.ncode || '').normalize('NFKC').toLowerCase();
  return out;
}

// Attach 「…（前書き）」/「…（後書き）」 sections to their episode → [{title, pre, body, post}].
export function mergeNotes(sections) {
  const out = [];
  let pre = [];
  for (const [title, lines] of sections) {
    if (title.endsWith('（前書き）')) pre = lines;
    else if (title.endsWith('（後書き）') && out.length) out.at(-1).post.push(...lines);
    else { out.push({ title, pre, body: lines, post: [] }); pre = []; }
  }
  return out;
}

const ILLUST = /^<i(\d+)\|(\d+)>$/;                   // illustration tag left as text: ＜ｉimageID｜userID＞

export function toHtml(line) {
  if (!line.length) return '<p><br/></p>';
  const m = plain(line).normalize('NFKC').match(ILLUST);
  if (m) return `<p><a href="https://${m[2]}.mitemin.net/i${m[1]}/">［挿絵］</a></p>`;  // the PDF has no images
  return '<p>' + line.map((t) => (typeof t === 'string' ? esc(t) : `<ruby>${esc(t[0])}<rt>${esc(t[1])}</rt></ruby>`)).join('') + '</p>';
}

const CSS = `html { writing-mode: vertical-rl; -webkit-writing-mode: vertical-rl; -epub-writing-mode: vertical-rl; }
body { margin: 0; line-height: 1.8; font-family: serif; }
p { margin: 0; }
h2 { font-size: 1.2em; margin: 0 0 0 2em; }
.note { font-size: 0.9em; margin-left: 2em; }
rt { font-size: 0.5em; }
`;

const xhtml = (title, body) => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="ja" lang="ja">
<head><meta charset="UTF-8"/><title>${esc(title)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head>
<body>
${body}
</body>
</html>
`;

const FONT = '"Hiragino Mincho ProN", "Yu Mincho", YuMincho, "Noto Serif JP", "Noto Serif CJK JP", serif';
const ROTATE = new Set('ー－―—〜～…‥（）「」『』【】〔〕［］｛｝〈〉《》');

// Draw a vertical cover (JPEG) from the title and author.
async function makeCover(title, author) {
  const W = 1600, H = 2560;
  const canvas = createCanvas(W, H), g = canvas.getContext('2d');
  g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#222'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const column = (text, size, xRight, yTop, yMax) => {
    g.font = `${size}px ${FONT}`;
    let x = xRight - size / 2, y = yTop;
    for (const c of text) {
      if (y + size > yMax) { x -= size * 1.3; y = yTop; }   // wrap to the next column
      g.save(); g.translate(x, y + size / 2);
      if (ROTATE.has(c)) g.rotate(Math.PI / 2);            // rotate chars that lie sideways in vertical text
      g.fillText(c, 0, 0); g.restore();
      y += size * 1.05;
    }
    return x - size / 2;
  };
  const left = column(title, 150, W - 220, 260, H - 500);
  column(author, 90, left - 120, H - 1100, H - 200);
  return canvas.encode('jpeg', 90);
}

function writeEpub(info, chapters, cover) {
  const id = `https://ncode.syosetu.com/${info.ncode}/`;
  const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const names = chapters.map((_, i) => `c${String(i + 1).padStart(4, '0')}.xhtml`);
  const note = (ls) => (ls.length ? `<div class="note">\n${ls.map(toHtml).join('\n')}\n</div>` : '');
  const files = {
    mimetype: [strToU8('application/epub+zip'), { level: 0 }],   // first and uncompressed
    'META-INF/container.xml': strToU8(`<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>
`),
    'OEBPS/style.css': strToU8(CSS),
    'OEBPS/cover.jpg': [cover, { level: 0 }],               // Kindle shows the cover-image as the first page
  };
  chapters.forEach((c, i) => {
    const body = [`<h2>${esc(c.title)}</h2>`, note(c.pre), ...c.body.map(toHtml), note(c.post)].filter(Boolean).join('\n');
    files[`OEBPS/${names[i]}`] = strToU8(xhtml(c.title, body));
  });
  const li = chapters.map((c, i) => `<li><a href="${names[i]}">${esc(c.title)}</a></li>`).join('\n');
  files['OEBPS/nav.xhtml'] = strToU8(xhtml('目次', `<nav epub:type="toc"><h2>目次</h2><ol>\n${li}\n</ol></nav>`));
  const items = names.map((n, i) => `<item id="c${i + 1}" href="${n}" media-type="application/xhtml+xml"/>`).join('\n');
  const refs = names.map((_, i) => `<itemref idref="c${i + 1}"/>`).join('\n');
  files['OEBPS/content.opf'] = strToU8(`<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="ja">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="bookid">${id}</dc:identifier>
<dc:title>${esc(info.title)}</dc:title>
<dc:creator>${esc(info.author)}</dc:creator>
<dc:language>ja</dc:language>
<dc:description>${esc(info.story || '')}</dc:description>
<meta property="dcterms:modified">${now}</meta>
<meta name="cover" content="cover-image"/>
<meta name="primary-writing-mode" content="vertical-rl"/>
</metadata>
<manifest>
<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
<item id="css" href="style.css" media-type="text/css"/>
<item id="cover-image" href="cover.jpg" media-type="image/jpeg" properties="cover-image"/>
${items}
</manifest>
<spine page-progression-direction="rtl">
<itemref idref="nav"/>
${refs}
</spine>
</package>
`);
  return zipSync(files, { level: 6 });
}

// File name = title only, like the site. Titles over the 255-byte limit (~85 Japanese chars) are cut with …
export function epubName(title) {
  const chars = [...title.replace(/[\\/:*?"<>|]/g, '_').trim()], bytes = () => Buffer.byteLength(chars.join(''));
  const long = bytes() > 240;
  while (bytes() > 240) chars.pop();
  return `${chars.join('')}${long ? '…' : ''}.epub`;
}

// pdf.js document → { epub: Uint8Array, fileName, info, chapters }
export async function convert(doc, onProgress = () => {}) {
  const pages = [], bold = {};
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    pages.push(await parsePage(page, bold));
    page.cleanup();
    onProgress(i, doc.numPages);
    await new Promise(setImmediate);   // pdf.js only queues microtasks; yield so a progress UI can repaint
  }
  const sections = buildSections(pages);
  if (sections[0]?.[0] !== '注意事項') throw new Error('unexpected 縦書きPDF layout (no 注意事項 page)');
  const [head, ...rest] = sections;
  const body = rest[0]?.[0] === '' ? rest.shift()[1] : null;   // untitled body = 短編
  if (body && rest.length) head[1].push(...body);               // serial: a synopsis split by a page break, rejoin it
  const info = parseInfo(head[1]);
  const chapters = mergeNotes(body && !rest.length ? [[info.title, body]] : rest);
  const cover = await makeCover(info.title, info.author);
  return { epub: writeEpub(info, chapters, cover), fileName: epubName(info.title), info, chapters };
}
