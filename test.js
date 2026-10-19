// node test.js — checks line joining, ruby, 前書き/後書き, info parsing and search without a real novel.
import assert from 'node:assert/strict';
import { buildSections, epubName, mergeNotes, parseInfo, toHtml } from './core.js';
const plain = (l) => l.map((t) => (typeof t === 'string' ? t : t[0])).join('');
import { queryTokens, searchParams } from './search.js';

const col = (text, start = 0) => [...text].map((c, i) => [97.4 + 14 * (i + start), 111.4 + 14 * (i + start), c]);
const rubyAt = (startY, text) => [...text].map((c, i) => [startY + 7 * i, startY + 7 * (i + 1), c]);

const full = 'あ'.repeat(28) + '猫猫';                     // 30 chars = full column → continues
const pages = [
  { title: '注意事項', cols: { 4: col('【作者名】'), 5: col('　日向夏') }, ruby: {} },
  { title: '１　猫猫（前書き）', cols: { 1: col('まえがき') }, ruby: {} },
  {
    title: '１　猫猫',
    cols: { 4: col(full), 5: col('です。'), 7: col('瘴気蠢く'), 8: col('う'.repeat(29) + '」'), 9: col('「いいえ」') },
    ruby: { 4: rubyAt(97.4 + 14 * 28 - 6.2, 'マオマオ'), 7: rubyAt(91.2, 'しょうきうごめ') },
  },
  { title: '１　猫猫（後書き）', cols: { 1: col('あとがき') }, ruby: {} },
];
const secs = buildSections(pages);
assert.equal(parseInfo(secs[0][1]).author, '日向夏');
const [ch] = mergeNotes(secs.slice(1));
assert.equal(ch.title, '１　猫猫');
assert.deepEqual(ch.pre, [['ま', 'え', 'が', 'き']]);
assert.deepEqual(ch.body[0].slice(28), [['猫猫', 'マオマオ'], 'で', 'す', '。']);   // joined columns + ruby
assert.deepEqual(ch.body[1], []);                                                    // empty column = blank line
assert.deepEqual(ch.body[2], [['瘴気蠢', 'しょうきうごめ'], 'く']);                  // hiragana く is not a ruby base
assert.equal(ch.body.length, 5);                                                     // full column ending 」 + next 「 = line end
assert.equal(ch.post.length, 1);
assert.match(toHtml([...'＜ｉ３２３８２７｜５１３０＞']), /5130\.mitemin\.net\/i323827\//);
assert.deepEqual(searchParams('https://ncode.syosetu.com/n9636x/').ncode, 'n9636x');
assert.equal(searchParams('薬屋').word, '薬屋');
assert.deepEqual(queryTokens('薬屋の独り言'), ['薬屋', '独り言']);                    // split at a particle between kanji
assert.deepEqual(queryTokens('kusuriya no hitorigoto'), ['くすりや', 'クスリヤ', 'ひとりごと', 'ヒトリゴト']);
assert.deepEqual(queryTokens('konnichiwa matcha'), ['こんにちわ', 'コンニチワ', 'まっちゃ', 'マッチャ']);
assert.deepEqual(queryTokens('Apothecary'), ['apothecary']);                         // English stays as is
// 短編: no episode title; the body starts on a new page after a part-filled info page
const allCols = Object.fromEntries([...Array(30).keys()].map((k) => [k, col('あ')]));
const short = buildSections([
  { title: '注意事項', cols: { ...allCols, 12: col('【あらすじ】'), 13: col('\u3000ねこ') }, ruby: {} },
  { title: null, cols: { 0: col('つづき') }, ruby: {} },
  { title: null, cols: { 0: col('本文です。') }, ruby: {} },
]);
assert.deepEqual(short.map((s) => s[0]), ['注意事項', '']);
assert.equal(plain(short[1][1][0]), '本文です。');
assert.equal(epubName('薬屋のひとりごと'), '薬屋のひとりごと.epub');
const long = epubName('長'.repeat(120) + '/題');                                       // long titles fit in 255 bytes
assert.ok(Buffer.byteLength(long) <= 255 && long.endsWith('….epub') && !long.includes('/'));
console.log('test ok');
