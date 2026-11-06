// 웹판 전용: AI 대화 칸. 두 가지로 대화한다.
//  - ChatGPT(구독): 같은 도우미가 PC 의 Codex CLI(setup.ps1 -Codex 로 설치)로 ChatGPT 계정에 묻는다.
//  - Claude: 선생님 PC 의 Claude Code(각자 구독). 브라우저는 PC 안의 AI 도우미(127.0.0.1:47615, web/ai/helper.ps1)에
//    질문을 보내고, 답을 글자 단위로 받는다.
//  - API 키로 (설치 없음, 브라우저가 바로 부름): Gemini 무료 키(Flash) · Gemini 유료 키(Pro) · OpenAI 유료 키(GPT).
//    무료 Gemini 한도가 차면 유료 키 쪽을 고르면 된다.
// 대화 기록은 이 브라우저(localStorage)에만 둔다. 어떤 서버로도 보내지 않는다.
(() => {
  const card = document.getElementById('card-ai');
  if (!card || document.body.dataset.host !== 'web') return;

  // 시험 기간에 쓰던 ?ai=1 주소(즐겨찾기 등)는 주소에서만 지운다
  try {
    if (new URLSearchParams(location.search).has('ai')) history.replaceState(null, '', location.pathname + location.hash);
    localStorage.removeItem('dash-ai');
  } catch { /* 없어도 됨 */ }
  card.hidden = false;

  const HELPER = 'http://127.0.0.1:47615';
  const HELPER_MIN = 1; // 이보다 옛 도우미면 다시 설치 안내
  const HELPER_MIN_CODEX = 3; // ChatGPT(Codex)를 처음 넣은 도우미 판
  const SETUP_URL = 'https://juvilan.github.io/school-dashboard/ai/setup.ps1';
  // Win+R 은 260자까지. TLS1.2(3072)를 켜야 옛 설정 PC 에서도 받아지고, 받기가 실패하면 창을 멈춰 오류를 보이게 한다
  const INSTALL_LINE = `powershell -NoProfile -ExecutionPolicy Bypass -c "[Net.ServicePointManager]::SecurityProtocol=3072;$f=$env:TEMP+'\\sdai-setup.ps1';try{iwr -useb ${SETUP_URL} -OutFile $f;& $f}catch{$_;pause}"`;
  const INSTALL_LINE_CODEX = INSTALL_LINE.replace('& $f}', '& $f -Codex}');
  const MAX_CHARS = 30000; // 한 번에 보낼 글 길이 (도우미 본문 한도 안)
  const SYSTEM = [
    '너는 한국 고등학교 선생님의 업무를 돕는 AI 도우미다. 학교 대시보드 안의 작은 대화창에서 대화한다.',
    '한국어로 답한다. 창이 작으니 핵심부터 간결하게 쓰고, 필요할 때만 짧은 목록이나 표를 쓴다.',
    '너는 파일을 읽거나 프로그램을 실행할 수 없고 대화만 할 수 있다. 긴 작업이나 파일 작업이 필요하면 카드 위의 [웹] 버튼으로 이 AI 의 웹사이트를 쓰라고 안내한다.',
    '학생 이름 같은 개인정보가 보이면 다음부터는 가리고 보내 달라고 짧게 안내한다.',
  ].join('\n');
  const STORE = 'dash-ai-convs';
  // 고를 수 있는 모델 (Claude Code 의 별명 → 늘 그 계열의 최신 모델). Claude 로 대화할 때는 Sonnet 이 알맞다
  const MODELS = [
    ['sonnet', 'Claude Sonnet (추천)', 'Claude 구독 필요. 대화·글쓰기에 알맞고, 사용 한도를 적당히 씀'],
    ['opus', 'Claude Opus (더 깊게)', 'Claude 구독 필요. 어려운 질문에 더 깊게 답하지만, 사용 한도가 훨씬 빨리 참'],
    ['haiku', 'Claude Haiku (가장 빠름)', 'Claude 구독 필요. 짧고 쉬운 질문용. 한도를 가장 적게 씀'],
    ['chatgpt', 'ChatGPT (구독)', 'ChatGPT Plus 등 구독 계정으로. 이 PC 에 한 번 설치 필요 (Codex)'],
    ['gemini', 'Gemini Flash (무료)', '구독 없이 무료 API 키로. 하루 쓸 수 있는 횟수가 정해져 있고, 보낸 내용이 구글 개선에 쓰일 수 있음'],
    ['gemini-pro', 'Gemini Pro (유료 키)', '결제를 등록한 Google API 키로. 쓴 만큼 요금이 나오고, 보낸 내용은 구글 개선에 쓰이지 않음'],
    ['gpt', 'GPT (OpenAI 유료 키)', 'OpenAI API 키로. 쓴 만큼 요금이 나옴 (ChatGPT Plus 구독과는 따로)'],
  ];
  // API 키로 부르는 쪽: 키와 쓸 모델 이름(키 확인 때 고름)을 이 브라우저에만 둔다
  const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta';
  const OPENAI_API = 'https://api.openai.com/v1';
  const APIS = {
    gemini: { store: 'dash-ai-gemini', name: 'Gemini', who: '무료 API 키', web: 'https://gemini.google.com/app' },
    'gemini-pro': { store: 'dash-ai-gemini-pro', name: 'Gemini Pro', who: '유료 API 키', web: 'https://gemini.google.com/app' },
    gpt: { store: 'dash-ai-gpt', name: 'GPT', who: 'OpenAI API 키', web: 'https://chatgpt.com/' },
  };
  const keys = {}; // 쪽 → { key, model }
  for (const [p, a] of Object.entries(APIS)) {
    try { const g = JSON.parse(localStorage.getItem(a.store)); if (g && typeof g.key === 'string' && typeof g.model === 'string') keys[p] = g; } catch { /* 없음 */ }
  }
  const isApi = (m = model) => Object.hasOwn(APIS, m);
  const isGemini = () => model === 'gemini';
  const isCodex = () => model === 'chatgpt';
  const V1 = () => (isCodex() ? '/v1/codex' : '/v1'); // 도우미 주소: ChatGPT 는 /v1/codex/…
  const MODEL_KEY = 'dash-ai-model';
  let model = 'gemini'; // 처음엔 설치 없이 바로 되는 Gemini 무료. Claude 구독이 있으면 골라서 설치
  try { const m = localStorage.getItem(MODEL_KEY); if (MODELS.some(([v]) => v === m)) model = m; } catch { /* 기본값 */ }
  const PLAN = { pro: 'Pro', max: 'Max', team: 'Team', enterprise: 'Enterprise', free: '무료' };
  const MAX_CONVS = 30;

  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const body = $('ai-body');
  const msg = (t) => { $('ai-msg').textContent = t || ''; };

  // ---- 도우미 부르기 ----
  async function call(method, path, data, signal) {
    const res = await fetch(HELPER + path, {
      method,
      // text/plain: 미리 묻기(preflight) 없이 바로. 도우미는 Origin 으로 대시보드인지 확인한다
      headers: data ? { 'Content-Type': 'text/plain;charset=UTF-8' } : {},
      body: data ? JSON.stringify(data) : undefined,
      cache: 'no-store',
      signal,
    });
    return res;
  }
  async function callJson(method, path, data) {
    const res = await call(method, path, data);
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(j.error || `도우미 오류 ${res.status}`); e.status = res.status; throw e; }
    return j;
  }

  // ---- 화면 상태 ----
  let view = '';
  let status = null;
  let pollTimer = null;
  let loginActive = false; // 로그인 창을 띄워 기다리는 중 (이때는 화면을 다시 그리지 않음)
  const stopPoll = () => { clearTimeout(pollTimer); pollTimer = null; };
  const visible = () => !document.hidden && !card.classList.contains('folded');

  let checkGen = 0; // 늦게 온 확인 결과가 그 사이 바뀐 화면(예: Gemini 로 바꿈)을 덮지 않게
  async function check() {
    stopPoll();
    const gen = ++checkGen;
    if (isApi()) return show(keys[model] ? 'chat' : 'gkey');
    let st = null;
    try {
      st = await callJson('GET', '/v1/status');
      try { localStorage.setItem('dash-ai-installed', '1'); } catch { /* 없어도 됨 */ }
    } catch {
      st = null;
    }
    const denied = st ? false : await lnaDenied();
    if (gen !== checkGen || isApi()) return;
    status = st;
    if (!status) return show('setup', { denied });
    if (isCodex()) {
      if (!(status.helper >= HELPER_MIN_CODEX)) return show('setup', { old: true });
      if (!status.codex) return show('setup', { noClaude: true });
      if (!status.codexLoggedIn) return show('login');
      return show('chat');
    }
    if (status.helper < HELPER_MIN) return show('setup', { old: true });
    if (!status.claude) return show('setup', { noClaude: true });
    if (!status.loggedIn) return show('login');
    return show('chat');
  }
  // 설치·로그인 화면에서는 저절로 다음으로 넘어가게 가끔 다시 본다
  function pollLater(ms) {
    stopPoll();
    pollTimer = setTimeout(() => { if (visible() && !loginActive) check(); else pollLater(ms); }, ms);
  }

  function show(v, opt = {}) {
    if (busy) { busy.abort(); busy = null; }
    loginGen++; // 앞 화면에서 시작한 로그인 확인(늦게 온 응답·타이머)은 버린다
    if (v !== 'login') { loginActive = false; clearTimeout(loginTimer); }
    view = v;
    body.textContent = '';
    msg('');
    $('ai-new').hidden = v !== 'chat';
    $('ai-history').hidden = v !== 'chat';
    renderBar();
    if (v === 'setup') renderSetup(opt);
    else if (v === 'login') renderLogin();
    else if (v === 'gkey') renderGeminiKey();
    else if (v === 'chat') renderChat();
  }

  // ---- 맨 위 줄: 모델 고르기 + 누구로 대화하는지 (어느 화면에서나) ----
  function renderBar() {
    const bar = el('div', 'ai-bar');
    const sel = el('select', 'ai-model');
    sel.setAttribute('aria-label', '모델');
    for (const [v, label, tip] of MODELS) { const o = new Option(label, v); o.title = tip; sel.append(o); }
    sel.value = model;
    sel.title = MODELS.find(([v]) => v === model)[2];
    sel.addEventListener('change', () => {
      keyGen++;
      const was = model;
      model = sel.value;
      sel.title = MODELS.find(([v]) => v === model)[2];
      try { localStorage.setItem(MODEL_KEY, model); } catch { /* 이번 창에서만 */ }
      // 대화하는 곳(Claude·ChatGPT·키로 부르는 쪽)이 바뀌면 그쪽 준비 상태로 (설치·로그인·키 넣기)
      const where = (m) => (isApi(m) ? m : m === 'chatgpt' ? 'codex' : 'claude');
      if (where(was) !== where(model) || view !== 'chat') check();
    });
    bar.append(sel);
    const who = el('span', 'ai-who');
    if (view === 'chat' && isApi()) {
      who.append(el('span', 'muted', `${APIS[model].name} `), el('strong', '', APIS[model].who));
      who.title = '이 브라우저에 넣어 둔 API 키로 대화해요.';
      const ch = el('button', 'linklike small', '키 바꾸기');
      ch.type = 'button';
      ch.addEventListener('click', () => show('gkey'));
      bar.append(who, ch);
    } else if (view === 'chat') {
      const cx = isCodex();
      const plan = cx ? status?.codexPlan : status?.plan;
      who.append(el('span', 'muted', '계정 '), el('strong', '', (cx ? status?.codexEmail : status?.email) || '알 수 없음'));
      if (plan) who.append(el('span', 'ai-plan', PLAN[plan] || plan));
      who.title = cx ? '이 PC 의 AI 도우미에 로그인된 ChatGPT 계정이에요. 대화는 이 계정의 구독 한도를 써요.' : '이 PC 의 Claude Code 에 로그인된 계정이에요. 대화는 이 계정의 구독 한도를 써요.';
      const sw = el('button', 'linklike small', '다른 계정으로');
      sw.type = 'button';
      sw.addEventListener('click', async () => {
        if (sw.dataset.armed !== '1') { sw.dataset.armed = '1'; sw.textContent = '한 번 더 누르면 로그아웃 후 다시 로그인'; setTimeout(() => { sw.dataset.armed = ''; sw.textContent = '다른 계정으로'; }, 3000); return; }
        try { await callJson('POST', `${V1()}/logout`); } catch { /* 아래에서 다시 확인 */ }
        await check();
        msg(`다른 계정으로 들어가려면 먼저 브라우저의 ${isCodex() ? 'chatgpt.com' : 'claude.ai'} 에서도 로그아웃해 주세요. 안 그러면 같은 계정으로 다시 들어가요.`);
      });
      bar.append(who, sw);
    }
    body.append(bar);
    // 머리의 웹·앱 바로가기도 고른 쪽으로
    const web = $('ai-web');
    web.href = isApi() ? APIS[model].web : isCodex() ? 'https://chatgpt.com/' : 'https://claude.ai/new';
    web.title = isApi() ? `${APIS[model].name} 웹사이트를 새 창으로` : isCodex() ? 'ChatGPT 를 새 창으로' : 'claude.ai 를 새 창으로';
    $('ai-app').hidden = isApi() || isCodex();
  }

  // ---- API 키 넣기 (Gemini 무료·유료, GPT) ----
  let keyGen = 0;
  const link = (href, text) => {
    const a = el('a', '', text);
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  };
  function renderGeminiKey() {
    const p = model;
    const box = el('div', 'ai-setup');
    const ol = el('ol', 'ai-steps');
    const more = el('details', 'ai-more');
    more.append(el('summary', '', '알아 둘 것'));
    if (p === 'gpt') {
      box.append(el('p', '', keys[p] ? '새 키를 넣으면 바뀌어요.' : 'OpenAI(ChatGPT 만든 곳)의 API 키로 GPT 와 대화해요. 쓴 만큼 요금이 나와요. ChatGPT Plus 구독과는 따로라서, API 쪽에 결제(크레딧)를 따로 넣어야 해요.'));
      const li1 = el('li');
      li1.append(link('https://platform.openai.com/api-keys', 'OpenAI API 키 페이지 열기'), ' (새 창으로 열려요)');
      ol.append(li1);
      const li2 = el('li');
      li2.append('로그인하고, 처음이면 ', link('https://platform.openai.com/settings/organization/billing/overview', 'Billing(결제)'), '에서 카드를 등록하고 크레딧을 조금(예: 5달러) 넣어요.');
      ol.append(li2);
      const li3 = el('li');
      li3.append(el('strong', '', 'Create new secret key'), '를 눌러 만든 키(sk- 로 시작)를 복사해요. 키는 이때 한 번만 보여요.');
      ol.append(li3);
      more.append(el('p', 'small muted', 'API 로 보낸 내용은 OpenAI 가 모델 학습에 쓰지 않아요 (OpenAI 정책). 그래도 학생 이름 같은 개인정보는 넣지 마세요.'));
      more.append(el('p', 'small muted', '요금이 걱정되면 Billing 의 Limits 에서 한 달 한도를 정해 두세요. 대화 한 번은 보통 몇 원~수십 원이에요.'));
    } else {
      const paid = p === 'gemini-pro';
      box.append(el('p', '', keys[p] ? '새 키를 넣으면 바뀌어요.'
        : paid ? '결제를 등록한 Google API 키로 더 똑똑한 Gemini Pro 와 대화해요. 쓴 만큼 요금이 나오고, 무료 한도에 묶이지 않아요.'
          : '구독 없이 무료로 쓸 수 있어요. 처음 한 번만 Google 에서 "API 키"(이 칸이 Gemini 를 부를 때 쓰는 비밀번호 같은 글자)를 받아 붙여넣어 주세요.'));
      const li1 = el('li');
      li1.append(link('https://aistudio.google.com/apikey', 'Google AI Studio 열기'), ' (새 창으로 열려요)');
      ol.append(li1);
      ol.append(el('li', '', '구글 계정으로 로그인해요. 개인 Gmail 계정을 권해요 (학교·교육청 계정은 막혀 있을 수 있어요). 처음이면 약관에 동의해요.'));
      const li3 = el('li');
      if (paid) li3.append('키 옆의 ', el('strong', '', 'Set up billing'), '(결제 설정)으로 카드를 등록해요. 무료로 쓰던 키도 결제를 등록하면 그대로 유료 키가 돼요. 그다음 키 옆의 복사 버튼을 눌러요.');
      else li3.append(el('strong', '', 'API 키 만들기'), '(Create API key)를 누르고, 만들어진 키 옆의 복사 버튼을 눌러요. 키는 영문·숫자가 섞인 긴 글자예요.');
      ol.append(li3);
      if (paid) more.append(el('p', 'small muted', '결제를 등록한 키는 보낸 내용이 구글의 서비스 개선에 쓰이지 않아요. 요금이 걱정되면 Google Cloud 의 예산 알림을 정해 두세요. 학생 이름 같은 개인정보는 넣지 마세요.'));
      else {
        more.append(el('p', 'small muted', '무료 등급은 결제(카드)를 등록하지 않았다면 요금이 나오지 않아요. 대신 하루에 쓸 수 있는 횟수가 정해져 있고, 보낸 내용이 구글의 서비스 개선에 쓰이거나 사람이 볼 수도 있어요. 학생 이름 같은 개인정보는 절대 넣지 마세요.'));
        more.append(el('p', 'small muted', '무료 한도가 자주 차면, 키에 결제를 등록하고 위에서 "Gemini Pro (유료 키)"를 골라 쓰면 돼요.'));
      }
    }
    ol.append(el('li', '', '아래 칸에 붙여넣고 [연결]을 눌러요.'));
    box.append(ol);
    const f = el('form', 'ai-code');
    const inp = el('input');
    inp.type = 'password';
    inp.placeholder = 'API 키 붙여넣기';
    inp.autocomplete = 'off';
    inp.spellcheck = false;
    inp.setAttribute('aria-label', `${APIS[p].name} API 키`);
    const go = el('button', 'small-btn', '연결');
    f.append(inp, go);
    const connect = async (key) => {
      // 키 모양은 회사가 바꾸기도 해서 엄격히 보지 않는다 (맞는지는 아래에서 물어 확인). 머리글에 넣을 수 있는 글자만.
      if (!/^[\x21-\x7e]{20,300}$/.test(key)) { msg('키가 너무 짧거나 쓸 수 없는 글자가 있어요. 복사한 키를 그대로 붙여넣어 주세요.'); return; }
      go.disabled = true;
      msg('');
      const gen = ++keyGen;
      try {
        const m = p === 'gpt' ? await pickGptModel(key) : await pickGeminiModel(key, p === 'gemini-pro');
        if (gen !== keyGen || view !== 'gkey' || model !== p || !body.contains(f)) return; // 그 사이 지우기·화면 바꿈
        keys[p] = { key, model: m };
        try { localStorage.setItem(APIS[p].store, JSON.stringify(keys[p])); } catch { msg('이 브라우저에 키를 저장하지 못했어요. 이번 창에서만 쓸 수 있어요.'); }
        show('chat');
      } catch (err) {
        if (gen === keyGen) msg(err.message);
      } finally {
        go.disabled = false;
      }
    };
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      connect(inp.value.replace(/\s+/g, '')); // 복사할 때 끼어든 빈칸·줄바꿈은 뺀다
    });
    box.append(f);
    // 무료로 넣어 둔 키에 결제를 등록했다면 그 키 그대로
    if (p === 'gemini-pro' && !keys[p] && keys.gemini) {
      const same = el('button', 'linklike small', '무료에 넣어 둔 키에 결제를 등록했어요 → 그 키로 연결');
      same.type = 'button';
      same.addEventListener('click', () => connect(keys.gemini.key));
      box.append(same);
    }
    box.append(more);
    more.append(el('p', 'small muted', '키는 이 PC 의 이 브라우저에만 저장돼요. 다른 사람에게 키를 알려 주지 마세요. 필요 없어지면 키를 만든 곳에서 지우면 바로 못 쓰게 돼요.'));
    if (keys[p]) {
      const del = el('button', 'ghost small-btn', '저장된 키 지우기');
      del.type = 'button';
      del.addEventListener('click', () => {
        keyGen++; // 진행 중인 [연결]이 끝나도 다시 저장하지 않게
        delete keys[p];
        try { localStorage.removeItem(APIS[p].store); } catch { /* 없음 */ }
        show('gkey');
        msg('키를 지웠어요.');
      });
      box.append(del);
    }
    body.append(box);
    inp.focus({ preventScroll: true });
  }
  // 키가 맞는지 보고, 쓸 수 있는 모델 중 가장 알맞은 것을 고른다 (이름이 바뀌어도 따라가게). pro: 유료 키면 Pro
  async function pickGeminiModel(key, pro = false) {
    let res;
    try {
      res = await fetch(`${GEMINI_API}/models?pageSize=200`, { headers: { 'x-goog-api-key': key }, cache: 'no-store' });
    } catch {
      throw new Error('Google 에 닿지 않아요. 인터넷 연결을 확인해 주세요.');
    }
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(/API_KEY_INVALID|API key not valid/i.test(JSON.stringify(j)) ? '키가 맞지 않아요. 다시 복사해 붙여넣어 주세요.' : `키를 확인하지 못했어요. (${j.error?.message || res.status})`);
    const names = (j.models || []).filter((m) => (m.supportedGenerationMethods || []).includes('generateContent')).map((m) => String(m.name).replace(/^models\//, ''));
    const kind = pro ? 'pro' : 'flash';
    if (names.includes(`gemini-${kind}-latest`)) return `gemini-${kind}-latest`;
    const re = new RegExp(`^gemini-[\\d.]+-${kind}$`);
    const best = names.filter((n) => re.test(n)).sort((a, b) => parseFloat(b.slice(7)) - parseFloat(a.slice(7)));
    if (best.length) return best[0];
    const any = names.find((n) => n.includes(kind) && !/image|tts|live|audio|embed/.test(n));
    if (any) return any;
    throw new Error(`이 키로 쓸 수 있는 Gemini ${pro ? 'Pro' : 'Flash'} 모델이 없어요.`);
  }
  // OpenAI: 키를 확인하고, 대화용 GPT 중 가장 새것(gpt-숫자)을 고른다. 없으면 mini
  async function pickGptModel(key) {
    let res;
    try {
      res = await fetch(`${OPENAI_API}/models`, { headers: { Authorization: `Bearer ${key}` }, cache: 'no-store' });
    } catch {
      throw new Error('OpenAI 에 닿지 않아요. 인터넷 연결을 확인해 주세요.');
    }
    const j = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error('키가 맞지 않아요. 다시 복사해 붙여넣어 주세요.');
    if (!res.ok) throw new Error(`키를 확인하지 못했어요. (${j.error?.message || res.status})`);
    const ids = (j.data || []).map((m) => String(m.id));
    const ver = (id) => parseFloat(id.slice(4));
    const pick = (re) => ids.filter((n) => re.test(n)).sort((a, b) => ver(b) - ver(a))[0];
    const m = pick(/^gpt-\d+(\.\d+)?$/) || pick(/^gpt-\d+(\.\d+)?-mini$/) || pick(/^gpt-\d+(\.\d+)?o$/);
    if (!m) throw new Error('이 키로 쓸 수 있는 GPT 모델이 없어요.');
    return m;
  }

  // ---- 1) 설치 안내 ----
  // 크롬·엣지의 "로컬 네트워크 접근"을 거절했는지 (거절했으면 다시 설치해도 안 되므로 따로 안내)
  async function lnaDenied() {
    try { return (await navigator.permissions.query({ name: 'local-network-access' })).state === 'denied'; } catch { return false; }
  }
  function renderSetup({ old, noClaude, denied }) {
    if (denied) {
      const box = el('div', 'ai-setup');
      box.append(el('p', '', '이 브라우저가 "로컬 네트워크 접근"을 막고 있어서 PC 의 AI 도우미에 닿지 못해요.'));
      box.append(el('p', 'small', '주소창 왼쪽의 사이트 정보(자물쇠 모양) → "로컬 네트워크 접근"(또는 "로컬 네트워크의 기기") → 허용으로 바꾼 뒤 새로고침해 주세요.'));
      body.append(box);
      pollLater(4000);
      return;
    }
    let installedBefore = false;
    try { installedBefore = localStorage.getItem('dash-ai-installed') === '1'; } catch { /* 처음으로 봄 */ }
    const box = el('div', 'ai-setup');
    const cx = isCodex();
    const LINE = cx ? INSTALL_LINE_CODEX : INSTALL_LINE;
    if (cx && old) box.append(el('p', '', 'ChatGPT 로 대화하려면 아래 설치 줄을 한 번 실행해 주세요. (Claude 는 그대로 쓸 수 있어요)'));
    else if (old) box.append(el('p', '', 'AI 도우미가 새로 나왔어요. 아래 설치 줄을 한 번 더 실행해 주세요.'));
    else if (cx && noClaude) box.append(el('p', '', 'ChatGPT 로 대화하려면 이 PC 에 Codex(OpenAI 공식 프로그램)를 한 번 설치해야 해요. 아래 설치 줄을 실행해 주세요.'));
    else if (noClaude) box.append(el('p', '', 'Claude Code 가 이 PC 에서 보이지 않아요. 아래 설치 줄을 한 번 더 실행해 주세요.'));
    else if (installedBefore) box.append(el('p', '', 'AI 도우미가 꺼져 있어요. PC 를 다시 켜면 저절로 켜지고, 바로 쓰려면 아래 설치 줄을 한 번 더 실행해 주세요. (브라우저가 "로컬 네트워크 접근"을 물었을 때 차단을 눌렀다면 허용으로 바꿔 주세요.)'));
    else box.append(el('p', '', cx ? '이 PC 에서 ChatGPT 구독(Plus 등)으로 여기서 바로 대화할 수 있어요. 처음 한 번만 설치해 주세요.' : '이 PC 의 Claude 구독으로 여기서 바로 대화할 수 있어요. 처음 한 번만 설치해 주세요.'));
    const alt = el('p', 'small');
    const toG = el('button', 'linklike', 'Gemini 무료로 쓰기');
    toG.type = 'button';
    toG.addEventListener('click', () => { model = 'gemini'; try { localStorage.setItem(MODEL_KEY, model); } catch { /* 이번 창만 */ } check(); });
    alt.append(cx ? 'ChatGPT 구독이 없으면: ' : 'Claude 구독이 없으면: ', toG, ' (설치 없이 키만 넣으면 돼요)');
    box.append(alt);
    const ol = el('ol', 'ai-steps');
    const li1 = el('li');
    const copy = el('button', 'small-btn', '설치 줄 복사');
    copy.type = 'button';
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(LINE); copy.textContent = '복사됨 ✓'; } catch { msg('복사가 안 됐어요. 아래 줄을 직접 골라 복사해 주세요.'); line.hidden = false; }
    });
    li1.append(copy);
    ol.append(li1);
    const li2 = el('li');
    li2.append('키보드에서 ', el('kbd', '', 'Windows'), ' + ', el('kbd', '', 'R'), ' 을 누르고, ', el('kbd', '', 'Ctrl'), ' + ', el('kbd', '', 'V'), ' 로 붙여넣은 뒤 ', el('kbd', '', 'Enter'));
    ol.append(li2);
    ol.append(el('li', '', `파란 창에서 설치가 끝나면 창을 닫고 여기로 돌아오세요. 처음엔 프로그램(약 ${cx ? '180' : '340'}MB)을 받느라 ${cx ? '2~10' : '3~15'}분 걸릴 수 있어요.`));
    box.append(ol);
    const line = el('code', 'ai-line', LINE);
    line.hidden = true;
    box.append(line);
    const more = el('details', 'ai-more');
    more.append(el('summary', '', '무엇이 설치되나요?'));
    more.append(el('p', 'small muted', cx ? 'OpenAI 의 Codex(공식 프로그램, npm 공식 저장소에서 받아 맞는 파일인지 확인)와, 대시보드가 이 PC 의 Codex 에 질문을 넘기게 해 주는 작은 도우미예요. 도우미는 이 PC 안에서만 동작하고, 명령 실행·파일 고치기·웹 검색을 모두 끄고 대화만 하도록 실행해요. 브라우저가 "로컬 네트워크의 기기에 접근"을 물으면 허용을 눌러 주세요.' : 'Anthropic 의 Claude Code(공식 프로그램)와, 대시보드가 이 PC 의 Claude Code 에 질문을 넘기게 해 주는 작은 도우미예요. 도우미는 이 PC 안에서만 동작하고, 파일을 읽거나 고치지 못하게 대화만 하도록 실행해요. 브라우저가 "로컬 네트워크의 기기에 접근"을 물으면 허용을 눌러 주세요.'));
    more.append(el('p', 'small muted', `지우려면: 설치 줄 끝의 & $f${cx ? ' -Codex' : ''} 를 & $f -Uninstall 로 바꿔 실행하면 돼요.`));
    box.append(more);
    body.append(box);
    pollLater(4000);
  }

  // ---- 2) 로그인 ----
  function renderLogin() {
    const box = el('div', 'ai-setup');
    box.append(el('p', '', isCodex() ? '설치됐어요. 이제 ChatGPT 계정으로 로그인해 주세요. (Plus 이상 구독 계정)' : '설치됐어요. 이제 Claude 계정으로 로그인해 주세요. (Pro 이상 구독 계정)'));
    const btn = el('button', '', isCodex() ? 'ChatGPT 로그인' : 'Claude 로그인');
    btn.type = 'button';
    const info = el('div', 'ai-login-info');
    btn.addEventListener('click', () => startLogin(btn, info));
    box.append(btn, info);
    body.append(box);
    pollLater(10000);
  }
  let loginGen = 0;
  async function startLogin(btn, info, restart) {
    const my = loginGen;
    btn.disabled = true;
    stopPoll();
    try {
      if (restart) await callJson('POST', `${V1()}/login/cancel`).catch(() => {});
      const st = await callJson('POST', `${V1()}/login`);
      loginWatch(st, info, btn, my);
    } catch {
      btn.disabled = false;
      loginActive = false;
      msg('도우미에 닿지 않아요. 잠시 뒤 다시 눌러 주세요.');
      pollLater(4000);
    }
  }
  let loginTimer = null;
  function loginWatch(st, info, btn, my) {
    if (my !== loginGen || !info.isConnected) return; // 그 사이 다른 화면·다른 쪽(Claude↔ChatGPT)으로 바뀜
    clearTimeout(loginTimer);
    if (view !== 'login') return;
    if (st.running) {
      loginActive = true;
      // 처음 한 번만 그리고, 그 뒤에는 링크·코드 칸만 켜고 끈다 (적던 코드가 지워지지 않게)
      if (!info.firstChild) {
        info.append(el('p', '', `브라우저에 열린 ${isCodex() ? 'ChatGPT' : 'Claude'} 창에서 로그인해 주세요. 끝나면 저절로 넘어가요.`));
        const a = el('a', 'ai-login-link', '창이 안 열렸으면 여기를 눌러 주세요');
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.hidden = true;
        info.append(el('p', 'small', ''), a);
        const f = el('form', 'ai-code');
        f.hidden = true;
        const inp = el('input');
        inp.placeholder = '로그인 뒤 받은 코드를 붙여넣기';
        inp.autocomplete = 'off';
        const go = el('button', 'small-btn', '넣기');
        f.append(inp, go);
        f.addEventListener('submit', async (e) => {
          e.preventDefault();
          if (!inp.value.trim() || go.disabled) return;
          go.disabled = true;
          try { const r = await callJson('POST', `${V1()}/login/code`, { code: inp.value.trim() }); inp.value = ''; loginWatch(r, info, btn, my); } catch { msg('코드를 넘기지 못했어요.'); } finally { go.disabled = false; }
        });
        const again = el('button', 'ghost small-btn', '로그인 창 다시 띄우기');
        again.type = 'button';
        again.addEventListener('click', () => { clearTimeout(loginTimer); info.textContent = ''; startLogin(btn, info, true); });
        info.append(f, again);
      }
      const a = info.querySelector('.ai-login-link');
      if (st.url) { a.href = st.url; a.hidden = false; }
      if (/paste|authorization code|enter (the )?code|코드를/i.test((st.tail || '').replace(/https?:\/\/\S+/g, ''))) info.querySelector('.ai-code').hidden = false;
      loginTimer = setTimeout(async () => {
        try { loginWatch(await callJson('GET', `${V1()}/login`), info, btn, my); } catch { loginWatch({ running: false }, info, btn, my); }
      }, 2000);
      return;
    }
    // 로그인 과정이 끝남 → 됐는지 확인
    loginActive = false;
    info.textContent = '';
    check().then(() => {
      if (view === 'login') {
        btn.disabled = false;
        msg('로그인이 끝나지 않았어요. 다시 눌러 주세요.');
      }
    });
  }

  // ---- 3) 대화 ----
  let convs = [];
  try { convs = JSON.parse(localStorage.getItem(STORE)) || []; } catch { convs = []; }
  if (!Array.isArray(convs)) convs = [];
  // 답을 받는 중에 창을 닫아 빈 답이 저장된 경우
  for (const c of convs) for (const m of c.msgs || []) if (m.r === 'a' && !m.t && !m.err) m.err = '답을 받기 전에 창이 닫혔어요.';
  let cur = null; // 지금 보는 대화
  let busy = null; // 답을 받는 중이면 AbortController
  // 가득 차면 오래된 대화부터 덜어 내고, 그래도 안 되면 알린다
  const save = () => {
    convs.sort((a, b) => b.at - a.at);
    convs = convs.slice(0, MAX_CONVS);
    for (;;) {
      try { localStorage.setItem(STORE, JSON.stringify(convs.map(strip))); return true; } catch {
        if (convs.length <= 1) break;
        convs = convs.slice(0, Math.floor(convs.length / 2));
      }
    }
    msg('이 대화가 너무 길어 브라우저에 저장하지 못했어요. 새로고침하면 사라질 수 있으니 [새 대화]로 시작해 주세요.');
    return false;
  };
  const strip = (c) => ({ ...c, msgs: c.msgs.map(({ r, t, err, note, model: mm }) => ({ r, t, ...(err ? { err } : {}), ...(note ? { note } : {}), ...(mm ? { model: mm } : {}) })) });
  const newConv = () => ({ id: crypto.randomUUID(), session: '', title: '', at: Date.now(), msgs: [] });

  let listEl;
  let inputEl;
  let sendBtn;
  function renderChat() {
    if (!cur) cur = newConv();
    listEl = el('div', 'ai-list');
    listEl.setAttribute('role', 'log');
    listEl.setAttribute('aria-live', 'polite');
    const form = el('form', 'ai-form');
    inputEl = el('textarea');
    inputEl.rows = 2;
    inputEl.placeholder = '물어보기 (Enter 보내기 · Shift+Enter 줄바꿈)';
    inputEl.setAttribute('aria-label', 'AI 에게 보낼 말');
    sendBtn = el('button', '', '보내기');
    sendBtn.type = 'submit';
    form.append(inputEl, sendBtn);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (busy) { busy.abort(); return; }
      const t = inputEl.value.trim();
      if (t) send(t);
    });
    const foot = el('p', 'ai-foot small muted');
    foot.append(isGemini() ? '무료 Gemini 는 보낸 내용이 구글 개선에 쓰일 수 있어요. 학생 이름 등 개인정보는 절대 넣지 마세요.' : model === 'gpt' || model === 'gemini-pro' ? '쓴 만큼 요금이 나와요. 학생 이름 등 개인정보는 넣지 마세요.' : '학생 이름 등 개인정보는 넣지 마세요.');
    body.append(listEl, form, foot);
    drawAll();
    renderHistory();
  }

  function drawAll() {
    listEl.textContent = '';
    if (!cur.msgs.length) listEl.append(el('p', 'ai-empty muted small', '무엇이든 물어보세요. 예: "가정통신문 첫 문단 다듬어 줘", "이 문장 더 짧게"'));
    for (const m of cur.msgs) listEl.append(bubble(m));
    listEl.scrollTop = listEl.scrollHeight;
  }
  function bubble(m) {
    const b = el('div', `ai-msg ai-${m.r === 'u' ? 'me' : 'bot'}${m.err ? ' ai-err' : ''}`);
    const t = el('div', 'ai-text');
    if (m.r === 'u') t.textContent = m.t;
    else renderMd(m.t || (m.err ? '' : '…'), t);
    b.append(t);
    if (m.err) b.append(el('p', 'small', m.err));
    if (m.note) b.append(el('p', 'small muted ai-note', m.note));
    if (m.r === 'a' && m.model && !m.pending) b.append(el('span', 'ai-model-tag muted', modelName(m.model)));
    if (m.r === 'a' && m.t && !m.pending) {
      const c = el('button', 'ghost small-btn ai-copy', '복사');
      c.type = 'button';
      c.addEventListener('click', async () => { try { await navigator.clipboard.writeText(m.t); c.textContent = '복사됨'; setTimeout(() => { c.textContent = '복사'; }, 1500); } catch { /* 무시 */ } });
      b.append(c);
    }
    m.node = b;
    return b;
  }

  async function send(text) {
    if (text.length > MAX_CHARS) { msg(`한 번에 ${MAX_CHARS.toLocaleString()}자까지 보낼 수 있어요. (지금 ${text.length.toLocaleString()}자) 나눠서 보내 주세요.`); return; }
    const conv = cur;
    msg('');
    inputEl.value = '';
    if (!conv.msgs.length) conv.title = text.slice(0, 40);
    const me = { r: 'u', t: text };
    const bot = { r: 'a', t: '', pending: true };
    conv.msgs.push(me, bot);
    conv.at = Date.now();
    if (!convs.includes(conv)) convs.unshift(conv);
    save(); // 답을 받는 중에 창을 닫아도 질문은 남게
    drawAll();
    renderHistory();
    const ctrl = new AbortController();
    busy = ctrl;
    sendBtn.textContent = '멈추기';
    let gotDelta = false;
    let gotResult = false;
    let lastBlock = -1;
    let errText = '';
    let raf = 0;
    const paint = () => {
      raf = 0;
      if (cur !== conv || !bot.node) return;
      const t = bot.node.querySelector('.ai-text');
      t.textContent = '';
      renderMd(bot.t || '…', t);
      const nearBottom = listEl.scrollHeight - listEl.scrollTop - listEl.clientHeight < 80;
      if (nearBottom) listEl.scrollTop = listEl.scrollHeight;
    };
    const handle = (line) => {
      let ev;
      try { ev = JSON.parse(line); } catch { return; }
      if (ev.type === 'system' && ev.subtype === 'init') {
        if (ev.session_id) conv.session = ev.session_id;
        if (ev.model) bot.model = ev.model;
      }
      else if (ev.type === 'stream_event') {
        const e = ev.event || {};
        if (e.type === 'content_block_start' && e.content_block?.type === 'text') {
          if (lastBlock >= 0 && bot.t) bot.t += '\n\n';
          lastBlock = e.index;
        } else if (e.type === 'content_block_delta' && e.delta?.type === 'text_delta') {
          gotDelta = true;
          bot.t += e.delta.text;
          if (!raf) raf = requestAnimationFrame(paint);
        }
      } else if (ev.type === 'assistant' && !gotDelta) {
        const t = (ev.message?.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n\n');
        if (t) { bot.t = t; if (!raf) raf = requestAnimationFrame(paint); }
      } else if (ev.type === 'result') {
        gotResult = true;
        if (ev.session_id) conv.session = ev.session_id;
        if (ev.is_error || (ev.subtype && ev.subtype !== 'success')) errText = String(ev.result || (ev.errors || []).join(' ') || ev.subtype || '오류');
      } else if (ev.type === 'helper_error') {
        errText = ev.stderr ? String(ev.stderr).trim().split('\n').slice(-3).join(' ') : '답을 받지 못했어요.';
      }
    };
    const useApi = isApi() ? model : '';
    const useCodex = isCodex();
    // Claude 가 아닌 쪽으로 보내면, 답을 다 받든 멈추든 Claude 쪽 대화는 이 질문을 모른다 → 다음 Claude 질문에 앞 대화를 글로 함께
    if (useApi || useCodex) conv.session = '';
    try {
      if (useApi) {
        if (!keys[useApi]) throw new Error('키를 먼저 넣어 주세요.');
        const onText = () => { if (!raf) raf = requestAnimationFrame(paint); };
        const r = useApi === 'gpt' ? await streamGpt(conv, bot, ctrl.signal, onText, keys.gpt) : await streamGemini(conv, bot, ctrl.signal, onText, keys[useApi], useApi);
        gotResult = r.done;
        errText = r.err || '';
        // Claude 쪽 대화는 이 답을 모른다 → 다음에 Claude 로 물으면 앞 대화를 글로 함께 보냄
        if (bot.t) conv.session = '';
      } else if (useCodex) {
        // ChatGPT(Codex): 대화 기록을 남기지 않으므로 앞 대화를 늘 글로 함께 보낸다. 답은 다 쓴 뒤 한 번에 온다
        const res = await call('POST', '/v1/codex/chat', { message: withHistory(conv, text), system: SYSTEM }, ctrl.signal);
        if (res.status === 429) throw new Error('다른 답을 받는 중이에요. 잠시 뒤 다시 보내 주세요.');
        if (res.status === 400 || res.status === 413) throw new Error('보낼 수 없는 글이에요. 너무 길면 나눠서 보내 주세요.');
        if (!res.ok || !res.body) throw new Error(`도우미 오류 ${res.status}`);
        bot.model = 'ChatGPT';
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = '';
        const handleCx = (line) => {
          let ev;
          try { ev = JSON.parse(line); } catch { return; }
          if (ev.type === 'item.completed' && ev.item?.type === 'agent_message' && typeof ev.item.text === 'string') {
            bot.t = ev.item.text; // 중간 말("확인해 볼게요" 등)은 마지막 답으로 바뀐다
            if (!raf) raf = requestAnimationFrame(paint);
          } else if (ev.type === 'turn.completed') gotResult = true;
          else if (ev.type === 'turn.failed') { gotResult = true; errText = String(ev.error?.message || '답을 받지 못했어요.'); }
          else if (ev.type === 'error') errText = String(ev.message || '오류');
          else if (ev.type === 'helper_error') errText = ev.stderr ? String(ev.stderr).trim().split('\n').slice(-3).join(' ') : '답을 받지 못했어요.';
          // item.completed 의 error(설정 안내 등)는 대화와 상관없어서 보이지 않는다
        };
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let i;
          while ((i = buf.indexOf('\n')) >= 0) { handleCx(buf.slice(0, i)); buf = buf.slice(i + 1); }
        }
        if (buf.trim()) handleCx(buf);
        if (bot.t && gotResult && /reconnect|stream/i.test(errText)) errText = ''; // 다시 이어 받아 끝난 경우
        conv.session = ''; // Claude 쪽 대화는 이 답을 모른다
      } else {
      // 이어 묻기가 안 되면(오래돼서 PC 쪽 기록이 지워짐, 다른 PC 등) 대화 번호 없이 한 번 더
      for (let attempt = 0; attempt < 2; attempt++) {
        errText = '';
        gotResult = false;
        // Claude 쪽 대화 번호가 없는데 앞 대화가 있으면(Gemini 로 하던 대화 등) 앞 대화를 같이 보낸다
        const res = await call('POST', '/v1/chat', { message: conv.session ? text : withHistory(conv, text), session: conv.session || undefined, system: SYSTEM, model }, ctrl.signal);
        if (res.status === 429) throw new Error('다른 답을 받는 중이에요. 잠시 뒤 다시 보내 주세요.');
        if (res.status === 400 || res.status === 413) throw new Error('보낼 수 없는 글이에요. 너무 길면 나눠서 보내 주세요.');
        if (!res.ok || !res.body) throw new Error(`도우미 오류 ${res.status}`);
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = '';
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let i;
          while ((i = buf.indexOf('\n')) >= 0) { handle(buf.slice(0, i)); buf = buf.slice(i + 1); }
        }
        if (buf.trim()) handle(buf);
        if (attempt === 0 && conv.session && !bot.t && /no conversation found|session.*not found|not a valid session/i.test(errText)) { conv.session = ''; bot.note = '앞 대화를 기억하지 못해 이 질문부터 새로 시작했어요.'; continue; }
        break;
      }
      }
      if (!bot.t && !errText) errText = '답이 비어 있어요.';
      else if (!gotResult && !errText) errText = '답이 중간에 끊겼어요. 다시 보내 주세요.';
    } catch (err) {
      if (ctrl.signal.aborted) errText = bot.t ? '(여기서 멈췄어요)' : '멈췄어요.';
      else if (err instanceof TypeError) errText = useApi === 'gpt' ? 'OpenAI 에 닿지 않아요. 인터넷 연결을 확인해 주세요.' : useApi ? 'Google 에 닿지 않아요. 인터넷 연결을 확인해 주세요.' : 'AI 도우미에 닿지 않아요. 도우미가 꺼졌을 수 있어요.';
      else errText = err.message;
    } finally {
      if (raf) cancelAnimationFrame(raf);
      if (busy === ctrl) { busy = null; if (sendBtn) sendBtn.textContent = '보내기'; }
      bot.pending = false;
      if (errText) bot.err = useApi ? errText : useCodex ? friendlyCodex(errText) : friendly(errText);
      conv.at = Date.now();
      if (convs.includes(conv)) save(); // 그 사이 "모두 지우기"를 했으면 되살리지 않음
      if (cur === conv && view === 'chat') drawAll();
      renderHistory();
      if (useApi) { if (/키가 맞지 않아요/.test(errText)) msg('키를 다시 넣어 주세요: 위의 [키 바꾸기]'); } else if (AUTH_RE.test(errText) || /닿지 않아요/.test(errText)) check();
    }
  }
  // 앞 대화를 글로 묶어 질문 앞에 붙인다 (Claude 쪽에 이어 갈 대화 번호가 없을 때)
  function withHistory(conv, text) {
    const all = conv.msgs.slice(0, -2);
    // 답을 못 받은 질문(오류·멈춤)은 뺀다
    const prev = all.filter((m, k) => m.t && !(m.r === 'u' && all[k + 1] && all[k + 1].r !== 'u' && !all[k + 1].t));
    if (!prev.length) return text;
    let h = prev.map((m) => `[${m.r === 'u' ? '선생님' : 'AI'}] ${m.t}`).join('\n\n');
    if (h.length > 20000) h = `…${h.slice(-20000)}`;
    return `(앞선 대화)\n${h}\n\n(이어서 질문)\n${text}`;
  }

  const QUOTA_MSG = 'Gemini 무료 한도에 닿았어요. 잠시 뒤(하루 한도라면 내일) 다시 쓸 수 있어요. 유료 키가 있으면 위에서 "Gemini Pro (유료 키)"나 GPT 를, Claude 구독이 있으면 Claude 를 골라도 돼요.';
  const PAID_QUOTA_MSG = 'Gemini 유료 키의 한도·결제에 문제가 있어요. Google AI Studio 에서 결제 상태와 한도를 확인해 주세요. 잠깐이면 위에서 "Gemini Flash (무료)"를 골라 쓸 수 있어요.';
  // 대화 기록 → [{ role: 'user'|'assistant', text }] (답을 못 받은 질문은 빼고, 같은 쪽이 이어지면 합치고, 너무 길면 앞부터 덜어 냄)
  function turns(conv) {
    const out = [];
    const msgs = conv.msgs.slice(0, -1); // 마지막은 지금 받을 빈 답
    for (let k = 0; k < msgs.length; k++) {
      const m = msgs[k];
      if (!m.t) continue;
      // 답을 못 받은 질문(오류·멈춤)은 빼서, 다시 보낸 같은 질문과 겹치지 않게
      if (m.r === 'u' && k + 1 < msgs.length && msgs[k + 1].r !== 'u' && !msgs[k + 1].t) continue;
      const role = m.r === 'u' ? 'user' : 'assistant';
      const last = out[out.length - 1];
      if (last && last.role === role) last.text += `\n\n${m.t}`; // 번갈아야 함
      else out.push({ role, text: m.t });
    }
    while (out.length && out[0].role !== 'user') out.shift();
    let total = out.reduce((n, c) => n + c.text.length, 0);
    while (total > 120000 && out.length > 1) { total -= out.shift().text.length; while (out.length && out[0].role !== 'user') total -= out.shift().text.length; }
    return out;
  }
  // SSE 본문을 줄 단위로
  async function readSse(res, handle) {
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf('\n')) >= 0) { handle(buf.slice(0, i).trim()); buf = buf.slice(i + 1); }
    }
    if (buf.trim()) handle(buf.trim());
  }
  // GPT (OpenAI Chat Completions): 대화 전체를 보내고 답을 SSE 로 조금씩 받는다
  async function streamGpt(conv, bot, signal, onText, k) {
    const messages = [{ role: 'system', content: SYSTEM }, ...turns(conv).map((c) => ({ role: c.role, content: c.text }))];
    const res = await fetch(`${OPENAI_API}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${k.key}` },
      body: JSON.stringify({ model: k.model, messages, stream: true }),
      signal,
    });
    if (!res.ok || !res.body) {
      const j = await res.json().catch(() => ({}));
      const code = `${j.error?.code || ''} ${j.error?.type || ''}`;
      if (res.status === 401) return { err: '키가 맞지 않아요 (지웠거나 바뀜). 위의 [키 바꾸기]로 새 키를 넣어 주세요.' };
      if (/insufficient_quota|billing/i.test(code)) return { err: 'OpenAI 크레딧이 없거나 결제가 등록되지 않았어요. platform.openai.com 의 Billing 에서 확인해 주세요.' };
      if (res.status === 429) return { err: 'OpenAI 사용 한도(분당 횟수 등)에 닿았어요. 잠시 뒤 다시 보내 주세요.' };
      if (res.status === 404) return { err: '고른 GPT 모델을 쓸 수 없어요. [키 바꾸기]에서 같은 키를 다시 넣으면 새 모델로 맞춰요.' };
      return { err: `OpenAI 에서 답을 받지 못했어요. 잠시 뒤 다시 보내 주세요. (${res.status} ${(j.error?.message || '').slice(0, 120)})` };
    }
    let done = false;
    let err = '';
    await readSse(res, (line) => {
      if (!line.startsWith('data:')) return;
      const data = line.slice(5).trim();
      if (data === '[DONE]') { done = true; return; }
      let ev;
      try { ev = JSON.parse(data); } catch { return; }
      if (ev.error) { err = `GPT 오류로 답이 멈췄어요. (${String(ev.error.message || '').slice(0, 120)})`; return; }
      if (ev.model) bot.model = ev.model;
      const c = ev.choices?.[0];
      const t = c?.delta?.content;
      if (typeof t === 'string' && t) { bot.t += t; onText(); }
      if (c?.finish_reason) {
        done = true;
        if (c.finish_reason === 'length') bot.note = '답이 길어 중간에서 끝났어요. "계속"이라고 보내면 이어서 써요.';
        else if (c.finish_reason === 'content_filter') err = '이 답은 OpenAI 의 안전 기준에 걸려 멈췄어요. 표현을 바꿔 보세요.';
      }
    });
    return { done, err };
  }
  // Gemini: 대화 전체를 보내고(서버에 대화 기록이 없음) 답을 SSE 로 조금씩 받는다
  async function streamGemini(conv, bot, signal, onText, gemini, which) {
    const paid = which === 'gemini-pro';
    const contents = turns(conv).map((c) => ({ role: c.role === 'user' ? 'user' : 'model', parts: [{ text: c.text }] }));
    const res = await fetch(`${GEMINI_API}/models/${encodeURIComponent(gemini.model)}:streamGenerateContent?alt=sse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': gemini.key },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM }] }, contents }),
      signal,
    });
    if (!res.ok || !res.body) {
      const j = await res.json().catch(() => ({}));
      const raw = `${j.error?.status || ''} ${j.error?.message || ''}`;
      if (res.status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(raw)) return { err: paid ? PAID_QUOTA_MSG : QUOTA_MSG };
      if (/API_KEY_INVALID|API key not valid|API key expired/i.test(raw)) return { err: '키가 맞지 않아요 (지웠거나 만료됨). 위의 [키 바꾸기]로 새 키를 넣어 주세요.' };
      if (res.status === 403) return { err: `이 키로는 Gemini 를 쓸 수 없어요. (${(j.error?.message || '권한 없음').slice(0, 120)})` };
      if (res.status === 404) return { err: '고른 Gemini 모델을 찾지 못했어요. [키 바꾸기]에서 같은 키를 다시 넣으면 새 모델로 맞춰요.' };
      return { err: `Gemini 에서 답을 받지 못했어요. 잠시 뒤 다시 보내 주세요. (${res.status} ${(j.error?.message || '').slice(0, 120)})` };
    }
    let done = false;
    let err = '';
    const handle = (line) => {
      if (!line.startsWith('data:')) return;
      let ev;
      try { ev = JSON.parse(line.slice(5)); } catch { return; }
      if (ev.error) { err = ev.error.status === 'RESOURCE_EXHAUSTED' ? (paid ? PAID_QUOTA_MSG : QUOTA_MSG) : `Gemini 오류로 답이 멈췄어요. (${String(ev.error.message || ev.error.status || '').slice(0, 120)})`; return; }
      if (ev.modelVersion) bot.model = ev.modelVersion;
      if (ev.promptFeedback?.blockReason) err = '이 질문에는 Gemini 가 답하지 않았어요 (안전 기준). 표현을 바꿔 보세요.';
      const c = ev.candidates?.[0];
      const t = (c?.content?.parts || []).filter((p) => typeof p.text === 'string' && !p.thought).map((p) => p.text).join('');
      if (t) { bot.t += t; onText(); }
      if (c?.finishReason) {
        done = true;
        const why = c.finishReason;
        if (why === 'MAX_TOKENS') bot.note = '답이 길어 중간에서 끝났어요. "계속"이라고 보내면 이어서 써요.';
        else if (/SAFETY|PROHIBITED|BLOCKLIST|SPII/.test(why)) err = '이 답은 Gemini 의 안전 기준에 걸려 멈췄어요. 표현을 바꿔 보세요.';
        else if (why === 'RECITATION') err = '이 답은 저작물 인용 문제로 Gemini 가 멈췄어요. 질문을 바꿔 보세요.';
        else if (why !== 'STOP') err = `Gemini 가 답을 끝까지 쓰지 못했어요. (사유: ${String(why).slice(0, 40)})`;
      }
    };
    await readSse(res, handle);
    return { done, err };
  }

  // claude-sonnet-5-5 → Sonnet 5.5, gemini-2.5-flash → Gemini 2.5 Flash
  function modelName(id) {
    const g = String(id).match(/^gemini-([\d.]+)-([a-z]+)(?:-(lite))?/);
    if (g) return `Gemini ${g[1]} ${g[2][0].toUpperCase()}${g[2].slice(1)}${g[3] ? '-Lite' : ''}`;
    const mm = String(id).match(/claude-([a-z]+)-(\d+)(?:-(\d+))?/);
    return mm ? `${mm[1][0].toUpperCase()}${mm[1].slice(1)} ${mm[2]}${mm[3] && mm[3].length <= 2 ? `.${mm[3]}` : ''}` : String(id);
  }
  function friendlyCodex(t) {
    if (/usage limit|rate limit|quota|limit reached|try again (in|at)/i.test(t)) return 'ChatGPT 사용 한도에 닿았어요. 잠시 뒤 다시 쓸 수 있어요. 급하면 위에서 다른 모델을 골라 주세요.';
    if (/log ?in|unauthori[sz]ed|\b401\b|token (has )?expired|refresh token|not signed in|authentication/i.test(t)) return '로그인이 풀렸어요. 다시 로그인해 주세요.';
    if (/plan|subscription|upgrade/i.test(t)) return '이 ChatGPT 계정으로는 쓸 수 없어요. Plus 이상 구독인지 확인해 주세요. (' + t.slice(0, 120) + ')';
    if (/context|too long|too many tokens/i.test(t)) return '대화가 너무 길어졌어요. [새 대화]로 시작해 주세요.';
    return t.slice(0, 300);
  }
  const AUTH_RE = /\/login|log ?in again|not logged in|logged out|unauthori[sz]ed|\b401\b|invalid api key|oauth token|authentication|credential/i;
  function friendly(t) {
    if (/\blimit\b|한도/i.test(t) && !/token/i.test(t)) return 'Claude 사용 한도에 닿았어요. 잠시 뒤(보통 몇 시간 안)에 다시 쓸 수 있어요.';
    if (AUTH_RE.test(t)) return '로그인이 풀렸어요. 다시 로그인해 주세요.';
    if (/too long|too many tokens|context/i.test(t)) return '대화가 너무 길어졌어요. [새 대화]로 시작해 주세요.';
    if (/model/i.test(t) && /model[^.]{0,40}(not (available|found|supported|allowed)|does not exist|no access|not have access)|(invalid|unknown) model|access to (this|the) model/i.test(t)) return '이 계정에서는 고른 모델을 쓸 수 없어요. 위에서 다른 모델(Sonnet)을 골라 주세요.';
    if (/git.?bash/i.test(t)) return 'Claude Code 실행에 필요한 Git 이 없어요. 관리자에게 알려 주세요. (' + t.slice(0, 120) + ')';
    return t.slice(0, 300);
  }

  // ---- 새 대화·지난 대화 ----
  $('ai-new').addEventListener('click', () => {
    if (busy) busy.abort();
    cur = newConv();
    if (view === 'chat') { drawAll(); inputEl.focus(); }
    renderHistory();
  });
  function renderHistory() {
    const sel = $('ai-history');
    sel.textContent = '';
    sel.append(new Option(convs.length ? `지난 대화 (${convs.length})` : '지난 대화 없음', ''));
    for (const c of convs) {
      const d = new Date(c.at);
      sel.append(new Option(`${d.getMonth() + 1}/${d.getDate()} ${c.title || '(제목 없음)'}`, c.id));
    }
    sel.append(new Option('— 지난 대화 모두 지우기', '__clear'));
    sel.value = '';
  }
  $('ai-history').addEventListener('change', (e) => {
    const v = e.target.value;
    e.target.value = '';
    if (!v) return;
    if (v === '__clear') {
      if (!confirmClear()) return;
      if (busy) busy.abort();
      // PC 쪽 Claude Code 에 남은 대화 기록도 지운다
      let installed = false;
      try { installed = localStorage.getItem('dash-ai-installed') === '1'; } catch { /* 모름 */ }
      if (installed || convs.some((x) => x.session)) callJson('POST', '/v1/forget', { all: true }).catch(() => msg('PC 쪽 기록은 지우지 못했어요. 도우미가 켜진 뒤 다시 지워 주세요.'));
      convs = [];
      save();
      cur = newConv();
    } else {
      const c = convs.find((x) => x.id === v);
      if (!c) return;
      if (busy) busy.abort();
      cur = c;
    }
    if (view === 'chat') drawAll();
    renderHistory();
  });
  // 확인 창(confirm)은 쓰지 않는다: 한 번 더 고르면 지움
  let clearArmed = 0;
  function confirmClear() {
    if (Date.now() - clearArmed < 4000) { clearArmed = 0; return true; }
    clearArmed = Date.now();
    msg('지난 대화를 모두 지우려면 한 번 더 골라 주세요.');
    return false;
  }

  // ---- Claude 웹·앱 바로가기 ----
  $('ai-app').addEventListener('click', () => {
    // 앱이 없으면 아무 일도 안 일어난다 → 잠시 뒤 이 창이 그대로면 안내
    const t = setTimeout(() => { if (document.hasFocus()) msg('Claude 앱이 열리지 않으면 claude.com/download 에서 설치할 수 있어요.'); }, 2000);
    window.addEventListener('blur', () => clearTimeout(t), { once: true });
  });

  // ---- 간단한 마크다운 (표·목록·굵게·코드). HTML 은 쓰지 않고 요소로 만든다 ----
  function inline(text, into) {
    const re = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\[[^\]\n]+\]\(https?:\/\/[^\s)]+\))|(https?:\/\/[A-Za-z0-9\-._~:/?#\[\]@!$&'*+,;=%]*[A-Za-z0-9\-_~/#=&%])/g;
    let last = 0;
    let m;
    while ((m = re.exec(text))) {
      if (m.index > last) into.append(text.slice(last, m.index));
      const s = m[0];
      if (m[1]) into.append(el('code', '', s.slice(1, -1)));
      else if (m[2]) into.append(el('strong', '', s.slice(2, -2)));
      else {
        const mm = m[3] ? s.match(/^\[([^\]]+)\]\((.+)\)$/) : null;
        const a = el('a', '', mm ? mm[1] : s);
        a.href = mm ? mm[2] : s;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        into.append(a);
      }
      last = m.index + s.length;
    }
    if (last < text.length) into.append(text.slice(last));
  }
  function renderMd(src, into) {
    const lines = String(src).replace(/\r/g, '').split('\n');
    let i = 0;
    let para = null;
    const endPara = () => { para = null; };
    while (i < lines.length) {
      const line = lines[i];
      if (/^```/.test(line)) {
        endPara();
        const buf = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
        i++;
        into.append(el('pre', 'ai-pre', buf.join('\n')));
        continue;
      }
      if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes('-')) {
        endPara();
        const cells = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
        const wrap = el('div', 'ai-table');
        const table = el('table');
        const tr = el('tr');
        for (const c of cells(line)) { const th = el('th'); inline(c, th); tr.append(th); }
        table.append(el('thead'));
        table.firstChild.append(tr);
        const tb = el('tbody');
        i += 2;
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
          const r = el('tr');
          for (const c of cells(lines[i])) { const td = el('td'); inline(c, td); r.append(td); }
          tb.append(r);
          i++;
        }
        table.append(tb);
        wrap.append(table);
        into.append(wrap);
        continue;
      }
      const h = line.match(/^(#{1,4})\s+(.*)$/);
      if (h) { endPara(); const e = el('p', 'ai-h'); inline(h[2], e); into.append(e); i++; continue; }
      const li = line.match(/^(\s*)([-*•]|\d+[.)])\s+(.*)$/);
      if (li) {
        endPara();
        const ordered = /\d/.test(li[2]);
        const list = el(ordered ? 'ol' : 'ul');
        if (ordered) list.start = parseInt(li[2], 10) || 1;
        const itemRe = /^(\s*)([-*•]|\d+[.)])\s+(.*)$/;
        let item = null;
        while (i < lines.length) {
          const m = lines[i].match(itemRe);
          if (m && /\d/.test(m[2]) === ordered) {
            item = el('li');
            if (m[1].length >= 2) item.className = 'ai-sub';
            inline(m[3], item);
            list.append(item);
            i++;
            continue;
          }
          // 들여쓴 이어지는 줄은 앞 항목에 붙임, 빈 줄 뒤에 같은 목록이 이어지면 계속
          if (item && /^\s{2,}\S/.test(lines[i]) && !itemRe.test(lines[i])) { item.append(el('br')); inline(lines[i].trim(), item); i++; continue; }
          if (!lines[i].trim() && i + 1 < lines.length) {
            const n = lines[i + 1].match(itemRe);
            if (n && /\d/.test(n[2]) === ordered) { i++; continue; }
          }
          break;
        }
        into.append(list);
        continue;
      }
      if (/^>\s?/.test(line)) { endPara(); const q = el('blockquote'); inline(line.replace(/^>\s?/, ''), q); into.append(q); i++; continue; }
      if (!line.trim()) { endPara(); i++; continue; }
      if (!para) { para = el('p'); into.append(para); } else para.append(el('br'));
      inline(line, para);
      i++;
    }
  }

  // ---- 시작 ----
  document.addEventListener('visibilitychange', () => { if (!document.hidden && view !== 'chat' && view !== 'gkey' && !loginActive) check(); });
  card.addEventListener('click', (e) => {
    if (e.target.closest('.fold-btn') && !card.classList.contains('folded') && view !== 'chat' && !loginActive) check();
  });
  check();
})();
