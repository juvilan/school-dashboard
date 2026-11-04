// 포스트잇 카드: 짧은 메모 여러 장. 쓰면 잠깐 뒤 저장, 색 바꾸기, × 로 지우기.
// 글을 쓰는 중인 장(포커스·저장 대기)은 다른 기기에서 온 내용으로 덮지 않는다.
(() => {
  const { state, api, listen, $ } = window.Dash;
  const COLORS = ['y', 'p', 'b', 'g', 'o'];
  // 아직 서버에 확실히 저장되지 않은 글: id -> { text, timer, sending }
  // 저장이 성공할 때까지 남겨 두고, 그동안 그 장은 다른 기기에서 온 내용으로 덮지 않는다.
  const pending = new Map();
  let focusAfter = null; // 새로 만든 장에 커서
  // 이 탭의 이름과 저장 순번: 서버가 늦게 도착한 옛 저장을 버릴 수 있게
  const TAB = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('');
  let seq = 0;
  const RETRY_MAX = 60e3;

  function schedule(id, text, ms = 600) {
    const d = pending.get(id) || { text, timer: null, sending: false, wait: 5000 };
    d.text = text;
    clearTimeout(d.timer);
    d.timer = setTimeout(() => flush(id), ms);
    pending.set(id, d);
  }

  // 한 장에 한 번에 하나씩 보낸다 (늦게 끝난 옛 요청이 새 글을 덮지 않게)
  async function flush(id) {
    const d = pending.get(id);
    if (!d || d.sending) return;
    clearTimeout(d.timer);
    d.sending = true;
    const sent = d.text;
    try {
      await api('PATCH', `/api/stickies/${id}`, { body: sent, tab: TAB, seq: ++seq });
      d.wait = 5000;
      $('sticky-msg').textContent = '';
      d.sending = false;
      if (pending.get(id) !== d) return; // 그사이 지움
      if (d.text === sent) pending.delete(id);
      else flush(id); // 보내는 사이 더 적었으면 이어서
    } catch (err) {
      d.sending = false;
      if (pending.get(id) !== d) return;
      if (err.status === 404) { pending.delete(id); return; } // 다른 기기에서 지운 장
      // 다시 보내도 안 될 오류(글자 수 초과 등)는 멈추고, 글은 남겨 둔다. 다음에 고쳐 쓰면 그때 다시 저장.
      if (err.status >= 400 && err.status < 500 && err.status !== 408 && err.status !== 429) {
        $('sticky-msg').textContent = `${err.message} (적은 글은 그대로 남아 있어요)`;
        return;
      }
      $('sticky-msg').textContent = `${err.message} (적은 글은 남겨 두고 다시 저장해요)`;
      d.timer = setTimeout(() => flush(id), d.wait);
      d.wait = Math.min(d.wait * 2, RETRY_MAX);
    }
  }

  function note(n) {
    const box = document.createElement('div');
    box.className = `sticky sticky-${n.color}`;
    box.dataset.id = n.id;
    const ta = document.createElement('textarea');
    ta.className = 'sticky-text';
    ta.maxLength = 500;
    ta.value = n.body;
    ta.placeholder = '메모…';
    ta.setAttribute('aria-label', '포스트잇');
    ta.addEventListener('input', () => schedule(n.id, ta.value));
    // 떠날 때 기다리던 저장은 바로
    ta.addEventListener('blur', () => { if (pending.has(n.id)) flush(n.id); });
    const foot = document.createElement('div');
    foot.className = 'sticky-foot';
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'sticky-color';
    c.textContent = '색';
    c.title = '색 바꾸기';
    c.addEventListener('click', () => {
      // 지금 색은 최신 상태에서 (이 요소를 만들 때의 색이 아니라)
      const now = (state.data.stickies || []).find((x) => x.id === n.id)?.color || n.color;
      const next = COLORS[(COLORS.indexOf(now) + 1) % COLORS.length];
      api('PATCH', `/api/stickies/${n.id}`, { color: next }).catch((err) => { $('sticky-msg').textContent = err.message; });
    });
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'sticky-del';
    d.textContent = '×';
    d.setAttribute('aria-label', '지우기');
    d.addEventListener('click', () => {
      clearTimeout(pending.get(n.id)?.timer);
      pending.delete(n.id);
      api('DELETE', `/api/stickies/${n.id}`).catch((err) => { $('sticky-msg').textContent = err.message; });
    });
    foot.append(c, d);
    box.append(ta, foot);
    return box;
  }

  function render() {
    const notes = state.data.stickies || [];
    const list = $('sticky-list');
    const busy = document.activeElement?.closest?.('.sticky');
    const busyId = busy ? Number(busy.dataset.id) : null;
    // 쓰는 중인 장은 그 요소를 그대로 두고, 나머지만 새로
    const keep = new Map();
    for (const el of list.querySelectorAll('.sticky')) {
      const id = Number(el.dataset.id);
      if (id === busyId || pending.has(id)) keep.set(id, el);
    }
    const nodes = notes.map((n) => {
      const k = keep.get(n.id);
      if (k) { k.className = `sticky sticky-${n.color}`; return k; }
      return note(n);
    });
    // replaceChildren 은 쓰는 중인 장까지 뺐다 넣어 커서가 풀린다 → 제자리인 요소는 건드리지 않는다
    const wanted = new Set(nodes);
    for (const el of [...list.children]) if (!wanted.has(el)) el.remove();
    let ref = list.firstChild;
    for (const node of nodes) {
      if (node === ref) { ref = ref.nextSibling; continue; }
      list.insertBefore(node, ref);
    }
    // 빈 목록 안내는 CSS(.sticky-list:empty::before)가 보여 준다
    if (focusAfter !== null) {
      list.querySelector(`.sticky[data-id="${focusAfter}"] .sticky-text`)?.focus();
      focusAfter = null;
    }
  }

  $('sticky-add').addEventListener('click', async () => {
    try {
      const { id } = await api('POST', '/api/stickies', { body: '', color: 'y' });
      focusAfter = id;
      if ((state.data.stickies || []).some((n) => n.id === id)) render();
      $('sticky-msg').textContent = '';
    } catch (err) {
      $('sticky-msg').textContent = err.message;
    }
  });
  // 페이지를 닫기 전에 기다리던 저장
  window.addEventListener('pagehide', () => {
    for (const [id, d] of pending) {
      clearTimeout(d.timer);
      api('PATCH', `/api/stickies/${id}`, { body: d.text, tab: TAB, seq: ++seq }, { keepalive: true }).catch(() => {});
    }
  });

  listen('stickies', render);
})();
