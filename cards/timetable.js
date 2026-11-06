// 내 시간표 카드 (월~금 × 교시) + 오늘 띠의 "지금 N교시".
// 시간이 흐르면 칸이 채워진다: 지금 수업은 흐른 만큼, 끝난 수업은 꽉 차게 (한 주가 지나가는 게 보이게).
// 칸은 자료나 주가 바뀔 때만 새로 만들고, 시간이 흐를 때는 표시(class)만 바꾼다 → 채워지는 움직임이 보인다.
(() => {
  const { state, api, listen, $, seoul } = window.Dash;
  const L = window.TimetableLogic;
  const C = window.CalendarLogic;
  const DOW = ['일', '월', '화', '수', '목', '금', '토'];
  // 학교 특별판이면 "영일고 2026학년도 2학기" 같은 이름 (schooltt.js)
  const schoolTt = document.querySelector('meta[name="school-tt"]')?.content || '';

  const todayDate = () => C.fromYmd(seoul().ymd); // 서울 기준 오늘 (달력 계산용 날짜)
  let monday = L.weekMonday(todayDate());
  let editing = false;
  let days = {}; // 날짜 -> 학사일정 정보 (수업일·방학·공휴일…). 받은 것은 계속 모아 둔다
  const loading = new Set();
  let cells = []; // [{ el, date, end }]
  let dialogCell = null;
  let sel = null; // 편집 중 고른 칸 { weekday, period } — 엑셀처럼 한 번 누르면 고르고, 두 번 누르거나 Enter면 고치기
  let confirmedCount = null; // 교시를 줄이는 저장을 확인한 교시 수
  let bellsOpenedWith = null; // 종 시간 편집을 시작할 때의 교시 수

  const todayStr = () => seoul().ymd;
  const weekDates = () => [0, 1, 2, 3, 4].map((i) => C.ymd(C.addDays(monday, i)));
  const isOffDay = (date) => Boolean(days[date] && days[date].type !== '수업일');
  const msg = (t) => { $('tt-msg').textContent = t || ''; };

  // 이번 주(오늘 띠용)와 보고 있는 주의 학사일정 (방학·공휴일 칸을 흐리게).
  // 주마다 따로 받아 합친다(먼 주로 가도 요청 범위가 커지지 않게). 실패하면 이미 받은 날은 그대로 둔다.
  // 학교를 바꾸면 dayGen 이 오른다: 옛 학교 응답은 버리고, 같은 주도 새로 받는다
  let dayGen = 0;
  async function loadWeek(mon) {
    const from = C.ymd(mon);
    const to = C.ymd(C.addDays(mon, 4));
    const gen = dayGen;
    const key = `${gen}:${from}`;
    if (loading.has(key)) return;
    loading.add(key);
    try {
      const r = await api('GET', `/api/calendar?from=${from}&to=${to}`);
      if (gen !== dayGen) return;
      for (let d = C.fromYmd(from); C.ymd(d) <= to; d = C.addDays(d, 1)) delete days[C.ymd(d)];
      Object.assign(days, r.days || {});
      build();
    } catch {
      /* 모르는 날은 수업일로 본다 (이미 받은 날 정보는 유지) */
    } finally {
      loading.delete(key);
    }
  }
  function loadDays() {
    const real = L.weekMonday(todayDate());
    loadWeek(real);
    if (C.ymd(monday) !== C.ymd(real)) loadWeek(monday);
    loadNotesWeek(monday);
  }

  // ---- 수업 메모 모음: 스냅샷(최근) + 열어 본 지난 주 + 바뀐 칸 하나씩 ----
  const noteMap = new Map(); // 'YYYY-MM-DD|교시' -> 메모
  const noteWeeks = new Set(); // 따로 받아 온 주(월요일)
  // 칸마다 마지막으로 안 버전 (지운 것도 기록). 늦게 온 주 받기 응답이 더 새 변경(지움 포함)을 되돌리지 않게.
  const noteSeen = new Map();
  let noteGen = 0; // 다시 연결할 때마다 바뀜 → 그 전에 보낸 주 받기 응답은 버린다
  const nkey = (date, period) => `${date}|${period}`;
  function syncSnapshotNotes() {
    const nt = state.data.ttnotes;
    if (!nt) return;
    // 다시 연결하면 끊긴 동안 바뀐 것을 모르므로, 따로 받은 주도 다시 받는다
    noteGen += 1;
    noteMap.clear();
    noteWeeks.clear();
    noteSeen.clear();
    for (const n of nt.notes) noteMap.set(nkey(n.date, n.period), n);
    loadNotesWeek(monday);
  }
  async function loadNotesWeek(mon) {
    const nt = state.data.ttnotes;
    const from = C.ymd(mon);
    const to = C.ymd(C.addDays(mon, 4));
    if (!nt || (from >= nt.range.from && to <= nt.range.to) || from > nt.maxDate || noteWeeks.has(from)) return;
    noteWeeks.add(from);
    const gen = noteGen;
    try {
      const r = await api('GET', `/api/timetable/notes?from=${from}&to=${to}`);
      if (gen !== noteGen) return; // 그사이 다시 연결함 (새 스냅샷 뒤에 다시 받는다)
      for (const n of r.notes || []) {
        const k = nkey(n.date, n.period);
        if ((noteSeen.get(k) || 0) >= n.rev) continue; // 이미 더 새 변경을 받음
        noteMap.set(k, n);
      }
      build();
    } catch {
      if (gen === noteGen) noteWeeks.delete(from); // 다음에 다시
    }
  }
  listen('ttnotes', () => { syncSnapshotNotes(); build(); });
  listen('ttnote', () => {
    const d = state.data.ttnote;
    if (!d) return;
    const k = nkey(d.date, d.period);
    noteSeen.set(k, state.version); // 이 변경의 버전 (지운 경우에도)
    if (d.note) noteMap.set(k, d.note);
    else noteMap.delete(k);
    build();
  });
  window.TtNotesStore = { get: (date, period) => noteMap.get(nkey(date, period)) || null };

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // 칸 새로 만들기
  function build() {
    const tt = state.data.timetable;
    const grid = $('tt-grid');
    const hadFocus = grid.contains(document.activeElement); // 다시 그린 뒤 고른 칸으로 커서를 돌려놓을지
    grid.textContent = '';
    cells = [];
    const dates = weekDates();
    const f = C.fromYmd(dates[0]);
    const t = C.fromYmd(dates[4]);
    $('tt-week').textContent = `${f.getMonth() + 1}/${f.getDate()}–${t.getMonth() + 1}/${t.getDate()}`;
    $('card-tt').classList.toggle('editing', editing);
    $('tt-edit').setAttribute('aria-pressed', String(editing));
    $('tt-edit').textContent = editing ? '편집 끝' : '편집';
    $('tt-bells-open').hidden = !editing;
    $('tt-bulk-open').hidden = !editing;
    if ($('tt-neis-open')) $('tt-neis-open').hidden = !tt || (!editing && tt.base.length > 0);
    if ($('tt-school-open')) $('tt-school-open').hidden = !tt || !schoolTt || !window.Dash.schoolTtReady || (!editing && tt.base.length > 0);
    $('tt-copy-all').hidden = !editing;
    if (!editing) { setCopied(null); sel = null; }
    if (!tt) return;

    const n = tt.bells.periods.length;
    grid.style.gridTemplateRows = `auto repeat(${n}, minmax(38px, auto))`;
    grid.append(el('div', 'tt-corner'));
    for (const date of dates) {
      const d = C.fromYmd(date);
      const h = el('div', 'tt-day');
      h.append(el('strong', '', DOW[d.getDay()]), el('span', 'muted', ` ${d.getMonth() + 1}/${d.getDate()}`));
      if (date === todayStr()) h.classList.add('today');
      if (isOffDay(date)) {
        h.classList.add('off');
        h.title = days[date].name || days[date].type;
      }
      grid.append(h);
    }
    const perDay = dates.map((date, i) => L.dayLessons(tt, date, i + 1));
    // 수업 메모 (칸을 누르면 적는다. 편집 중이 아닐 때)
    const nt = state.data.ttnotes;
    const noteOk = (date) => Boolean(nt?.maxDate && date <= nt.maxDate);
    for (let p = 0; p < n; p++) {
      const bell = tt.bells.periods[p];
      const head = el('div', 'tt-period');
      head.append(el('strong', '', String(p + 1)), el('span', 'muted', bell.start));
      grid.append(head);
      dates.forEach((date, i) => {
        const slot = perDay[i][p];
        const c = el('button', 'tt-cell');
        c.type = 'button';
        const outside = tt.range && (date < tt.range.from || date > tt.range.to);
        if (outside) {
          // 바뀐 칸 기록을 보관하지 않는 날: 기본 시간표를 실제 기록처럼 보이지 않게
          c.classList.add('holiday', 'outside');
          if (p === 0) c.textContent = '기록 범위 밖';
        } else if (isOffDay(date)) {
          c.classList.add('holiday');
          if (p === 0) c.textContent = days[date].name || days[date].type;
        } else if (slot.lesson) {
          c.append(el('span', 'tt-sub', slot.lesson.subject));
          if (slot.lesson.klass) c.append(el('span', 'tt-cls', slot.lesson.klass));
          c.title = [`${p + 1}교시 ${bell.start}–${bell.end}`, L.lessonText(slot.lesson), slot.lesson.room, slot.changed ? '이 날만 바뀜' : ''].filter(Boolean).join('\n');
        } else {
          c.classList.add('empty');
          if (slot.off) c.textContent = '없음';
        }
        if (slot.changed) c.classList.add('changed');
        const note = noteMap.get(`${date}|${p + 1}`);
        if (note) {
          c.classList.add('has-note');
          const dot = el('span', 'tt-note-dot');
          dot.setAttribute('aria-hidden', 'true');
          c.append(dot);
          const what = outside || isOffDay(date) ? c.textContent : slot.lesson ? L.lessonText(slot.lesson) : '빈 칸';
          c.setAttribute('aria-label', `${DOW[C.fromYmd(date).getDay()]}요일 ${p + 1}교시 ${what || ''}, 수업 메모 있음`);
          c.title = [c.title, `📝 ${note.body.split('\n')[0].slice(0, 60)}`].filter(Boolean).join('\n');
        }
        if (!editing && noteOk(date)) {
          c.classList.add('tt-notable');
          const lesson = outside || isOffDay(date) ? null : slot.lesson;
          c.addEventListener('click', () => {
            if (!editing) window.TtNote?.open({ date, period: p + 1, lesson, time: `${bell.start}–${bell.end}` });
          });
        }
        if (!outside && !isOffDay(date) && slot.lesson) c.classList.add(`tt-${L.colorFor(tt, slot.lesson)}`);
        const editable = !outside && !isOffDay(date);
        c.dataset.wd = i + 1;
        c.dataset.p = p + 1;
        if (editable) c.classList.add('tt-pick');
        if (editing && sel && sel.weekday === i + 1 && sel.period === p + 1) c.classList.add('sel');
        if (!outside) {
          c.addEventListener('click', () => {
            if (!editing) return;
            if (!editable) { sel = null; showActions(); return openCell(date, i + 1, p + 1); } // 쉬는 날 칸은 그날 수업 넣기만
            select(i + 1, p + 1);
          });
          c.addEventListener('dblclick', () => { if (editing) openCell(date, i + 1, p + 1); });
          // 편집 중 키보드: Enter 고치기, Ctrl/⌘+C 복사, Ctrl/⌘+V 붙이기, Delete 비우기, 방향키 이동
          c.addEventListener('keydown', (e) => {
            if (!editing) return;
            const mod = e.ctrlKey || e.metaKey;
            const k = e.key.toLowerCase();
            // 키를 누른 칸이 고른 칸과 다르면(탭으로 옮겨 온 경우 등) 이 칸을 기준으로
            if (e.key !== 'Enter' && e.key !== 'F2' && !(sel && sel.weekday === i + 1 && sel.period === p + 1)) {
              if (!editable) { sel = null; showActions(); return; }
              select(i + 1, p + 1);
            }
            if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); openCell(date, i + 1, p + 1); }
            else if (mod && k === 'c') { e.preventDefault(); copySel(); }
            else if (mod && k === 'v') { e.preventDefault(); pasteSel(); }
            else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); clearSel(); }
            else if (e.key.startsWith('Arrow')) {
              e.preventDefault();
              const dx = { ArrowLeft: -1, ArrowRight: 1 }[e.key] || 0;
              const dy = { ArrowUp: -1, ArrowDown: 1 }[e.key] || 0;
              const wd = Math.min(5, Math.max(1, i + 1 + dx));
              const pp = Math.min(n, Math.max(1, p + 1 + dy));
              select(wd, pp);
            }
          });
        }
        grid.append(c);
        cells.push({ el: c, date, start: bell.start, end: bell.end });
      });
    }
    if (editing && sel && hadFocus) cellEl(sel.weekday, sel.period)?.focus();
    showActions();
    $('tt-hint').textContent = editing
      ? '칸을 한 번 누르면 골라지고, 두 번 누르거나 Enter면 고쳐요. 고른 칸에서 Ctrl+C·Ctrl+V 복사·붙이기, Delete 비우기, 방향키로 이동.'
      : (tt.base.length ? '' : schoolTt && window.Dash.schoolTtReady
        ? `[학교 시간표에서 가져오기]에 이름과 나이스 개인번호를 넣으면 ${schoolTt} 시간표에서 내 시간표를 찾아 넣어요. 한 번 넣으면 매주 그대로 돌아요.`
        : $('tt-neis-open')
        ? '[나이스에서 가져오기]로 내 수업만 골라 넣거나, 편집을 눌러 직접 넣어 주세요. 한 번 넣으면 매주 그대로 돌아요.'
        : '편집을 눌러 기본 시간표를 넣어 주세요. 한 번 넣으면 매주 그대로 돌아요.');
    tick();
  }

  // 시간이 흐를 때: 칸 채우기, 지금 칸 강조, 오늘 띠 문구
  function tick() {
    const tt = state.data.timetable;
    if (!tt) return;
    const now0 = seoul();
    const today = now0.ymd;
    const m = Math.floor(now0.minutes);
    const sec = now0.minutes - m;
    for (const c of cells) {
      const past = L.isPast(c.date, c.end, today, m);
      const now = c.date === today && L.toMin(c.start) <= m && m < L.toMin(c.end);
      c.el.classList.toggle('past', past);
      c.el.classList.toggle('now', now);
      c.el.style.setProperty('--fill', past ? 1 : now ? L.progress(c.start, c.end, m + sec) : 0);
    }
    const wd = now0.weekday;
    const lessons = wd >= 1 && wd <= 5 && !isOffDay(today) ? L.dayLessons(tt, today, wd) : [];
    const strip = $('strip-period');
    strip.textContent = tt.base.length || tt.overrides.length ? L.stripText(L.nowStatus(tt, lessons, m)) : '시간표 입력 전';
    strip.title = '';
    strip.classList.toggle('muted', !lessons.length);
  }

  // 작은 창(pip.js)이 쓰는 지금 상태: 오늘 수업 목록과 띠 문구 (학사일정의 쉬는 날이면 수업 없음)
  window.Dash.ttNow = () => {
    const tt = state.data.timetable;
    if (!tt) return null;
    const n = seoul();
    const m = Math.floor(n.minutes);
    const lessons = n.weekday >= 1 && n.weekday <= 5 && !isOffDay(n.ymd) ? L.dayLessons(tt, n.ymd, n.weekday) : [];
    const st = L.nowStatus(tt, lessons, m);
    return { lessons, st, minutes: n.minutes, text: tt.base.length || tt.overrides.length ? L.stripText(st) : '시간표 입력 전' };
  };

  // ---- 칸 고치기 ----
  function openCell(date, weekday, period) {
    const tt = state.data.timetable;
    const slot = L.dayLessons(tt, date, weekday)[period - 1];
    const base = tt.base.find((b) => b.weekday === weekday && b.period === period) || null;
    const d = C.fromYmd(date);
    dialogCell = { date, weekday, period, slot, base };
    $('tt-d-title').textContent = `${d.getMonth() + 1}월 ${d.getDate()}일 (${DOW[d.getDay()]}) ${period}교시 · ${slot.start}–${slot.end}`;
    $('tt-d-base').textContent = base ? `기본: ${L.lessonText(base)}${base.room ? ` · ${base.room}` : ''}` : '기본: 비어 있음';
    const fill = slot.lesson || base || { subject: '', klass: '', room: '' };
    $('tt-subject').value = fill.subject;
    $('tt-klass').value = fill.klass;
    $('tt-room').value = fill.room;
    $('tt-scope-week-l').textContent = `매주 ${DOW[d.getDay()]}요일 ${period}교시 (기본 시간표)`;
    $('tt-scope-day-l').textContent = `${d.getMonth() + 1}월 ${d.getDate()}일만`;
    $(slot.changed ? 'tt-scope-day' : 'tt-scope-week').checked = true;
    $('tt-reset').hidden = !slot.changed;
    renderSwatches();
    $('tt-d-msg').textContent = '';
    $('tt-dialog').showModal();
    $('tt-subject').focus();
  }

  async function send(url, body) {
    try {
      // 응답으로 화면을 바로 덮지 않는다: 다른 기기의 더 새 변경을 덮을 수 있다. 바뀐 내용은 실시간(SSE)으로 온다.
      await api('PUT', url, body);
      $('tt-dialog').close();
    } catch (err) {
      $('tt-d-msg').textContent = err.message;
    }
  }

  const lessonInput = () => ({ subject: $('tt-subject').value, klass: $('tt-klass').value, room: $('tt-room').value });

  // ---- 복사·붙이기 (기본 시간표에 넣는다) ----
  let copied = null;
  function setCopied(lesson) {
    copied = lesson && lesson.subject ? { subject: lesson.subject, klass: lesson.klass || '', room: lesson.room || '' } : null;
    $('tt-paste-bar').hidden = !copied;
    if (copied) $('tt-paste-what').textContent = L.lessonText(copied);
    $('card-tt').classList.toggle('pasting', Boolean(copied));
    showActions();
  }
  async function putBase(weekday, period, lesson) {
    try {
      await api('PUT', '/api/timetable/base', { weekday, period, lesson });
      msg('');
    } catch (err) {
      msg(err.message);
    }
  }
  // ---- 고른 칸 ----
  const cellEl = (wd, p) => $('tt-grid').querySelector(`.tt-cell[data-wd="${wd}"][data-p="${p}"]`);
  const selDate = () => weekDates()[sel.weekday - 1];
  function selSlot() {
    const tt = state.data.timetable;
    return L.dayLessons(tt, selDate(), sel.weekday)[sel.period - 1];
  }
  function select(wd, p) {
    sel = { weekday: wd, period: p };
    for (const x of $('tt-grid').querySelectorAll('.tt-cell.sel')) x.classList.remove('sel');
    const c = cellEl(wd, p);
    c?.classList.add('sel');
    c?.focus();
    showActions();
  }
  // 고른 칸이 쉬는 날·기록 범위 밖이면 복사·붙이기·비우기는 하지 않는다
  const selOk = () => sel && cellEl(sel.weekday, sel.period)?.classList.contains('tt-pick');
  function showActions() {
    const on = editing && selOk();
    $('tt-actions').hidden = !on;
    if (!on) return;
    $('tt-act-where').textContent = `${'월화수목금'[sel.weekday - 1]} ${sel.period}교시`;
    $('tt-act-paste').disabled = !copied;
    $('tt-act-copy').disabled = !selSlot()?.lesson;
  }
  function copySel() {
    if (!selOk()) return;
    const l = selSlot()?.lesson;
    if (l) setCopied(l);
  }
  // 그날만 바꾼 칸은 기본 시간표를 바꿔도 화면이 그대로라 막고 알린다
  function blockedChanged() {
    if (!selSlot()?.changed) return false;
    msg('이 날만 따로 바꾼 칸이에요. 두 번 눌러 편집 창에서 고치거나 "기본으로 되돌리기"를 먼저 해 주세요.');
    return true;
  }
  function pasteSel() { if (selOk() && copied && !blockedChanged()) putBase(sel.weekday, sel.period, copied); }
  function clearSel() { if (selOk() && !blockedChanged()) putBase(sel.weekday, sel.period, null); }
  $('tt-act-edit').addEventListener('click', () => { if (sel) openCell(selDate(), sel.weekday, sel.period); });
  $('tt-act-copy').addEventListener('click', copySel);
  $('tt-act-paste').addEventListener('click', pasteSel);
  $('tt-act-clear').addEventListener('click', clearSel);
  $('tt-paste-end').addEventListener('click', () => setCopied(null));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && copied && !document.querySelector('dialog[open]')) setCopied(null); });
  $('tt-copy-one').addEventListener('click', () => {
    if (!$('tt-subject').value.trim()) { $('tt-d-msg').textContent = '과목을 먼저 적어 주세요.'; return; }
    setCopied(lessonInput());
    $('tt-dialog').close();
  });

  // ---- 색: 같은 수업(과목+반) 모두 ----
  function renderSwatches() {
    const box = $('tt-colors');
    box.textContent = '';
    const tt = state.data.timetable;
    const l = lessonInput();
    const has = l.subject.trim();
    const chosen = has ? tt.colors?.[`${l.subject.trim()}|${l.klass.trim()}`] || null : null;
    const auto = has ? L.colorFor({ colors: {} }, { subject: l.subject.trim(), klass: l.klass.trim() }) : null;
    for (const c of [null, ...L.COLORS]) {
      const b = el('button', `tt-swatch ${c ? `tt-${c}` : `tt-auto${auto ? ` tt-${auto}` : ''}`}`, c ? '' : '자동');
      b.type = 'button';
      b.disabled = !has;
      b.setAttribute('aria-pressed', String(chosen === c));
      b.setAttribute('aria-label', c ? `색 ${c.slice(1)}` : '자동 색');
      b.addEventListener('click', async () => {
        try {
          await api('PUT', '/api/timetable/color', { lesson: lessonInput(), color: c });
          $('tt-d-msg').textContent = '';
        } catch (err) {
          $('tt-d-msg').textContent = err.message;
        }
      });
      box.append(b);
    }
  }
  for (const id of ['tt-subject', 'tt-klass']) $(id).addEventListener('input', renderSwatches);
  listen('timetable', () => { if ($('tt-dialog').open) renderSwatches(); });

  // ---- 표 한꺼번에 붙여넣기 (엑셀·한글·나이스) ----
  let bulkParsed = null;
  function bulkPreview() {
    const tt = state.data.timetable;
    const grid = L.parseGrid($('tt-bulk-text').value);
    bulkParsed = L.gridToCells(grid, tt.bells.periods.length);
    const keep = $('tt-bulk-keep').checked;
    const cells = bulkParsed.cells.filter((c) => c.lesson || !keep);
    drawPreview($('tt-bulk-preview'), cells);
    const n = cells.filter((c) => c.lesson).length;
    $('tt-bulk-info').textContent = grid.length
      ? `수업 ${n}칸${keep ? '' : `, 비우는 칸 ${cells.length - n}`}${bulkParsed.skipped ? ` · 넘쳐서 뺀 칸 ${bulkParsed.skipped}` : ''}`
      : '엑셀·한글·나이스 시간표에서 표를 복사해 여기 붙여넣어 주세요.';
    $('tt-bulk-save').disabled = cells.length === 0;
  }
  // 미리 보기 표 (월~금 × 교시). 나이스에서 가져오기(neistt.js)도 쓴다
  function drawPreview(box, cells) {
    const tt = state.data.timetable;
    box.textContent = '';
    box.style.gridTemplateRows = `auto repeat(${tt.bells.periods.length}, auto)`;
    box.append(el('div', ''));
    for (const d of ['월', '화', '수', '목', '금']) box.append(el('div', 'tt-day', d));
    for (let p = 1; p <= tt.bells.periods.length; p++) {
      box.append(el('div', 'tt-period', String(p)));
      for (let w = 1; w <= 5; w++) {
        const c = cells.find((x) => x.weekday === w && x.period === p);
        const cell = el('div', 'tt-cell');
        if (!c) cell.classList.add('empty');
        else if (!c.lesson) { cell.classList.add('empty', 'clear'); cell.textContent = '비움'; } else {
          cell.classList.add(`tt-${L.colorFor(tt, c.lesson)}`);
          cell.append(el('span', 'tt-sub', c.lesson.subject));
          if (c.lesson.klass) cell.append(el('span', 'tt-cls', c.lesson.klass));
        }
        box.append(cell);
      }
    }
  }
  window.Dash.ttPreview = drawPreview;
  $('tt-bulk-open').addEventListener('click', () => {
    $('tt-bulk-text').value = '';
    $('tt-bulk-msg').textContent = '';
    bulkPreview();
    $('tt-bulk').showModal();
    $('tt-bulk-text').focus();
  });
  $('tt-bulk-text').addEventListener('input', bulkPreview);
  $('tt-bulk-keep').addEventListener('change', bulkPreview);
  $('tt-bulk-cancel').addEventListener('click', () => $('tt-bulk').close());
  $('tt-bulk-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const keep = $('tt-bulk-keep').checked;
    const cells = (bulkParsed?.cells || []).filter((c) => c.lesson || !keep);
    if (!cells.length) return;
    try {
      await api('PUT', '/api/timetable/base-many', { cells });
      $('tt-bulk').close();
    } catch (err) {
      $('tt-bulk-msg').textContent = err.message;
    }
  });

  // 기본 시간표를 표로 복사 (엑셀에 바로 붙일 수 있게, 탭·줄바꿈)
  $('tt-copy-all').addEventListener('click', async () => {
    const tt = state.data.timetable;
    const rows = [['', '월', '화', '수', '목', '금'].join('\t')];
    for (let p = 1; p <= tt.bells.periods.length; p++) {
      const r = [`${p}교시`];
      for (let w = 1; w <= 5; w++) {
        const b = tt.base.find((x) => x.weekday === w && x.period === p);
        r.push(b ? L.lessonText(b) : '');
      }
      rows.push(r.join('\t'));
    }
    try {
      await navigator.clipboard.writeText(rows.join('\n'));
      msg('');
      $('tt-copy-all').textContent = '복사됨';
      setTimeout(() => { $('tt-copy-all').textContent = '표 복사'; }, 1500);
    } catch {
      msg('브라우저가 클립보드 쓰기를 막았어요.');
    }
  });

  $('tt-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const c = dialogCell;
    const empty = !$('tt-subject').value.trim();
    if ($('tt-scope-week').checked) {
      send('/api/timetable/base', { weekday: c.weekday, period: c.period, lesson: empty ? null : lessonInput() });
    } else {
      send('/api/timetable/day', { date: c.date, period: c.period, kind: empty ? 'off' : 'lesson', lesson: empty ? undefined : lessonInput() });
    }
  });
  $('tt-dayoff').addEventListener('click', () => send('/api/timetable/day', { date: dialogCell.date, period: dialogCell.period, kind: 'off' }));
  $('tt-reset').addEventListener('click', () => send('/api/timetable/day', { date: dialogCell.date, period: dialogCell.period, kind: 'reset' }));
  $('tt-cancel').addEventListener('click', () => $('tt-dialog').close());

  // ---- 종 시간 ----
  function bellRow(i, p) {
    const row = el('div', 'tt-bell-row');
    row.append(el('span', '', i === 'lunch' ? '점심' : `${i + 1}교시`));
    for (const k of ['start', 'end']) {
      const inp = document.createElement('input');
      inp.type = 'time';
      inp.required = i !== 'lunch';
      inp.value = p?.[k] || '';
      inp.dataset.k = k;
      inp.setAttribute('aria-label', `${i === 'lunch' ? '점심' : `${i + 1}교시`} ${k === 'start' ? '시작' : '끝'}`);
      row.append(inp);
    }
    return row;
  }

  function openBells() {
    const b = state.data.timetable.bells;
    bellsOpenedWith = b.periods.length;
    const box = $('tt-bell-rows');
    box.textContent = '';
    b.periods.forEach((p, i) => box.append(bellRow(i, p)));
    $('tt-bell-lunch').textContent = '';
    $('tt-bell-lunch').append(bellRow('lunch', b.lunch));
    $('tt-b-msg').textContent = '';
    $('tt-bells').showModal();
  }

  $('tt-bell-add').addEventListener('click', () => {
    const box = $('tt-bell-rows');
    if (box.childElementCount >= 10) return;
    box.append(bellRow(box.childElementCount, null));
  });
  $('tt-bell-del').addEventListener('click', () => {
    const box = $('tt-bell-rows');
    if (box.childElementCount > 1) box.lastElementChild.remove();
  });
  $('tt-bells-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const read = (row) => Object.fromEntries([...row.querySelectorAll('input')].map((i) => [i.dataset.k, i.value]));
    const periods = [...$('tt-bell-rows').children].map(read);
    const lunch = read($('tt-bell-lunch').firstElementChild);
    const old = bellsOpenedWith;
    if (periods.length < old && confirmedCount !== periods.length) {
      // 교시를 줄이면 그 교시 칸이 지워진다 → 같은 교시 수로 한 번 더 눌러야 저장
      $('tt-b-msg').textContent = `${periods.length + 1}교시부터 넣은 수업이 지워져요. 맞으면 저장을 한 번 더 눌러 주세요.`;
      confirmedCount = periods.length;
      return;
    }
    try {
      await api('PUT', '/api/timetable/bells', { bells: { periods, lunch: lunch.start && lunch.end ? lunch : null }, expectPeriods: bellsOpenedWith });
      $('tt-bells').close();
    } catch (err) {
      $('tt-b-msg').textContent = err.message;
    }
  });
  $('tt-bells-cancel').addEventListener('click', () => $('tt-bells').close());
  // 어떻게 닫든(Esc 포함) 확인 표시는 지운다
  $('tt-bells').addEventListener('close', () => { confirmedCount = null; });
  $('tt-bells-open').addEventListener('click', openBells);

  // ---- 주 넘기기, 편집 ----
  const moveWeek = (n) => { monday = C.addDays(monday, 7 * n); msg(''); build(); loadDays(); };
  $('tt-prev').addEventListener('click', () => moveWeek(-1));
  $('tt-next').addEventListener('click', () => moveWeek(1));
  $('tt-this').addEventListener('click', () => { monday = L.weekMonday(todayDate()); build(); loadDays(); });
  $('tt-edit').addEventListener('click', () => { editing = !editing; build(); });

  listen('timetable', build);
  // 학교를 바꾸면(배포판) 학사일정(방학·휴업일)을 새로 받는다
  let schoolKey = null;
  listen('settings', () => {
    const sc = window.Dash.state.data.settings?.school;
    const k = sc ? `${sc.office}:${sc.code}` : '';
    if (schoolKey !== null && k !== schoolKey) { dayGen += 1; for (const d of Object.keys(days)) delete days[d]; loadDays(); }
    schoolKey = k;
  });

  // 20초마다 칸 채우기·띠 문구. 날짜가 바뀌어 주말→월요일이 되면 보는 주도 이번 주로.
  let lastDay = todayStr();
  setInterval(() => {
    const now = todayStr();
    if (now !== lastDay) {
      const wasCurrent = C.ymd(monday) === C.ymd(L.weekMonday(C.fromYmd(lastDay)));
      lastDay = now;
      if (wasCurrent) monday = L.weekMonday(todayDate());
      build();
      loadDays();
      return;
    }
    tick();
  }, 20e3);
  setInterval(() => document.visibilityState === 'visible' && loadDays(), 30 * 60e3);
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && tick());

  window.addEventListener('DOMContentLoaded', loadDays);
})();
