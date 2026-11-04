// 달력 계산 규칙 (화면과 테스트가 같이 쓴다). 날짜는 기기 시간대 기준.
(function (root) {
  const p2 = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const startOfWeek = (d) => addDays(new Date(d.getFullYear(), d.getMonth(), d.getDate()), -d.getDay());
  const fromYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

  // 보이는 날짜 범위. 월간은 그 달이 들어가는 주 전체(일요일 시작).
  function visibleRange(view, cursor) {
    if (view === 'week') {
      const s = startOfWeek(cursor);
      return { start: s, end: addDays(s, 6) };
    }
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    return { start: startOfWeek(first), end: addDays(startOfWeek(last), 6) };
  }

  // 날짜별로 보여 줄 것. 여러 날짜에 걸친 일정(시험 기간)은 범위 안의 날마다 넣는다.
  function itemsByDate(events, todos, from, to) {
    const map = {};
    const put = (date, item) => (map[date] ||= []).push(item);
    for (const e of events || []) {
      const s = e.date > from ? e.date : from;
      const last = e.end < to ? e.end : to;
      const item = {
        source: e.source, title: e.title, detail: e.detail,
        // 구글 일정: 시각·달력 색·고치기에 필요한 것
        time: e.time || null, endTime: e.endTime || null, color: e.color || null, editable: Boolean(e.editable),
        calendarId: e.calendarId, eventId: e.eventId, etag: e.etag || null, date: e.date, end: e.end, endDate: e.endDate || null,
      };
      for (let d = fromYmd(s); ymd(d) <= last; d = addDays(d, 1)) put(ymd(d), item);
    }
    for (const t of todos || []) {
      // 끝낸 일도 지우지 않고 그 날짜에 남긴다 (화면에서 취소선)
      if (t.due && t.due >= from && t.due <= to) put(t.due, { source: 'todo', todoId: t.id, rev: t.rev, title: t.title, done: Boolean(t.done), detail: t.done ? '끝낸 할 일' : '할 일 마감' });
    }
    const order = { exam: 0, school: 1, google: 2, todo: 3 };
    // 종류 순서, 같은 종류 안에서는 종일 일정 먼저, 그다음 시각 순
    for (const k of Object.keys(map)) map[k].sort((a, b) => (order[a.source] ?? 9) - (order[b.source] ?? 9) || Number(Boolean(a.done)) - Number(Boolean(b.done)) || (a.time || '').localeCompare(b.time || ''));
    return map;
  }

  // 주 보기로 바꿀 때 어느 주로 갈지: 보던 달이 이번 달이면 오늘, 아니면 그 달 1일
  function weekCursorFor(cursor, today) {
    if (cursor.getFullYear() === today.getFullYear() && cursor.getMonth() === today.getMonth()) return new Date(today);
    return new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  }

  // 학교 기준 시각(서울). 기기 시간대가 달라도 날짜·교시는 서울로 판단한다.
  // ms: 서버 시계에 맞춘 지금 (Date.now() - clockOffset)
  const SEOUL = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  function seoulParts(ms) {
    const p = Object.fromEntries(SEOUL.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
    const date = `${p.year}-${p.month}-${p.day}`;
    return {
      ymd: date,
      minutes: Number(p.hour) * 60 + Number(p.minute) + Number(p.second) / 60,
      weekday: new Date(Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day))).getUTCDay(),
    };
  }

  const api = { ymd, addDays, startOfWeek, fromYmd, visibleRange, itemsByDate, weekCursorFor, seoulParts };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CalendarLogic = api;
})(typeof window === 'object' ? window : globalThis);
