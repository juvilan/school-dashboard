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
    hit.setAttribute('aria-label', `${petName()} (누르면 돌보기, 끌면 다른 구석으로)`);
  }
  let shown = -1;
  function show(name) {
    const i = F[name] ?? 0;
    if (i === shown) return;
    shown = i;
    img.style.setProperty('--f', i);
  }

  let sayTimer = 0;
  function say(text, ms = 3000) {
    bubble.textContent = text;
    bubble.hidden = !text;
    clearTimeout(sayTimer);
    if (text) sayTimer = setTimeout(() => { bubble.hidden = true; }, ms);
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
  let act = null; // { kind: 'eat' | 'happy', until }
  let n = 0;
  let wander = 0;
  let wanderTo = 0;
  function stopWalk() { wanderTo = wander; }
  function frame() {
    n++;
    if (act && Date.now() > act.until) { act = null; home.classList.toggle('sleeping', mood === 'sleep'); }
    if (act?.kind === 'eat') return show(reduced || n % 4 < 2 ? 'eat1' : 'eat2');
    if (act?.kind === 'happy') return show('happy');
    if (mood === 'sleep') return show('sleep');
    if (wander !== wanderTo) {
      const step = ui.size === 'small' ? 2 : 4;
      wander += Math.sign(wanderTo - wander) * Math.min(step, Math.abs(wanderTo - wander));
      body.style.translate = wander ? `${wander}px 0` : '';
      return show(n % 2 ? 'stepL' : 'stepR');
    }
    if (mood === 'worried') return show(!reduced && n % 30 === 0 ? 'blink' : 'worried');
    if (reduced) return show('idle'); // 움직임 줄이기: 가만히
    // 가끔 옆으로 몇 걸음 (1분에 한 번쯤)
    if (panel.hidden && !drag && Math.random() < 1 / 300) {
      const max = (ui.size === 'small' ? 64 : 128) * 0.8;
      const dir = ui.corner.endsWith('r') ? -1 : 1;
      wanderTo = Math.round((Math.random() < 0.4 ? 0 : Math.random() * max) * dir);
    }
    const c = n % 60;
    if (c >= 30 && c < 38) return show(c % 2 ? 'wag' : 'idle');
    return show(n % 25 === 0 ? 'blink' : 'idle');
  }
  let timer = 0;
  function run() {
    const on = !ui.hidden && !document.hidden;
    if (on && !timer) timer = setInterval(frame, 200);
    if (!on && timer) { clearInterval(timer); timer = 0; }
  }

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
    const sum = el('summary', 'small', '친구 바꾸기 · 자리 · 크기 · 숨기기');
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
      button('small-btn', '숨기기', 'hide', () => { closePanel(false); ui.hidden = true; saveUi(); place(); run(); paw.focus(); }),
      el('span', 'muted small', '동물을 끌어서 옮겨도 돼요.'),
    );
    more.append(pick, spots, opts);
    panel.append(more);
    if (focusKey) panel.querySelector(`[data-pk="${focusKey}"]`)?.focus();
  }
  // 저절로 다시 그릴 때(1분마다·할 일 변경·다른 탭)는 창 안을 쓰고 있으면 건드리지 않는다
  const renderSoft = () => { if (!panel.contains(document.activeElement)) renderPanel(); };
  function openPanel() {
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
  function resetWalk() { wander = wanderTo = 0; body.style.translate = ''; }
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
  }, 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { pet = load(); relook(); } run(); });

  place();
  save();
  relook();
  show('idle');
  run();
})();
