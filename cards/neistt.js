// 나이스에서 시간표 가져오기 (웹판): 이번 주·다음 주 반별 시간표를 받아,
// 선생님이 내 과목 → 내 반을 고르면 기본 시간표(매주)로 넣는다. 고른 것은 이 브라우저에 기억해 둔다.
(() => {
  const { state, api, $, seoul } = window.Dash;
  const N = window.NeisTtLogic;
  const C = window.CalendarLogic;
  const T = window.TimetableLogic;
  const open = $('tt-neis-open');
  if (!open || !N) return;
  const KEY = 'dash-neis-picks';
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };

  let rows = [];
  let pickedSubjects = new Set();
  let pickedKeys = new Set();
  let result = null;
  let saving = false;
  let gen = 0; // 불러올 때마다 올림: 늦게 온 예전 응답은 버린다
  let loadedFor = ''; // 받은 자료의 학교 (저장 직전 지금 학교와 맞는지 봄)
  let termNote = '';
  const schoolId = () => { const sc = state.data.settings?.school; return sc ? `${sc.office}:${sc.code}` : ''; };
  // 이번 자료에 있는 반만 (기억해 둔 다른 학기 반은 지우지 않고 그냥 쓰지 않음)
  const liveKeys = () => {
    const live = new Set(N.offerings(rows, [...pickedSubjects]).map((o) => o.key));
    return [...pickedKeys].filter((k) => live.has(k));
  };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved) { pickedSubjects = new Set(saved.subjects || []); pickedKeys = new Set(saved.keys || []); }
  } catch { /* 처음 */ }
  const remember = () => { try { localStorage.setItem(KEY, JSON.stringify({ subjects: [...pickedSubjects].slice(-60), keys: [...pickedKeys].slice(-200) })); } catch { /* 이번만 */ } };

  function renderSubjects() {
    const box = $('tt-neis-subjects');
    box.textContent = '';
    const q = $('tt-neis-q').value.trim();
    const list = N.subjects(rows).filter((s) => !q || s.subject.includes(q) || pickedSubjects.has(s.subject));
    for (const s of list) {
      const b = el('button', 'neis-chip', s.subject);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(pickedSubjects.has(s.subject)));
      b.addEventListener('click', () => {
        if (pickedSubjects.has(s.subject)) pickedSubjects.delete(s.subject); else pickedSubjects.add(s.subject);
        renderSubjects();
        renderClasses();
      });
      box.append(b);
    }
    if (!list.length) box.append(el('span', 'muted small', '맞는 과목이 없어요.'));
  }

  function renderClasses() {
    const box = $('tt-neis-classes');
    box.textContent = '';
    const offers = N.offerings(rows, [...pickedSubjects]);
    $('tt-neis-step2').hidden = !offers.length;
    let subject = null;
    let line = null;
    for (const o of offers) {
      if (o.subject !== subject) {
        subject = o.subject;
        const g = el('div', 'neis-group');
        g.append(el('strong', '', subject));
        line = el('div', 'neis-chips');
        g.append(line);
        box.append(g);
      }
      const lab = el('label', 'neis-chip neis-check');
      const cb = el('input');
      cb.type = 'checkbox';
      cb.checked = pickedKeys.has(o.key);
      cb.addEventListener('change', () => {
        if (cb.checked) pickedKeys.add(o.key); else pickedKeys.delete(o.key);
        renderPreview();
      });
      lab.append(cb, document.createTextNode(` ${o.label}`));
      line.append(lab);
    }
    renderPreview();
  }

  function renderPreview() {
    const tt = state.data.timetable;
    const keys = liveKeys();
    const show = keys.length > 0 && tt;
    $('tt-neis-step3').hidden = !show;
    if (!show) { result = null; return; }
    result = N.toCells(rows, keys, tt.bells.periods.length);
    const keep = $('tt-neis-keep').checked;
    const cells = result.cells.filter((c) => c.lesson || !keep);
    window.Dash.ttPreview?.($('tt-neis-preview'), cells);
    const n = cells.filter((c) => c.lesson).length;
    const notes = [`수업 ${n}칸${keep ? '' : `, 비우는 칸 ${cells.length - n}`}`];
    if (result.conflicts) notes.push(`같은 시간에 고른 수업이 겹친 칸 ${result.conflicts}개는 하나만 넣어요`);
    if (result.skipped) notes.push(`종 시간보다 뒤 교시 ${result.skipped}칸은 뺐어요 (편집 → 종 시간에서 교시를 늘릴 수 있어요)`);
    if (termNote) notes.push(termNote);
    if (result.days < 5) notes.push('나이스에 자료가 없는 요일(공휴일 등)은 지금 시간표 그대로 둬요');
    $('tt-neis-info').textContent = notes.join(' · ');
    $('tt-neis-save').disabled = saving || !cells.length;
  }

  async function load() {
    const my = ++gen;
    rows = [];
    result = null;
    loadedFor = '';
    termNote = '';
    $('tt-neis-msg').textContent = '';
    $('tt-neis-status').textContent = '나이스에서 이번 주·다음 주 시간표를 불러오는 중…';
    $('tt-neis-step1').hidden = true;
    $('tt-neis-step2').hidden = true;
    $('tt-neis-step3').hidden = true;
    try {
      const mon = T.weekMonday(C.fromYmd(seoul().ymd));
      const from = C.ymd(mon);
      const to = C.ymd(C.addDays(mon, 11)); // 다음 주 금요일
      const asked = schoolId();
      const r = await api('GET', `/api/neis/timetable?from=${from}&to=${to}`);
      if (my !== gen || !$('tt-neis').open || asked !== schoolId()) return; // 창을 닫았거나 학교가 바뀜
      const one = N.oneTerm(r?.rows || []);
      rows = one.rows;
      loadedFor = asked;
      if (one.dropped) termNote = '학기가 바뀌는 주라서 새 학기 시간표만 썼어요';
      if (!rows.length) {
        $('tt-neis-status').textContent = '나이스에 아직 이번 주·다음 주 시간표가 없어요. 학교가 나이스에 시간표를 입력하면 나와요. 그동안은 [표 붙여넣기]나 편집으로 넣어 주세요.';
        return;
      }
      $('tt-neis-status').textContent = `${state.data.settings?.school?.name || '학교'} 시간표를 받았어요 (${from.slice(5).replace('-', '/')}–${to.slice(5).replace('-', '/')}).`;
      $('tt-neis-step1').hidden = false;
      renderSubjects();
      renderClasses();
    } catch (err) {
      if (my !== gen) return;
      $('tt-neis-status').textContent = '';
      $('tt-neis-msg').textContent = err.message;
    }
  }

  open.addEventListener('click', () => {
    $('tt-neis-q').value = '';
    $('tt-neis').showModal();
    load();
  });
  $('tt-neis-close').addEventListener('click', () => $('tt-neis').close());
  $('tt-neis').addEventListener('close', () => { gen += 1; }); // 닫으면 오는 중인 응답은 버림
  $('tt-neis-q').addEventListener('input', renderSubjects);
  $('tt-neis-keep').addEventListener('change', renderPreview);
  $('tt-neis-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!result) return;
    const keep = $('tt-neis-keep').checked;
    const cells = result.cells.filter((c) => c.lesson || !keep);
    if (!cells.length) return;
    if (saving) return;
    if (!loadedFor || loadedFor !== schoolId()) { $('tt-neis-msg').textContent = '학교가 바뀌었어요. 창을 닫았다가 다시 열어 주세요.'; return; }
    saving = true;
    const my = gen;
    $('tt-neis-save').disabled = true;
    try {
      await api('PUT', '/api/timetable/base-many', { cells });
      remember();
      if (my === gen) $('tt-neis').close(); // 그사이 창을 닫았다 다시 열었으면 새 창은 그대로
    } catch (err) {
      if (my === gen) $('tt-neis-msg').textContent = err.message;
    } finally {
      saving = false;
      if (my === gen) renderPreview();
    }
  });
})();
