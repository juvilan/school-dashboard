// 배포판(선생님용) 전용: 바로가기 칸(사이트 버튼 + 검색), 설정 창(학교·업무포털), 처음 실행 안내.
// 바로가기·업무포털은 이 PC 의 기본 브라우저로 연다(/api/open). 안 되면 새 창으로.
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

  async function openUrl(url) {
    try {
      await api('POST', '/api/open', { url });
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  // ---- 배치: 달력을 가운데로, 바로가기는 왼쪽(시간표 아래)으로 ----
  {
    const cal = $('card-cal');
    const go = $('card-go');
    const left = cal.parentNode;
    const main = go.parentNode;
    left.insertBefore(go, cal);
    main.prepend(cal);
    cal.classList.add('cal-big');
  }

  // ---- 위 띠: 업무포털 버튼 ----
  const portalBtn = $('ln-portal');
  portalBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const url = S().portal.url;
    if (url) openUrl(url);
    else openSettings();
  });

  // ---- 바로가기 칸 ----
  const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
  function renderTiles() {
    const box = $('go-tiles');
    box.textContent = '';
    const s = S();
    const all = [
      ...(s.portal.url ? [{ title: '업무포털', url: s.portal.url, portal: true }] : []),
      ...(s.neis ? [{ title: '나이스', url: s.neis, portal: true }] : []),
      ...s.links,
    ];
    for (const l of all) {
      const b = el('button', `go-tile${l.portal ? ' portal' : ''}`);
      b.type = 'button';
      b.title = l.url;
      b.append(el('span', 'go-letter', l.title.slice(0, 1)), el('span', 'go-name', l.title), el('span', 'go-host muted', host(l.url)));
      b.addEventListener('click', () => openUrl(l.url));
      box.append(b);
    }
    if (!all.length) box.append(el('p', 'muted small', '[고치기]를 눌러 자주 가는 사이트를 넣어 주세요.'));
    $('go-engine').value = s.search;
    portalBtn.href = s.portal.url || '#'; // 가운데 클릭 등으로 click 을 거치지 않아도 맞는 곳으로
    portalBtn.title = s.portal.url ? '업무포털 (기본 브라우저로)' : '설정에서 교육청을 고르면 업무포털 주소가 정해져요';
    document.title = s.school ? `${s.school.name} 대시보드` : '학교 대시보드';
    document.querySelector('header h1').textContent = s.school ? `${s.school.name} 대시보드` : '학교 대시보드';
  }

  $('go-search').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('go-q').value.trim();
    if (!q) return;
    const engine = $('go-engine').value;
    const url = engine === 'google' ? `https://www.google.com/search?q=${encodeURIComponent(q)}` : `https://search.naver.com/search.naver?query=${encodeURIComponent(q)}`;
    openUrl(url);
    $('go-q').value = '';
  });
  $('go-engine').addEventListener('change', () => {
    api('PUT', '/api/settings/search', { search: $('go-engine').value }).catch((err) => { $('go-msg').textContent = err.message; });
  });

  // ---- 바로가기 고치기 창 ----
  let draft = [];
  async function saveLinks(next) {
    try {
      await api('PUT', '/api/settings/links', { links: next });
      draft = next;
      $('go-d-msg').textContent = '';
      renderRows();
      return true;
    } catch (err) {
      $('go-d-msg').textContent = err.message;
      return false;
    }
  }
  function renderRows() {
    const box = $('go-rows');
    box.textContent = '';
    draft.forEach((l, i) => {
      const li = el('li', 'go-row');
      li.append(el('strong', '', l.title), el('span', 'muted small go-row-url', l.url));
      const up = el('button', 'ghost small-btn', '↑');
      up.type = 'button';
      up.disabled = i === 0;
      up.setAttribute('aria-label', `${l.title} 위로`);
      up.addEventListener('click', () => { const n = [...draft]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; saveLinks(n); });
      const del = el('button', 'ghost small-btn', '지우기');
      del.type = 'button';
      del.addEventListener('click', () => {
        if (del.dataset.armed !== '1') { del.dataset.armed = '1'; del.textContent = '한 번 더'; del.classList.add('armed'); setTimeout(() => { del.dataset.armed = ''; del.textContent = '지우기'; del.classList.remove('armed'); }, 3000); return; }
        saveLinks(draft.filter((_, j) => j !== i));
      });
      li.append(up, del);
      box.append(li);
    });
    if (!draft.length) box.append(el('li', 'muted small', '아직 없어요. 아래에서 추가해 주세요.'));
  }
  $('go-edit').addEventListener('click', () => {
    draft = [...S().links];
    renderRows();
    $('go-d-msg').textContent = '';
    $('go-dialog').showModal();
    $('go-add-title').focus();
  });
  $('go-close').addEventListener('click', () => $('go-dialog').close());
  $('go-add').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = $('go-add-title').value.trim();
    const url = $('go-add-url').value.trim();
    if (!title || !url) { $('go-d-msg').textContent = '이름과 주소를 모두 적어 주세요.'; return; }
    if (await saveLinks([...draft, { title, url }])) {
      $('go-add-title').value = '';
      $('go-add-url').value = '';
      $('go-add-title').focus();
    }
  });

  // ---- 설정 창 ----
  const tmsg = (t) => { $('t-msg').textContent = t || ''; };
  function renderSettings() {
    const s = S();
    $('t-first').hidden = Boolean(s.office);
    $('t-office').value = s.office || '';
    $('t-school-now').textContent = s.school ? `지금: ${s.school.name} (${s.school.officeName}) · ${s.school.address}` : '아직 고르지 않았어요.';
    if (document.activeElement !== $('t-portal')) $('t-portal').value = s.portal.url;
    if ($('t-portal-auto')) $('t-portal-auto').checked = s.portal.auto; // 웹판에는 없음 (켤 때 같이 열기는 프로그램판만)
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
      await api('PUT', '/api/settings/portal', { url: $('t-portal').value.trim(), auto: Boolean($('t-portal-auto')?.checked) });
      tmsg('저장했어요.');
    } catch (err) {
      tmsg(err.message);
    }
  });

  $('t-quit')?.addEventListener('click', async () => {
    const b = $('t-quit');
    if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = '정말 끌까요? 한 번 더'; setTimeout(() => { b.dataset.armed = ''; b.textContent = '지금 프로그램 끄기'; }, 3000); return; }
    try { await api('POST', '/api/quit'); } catch { /* 이미 꺼지는 중 */ }
    document.body.textContent = '';
    const p = el('p', 'quit-msg', '프로그램을 껐어요. 이 창은 닫아도 돼요.');
    document.body.append(p);
    setTimeout(() => window.close(), 800);
  });

  // 처음(학교를 아직 안 골랐을 때) 한 번 설정 창을 연다
  let asked = false;
  listen('settings', () => {
    renderTiles();
    if ($('t-settings').open) renderSettings();
    if (!asked && state.data.settings && !state.data.settings.office) { asked = true; openSettings(); }
  });
})();
