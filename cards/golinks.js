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
  const win = /Windows/i.test(navigator.userAgent);
  const folderUrl = (path) => `sdash-dl:folder?p=${encodeURIComponent(path)}`;
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
    if (!all.length && !(teacher && win && s.folders?.length)) box.append(el('span', 'muted small', '✎ 를 눌러 자주 가는 사이트를 넣어 주세요'));
    // 자주 가는 PC 폴더 (배포판, 윈도우): 이 PC 설정의 sdash-dl: 통로로 탐색기를 연다
    if (teacher && win) {
      for (const f of s.folders || []) {
        const a = el('a', 'link-btn folder-btn', `📁 ${f.title}`);
        a.href = folderUrl(f.path);
        a.title = f.path;
        a.addEventListener('click', () => window.Dash.openPcFolder?.());
        box.append(a);
      }
    }
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

  // ---- 자주 가는 PC 폴더 고치기 (같은 ✎ 창 아래쪽, 배포판 윈도우만) ----
  const fdBox = $('fd-box');
  if (fdBox && win) {
    fdBox.hidden = false;
    let fd = [];
    const saveFolders = async (next) => {
      try {
        fd = (await api('PUT', '/api/settings/folders', { folders: next }))?.folders || next; // 정리된 경로로
        $('fd-msg').textContent = '';
        renderFolders();
        return true;
      } catch (err) {
        $('fd-msg').textContent = err.message;
        return false;
      }
    };
    function renderFolders() {
      const box = $('fd-rows');
      box.textContent = '';
      fd.forEach((f, i) => {
        const li = el('li', 'go-row');
        li.append(el('strong', '', f.title), el('span', 'muted small go-row-url', f.path));
        const up = el('button', 'ghost small-btn', '↑');
        up.type = 'button';
        up.disabled = i === 0;
        up.setAttribute('aria-label', `${f.title} 앞으로`);
        up.addEventListener('click', () => { const n = [...fd]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; saveFolders(n); });
        const del = el('button', 'ghost small-btn', '지우기');
        del.type = 'button';
        del.addEventListener('click', () => {
          if (del.dataset.armed !== '1') { del.dataset.armed = '1'; del.textContent = '한 번 더'; del.classList.add('armed'); setTimeout(() => { del.dataset.armed = ''; del.textContent = '지우기'; del.classList.remove('armed'); }, 3000); return; }
          saveFolders(fd.filter((_, j) => j !== i));
        });
        li.append(up, del);
        box.append(li);
      });
      if (!fd.length) box.append(el('li', 'muted small', '아직 없어요. 아래에서 추가해 주세요.'));
    }
    $('go-edit').addEventListener('click', () => { fd = [...(S().folders || [])]; $('fd-msg').textContent = ''; renderFolders(); });
    $('fd-add').addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = $('fd-add-title').value.trim();
      const path = $('fd-add-path').value.trim();
      if (!title || !path) { $('fd-msg').textContent = '이름과 경로를 모두 적어 주세요.'; return; }
      if (await saveFolders([...fd, { title, path }])) {
        $('fd-add-title').value = '';
        $('fd-add-path').value = '';
        $('fd-add-title').focus();
        // 폴더 버튼은 새 이 PC 설정이 있어야 열린다: 예전에 설정한 PC 도 처음 한 번은 다시 권함
        let asked = false;
        try { asked = localStorage.getItem('dash-dl-fd') === '1'; localStorage.setItem('dash-dl-fd', '1'); } catch { asked = true; }
        if (!asked && $('dl-dialog')) {
          $('dl-intro').textContent = '폴더 버튼이 탐색기에서 그 폴더를 열려면 이 PC 설정이 필요해요. 예전에 해 두었더라도 한 번 더 해 주세요. (이미 방금 했다면 [닫기])';
          $('go-dialog').close();
          $('dl-dialog').showModal();
        }
      }
    });
  }
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
  // 이 PC 설정(web/ai/pc.ps1): 다운로드 폴더 버튼 + 대시보드에서 받은 파일 바로 열기. Win+R 한 줄 (259자 제한 안)
  const DL_CMD = "powershell -NoProfile -ExecutionPolicy Bypass -c \"[Net.ServicePointManager]::SecurityProtocol=3072;$f=$env:TEMP+'\\sdash-pc.ps1';try{iwr -useb https://juvilan.github.io/school-dashboard/ai/pc.ps1 -OutFile $f;& $f}catch{$_;pause}\"";
  if (win) {
    const dl = $('go-dl');
    dl.hidden = false;
    // 웹판: 드라이브 칸이 있으면 [파일 고르기] 옆으로 (받은 파일을 바로 찾게)
    const drive = $('card-drive');
    if (drive && !drive.hidden) {
      dl.textContent = '📁 다운로드';
      dl.title = '다운로드 폴더 열기';
      dl.className = 'ghost small-btn go-dl';
      drive.querySelector('.card-head').insertBefore(dl, $('drive-pick'));
    }
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
    const openDl = (what = 'folder') => {
      waiting = true;
      if (ok) return;
      setTimeout(() => {
        if (waiting && document.hasFocus() && !$('dl-dialog').open) {
          $('dl-intro').textContent = what === 'file' ? '파일이 안 열렸나요? 이 PC 에 처음 한 번만 설정해 주세요. (받은 파일은 다운로드 폴더에 있어요)' : '탐색기가 안 열렸나요? 이 PC 에 처음 한 번만 설정해 주세요.';
          $('dl-dialog').showModal();
        }
        waiting = false;
      }, 4000);
    };
    dl.addEventListener('click', () => openDl());
    window.Dash.openPcFolder = () => openDl();
    window.Dash.openDownloads = () => { openDl(); location.href = 'sdash-dl:open'; };
    // 받은 파일을 기본 앱으로 (open.ps1 이 다운로드 폴더에서 이 이름으로 막 받은 파일만 찾아 연다)
    // t = 받은 시각: 그보다 먼저 있던 같은 이름 파일(예전 판)은 열지 않는다
    const latest = (name, t) => `sdash-dl:latest?n=${encodeURIComponent(String(name || ''))}&t=${Math.floor((t || Date.now()) / 1000)}`;
    window.Dash.openFile = (name, t) => { openDl('file'); location.href = latest(name, t); };
    $('dl-close').addEventListener('click', () => $('dl-dialog').close());
    // 설정 창에서도 다시 열 수 있게 (처음 안내를 닫아 버린 경우)
    const pc = $('t-pc');
    if (pc) {
      pc.hidden = false;
      $('t-pc-open').addEventListener('click', () => {
        $('dl-intro').textContent = '이 PC 에 한 번만 설정해 두면 [📁 다운로드] 버튼이 다운로드 폴더를 열고, 드라이브에서 받은 한글·엑셀·파워포인트 파일이 받자마자 열려요.';
        $('t-settings')?.close();
        $('dl-dialog').showModal();
      });
    }
    // 처음 한 번(새로 설치했거나 이미 쓰던 선생님이 새로고침했을 때): 등록을 먼저 권한다.
    // 웹페이지·앱 설치는 PC 설정을 직접 바꿀 수 없어서, 붙여넣기 한 번은 선생님이 해야 한다.
    const standalone = matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: window-controls-overlay)').matches;
    // 2: 받은 파일 [바로 열기]가 생겨서, 예전에 설정한 PC 도 한 번 더 권한다
    let asked = false;
    try { asked = localStorage.getItem('dash-dl-asked2') === '1'; } catch { asked = true; }
    if (!asked) {
      $('dl-intro').textContent = ok
        ? '새 기능이에요! 드라이브에서 받은 한글·엑셀·파워포인트 파일이 받자마자 그 프로그램으로 열려요. 이 PC 설정을 한 번 더 해 주세요. (나중에 하려면 [닫기] → [설정]의 "이 PC 설정")'
        : `${standalone ? '앱 설치를 마쳤어요! ' : '새 기능이에요! '}이 PC 에 한 번만 설정해 두면 [📁 다운로드] 버튼이 다운로드 폴더를 열고, 드라이브에서 받은 한글·엑셀·파워포인트 파일이 받자마자 열려요. (나중에 하려면 [닫기] → [설정]의 "이 PC 설정")`;
      // 다른 창(처음 설정 등)이 떠 있으면 닫힐 때까지 기다렸다가 한 번만
      const tryShow = () => {
        if (document.querySelector('dialog[open]') || document.hidden) { setTimeout(tryShow, 2000); return; }
        try { localStorage.setItem('dash-dl-asked2', '1'); } catch { /* 이번만 */ }
        $('dl-dialog').showModal();
      };
      setTimeout(tryShow, 1500);
    }
    $('dl-copy').addEventListener('click', async () => {
      const b = $('dl-copy');
      try { await navigator.clipboard.writeText(DL_CMD); b.textContent = '복사됨'; } catch { b.textContent = '아래 줄을 직접 복사해 주세요'; }
      setTimeout(() => { b.textContent = '아래 줄 복사'; }, 2000);
    });
  }

  listen('settings', render);
  if (state.data.settings) render(); // 처음 자료가 오기 전에는 빈 안내를 띄우지 않음
})();
