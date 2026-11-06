// 나이스 시간표에서 "내 수업" 고르기 → 기본 시간표 칸 (화면과 테스트가 같이 쓴다).
// 수업 하나 = 학년 + 반(또는 분반) + 과목. 이동수업 학교는 반이 비고 과목 이름 끝에 "2분반" 이 붙는다.
(function (root) {
  const SPLIT = /^(.*?)\s*(\d+)\s*분반$/;
  const MAKEUP = /^\[보강\]/; // 그날만 있는 보강 수업은 고르기 목록에 넣지 않는다
  // 과목 이름 나누기: "미적분Ⅰ2분반" → 미적분Ⅰ + 2분반, "공통영어2_영어A 1반-1" → 공통영어2 + 영어A 1반-1 (수준별 나눔)
  function parts(s) {
    const i = s.indexOf('_');
    if (i > 0) return { base: s.slice(0, i).trim(), ban: '', extra: s.slice(i + 1).trim() };
    const m = SPLIT.exec(s);
    if (m && m[1]) return { base: m[1], ban: m[2], extra: '' };
    return { base: s, ban: '', extra: '' };
  }
  // 고르기 목록의 과목 (분반·수준별 나눔을 떼어 낸 것)
  const subjectOf = (s) => parts(s).base;
  const keyOf = (r) => `${r.track ? `${r.track}|` : ''}${r.grade}|${r.klass}|${r.subject}`;
  // 시간표 칸에 적을 반: "2-3", 분반이면 "2학년 3분반", 수준별이면 "1-1 영어A 1반-1"
  function klassOf(r) {
    const p = parts(r.subject);
    const g = r.grade ? `${r.grade}학년` : '';
    if (r.klass) return [r.grade ? `${r.grade}-${r.klass}` : r.klass, p.extra].filter(Boolean).join(' ');
    if (p.ban) return [g, `${p.ban}분반`].filter(Boolean).join(' ');
    return [g, p.extra].filter(Boolean).join(' ');
  }
  const weekdayOf = (date) => new Date(`${date}T00:00:00Z`).getUTCDay(); // 0 일 ~ 6 토

  // 과목 목록: [{ subject, count(일주일 칸 수 대략) }] 가나다순
  function subjects(rows) {
    const m = new Map();
    for (const r of rows) { if (MAKEUP.test(r.subject)) continue; const s = subjectOf(r.subject); m.set(s, (m.get(s) || 0) + 1); }
    return [...m].map(([subject, count]) => ({ subject, count })).sort((a, b) => a.subject.localeCompare(b.subject, 'ko'));
  }

  // 고른 과목들의 수업(학년·반·분반) 목록: [{ key, subject, label, grade, hours }] 학년·반 순
  function offerings(rows, pickedSubjects) {
    const want = new Set(pickedSubjects);
    const tracks = new Set(rows.map((r) => r.track || ''));
    const m = new Map();
    for (const r of rows) {
      const s = subjectOf(r.subject);
      if (!want.has(s) || MAKEUP.test(r.subject)) continue;
      const k = keyOf(r);
      // 과정·학과가 여럿인 학교는 반 앞에 붙여 구별한다
      const label = [tracks.size > 1 ? r.track : '', klassOf(r) || s].filter(Boolean).join(' ');
      if (!m.has(k)) m.set(k, { key: k, subject: s, label, grade: r.grade, klass: r.klass, dates: new Set(), n: 0 });
      const o = m.get(k);
      o.n += 1;
      o.dates.add(r.date);
    }
    const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 999);
    return [...m.values()]
      .map((o) => ({ key: o.key, subject: o.subject, label: o.label, grade: o.grade, hours: o.n }))
      .sort((a, b) => a.subject.localeCompare(b.subject, 'ko') || num(a.grade) - num(b.grade) || a.label.localeCompare(b.label, 'ko', { numeric: true }));
  }

  // 고른 수업들 → 기본 시간표 칸. 요일마다 자료가 있는 첫 날(공휴일 주를 피하려고 2주를 받음)을 쓴다.
  // 결과: { cells: [{ weekday, period, lesson|null }], days(자료 있는 요일 수), conflicts, skipped(교시 넘침) }
  // 자료가 없는 요일은 cells 에 넣지 않는다 (지금 시간표 그대로).
  function toCells(rows, pickedKeys, periodCount) {
    const want = new Set(pickedKeys);
    // 요일마다 쓸 날: 내 수업이 가장 많은 날 → 같으면 학교 전체 수업이 많은 날 → 같으면 이른 날
    // (시험일·한 학년만 있는 날·보강만 있는 날이 대표가 되어 내 수업이 빠지지 않게)
    const score = new Map(); // date → [내 수업 수, 전체 수]
    for (const r of rows) {
      if (MAKEUP.test(r.subject)) continue;
      const wd = weekdayOf(r.date);
      if (wd < 1 || wd > 5) continue;
      if (r.period > periodCount) continue; // 넣을 수 없는 교시는 대표 날 고르기에 세지 않는다
      const sc = score.get(r.date) || [0, 0];
      if (want.has(keyOf(r))) sc[0] += 1;
      sc[1] += 1;
      score.set(r.date, sc);
    }
    const dayOf = new Map(); // weekday → 쓸 날짜
    for (const [date, sc] of [...score].sort((a, b) => a[0].localeCompare(b[0]))) {
      const wd = weekdayOf(date);
      const had = dayOf.get(wd);
      if (!had || sc[0] > score.get(had)[0] || (sc[0] === score.get(had)[0] && sc[1] > score.get(had)[1])) dayOf.set(wd, date);
    }
    const cand = new Map(); // "wd:p" → 그 칸에 들어갈 수 있는 수업들
    const over = new Set(); // 종 시간보다 뒤 교시에 있는 내 수업 (요일·교시), 알려 주기만 함
    for (const r of rows) {
      const wd = weekdayOf(r.date);
      if (!want.has(keyOf(r))) continue;
      if (r.period > periodCount) { if (wd >= 1 && wd <= 5) over.add(`${wd}:${r.period}`); continue; }
      if (dayOf.get(wd) !== r.date) continue;
      const k = `${wd}:${r.period}`;
      const lesson = { subject: subjectOf(r.subject).slice(0, 20), klass: klassOf(r).slice(0, 20), room: (r.room || '').slice(0, 20) }; // 시간표 칸은 20자까지
      if (!cand.has(k)) cand.set(k, new Map());
      cand.get(k).set(`${lesson.subject}\u0000${lesson.klass}\u0000${lesson.room}`, lesson);
    }
    // 같은 칸에 서로 다른 수업이 겹치면: 나이스 행 순서와 상관없이 늘 같은 것(과목·반·교실 순으로 앞선 것)을 넣고 겹침으로 센다
    const slot = new Map();
    let conflicts = 0;
    for (const [k, m] of cand) {
      const keys = [...m.keys()].sort();
      if (keys.length > 1) conflicts += 1;
      slot.set(k, m.get(keys[0]));
    }
    const cells = [];
    for (const wd of [...dayOf.keys()].sort()) {
      for (let p = 1; p <= periodCount; p++) cells.push({ weekday: wd, period: p, lesson: slot.get(`${wd}:${p}`) || null });
    }
    return { cells, days: dayOf.size, conflicts, skipped: over.size };
  }

  // 두 학기가 섞여 오면(학기 경계 주) 늦은 날짜가 속한 학기만 쓴다 → { rows, dropped }
  function oneTerm(rows) {
    const terms = new Set(rows.map((r) => r.term || ''));
    if (terms.size <= 1) return { rows, dropped: 0 };
    const last = rows.reduce((a, r) => (r.date > a.date ? r : a), rows[0]).term || '';
    const keep = rows.filter((r) => (r.term || '') === last);
    return { rows: keep, dropped: rows.length - keep.length };
  }

  const api = { subjectOf, klassOf, subjects, offerings, toCells, oneTerm };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NeisTtLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
