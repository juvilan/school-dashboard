// 키우기 동물의 규칙 (화면과 테스트가 같이 쓴다). 수치는 0~100.
//  - 배(hunger)는 48시간, 기분(mood)은 72시간에 바닥까지 천천히 준다. 바닥이어도 아프거나 떠나지 않는다.
//  - 밥은 언제든 (배부르면 안 먹음), 간식은 할 일을 끝내면 하나씩 생긴다 (하루 10개까지, 모아 둘 수 있는 건 20개).
(function (root) {
  const HOUR = 3600 * 1000;
  const RATE = { hunger: 100 / 48, mood: 100 / 72 };
  const KINDS = ['ragdoll', 'russian', 'corgi', 'maltese'];
  const FRIEND_MAX = 2;
  // 암수: 'm' | 'f'. 처음엔 말티즈만 암컷 (리본 그림이 원래 모습이라)
  const SEXES = ['m', 'f'];
  const sexOf = (kind, v) => (SEXES.includes(v) ? v : kind === 'maltese' ? 'f' : 'm');
  // 그림 이름: 암컷은 목걸이 그림, 말티즈는 수컷이 리본 없는 그림
  const artKey = (kind, sex) => (kind === 'maltese' ? (sex === 'm' ? 'malteseBoy' : 'maltese') : sex === 'f' ? `${kind}Girl` : kind);
  const SNACK_DAY = 10;
  const SNACK_MAX = 20;
  const clamp = (v) => Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0));
  const num = (v, d) => (Number.isFinite(v) ? v : d);

  function fresh(now, kind = 'ragdoll') {
    return { v: 1, kind, sex: sexOf(kind), name: '', friends: [], famSet: false, hunger: 80, mood: 80, snacks: 3, last: now, patAt: 0, day: '', gotToday: 0, paid: [] };
  }

  // 저장해 둔 것을 읽을 때: 모양이 이상하면 고쳐서 쓴다
  function normalize(raw, now) {
    if (!raw || typeof raw !== 'object') return fresh(now);
    const s = fresh(now, KINDS.includes(raw.kind) ? raw.kind : 'ragdoll');
    s.sex = sexOf(s.kind, raw.sex);
    s.name = typeof raw.name === 'string' ? raw.name.slice(0, 12) : '';
    s.friends = (Array.isArray(raw.friends) ? raw.friends : [])
      .map((f) => (f && f.kind === 'russianGirl' ? { ...f, kind: 'russian', sex: 'f' } : f)) // 처음 판의 목걸이 러시안 블루
      .filter((f) => f && KINDS.includes(f.kind))
      .slice(0, FRIEND_MAX)
      .map((f) => ({ kind: f.kind, sex: sexOf(f.kind, f.sex), name: typeof f.name === 'string' ? f.name.slice(0, 12) : '' }));
    s.famSet = raw.famSet === true;
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

  // ---- 알려 주기: 지금 할 말 하나 고르기 (같은 말은 하루 한 번) ----
  // ctx: { minutes, weekday(0=일), tt: Dash.ttNow() 결과|null, todos: [{title,due,done}], today: 'YYYY-MM-DD',
  //        events: 오늘 일정 [{title,time,source}]|null, lunch: 점심 메뉴 이름 [..]|null }
  // said: 오늘 이미 한 말의 열쇠. 돌려주는 것: { key, text, mood: 'happy'|'worried', urgent } 또는 null
  const hm = (t) => { const [h, mm] = String(t).split(':').map(Number); return h * 60 + mm; };
  const few = (list, n) => list.slice(0, n).join(', ') + (list.length > n ? ` 외 ${list.length - n}개` : '');
  function pickTalk(ctx, said) {
    const m = Math.floor(ctx.minutes);
    if (m < 6 * 60 + 30 || m >= 21 * 60) return null; // 밤에는 조용히
    const has = (k) => said.includes(k);
    const st = ctx.tt?.st;
    const inLesson = st?.kind === 'class' && st.at?.lesson;
    // 1. 다음 수업 5분 전 (수업 중이 아닐 때)
    if (st?.next?.lesson && !inLesson) {
      const until = hm(st.next.start) - m;
      const key = `class-${st.next.period}`;
      if (until >= 1 && until <= 5 && !has(key)) {
        const l = st.next.lesson;
        const what = [l.klass, l.subject].filter(Boolean).join(' ');
        return { key, text: [`${until}분 뒤 ${st.next.period}교시예요`, what, l.room].filter(Boolean).join(' · '), mood: 'happy', urgent: true };
      }
    }
    // 2. 시각이 있는 일정 10분 전 (여러 날 일정은 첫날만)
    for (const e of ctx.events || []) {
      if (!e.time || e.source === 'todo' || (e.date && e.date !== ctx.today)) continue;
      const until = hm(e.time) - m;
      const key = `ev-${e.time}-${e.title}`;
      if (until >= 1 && until <= 10 && !has(key)) return { key, text: `${until}분 뒤 ${e.title} (${e.time})`, mood: 'happy', urgent: true };
    }
    // 수업 중(화면을 교실 TV에 띄워 둘 수 있음)에는 급한 것 말고는 쉬는 시간으로 미룬다
    if (inLesson) return null;
    // 3. 점심 메뉴: 11시~12시 10분
    if (ctx.lunch?.length && m >= 11 * 60 && m < 12 * 60 + 10 && !has('meal')) {
      return { key: 'meal', text: `오늘 점심은 ${few(ctx.lunch, 3)}!`, mood: 'happy' };
    }
    // 기운 나는 한마디: 하루 한 번 (오후 2시 전에 처음 볼 때)
    if (m < 14 * 60 && !has('cheer')) return { key: 'cheer', text: cheer(ctx.today, ctx.weekday), mood: 'wave' };
    // 4. 마감 할 일: 아침에 한 번, 오후 3시에 남았으면 한 번 더
    const due = (ctx.todos || []).filter((t) => !t.done && t.due && t.due <= ctx.today).map((t) => t.title);
    if (due.length) {
      if (m >= 15 * 60 && !has('due-pm')) return { key: 'due-pm', text: `마감 할 일이 아직 ${due.length}개 남았어요: ${few(due, 2)}`, mood: 'worried' };
      if (m >= 7 * 60 + 30 && m < 15 * 60 && !has('due-am')) return { key: 'due-am', text: `오늘 마감 할 일 ${due.length}개: ${few(due, 2)}`, mood: 'worried' };
    }
    // 5. 오늘 일정: 낮에 처음 볼 때 한 번
    const evs = (ctx.events || []).filter((e) => e.source !== 'todo').map((e) => (e.time && (!e.date || e.date === ctx.today) ? `${e.title} (${e.time})` : e.title));
    if (evs.length && m < 18 * 60 && !has('events')) return { key: 'events', text: `오늘 일정: ${few(evs, 2)}`, mood: 'happy' };
    // 6. 수업이 다 끝났을 때, 7. 평일 퇴근 시간 (4시 40분)
    // 퇴근 인사는 수업이 있는 날만 (시간표를 안 넣었으면 평일 모두). 쉬는 날(방학·공휴일)엔 시간표 상태가 수업 없음
    const noTimetable = !ctx.tt || ctx.tt.text === '시간표 입력 전';
    const workday = ctx.weekday >= 1 && ctx.weekday <= 5 && (noTimetable || (ctx.tt.lessons || []).some((l) => l.lesson));
    if (workday && m >= 16 * 60 + 40 && m < 18 * 60 && !has('bye')) return { key: 'bye', text: '퇴근 시간이에요. 오늘도 수고했어요!', mood: 'wave' };
    if (st?.kind === 'after' && m < 16 * 60 + 40 && !has('after')) return { key: 'after', text: '오늘 수업 끝! 수고했어요', mood: 'wave' };
    return null;
  }

  // 하루 한마디: 날마다 차례로 (한 바퀴 돌 때까지 겹치지 않음). 월·금·주말은 그날에 맞는 말
  const CHEERS = [
    '오늘도 와 줘서 고마워요. 천천히 시작해요', '잘하고 있어요. 진짜로요!', '오늘 하루도 반짝일 거예요',
    '물 한 잔 마시고 시작해요', '작은 일 하나부터 끝내 봐요. 간식은 제가 받을게요', '선생님 덕분에 누군가는 오늘 웃을 거예요',
    '완벽하지 않아도 괜찮아요', '어제보다 조금 더 편한 하루가 되길', '힘들면 잠깐 쉬어도 돼요. 제가 지키고 있을게요',
    '오늘의 목표: 점심 맛있게 먹기!', '숨 한 번 크게 쉬고, 출발!', '선생님은 생각보다 훨씬 멋진 사람이에요',
    '오늘도 한 걸음씩, 같이 가요', '웃는 얼굴이 제일 잘 어울려요', '바쁜 날일수록 어깨 한 번 쭉 펴요',
    '오늘 하루, 저는 선생님 편이에요', '지난번에도 해냈잖아요. 이번에도 할 수 있어요', '좋은 일이 하나쯤은 꼭 생길 거예요',
    '커피만 말고 물도 마셔 주세요', '수업 하나하나가 다 소중해요', '마음이 무거우면 저를 쓰다듬어 주세요',
    '할 수 있는 만큼만 해도 충분해요', '선생님이 있어서 교실이 따뜻해요', '오늘도 무사히, 그리고 즐겁게!',
    '창밖 한 번 보고 시작해요. 날씨가 어떤가요?', '조금 늦어도 괜찮아요. 꾸준한 게 멋진 거예요', '오늘 애쓸 나에게 미리 박수!',
    '쉬는 시간엔 진짜로 쉬어요', '선생님 최고! 제가 보장해요', '오늘은 나를 한 번 칭찬해 주기로 해요',
  ];
  function cheer(ymd, weekday) {
    if (weekday === 1) return '월요일이에요. 이번 주도 천천히 같이 가요';
    if (weekday === 5) return '금요일! 조금만 힘내면 주말이에요';
    if (weekday === 0 || weekday === 6) return '쉬는 날에도 들러 줬네요. 오늘은 푹 쉬어요';
    const day = Math.floor(Date.parse(`${ymd}T00:00:00Z`) / 86400e3) || 0;
    return CHEERS[((day % CHEERS.length) + CHEERS.length) % CHEERS.length];
  }

  // 할 말이 없을 때 가끔 하는 혼잣말 (배·기분·간식에 맞게). r 은 0~1 사이 난수
  function idleLine(s, kind, r) {
    const pool = [];
    if (s.hunger < 50) pool.push('배가 출출해요… 밥 주세요', '꼬르륵…', '밥 먹을 시간 아닌가요?');
    if (s.snacks > 0) pool.push('간식 주세요~', '간식 하나만요… 네?');
    else pool.push('할 일 하나 끝내면 간식 주세요~');
    if (s.mood < 60) pool.push('쓰다듬어 주세요', '심심해요. 놀아 주세요');
    pool.push(...(kind === 'dog' ? ['멍멍!', '꼬리 흔드는 중이에요', '산책 가고 싶어요'] : ['냐옹~', '골골골…', '햇볕 쬐고 싶어요']));
    pool.push('뭐 하고 계세요?', '저 여기 있어요!', '기지개 쭉~');
    return pool[Math.min(pool.length - 1, Math.floor(Math.max(0, r) * pool.length))];
  }

  const api = { KINDS, FRIEND_MAX, SEXES, sexOf, artKey, SNACK_DAY, SNACK_MAX, fresh, normalize, tick, feed, snack, pat, earn, newlyDone, look, words, pickTalk, cheer, idleLine, CHEERS };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PetLogic = api;
})(typeof window === 'object' ? window : globalThis);
