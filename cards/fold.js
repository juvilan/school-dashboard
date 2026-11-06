// 오른쪽 칸 접기: 제목을 누르면 접었다 폈다. 기기마다 기억한다 (이 브라우저에만).
(() => {
  const KEY = 'dash-folded';
  const CARDS = ['card-clip', 'card-sticky', 'card-memo', 'card-ai'];
  const DEFAULT = ['card-memo']; // 처음에는 공유 메모를 접어 둔다
  let folded;
  try { folded = new Set(JSON.parse(localStorage.getItem(KEY)) ?? DEFAULT); } catch { folded = new Set(DEFAULT); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...folded])); } catch { /* 저장 안 돼도 됨 */ } };

  const applies = [];
  window.Dash = window.Dash || {};
  window.Dash.refold = () => applies.forEach((f) => f());
  for (const id of CARDS) {
    const card = document.getElementById(id);
    const h2 = card?.querySelector('.card-head h2');
    if (!h2) continue;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fold-btn';
    btn.append(document.createTextNode(h2.textContent), Object.assign(document.createElement('span'), { className: 'fold-mark', ariaHidden: 'true' }));
    h2.textContent = '';
    h2.append(btn);
    const apply = () => {
      // 반쪽 화면에서 서랍이 된 칸은 접지 않는다 (꺼냈는데 비어 보이지 않게)
      const docked = card.classList.contains('dock-card');
      const on = folded.has(id) && !docked;
      btn.tabIndex = docked ? -1 : 0; // 서랍 안에서는 접기 버튼이 아님
      card.classList.toggle('folded', on);
      btn.setAttribute('aria-expanded', String(!on));
      btn.title = on ? '펼치기' : '접기';
    };
    applies.push(apply);
    btn.addEventListener('click', () => {
      if (card.classList.contains('dock-card')) return;
      if (folded.has(id)) folded.delete(id); else folded.add(id);
      save();
      apply();
      if (!folded.has(id)) card.querySelector('textarea, input')?.dispatchEvent(new Event('dash-unfold'));
    });
    apply();
  }
})();
