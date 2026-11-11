// 키우기 동물: 화면 구석에 앉아 있다가, 누르면 밥·간식·쓰다듬기. 할 일을 끝내면 간식이 생기고 기뻐한다.
// 상태는 이 브라우저에만 저장한다 (기기마다 따로, 같은 브라우저의 탭끼리는 나눠 씀). 끌어서 다른 구석으로 옮기고, 숨길 수 있다.
// 창을 안 보고 있거나 숨겼을 때는 움직임을 멈춘다.
(() => {
  const A = window.PetArt;
  const L = window.PetLogic;
  const D = window.Dash;
  if (!A || !L || !D) return;
  const { state, listen, seoul } = D;
  const ls = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); return true; } catch { return false; } },
  };
  const readJson = (k) => { try { return JSON.parse(ls.get(k) || 'null'); } catch { return null; } };
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };

  const CORNERS = ['br', 'bl', 'tr', 'tl'];
  const F = Object.fromEntries(A.frames.map((n, i) => [n, i]));
  const rm = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let reduced = Boolean(rm?.matches);
  rm?.addEventListener?.('change', () => { reduced = rm.matches; stopWalk(); });

  // 저장분이 진짜: 바꾸기 직전에 다시 읽어서(다른 탭이 바꿨을 수 있음) 바꾸고 바로 저장한다
  // 저장이 막힌 브라우저(사이트 데이터 차단·꽉 참)에서는 이 창의 값으로만 이어간다
  let stored = true;
  let pet = null;
  const load = () => {
    const now = Date.now();
    const raw = stored ? readJson('dash-pet') : null;
    return L.tick(L.normalize(raw ?? pet, now), now);
  };
  pet = load();
  const save = () => { if (!ls.set('dash-pet', JSON.stringify(pet))) stored = false; };
  const update = (fn) => { pet = load(); const r = fn(pet); pet = r.s; save(); return r; };
  const savedUi = readJson('dash-pet-ui') || {};
  const ui = {
    corner: CORNERS.includes(savedUi.corner) ? savedUi.corner : 'br',
    size: savedUi.size === 'small' ? 'small' : 'big',
    hidden: savedUi.hidden === true,
    marks: savedUi.marks !== false, // 시간표 지금 칸·달력 오늘 칸에도 올라가기
    talk: savedUi.talk !== false, // 수업·일정·급식·마감·퇴근을 말풍선으로 알려 주기
  };
  const saveUi = () => ls.set('dash-pet-ui', JSON.stringify(ui));
  const snackItem = () => (A.pets[pet.kind]?.kind === 'dog' ? 'bone' : 'fish');
  const petName = () => pet.name || A.pets[pet.kind]?.name || '친구';

  // ---- 화면: 그림(img)은 누를 수 없고, 몸통 크기의 버튼(hit)만 누를 수 있다 (투명한 곳 아래 칸은 그대로 눌림) ----
  const home = el('div', 'pet-home');
  home.id = 'pet';
  const body = el('div', 'pet-body');
  const img = el('div', 'pet-img');
  const hit = el('button', 'pet-hit');
  hit.type = 'button';
  hit.setAttribute('aria-controls', 'pet-panel');
  hit.setAttribute('aria-expanded', 'false');
  const bubble = el('div', 'pet-bubble');
  bubble.hidden = true;
  bubble.setAttribute('aria-live', 'polite');
  const zz = el('div', 'pet-z', 'z');
  const fx = el('div', 'pet-fx');
  fx.hidden = true;
  body.append(bubble, zz, fx, img, hit);
  const panel = el('div', 'pet-panel');
  panel.id = 'pet-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', '동물 돌보기');
  home.append(panel, body);
  const paw = el('button', 'pet-paw', '🐾');
  paw.type = 'button';
  paw.title = '동물 다시 보이기';
  paw.setAttribute('aria-label', '동물 다시 보이기');
  document.body.append(home, paw);

  // 칸 위에 올라가는 작은 동물 (64px, 누를 수 없음). 칸 안은 넘치면 잘려서 화면 위 따로 띄우고 칸 위치를 따라간다
  // 시간표·달력 칸: 오른쪽 위 모서리에 얼굴만 걸치고 두 앞발로 테두리를 잡은 모양 (칸을 덜 가리게)
  const mark = (label, hug) => {
    const m = el('div', hug ? `pet-mark pet-hug ${hug}` : 'pet-mark');
    m.hidden = true;
    m.setAttribute('aria-hidden', 'true');
    m.title = label;
    const i = el('div', hug ? 'pet-face' : 'pet-img');
    if (hug) m.append(el('div', 'pet-paw-a'), i, el('div', 'pet-paw-b')); else m.append(i);
    m.addEventListener('animationend', () => m.classList.remove('jump'));
    document.body.append(m);
    return { m, i, hug };
  };
  // 달력: 학교용(웹판)만 오늘 칸 안 오른쪽 아래에 동물이 앉아 있음. 개인판은 시간표에만
  const marks = { tt: mark('지금 수업', 'tt') };
  if (D.edition === 'teacher') marks.cal = mark('오늘', null);
  const FF = Object.fromEntries((A.faceFrames || []).map((n, i) => [n, i]));
  const FACE_OF = { blink: 'blink', happy: 'happy', eat1: 'happy', eat2: 'happy', wave0: 'happy', wave1: 'happy', worried: 'worried', sleep: 'sleep', yawn: 'sleep' };

  const itemStyle = (e, name, scale) => {
    const i = Math.max(0, A.items.indexOf(name));
    e.style.backgroundImage = `url(${A.itemsSrc})`;
    e.style.backgroundSize = `${16 * scale * A.items.length}px ${16 * scale}px`;
    e.style.backgroundPosition = `${-16 * scale * i}px 0`;
  };

  function place() {
    for (const c of CORNERS) { home.classList.toggle(c, ui.corner === c); paw.classList.toggle(c, ui.corner === c); }
    home.classList.toggle('small', ui.size === 'small');
    home.hidden = ui.hidden;
    paw.hidden = !ui.hidden;
    img.style.backgroundImage = `url(${A.pets[pet.kind].src})`;
    document.documentElement.style.setProperty('--nf', A.frames.length);
    // 아래쪽 구석에 있으면 그쪽 기둥 아래를 동물 크기만큼 비워 둔다 (AI 대화 입력칸 등을 가리지 않게)
    const room = ui.hidden || !/^b/.test(ui.corner) ? '' : ui.corner === 'br' ? 'r' : 'l';
    document.body.classList.toggle('pet-room-r', room === 'r');
    document.body.classList.toggle('pet-room-l', room === 'l');
    document.documentElement.style.setProperty('--pet-room', `${ui.size === 'small' ? 64 : 96}px`);
    for (const k in marks) {
      const { m, i, hug } = marks[k];
      i.style.backgroundImage = hug ? `url(${A.pets[pet.kind].face})` : img.style.backgroundImage;
      if (hug) for (const pw of m.querySelectorAll('.pet-paw-a, .pet-paw-b')) pw.style.backgroundImage = `url(${A.pets[pet.kind].paw})`;
    }
    pipPaint();
    spot();
    hit.setAttribute('aria-label', `${petName()} (누르면 돌보기, 끌면 다른 구석으로)`);
  }
  let shown = -1;
  function show(name) {
    const i = F[name] ?? 0;
    if (i === shown) return;
    shown = i;
    img.style.setProperty('--f', i);
    // 칸 위 동물은 걷기·밥 먹기 대신 가만히·기쁨
    const mi = F[{ side: 'idle', walk0: 'idle', walk1: 'idle', walk2: 'idle', walk3: 'idle', eat1: 'happy', eat2: 'happy', wave0: 'happy', wave1: 'happy' }[name] || name] ?? 0;
    for (const k in marks) marks[k].i.style.setProperty('--f', marks[k].hug ? (FF[FACE_OF[name] || 'idle'] ?? 0) : mi);
    if (pip) pip.img.style.setProperty('--f', mi); // 작은 창에선 걷지 않고 제자리
  }

  // 칸 찾기: 달력은 오늘 칸, 시간표는 이번 주를 보고 있을 때 지금 수업(쉬는 시간이면 다음 수업) 칸
  // 몇 교시 칸인지는 1분마다·시간표가 바뀔 때만 정하고, 스크롤·크기 바뀜에는 위치만 다시 잰다
  let ttSpot = null; // { wd, p }
  function retarget() {
    const st = window.Dash.ttNow?.()?.st;
    const p = st?.kind === 'class' ? st.at?.period : ['before', 'break', 'lunch'].includes(st?.kind) ? st.next?.period : null;
    ttSpot = p ? { wd: seoul().weekday, p } : null;
    spot();
  }
  function targetOf(k) {
    if (k === 'cal') return document.querySelector('#cal-grid .cal-cell.today');
    const grid = document.getElementById('tt-grid');
    if (!ttSpot || !grid?.querySelector('.tt-day.today')) return null;
    return grid.querySelector(`.tt-cell[data-wd="${ttSpot.wd}"][data-p="${ttSpot.p}"]`);
  }
  // 칸의 윗변이 보이는지: 카드와 (주간 달력처럼) 따로 스크롤되는 칸 묶음 안, 위쪽 고정 막대 아래
  const inside = (r, box) => r.top >= box.top - 2 && r.top <= box.bottom - 8 && r.left + r.width / 2 >= box.left && r.left + r.width / 2 <= box.right;
  const calSize = (r) => (r.width >= 150 && r.height >= 150 ? 96 : r.width >= 100 && r.height >= 100 ? 64 : 48);
  function seen(cell, r, above = 46) { // above: 칸 윗변 위로 튀어나온 높이
    if (!r || r.width <= 0 || r.height <= 0) return false;
    if (!inside(r, { top: 0, bottom: window.innerHeight, left: 0, right: window.innerWidth })) return false;
    for (const box of [cell.closest('.cal-grid'), cell.closest('.card')]) if (box && !inside(r, box.getBoundingClientRect())) return false;
    const bar = document.querySelector('.top');
    if (bar && /sticky|fixed/.test(getComputedStyle(bar).position) && r.top - above < bar.getBoundingClientRect().bottom) return false;
    return true;
  }
  // 칸 윗변에 걸터앉게: 아래쪽 18px 만 칸에 들어감. 칸이 안 보이면(접힘·스크롤 밖) 숨김
  function spotNow() {
    spotQueued = false;
    const on = ui.marks && !ui.hidden;
    for (const k in marks) {
      const { m } = marks[k];
      const cell = on ? targetOf(k) : null;
      const r = cell?.getBoundingClientRect();
      const size = r ? calSize(r) : 48;
      const ok = cell ? (k === 'cal' && r ? seen(cell, { top: r.bottom - size - 3, left: r.left, width: r.width, height: r.height }, 0) : seen(cell, r)) : false;
      m.hidden = !ok;
      if (!ok) continue;
      if (k === 'tt') { // 오른쪽 위 모서리에 얼굴, 앞발은 윗변과 오른쪽 변에
        m.style.left = `${Math.round(r.right - 34)}px`;
        m.style.top = `${Math.round(r.top - 20)}px`;
        continue;
      }
      // 달력: 칸 안 오른쪽 아래에 앉음. 칸이 크면 크게 (96칸 그림의 1/2·2/3·1배)
      m.style.setProperty('--ps', `${size}px`);
      m.style.width = m.style.height = `${size}px`;
      m.classList.toggle('soft', size === 64);
      m.style.left = `${Math.round(r.right - size - 4)}px`;
      m.style.top = `${Math.round(r.bottom - size - 3)}px`;
    }
  }
  let spotQueued = false;
  function spot() {
    if (spotQueued) return;
    spotQueued = true;
    requestAnimationFrame(spotNow);
  }
  window.addEventListener('resize', spot);
  document.addEventListener('scroll', spot, { capture: true, passive: true });
  const watch = new MutationObserver(retarget); // 교시가 바뀌거나 다시 그리면 칸부터 다시 정함
  for (const id of ['tt-grid', 'cal-grid']) {
    const g = document.getElementById(id);
    if (g) watch.observe(g, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }
  for (const id of ['card-tt', 'card-cal']) { // 칸 접기·펴기
    const c = document.getElementById(id);
    if (c) watch.observe(c, { attributes: true, attributeFilter: ['class'] });
  }
  // 다른 카드가 늘거나 줄어 칸이 밀릴 때 (급식·오늘 카드가 늦게 채워짐, 접기 등)
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(spot);
    for (const e of [document.body, document.querySelector('main.layout'), document.getElementById('card-tt'), document.getElementById('card-cal'), document.getElementById('tt-grid'), document.getElementById('cal-grid')]) if (e) ro.observe(e);
  }

  let sayTimer = 0;
  function say(text, ms = 3000) {
    for (const b of pip ? [bubble, pip.bubble] : [bubble]) { b.textContent = text; b.hidden = !text; }
    (pip?.w || window).clearTimeout?.(sayTimer);
    if (text) sayTimer = (pip?.w || window).setTimeout(() => { bubble.hidden = true; if (pip) pip.bubble.hidden = true; }, ms); // 큰 창을 내려 두면 그 창 시계는 느려짐
  }
  let fxTimer = 0;
  function float(item) {
    if (reduced) return;
    itemStyle(fx, item, 2);
    fx.hidden = false;
    fx.classList.remove('go');
    void fx.offsetWidth;
    fx.classList.add('go');
    clearTimeout(fxTimer);
    fxTimer = setTimeout(() => { fx.hidden = true; }, 1300);
  }

  // ---- 움직임 ----
  // 평소 모습(잠·걱정·보통)은 1분마다와 상태가 바뀔 때만 다시 정한다 (프레임마다 시계를 읽지 않음)
  let mood = 'idle';
  function relook() {
    mood = L.look(pet, seoul().minutes);
    home.classList.toggle('sleeping', mood === 'sleep' && !act);
  }
  let act = null; // { kind: 'eat' | 'happy' | 'worried' | 'wave' | 'yawn', until }
  let n = 0;
  // 걷기: 일어나 옆으로 돌아(side) 걷다가(walk0~3) 멈추면 다시 앞을 보고 앉는다. 그림은 오른쪽을 봐서 왼쪽으로 갈 땐 뒤집음
  let wander = 0;
  let wanderTo = 0;
  let walkN = 0;
  let settle = false;
  function stopWalk() { if (wanderTo !== wander) settle = true; wanderTo = wander; }
  function frame() {
    n++;
    if (act && Date.now() > act.until) { act = null; home.classList.toggle('sleeping', mood === 'sleep'); }
    if (act || mood === 'sleep') body.classList.remove('flip'); // 앞모습 그림은 뒤집지 않음
    if (act?.kind === 'eat') return show(reduced || n % 4 < 2 ? 'eat1' : 'eat2');
    if (act?.kind === 'happy') return show('happy');
    if (act?.kind === 'worried') return show('worried');
    if (act?.kind === 'wave') return show(reduced || n % 6 < 3 ? 'wave0' : 'wave1'); // 손 흔들기
    if (act?.kind === 'yawn') return show('yawn');
    if (mood === 'sleep') return show('sleep');
    if (wander !== wanderTo) {
      body.classList.toggle('flip', wanderTo < wander);
      if (walkN++ === 0) return show('side'); // 일어나기
      const step = ui.size === 'small' ? 2 : 3;
      wander += Math.sign(wanderTo - wander) * Math.min(step, Math.abs(wanderTo - wander));
      body.style.translate = wander ? `${wander}px 0` : '';
      if (wander === wanderTo) settle = true;
      return show(`walk${walkN % 4}`);
    }
    walkN = 0;
    if (settle) { settle = false; return show('side'); } // 멈춰 서기 → 다음 프레임에 앉음
    body.classList.remove('flip');
    if (mood === 'worried') return show(!reduced && n % 30 === 0 ? 'blink' : 'worried');
    if (reduced) return show('idle'); // 움직임 줄이기: 가만히
    // 구석 근처를 아무렇게나 왔다 갔다 (20~30초에 한 번쯤, 구석에서 최대 화면 폭의 1/4·300px)
    if (panel.hidden && !drag && !document.hidden && Math.random() < 1 / 120) {
      const max = Math.min(300, window.innerWidth / 4);
      const dir = ui.corner.endsWith('r') ? -1 : 1;
      let to = Math.round((Math.random() < 0.25 ? 0 : Math.random() * max) * dir);
      if (Math.abs(to - wander) < 24) to = Math.round(Math.random() < 0.5 ? 0 : max * dir * 0.6); // 너무 가까우면 다른 곳
      wanderTo = to;
    }
    if (panel.hidden && !drag && Math.random() < 1 / 900) { act = { kind: 'yawn', until: Date.now() + 1400 }; return show('yawn'); } // 가끔 하품
    const c = n % 60;
    if (c >= 30 && c < 38) return show(c % 2 ? 'wag' : 'idle');
    return show(n % 25 === 0 ? 'blink' : 'idle');
  }
  // 움직임 시계: 창이 보일 때만. 큰 창을 내려 두고 작은 창만 떠 있으면 작은 창의 시계로 (가려진 창의 시계는 느려짐)
  let timer = 0;
  let timerWin = null;
  function run() {
    const want = ui.hidden ? null : pip ? pip.w : document.hidden ? null : window;
    if (timer && timerWin !== want) { try { timerWin.clearInterval(timer); } catch { /* 닫힌 창 */ } timer = 0; timerWin = null; }
    if (want && !timer) { timer = want.setInterval(frame, 200); timerWin = want; }
  }

  // ---- 작은 창(pip.js)에도 오른쪽 아래에 앉아 있기. 누르면 쓰다듬기, 말풍선도 같이 ----
  let pip = null; // { w, box, img, bubble }
  function pipPaint() {
    if (!pip) return;
    pip.img.style.backgroundImage = `url(${A.pets[pet.kind].src})`;
    pip.box.hidden = ui.hidden;
    pip.box.title = `${petName()} (누르면 쓰다듬기)`;
    shown = -1;
  }
  window.addEventListener('dash-pip', (e) => {
    const w = e.detail;
    pip = null;
    if (w) {
      const doc = w.document;
      const box = doc.createElement('div');
      box.className = 'pet-pip';
      const pimg = doc.createElement('div');
      pimg.className = 'pet-img';
      box.append(pimg);
      const pb = doc.createElement('div');
      pb.className = 'pet-bubble pet-pip-bubble';
      pb.hidden = true;
      pb.setAttribute('aria-live', 'polite');
      doc.body.append(pb, box);
      doc.documentElement.style.setProperty('--nf', A.frames.length);
      box.addEventListener('click', () => doAct((s) => L.pat(s, Date.now()), 'happy', 1200, null));
      pip = { w, box, img: pimg, bubble: pb };
      w.setInterval(() => { if (document.hidden) talkCheck(); }, 30 * 1000); // 큰 창을 내려 둔 동안 알려 주기
      pipPaint();
    }
    run();
  });

  function react(kind, ms) {
    act = { kind, until: Date.now() + ms };
    home.classList.remove('sleeping');
    stopWalk();
    shown = -1;
    frame();
    if (kind === 'happy' && !reduced) {
      body.classList.remove('jump');
      void body.offsetWidth;
      body.classList.add('jump');
      for (const k in marks) { const { m } = marks[k]; m.classList.remove('jump'); void m.offsetWidth; m.classList.add('jump'); }
    }
  }
  body.addEventListener('animationend', () => body.classList.remove('jump'));

  // ---- 돌보기 창 ----
  function todayLeft() {
    const today = seoul().ymd;
    return (state.data.todos || []).filter((t) => !t.done && t.due && t.due <= today).length;
  }
  function bar(label, v, kind) {
    const r = el('div', 'pet-stat');
    r.append(el('span', 'pet-stat-l', label));
    const track = el('span', 'pet-bar');
    const fill = el('span', `pet-fill${v < 25 ? ' low' : ''}`);
    fill.style.width = `${Math.round(v)}%`;
    track.append(fill);
    r.append(track, el('span', 'pet-stat-w muted small', L.words(v, kind)));
    return r;
  }
  function button(cls, text, key, fn, item) {
    const b = el('button', cls);
    b.type = 'button';
    b.dataset.pk = key; // 다시 그린 뒤에도 같은 버튼에 포커스를 돌려주려고
    if (item) { const i = el('span', 'pet-ico'); itemStyle(i, item, 1.5); b.append(i); }
    b.append(text);
    b.addEventListener('click', fn);
    return b;
  }
  function doAct(fn, kind, ms, item) {
    const r = update(fn);
    relook();
    say(r.say);
    if (r.ok) { react(kind, ms); if (item) float(item); }
    renderPanel();
  }
  let moreOpen = false;
  function renderPanel() {
    if (panel.hidden) return;
    const focusKey = panel.contains(document.activeElement) ? document.activeElement.dataset?.pk : null;
    pet = load();
    panel.textContent = '';
    const head = el('div', 'pet-head');
    const name = el('input', 'pet-name');
    name.maxLength = 12;
    name.placeholder = A.pets[pet.kind].name;
    name.value = pet.name;
    name.dataset.pk = 'name';
    name.setAttribute('aria-label', '이름');
    name.addEventListener('change', () => { update((s) => ({ s: { ...s, name: name.value.trim().slice(0, 12) } })); place(); });
    head.append(name, button('ghost small-btn', '닫기', 'close', () => closePanel(true)));
    panel.append(head, bar('배', pet.hunger, 'hunger'), bar('기분', pet.mood, 'mood'));

    const acts = el('div', 'pet-acts');
    acts.append(
      button('small-btn pet-act', '밥 주기', 'feed', () => doAct((s) => L.feed(s), 'eat', 2400), 'bowl'),
      button('small-btn pet-act', `간식 ${pet.snacks}`, 'snack', () => doAct((s) => L.snack(s), 'happy', 1400, snackItem()), snackItem()),
      button('small-btn pet-act', '쓰다듬기', 'pat', () => doAct((s) => L.pat(s, Date.now()), 'happy', 1200, 'heart'), 'heart'),
    );
    panel.append(acts);
    const left = todayLeft();
    panel.append(el('p', 'pet-tip muted small', `${left ? `오늘까지 할 일 ${left}개 남았어요. ` : ''}할 일을 하나 끝낼 때마다 간식이 하나 생겨요 (하루 ${L.SNACK_DAY}개까지).`));

    const more = el('details', 'pet-more');
    more.open = moreOpen;
    more.addEventListener('toggle', () => { moreOpen = more.open; });
    const sum = el('summary', 'small', '친구 바꾸기 · 자리 · 크기 · 칸 위 · 숨기기');
    sum.dataset.pk = 'more';
    more.append(sum);
    const pick = el('div', 'pet-pick');
    for (const k of L.KINDS) {
      if (!A.pets[k]) continue;
      const b = button(`pet-pick-b${k === pet.kind ? ' on' : ''}`, '', `pick-${k}`, () => {
        if (k === pet.kind) return;
        update((s) => ({ s: { ...s, kind: k, name: '' } })); // 친구를 바꾸면 이름은 새로 (배·기분·간식은 이어감)
        place(); shown = -1; frame(); say('안녕하세요!'); renderPanel();
      });
      b.title = A.pets[k].name;
      b.setAttribute('aria-label', A.pets[k].name);
      b.setAttribute('aria-pressed', String(k === pet.kind));
      const face = el('span', 'pet-pick-img');
      face.style.backgroundImage = `url(${A.pets[k].src})`;
      b.append(face, el('span', 'small', A.pets[k].name));
      pick.append(b);
    }
    const spots = el('div', 'pet-opts');
    spots.append(el('span', 'muted small', '자리'));
    for (const [c, label] of [['tl', '↖'], ['tr', '↗'], ['bl', '↙'], ['br', '↘']]) {
      const b = button(`small-btn pet-spot${c === ui.corner ? ' on' : ''}`, label, `spot-${c}`, () => moveTo(c));
      b.setAttribute('aria-label', { tl: '왼쪽 위', tr: '오른쪽 위', bl: '왼쪽 아래', br: '오른쪽 아래' }[c]);
      b.setAttribute('aria-pressed', String(c === ui.corner));
      spots.append(b);
    }
    const opts = el('div', 'pet-opts');
    opts.append(
      button('small-btn', ui.size === 'big' ? '작게' : '크게', 'size', () => { ui.size = ui.size === 'big' ? 'small' : 'big'; resetWalk(); saveUi(); place(); renderPanel(); }),
      button('small-btn', ui.marks ? '칸 위에 안 올리기' : '칸 위에도 올리기', 'marks', () => { ui.marks = !ui.marks; saveUi(); spot(); renderPanel(); }),
      button('small-btn', ui.talk ? '알려 주기 끄기' : '알려 주기 켜기', 'talk', () => { ui.talk = !ui.talk; saveUi(); renderPanel(); }),
      button('small-btn', '숨기기', 'hide', () => { closePanel(false); ui.hidden = true; saveUi(); place(); run(); paw.focus(); }),
      el('span', 'muted small', `동물을 끌어서 옮겨도 돼요. 칸 위: 시간표의 지금 수업(쉬는 시간엔 다음 수업)${marks.cal ? '·달력의 오늘 칸' : ''}. 알려 주기: 수업 5분 전, 일정 10분 전, 11시 점심 메뉴, 마감 할 일(아침·오후 3시), 오늘 일정, 수업 끝·퇴근, 하루 한마디, 가끔 혼잣말 (수업 중엔 조용히).`),
    );
    more.append(pick, spots, opts);
    panel.append(more);
    if (focusKey) panel.querySelector(`[data-pk="${focusKey}"]`)?.focus();
  }
  // 저절로 다시 그릴 때(1분마다·할 일 변경·다른 탭)는 창 안을 쓰고 있으면 건드리지 않는다
  const renderSoft = () => { if (!panel.contains(document.activeElement)) renderPanel(); };
  function openPanel() {
    stopWalk();
    panel.style.translate = wander ? `${wander}px 0` : '';
    panel.hidden = false;
    hit.setAttribute('aria-expanded', 'true');
    stopWalk();
    renderPanel();
  }
  function closePanel(refocus) {
    if (panel.hidden) return;
    const inside = panel.contains(document.activeElement);
    panel.hidden = true;
    hit.setAttribute('aria-expanded', 'false');
    if (refocus || inside) hit.focus();
  }
  function resetWalk() { wander = wanderTo = 0; walkN = 0; settle = false; body.style.translate = ''; panel.style.translate = ''; body.classList.remove('flip'); }
  function moveTo(c) { ui.corner = c; resetWalk(); saveUi(); place(); renderPanel(); }

  // 누르면 열고 닫기, 끌면 가장 가까운 구석으로
  let drag = null;
  let dragged = false;
  hit.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, id: e.pointerId, moving: false };
    dragged = false;
    stopWalk();
    hit.setPointerCapture(e.pointerId); // 빠르게 끌어 동물 밖으로 나가도 계속 따라오게
  });
  hit.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.moving && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
    if (!drag.moving) { drag.moving = true; closePanel(false); resetWalk(); home.classList.add('dragging'); }
    const r = body.getBoundingClientRect();
    home.style.left = `${e.clientX - r.width / 2}px`;
    home.style.top = `${e.clientY - r.height / 2}px`;
    home.style.right = 'auto';
    home.style.bottom = 'auto';
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (drag.moving) {
      dragged = true;
      home.style.left = home.style.top = home.style.right = home.style.bottom = '';
      home.classList.remove('dragging');
      ui.corner = `${e.clientY < window.innerHeight / 2 ? 't' : 'b'}${e.clientX < window.innerWidth / 2 ? 'l' : 'r'}`;
      saveUi();
      place();
    }
    drag = null;
  };
  hit.addEventListener('pointerup', endDrag);
  hit.addEventListener('pointercancel', endDrag);
  hit.addEventListener('click', () => {
    if (dragged) { dragged = false; return; }
    if (panel.hidden) openPanel(); else closePanel(false);
  });
  document.addEventListener('pointerdown', (e) => { if (!panel.hidden && !home.contains(e.target)) closePanel(false); }, true);
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || panel.hidden || e.isComposing || document.querySelector('dialog[open]')) return;
    closePanel(true);
  });
  paw.addEventListener('click', () => { ui.hidden = false; saveUi(); place(); run(); hit.focus(); say('다시 왔어요!'); });

  // ---- 할 일을 끝내면 간식 (같은 할 일은 한 번만; 다른 탭이 이미 받았으면 건너뜀) ----
  let prevTodos = null;
  listen('todos', () => {
    const list = state.data.todos;
    if (!Array.isArray(list)) return;
    const snap = list.map((t) => ({ id: t.id, done: Boolean(t.done) }));
    const ids = L.newlyDone(prevTodos, snap);
    prevTodos = snap;
    if (!ids.length) { renderSoft(); return; }
    const r = update((s) => L.earn(s, ids, seoul().ymd));
    relook();
    if (r.counted && !ui.hidden) {
      react('happy', 1600);
      float(snackItem());
      say(r.added ? `할 일 끝! 간식 +${r.added}` : '할 일 끝! 잘했어요');
    }
    renderSoft();
  });

  // 다른 탭이 바꾸면 따라감
  window.addEventListener('storage', (e) => {
    if (e.key !== 'dash-pet' || !stored) return;
    const kind = pet.kind;
    pet = load();
    relook();
    if (kind !== pet.kind) { place(); shown = -1; }
    renderSoft();
  });

  // 1분마다 배·기분을 줄여 저장. 배고파지면 (보이고 있을 때) 한 번 말함
  let hungrySaid = false;
  setInterval(() => {
    pet = load();
    save();
    relook();
    if (pet.hunger >= 25) hungrySaid = false;
    else if (!hungrySaid && !ui.hidden && !document.hidden) { say('배고파요…', 5000); hungrySaid = true; }
    renderSoft();
    retarget();
  }, 60 * 1000);
  // 알려 주기: 30초마다 지금 할 말이 있는지 본다. 같은 말은 하루 한 번 (탭이 여러 개여도: 한 말을 저장해 나눔)
  let lastTalk = 0;
  let memSaid = { day: '', keys: [] }; // 저장이 막힌 브라우저용
  function talkCheck() {
    if (!ui.talk || ui.hidden || (document.hidden && !pip) || !panel.hidden || drag) return;
    const n = seoul();
    const raw = readJson('dash-pet-talk');
    const saved = raw && raw.day === n.ymd && Array.isArray(raw.keys) ? raw.keys : [];
    const mem = memSaid.day === n.ymd ? memSaid.keys : [];
    const said = [...saved, ...mem];
    const tt = D.ttNow?.() || null;
    const t = L.pickTalk({
      minutes: n.minutes, weekday: n.weekday, today: n.ymd,
      tt, todos: state.data.todos || [], events: D.calToday?.() || null, lunch: D.todayLunch?.() || null,
    }, said);
    if (!t) { if (!(tt?.st?.kind === 'class' && tt.st.at?.lesson)) chatter(n); return; } // 수업 중엔 혼잣말 안 함
    if (!t.urgent && Date.now() - lastTalk < 90e3) return;
    const keys = [...new Set([...said, t.key])].slice(-100);
    memSaid = { day: n.ymd, keys };
    ls.set('dash-pet-talk', JSON.stringify({ day: n.ymd, keys }));
    lastTalk = Date.now();
    speak(t.text, t.urgent ? 15000 : 10000, t.mood === 'wave' ? 'wave' : t.mood === 'worried' ? 'worried' : 'happy');
  }
  const speak = (text, ms, kind) => {
    say(`${pet.name ? `${pet.name}: ` : ''}${text}`, ms);
    react(kind, kind === 'wave' ? 2800 : 1600);
  };
  // 할 말이 없으면 가끔 혼잣말 (낮에만, 탭이 여러 개여도 25분에 한 번쯤)
  function chatter(n) {
    if (n.minutes < 7 * 60 + 30 || n.minutes >= 20 * 60) return;
    const last = Number(ls.get('dash-pet-chat')) || 0;
    const now = Date.now();
    if (!last) { ls.set('dash-pet-chat', String(now)); return; } // 처음엔 바로 말하지 않음
    if (now - Math.max(last, lastTalk) < 25 * 60e3 || Math.random() > 0.12) return;
    ls.set('dash-pet-chat', String(now));
    lastTalk = now;
    speak(L.idleLine(pet, A.pets[pet.kind]?.kind, Math.random()), 6000, 'happy');
  }
  setInterval(talkCheck, 30 * 1000);
  setTimeout(talkCheck, 5000); // 처음 열었을 때 (자료가 들어온 뒤)
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { pet = load(); relook(); retarget(); setTimeout(talkCheck, 1500); } run(); });
  listen('timetable', retarget);
  listen('todos', spot);

  place();
  save();
  relook();
  show('idle');
  retarget();
  run();
})();
