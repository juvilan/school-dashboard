// 학교 시간표에서 가져오기 (웹판 학교 특별판): 빌드 때 넣은 school-tt.json 에서
// 선생님 이름 + 나이스 개인번호로 내 시간표를 찾아 기본 시간표(매주)로 넣는다. 잠금 방식은 lib/school-tt.js 와 같다.
// 개인번호는 이 브라우저에 저장하지 않는다 (이름만 기억).
(() => {
  const { state, api, $ } = window.Dash;
  const label = document.querySelector('meta[name="school-tt"]')?.content || '';
  const open = $('tt-school-open');
  if (!open || !label || !window.crypto?.subtle) return;
  const KEY = 'dash-school-tt-name';
  const enc = new TextEncoder();
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const hex = (u8) => [...u8].map((x) => x.toString(16).padStart(2, '0')).join('');
  const normName = (s) => String(s || '').normalize('NFC').replace(/\s+/g, '');
  const normId = (s) => String(s || '').normalize('NFKC').replace(/\s+/g, '').toUpperCase();
  const secretOf = (name, id) => `${normName(name)}|${normId(id)}`;
  const ID_RE = /^[A-Z]\d{9}$/;

  let file = null; // school-tt.json (한 번 받으면 이 창이 열려 있는 동안 둔다)
  let found = null; // { cells, who } (who: 찾을 때 넣은 값. 저장 직전 지금 입력과 같은지 본다)
  let saving = false;
  let gen = 0;

  async function loadFile() {
    if (file) return file;
    const r = await fetch('./school-tt.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error('학교 시간표 파일을 받지 못했어요. 인터넷 연결을 확인해 주세요.');
    const j = await r.json();
    if (j?.v !== 2 || !Array.isArray(j.items) || j.kdf?.name !== 'PBKDF2') throw new Error('학교 시간표 파일이 맞지 않아요.');
    file = j;
    return j;
  }

  async function unlock(j, secret) {
    const base = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveBits']);
    const bits = new Uint8Array(await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt: b64(j.kdf.salt), iterations: j.kdf.iterations }, base, 512));
    const id = hex(bits.subarray(32, 48));
    const it = j.items.find((x) => x.id === id);
    if (!it) return null;
    const key = await crypto.subtle.importKey('raw', bits.subarray(0, 32), 'AES-GCM', false, ['decrypt']);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(it.iv) }, key, b64(it.data));
    const body = JSON.parse(new TextDecoder().decode(plain));
    if (!Array.isArray(body?.cells)) return null;
    return body;
  }

  // 종 시간(교시 수)에 맞춰 자른다
  function cellsNow() {
    const tt = state.data.timetable;
    const n = tt.bells.periods.length;
    const keep = $('tt-school-keep').checked;
    const all = found.cells.filter((c) => c.weekday >= 1 && c.weekday <= 5);
    const skipped = all.filter((c) => c.period > n && c.lesson).length;
    const cells = all.filter((c) => c.period >= 1 && c.period <= n && (c.lesson || !keep));
    return { cells, skipped };
  }

  function renderPreview() {
    const show = Boolean(found && state.data.timetable);
    $('tt-school-step').hidden = !show;
    if (!show) return;
    const { cells, skipped } = cellsNow();
    window.Dash.ttPreview?.($('tt-school-preview'), cells);
    const n = cells.filter((c) => c.lesson).length;
    const notes = [`수업 ${n}칸${$('tt-school-keep').checked ? '' : `, 비우는 칸 ${cells.length - n}`}`];
    if (skipped) notes.push(`종 시간보다 뒤 교시 ${skipped}칸은 뺐어요 (편집 → 종 시간에서 교시를 늘릴 수 있어요)`);
    notes.push('보강·교체처럼 그날만 바뀐 수업은 칸을 눌러 고쳐 주세요');
    $('tt-school-info').textContent = notes.join(' · ');
    $('tt-school-save').disabled = saving || !cells.length;
  }

  async function find() {
    const my = ++gen; // 먼저 올린다: 앞서 시작한 찾기는 무엇이든 버린다
    const name = $('tt-school-name').value;
    const id = $('tt-school-id').value;
    const secret = secretOf(name, id);
    $('tt-school-msg').textContent = '';
    found = null;
    renderPreview();
    $('tt-school-find').disabled = false;
    if (normName(name).length < 2) { $('tt-school-status').textContent = '이름을 넣어 주세요.'; return; }
    if (!ID_RE.test(normId(id))) { $('tt-school-status').textContent = '나이스 개인번호를 영문 1자 + 숫자 9자리로 넣어 주세요 (예: B123456789).'; return; }
    $('tt-school-find').disabled = true;
    $('tt-school-status').textContent = '찾는 중…';
    try {
      const j = await loadFile();
      // 개인번호 없이 등록된 선생님(강사 등)은 이름만으로 잠겨 있다 → 번호가 안 맞으면 이름만으로도 한 번 더 본다.
      // 화면은 모두 똑같이 이름 + 번호를 넣는다
      const r = (await unlock(j, secret)) || (my === gen ? await unlock(j, secretOf(name, '')) : null);
      if (my !== gen || !$('tt-school').open) return;
      if (!r) {
        $('tt-school-status').textContent = `이름과 개인번호가 맞지 않거나, ${label} 시간표에 없는 선생님이에요. 다시 확인해 주세요.`;
        return;
      }
      found = { cells: r.cells, who: secret };
      try { localStorage.setItem(KEY, normName(name)); } catch { /* 이번만 */ }
      $('tt-school-status').textContent = `${normName(name)} 선생님 시간표를 찾았어요.`;
      renderPreview();
    } catch (err) {
      if (my !== gen) return;
      $('tt-school-status').textContent = '';
      $('tt-school-msg').textContent = err.message || '시간표를 열지 못했어요.';
    } finally {
      if (my === gen) $('tt-school-find').disabled = false;
    }
  }

  window.Dash.schoolTtReady = true; // 시간표 카드가 버튼을 보일지 정할 때 본다
  $('tt-school-title').textContent = `${label} 시간표에서 가져오기`;
  open.addEventListener('click', () => {
    found = null;
    $('tt-school-msg').textContent = '';
    $('tt-school-status').textContent = '';
    try { $('tt-school-name').value = localStorage.getItem(KEY) || ''; } catch { $('tt-school-name').value = ''; }
    renderPreview();
    $('tt-school').showModal();
    $('tt-school-id').value = '';
    ($('tt-school-name').value ? $('tt-school-id') : $('tt-school-name')).focus();
  });
  $('tt-school-find').addEventListener('click', find);
  for (const f of ['tt-school-name', 'tt-school-id']) $(f).addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); if (!$('tt-school-find').disabled) find(); }
  });
  // 고치면 찾던 것·찾은 것 모두 버린다
  for (const f of ['tt-school-name', 'tt-school-id']) $(f).addEventListener('input', () => {
    gen += 1;
    $('tt-school-find').disabled = false;
    if (found) { found = null; renderPreview(); }
  });
  $('tt-school-close').addEventListener('click', () => $('tt-school').close());
  $('tt-school').addEventListener('close', () => { gen += 1; found = null; $('tt-school-id').value = ''; $('tt-school-find').disabled = false; });
  $('tt-school-keep').addEventListener('change', renderPreview);
  $('tt-school-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!found || saving || !state.data.timetable) return;
    if (found.who !== secretOf($('tt-school-name').value, $('tt-school-id').value)) { found = null; renderPreview(); return; }
    const { cells } = cellsNow();
    if (!cells.length) return;
    saving = true;
    const my = gen;
    $('tt-school-save').disabled = true;
    try {
      await api('PUT', '/api/timetable/base-many', { cells });
      if (my === gen) $('tt-school').close();
    } catch (err) {
      if (my === gen) $('tt-school-msg').textContent = err.message;
    } finally {
      saving = false;
      if (my === gen) renderPreview();
    }
  });
})();
