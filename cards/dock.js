// 반쪽 화면(배포판, PC): 창이 좁으면 시간표·달력만 크게 두고
// 바로가기·클립보드·포스트잇·AI는 오른쪽 세로 버튼줄을 눌러 서랍으로 꺼내 쓴다.
// 모니터 하나에서 창을 반으로 붙여(윈도우 키 + ←/→) 쓰는 선생님용. 창을 넓히면 원래대로 다 펼쳐진다.
(() => {
  if (window.Dash?.edition !== 'teacher' || !window.Dash.drawer) return;
  const { $ } = window.Dash;
  // 휴대폰(손가락)은 지금처럼 한 줄로 쌓는다. 마우스 쓰는 PC 에서 창이 좁을 때만
  const mq = matchMedia('(max-width: 1199px) and (min-width: 560px) and (hover: hover) and (pointer: fine)');
  const ITEMS = [
    ['card-go', '🔗', '바로가기'],
    ['card-clip', '📋', '클립보드'],
    ['card-sticky', '🗒️', '포스트잇'],
    ['card-ai', '💬', 'AI'],
  ].filter(([id]) => $(id));

  const rail = document.createElement('nav');
  rail.className = 'dock-rail';
  rail.setAttribute('aria-label', '옆 서랍');
  rail.hidden = true;
  const btns = new Map();
  for (const [id, icon, label] of ITEMS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dock-btn';
    b.dataset.drawer = id;
    b.title = label;
    b.setAttribute('aria-label', `${label} 열기`);
    b.setAttribute('aria-expanded', 'false');
    const i = document.createElement('span');
    i.className = 'dock-ico';
    i.setAttribute('aria-hidden', 'true');
    i.textContent = icon;
    const t = document.createElement('span');
    t.className = 'dock-t';
    t.textContent = label;
    b.append(i, t);
    rail.append(b);
    btns.set(id, b);
    // 파일을 끌고 와서 버튼 위에 올리면 그 서랍이 열려 바로 놓을 수 있게 (클립보드)
    b.addEventListener('dragenter', (e) => { if (e.dataTransfer?.types?.includes('Files')) window.Dash.drawer.open(id); });
    // 서랍 안 닫기(×): 반쪽 화면일 때만 보인다
    const head = $(id).querySelector('.card-head');
    if (head) {
      const x = document.createElement('button');
      x.type = 'button';
      x.className = 'ghost drawer-x dock-x';
      x.dataset.drawerClose = '';
      x.title = '닫기 (Esc)';
      x.setAttribute('aria-label', '닫기');
      x.textContent = '×';
      head.append(x);
    }
  }
  document.body.append(rail);

  // 숨겨진 칸(AI 끔 등)은 버튼도 숨긴다
  const showBtns = () => { for (const [id, b] of btns) b.hidden = $(id).hidden; };
  const mo = new MutationObserver(() => {
    showBtns();
    // 열려 있던 칸이 숨겨지면 서랍도 닫는다
    for (const [id] of ITEMS) if ($(id).hidden && $(id).classList.contains('open')) window.Dash.drawer.close(id);
  });
  for (const [id] of ITEMS) mo.observe($(id), { attributes: true, attributeFilter: ['hidden'] });

  function apply() {
    const on = mq.matches;
    // 바뀌는 순간에는 미끄러지는 움직임 없이 (칸들이 번쩍이며 빠져나가 보이지 않게)
    document.body.classList.add('dock-snap');
    requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove('dock-snap')));
    document.body.classList.toggle('docked', on);
    rail.hidden = !on;
    for (const [id] of ITEMS) {
      const c = $(id);
      if (on) {
        c.classList.add('drawer', 'dock-card');
      } else {
        c.classList.remove('drawer', 'dock-card', 'open');
        c.inert = false;
      }
      window.Dash.drawer.sync(c);
      if (!on) c.inert = false;
    }
    window.Dash.refold?.(); // 서랍 안에서는 접힌 칸도 펼쳐서 보여 준다
    showBtns();
  }
  mq.addEventListener('change', apply);
  apply();
})();
