// 달력(왼쪽 기둥, 작은 칸): 월간 / 주간(날짜별 목록). 마감일 있는 할 일 + 구글 캘린더(source: 'google').
// 학사일정 플래너(학교 행사·시험·공휴일)는 기본으로 꺼져 있음(2026-11-02, PLANNER_ENABLED=1 로 다시 켬).
(() => {
  const { state, api, listen, $, seoul } = window.Dash;
  const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
  // 월간 칸 하나에 보이는 일정 수 (넘으면 +n, 다 보려면 칸을 눌러 날짜 창). 배포판은 달력이 가운데라 크게
  const MAX_CHIPS = window.Dash.edition === 'teacher' ? 4 : 1;

  const L = window.CalendarLogic;
  const { ymd, addDays } = L;
  const todayDate = () => L.fromYmd(seoul().ymd); // 학교 기준(서울) 오늘
  let view = 'month';
  let cursor = todayDate(); // 보고 있는 달/주의 기준일
  let range = null; // { from, to, days, events, errors }
  let loading = null;
  let again = false; // 불러오는 중에 "바뀌었어" 신호가 오면 끝난 뒤 한 번 더
  let lastToday = seoul().ymd;

  const visible = () => L.visibleRange(view, cursor);

  async function load() {
    const { start, end } = visible();
    const from = ymd(start);
    const to = ymd(end);
    const key = `${from}~${to}`;
    if (loading === key) { again = true; return; }
    loading = key;
    again = false;
    try {
      const r = await api('GET', `/api/calendar?from=${from}&to=${to}&google=1`);
      if (loading !== key) return; // 그 사이 다른 달로 넘어감
      range = r;
      $('cal-msg').textContent = r.errors?.length ? `학사일정을 못 불러왔어요: ${r.errors.join(', ')}` : '';
    } catch (err) {
      if (loading !== key) return; // 늦게 온 지난 달의 실패는 무시
      $('cal-msg').textContent = err.message;
    } finally {
      if (loading === key) loading = null;
    }
    render();
    if (again && !loading) { again = false; load(); }
  }

  function itemsByDate(from, to) {
    const ok = range && range.from <= from && range.to >= to;
    return L.itemsByDate(ok ? range.events : [], state.data.todos, from, to);
  }

  function chip(item, date) {
    const c = document.createElement('div');
    c.className = `chip ${item.source}`;
    // 월간 작은 칸에선 제목만 (할 일 표시·시각은 색 띠와 말풍선으로) — 주간 목록에선 다 보여 준다
    c.textContent = view === 'month' ? item.title
      : item.source === 'todo' ? `☐ ${item.title}` : `${item.time ? `${item.time} ` : ''}${item.title}`;
    c.title = [item.time ? `${item.time}${item.endTime ? `–${item.endTime}` : ''}` : '', item.title, item.detail].filter(Boolean).join('\n');
    if (item.color) c.style.setProperty('--gc', item.color);
    // 구글 일정은 눌러서 고치기
    if (item.source === 'google' && item.editable) {
      c.classList.add('editable');
      c.addEventListener('click', (e) => { e.stopPropagation(); window.Dash.dayEdit?.open({ date, item }); });
    }
    return c;
  }

  // 날짜 창이 그날 목록을 보여 줄 때 쓴다
  window.Dash.calendarItems = (date) => itemsByDate(date, date)[date] || [];

  function render() {
    const { start, end } = visible();
    const from = ymd(start);
    const to = ymd(end);
    const today = seoul().ymd;
    const items = itemsByDate(from, to);
    const days = range && range.from <= from && range.to >= to ? range.days : {};

    $('cal-title').textContent = view === 'month'
      ? `${cursor.getFullYear()}년 ${cursor.getMonth() + 1}월`
      : `${start.getMonth() + 1}월 ${start.getDate()}일 – ${end.getMonth() + 1}월 ${end.getDate()}일`;
    $('cal-month').setAttribute('aria-pressed', String(view === 'month'));
    $('cal-week').setAttribute('aria-pressed', String(view === 'week'));

    const grid = $('cal-grid');
    grid.textContent = '';
    grid.className = `cal-grid ${view}`;
    for (const w of WEEK) {
      const h = document.createElement('div');
      h.className = 'cal-dow';
      h.textContent = w;
      grid.append(h);
    }
    for (let d = new Date(start); ymd(d) <= to; d = addDays(d, 1)) {
      const key = ymd(d);
      const info = days[key];
      const cell = document.createElement('div');
      cell.className = 'cal-cell';
      if (view === 'month' && d.getMonth() !== cursor.getMonth()) cell.classList.add('other');
      if (key === today) cell.classList.add('today');
      if (d.getDay() === 0 || info?.type === '공휴일') cell.classList.add('red');
      else if (d.getDay() === 6) cell.classList.add('blue');
      if (info && ['방학', '재량휴업일', '공휴일'].includes(info.type)) cell.classList.add('off');

      const head = document.createElement('div');
      head.className = 'cal-num';
      const num = document.createElement('span');
      num.textContent = view === 'week' ? `${d.getMonth() + 1}/${d.getDate()} ${WEEK[d.getDay()]}` : d.getDate();
      head.append(num);
      const label = info?.name || (info && ['재량휴업일', '방학'].includes(info.type) ? info.type : '');
      if (label) {
        const l = document.createElement('span');
        l.className = 'cal-label';
        l.textContent = label;
        if (info.note) l.title = info.note;
        head.append(l);
      }
      cell.append(head);

      const list = items[key] || [];
      const limit = view === 'month' ? MAX_CHIPS : Infinity;
      for (const item of list.slice(0, limit)) cell.append(chip(item, key));
      if (list.length > limit) {
        const more = document.createElement('div');
        more.className = 'chip more';
        more.textContent = `+${list.length - limit}`;
        more.title = list.slice(limit).map((i) => i.title).join('\n');
        cell.append(more);
      }
      // 칸을 누르면 그날 창 (일정·할 일 추가)
      cell.addEventListener('click', () => window.Dash.dayEdit?.open({ date: key }));
      grid.append(cell);
    }
  }

  function move(step) {
    if (view === 'month') cursor = new Date(cursor.getFullYear(), cursor.getMonth() + step, 1);
    else cursor = addDays(cursor, 7 * step);
    render();
    load();
  }

  $('cal-prev').addEventListener('click', () => move(-1));
  $('cal-next').addEventListener('click', () => move(1));
  $('cal-today').addEventListener('click', () => { cursor = todayDate(); render(); load(); });
  $('cal-month').addEventListener('click', () => { view = 'month'; render(); load(); });
  $('cal-week').addEventListener('click', () => {
    if (view !== 'week') cursor = L.weekCursorFor(cursor, todayDate());
    view = 'week';
    render();
    load();
  });

  // 자정이 지나면: "오늘" 표시를 옮기고, 지난 "이번 달/주"를 보고 있었으면 새 오늘로 넘긴다.
  setInterval(() => {
    const now = seoul().ymd;
    if (now === lastToday) return;
    const wasCurrent = visible().start <= L.fromYmd(lastToday) && L.fromYmd(lastToday) <= visible().end;
    lastToday = now;
    if (wasCurrent) cursor = todayDate();
    render();
    load();
  }, 60e3);

  listen('todos', render); // 할 일 마감이 바뀌면 달력도
  listen('google', () => { if (state.data.google?.changedAt) load(); }); // 어느 기기에서든 구글 일정을 바꾸면
  // 폰 등 다른 곳에서 바꾼 구글 일정도 2분 안에 보이게
  setInterval(() => document.visibilityState === 'visible' && load(), 2 * 60e3);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') load(); });

  render();
  window.addEventListener('DOMContentLoaded', load);
})();
