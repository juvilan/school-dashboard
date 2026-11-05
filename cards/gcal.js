// 구글 캘린더 연결 창 + 날짜 창(그날 일정 보기, 일정·할 일 추가, 구글 일정 고치기·지우기).
// 달력 칸을 누르면 Dash.dayEdit.open({ date }), 구글 일정 칩을 누르면 open({ date, item }),
// 할 일은 날짜 창에서 추가(마감일 필수)·완료·지우기 한다 (할 일 카드는 없앰).
(() => {
  const { state, api, $ } = window.Dash;
  const L = window.CalendarLogic;
  const DOW = ['일', '월', '화', '수', '목', '금', '토'];
  let gstatus = null; // /api/google/status
  let cur = null; // { date, item, mode }

  const fmtDate = (s) => { const d = L.fromYmd(s); return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DOW[d.getDay()]})`; };
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // 배포판: 구글 연결 정보가 프로그램에 들어 있으면(bundled) 로그인만 하면 끝. 없으면 구글 기능을 감추고 할 일만
  const TEACHER = window.Dash.edition === 'teacher';
  function showGoogle(on) {
    for (const x of document.querySelectorAll('.g-only')) x.hidden = !on;
  }
  if (TEACHER) {
    showGoogle(false);
    for (const x of document.querySelectorAll('.p-paste')) x.hidden = true;
  }
  async function loadStatus() {
    try {
      gstatus = await api('GET', '/api/google/status');
    } catch (err) {
      gstatus = { configured: false, linked: false, calendars: [], settings: {}, error: err.message };
    }
    if (TEACHER) showGoogle(Boolean(gstatus.configured));
    // 웹판: 구글 로그인은 1시간마다 끝난다 → 달력 위 버튼 한 번으로 다시 연결
    $('cal-google').textContent = gstatus.relogin ? '구글 다시 연결' : gstatus.linked ? '구글 ⚙' : '구글 연결';
    $('cal-google').classList.toggle('warn', Boolean(gstatus.error));
    return gstatus;
  }

  // ---------------- 구글 연결 창 ----------------
  function renderConnect() {
    const s = gstatus;
    $('g-step-client').hidden = s.linked || s.bundled;
    $('g-step-login').hidden = (s.linked && !s.relogin) || !s.configured;
    $('g-linked').hidden = !s.linked;
    $('g-state').textContent = s.linked ? `연결됨${s.email ? ` · ${s.email}` : ''}` : s.bundled ? '내 구글 계정으로 로그인하면 연결돼요. (연결하지 않아도 할 일 달력으로 쓸 수 있어요)' : s.configured ? '2단계: 구글 로그인' : '1단계: 클라이언트 JSON 넣기';
    if (s.linked) $('g-wait').hidden = true;
    $('g-msg').textContent = s.error || '';
    if (s.linked) {
      const box = $('g-cals');
      box.textContent = '';
      const show = Array.isArray(s.settings.show) ? s.settings.show : s.calendars.filter((c) => c.primary).map((c) => c.id);
      const write = s.settings.write || s.calendars.find((c) => c.primary)?.id;
      for (const c of s.calendars) {
        const row = el('div', 'g-cal');
        const cb = el('input');
        cb.type = 'checkbox';
        cb.checked = show.includes(c.id);
        cb.dataset.id = c.id;
        cb.className = 'g-show';
        const dot = el('i', 'g-dot');
        if (c.color) dot.style.background = c.color;
        const name = el('label', '', c.summary);
        const rb = el('input');
        rb.type = 'radio';
        rb.name = 'g-write';
        rb.value = c.id;
        rb.disabled = !c.writable;
        rb.checked = c.id === write;
        rb.title = c.writable ? '새 일정은 여기에' : '읽기만 되는 달력';
        row.append(cb, dot, name, rb);
        box.append(row);
      }
    }
  }

  async function openConnect() {
    if (gstatus?.relogin && gstatus.web) {
      // 이미 허용한 계정이라 로그인 창이 잠깐 떴다 닫힌다. 안 되면 아래 연결 창으로
      try {
        await api('POST', '/api/google/open-login');
        await loadStatus();
        if (!gstatus.error) return;
      } catch { /* 연결 창에서 다시 */ }
    }
    await loadStatus();
    $('g-client').value = '';
    $('g-url').value = '';
    renderConnect();
    $('google-dialog').showModal();
  }
  async function step(fn) {
    $('g-msg').textContent = '';
    try {
      const note = await fn(); // 돌려준 글이 있으면 다 그린 뒤 알림으로
      await loadStatus();
      renderConnect();
      if (typeof note === 'string' && note) $('g-msg').textContent = note;
    } catch (err) {
      $('g-msg').textContent = err.message;
    }
  }
  $('cal-google').addEventListener('click', openConnect);
  $('g-close').addEventListener('click', () => $('google-dialog').close());
  // 배포판: 로그인은 평소 브라우저에서 하고, 끝나면 서버가 직접 받는다 → 연결될 때까지 상태를 확인
  let waitTimer = null;
  function waitLinked() {
    clearInterval(waitTimer);
    const until = Date.now() + 5 * 60e3;
    waitTimer = setInterval(async () => {
      if (!$('google-dialog').open || Date.now() > until) { clearInterval(waitTimer); return; }
      await loadStatus();
      if (gstatus.linked) {
        clearInterval(waitTimer);
        renderConnect();
        $('g-msg').textContent = '연결했어요. 보여 줄 달력을 고르고 저장해 주세요.';
      }
    }, 2000);
  }
  $('g-save-client').addEventListener('click', () => step(() => api('POST', '/api/google/client', { json: $('g-client').value })));
  $('g-open').addEventListener('click', () => step(async () => {
    if (gstatus?.web) {
      // 웹판: 구글 로그인 창(팝업)이 뜨고, 허용하면 바로 끝난다
      await api('POST', '/api/google/open-login');
      return '연결했어요. 보여 줄 달력을 고르고 저장해 주세요.';
    }
    if (gstatus?.bundled) {
      // 배포판: 서버가 로그인 주소를 만들어 평소 브라우저로 바로 연다 (주소가 길어 /api/open 길이 제한에 걸리지 않게)
      await api('POST', '/api/google/open-login');
      $('g-wait').hidden = false;
      waitLinked();
      return;
    }
    const { url } = await api('POST', '/api/google/start');
    window.open(url, '_blank', 'noopener');
    $('g-url').focus();
  }));
  $('g-finish').addEventListener('click', () => step(async () => {
    await api('POST', '/api/google/finish', { url: $('g-url').value });
    $('g-url').value = '';
  }));
  $('g-save-cals').addEventListener('click', () => step(async () => {
    const show = [...document.querySelectorAll('#g-cals .g-show')].filter((x) => x.checked).map((x) => x.dataset.id);
    const write = document.querySelector('#g-cals input[name=g-write]:checked')?.value || null;
    await api('PUT', '/api/google/settings', { show, write });
    return '저장했어요.';
  }));
  $('g-disconnect').addEventListener('click', () => {
    // 한 번 더 눌러야 끊음
    const b = $('g-disconnect');
    if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = '정말 끊기 (한 번 더)'; setTimeout(() => { b.dataset.armed = ''; b.textContent = '연결 끊기'; }, 3000); return; }
    step(async () => {
      const r = await api('POST', '/api/google/disconnect');
      return r?.message || '연결을 끊었어요.';
    });
  });

  // ---------------- 날짜 창 ----------------
  function writableCals() {
    return (gstatus?.calendars || []).filter((c) => c.writable);
  }

  function setMode(mode) {
    cur.mode = mode;
    $('d-mode-event').setAttribute('aria-pressed', String(mode === 'event'));
    $('d-mode-todo').setAttribute('aria-pressed', String(mode === 'todo'));
    $('d-event').hidden = mode !== 'event';
    $('d-todo').hidden = mode !== 'todo';
    $('d-need-google').hidden = !(mode === 'event' && !gstatus?.linked);
    // 구글 연결 전에는 일정 입력칸을 감춘다 (안내만)
    for (const c of $('d-event').children) if (c.id !== 'd-need-google') c.hidden = !gstatus?.linked;
    if (gstatus?.linked) toggleTime();
    $('d-save').hidden = mode === 'event' && !gstatus?.linked;
    $('d-delete').hidden = !(mode === 'event' && cur.item);
    if (mode === 'todo' || gstatus?.linked) $(mode === 'event' ? 'd-title' : 'd-todo-title').focus();
  }

  function renderDayList(date) {
    const box = $('d-list');
    box.textContent = '';
    if (!date) return;
    const items = (window.Dash.calendarItems?.(date) || []);
    for (const it of items) {
      if (it.source === 'todo' && it.todoId) { box.append(todoRow(it, date)); continue; }
      const row = el(it.source === 'google' && it.editable ? 'button' : 'div', `d-item chip ${it.source}`);
      if (row.tagName === 'BUTTON') {
        row.type = 'button';
        row.addEventListener('click', () => open({ date, item: it }));
      }
      row.textContent = `${it.time ? `${it.time} ` : ''}${it.source === 'todo' ? '☐ ' : ''}${it.title}`;
      if (it.color) row.style.setProperty('--gc', it.color);
      if (TEACHER && it.source === 'google') {
        const wrap = el('div', 'd-dday-wrap');
        wrap.append(row, ddayBtn(`google:${it.calendarId}:${it.eventId}`, it.title, it.date));
        box.append(wrap);
      } else box.append(row);
    }
    if (!items.length) box.append(el('p', 'muted small', '이날은 일정이 없어요.'));
  }

  // 배포판 D-day ☆: 누르면 위쪽 띠에 "제목 D-12". 일정 날짜를 바꾸면 D-day 도 따라감
  function ddayBtn(ref, title, date) {
    const on = (state.data.settings?.ddays || []).some((d) => d.ref === ref);
    const b = el('button', `d-dday${on ? ' on' : ''}`, on ? '★' : '☆');
    b.type = 'button';
    b.title = on ? 'D-day 끄기' : 'D-day 로 위쪽 띠에 보이기';
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', `${title} D-day`);
    b.addEventListener('click', async (e) => {
      e.stopPropagation();
      b.disabled = true;
      try {
        await api('PUT', '/api/settings/dday', { ref, title, date });
      } catch (err) {
        $('d-msg').textContent = err.message;
      }
      b.disabled = false;
    });
    return b;
  }

  // 할 일 한 줄: ☐ 누르면 완료, 제목을 누르면 고치기(제목·마감일), × 두 번 누르면 지움
  // 고치는 중에 다른 곳의 변경으로 목록이 다시 그려져도 적던 내용이 남도록 editing 에 둔다
  let editing = null; // { id, rev, title, due, saving }
  let justDone = null; // 방금 끝낸 할 일: 다시 그릴 때 한 번만 체크·줄긋기 움직임
  function todoRow(it, date) {
    if (editing && editing.id === it.todoId) return todoEditRow(it, date);
    const row = el('div', `d-item chip todo d-todo-row${it.done ? ' done' : ''}`);
    if (it.done && justDone === it.todoId) { row.classList.add('just-done'); justDone = null; }
    // ☐ 누르면 끝냄(취소선으로 남음), ☑ 누르면 다시 안 끝낸 일로
    const done = el('button', 'd-todo-done', it.done ? '☑' : '☐');
    done.type = 'button';
    done.title = it.done ? '안 끝낸 일로 되돌리기' : '끝냄';
    done.setAttribute('aria-label', `${it.title} ${it.done ? '되돌리기' : '끝냄'}`);
    done.setAttribute('aria-pressed', String(Boolean(it.done)));
    done.addEventListener('click', async () => {
      done.disabled = true;
      try {
        if (!it.done) justDone = it.todoId;
        const r = await api('PATCH', `/api/todos/${it.todoId}`, { done: !it.done });
        // 다른 기기가 먼저 같은 상태로 바꿔 둔 경우: 바뀐 알림이 오지 않으니 직접 다시 그림
        if (r?.unchanged) { done.disabled = false; if ($('day-dialog').open && cur?.date) renderDayList(cur.date); }
      } catch (err) { justDone = null; $('d-msg').textContent = err.message; done.disabled = false; }
    });
    const title = el('button', 'd-todo-title', it.title);
    title.type = 'button';
    title.title = '눌러서 고치기';
    title.addEventListener('click', () => {
      editing = { id: it.todoId, rev: it.rev, title: it.title, due: date };
      renderDayList(date);
      document.querySelector('.d-todo-edit input')?.focus();
    });
    const del = el('button', 'd-todo-del', '×');
    del.type = 'button';
    del.setAttribute('aria-label', `${it.title} 지우기`);
    del.addEventListener('click', async () => {
      if (del.dataset.armed !== '1') { del.dataset.armed = '1'; del.textContent = '지우기?'; setTimeout(() => { del.dataset.armed = ''; del.textContent = '×'; }, 3000); return; }
      try { await api('DELETE', `/api/todos/${it.todoId}?rev=${encodeURIComponent(it.rev)}`); } catch (err) { $('d-msg').textContent = err.message; }
    });
    row.append(done, title, ...(TEACHER && !it.done ? [ddayBtn(`todo:${it.todoId}`, it.title, date)] : []), del);
    return row;
  }
  function todoEditRow(it, date) {
    const ed = editing;
    const row = el('div', 'd-item chip todo d-todo-edit');
    const t = el('input');
    t.value = ed.title;
    t.maxLength = 200;
    t.setAttribute('aria-label', '할 일');
    t.addEventListener('input', () => { ed.title = t.value; });
    const d = el('input');
    d.type = 'date';
    d.value = ed.due;
    d.setAttribute('aria-label', '마감일');
    d.addEventListener('input', () => { ed.due = d.value; });
    const save = el('button', 'small-btn', '저장');
    save.type = 'button';
    const cancel = el('button', 'ghost small-btn', '취소');
    cancel.type = 'button';
    const stop = () => { if (editing === ed) editing = null; renderDayList(cur?.date || date); };
    cancel.addEventListener('click', stop);
    save.addEventListener('click', async () => {
      if (ed.saving) return;
      const title = ed.title.trim();
      if (!title) { $('d-msg').textContent = '할 일을 적어 주세요.'; return; }
      if (!ed.due) { $('d-msg').textContent = '마감일을 골라 주세요.'; return; }
      ed.saving = true;
      save.disabled = true;
      $('d-msg').textContent = '';
      try {
        await api('PATCH', `/api/todos/${ed.id}`, { rev: ed.rev, title, due: ed.due });
        stop();
      } catch (err) {
        // 409: 다른 기기에서 먼저 고침 → 그쪽 내용을 알려 주고, 적던 글은 남겨 둔다 (다시 저장하면 내 것으로)
        if (editing !== ed) return;
        if (err.status === 409 && err.current) {
          ed.rev = err.current.rev;
          $('d-msg').textContent = `다른 기기에서 먼저 "${err.current.title}"(${err.current.due || '마감일 없음'})로 고쳤어요. 내 것으로 바꾸려면 다시 저장을 눌러 주세요.`;
        } else $('d-msg').textContent = err.message;
      } finally {
        ed.saving = false;
        save.disabled = false;
      }
    });
    // 날짜 창 전체가 form 이라 Enter·Escape 를 여기서 잡는다 (안 그러면 창이 제출되거나 닫힘)
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); if (e.target !== cancel) save.click(); else stop(); }
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); stop(); }
    });
    row.append(t, d, save, cancel);
    return row;
  }

  async function open({ date = null, item = null, mode = null } = {}) {
    if (!gstatus) await loadStatus();
    // newId: 새 일정의 id. 응답을 못 받고 다시 눌러도 같은 id라 두 번 생기지 않는다
    const newId = Array.from(crypto.getRandomValues(new Uint8Array(26)), (b) => '0123456789abcdefghijklmnopqrstuv'[b % 32]).join('');
    editing = null;
    cur = { date, item, newId, mode: mode || (item ? 'event' : gstatus?.linked ? 'event' : 'todo') };
    $('d-head').textContent = item ? '일정 고치기' : date ? fmtDate(date) : '할 일 추가';
    $('d-list-wrap').hidden = !date || Boolean(item);
    renderDayList(date);
    $('d-modes').hidden = Boolean(item);
    // 일정 칸
    $('d-title').value = item?.title || '';
    $('d-allday').checked = item ? !item.time : true;
    $('d-start').value = item?.time || '09:00';
    $('d-endtime').value = item?.endTime || '10:00';
    $('d-date').value = item?.date || date || '';
    $('d-end').value = item?.endDate || item?.end || item?.date || date || ''; // 자정에 끝나는 일정은 실제 끝 날짜
    const sel = $('d-cal');
    sel.textContent = '';
    const write = gstatus?.settings?.write || writableCals().find((c) => c.primary)?.id;
    for (const c of writableCals()) {
      const o = el('option', '', c.summary);
      o.value = c.id;
      o.selected = item ? c.id === item.calendarId : c.id === write;
      sel.append(o);
    }
    sel.disabled = Boolean(item); // 다른 달력으로 옮기기는 지원하지 않음
    toggleTime();
    // 할 일 칸
    $('d-todo-title').value = '';
    $('d-todo-due').value = date || '';
    $('d-msg').textContent = '';
    $('day-dialog').showModal();
    setMode(cur.mode);
  }

  function toggleTime() {
    $('d-times').hidden = $('d-allday').checked;
  }
  $('d-allday').addEventListener('change', toggleTime);
  $('d-mode-event').addEventListener('click', () => setMode('event'));
  $('d-mode-todo').addEventListener('click', () => setMode('todo'));
  $('d-cancel').addEventListener('click', () => $('day-dialog').close());
  $('d-connect').addEventListener('click', () => { $('day-dialog').close(); openConnect(); });

  // 저장·지우기는 '보낼 때 열려 있던 창(my)'에만 결과를 반영한다.
  // 기다리는 동안 창을 닫고 다른 날짜 창을 열었으면, 늦게 온 응답이 새 창을 닫거나 글을 지우지 않게.
  $('day-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const my = cur;
    if (!my || my.saving) return;
    my.saving = true;
    $('d-msg').textContent = '';
    try {
      if (my.mode === 'todo') {
        const title = $('d-todo-title').value.trim();
        if (!title) throw new Error('할 일을 적어 주세요.');
        if (!$('d-todo-due').value) throw new Error('마감일을 골라 주세요 (달력에 그 날짜로 보여요).');
        await api('POST', '/api/todos', { title, due: $('d-todo-due').value });
      } else {
        const body = {
          title: $('d-title').value,
          date: $('d-date').value,
          end: $('d-end').value || $('d-date').value,
          allDay: $('d-allday').checked,
          start: $('d-start').value,
          endTime: $('d-endtime').value,
          calendarId: $('d-cal').value || undefined,
        };
        if (my.item) await api('PUT', '/api/google/events', { ...body, calendarId: my.item.calendarId, eventId: my.item.eventId, etag: my.item.etag || undefined });
        else await api('POST', '/api/google/events', { ...body, newId: my.newId });
      }
      if (cur === my) $('day-dialog').close();
    } catch (err) {
      if (cur === my) $('d-msg').textContent = err.message;
    } finally {
      my.saving = false;
    }
  });
  $('d-delete').addEventListener('click', async () => {
    const b = $('d-delete');
    if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = '한 번 더 눌러 지우기'; setTimeout(() => { b.dataset.armed = ''; b.textContent = '지우기'; }, 3000); return; }
    b.dataset.armed = '';
    b.textContent = '지우기';
    const my = cur;
    if (!my?.item || my.saving) return;
    my.saving = true;
    try {
      await api('DELETE', '/api/google/events', { calendarId: my.item.calendarId, eventId: my.item.eventId, etag: my.item.etag || undefined });
      if (cur === my) $('day-dialog').close();
    } catch (err) {
      if (cur === my) $('d-msg').textContent = err.message;
    } finally {
      my.saving = false;
    }
  });
  // 시작 날짜를 바꾸면 끝 날짜가 앞서지 않게
  $('d-date').addEventListener('change', () => { if (!$('d-end').value || $('d-end').value < $('d-date').value) $('d-end').value = $('d-date').value; });

  $('todo-add')?.addEventListener('click', () => open({ mode: 'todo' }));
  // 다른 기기에서(또는 여기서) 할 일이 바뀌면 열린 날짜 창 목록도 새로
  window.Dash.listen('todos', () => { if ($('day-dialog').open && cur?.date && !cur.item) renderDayList(cur.date); });

  // 어디서든 연결·끊기가 되면 버튼 글자도 맞춘다 (로그인 중에 창을 닫았어도)
  if (TEACHER) window.Dash.listen('google', () => { loadStatus(); });
  if (TEACHER) window.Dash.listen('settings', () => { if ($('day-dialog').open && cur?.date && !cur.item) renderDayList(cur.date); });

  window.Dash.dayEdit = { open };
  window.addEventListener('DOMContentLoaded', loadStatus);
})();
