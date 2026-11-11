// 웹판 오프라인: 화면 파일을 담아 두고 먼저 쓴다. 새 판이 올라오면 다음에 열 때 바뀐다.
const VERSION = '0.1.0-e17dbb44fc';
const FILES = ["./","./icon.svg?c=1f883d","./ai/helper.ps1","./ai/open.ps1","./ai/pc.ps1","./ai/setup.ps1","./app.js?v=0.1.0-e17dbb44fc","./cards/ai.js?v=0.1.0-e17dbb44fc","./cards/calendar-logic.js?v=0.1.0-e17dbb44fc","./cards/calendar.js?v=0.1.0-e17dbb44fc","./cards/clip.js?v=0.1.0-e17dbb44fc","./cards/dock.js?v=0.1.0-e17dbb44fc","./cards/fold.js?v=0.1.0-e17dbb44fc","./cards/gcal.js?v=0.1.0-e17dbb44fc","./cards/golinks.js?v=0.1.0-e17dbb44fc","./cards/neistt-logic.js?v=0.1.0-e17dbb44fc","./cards/neistt.js?v=0.1.0-e17dbb44fc","./cards/pet-art.js?v=0.1.0-e17dbb44fc","./cards/pet-logic.js?v=0.1.0-e17dbb44fc","./cards/pet.js?v=0.1.0-e17dbb44fc","./cards/pip.js?v=0.1.0-e17dbb44fc","./cards/schooltt.js?v=0.1.0-e17dbb44fc","./cards/start.js?v=0.1.0-e17dbb44fc","./cards/sticky.js?v=0.1.0-e17dbb44fc","./cards/teacher.js?v=0.1.0-e17dbb44fc","./cards/timetable-logic.js?v=0.1.0-e17dbb44fc","./cards/timetable.js?v=0.1.0-e17dbb44fc","./cards/today.js?v=0.1.0-e17dbb44fc","./cards/ttcheck.js?v=0.1.0-e17dbb44fc","./cards/ttnote.js?v=0.1.0-e17dbb44fc","./cards/ui.js?v=0.1.0-e17dbb44fc","./icon-1f883d-192.png","./icon-1f883d-512.png","./icon.svg?v=0.1.0-e17dbb44fc","./local.js?v=0.1.0-e17dbb44fc","./manifest.webmanifest?v=0.1.0-e17dbb44fc","./sql-wasm.wasm?v=1.13.0","./style.css?v=0.1.0-e17dbb44fc"];
// 같은 github.io 주소 아래 범용판·학교 특별판이 서로의 저장분을 지우지 않게 사이트마다 이름을 나눈다
const SITE = 'school-dashboard';
const CACHE = `${SITE}@${VERSION}`;
const mine = (k) => k.startsWith(`${SITE}@`) || (SITE === 'school-dashboard' && /^school-dashboard-\d/.test(k)); // 뒤: 예전 이름

self.addEventListener('install', (e) => {
  // 브라우저 HTTP 기억(Pages 는 10분)을 거치지 않고 새로 받는다
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => mine(k) && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return; // 날씨·급식·구글은 그대로
  // 화면(index)은 새 판을 먼저 보고, 안 되면 담아 둔 것. 나머지 파일은 주소에 판 표시(?v=)가 붙어 있어
  // 새 화면은 새 파일을, 옛 화면은 옛 파일을 받는다 (이 워커의 보관함에서만 찾음).
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.open(CACHE).then((c) => c.match('./'))));
    return;
  }
  e.respondWith(caches.open(CACHE).then((c) => c.match(e.request)).then((hit) => hit || fetch(e.request)));
});
