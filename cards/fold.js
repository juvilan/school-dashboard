// 오른쪽 칸 접기: 제목을 누르면 접었다 폈다. 기기마다 기억한다 (이 브라우저에만).
(() => {
  const KEY = 'dash-folded';
  const CARDS = ['card-spotify', 'card-clip', 'card-sticky', 'card-memo'];
  const DEFAULT = ['card-memo']; // 처음에는 공유 메모를 접어 둔다
  let folded;
  try { folded = new Set(JSON.parse(localStorage.getItem(KEY)) ?? DEFAULT); } catch { folded = new Set(DEFAULT); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...folded])); } catch { /* 저장 안 돼도 됨 */ } };

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
      const on = folded.has(id);
      card.classList.toggle('folded', on);
      btn.setAttribute('aria-expanded', String(!on));
      btn.title = on ? '펼치기' : '접기';
    };
    btn.addEventListener('click', () => {
      if (folded.has(id)) folded.delete(id); else folded.add(id);
      save();
      apply();
      if (!folded.has(id)) card.querySelector('textarea, input')?.dispatchEvent(new Event('dash-unfold'));
    });
    apply();
  }
})();
