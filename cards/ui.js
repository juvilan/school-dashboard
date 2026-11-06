// 화면 공통: 옆에서 나오는 서랍(급식·음악)과 기호 버튼 말풍선
(() => {
  window.Dash = window.Dash || {};

  // ---- 서랍: data-drawer="<id>" 를 누르면 열고 닫는다. 바깥을 누르거나 Esc 면 닫힘 ----
  const togglers = (id) => document.querySelectorAll(`[data-drawer="${id}"]`);
  const sync = (d) => {
    const open = d.classList.contains('open');
    d.inert = !open; // 닫힌 서랍 안으로 Tab 이 들어가지 않게
    togglers(d.id).forEach((b) => b.setAttribute('aria-expanded', String(open)));
  };
  const drawer = {
    // 서랍이 아닌 것은 건드리지 않는다 (반쪽 화면에서만 서랍이 되는 칸이 있음)
    sync(d) { if (d?.classList.contains('drawer')) sync(d); },
    open(id) {
      const d = document.getElementById(id);
      if (!d) return;
      document.querySelectorAll('.drawer.open').forEach((o) => { if (o !== d) { o.classList.remove('open'); sync(o); } });
      d.classList.add('open');
      sync(d);
    },
    close(id) {
      const d = document.getElementById(id);
      if (!d) return;
      const had = d.contains(document.activeElement);
      d.classList.remove('open');
      sync(d);
      if (had) togglers(id)[0]?.focus(); // 서랍 안에 있던 커서를 연 버튼으로 돌려줌
    },
    toggle(id) {
      const d = document.getElementById(id);
      if (d) (d.classList.contains('open') ? drawer.close : drawer.open)(id);
    },
  };
  window.Dash.drawer = drawer;
  document.querySelectorAll('.drawer').forEach(sync);
  document.addEventListener('click', (e) => {
    const t = e.target.closest?.('[data-drawer]');
    if (t) { drawer.toggle(t.dataset.drawer); return; }
    const x = e.target.closest?.('[data-drawer-close]');
    if (x) { const d = x.closest('.drawer'); if (d) drawer.close(d.id); }
  });
  // 바깥을 누르면 닫힘 (서랍 안·여는 버튼·창(dialog)은 빼고)
  document.addEventListener('pointerdown', (e) => {
    if (e.target.closest?.('.drawer, [data-drawer], dialog')) return;
    document.querySelectorAll('.drawer.open').forEach((d) => drawer.close(d.id));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.isComposing || document.querySelector('dialog[open]')) return; // 한글 조합 중 Esc 는 조합만 취소
    document.querySelectorAll('.drawer.open').forEach((d) => drawer.close(d.id));
  });

  // ---- 말풍선: 짧은 기호 버튼(✎ × ♪ ‹ › 등)의 title 을 브라우저 기본 대신 깔끔하게 ----
  if (!matchMedia('(hover: hover)').matches) return;
  const tip = document.createElement('div');
  tip.className = 'tip';
  tip.setAttribute('role', 'tooltip');
  const top = typeof tip.showPopover === 'function'; // 창(dialog) 위에도 뜨게 맨 위 층으로
  if (top) tip.popover = 'manual'; else tip.hidden = true;
  document.body.append(tip);
  const show = (on) => { if (top) { try { on ? tip.showPopover() : tip.hidePopover(); } catch { /* 이미 그 상태 */ } } else tip.hidden = !on; };
  let timer = null;
  let cur = null;
  const isSymbol = (b) => b.textContent.trim().length <= 3 || b.classList.contains('icon');
  const hide = () => {
    clearTimeout(timer);
    show(false);
    tip.classList.remove('show');
    if (cur && cur.dataset.tip !== undefined) { if (!cur.title) cur.title = cur.dataset.tip; delete cur.dataset.tip; }
    cur = null;
  };
  document.addEventListener('mouseover', (e) => {
    const b = e.target.closest?.('button[title], a[title], button[aria-label]');
    if (b === cur) return;
    hide();
    if (!b || !isSymbol(b)) return;
    const text = b.title || b.getAttribute('aria-label') || '';
    if (!text) return;
    cur = b;
    if (b.title) { b.dataset.tip = b.title; b.title = ''; } // 기본 말풍선이 같이 뜨지 않게 (떠나면 되돌림)
    timer = setTimeout(() => {
      if (cur !== b) return;
      if (!b.isConnected) { hide(); return; }
      tip.textContent = text;
      show(true);
      const r = b.getBoundingClientRect();
      const w = tip.offsetWidth;
      const h = tip.offsetHeight;
      let x = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), innerWidth - w - 8);
      let y = r.bottom + 6;
      if (y + h > innerHeight - 8) y = r.top - h - 6;
      tip.style.left = `${x}px`;
      tip.style.top = `${y}px`;
      requestAnimationFrame(() => tip.classList.add('show'));
    }, 350);
  });
  document.addEventListener('mousedown', hide, true);
  document.addEventListener('keydown', hide, true);
  document.addEventListener('mouseout', (e) => { if (cur && (!e.relatedTarget || !cur.contains(e.relatedTarget))) hide(); });
  window.addEventListener('blur', hide);
  document.addEventListener('scroll', hide, true);
})();
