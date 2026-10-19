// Novel search through the official なろう小説API only (it never returns novel text).
const API = 'https://api.syosetu.com/novelapi/api/';
const UA = 'ncode2epub/0.1';

export const infotopUrl = (ncode) => `https://ncode.syosetu.com/novelview/infotop/ncode/${ncode.toLowerCase()}/`;

// Query → API parameters: an N-code or novel URL picks that novel, anything else is a keyword search by rating.
export function searchParams(query) {
  const m = query.match(/\bn\d{4}[a-z]{1,2}\b/i);
  return { ...(m ? { ncode: m[0] } : { word: query.trim(), order: 'hyoka' }), of: 't-n-w-ga-nu-gp', lim: '20' };
}

// The API only matches substrings, so 「薬屋の独り言」 or 「kusuriya no hitorigoto」 find nothing. Fallback pieces:
// split at spaces, punctuation and particles (の・が…) between kanji/katakana; romaji becomes kana.
export function queryTokens(query) {
  const q = query.normalize('NFKC').toLowerCase()
    .replace(/(?<=[^\p{Script=Hiragana}\s])[のがをにへとでもや](?=[^\p{Script=Hiragana}\s])/gu, ' ');
  const out = [];
  for (const w of q.split(/[\s\p{P}\p{S}]+/u)) {
    const kana = /^[a-z]+$/.test(w) ? toHiragana(w) : null;
    for (const t of kana ? [kana, toKatakana(kana)] : [w]) if ([...t].length >= 2 && !out.includes(t)) out.push(t);
  }
  return out;
}

const ROMA = Object.fromEntries(`a:あ i:い u:う e:え o:お ka:か ki:き ku:く ke:け ko:こ sa:さ shi:し si:し su:す se:せ so:そ
ta:た chi:ち ti:ち tsu:つ tu:つ te:て to:と na:な ni:に nu:ぬ ne:ね no:の ha:は hi:ひ fu:ふ hu:ふ he:へ ho:ほ
ma:ま mi:み mu:む me:め mo:も ya:や yu:ゆ yo:よ ra:ら ri:り ru:る re:れ ro:ろ wa:わ wo:を ga:が gi:ぎ gu:ぐ ge:げ go:ご
za:ざ ji:じ zi:じ zu:ず ze:ぜ zo:ぞ da:だ de:で do:ど ba:ば bi:び bu:ぶ be:べ bo:ぼ pa:ぱ pi:ぴ pu:ぷ pe:ぺ po:ぽ
kya:きゃ kyu:きゅ kyo:きょ sha:しゃ shu:しゅ sho:しょ cha:ちゃ chu:ちゅ cho:ちょ nya:にゃ nyu:にゅ nyo:にょ
hya:ひゃ hyu:ひゅ hyo:ひょ mya:みゃ myu:みゅ myo:みょ rya:りゃ ryu:りゅ ryo:りょ gya:ぎゃ gyu:ぎゅ gyo:ぎょ
ja:じゃ ju:じゅ jo:じょ bya:びゃ byu:びゅ byo:びょ pya:ぴゃ pyu:ぴゅ pyo:ぴょ`.split(/\s+/).map((p) => p.split(':')));

// Hepburn romaji → hiragana, or null if the word is not romaji (e.g. English).
function toHiragana(s) {
  let out = '';
  for (let i = 0; i < s.length;) {
    if ((s[i] === s[i + 1] && /[bcdfghjkmprstwz]/.test(s[i])) || s.startsWith('tch', i)) { out += 'っ'; i++; continue; }
    if (s[i] === 'n' && !/[aiueoy]/.test(s[i + 1] || '')) { out += 'ん'; i++; continue; }
    const k = [3, 2, 1].map((n) => s.slice(i, i + n)).find((x) => ROMA[x]);
    if (!k) return null;
    out += ROMA[k];
    i += k.length;
  }
  return out;
}
const toKatakana = (s) => s.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));

async function apiSearch(query) {
  const res = await fetch(`${API}?${new URLSearchParams({ ...searchParams(query), out: 'json' })}`, { headers: { 'User-Agent': UA } });
  const [{ allcount }, ...rows] = await res.json();
  return { allcount, rows };
}

// Search as typed; on no hits, search each piece and rank by pieces matched, then total points.
export async function search(query) {
  const first = await apiSearch(query);
  const tokens = queryTokens(query);
  if (first.rows.length || searchParams(query).ncode || !tokens.length || (tokens.length === 1 && tokens[0] === query.trim())) return { ...first, tokens: null };
  const hits = new Map();
  for (const tok of tokens.slice(0, 4)) {                // at most 5 API calls per search
    for (const r of (await apiSearch(tok)).rows) {
      const h = hits.get(r.ncode) ?? { r, n: 0 };
      h.n++;
      hits.set(r.ncode, h);
    }
  }
  const rows = [...hits.values()].sort((a, b) => b.n - a.n || b.r.global_point - a.r.global_point).slice(0, 20).map((h) => h.r);
  return { allcount: hits.size, rows, tokens: tokens.slice(0, 4) };
}
