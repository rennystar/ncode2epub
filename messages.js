// Screen text (日本語 · English · 한국어). Add every new key in all three.
export const MESSAGES = {
  ja: {
    help: `ncode2epub：「小説家になろう」の縦書きPDFをKindle向けEPUBに変換するCLIツール

  ncode2epub                          検索から変換までを対話形式で進めます
  ncode2epub search <検索語|Nコード>    なろう小説APIで作品を検索します
  ncode2epub convert <PDF>            PDFをEPUBに変換します（PDFと同じフォルダに保存）
  ncode2epub watch                    フォルダを監視し、届いた縦書きPDFを変換します

  オプション：--dir <フォルダ>（既定：~/Downloads）  --lang ja|en|ko`,
    ep: (n) => `${n}話`,
    query: '検索ワードを入力（タイトル・作者名・Nコード・URL・ローマ字）',
    searching: '検索中',
    found: (n, all) => `${all}件中${n}件を表示`,
    none: '該当する作品が見つかりませんでした。',
    netError: '検索できませんでした。ネットワーク接続を確認してください。',
    pick: '作品を選択してください',
    again: '検索し直す',
    quit: '終了',
    split: (w) => `キーワードを分けて検索しました：${w.join('、')}`,
    stepSearch: '1/3 作品検索',
    noDir: (d) => `フォルダが見つかりません：${d}（--dirで指定してください）`,
    howTo: '2/3 縦書きPDFのダウンロード',
    steps: (dir, link, k) => `サイトの規約により、縦書きPDFは手動でダウンロードする必要があります。

1. 下のリンクを開きます（${k}キーを押しながらクリック）。
   ${link}
   ページのいちばん下までスクロールします。
2. 「+注意+」の枠のすぐ下にある「縦書きPDF」をクリックします。
3. PDFが ${dir} に保存されると、自動でEPUBに変換されます。
   ブラウザでPDFが開いた場合は、保存ボタンからダウンロードしてください。
Escキーで検索に戻ります。`,
    waiting: (dir) => `${dir} にPDFが届くのを待っています`,
    received: (f) => `PDFを検出しました：${f}`,
    stepConvert: '3/3 EPUBに変換',
    converting: '変換中',
    reading: (i, n) => `ページを読み込み中 ${i}/${n}`,
    done: (out, n) => `変換が完了しました：${out}（${n}話）`,
    more: '他の作品も変換しますか？',
    yes: 'はい',
    no: 'いいえ',
    bye: '作成したEPUBは、Send to KindleでKindleに送信できます。',
    notOfficial: '小説家になろうの縦書きPDFではありません。',
    badPdf: (m) => `PDFを開けませんでした：${m}`,
    failed: (f, m) => `変換できませんでした：${f}（${m}）`,
    watching: (d) => `フォルダを監視しています：${d}（Ctrl+Cで終了）`,
    cancel: 'キャンセルしました',
    error: 'エラーが発生しました',
  },
  en: {
    help: `ncode2epub: Read 小説家になろう (syosetu.com) web novels on Kindle, in vertical text with furigana.

  ncode2epub                          Interactive: search → novel page → auto-detect PDF → EPUB
  ncode2epub search <words|N-code>    Search novels (official なろう小説API)
  ncode2epub convert <PDF>            Convert a downloaded PDF (EPUB goes next to it)
  ncode2epub watch                    Convert official PDFs as they arrive in a folder

  Options: --dir <folder> (default ~/Downloads)  --lang ja|en|ko`,
    ep: (n) => `${n} ep.`,
    query: 'Type a title, author, N-code, URL or romaji',
    searching: 'Searching',
    found: (n, all) => `${n} of ${all}`,
    none: 'No novels found.',
    netError: 'Search failed. Check your network.',
    pick: 'Pick a novel',
    again: 'Search again',
    quit: 'Quit',
    split: (w) => `No exact match, so searched 「${w.join('」「')}」 separately`,
    stepSearch: '1/3 Search',
    noDir: (d) => `Folder not found: ${d} (set one with --dir)`,
    howTo: '2/3 Download the 縦書きPDF',
    steps: (dir, link, k) => `Under the site's terms, the 縦書きPDF has to be downloaded by hand.

1. Open the link below (${k}-click).
   ${link}
   Scroll to the very bottom of the page.
2. Click 「縦書きPDF」 just below the 「+注意+」 box.
3. When the PDF is saved to ${dir}, it is converted right away.
   If the browser shows the PDF instead, save it with the viewer's download button.
Press Esc to go back to search.`,
    waiting: (dir) => `Waiting for the PDF in ${dir}`,
    received: (f) => `Received: ${f}`,
    stepConvert: '3/3 Convert to EPUB',
    converting: 'Converting',
    reading: (i, n) => `Reading page ${i} of ${n}`,
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
    help: `ncode2epub: 小説家になろう의 縦書きPDF를 Kindle용 세로쓰기 EPUB으로 변환하는 도구

  ncode2epub                          검색부터 변환까지 단계별로 안내합니다
  ncode2epub search <검색어|N코드>      なろう小説API로 작품을 검색합니다
  ncode2epub convert <PDF>            PDF를 EPUB으로 변환합니다 (PDF와 같은 폴더에 저장)
  ncode2epub watch                    폴더를 감시하다가 縦書きPDF가 들어오면 변환합니다

  옵션: --dir <폴더> (기본값: ~/Downloads)  --lang ja|en|ko`,
    ep: (n) => `${n}화`,
    query: '검색어를 입력하세요 (제목, 작가명, N코드, URL, 로마자)',
    searching: '검색 중',
    found: (n, all) => `${all}개 중 ${n}개 표시`,
    none: '검색 결과가 없습니다.',
    netError: '검색에 실패했습니다. 인터넷 연결을 확인해 주세요.',
    pick: '작품을 선택하세요',
    again: '다시 검색',
    quit: '종료',
    split: (w) => `검색어를 나누어 다시 검색했습니다: ${w.join(', ')}`,
    stepSearch: '1/3 작품 검색',
    noDir: (d) => `폴더를 찾을 수 없습니다: ${d} (--dir로 지정해 주세요)`,
    howTo: '2/3 縦書きPDF 다운로드',
    steps: (dir, link, k) => `縦書きPDF는 사이트 규약에 따라 직접 다운로드해야 합니다.

1. 아래 링크를 엽니다 (${k} 키를 누른 채 클릭).
   ${link}
   페이지 맨 아래로 스크롤합니다.
2. 「+注意+」 상자 바로 아래의 「縦書きPDF」를 클릭합니다.
3. PDF가 ${dir}에 저장되면 자동으로 EPUB으로 변환됩니다.
   브라우저에서 PDF가 열리면 저장 버튼을 눌러 다운로드하세요.
Esc 키를 누르면 검색으로 돌아갑니다.`,
    waiting: (dir) => `${dir}에 PDF가 들어오기를 기다리는 중`,
    received: (f) => `PDF를 감지했습니다: ${f}`,
    stepConvert: '3/3 EPUB 변환',
    converting: '변환 중',
    reading: (i, n) => `페이지 읽는 중 ${i}/${n}`,
    done: (out, n) => `변환 완료: ${out} (${n}화)`,
    more: '다른 작품도 변환할까요?',
    yes: '예',
    no: '아니요',
    bye: '만든 EPUB은 Send to Kindle로 Kindle에 보낼 수 있습니다.',
    notOfficial: '小説家になろう의 縦書きPDF가 아닙니다.',
    badPdf: (m) => `PDF를 열 수 없습니다: ${m}`,
    failed: (f, m) => `변환 실패: ${f} (${m})`,
    watching: (d) => `폴더를 감시하는 중: ${d} (Ctrl+C로 종료)`,
    cancel: '취소되었습니다',
    error: '오류가 발생했습니다',
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
