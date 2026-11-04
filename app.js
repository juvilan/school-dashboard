// 대시보드 화면. 서버와 실시간 연결(SSE)을 열어 두고, 받은 내용으로 다시 그린다.
// 연결할 때마다 전체 스냅샷을 받으므로, 끊겼다 다시 붙어도 빠지는 변경이 없다.

const state = { version: -1, data: {} };
const $ = (id) => document.getElementById(id);

// ---- 서버 요청 ----
// 배포판: 실행기가 창을 /#k=열쇠 로 연다. 열쇠는 이 창의 sessionStorage(포트마다 따로)에만 두고 머리글로 보낸다.
// 쿠키는 쓰지 않는다: 쿠키는 포트를 가리지 않아 같은 PC 의 다른 포트 프로그램에도 따라간다.
const DASH_KEY = (() => {
  try {
    const m = location.hash.match(/^#k=([0-9a-f]{32,128})$/);
    if (m) {
      sessionStorage.setItem('dashKey', m[1]);
      history.replaceState(null, '', '/');
    }
    return sessionStorage.getItem('dashKey') || '';
  } catch {
    return '';
  }
})();
const KEY_H = DASH_KEY ? { 'X-Dash-Key': DASH_KEY } : {};

async function api(method, url, body, opts = {}) {
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: { 'X-Dash': '1', ...KEY_H, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      keepalive: Boolean(opts.keepalive), // 페이지를 닫아도 끝까지 보내기 (64KB 이하)
    });
  } catch {
    throw new Error('서버에 연결할 수 없어요.');
  }
  if (res.status === 401) {
    goLogin();
    throw new Error('로그인이 필요해요.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || '요청이 실패했어요.');
    err.status = res.status;
    err.current = data.current; // 409(충돌)일 때 서버의 최신 내용
    throw err;
  }
  return data;
}

function goLogin() {
  stopEvents();
  // 로그아웃되면 화면에 남은 내용을 지운다 (학교 PC에 남지 않게).
  document.body.textContent = '';
  if (document.body.dataset.edition === 'teacher') {
    // 배포판은 로그인 화면이 없다 → 열쇠가 바뀐 것(프로그램을 다시 켬). 다시 실행하도록 안내만
    const p = document.createElement('p');
    p.className = 'quit-msg';
    p.textContent = '프로그램을 다시 켰거나 꺼졌어요. 바탕화면의 학교 대시보드를 다시 실행해 주세요.';
    document.body.append(p);
    return;
  }
  location.replace('/login');
}

// ---- 실시간 연결 ----
let es = null;
let retryTimer = null;

function setConn(s, text) {
  const el = $('conn');
  el.dataset.state = s;
  el.textContent = text;
}

function startEvents() {
  stopEvents();
  setConn('connecting', '연결 중…');
  es = new EventSource(DASH_KEY ? `/api/events?k=${DASH_KEY}` : '/api/events'); // EventSource 는 머리글을 못 보낸다

  es.addEventListener('snapshot', (e) => {
    const snap = JSON.parse(e.data);
    state.version = snap.version;
    state.data = snap.data;
    // 서버 시계와 이 기기 시계의 차이 (몇 초 전 값인지 계산할 때 씀)
    state.clockOffset = Date.now() - snap.serverTime;
    setConn('live', '실시간');
    renderAll();
  });

  es.addEventListener('change', (e) => {
    const ev = JSON.parse(e.data);
    if (ev.version <= state.version) return; // 이미 반영한 것
    if (ev.version !== state.version + 1) {
      // 중간이 빠졌다 → 새로 연결해서 스냅샷을 다시 받는다.
      startEvents();
      return;
    }
    state.version = ev.version;
    if (!ev.type) return; // 이 화면과 상관없는 변경 (버전만 받음)
    state.data[ev.type] = ev.data;
    render(ev.type);
  });

  // 버전 없는 그때그때 값(서버 상태 등)
  es.addEventListener('live', (e) => {
    const ev = JSON.parse(e.data);
    state.data[ev.type] = ev.data;
    render(ev.type);
  });

  es.addEventListener('logout', goLogin);

  es.onerror = () => {
    // 서버가 꺼졌거나 로그인이 끝났을 수 있다. 브라우저가 알아서 다시 붙지 못하는 경우도 있어 직접 확인한다.
    setConn('down', '연결 끊김 · 다시 연결 중');
    if (es.readyState === EventSource.CLOSED) scheduleRetry();
  };
}

function stopEvents() {
  clearTimeout(retryTimer);
  if (es) {
    es.close();
    es = null;
  }
}

let retryFails = 0;
function scheduleRetry() {
  clearTimeout(retryTimer);
  retryTimer = setTimeout(async () => {
    try {
      const res = await fetch('/api/me', { cache: 'no-store', headers: KEY_H });
      if (res.status === 401) return goLogin();
      retryFails = 0;
      startEvents();
    } catch {
      // 배포판: 서버(프로그램)가 꺼졌을 수 있다. 다시 켜면 같은 주소로 돌아와 저절로 이어진다.
      if (EDITION === 'teacher' && ++retryFails >= 4) setConn('down', '프로그램이 꺼졌어요 · 학교 대시보드를 다시 실행해 주세요');
      scheduleRetry(); // 아직 서버에 닿지 않음
    }
  }, 5000);
}

