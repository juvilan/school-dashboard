// 배포판(선생님용) 전용: 설정 창(학교·업무포털), 처음 실행 안내. 바로가기·검색은 맨 위 줄(cards/golinks.js).
(() => {
  const { state, api, listen, $ } = window.Dash;
  if (window.Dash.edition !== 'teacher') return;

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const S = () => state.data.settings || { school: null, office: '', neis: '', portal: { url: '', auto: false }, links: [], search: 'naver' };
  // 나이스 교육청 코드 (lib/settings.js 의 OFFICES 와 같은 순서)
  const OFFICES = [['B10', '서울'], ['C10', '부산'], ['D10', '대구'], ['E10', '인천'], ['F10', '광주'], ['G10', '대전'], ['H10', '울산'], ['I10', '세종'],
    ['J10', '경기'], ['K10', '강원'], ['M10', '충북'], ['N10', '충남'], ['P10', '전북'], ['Q10', '전남'], ['R10', '경북'], ['S10', '경남'], ['T10', '제주']];

  // ---- 배치: 달력을 가운데 칸 맨 위로 (바로가기는 맨 위 줄, cards/golinks.js) ----
  {
    const cal = $('card-cal');
    cal.parentNode.parentNode.querySelector('.col-main').prepend(cal);
    cal.classList.add('cal-big');
  }
  // 창 제목은 학교 이름으로
  function renderTitle() {
    const s = S();
    document.title = s.school ? `${s.school.name} 대시보드` : '학교 대시보드';
    document.querySelector('header h1').textContent = document.title;
  }

  // ---- 설정 창 ----
  const tmsg = (t) => { $('t-msg').textContent = t || ''; };
  function renderSettings() {
    const s = S();
    $('t-first').hidden = Boolean(s.office);
    $('t-office').value = s.office || '';
    $('t-school-now').textContent = s.school ? `지금: ${s.school.name} (${s.school.officeName}) · ${s.school.address}` : '아직 고르지 않았어요.';
    if (document.activeElement !== $('t-portal')) $('t-portal').value = s.portal.url;
  }
  function openSettings() {
    renderSettings();
    tmsg('');
    $('t-settings').showModal();
    if (!S().office) $('t-office').focus();
  }
  for (const [code, name] of OFFICES) $('t-office').append(new Option(`${name}교육청`, code));
  $('t-office').addEventListener('change', async () => {
    const code = $('t-office').value;
    if (!code) return;
    const had = S().school;
    tmsg('저장하는 중…');
    try {
      const r = await api('PUT', '/api/settings/office', { office: code });
      tmsg(had && !r.school ? `${r.officeName}교육청으로 정했어요. 다른 교육청이라 골라 둔 학교는 지웠어요.` : `${r.officeName}교육청으로 정했어요.`);
      window.Dash.refreshToday?.();
    } catch (err) {
      tmsg(err.message);
    }
  });
  $('t-open').addEventListener('click', openSettings);
  window.Dash.openSettings = openSettings; // 시작하기(start.js)에서
  $('t-close').addEventListener('click', () => $('t-settings').close());

  $('t-school-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await new Promise((r) => setTimeout(r, 30)); // 한글 조합 중 Enter: 마지막 글자가 들어간 뒤에 읽는다
    const list = $('t-school-list');
    list.textContent = '';
    tmsg('찾는 중…');
    try {
      const { schools } = await api('GET', `/api/schools?q=${encodeURIComponent($('t-school-q').value)}`);
      tmsg(schools.length ? '' : '찾는 학교가 없어요. 이름을 조금 다르게 적어 보세요.');
      if (schools.length >= 5) tmsg('비슷한 이름이 많으면 5곳까지만 보여요. 학교 이름을 더 정확히 적어 보세요.');
      for (const sc of schools) {
        const li = el('li');
        const b = el('button', 'ghost t-school-pick');
        b.type = 'button';
        b.append(el('strong', '', sc.name), el('span', 'muted small', ` ${sc.officeName} · ${sc.address}`));
        b.addEventListener('click', async () => {
          tmsg('저장하는 중…');
          try {
            await api('PUT', '/api/settings/school', { school: sc });
            list.textContent = '';
            $('t-school-q').value = '';
            tmsg(`${sc.name}(으)로 정했어요.`);
            window.Dash.refreshToday?.();
          } catch (err) {
            tmsg(err.message);
          }
        });
        li.append(b);
        list.append(li);
      }
    } catch (err) {
      tmsg(err.message);
    }
  });

  $('t-portal-save').addEventListener('click', async () => {
    try {
      await api('PUT', '/api/settings/portal', { url: $('t-portal').value.trim() });
      tmsg('저장했어요.');
    } catch (err) {
      tmsg(err.message);
    }
  });

  // 처음(학교를 아직 안 골랐을 때) 한 번 설정 창을 연다
  let asked = false;
  listen('settings', () => {
    renderTitle();
    if ($('t-settings').open) renderSettings();
    // 시작하기 안내(웹판)가 뜨면 그쪽에서 연다
    if (!asked && state.data.settings && !state.data.settings.office) { asked = true; if (!window.Dash.startGuide?.isNew()) openSettings(); }
  });
})();
