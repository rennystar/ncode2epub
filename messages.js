// Screen text (日本語 · English · 한국어). Add every new key in all three.
export const MESSAGES = {
  ja: {
    help: `ncode2epub — 小説家になろう公式「縦書きPDF」→ Kindle用 縦書きEPUB

  ncode2epub                          対話モード：検索 → 作品ページ → PDFを自動検出 → EPUB
  ncode2epub search <検索語|Nコード>    作品を検索（公式 なろう小説API）
  ncode2epub convert <PDF>            受け取ったPDFをEPUBに（PDFと同じフォルダ）
  ncode2epub watch                    フォルダに届く公式PDFを自動で変換

  オプション：--dir <フォルダ>（既定 ~/Downloads）  --lang ja|en|ko`,
    ep: (n) => `${n}話`,
    query: '作品を検索（タイトル・作者・Nコード・URL・ローマ字）',
    searching: '検索中…',
    found: (n, all) => `${all}件中${n}件`,
    none: '作品が見つかりませんでした。',
    netError: '検索できませんでした。ネットワークを確認してください。',
    pick: '作品を選択',
    again: 'もう一度検索',
    quit: '終了',
    split: (w) => `そのままでは見つからず、「${w.join('」「')}」に分けて検索しました`,
    why: `縦書きPDFはご自身で受け取ってください。
小説家になろうの利用規約（第14条23号）は公式API以外での自動アクセスを禁止しているため、
このツールが自動で行うのは、検索と、受け取ったPDFの変換だけです。`,
    noDir: (d) => `フォルダが見つかりません：${d}（--dir で指定してください）`,
    howTo: '縦書きPDFの受け取り方',
    steps: (dir, link, k) => `1. 下のリンクを開きます（${k} を押しながらクリック）。
   ${link}
   ページのいちばん下までスクロールします。
2. 「+注意+」の枠の下、「作者マイページ ｜ 縦書きPDF ｜ 情報提供」の
   真ん中にある「縦書きPDF」を押します。
3. PDFが ${dir} に保存されると、すぐにEPUBに変換します。
   ブラウザがPDFを表示した場合は、その画面の保存ボタンで保存してください。`,
    waiting: (dir) => `${dir} にPDFが届くのを待っています…（Esc で戻る）`,
    received: (f) => `受信：${f}`,
    converting: '変換中',
    done: (out, n) => `完了：${out}（${n}話）`,
    more: '他の作品も変換しますか？',
    yes: 'はい',
    no: 'いいえ',
    bye: 'Send to Kindle で送って読んでください。',
    notOfficial: '公式の「縦書きPDF」ではありません。',
    badPdf: (m) => `PDFを開けません：${m}`,
    failed: (f, m) => `失敗：${f}：${m}`,
    watching: (d) => `監視中：${d}（Ctrl+C で終了）`,
    cancel: 'キャンセルしました',
    error: 'エラーが発生しました',
  },
  en: {
    help: `ncode2epub — Shōsetsuka ni Narō's official 「縦書きPDF」 → vertical EPUB for Kindle

  ncode2epub                          Interactive: search → novel page → auto-detect PDF → EPUB
  ncode2epub search <words|N-code>    Search novels (official Narou Novel API)
  ncode2epub convert <PDF>            Convert a downloaded PDF (EPUB goes next to it)
  ncode2epub watch                    Convert official PDFs as they arrive in a folder

  Options: --dir <folder> (default ~/Downloads)  --lang ja|en|ko`,
    ep: (n) => `${n} ep.`,
    query: 'Search a novel (title, author, N-code, URL or romaji)',
    searching: 'Searching…',
    found: (n, all) => `${n} of ${all}`,
    none: 'No novels found.',
    netError: 'Search failed. Check your network.',
    pick: 'Pick a novel',
    again: 'Search again',
    quit: 'Quit',
    split: (w) => `No exact match, so searched 「${w.join('」「')}」 separately`,
    why: `You download the 縦書きPDF yourself.
Narou's terms (Art. 14-23) forbid automated access other than the official API,
so this tool automates only the search and the conversion of the PDF you download.`,
    noDir: (d) => `Folder not found: ${d} (set one with --dir)`,
    howTo: 'How to get the 縦書きPDF',
    steps: (dir, link, k) => `1. Open the link below (${k}-click).
   ${link}
   Scroll to the very bottom of the page.
2. Below the 「+注意+」 box, in the row 「作者マイページ ｜ 縦書きPDF ｜ 情報提供」,
   click the middle one: 「縦書きPDF」.
3. As soon as the PDF is saved to ${dir}, it is converted to EPUB.
   If the browser shows the PDF instead, save it with the viewer's download button.`,
    waiting: (dir) => `Waiting for the PDF in ${dir}… (Esc to go back)`,
    received: (f) => `Received: ${f}`,
    converting: 'Converting',
    done: (out, n) => `Done: ${out} (${n} episodes)`,
    more: 'Convert another novel?',
    yes: 'Yes',
    no: 'No',
    bye: 'Send it with Send to Kindle and enjoy.',
    notOfficial: 'Not an official 「縦書きPDF」 file.',
    badPdf: (m) => `Cannot open the PDF: ${m}`,
    failed: (f, m) => `Failed: ${f}: ${m}`,
    watching: (d) => `Watching ${d} (Ctrl+C to stop)`,
    cancel: 'Canceled',
    error: 'Something went wrong',
  },
  ko: {
    help: `ncode2epub — 소설가가 되자 공식 「縦書きPDF」 → Kindle용 세로쓰기 EPUB

  ncode2epub                          대화형: 검색 → 작품 페이지 → PDF 자동 감지 → EPUB
  ncode2epub search <검색어|Nコード>    작품 검색 (공식 なろう小説API)
  ncode2epub convert <PDF>            받은 PDF를 EPUB으로 (PDF와 같은 폴더)
  ncode2epub watch                    폴더에 들어오는 공식 PDF를 자동 변환

  옵션: --dir <폴더> (기본 ~/Downloads)  --lang ja|en|ko`,
    ep: (n) => `${n}화`,
    query: '작품 검색 (제목·작가·Nコード·주소·로마자)',
    searching: '검색 중…',
    found: (n, all) => `${all}건 중 ${n}건`,
    none: '찾은 작품이 없습니다.',
    netError: '검색하지 못했습니다. 네트워크를 확인하세요.',
    pick: '작품 선택',
    again: '다시 검색',
    quit: '끝내기',
    split: (w) => `그대로는 없어서 「${w.join('」「')}」로 나눠 찾았습니다`,
    why: `縦書きPDF는 직접 받으셔야 합니다.
소설가가 되자 이용규약(제14조 23호)이 공식 API 밖에서의 자동 접근을 금지해서,
이 도구는 검색과, 받은 PDF의 변환만 자동으로 합니다.`,
    noDir: (d) => `폴더가 없습니다: ${d} (--dir 로 지정하세요)`,
    howTo: '縦書きPDF 받는 법',
    steps: (dir, link, k) => `1. 아래 링크를 엽니다 (${k} 누른 채 클릭).
   ${link}
   페이지를 맨 아래까지 내립니다.
2. 「+注意+」 상자 아래 「作者マイページ ｜ 縦書きPDF ｜ 情報提供」 줄에서
   가운데 「縦書きPDF」를 누릅니다.
3. PDF가 ${dir} 에 저장되면 바로 EPUB으로 바꿉니다.
   브라우저가 PDF를 열어 보여 주면, 그 화면의 저장 버튼으로 저장하세요.`,
    waiting: (dir) => `${dir} 에 PDF가 들어오기를 기다리는 중… (Esc: 돌아가기)`,
    received: (f) => `받음: ${f}`,
    converting: '변환 중',
    done: (out, n) => `완료: ${out} (${n}화)`,
    more: '다른 작품도 변환할까요?',
    yes: '예',
    no: '아니요',
    bye: 'Send to Kindle로 보내서 읽으세요.',
    notOfficial: '공식 「縦書きPDF」가 아닙니다.',
    badPdf: (m) => `PDF를 열 수 없습니다: ${m}`,
    failed: (f, m) => `실패: ${f}: ${m}`,
    watching: (d) => `감시 중: ${d} (Ctrl+C로 끝)`,
    cancel: '취소했습니다',
    error: '오류가 났습니다',
  },
};

// --lang, then LC_ALL / LC_MESSAGES / LANG, then the system locale; ja, en or ko, default en.
export function pickLang(flag) {
  const { LC_ALL, LC_MESSAGES, LANG } = process.env;
  for (const v of [flag, LC_ALL, LC_MESSAGES, LANG, Intl.DateTimeFormat().resolvedOptions().locale]) {
    const m = (v || '').toLowerCase().match(/^(ja|en|ko)/);
    if (m) return m[1];
  }
  return 'en';
}
