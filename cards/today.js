// 오늘 띠: 날짜, 날씨, 오늘이 무슨 날인지, 다음 시험까지, 급식.
// 바깥 자료라 실시간 연결이 아니라 10분마다(그리고 화면이 다시 보일 때) 서버에 물어본다.
(() => {
  const { api, $, seoul } = window.Dash;
  let data = null;
  let loadedDate = null;
  let loadError = null; // 마지막 불러오기 실패 (성공하면 지움)

  const localDate = () => seoul().ymd; // 학교 기준(서울) 오늘
  const daysBetween = (a, b) => Math.round((new Date(`${b}T00:00:00`) - new Date(`${a}T00:00:00`)) / 86400e3);

  function text(el, value) {
    el.textContent = '';
    if (typeof value === 'string') el.textContent = value;
    else if (value) el.append(...value);
  }

  function span(t, cls) {
    const s = document.createElement('span');
    if (cls) s.className = cls;
    s.textContent = t;
    return s;
  }

  // 배포판 D-day: 학사일정의 다음 시험(나이스) + 달력에서 ☆ 로 고른 일정·할 일 (가까운 것부터 2개)
  const TEACHER = window.Dash.edition === 'teacher';
  let autoExam = null; // { title, start, end }
  function renderDdays() {
    const now = localDate();
    const starred = (window.Dash.state.data.settings?.ddays || []).filter((d) => d.date >= now);
    const exam = autoExam && autoExam.end >= now && !starred.some((d) => d.title === autoExam.title)
      ? [{ title: autoExam.title, date: autoExam.start > now ? autoExam.start : now, during: autoExam.start <= now }] : [];
    const list = [...exam, ...starred].sort((a, b) => a.date.localeCompare(b.date));
    const parts = [];
    for (const d of list.slice(0, 2)) {
      const n = daysBetween(now, d.date);
      if (parts.length) parts.push(span(' · ', 'muted'));
      parts.push(span(d.title, 'muted'), span(` ${d.during ? '시험 기간' : n === 0 ? 'D-day' : `D-${n}`}`, n <= 7 ? 'dday soon' : 'dday'));
    }
    if (list.length > 2) parts.push(span(` +${list.length - 2}`, 'muted'));
    text($('strip-exam'), parts);
    $('strip-exam').title = list.map((d) => `${d.title} ${d.date}`).join('\n');
    $('strip-exam').hidden = !list.length;
  }
  if (TEACHER) window.Dash.listen('settings', () => renderDdays());

  // 지금 시각 (윈도우 작업표시줄 시계처럼 "오후 2:35"). 분이 바뀌는 순간에 맞춰 고친다
  const clockFmt = new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Seoul' });
  function clock() {
    const t = Date.now() - (window.Dash.state.clockOffset || 0);
    $('strip-clock').textContent = clockFmt.format(t);
    setTimeout(clock, 60000 - (t % 60000) + 50);
  }
  clock();
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') $('strip-clock').textContent = clockFmt.format(Date.now() - (window.Dash.state.clockOffset || 0)); });

  function render() {
    $('strip-date').textContent = window.CalendarLogic.fromYmd(localDate()).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
    const errs = [...(data?.errors || [])];
    if (loadError) errs.push(`서버: ${loadError}`);
    const stale = data && data.date !== localDate();
    if (stale) errs.push('어제 정보예요. 새로 불러오지 못했어요.');
    // 못 불러온 것이 있으면 띠에 ⚠ 를 보이고, 누르면 무엇인지 보여 준다 (터치 기기에서도 보이게)
    $('strip-warn').hidden = errs.length === 0;
    $('strip-warn').textContent = errs.length ? `⚠ ${errs.length}` : '';
    $('strip-warn').dataset.detail = errs.join('\n');
    if (!data) return;
    if (data.needSetup) {
      // 배포판 처음: 학교를 고르기 전
      text($('strip-weather'), [span('설정에서 교육청이나 학교를 고르면 날씨가 보여요', 'muted')]);
      text($('strip-meal'), [span('🍚 학교를 고르면 급식이 보여요', 'muted')]);
      $('strip-daytype').textContent = '';
      text($('strip-exam'), '');
      text($('meal-detail'), [span('오른쪽 위 [설정]에서 학교를 찾으면 오늘 급식(조식·중식·석식)이 여기 보여요.', 'muted')]);
      return;
    }
    if (stale) {
      // 날짜가 바뀌었는데 새 자료가 없으면 지난 날의 급식·일정을 오늘 것처럼 보이지 않는다
      text($('strip-weather'), [span('불러오는 중', 'muted')]);
      $('strip-daytype').textContent = '';
      text($('strip-exam'), '');
      text($('strip-meal'), [span('🍚 불러오는 중', 'muted')]);
      text($('meal-detail'), [span('불러오는 중…', 'muted')]);
      return;
    }

    const w = data.weather;
    if (w && w.temp !== null) {
      const parts = [span(`${w.icon} ${w.temp}°`, 'big')];
      const sub = [w.text, w.max !== null && w.min !== null ? `${w.min}°/${w.max}°` : '', w.rain !== null ? `비 ${w.rain}%` : ''].filter(Boolean).join(' · ');
      parts.push(span(sub, 'muted'));
      text($('strip-weather'), parts);
    } else {
      text($('strip-weather'), [span('날씨 정보 없음', 'muted')]);
    }

    const sc = data.school || {};
    const day = sc.day;
    const dayBits = [];
    if (day) dayBits.push(day.name || day.type);
    if (day?.note) dayBits.push(day.note);
    for (const e of sc.events || []) dayBits.push(e.title);
    $('strip-daytype').textContent = dayBits.length ? ` · ${dayBits.join(' · ')}` : '';
    $('strip-daytype').classList.toggle('off', Boolean(day && day.type !== '수업일'));

    if (TEACHER) {
      autoExam = sc.nextExam || null;
      renderDdays();
    } else if (sc.nextExam) {
      const d = daysBetween(data.date, sc.nextExam.start);
      const label = d > 0 ? `D-${d}` : sc.nextExam.end >= data.date ? '시험 기간' : '';
      text($('strip-exam'), [span(sc.nextExam.title, 'muted'), span(` ${label}`, d <= 7 ? 'dday soon' : 'dday')]);
    } else {
      text($('strip-exam'), '');
    }
    if (!TEACHER) $('strip-exam').hidden = !sc.nextExam;

    const lunch = data.meal?.lunch;
    if (data.noSchool) {
      text($('strip-meal'), [span('🍚 설정에서 학교를 찾으면 급식이 보여요', 'muted')]);
    } else if (data.meal === null) {
      text($('strip-meal'), [span('🍚 급식을 못 불러왔어요', 'warn')]);
    } else if (lunch?.length) {
      text($('strip-meal'), [span('🍚 ', ''), span(lunch.slice(0, 6).map((m) => m.name).join(' · ') + (lunch.length > 6 ? ' …' : ''), '')]);
    } else {
      text($('strip-meal'), [span('🍚 오늘 급식 없음', 'muted')]);
    }
    renderMealDetail();
  }

  function renderMealDetail() {
    const box = $('meal-detail');
    box.textContent = '';
    const m = data?.meal || {};
    for (const [key, label] of [['breakfast', '조식'], ['lunch', '중식'], ['dinner', '석식']]) {
      if (!m[key]?.length) continue;
      const row = document.createElement('div');
      row.append(span(`${label} `, 'muted'));
      for (const item of m[key]) {
        const s = span(item.name, 'dish');
        if (item.allergy) s.title = `알레르기 ${item.allergy}`;
        row.append(s);
      }
      box.append(row);
    }
    if (!box.childElementCount) box.append(span(data?.meal === null ? '급식 정보를 못 불러왔어요.' : '오늘은 급식 정보가 없어요.', 'muted'));
  }

  async function load() {
    try {
      data = await api('GET', '/api/today');
      loadedDate = data.date;
      loadError = null;
    } catch (err) {
      loadError = err.message;
    }
    render();
  }

  $('strip-warn').addEventListener('click', () => {
    const msg = $('strip-warn-msg');
    msg.hidden = !msg.hidden;
    msg.textContent = `못 불러온 정보: ${($('strip-warn').dataset.detail || '').replaceAll('\n', ' / ')}`;
  });


  // 10분마다, 그리고 날짜가 바뀌었으면 바로
  setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    if (loadedDate !== localDate()) load();
  }, 60e3);
  setInterval(() => document.visibilityState === 'visible' && load(), 10 * 60e3);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && loadedDate !== localDate()) load();
  });

  render();
  window.Dash.refreshToday = load; // 배포판: 학교를 바꾸면 바로 다시
  window.addEventListener('DOMContentLoaded', load);
})();
