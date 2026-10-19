#!/usr/bin/env node
// ncode2epub: interactive mode (search → novel page → wait for the PDF → EPUB) and script commands.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { styleText } from 'node:util';
import { createRequire } from 'node:module';
import * as p from '@clack/prompts';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { convert, isOfficial } from './core.js';
import { infotopUrl, search } from './search.js';
import { MESSAGES, pickLang } from './messages.js';

const PDFJS = path.dirname(createRequire(import.meta.url).resolve('pdfjs-dist/package.json'));

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i < 0 ? def : args.splice(i, 2)[1]; };
const t = MESSAGES[pickLang(opt('--lang'))];
const DIR = path.resolve(opt('--dir', '~/Downloads').replace(/^~(?=$|[\\/])/, os.homedir()));
const [cmd, ...rest] = args;

const openPdf = async (file) => {
  try {
    return await getDocument({
      data: new Uint8Array(fs.readFileSync(file)), verbosity: 0,
      cMapUrl: path.join(PDFJS, 'cmaps') + '/', cMapPacked: true,
      standardFontDataUrl: path.join(PDFJS, 'standard_fonts') + '/',
    }).promise;
  } catch (e) {
    throw new Error(t.badPdf(e.message));
  }
};
const short = (s, n) => ([...s].length > n ? [...s].slice(0, n - 1).join('') + '…' : s);
const home = (f) => f.replace(os.homedir(), '~');

// Converts a PDF and writes the EPUB next to it.
async function convertFile(file, onProgress) {
  const doc = await openPdf(file);
  try {
    if (!(await isOfficial(doc))) throw new Error(t.notOfficial);
    const r = await convert(doc, onProgress);
    const out = path.join(path.dirname(file), r.fileName);
    fs.writeFileSync(out, r.epub);
    return { out, title: r.info.title, author: r.info.author, chapters: r.chapters.length };
  } finally {
    await doc.destroy();
  }
}

// Calls onPdf(file) for each new PDF in dir. In-progress downloads (.crdownload…) are caught when renamed to .pdf
// and treated as complete once their size is stable for 1 s. close() the returned watcher to stop.
function watchPdfs(dir, onPdf) {
  const known = new Set(fs.readdirSync(dir)), busy = new Set();
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  return fs.watch(dir, async (_, name) => {
    if (!name || !name.toLowerCase().endsWith('.pdf') || known.has(name) || busy.has(name)) return;
    busy.add(name);
    const file = path.join(dir, name);
    try {
      for (let size = -1; ;) {
        const st = fs.statSync(file, { throwIfNoEntry: false });
        if (!st) return;
        if (st.size > 0 && st.size === size) break;
        size = st.size;
        await sleep(1000);
      }
      known.add(name);
      await onPdf(file);
    } catch (e) {
      console.error(t.failed(name, e.message));
    } finally {
      busy.delete(name);
    }
  });
}

// Waits until the chosen novel's official PDF lands in DIR. Esc → null (back to search).
// Ctrl+C is handled by the clack spinner, which exits the program.
function waitForPdf(ncode) {
  return new Promise((resolve) => {
    const { stdin } = process, s = p.spinner();
    let done = false;
    const finish = (file) => {
      if (done) return;
      done = true;
      w.close();
      stdin.off('data', onKey); stdin.setRawMode(false); stdin.pause();
      if (file) s.stop(t.received(path.basename(file))); else s.cancel(t.cancel);
      // for 0.5 s after Esc the terminal reads the next key as Alt+key, eating the first typed char
      setTimeout(() => resolve(file), file ? 0 : 600);
    };
    const onKey = (k) => { if (k[0] === 27) finish(null); };
    stdin.setRawMode(true); stdin.resume(); stdin.on('data', onKey);
    s.start(t.waiting(home(DIR)));
    const w = watchPdfs(DIR, async (file) => {
      const doc = await openPdf(file);
      const { info } = await doc.getMetadata();
      await doc.destroy();
      if ((info.Title || '').toLowerCase() === ncode) finish(file);
    });
  });
}

async function interactive() {
  p.updateSettings({ messages: { cancel: t.cancel, error: t.error } });
  p.intro(' ncode2epub — 縦書きPDF → Kindle EPUB ');
  p.log.info(t.why);                                   // say up front why the PDF is not downloaded for you
  for (;;) {
    const query = await p.text({ message: t.query, validate: (v) => (v?.trim() ? undefined : t.query) });
    if (p.isCancel(query)) break;
    const s = p.spinner();
    s.start(t.searching);
    let found;
    try {
      found = await search(query);
    } catch {
      s.stop(t.netError);
      continue;
    }
    if (!found.rows.length) { s.stop(t.none); continue; }
    s.stop(found.tokens ? t.split(found.tokens) : t.found(found.rows.length, found.allcount));
    const novel = await p.select({
      message: `${t.pick} (↑↓ · Enter)`,
      maxItems: 8,
      showInstructions: false,                          // clack's built-in hint is English-only
      options: [
        ...found.rows.map((r) => ({
          value: r,
          label: `${short(r.title, 28)} — ${short(r.writer, 12)}`,
          hint: `${t.ep(r.general_all_no)} · ${r.novelupdated_at.slice(0, 10)} · ${r.ncode.toLowerCase()}`,
        })),
        { value: 'again', label: `↩ ${t.again}` },
        { value: 'quit', label: t.quit },
      ],
    });
    if (p.isCancel(novel) || novel === 'quit') break;
    if (novel === 'again') continue;
    const ncode = novel.ncode.toLowerCase();
    // never open the browser: the link sits in step 1 so the user reads the steps and opens it
    const link = styleText(['cyan', 'underline', 'bold'], infotopUrl(ncode));
    p.note(t.steps(home(DIR), link, process.platform === 'darwin' ? '⌘' : 'Ctrl'), t.howTo);
    const file = await waitForPdf(ncode);
    if (!file) continue;
    const bar = p.progress({ max: 100 });
    bar.start(t.converting);
    let shown = 0;
    try {
      const r = await convertFile(file, (i, n) => {
        const pct = Math.floor((i / n) * 100);
        if (pct > shown) { bar.advance(pct - shown, `${t.converting} ${pct}%`); shown = pct; }
      });
      bar.stop(t.done(home(r.out), r.chapters));
    } catch (e) {
      bar.error(e.message);
    }
    const more = await p.confirm({ message: t.more, active: t.yes, inactive: t.no });
    if (p.isCancel(more) || !more) break;
  }
  p.outro(t.bye);
}

try {
  if (cmd === 'search' && rest.length) {
    const { allcount, rows, tokens } = await search(rest.join(' '));
    if (tokens) console.log(t.split(tokens));
    for (const r of rows) console.log(`${r.title}  / ${r.writer}  (${t.ep(r.general_all_no)}, ${r.novelupdated_at.slice(0, 10)})\n  ${infotopUrl(r.ncode)}`);
    console.log(`— ${t.found(rows.length, allcount)}`);
  } else if (cmd === 'convert' && rest[0]) {
    const r = await convertFile(rest[0]);
    console.log(t.done(r.out, r.chapters));
  } else if ((cmd === 'watch' || !cmd) && !fs.existsSync(DIR)) {
    throw new Error(t.noDir(DIR));
  } else if (cmd === 'watch') {
    watchPdfs(DIR, async (file) => {
      const r = await convertFile(file);
      console.log(t.done(home(r.out), r.chapters));
    });
    console.log(t.watching(home(DIR)));
  } else if (!cmd && process.stdin.isTTY) await interactive();
  else console.log(t.help);
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
