// 항상 위 작은 창: 다른 프로그램 위에 떠 있는 작은 창에 시계·지금 교시·오늘 수업·오늘 구글 일정·오늘 할 일.
// 크롬·엣지의 "문서 PiP"(documentPictureInPicture)를 쓴다. 지원하지 않는 브라우저에서는 버튼이 안 보인다.
// 창 안의 화면은 이 페이지가 직접 그린다 (자료는 대시보드와 같은 것, 할 일 체크도 그대로 저장됨).
(() => {
  const btn = document.getElementById('pip-open');
  if (!btn || !('documentPictureInPicture' in window)) return;
  const { state, api, listen, seoul } = window.Dash;
  const L = window.TimetableLogic;
  btn.hidden = false;
  let win = null;
  let opening = false;
  const sending = new Set(); // 체크해서 저장 중인 할 일 (결과가 오기 전 다시 그려도 체크된 채로)
  const MAX_TODOS = 6;
  const MAX_EVENTS = 4;
  let gToday = { date: '', items: [] }; // 오늘 구글 일정 (작은 창이 열려 있는 동안 따로 받는다)
  let gLoading = false;
  let gAgain = false; // 받는 중에 "바뀌었어" 신호가 오면 끝난 뒤 한 번 더

  // 오늘 구글 일정 받기: 달력 칸이 다른 달을 보고 있어도 작은 창은 오늘 것을 보여 주게
  async function loadGoogle() {
    if (!win) return;
    if (gLoading) { gAgain = true; return; }
    const day = seoul().ymd;
    gLoading = true;
    gAgain = false;
    try {
      const r = await api('GET', `/api/calendar?from=${day}&to=${day}&google=1`);
      const failed = (r?.errors || []).some((x) => String(x).startsWith('구글:'));
      if (r?.google?.linked === false) gToday = { date: day, items: [] }; // 연결을 끊었으면 비운다
      else if (!failed) {
        const CL = window.CalendarLogic;
        const items = CL ? (CL.itemsByDate(r?.events || [], [], day, day)[day] || []).filter((i) => i.source === 'google') : [];
        gToday = { date: day, items };
      }
      // 구글만 실패(열쇠 끝남 등)면 지난 목록을 그대로 둔다
    } catch {
      // 오프라인 등: 지난 목록을 그대로 두고 조용히 넘어간다
    } finally {
      gLoading = false;
    }
    render();
    if (gAgain) loadGoogle();
  }

  const el = (doc, tag, cls, text) => {
    const e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };

  function render() {
    if (!win) return;
    const doc = win.document;
    const root = doc.getElementById('pip');
    if (!root) return;
    const n = seoul();
    const now = window.Dash.ttNow?.() || null;
    root.textContent = '';

    // 시계 + 날짜
    const head = el(doc, 'div', 'pip-head');
    const hh = Math.floor(n.minutes / 60);
    const mm = Math.floor(n.minutes % 60);
    head.append(el(doc, 'strong', 'pip-clock', `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`));
    const d = new Date(`${n.ymd}T00:00:00`);
    head.append(el(doc, 'span', 'pip-date', `${d.getMonth() + 1}/${d.getDate()} (${'일월화수목금토'[d.getDay()]})`));
    root.append(head);

    // 지금 교시 + 남은 시간 막대
    const st = now?.st;
    const box = el(doc, 'div', `pip-now${st?.kind === 'class' && st.at.lesson ? ' on' : ''}`, now ? now.text : '시간표 불러오는 중…');
    if (st?.kind === 'class' && st.at.lesson) {
      const bar = el(doc, 'div', 'pip-bar');
      const fill = el(doc, 'i');
      fill.style.width = `${Math.round(L.progress(st.at.start, st.at.end, now.minutes) * 100)}%`;
      bar.append(fill);
      box.append(bar);
    }
    root.append(box);

    // 오늘 수업 한 줄 (지난 것은 흐리게, 지금 것은 강조)
    const lessons = (now?.lessons || []).filter((l) => l.lesson);
    if (lessons.length) {
      const row = el(doc, 'div', 'pip-day');
      const m = now.minutes;
      for (const l of lessons) {
        const past = m >= L.toMin(l.end);
        const cur = L.toMin(l.start) <= m && m < L.toMin(l.end);
        const c = el(doc, 'span', `pip-l${past ? ' past' : ''}${cur ? ' cur' : ''}`);
        c.append(el(doc, 'b', '', String(l.period)), doc.createTextNode(` ${L.lessonText(l.lesson)}`));
        c.title = `${l.period}교시 ${l.start}–${l.end}${l.lesson.room ? ` · ${l.lesson.room}` : ''}`;
        row.append(c);
      }
      root.append(row);
    }

    // 오늘 구글 일정: 종일 일정 먼저, 그다음 시각 순. 끝난 일정은 흐리게
    const evs = gToday.date === n.ymd ? gToday.items : [];
    if (evs.length) {
      const sec = el(doc, 'div', 'pip-events');
      sec.append(el(doc, 'div', 'pip-sub', `오늘 일정 ${evs.length}`));
      const toMin = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
      for (const e of evs.slice(0, MAX_EVENTS)) {
        // 오늘 안에서의 시작·끝(분). 어제 시작했으면 0, 내일 끝나면 24시로 본다
        const startsToday = e.date === n.ymd;
        const endsToday = (e.endDate || e.date) === n.ymd;
        const startMin = e.time && startsToday ? toMin(e.time) : 0;
        const endMin = e.time && endsToday && e.endTime ? toMin(e.endTime) : e.time && endsToday ? startMin + 60 : 24 * 60;
        const over = Boolean(e.time) && endsToday && n.minutes >= Math.max(endMin, startMin);
        const row = el(doc, 'div', `pip-ev${over ? ' past' : ''}`);
        if (e.color) row.style.setProperty('--gc', e.color);
        const label = !e.time ? '종일' : startsToday ? e.time : endsToday && e.endTime ? `~${e.endTime}` : '계속';
        row.append(el(doc, 'b', '', label), el(doc, 'span', '', e.title));
        row.title = [e.time ? `${e.time}${e.endTime ? `–${e.endTime}` : ''}` : '종일', e.title, e.detail].filter(Boolean).join('\n');
        sec.append(row);
      }
      if (evs.length > MAX_EVENTS) sec.append(el(doc, 'div', 'pip-more', `+ ${evs.length - MAX_EVENTS}개 더`));
      root.append(sec);
    }

    // 오늘 할 일: 마감이 오늘이거나 지난 것 먼저, 그다음 마감 없는 것
    const open = (state.data.todos || []).filter((t) => !t.done);
    const due = open.filter((t) => t.due && t.due <= n.ymd).sort((a, b) => a.due.localeCompare(b.due));
    const free = open.filter((t) => !t.due);
    const list = [...due, ...free];
    const sec = el(doc, 'div', 'pip-todos');
    sec.append(el(doc, 'div', 'pip-sub', list.length ? `할 일 ${list.length}` : '오늘 할 일 없음'));
    for (const t of list.slice(0, MAX_TODOS)) {
      const lab = el(doc, 'label', `pip-todo${t.due && t.due < n.ymd ? ' late' : ''}`);
      const cb = el(doc, 'input');
      cb.type = 'checkbox';
      if (sending.has(t.id)) { cb.checked = true; cb.disabled = true; }
      cb.addEventListener('change', async () => {
        cb.disabled = true;
        sending.add(t.id);
        try {
          await api('PATCH', `/api/todos/${t.id}`, { done: true });
        } catch (err) {
          cb.checked = false;
          cb.disabled = false;
          lab.title = err.message;
        } finally {
          sending.delete(t.id);
        }
      });
      lab.append(cb, el(doc, 'span', '', t.title));
      if (t.due && t.due < n.ymd) lab.append(el(doc, 'em', '', `${Number(t.due.slice(5, 7))}/${Number(t.due.slice(8))}`));
      sec.append(lab);
    }
    if (list.length > MAX_TODOS) sec.append(el(doc, 'div', 'pip-more', `+ ${list.length - MAX_TODOS}개 더`));
    root.append(sec);
  }

  async function openPip() {
    if (win) { win.focus(); return; }
    if (opening) return; // 빠르게 두 번 눌러도 창은 하나
    opening = true;
    let w;
    try {
      w = await window.documentPictureInPicture.requestWindow({ width: 300, height: 340 });
    } catch {
      return;
    } finally {
      opening = false;
    }
    win = w;
    const doc = w.document;
    doc.title = '대시보드 작은 창';
    // 대시보드와 같은 글꼴·색(다크 모드 포함)
    for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
      if (!/style\.css/.test(link.href)) continue;
      const l = doc.createElement('link');
      l.rel = 'stylesheet';
      l.href = link.href;
      doc.head.append(l);
    }
    doc.body.className = 'pip-body';
    doc.body.append(el(doc, 'div', 'pip-root'));
    doc.body.firstChild.id = 'pip';
    // 큰 창을 닫으면 이 창도 닫힌다 (크롬 작은 창의 규칙)
    doc.body.append(el(doc, 'div', 'pip-tip', '큰 창은 닫지 말고 ─ (최소화)로 내려 두세요. 닫으면 이 창도 닫혀요.'));
    render();
    loadGoogle();
    w.setInterval(loadGoogle, 5 * 60e3); // 폰 등에서 바꾼 일정도 5분 안에
    // 작은 창 쪽 시계로 돌린다 (대시보드 탭이 가려져 느려져도 작은 창은 제때 바뀌게). 분이 바뀌는 때에 맞춤
    const next = () => w.setTimeout(() => {
      if (gToday.date && gToday.date !== seoul().ymd) loadGoogle(); // 자정이 지나면 새 날 일정
      render();
      next();
    }, 60e3 - (Date.now() % 60e3) + 50);
    next();
    btn.setAttribute('aria-pressed', 'true');
    window.dispatchEvent(new CustomEvent('dash-pip', { detail: w })); // 키우기 동물이 작은 창에도 앉게
    w.addEventListener('pagehide', () => {
      if (win !== w) return;
      win = null;
      btn.setAttribute('aria-pressed', 'false');
      window.dispatchEvent(new CustomEvent('dash-pip', { detail: null }));
    });
  }

  btn.addEventListener('click', openPip);
  listen('todos', render);
  listen('timetable', render);
  listen('google', () => { if (state.data.google?.changedAt) loadGoogle(); }); // 대시보드에서 일정을 바꾸거나 연결하면
})();
