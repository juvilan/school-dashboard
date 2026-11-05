// 웹판 전용: 구글 드라이브 칸. [파일 고르기] → 구글이 만든 파일 고르기 창(폴더를 오가며 고름)
// → 고른 파일은 아래 목록에 남는다. 윈도우(이 PC 설정 함): 이름 = 받아서 PC 프로그램으로 열기, [웹] = 드라이브 새 탭, [받기].
// 그 밖: 이름 = 드라이브 새 탭, [받기](이 PC 로, 구글 문서는 오피스 파일로).
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

  // 윈도우에서 이 PC 설정(sdash-dl:)이 있으면: 이름을 누르면 받아서 한글·엑셀·파워포인트로 바로 연다
  const local = () => Boolean(window.Dash?.openFile);
  function after(saved, t, opened) {
    const box = $('drive-msg');
    box.textContent = opened ? '받아서 여는 중이에요. 안 열리면 ' : '받았어요 (10분 안에 열 수 있어요). ';
    const open = el('button', 'linklike', '▶ 바로 열기');
    open.type = 'button';
    open.title = '이 PC 의 프로그램(한글·엑셀·파워포인트…)으로 열기';
    open.addEventListener('click', () => window.Dash.openFile(saved, t));
    const go = el('button', 'linklike', '📁 폴더');
    go.type = 'button';
    go.addEventListener('click', () => window.Dash.openDownloads());
    box.append(open, ' · ', go);
  }
  const busy = new Set(); // 받는 중인 파일 (두 번 눌러 두 번 받지 않게)
  async function get(f, btn, andOpen) {
    if (busy.has(f.id)) return;
    busy.add(f.id);
    if (btn) btn.disabled = true;
    msg(andOpen ? '받는 중…' : '');
    try {
      const t = Date.now();
      const saved = await D.download(f);
      if (!local()) { msg('다운로드 폴더에 받았어요.'); return; }
      if (andOpen) window.Dash.openFile(saved, t);
      after(saved, t, andOpen);
    } catch (err) { msg(err.message); } finally { busy.delete(f.id); if (btn) btn.disabled = false; }
  }

  function render() {
    const box = $('drive-list');
    box.textContent = '';
    for (const f of recent) {
      const li = el('li', 'drive-row');
      const url = safeUrl(f.url);
      const canGet = D.canDownload(f.mimeType || '');
      let name;
      if (canGet && local()) {
        name = el('button', 'drive-name linklike', f.name);
        name.type = 'button';
        name.title = '받아서 이 PC 의 프로그램으로 열기';
        name.disabled = busy.has(f.id);
        name.addEventListener('click', () => get(f, name, true));
      } else if (url) {
        name = el('a', 'drive-name', f.name);
        name.href = url; name.target = '_blank'; name.rel = 'noopener noreferrer'; name.title = '구글 드라이브에서 열기 (새 탭)';
      } else name = el('span', 'drive-name', f.name);
      li.append(el('span', 'drive-kind', kind(f.mimeType || '')), name);
      if (url && canGet && local()) {
        const web = el('a', 'ghost small-btn', '웹');
        web.href = url; web.target = '_blank'; web.rel = 'noopener noreferrer';
        web.title = '구글 드라이브에서 열기 (새 탭)';
        li.append(web);
      }
      if (canGet) {
        const dl = el('button', 'ghost small-btn', '받기');
        dl.type = 'button';
        dl.title = /google-apps/.test(f.mimeType) ? '오피스 파일로 바꿔서 이 PC 에 받기' : '이 PC 에 받기';
        dl.disabled = busy.has(f.id);
        dl.addEventListener('click', () => get(f, dl, false));
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
      li.append('[파일 고르기]를 누르면 구글 드라이브 폴더를 오가며 파일을 고를 수 있어요. 파일 하나를 고르면 바로 받아서 열어요(윈도우). 고른 파일은 여기 남아서 이름을 누르면 다시 열 수 있어요.');
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
        // 하나만 골랐으면 바로 받아서 연다 (윈도우 + 이 PC 설정을 한 PC)
        if (picked.length === 1 && local() && D.canDownload(picked[0].mimeType || '')) get(picked[0], null, true);
      }
    } catch (err) {
      msg(err.message);
    } finally {
      b.disabled = false;
    }
  });
  render();
  window.addEventListener('load', render); // golinks.js(이 PC 설정 버튼)가 뒤에 실린 다음 다시 그림
})();
