// 항상 위 작은 창: 다른 프로그램 위에 떠 있는 작은 창에 시계·지금 교시·오늘 수업·오늘 할 일.
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
    render();
    // 작은 창 쪽 시계로 돌린다 (대시보드 탭이 가려져 느려져도 작은 창은 제때 바뀌게). 분이 바뀌는 때에 맞춤
    const next = () => w.setTimeout(() => { render(); next(); }, 60e3 - (Date.now() % 60e3) + 50);
    next();
    btn.setAttribute('aria-pressed', 'true');
    w.addEventListener('pagehide', () => {
      if (win !== w) return;
      win = null;
      btn.setAttribute('aria-pressed', 'false');
    });
  }

  btn.addEventListener('click', openPip);
  listen('todos', render);
  listen('timetable', render);
})();
