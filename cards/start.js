// 시작하기 (웹판): 처음 쓰는 선생님이 할 일을 한 창에 모아 보여 준다.
// 학교 고르기 → 내 시간표 → 이 PC 설정(윈도우) → 앱으로 설치. 된 것은 저절로 ✓.
// 처음(학교를 아직 안 골랐을 때) 한 번 저절로 뜨고, 다 하기 전까지는 맨 위 [시작하기 n/4] 로 다시 연다.
(() => {
  const { state, listen, $ } = window.Dash;
  const dlg = $('start');
  const chip = $('start-open');
  if (!dlg || !chip || window.Dash.edition !== 'teacher') return;
  const win = /Windows/i.test(navigator.userAgent);
  const schoolTt = document.querySelector('meta[name="school-tt"]')?.content || '';
  const ls = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* 이번만 */ } },
  };
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const say = (t) => { $('start-msg').textContent = t || ''; };
  // 다른 창을 열기 전에 이 창을 닫고, 그 창이 닫히면 다시 이 창으로
  function handOff(open) {
    dlg.close();
    open();
    const other = document.querySelector('dialog[open]');
    // 그 창이 닫히면, 다른 창(그 창에서 연 이 PC 설정 등)이 다 닫힐 때까지 기다렸다가 다시
    const back = () => {
      if (document.querySelector('dialog[open]')) { setTimeout(back, 500); return; }
      render();
      if (!allDone()) dlg.showModal();
    };
    if (other) other.addEventListener('close', () => setTimeout(back, 0), { once: true });
  }

  const steps = [
    {
      title: '학교 고르기',
      desc: '급식·날씨·학사일정·업무포털이 우리 학교에 맞춰져요.',
      done: () => Boolean(state.data.settings?.school),
      act: '고르기',
      go: () => handOff(() => window.Dash.openSettings?.()),
    },
    {
      title: '내 시간표 넣기',
      desc: schoolTt ? `이름과 나이스 개인번호만 넣으면 ${schoolTt} 시간표에서 찾아 넣어요.` : '나이스에서 내 과목·반을 골라 넣거나, 편집을 눌러 직접 넣어요.',
      done: () => (state.data.timetable?.base?.length || 0) > 0,
      act: '넣기',
      go() {
        const school = $('tt-school-open');
        const neis = $('tt-neis-open');
        if (schoolTt && school && window.Dash.schoolTtReady) return handOff(() => school.click());
        if (schoolTt) { say('학교 시간표를 아직 못 불러왔어요. 잠시 뒤 다시 눌러 주세요. (오래된 브라우저면 편집으로 직접 넣어 주세요)'); return; }
        if (!state.data.settings?.school) { say('먼저 1번에서 학교를 골라 주세요.'); return; }
        if (neis) return handOff(() => neis.click());
        dlg.close();
        $('tt-edit')?.click();
        $('card-tt')?.scrollIntoView({ block: 'nearest' });
      },
    },
    ...(win ? [{
      title: '이 PC 설정 (한 번만)',
      desc: '[다운로드]·자주 가는 폴더 버튼이 탐색기를 열게 해요. 줄 하나를 복사해 붙여넣으면 돼요.',
      done: () => ls.get('dash-dl-ok') === '1' || ls.get('dash-start-pc') === '1',
      act: '설정하기',
      go: () => handOff(() => { ls.set('dash-start-pc', '1'); window.Dash.openPcSetup?.(); }),
    }] : []),
    {
      title: '앱으로 설치',
      desc: '프로그램처럼 따로 열리고, 작업 표시줄에 고정해 둘 수 있어요.',
      done: () => Boolean(window.DashInstall?.installed()),
      optional: true, // 설치를 못 하는 브라우저도 있어서, 이것만 남으면 [시작하기]는 숨긴다
      act: '설치',
      async go() {
        if (window.DashInstall?.can()) {
          if (await window.DashInstall.prompt()) render();
          return;
        }
        say('주소창 오른쪽 끝의 설치 아이콘(모니터에 ↓ 모양)을 누르거나, 브라우저 메뉴(⋮) → "앱으로 설치"를 눌러 주세요. 크롬·엣지에서 돼요.');
      },
    },
  ];
  const allDone = () => steps.every((s) => s.optional || s.done());

  function render() {
    const n = steps.filter((s) => s.done()).length;
    chip.hidden = !state.data.settings || steps.every((s) => s.optional || s.done());
    chip.textContent = `시작하기 ${n}/${steps.length}`;
    const box = $('start-steps');
    box.textContent = '';
    steps.forEach((s, i) => {
      const ok = s.done();
      const li = el('li', `start-step${ok ? ' done' : ''}`);
      li.append(el('span', 'start-num', ok ? '✓' : String(i + 1)));
      const txt = el('div', 'start-txt');
      txt.append(el('strong', '', s.title), el('span', 'muted small', s.desc));
      li.append(txt);
      if (!ok) {
        const b = el('button', 'small-btn', s.act);
        b.type = 'button';
        b.addEventListener('click', () => { say(''); s.go(); });
        li.append(b);
      } else li.append(el('span', 'start-ok small', '됐어요'));
      box.append(li);
    });
    if (n === steps.length) say('다 됐어요! 이제 대시보드를 그대로 쓰시면 돼요.');
  }

  // 처음 쓰는 선생님: 학교를 아직 안 골랐고 이 안내를 본 적이 없음 (teacher.js·golinks.js 가 자기 안내 대신 이걸 쓰게)
  // 이 화면을 연 그때 기준으로 한 번 정한다 (보여 준 뒤에도 이번에는 계속 "처음")
  let fresh = null;
  const isNew = () => {
    if (fresh === null && state.data.settings) fresh = ls.get('dash-start-seen') !== '1' && !state.data.settings.school;
    return Boolean(fresh);
  };
  window.Dash.startGuide = { isNew, open: () => { render(); dlg.showModal(); } };

  chip.addEventListener('click', () => { say(''); render(); dlg.showModal(); });
  $('start-close').addEventListener('click', () => dlg.close());
  listen('settings', render);
  listen('timetable', render);
  // 다른 창에서 돌아오면(이 PC 설정 뒤 탐색기가 열렸다 등) 다시 셈
  window.addEventListener('focus', render);

  let shown = false;
  listen('settings', () => {
    if (shown || !isNew()) return;
    shown = true;
    ls.set('dash-start-seen', '1');
    // 다른 창이 떠 있으면 닫힐 때까지 기다렸다가
    const tryShow = () => {
      if (document.querySelector('dialog[open]')) { setTimeout(tryShow, 1000); return; }
      render();
      dlg.showModal();
    };
    setTimeout(tryShow, 300);
  });
})();
