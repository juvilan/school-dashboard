// 클립보드 카드: 전송상자와 연결. 적거나 붙여넣어 보내고, 다른 기기에서 보낸 것을 바로 복사한다.
// 브라우저는 이 대시보드 서버에만 요청한다 (서버가 전송상자에 대신 요청).
(() => {
  const { state, listen, $ } = window.Dash;
  const SHOW = 8; // 처음에 보이는 항목 수
  let showAll = false;
  let known = null; // 이미 본 항목 id (새로 온 것 강조용)
  let armed = null; // 지우기를 한 번 누른 항목 id (한 번 더 누르면 지움)
  let armTimer = null;
  let filter = 'all';
  let terminalText = null;
  const labels = { all: '전체', text: '텍스트', image: '이미지', file: '파일' };
  const kind = (it) => it.kind === 'text' ? 'text' : it.image ? 'image' : 'file';
  const filtered = (items) => filter === 'all' ? items : items.filter((it) => kind(it) === filter);
  const clearLabel = () => filter === 'all' ? '모두 지우기' : `${labels[filter]} 모두 지우기`;

  function selectFilter(next) {
    filter = next;
    showAll = false;
    armed = null;
    clearTimeout(armTimer);
    disarmClear();
    render();
  }

  const msg = (t) => { $('clip-msg').textContent = t || ''; };
  const note = (t) => { $('clip-status').textContent = t || ''; };

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function ago(ms) {
    const s = Math.max(0, (Date.now() - (state.clockOffset || 0) - ms) / 1000);
    if (s < 60) return '방금';
    if (s < 3600) return `${Math.floor(s / 60)}분 전`;
    if (s < 86400) return `${Math.floor(s / 3600)}시간 전`;
    return `${Math.floor(s / 86400)}일 전`;
  }

  function size(n) {
    if (n < 1024) return `${n}B`;
    if (n < 1024 * 1024) return `${Math.round(n / 1024)}KB`;
    return `${(n / 1024 / 1024).toFixed(1)}MB`;
  }

  async function request(method, url, body, headers = {}) {
    let res;
    try {
      res = await fetch(url, { method, headers: { 'X-Dash': '1', ...headers }, body });
    } catch {
      throw new Error('서버에 연결할 수 없어요.');
    }
    if (res.status === 401) {
      location.href = '/login';
      throw new Error('로그인이 필요해요.');
    }
    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || '요청이 실패했어요.');
    return data;
  }

  // ---- 복사 ----
  // 아이폰 사파리는 "누른 그 순간" 클립보드 쓰기를 시작해야 허락한다.
  // 그래서 받아 올 내용은 Promise 로 넘기고, 쓰기 자체는 클릭 처리 안에서 바로 부른다.
  function copyText(it) {
    if (!it.truncated) return navigator.clipboard.writeText(it.preview);
    const blob = fetch(`/api/clip/${it.id}/raw`).then((res) => {
      if (!res.ok) throw new Error('내용을 받지 못했어요.');
      return res.text();
    }).then((t) => new Blob([t], { type: 'text/plain' }));
    return navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
  }

  // 이미지는 PNG로 바꿔서 복사 (브라우저 클립보드는 PNG만 확실히 받는다)
  function copyImage(it) {
    const png = (async () => {
      const res = await fetch(`/api/clip/${it.id}/raw`);
      if (!res.ok) throw new Error('이미지를 받지 못했어요.');
      const blob = await res.blob();
      if (blob.type === 'image/png') return blob;
      const bmp = await createImageBitmap(blob);
      const canvas = document.createElement('canvas');
      canvas.width = bmp.width;
      canvas.height = bmp.height;
      canvas.getContext('2d').drawImage(bmp, 0, 0);
      return new Promise((r) => canvas.toBlob(r, 'image/png'));
    })();
    return navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
  }

  async function copy(it, btn) {
    try {
      if (it.kind === 'text') await copyText(it);
      else await copyImage(it);
      btn.textContent = '복사됨';
      setTimeout(() => { btn.textContent = '복사'; }, 1500);
      msg('');
    } catch (err) {
      msg(err.name === 'NotAllowedError' ? '브라우저가 클립보드 쓰기를 막았어요. 화면을 한 번 누른 뒤 다시 해 주세요.' : err.message);
    }
  }

  async function remove(it, btn) {
    if (armed !== it.id) {
      // 한 번 누르면 "정말?" 상태, 3초 안에 한 번 더 누르면 지운다
      armed = it.id;
      btn.textContent = '한 번 더';
      btn.classList.add('armed');
      clearTimeout(armTimer);
      armTimer = setTimeout(() => { armed = null; render(); }, 3000);
      return;
    }
    armed = null;
    try {
      await request('DELETE', `/api/clip/${it.id}`);
      msg('');
    } catch (err) {
      msg(err.message);
    }
  }

  function item(it, fresh) {
    const li = el('li', `clip-item${fresh ? ' fresh' : ''}`);
    const body = el('div', 'clip-body');
    if (it.kind === 'text') {
      body.append(el('div', 'clip-text', it.preview + (it.truncated ? ' …' : '')));
    } else if (it.image) {
      const img = el('img', 'clip-img');
      img.src = it.url || `/api/clip/${it.id}/raw`; // 웹판은 이 브라우저 안의 주소(blob:)
      img.alt = it.name || '이미지';
      img.loading = 'lazy';
      body.append(img);
    } else {
      body.append(el('div', 'clip-file', `📄 ${it.name}`));
    }
    const meta = el('div', 'clip-meta muted small', [ago(it.createdAt), it.kind === 'text' ? '' : size(it.size)].filter(Boolean).join(' · '));
    body.append(meta);
    li.append(body);

    const acts = el('div', 'clip-acts');
    if (it.kind === 'text' || it.image) {
      const b = el('button', 'small-btn', '복사');
      b.type = 'button';
      b.addEventListener('click', () => copy(it, b));
      acts.append(b);
    }
    if (it.kind !== 'text') {
      const a = el('a', 'small-btn ghost-link', '받기');
      a.href = it.url || `/api/clip/${it.id}/download`;
      if (it.url) a.download = it.name || '파일';
      acts.append(a);
    }
    const d = el('button', `ghost small-btn${armed === it.id ? ' armed' : ''}`, armed === it.id ? '한 번 더' : '지우기');
    d.type = 'button';
    d.addEventListener('click', () => remove(it, d));
    acts.append(d);
    li.append(acts);
    return li;
  }

  function render() {
    const c = state.data.clip;
    const list = $('clip-list');
    list.textContent = '';
    $('clip-clear').hidden = true;
    $('clip-more').hidden = true;
    const items = c?.items || [];
    for (const btn of $('clip-filters').querySelectorAll('button')) {
      const k = btn.dataset.kind;
      const count = k === 'all' ? items.length : items.filter((it) => kind(it) === k).length;
      btn.textContent = `${labels[k]} ${count}`;
      btn.setAttribute('aria-pressed', String(k === filter));
    }
    if (!c) return;
    if (!c.linked) {
      note('연결 전');
      list.append(el('li', 'muted small', '전송상자와 아직 연결하지 않았어요. M6에서 npm run link-transfer-box 를 한 번 실행하면 돼요.'));
      return;
    }
    note(c.error ? '⚠ 못 불러옴' : `${c.items.length}개`);
    $('clip-status').title = c.error || '';
    const ids = new Set(c.items.map((i) => i.id));
    const matches = filtered(c.items);
    const shown = showAll ? matches : matches.slice(0, SHOW);
    for (const it of shown) list.append(item(it, known !== null && !known.has(it.id)));
    if (!matches.length) list.append(el('li', 'muted small', filter === 'all' ? '저장된 항목이 없어요.' : `저장된 ${labels[filter]}가 없어요.`));
    known = ids;
    $('clip-clear').hidden = !matches.length;
    if (!clearArmed) $('clip-clear').textContent = clearLabel();
    $('clip-more').hidden = matches.length <= SHOW;
    $('clip-more').textContent = showAll ? '접기' : `더 보기 (${matches.length - SHOW})`;
  }

  // ---- 보내기 ----
  let sending = false;
  async function sendText() {
    const text = $('clip-input').value;
    if (!text.trim() || sending) return; // 보내는 중에 Ctrl+Enter 를 또 눌러도 한 번만
    sending = true;
    $('clip-send').disabled = true;
    try {
      await request('POST', '/api/clip/text', text, { 'Content-Type': 'text/plain; charset=utf-8' });
      // 기다리는 사이 새로 적은 글은 지우지 않는다
      if ($('clip-input').value === text) $('clip-input').value = '';
      selectFilter('text');
      msg('');
    } catch (err) {
      msg(err.message); // 적은 내용은 그대로 둔다
    } finally {
      sending = false;
      $('clip-send').disabled = false;
    }
  }

  async function sendFiles(files) {
    if (!files.length) return;
    const max = state.data.clip?.maxFileBytes;
    const big = max ? files.find((f) => f.size > max) : null;
    if (big) return msg(`${big.name}: 파일은 최대 ${Math.round(max / 1024 / 1024)}MB까지 올릴 수 있어요.`);
    const fd = new FormData();
    for (const f of files) fd.append('files', f, f.name || 'clipboard.png');
    note(`올리는 중… (${files.length}개)`);
    try {
      await request('POST', '/api/clip/upload', fd);
      msg('');
    } catch (err) {
      msg(err.message);
    }
    render();
  }

  $('clip-form').addEventListener('submit', (e) => { e.preventDefault(); sendText(); });
  $('clip-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); sendText(); }
  });
  // 캡처 이미지 붙여넣기 → 바로 올리기. 글이 함께 있으면(엑셀·한글 표 복사) 글로 붙인다
  $('clip-input').addEventListener('paste', (e) => {
    const files = [...(e.clipboardData?.files || [])];
    const text = e.clipboardData?.getData('text/plain') || '';
    if (files.length && !text.trim()) {
      e.preventDefault();
      sendFiles(files);
    }
  });
  $('clip-file-btn').addEventListener('click', () => $('clip-file').click());
  $('clip-file').addEventListener('change', () => {
    sendFiles([...$('clip-file').files]);
    $('clip-file').value = '';
  });
  // 파일 끌어놓기
  const card = $('card-clip');
  card.addEventListener('dragover', (e) => {
    if ([...(e.dataTransfer?.types || [])].includes('Files')) { e.preventDefault(); card.classList.add('drop'); }
  });
  card.addEventListener('dragleave', (e) => { if (!card.contains(e.relatedTarget)) card.classList.remove('drop'); });
  card.addEventListener('drop', (e) => {
    if (!e.dataTransfer?.files?.length) return;
    e.preventDefault();
    card.classList.remove('drop');
    sendFiles([...e.dataTransfer.files]);
  });
  // ---- 모두 지우기: 현재 분류의 항목만, 더 보기로 접힌 항목까지 두 번 확인해서 지운다 ----
  let clearArmed = null; // 첫 번째 누를 때 본 항목 id (그사이 새로 온 것은 지우지 않게)
  let clearTimer = null;
  const clearBtn = $('clip-clear');
  function disarmClear() {
    clearArmed = null;
    clearTimeout(clearTimer);
    clearBtn.textContent = clearLabel();
    clearBtn.classList.remove('armed');
  }
  clearBtn.addEventListener('click', async () => {
    if (!clearArmed) {
      const seen = filtered(state.data.clip?.items || []).map((i) => i.id);
      if (!seen.length) return;
      clearArmed = seen;
      const ids = seen;
      clearBtn.textContent = `${ids.length}개 모두 지울까요? 한 번 더`;
      clearBtn.classList.add('armed');
      clearTimer = setTimeout(disarmClear, 3000);
      return;
    }
    const ids = clearArmed;
    disarmClear();
    clearBtn.disabled = true;
    note('지우는 중…');
    try {
      const r = await request('POST', '/api/clip/clear', JSON.stringify({ ids }), { 'Content-Type': 'application/json' });
      msg(r.failed ? `${r.failed}개는 지우지 못했어요.` : '');
    } catch (err) {
      msg(err.message);
    } finally {
      clearBtn.disabled = false;
      render();
    }
  });
  $('clip-more').addEventListener('click', () => { showAll = !showAll; render(); });

  $('clip-mac-import')?.addEventListener('click', async () => {
    const btn = $('clip-mac-import');
    if (btn.disabled) return;
    btn.disabled = true;
    btn.textContent = '맥에서 가져오는 중…';
    try {
      await request('POST', '/api/clip/mac-text');
      selectFilter('text');
      btn.textContent = '텍스트 목록에 저장됨';
      msg('');
    } catch (err) {
      btn.textContent = '맥 텍스트 가져오기';
      msg(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  $('clip-filters').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-kind]');
    if (btn) selectFilter(btn.dataset.kind);
  });
  // herdr 의 복사 또는 브라우저 선택을 임시로 받아 둔다. 저장 버튼을 눌렀을 때만 공유한다.
  window.addEventListener('dash-terminal-copy', (e) => {
    const text = e.detail?.text;
    if (typeof text !== 'string' || !text.trim()) return;
    terminalText = text;
    $('clip-terminal-preview').textContent = `터미널: ${text.slice(0, 100)}`;
    $('clip-terminal-pending').hidden = false;
  });
  $('clip-terminal-save').addEventListener('click', async () => {
    if (terminalText === null || $('clip-terminal-save').disabled) return;
    const text = terminalText;
    $('clip-terminal-save').disabled = true;
    try {
      await request('POST', '/api/clip/text', text, { 'Content-Type': 'text/plain; charset=utf-8' });
      if (terminalText === text) {
        terminalText = null;
        $('clip-terminal-pending').hidden = true;
        $('clip-terminal-preview').textContent = '';
      }
      selectFilter('text');
      msg('');
    } catch (err) {
      msg(err.message);
    } finally {
      $('clip-terminal-save').disabled = false;
    }
  });

  listen('clip', render);
  setInterval(() => document.visibilityState === 'visible' && state.data.clip && render(), 60e3); // "n분 전" 갱신
})();
