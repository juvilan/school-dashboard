// 수업 메모 창: 시간표 칸(날짜 × 교시)을 누르면 열린다. 수행평가·결석·특이사항 같은 기록.
// 저장할 때 연 순간의 rev 를 보낸다. 다른 기기가 먼저 고쳤으면(409) 내 글은 그대로 두고 그쪽 내용을 보여 준다
// → 다시 저장하면 내 글로 덮는다. 닫거나 Esc 를 누르면 쓴 내용은 저장하고 닫는다(저장에 실패하면 창을 닫지 않음).
// 그래도 저장 못 한 채 닫히면(브라우저가 Esc 두 번에 강제로 닫는 경우 등) 이 탭에 글을 남겨 두고 다시 열 때 되살린다.
(() => {
  const { api, listen, $ } = window.Dash;
  const C = window.CalendarLogic;
  const DOW = ['일', '월', '화', '수', '목', '금', '토'];
  const dlg = $('ttn-dialog');
  const body = $('ttn-body');
  let cur = null; // { date, period, lesson, rev, original }
  let saving = false;
  let delArmed = false;
  let delTimer = null;
  const drafts = new Map(); // 저장 못 하고 닫힌 글: 'date|period' -> 글

  const msg = (t) => { $('ttn-msg').textContent = t || ''; };
  const find = (date, period) => window.TtNotesStore?.get(date, period) || null;
  const key = (c) => `${c.date}|${c.period}`;
  const lessonText = (l) => (l?.subject ? `${l.subject}${l.klass ? ` · ${l.klass}` : ''}` : '');
  const dirty = () => cur && body.value.replace(/\s+$/, '') !== cur.original;

  function disarm() {
    delArmed = false;
    clearTimeout(delTimer);
    $('ttn-delete').textContent = '지우기';
    $('ttn-delete').classList.remove('armed');
  }

  function open({ date, period, lesson, time }) {
    const note = find(date, period);
    const d = C.fromYmd(date);
    cur = { date, period, lesson, rev: note?.rev || 0, original: note?.body || '' };
    $('ttn-title').textContent = `${d.getMonth() + 1}월 ${d.getDate()}일 (${DOW[d.getDay()]}) ${period}교시 · ${time}`;
    const now = lessonText(lesson);
    const then = note ? lessonText(note) : '';
    $('ttn-lesson').textContent = [now || '수업 없음', then && then !== now ? `메모를 적을 때 수업: ${then}` : ''].filter(Boolean).join(' · ');
    body.value = note?.body || '';
    $('ttn-conflict').hidden = true;
    $('ttn-delete').hidden = !note;
    disarm();
    msg('');
    const draft = drafts.get(key(cur));
    if (draft !== undefined && draft !== body.value) {
      body.value = draft;
      msg('저장하지 못한 글을 되살렸어요. [저장]을 누르면 저장돼요.');
    }
    dlg.showModal();
    body.focus();
    body.setSelectionRange(body.value.length, body.value.length);
  }

  // 저장. 성공하면 true
  async function save(text = body.value) {
    if (!cur || saving) return false;
    saving = true;
    $('ttn-save').disabled = true;
    try {
      const c = cur;
      const l = c.lesson || {};
      const r = await api('PUT', '/api/timetable/note', { date: c.date, period: c.period, body: text, rev: c.rev, subject: l.subject || '', klass: l.klass || '' });
      c.rev = r.note?.rev || 0;
      c.original = r.note?.body || '';
      if (drafts.get(key(c)) === c.original) drafts.delete(key(c)); // 보관한 글이 방금 저장된 글과 같을 때만
      $('ttn-conflict').hidden = true;
      $('ttn-delete').hidden = !r.note;
      msg('');
      return true;
    } catch (err) {
      if (err.status === 409) {
        // 내 글은 그대로 두고 그쪽 내용을 보여 준다. 다시 저장하면 내 글로 덮는다.
        cur.rev = err.current?.rev || 0;
        $('ttn-other').textContent = err.current?.body || '(그쪽에서 지웠어요)';
        $('ttn-conflict').hidden = false;
      }
      msg(err.message);
      return false;
    } finally {
      saving = false;
      $('ttn-save').disabled = false;
    }
  }

  // 저장하는 사이 더 친 글이 있으면 그것까지 저장하고 닫는다
  async function saveAndClose() {
    if (saving) return;
    for (let i = 0; i < 3 && dirty(); i++) if (!(await save())) return;
    if (dirty()) return;
    cur = null;
    dlg.close();
  }

  $('ttn-form').addEventListener('submit', (e) => { e.preventDefault(); saveAndClose(); });
  body.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); saveAndClose(); }
  });
  $('ttn-close').addEventListener('click', saveAndClose);
  // Esc: 바로 닫지 않고 저장부터 (keydown 에서 막아야 브라우저가 두 번째 Esc 에 강제로 닫지 않는다)
  dlg.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); saveAndClose(); } });
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); saveAndClose(); });
  // 어떻게든 저장 못 한 채 닫혔으면 글을 남겨 둔다
  dlg.addEventListener('close', () => {
    if (cur && dirty()) drafts.set(key(cur), body.value);
    cur = null;
  });
  // 창이 열린 채 다른 기기가 같은 칸을 고쳤고, 나는 아직 안 고쳤으면 새 내용으로 바꿔 보여 준다
  listen('ttnote', () => {
    if (!cur || !dlg.open || dirty()) return;
    const n = find(cur.date, cur.period);
    cur.rev = n?.rev || 0;
    cur.original = n?.body || '';
    body.value = cur.original;
    $('ttn-delete').hidden = !n;
  });

  // 빠른 머리말: 새 줄에 "결석: " 처럼 넣고 그 뒤로 커서
  $('ttn-quick').addEventListener('click', (e) => {
    const tag = e.target.closest('button[data-tag]')?.dataset.tag;
    if (!tag) return;
    const v = body.value;
    const add = `${v && !v.endsWith('\n') ? '\n' : ''}${tag}: `;
    body.value = v + add;
    body.focus();
    body.setSelectionRange(body.value.length, body.value.length);
  });

  // 지우기: 한 번 더 눌러야
  $('ttn-delete').addEventListener('click', async () => {
    if (!delArmed) {
      delArmed = true;
      $('ttn-delete').textContent = '한 번 더';
      $('ttn-delete').classList.add('armed');
      delTimer = setTimeout(disarm, 3000);
      return;
    }
    disarm();
    if (await save('')) { body.value = ''; cur = null; dlg.close(); }
  });

  window.TtNote = { open };
})();
