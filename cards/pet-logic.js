// 키우기 동물의 규칙 (화면과 테스트가 같이 쓴다). 수치는 0~100.
//  - 배(hunger)는 48시간, 기분(mood)은 72시간에 바닥까지 천천히 준다. 바닥이어도 아프거나 떠나지 않는다.
//  - 밥은 언제든 (배부르면 안 먹음), 간식은 할 일을 끝내면 하나씩 생긴다 (하루 10개까지, 모아 둘 수 있는 건 20개).
(function (root) {
  const HOUR = 3600 * 1000;
  const RATE = { hunger: 100 / 48, mood: 100 / 72 };
  const KINDS = ['ragdoll', 'russian', 'corgi', 'maltese'];
  const SNACK_DAY = 10;
  const SNACK_MAX = 20;
  const clamp = (v) => Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0));
  const num = (v, d) => (Number.isFinite(v) ? v : d);

  function fresh(now, kind = 'ragdoll') {
    return { v: 1, kind, name: '', hunger: 80, mood: 80, snacks: 3, last: now, patAt: 0, day: '', gotToday: 0, paid: [] };
  }

  // 저장해 둔 것을 읽을 때: 모양이 이상하면 고쳐서 쓴다
  function normalize(raw, now) {
    if (!raw || typeof raw !== 'object') return fresh(now);
    const s = fresh(now, KINDS.includes(raw.kind) ? raw.kind : 'ragdoll');
    s.name = typeof raw.name === 'string' ? raw.name.slice(0, 12) : '';
    s.hunger = clamp(num(raw.hunger, 80));
    s.mood = clamp(num(raw.mood, 80));
    s.snacks = Math.max(0, Math.min(SNACK_MAX, Math.floor(num(raw.snacks, 3))));
    s.last = Math.min(num(raw.last, now), now);
    s.patAt = num(raw.patAt, 0);
    s.day = typeof raw.day === 'string' ? raw.day : '';
    s.gotToday = Math.max(0, Math.floor(num(raw.gotToday, 0)));
    s.paid = Array.isArray(raw.paid) ? raw.paid.filter((id) => typeof id === 'number' || typeof id === 'string').slice(-200) : [];
    return s;
  }

  // 지난 시간만큼 줄인다 (시계가 거꾸로 가면 줄이지 않음, 한 번에 최대 일주일치)
  function tick(s, now) {
    const h = Math.max(0, Math.min(now - s.last, 7 * 24 * HOUR)) / HOUR;
    return { ...s, hunger: clamp(s.hunger - h * RATE.hunger), mood: clamp(s.mood - h * RATE.mood), last: Math.max(s.last, now) };
  }

  // 행동: { s: 새 상태, ok, say: 말풍선 }
  function feed(s) {
    if (s.hunger >= 95) return { s, ok: false, say: '배불러요!' };
    return { s: { ...s, hunger: clamp(s.hunger + 40), mood: clamp(s.mood + 5) }, ok: true, say: '맛있다!' };
  }
  function snack(s) {
    if (s.snacks <= 0) return { s, ok: false, say: '간식이 없어요… 할 일을 끝내면 생겨요' };
    return { s: { ...s, snacks: s.snacks - 1, hunger: clamp(s.hunger + 10), mood: clamp(s.mood + 20) }, ok: true, say: '간식 최고!' };
  }
  // 쓰다듬기: 10초 안에 또 하면 조금만 오른다
  function pat(s, now) {
    const quick = now - s.patAt < 10 * 1000;
    return { s: { ...s, mood: clamp(s.mood + (quick ? 1 : 8)), patAt: now }, ok: true, say: quick ? '헤헤' : '좋아요~' };
  }

  // 할 일을 끝내면 간식: 처음 끝낸 할 일만 (끝냈다 되돌렸다 반복하거나, 탭이 여러 개여도 한 번).
  // 받은 할 일 id 는 최근 200개만 기억한다. 하루 한도는 실제로 받은 수로 센다.
  function earn(s, ids, ymd) {
    const paid = Array.isArray(s.paid) ? s.paid : [];
    const fresh = [...new Set(ids)].filter((id) => !paid.includes(id));
    const got = s.day === ymd ? s.gotToday : 0;
    const add = Math.max(0, Math.min(fresh.length, SNACK_DAY - got, SNACK_MAX - s.snacks));
    return { s: { ...s, snacks: s.snacks + add, day: ymd, gotToday: got + add, paid: [...paid, ...fresh].slice(-200) }, added: add, counted: fresh.length };
  }

  // 이번에 새로 끝난 할 일 id (전에 안 끝났던 것만; 처음 보는 할 일이 이미 끝나 있으면 세지 않음)
  function newlyDone(prev, next) {
    if (!Array.isArray(prev) || !Array.isArray(next)) return [];
    const was = new Map(prev.map((t) => [t.id, Boolean(t.done)]));
    return next.filter((t) => t.done && was.get(t.id) === false).map((t) => t.id);
  }

  // 평소 모습: 밤에는 잠, 배고프거나 시무룩하면 걱정
  function look(s, minutes) {
    if (minutes >= 22 * 60 || minutes < 6 * 60 + 30) return 'sleep';
    if (s.hunger < 25 || s.mood < 20) return 'worried';
    return 'idle';
  }

  function words(v, kind) {
    if (kind === 'hunger') return v >= 80 ? '배불러요' : v >= 50 ? '든든해요' : v >= 25 ? '출출해요' : '배고파요';
    return v >= 80 ? '신나요' : v >= 50 ? '좋아요' : v >= 20 ? '심심해요' : '시무룩해요';
  }

  const api = { KINDS, SNACK_DAY, SNACK_MAX, fresh, normalize, tick, feed, snack, pat, earn, newlyDone, look, words };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PetLogic = api;
})(typeof window === 'object' ? window : globalThis);
