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
  try { localStorage.removeItem('dash-drive-recent'); } catch { /* 없음 */ } // 없앤 구글 드라이브 칸이 남긴 최근 파일 목록
  const folderUrl = (path) => `sdash-dl:folder?p=${encodeURIComponent(path)}`;
  const S = () => state.data.settings || { portal: { url: '' }, neis: '', links: [], search: 'naver' };

  // 큼직한 칸 하나 (배포판 시간표 아래 바로가기 칸)
  function tile(title, sub, href, { letter, cls = '', onClick } = {}) {
    const a = el('a', `go-tile ${cls}`.trim());
    a.href = href;
    a.title = sub;
    if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    a.append(el('span', 'go-letter', letter || Array.from(title)[0] || '?'), el('span', 'go-name', title), el('span', 'go-host muted', sub));
    if (onClick) a.addEventListener('click', onClick);
    return a;
  }
  const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };

  function render() {
    const box = $('go-links');
    box.textContent = '';
    const s = S();
    const all = [
      ...(teacher && s.portal?.url ? [{ title: '업무포털', url: s.portal.url, fixed: true }] : []),
      ...(teacher && s.neis ? [{ title: '나이스', url: s.neis, fixed: true }] : []),
      ...(s.links || []),
    ];
    const tiles = $('go-tiles');
    if (tiles) {
      // 배포판: 맨 위 줄 대신 시간표 아래 바로가기 칸에 크게
      tiles.textContent = '';
      for (const l of all) tiles.append(tile(l.title, hostOf(l.url), l.url, { cls: l.fixed ? 'fixed' : '' }));
      if (!all.length) tiles.append(el('p', 'muted small go-empty', '✎ 고치기를 눌러 자주 가는 사이트를 넣어 주세요.'));
      const fdTiles = $('go-fd-tiles');
      fdTiles.textContent = '';
      const showFd = win;
      $('go-fd-head').hidden = !showFd;
      fdTiles.hidden = !showFd;
      if (showFd) {
        fdTiles.append(tile('다운로드', '다운로드 폴더', 'sdash-dl:open', { letter: '⬇', cls: 'folder', onClick: () => window.Dash.openPcFolder?.() }));
        for (const f of s.folders || []) {
          fdTiles.append(tile(f.title, f.path, folderUrl(f.path), { letter: '📁', cls: 'folder', onClick: () => window.Dash.openPcFolder?.() }));
        }
        if (!(s.folders || []).length) fdTiles.append(el('p', 'muted small go-empty', '✎ 고치기에서 자주 가는 폴더에 별명을 붙여 넣어 두면 여기서 바로 열려요.'));
      }
    } else {
      for (const l of all) {
        const a = el('a', `link-btn${l.fixed ? ' fixed' : ''}`, l.title);
        a.href = l.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.title = l.url;
        box.append(a);
      }
      if (!all.length) box.append(el('span', 'muted small', '✎ 를 눌러 자주 가는 사이트를 넣어 주세요'));
    }
    if (teacher && $('go-engine')) $('go-engine').value = s.search || 'naver';
  }
  // 배포판: 맨 위 ✎·다운로드 대신 바로가기 칸의 [✎ 고치기]·[다운로드]
  if ($('go-tiles')) {
    $('go-edit').hidden = true;
    $('go-edit2').addEventListener('click', () => $('go-edit').click());
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
        // 별명을 누르면 그 자리에서 바꾼다 (Enter·칸 밖 누르기 = 저장, Esc = 그대로)
        const name = el('button', 'ghost small-btn fd-name', f.title);
        name.type = 'button';
        name.title = '별명 바꾸기';
        name.addEventListener('click', () => {
          const inp = el('input', 'fd-rename');
          inp.value = f.title;
          inp.maxLength = 20;
          inp.setAttribute('aria-label', '새 별명');
          let done = false;
          const finish = async (save) => {
            if (done) return;
            done = true;
            const t = inp.value.trim();
            if (!(save && t && t !== f.title && await saveFolders(fd.map((x, j) => (j === i ? { ...x, title: t } : x))))) renderFolders();
          };
          inp.addEventListener('keydown', (e) => {
            if (e.isComposing) return;
            if (e.key === 'Enter') { e.preventDefault(); finish(true); }
            if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(false); }
          });
          inp.addEventListener('blur', () => finish(true));
          name.replaceWith(inp);
          inp.focus();
          inp.select();
        });
        li.append(name, el('span', 'muted small go-row-url', f.path));
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
    // [폴더 찾기]: 이 PC 설정이 둔 open.ps1 이 윈도우 폴더 고르는 창을 띄우고, 고른 경로를 클립보드에 넣는다.
    // 웹페이지는 PC 폴더 경로를 알 수 없어서 이렇게 돌아온다. 창이 다시 앞으로 오면 클립보드를 읽어 칸에 넣는다.
    let picking = 0;
    let nonce = '';
    const PICK_RE = /^SDASH-PICK\|([0-9a-f]+)\|(.*)$/s;
    const pathOk = (t) => /^[A-Za-z]:\\/.test(t) && t.length <= 240 && !/[\r\n"<>|?*]/.test(t);
    const fillPath = (t) => {
      $('fd-add-path').value = t;
      if (!$('fd-add-title').value.trim()) $('fd-add-title').value = (t.replace(/\\+$/, '').split('\\').pop() || t).slice(0, 20);
      $('fd-msg').textContent = '경로가 들어갔어요. 별명을 확인하고 [추가]를 눌러 주세요.';
      $('fd-add-title').focus();
      $('fd-add-title').select();
    };
    const afterPick = async () => {
      if (!picking || !$('go-dialog').open) { picking = 0; return; }
      picking = 0;
      let t = '';
      try { t = (await navigator.clipboard.readText()).trim(); } catch {
        $('fd-msg').textContent = '고른 경로를 가져오지 못했어요. 경로 칸을 누르고 Ctrl+V 로 붙여넣어 주세요.';
        $('fd-add-path').focus();
        return;
      }
      const m = PICK_RE.exec(t);
      if (m && m[1] === nonce && !m[2]) { $('fd-msg').textContent = '폴더 고르기를 취소했어요.'; return; }
      if (m && m[1] === nonce && pathOk(m[2].trim())) {
        fillPath(m[2].trim());
        navigator.clipboard.writeText(m[2].trim()).catch(() => {}); // 클립보드에는 경로만 남김
      } else if (m && m[1] === nonce) $('fd-msg').textContent = '\\\\서버 같은 네트워크 위치는 넣을 수 없어요. 연결된 드라이브(Z: 등)로 골라 주세요.';
      else $('fd-msg').textContent = '고른 폴더를 받지 못했어요. 다운로드 폴더가 열렸다면 [설정]의 "이 PC 설정"을 한 번 더 해 주세요.';
    };
    $('fd-add-path').addEventListener('paste', () => setTimeout(() => {
      let t = $('fd-add-path').value.trim();
      const m = PICK_RE.exec(t); // 클립보드 읽기를 막았을 때 붙여넣은 결과
      if (m) { t = m[2].trim(); $('fd-add-path').value = t; }
      if (pathOk(t) && !$('fd-add-title').value.trim()) fillPath(t);
    }));
    $('fd-pick').addEventListener('click', () => {
      $('fd-msg').textContent = '폴더 고르는 창을 띄우는 중… (안 보이면 작업 표시줄을 봐 주세요)';
      const my = ++picking;
      let left = false;
      const onBlur = () => { left = true; };
      window.addEventListener('blur', onBlur, { once: true });
      // 고르는 창이 닫혀 이 창이 다시 앞으로 오면
      const onFocus = () => {
        if (picking !== my) return;
        if (left) setTimeout(afterPick, 150); else window.addEventListener('focus', onFocus, { once: true });
      };
      window.addEventListener('focus', onFocus, { once: true });
      // 취소했을 때 예전 클립보드 경로가 들어가지 않게 먼저 비운다 (누른 순간이라 쓸 수 있음)
      nonce = [...crypto.getRandomValues(new Uint8Array(8))].map((x) => x.toString(16).padStart(2, '0')).join('');
      const go = () => { location.href = `sdash-dl:pick?n=${nonce}`; };
      navigator.clipboard.writeText('').then(go, go);
      // 느린 PC 는 창이 늦게 뜰 수 있다: 안내만 하고 1분까지는 계속 기다린다
      setTimeout(() => {
        if (left || picking !== my) return;
        $('fd-msg').textContent = '폴더 고르는 창이 안 뜨면 [설정]의 "이 PC 설정"을 한 번 해 주세요. 또는 탐색기 주소창의 경로를 복사해 붙여넣어도 돼요.';
      }, 6000);
      setTimeout(() => { if (picking === my && !left) { picking = 0; window.removeEventListener('blur', onBlur); } }, 60000);
    });
    $('fd-add').addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = $('fd-add-title').value.trim();
      const path = $('fd-add-path').value.trim();
      if (!title || !path) { $('fd-msg').textContent = '별명과 경로를 모두 적어 주세요.'; return; }
      // 크롬은 2048자보다 긴 외부 주소를 열지 않는다 (한글은 한 글자가 9자로 늘어남)
      if (folderUrl(path).length > 2000) { $('fd-msg').textContent = '경로가 너무 길어서 크롬이 열지 못해요. 더 짧은 위쪽 폴더를 넣어 주세요.'; return; }
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
  // 등록된 명령(open.vbs → open.ps1)이 주소를 확인해 다운로드 폴더나 적어 둔 폴더만 연다.
  // 이 PC 설정(web/ai/pc.ps1): 다운로드·자주 가는 폴더 버튼. Win+R 한 줄 (259자 제한 안)
  const DL_CMD = "powershell -NoProfile -ExecutionPolicy Bypass -c \"[Net.ServicePointManager]::SecurityProtocol=3072;$f=$env:TEMP+'\\sdash-pc.ps1';try{iwr -useb https://juvilan.github.io/school-dashboard/ai/pc.ps1 -OutFile $f;& $f}catch{$_;pause}\"";
  if (win) {
    const dl = $('go-dl');
    dl.hidden = Boolean($('go-tiles')); // 배포판은 바로가기 칸에 [다운로드] 칸이 있음
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
      setTimeout(() => {
        if (waiting && document.hasFocus() && !$('dl-dialog').open) {
          $('dl-intro').textContent = '탐색기가 안 열렸나요? 이 PC 에 처음 한 번만 설정해 주세요.';
          $('dl-dialog').showModal();
        }
        waiting = false;
      }, 4000);
    };
    dl.addEventListener('click', () => openDl());
    window.Dash.openPcFolder = () => openDl();
    $('dl-close').addEventListener('click', () => $('dl-dialog').close());
    // 설정 창에서도 다시 열 수 있게 (처음 안내를 닫아 버린 경우)
    window.Dash.openPcSetup = () => {
      try { localStorage.setItem('dash-dl-asked4', '1'); } catch { /* 이번만 */ }
      $('dl-intro').textContent = '이 PC 에 한 번만 설정해 두면 [📁 다운로드]·자주 가는 폴더 버튼이 탐색기를 열어요.';
      $('t-settings')?.close();
      $('dl-dialog').showModal();
    };
    const pc = $('t-pc');
    if (pc) {
      pc.hidden = false;
      $('t-pc-open').addEventListener('click', () => window.Dash.openPcSetup());
    }
    // 처음 한 번(새로 설치했거나 이미 쓰던 선생님이 새로고침했을 때): 등록을 먼저 권한다.
    // 웹페이지·앱 설치는 PC 설정을 직접 바꿀 수 없어서, 붙여넣기 한 번은 선생님이 해야 한다.
    const standalone = matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: window-controls-overlay)').matches;
    // 4: [폴더 찾기]가 생겨서(검은 창 없애기도 함께), 예전에 설정한 PC 도 한 번 더 권한다
    let asked = false;
    try { asked = localStorage.getItem('dash-dl-asked4') === '1'; } catch { asked = true; }
    if (!asked) {
      $('dl-intro').textContent = ok
        ? '새 기능! 자주 가는 폴더를 [폴더 찾기]로 눌러 고를 수 있고, 폴더를 열 때 검은 창도 안 떠요. 이 PC 설정을 한 번 더 해 주세요. (나중에 하려면 [닫기] → [설정]의 "이 PC 설정")'
        : `${standalone ? '앱 설치를 마쳤어요! ' : '새 기능이에요! '}이 PC 에 한 번만 설정해 두면 [📁 다운로드]·자주 가는 폴더 버튼이 탐색기를 열어요. (나중에 하려면 [닫기] → [설정]의 "이 PC 설정")`;
      // 다른 창(처음 설정 등)이 떠 있으면 닫힐 때까지 기다렸다가 한 번만
      const tryShow = () => {
        if (document.querySelector('dialog[open]') || document.hidden) { setTimeout(tryShow, 2000); return; }
        try { localStorage.setItem('dash-dl-asked4', '1'); } catch { /* 이번만 */ }
        if (window.Dash.startGuide?.isNew()) return; // 처음 쓰는 선생님은 시작하기 안내에 이 PC 설정이 들어 있음
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