// 아이폰 등은 화면이 뒤로 가면 연결이 끊긴다. 다시 보일 때 새로 연결한다.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && (!es || es.readyState !== EventSource.OPEN)) startEvents();
});

// ---- 그리기 ----
// 카드 파일(public/cards/*.js)이 Dash.renderers 에 자기 그리기 함수를 넣는다.
const renderers = {
  devices: renderDevices,
};
// 지금 서울 날짜·시각 (서버 시계 기준). calendar-logic.js 가 먼저 읽혀 있어야 한다.
const seoul = () => window.CalendarLogic.seoulParts(Date.now() - (state.clockOffset || 0));
window.Dash = { state, api, renderers, listen, $, seoul, edition: document.body.dataset.edition || 'personal' };

// 한 종류에 여러 카드가 반응할 수 있게 (예: 할 일 → 할 일 카드 + 달력의 마감 표시)
const listeners = {};
function listen(type, fn) {
  (listeners[type] ||= []).push(fn);
}

function render(type) {
  renderers[type]?.();
  for (const fn of listeners[type] || []) fn();
}

function renderAll() {
  for (const type of new Set([...Object.keys(renderers), ...Object.keys(listeners)])) render(type);
}

function fmtTime(ms) {
  if (!ms) return '아직 안 씀';
  return new Date(ms).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

let scopeNames = {};

function renderDevices() {
  const list = $('devices');
  if (!list) return; // 배포판에는 기기 관리가 없다
  list.textContent = '';
  const devices = state.data.devices || [];
  if (devices.length === 0) {
    const li = document.createElement('li');
    li.className = 'muted';
    li.textContent = '아직 만든 열쇠가 없어요.';
    list.append(li);
    return;
  }
  for (const d of devices) {
    const li = document.createElement('li');
    const info = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = d.name;
    const meta = document.createElement('span');
    meta.className = 'muted';
    meta.textContent = ` · ${d.scopes.map((s) => scopeNames[s] || s).join(', ')} · 마지막 사용 ${fmtTime(d.last_used_at)}`;
    info.append(name, meta);

    // 실수로 누르지 않게 두 번 눌러야 꺼진다.
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'danger';
    btn.textContent = '끄기';
    btn.addEventListener('click', async () => {
      if (btn.dataset.armed !== '1') {
        btn.dataset.armed = '1';
        btn.textContent = '정말 끄기';
        setTimeout(() => { btn.dataset.armed = ''; btn.textContent = '끄기'; }, 4000);
        return;
      }
      btn.disabled = true;
      try {
        await api('DELETE', `/api/devices/${d.id}`);
      } catch (err) {
        $('device-msg').textContent = err.message;
        btn.disabled = false;
      }
    });
    li.append(info, btn);
    list.append(li);
  }
}

// ---- 기기 관리 창 ----
async function openSettings() {
  try {
    const { scopes } = await api('GET', '/api/devices');
    scopeNames = scopes;
    const box = $('scopes');
    box.querySelectorAll('label').forEach((l) => l.remove());
    for (const [key, label] of Object.entries(scopes)) {
      const l = document.createElement('label');
      l.className = 'check';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = key;
      cb.checked = true;
      l.append(cb, ` ${label}`);
      box.append(l);
    }
    renderDevices();
  } catch (err) {
    $('device-msg').textContent = err.message;
  }
  $('new-token').hidden = true;
  $('settings').showModal();
}

// 배포판(data-edition="teacher")에는 기기 관리·로그아웃이 없다
const EDITION = document.body.dataset.edition || 'personal';
if ($('open-settings')) {
$('open-settings').addEventListener('click', openSettings);
$('close-settings').addEventListener('click', () => $('settings').close());
$('settings').addEventListener('close', () => {
  // 창을 닫으면 한 번만 보여 준 열쇠도 화면에서 지운다.
  $('new-token-value').textContent = '';
  $('new-token').hidden = true;
});

$('new-device').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('device-msg').textContent = '';
  const scopes = [...$('scopes').querySelectorAll('input:checked')].map((i) => i.value);
  try {
    const t = await api('POST', '/api/devices', { name: $('device-name').value, scopes });
    $('device-name').value = '';
    $('new-token-value').textContent = t.token;
    $('new-token').hidden = false;
  } catch (err) {
    $('device-msg').textContent = err.message;
  }
});

$('copy-token').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('new-token-value').textContent);
    $('copy-token').textContent = '복사했어요';
  } catch {
    $('copy-token').textContent = '직접 선택해서 복사해 주세요';
  }
});

// 로그아웃은 서버가 확인해 줘야 끝난다. 실패하면 쿠키·세션이 남으니 화면을 그대로 두고 알린다.
$('logout').addEventListener('click', async () => {
  const btn = $('logout');
  btn.disabled = true;
  try {
    await api('POST', '/api/logout');
    goLogin();
  } catch {
    btn.textContent = '로그아웃 실패 · 다시 시도';
    btn.classList.add('danger');
    btn.disabled = false;
  }
});
}

// ---- 시작 ----
// 카드 파일들이 모두 읽힌 뒤 연결한다.
window.addEventListener('DOMContentLoaded', startEvents);
// 배포판은 이 PC 안의 서버라 오프라인 화면이 필요 없다
if (EDITION !== 'teacher' && 'serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
