// 맨 위 줄: 자주 가는 사이트 바로가기 (개인판·배포판 같이). ✎ 로 고친다. 누르면 새 탭으로.
// 배포판은 교육청을 고르면 업무포털·나이스가 맨 앞에 저절로 붙는다(설정 창에서 바꿈).
(() => {
  const { state, api, listen, $ } = window.Dash;
  const teacher = window.Dash.edition === 'teacher';
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const S = () => state.data.settings || { portal: { url: '' }, neis: '', links: [], search: 'naver' };

  function render() {
    const box = $('go-links');
    box.textContent = '';
    const s = S();
    const all = [
      ...(teacher && s.portal?.url ? [{ title: '업무포털', url: s.portal.url, fixed: true }] : []),
      ...(teacher && s.neis ? [{ title: '나이스', url: s.neis, fixed: true }] : []),
      ...(s.links || []),
    ];
    for (const l of all) {
      const a = el('a', `link-btn${l.fixed ? ' fixed' : ''}`, l.title);
      a.href = l.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.title = l.url;
      box.append(a);
    }
    if (!all.length) box.append(el('span', 'muted small', '✎ 를 눌러 자주 가는 사이트를 넣어 주세요'));
    if (teacher && $('go-engine')) $('go-engine').value = s.search || 'naver';
  }

  // ---- 검색 (배포판) ----
  if ($('go-search')) {
    $('go-search').addEventListener('submit', (e) => {
      e.preventDefault();
      const q = $('go-q').value.trim();
      if (!q) return;
      const url = $('go-engine').value === 'google' ? `https://www.google.com/search?q=${encodeURIComponent(q)}` : `https://search.naver.com/search.naver?query=${encodeURIComponent(q)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      $('go-q').value = '';
    });
    $('go-engine').addEventListener('change', () => {
      api('PUT', '/api/settings/search', { search: $('go-engine').value }).catch(() => { $('go-engine').value = S().search || 'naver'; });
    });
  }

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
      up.setAttribute('aria-label', `${l.title} 앞으로`);
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
    draft = [...(S().links || [])];
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

  // ---- [📁 다운로드]: 윈도우 탐색기로 다운로드 폴더 (크롬이 받는 곳과 같은 폴더) ----
  // 웹페이지는 PC 폴더를 직접 열 수 없어서, 처음 한 번 "sdash-dl:" 주소를 윈도우에 등록한다 (내 계정 HKCU 에만).
  // 등록된 명령은 주소 내용(%1)을 받지 않는다 → 무엇이 와도 다운로드 폴더만 연다.
  const DL_CMD = "powershell -NoProfile -c \"$k='HKCU:\\Software\\Classes\\sdash-dl';$c=$k+'\\shell\\open\\command';ni $c -Force|Out-Null;sp $k '(default)' 'URL:sdash-dl';sp $k 'URL Protocol' '';sp $c '(default)' 'explorer.exe shell:Downloads'\"";
  if (/Windows/i.test(navigator.userAgent)) {
    const dl = $('go-dl');
    dl.hidden = false;
    $('dl-cmd').textContent = DL_CMD;
    // 등록 전에는 크롬이 아무 표시 없이 무시한다 → 창이 그대로면 등록 안내
    // 한 번이라도 탐색기가 열렸으면(창이 뒤로 감) 그다음부터는 안내를 띄우지 않는다
    let ok = false;
    try { ok = localStorage.getItem('dash-dl-ok') === '1'; } catch { /* 모름 */ }
    let waiting = false;
    window.addEventListener('blur', () => {
      if (!waiting) return;
      waiting = false;
      if (!ok) { ok = true; try { localStorage.setItem('dash-dl-ok', '1'); } catch { /* 이번만 */ } }
    });
    const openDl = () => {
      waiting = true;
      if (ok) return;
      setTimeout(() => { if (waiting && document.hasFocus() && !$('dl-dialog').open) $('dl-dialog').showModal(); waiting = false; }, 4000);
    };
    dl.addEventListener('click', openDl);
    window.Dash.openDownloads = () => { openDl(); location.href = 'sdash-dl:open'; };
    $('dl-close').addEventListener('click', () => $('dl-dialog').close());
    $('dl-copy').addEventListener('click', async () => {
      const b = $('dl-copy');
      try { await navigator.clipboard.writeText(DL_CMD); b.textContent = '복사됨'; } catch { b.textContent = '아래 줄을 직접 복사해 주세요'; }
      setTimeout(() => { b.textContent = '아래 줄 복사'; }, 2000);
    });
  }

  listen('settings', render);
  if (state.data.settings) render(); // 처음 자료가 오기 전에는 빈 안내를 띄우지 않음
})();
