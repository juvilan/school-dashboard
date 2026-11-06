// 오늘 나이스와 다른 수업 (웹판): 하루 한 번 나이스 반별 시간표를 받아, 내 기본 수업 칸과 과목이 다르면 알린다.
// 보강·교체가 나이스에는 들어갔는데 내 시간표에는 안 들어간 경우를 놓치지 않게. 칸에 ⚠ + 카드 아래 한 줄.
// 고치는 것은 선생님이 한다 (칸을 눌러 그날만 바꾸기). 확인하면 [괜찮아요]로 오늘은 숨긴다.
(() => {
  const { state, api, listen, $, seoul } = window.Dash;
  const box = $('tt-neis-warn');
  const L = window.TimetableLogic;
  if (!box || !L?.neisDiff) return;
  const ls = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* 이번만 */ } },
  };
  const DOW = ['일', '월', '화', '수', '목', '금', '토'];
  let got = null; // { key: 학교|날짜, rows }
  let loading = '';
  let retryAt = 0; // 받기에 실패하면 잠시 뒤 다시
  let shownKey = '';

  const todayKey = () => {
    const school = state.data.settings?.school;
    return school?.code ? `${school.code}|${seoul().ymd}` : '';
  };

  async function load() {
    show(); // 날짜·학교가 바뀌었으면 받기 전에(인터넷이 없어도) 지난 경고부터 지운다
    const key = todayKey();
    const day = seoul().ymd;
    const wd = new Date(`${day}T00:00:00Z`).getUTCDay();
    if (!key || wd === 0 || wd === 6) { show(); return; } // 학교를 안 골랐거나 주말: 받지 않고 표시만 지움
    if (got?.key === key || loading === key || !navigator.onLine || Date.now() < retryAt) return;
    loading = key;
    try {
      const r = await api('GET', `/api/neis/timetable?from=${day}&to=${day}`);
      if (todayKey() === key) got = { key, rows: Array.isArray(r?.rows) ? r.rows : [] };
    } catch {
      retryAt = Date.now() + 5 * 60 * 1000; // 나이스가 안 되면 조용히 넘어가고 5분 뒤 다시
    } finally {
      if (loading === key) loading = '';
    }
    show();
  }

  function show() {
    const tt = state.data.timetable;
    const key = todayKey();
    const day = seoul().ymd;
    const wd = new Date(`${day}T00:00:00Z`).getUTCDay();
    let diffs = [];
    if (tt && got?.key === key && wd >= 1 && wd <= 5) diffs = L.neisDiff(L.dayLessons(tt, day, wd), got.rows, day);
    const map = new Map(diffs.map((d) => [`${day}|${d.period}`, d.neis.join(', ')]));
    const sig = [...map].join(';');
    const hidden = ls.get('dash-ttcheck-ok') === `${key}|${sig}`;
    const old = window.Dash.ttWarn;
    window.Dash.ttWarn = hidden ? new Map() : map;
    const now = [...window.Dash.ttWarn].join(';');
    if (now !== (old ? [...old].join(';') : '')) window.Dash.ttRender?.();

    box.textContent = '';
    box.hidden = hidden || !diffs.length;
    if (box.hidden) return;
    shownKey = `${key}|${sig}`;
    box.append(`⚠ 오늘(${DOW[wd]}) 나이스와 다른 수업: `);
    box.append(diffs.map((d) => `${d.period}교시 ${d.mine.klass} ${d.mine.subject} → 나이스 ${d.neis.join(', ')}`).join(' · '));
    box.append(' — 보강·교체면 그 칸을 편집에서 "이 날만" 바꿔 주세요. ');
    const ok = document.createElement('button');
    ok.type = 'button';
    ok.className = 'ghost small-btn';
    ok.textContent = '괜찮아요';
    ok.addEventListener('click', () => { ls.set('dash-ttcheck-ok', shownKey); show(); });
    box.append(ok);
  }

  listen('settings', load);
  listen('timetable', show);
  // 날이 바뀌거나 다시 연결되면 다시 받는다 (켜 둔 채 다음 날이 되어도)
  setInterval(load, 10 * 60 * 1000);
  window.addEventListener('online', load);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) load(); });
})();
