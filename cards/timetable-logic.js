// 시간표 계산 규칙 (화면과 테스트가 같이 쓴다). 날짜는 'YYYY-MM-DD', 시각은 하루 중 분(0~1439).
(function (root) {
  const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));

  // 그날의 교시별 수업. 바뀐 칸이 있으면 그것을, 없으면 기본 시간표를 쓴다.
  // 결과: [{ period, start, end, lesson|null, changed, off }]
  function dayLessons(tt, date, weekday) {
    if (!tt) return [];
    const base = {};
    for (const b of tt.base || []) if (b.weekday === weekday) base[b.period] = b;
    const ov = {};
    for (const o of tt.overrides || []) if (o.date === date) ov[o.period] = o;
    return tt.bells.periods.map((p, i) => {
      const period = i + 1;
      const o = ov[period];
      const b = weekday >= 1 && weekday <= 5 ? base[period] : null;
      let lesson = b ? { subject: b.subject, klass: b.klass, room: b.room } : null;
      if (o) lesson = o.off ? null : { subject: o.subject, klass: o.klass, room: o.room };
      return { period, start: p.start, end: p.end, lesson, changed: Boolean(o), off: Boolean(o?.off) };
    });
  }

  // 지난 칸인가: 지난 날이거나, 오늘이면서 그 교시가 끝났을 때
  function isPast(date, endTime, todayStr, nowMin) {
    if (date < todayStr) return true;
    return date === todayStr && nowMin >= toMin(endTime);
  }

  // 수업이 얼마나 지났나 (0~1). nowMin 은 소수(초 포함)여도 된다.
  function progress(start, end, nowMin) {
    const a = toMin(start);
    const b = toMin(end);
    return Math.min(1, Math.max(0, (nowMin - a) / (b - a)));
  }

  // 지금 어디쯤인가 (오늘 띠에 쓰는 문구의 재료)
  // kind: 'none'(수업 없는 날) | 'before' | 'class' | 'break' | 'lunch' | 'after'
  function nowStatus(tt, lessons, nowMin) {
    if (!lessons.length || !lessons.some((l) => l.lesson)) return { kind: 'none' };
    const nextLesson = (fromMin) => lessons.find((l) => l.lesson && toMin(l.start) >= fromMin) || null;
    const cur = lessons.find((l) => toMin(l.start) <= nowMin && nowMin < toMin(l.end));
    if (cur) return { kind: 'class', at: cur, left: toMin(cur.end) - nowMin, next: nextLesson(toMin(cur.end)) };
    const lastEnd = Math.max(...lessons.filter((l) => l.lesson).map((l) => toMin(l.end)));
    if (nowMin >= lastEnd) return { kind: 'after' };
    const next = nextLesson(nowMin);
    const lunch = tt.bells.lunch;
    if (lunch && toMin(lunch.start) <= nowMin && nowMin < toMin(lunch.end)) return { kind: 'lunch', next, until: next ? toMin(next.start) - nowMin : 0 };
    if (nowMin < toMin(lessons[0].start)) return { kind: 'before', next, until: next ? toMin(next.start) - nowMin : 0 };
    return { kind: 'break', next, until: next ? toMin(next.start) - nowMin : 0 };
  }

  const lessonText = (l) => [l.subject, l.klass].filter(Boolean).join(' ');

  // 오늘 띠 문구
  function stripText(st) {
    switch (st.kind) {
      case 'class': {
        if (st.at.lesson) return `지금 ${st.at.period}교시 ${lessonText(st.at.lesson)} · ${st.left}분 남음`;
        return st.next ? `${st.at.period}교시 공강 · 다음 ${st.next.period}교시 ${lessonText(st.next.lesson)} (${st.next.start})` : '오늘 수업 끝';
      }
      case 'before':
      case 'break':
        return st.next ? `${st.kind === 'before' ? '수업 전' : '쉬는 시간'} · 다음 ${st.next.period}교시 ${lessonText(st.next.lesson)} (${st.next.start})` : '오늘 수업 끝';
      case 'lunch':
        return st.next ? `점심시간 · 다음 ${st.next.period}교시 ${lessonText(st.next.lesson)} (${st.next.start})` : '점심시간';
      case 'after':
        return '오늘 수업 끝';
      default:
        return '오늘 수업 없음';
    }
  }

  // 보여 줄 주의 월요일: 토·일이면 다음 주
  function weekMonday(d) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = x.getDay();
    const shift = day === 0 ? 1 : day === 6 ? 2 : 1 - day;
    x.setDate(x.getDate() + shift);
    return x;
  }

  // ---- 색: 같은 수업(과목+반)은 같은 색 ----
  const COLORS = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9'];
  const colorKey = (l) => `${l.subject}|${l.klass || ''}`;
  function colorFor(tt, lesson) {
    if (!lesson) return null;
    const key = colorKey(lesson);
    if (tt?.colors && COLORS.includes(tt.colors[key])) return tt.colors[key];
    // 직접 고른 색이 없으면 글자로 정해지는 자동 색 (어느 기기에서나 같음)
    let h = 0;
    for (const ch of key) h = (h * 31 + ch.codePointAt(0)) >>> 0;
    return COLORS[h % COLORS.length];
  }

  // ---- 엑셀·한글·나이스에서 복사한 표 붙여넣기 ----
  // 탭으로 칸, 줄바꿈으로 줄. 따옴표로 묶인 칸 안의 줄바꿈("수학\n2-3")도 한 칸으로 읽는다.
  function parseGrid(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;
    const t = String(text).replace(/\r\n?/g, '\n');
    for (let i = 0; i < t.length; i++) {
      const ch = t[i];
      if (quoted) {
        if (ch === '"' && t[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') quoted = false; else cell += ch;
      } else if (ch === '"' && cell === '') quoted = true;
      else if (ch === '\t') { row.push(cell); cell = ''; } else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; } else cell += ch;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    // 앞뒤의 빈 줄만 지운다. 중간의 빈 줄은 "그 교시 수업 없음"이므로 남긴다 (지우면 아래 교시가 올라감)
    const filled = (r) => r.some((c) => c.trim());
    let a = 0;
    let b = rows.length;
    while (a < b && !filled(rows[a])) a++;
    while (b > a && !filled(rows[b - 1])) b--;
    return rows.slice(a, b);
  }

  // 칸 글자 → 수업. "수학 2-3", "수학\n2-3", "2-3 수학"(반이 앞) 모두 받는다. 빈 칸은 null.
  const KLASS_RE = /^(\d{1,2}\s*[-–반]\s*\d{1,2}반?|\d{3,4})$/;
  function cellLesson(text) {
    const parts = String(text).split(/[\s\n]+/).map((x) => x.trim()).filter(Boolean);
    if (!parts.length) return null;
    let klass = '';
    const ki = parts.findIndex((x) => KLASS_RE.test(x));
    if (ki >= 0) klass = parts.splice(ki, 1)[0].replace(/\s+/g, '');
    const subject = parts.shift() || klass;
    if (subject === klass) klass = '';
    const room = parts.join(' ');
    return { subject: subject.slice(0, 20), klass: klass.slice(0, 20), room: room.slice(0, 20) };
  }

  // 표 → 칸 목록. 첫 줄이 요일 머리(월 화 …)면 건너뛰고, 첫 칸이 교시 번호(1, 1교시)면 그 열을 건너뛴다.
  // 결과: { cells: [{ weekday, period, lesson|null }], rows, cols, skipped }
  function gridToCells(grid, periodCount) {
    let g = grid.map((r) => r.slice());
    const DAY = /^(월|화|수|목|금)(요일)?$/;
    if (g.length && g[0].filter((c) => DAY.test(c.trim())).length >= 2) g = g.slice(1);
    const PERIOD = /^\d{1,2}\s*(교시)?(\s*\(?\d{1,2}:\d{2}.*)?$/;
    // 교시 열: 첫 칸이 모두 비었거나 교시 번호이고, 교시 번호가 실제로 하나 이상 있을 때만 (월요일이 빈 표와 구별)
    const first = g.map((r) => (r[0] || '').trim());
    if (first.length && first.every((c) => !c || PERIOD.test(c)) && first.some((c) => PERIOD.test(c))) g = g.map((r) => r.slice(1));
    const cells = [];
    let skipped = 0;
    g.forEach((r, pi) => {
      r.forEach((c, wi) => {
        if (wi > 4 || pi >= periodCount) { if (c.trim()) skipped++; return; }
        cells.push({ weekday: wi + 1, period: pi + 1, lesson: cellLesson(c) });
      });
    });
    return { cells, rows: Math.min(g.length, periodCount), cols: Math.min(Math.max(0, ...g.map((r) => r.length)), 5), skipped };
  }

  // 오늘 내 기본 수업 칸 중, 나이스(반별 시간표)에는 같은 반·교시에 다른 과목이 있는 칸 (보강·교체를 놓치지 않게)
  // lessons: dayLessons 결과, rows: 나이스 행 [{ date, grade, klass, period, subject }].
  // "2-3" 같은 한 반 수업만 본다 (블록·이동 수업은 나이스 반 이름과 맞출 수 없음). 그날만 바꿔 둔 칸은 이미 확인한 것.
  // 결과: [{ period, mine, neis: [과목…] }]
  function neisDiff(lessons, rows, date) {
    // 띄어쓰기·가운뎃점만 다른 것은 같은 과목. 앞뒤가 붙은 것([보강]공통국어2, 수학과제 탐구)은 다른 과목으로 본다
    const squash = (s) => String(s || '').normalize('NFKC').replace(/[\s·.]/g, '').toLowerCase();
    const same = (a, b) => { const x = squash(a); return Boolean(x) && x === squash(b); };
    const out = [];
    for (const s of lessons || []) {
      if (!s.lesson || s.changed || !String(s.lesson.subject || '').trim()) continue;
      const m = /^\s*(\d{1,2})\s*-\s*(\d{1,2})\s*$/.exec(s.lesson.klass || '');
      if (!m) continue;
      const here = (rows || []).filter((r) => r.date === date && Number(r.period) === s.period
        && Number(r.grade) === Number(m[1]) && Number(r.klass) === Number(m[2]));
      if (!here.length || here.some((r) => same(r.subject, s.lesson.subject))) continue;
      out.push({ period: s.period, mine: s.lesson, neis: [...new Set(here.map((r) => r.subject))] });
    }
    return out;
  }

  const api = { neisDiff, colorFor, COLORS, parseGrid, cellLesson, gridToCells, toMin, progress, dayLessons, isPast, nowStatus, stripText, lessonText, weekMonday };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TimetableLogic = api;
})(typeof window === 'object' ? window : globalThis);
