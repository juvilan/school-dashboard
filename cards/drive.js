// 웹판 전용: 구글 드라이브 칸. [파일 고르기] → 구글이 만든 파일 고르기 창(폴더를 오가며 고름)
// → 고른 파일은 아래 목록에 남고, [열기](새 탭) · [받기](이 PC 로, 구글 문서는 오피스 파일로).
// 대시보드가 볼 수 있는 것은 선생님이 고른 파일뿐이다 (drive.file 권한). 목록은 이 브라우저에만.
(() => {
  const card = document.getElementById('card-drive');
  const D = window.DashDrive;
  if (!card || !D?.configured()) return;
  card.hidden = false;
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const KEY = 'dash-drive-recent';
  const MAX = 30;
  let recent = [];
  try { const r = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(r)) recent = r.filter((f) => f && typeof f.id === 'string' && typeof f.name === 'string').map((f) => ({ ...f, mimeType: String(f.mimeType || ''), url: String(f.url || '') })); } catch { /* 없음 */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(recent)); } catch { /* 이번 창만 */ } };
  const msg = (t) => { $('drive-msg').textContent = t || ''; };
  const safeUrl = (u) => (/^https:\/\/([a-z0-9-]+\.)*google\.com\//i.test(u) ? u : '');
  const KIND = { document: '문서', spreadsheet: '시트', presentation: '슬라이드', form: '설문', folder: '폴더', drawing: '그림' };
  const kind = (mime) => {
    const g = mime.match(/^application\/vnd\.google-apps\.(\w+)/);
    if (g) return KIND[g[1]] || '구글';
    if (mime === 'application/pdf') return 'PDF';
    if (/hwp/.test(mime)) return '한글';
    if (/word/.test(mime)) return '워드';
    if (/sheet|excel/.test(mime)) return '엑셀';
    if (/presentation|powerpoint/.test(mime)) return 'PPT';
    if (mime.startsWith('image/')) return '그림';
    return '파일';
  };

  function render() {
    const box = $('drive-list');
    box.textContent = '';
    for (const f of recent) {
      const li = el('li', 'drive-row');
      const url = safeUrl(f.url);
      const name = url ? el('a', 'drive-name', f.name) : el('span', 'drive-name', f.name);
      if (url) { name.href = url; name.target = '_blank'; name.rel = 'noopener noreferrer'; name.title = '새 탭으로 열기'; }
      li.append(el('span', 'drive-kind', kind(f.mimeType || '')), name);
      if (D.canDownload(f.mimeType || '')) {
        const dl = el('button', 'ghost small-btn', '받기');
        dl.type = 'button';
        dl.title = /google-apps/.test(f.mimeType) ? '오피스 파일로 바꿔서 이 PC 에 받기' : '이 PC 에 받기';
        dl.addEventListener('click', async () => {
          dl.disabled = true;
          msg('');
          try {
            await D.download(f);
            if (window.Dash?.openDownloads) {
              const box = $('drive-msg');
              box.textContent = '다운로드 폴더에 받았어요. ';
              const go = el('button', 'linklike', '📁 다운로드 폴더 열기');
              go.type = 'button';
              go.addEventListener('click', () => window.Dash.openDownloads());
              box.append(go);
            } else msg('다운로드 폴더에 받았어요.');
          } catch (err) { msg(err.message); } finally { dl.disabled = false; }
        });
        li.append(dl);
      }
      const x = el('button', 'ghost small-btn drive-x', '×');
      x.type = 'button';
      x.setAttribute('aria-label', `${f.name} 목록에서 빼기`);
      x.title = '목록에서 빼기 (드라이브의 파일은 그대로)';
      x.addEventListener('click', () => { recent = recent.filter((r) => r.id !== f.id); save(); render(); });
      li.append(x);
      box.append(li);
    }
    if (!recent.length) {
      const li = el('li', 'drive-empty muted small');
      li.append('[파일 고르기]를 누르면 구글 드라이브 폴더를 오가며 파일을 고를 수 있어요. 고른 파일은 여기 남아서 바로 열거나 받을 수 있어요.');
      box.append(li);
    }
  }

  $('drive-pick').addEventListener('click', async () => {
    const b = $('drive-pick');
    b.disabled = true;
    msg('');
    try {
      const picked = await D.pick();
      if (picked.length) {
        const ids = new Set(picked.map((p) => p.id));
        recent = [...picked.map((p) => ({ ...p, at: Date.now() })), ...recent.filter((r) => !ids.has(r.id))].slice(0, MAX);
        save();
        render();
      }
    } catch (err) {
      msg(err.message);
    } finally {
      b.disabled = false;
    }
  });
  render();
})();
