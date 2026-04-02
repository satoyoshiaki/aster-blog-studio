import fs from "node:fs";
import path from "node:path";

const root = "/home/sato-fox/codex";

const questionSeeds = {
  EI: [
    {
      category: "social-charge",
      weight: 1.2,
      positive: {
        ja: "にぎやかな集まりのあとほど、頭が冴えてくる。",
        en: "A lively gathering usually leaves me feeling more switched on than drained.",
        ko: "시끌벅적한 모임이 끝난 뒤일수록 오히려 더 깨어나는 편이다.",
        "zh-CN": "热闹的聚会结束后，我通常会比之前更来劲，而不是被耗空。",
      },
      reverse: {
        ja: "人が多い場に長くいると、静かな場所でかなり長く回復したくなる。",
        en: "After spending a long time around people, I usually need a long quiet reset.",
        ko: "사람 많은 자리에 오래 있으면 한동안 조용히 혼자 회복해야 한다.",
        "zh-CN": "在人多的场合待久了，我通常需要很长一段安静时间才能缓过来。",
      },
    },
    {
      category: "first-contact",
      weight: 1,
      positive: {
        ja: "初対面の相手にも、会話のきっかけを自分から作るほうだ。",
        en: "I usually create the opening of a conversation with new people myself.",
        ko: "처음 보는 사람과도 내가 먼저 대화의 물꼬를 트는 편이다.",
        "zh-CN": "面对初次见面的人，我通常会主动把对话开起来。",
      },
      reverse: {
        ja: "知らない人が多い場では、話すより先に空気を読んで様子を見る。",
        en: "In rooms full of strangers, I would rather observe the atmosphere before speaking.",
        ko: "낯선 사람이 많은 자리에서는 먼저 말하기보다 분위기를 살핀다.",
        "zh-CN": "在陌生人很多的场合，我更愿意先观察气氛再开口。",
      },
    },
    {
      category: "thinking-style",
      weight: 1.1,
      positive: {
        ja: "考えを整理するときは、頭の中だけで抱えるより声に出したほうが早い。",
        en: "Talking out loud helps me organize my thoughts faster than thinking silently.",
        ko: "생각을 정리할 때는 속으로만 곱씹기보다 말로 꺼내는 편이 빠르다.",
        "zh-CN": "整理想法时，直接说出来通常比闷在脑子里更快。",
      },
      reverse: {
        ja: "本音や考えは、いったん一人で噛みしめてからでないと出しにくい。",
        en: "I usually need private time with my thoughts before I can say what I really think.",
        ko: "내 생각이나 속마음은 혼자 정리한 뒤에야 꺼내기 쉽다.",
        "zh-CN": "我的真实想法通常要先自己消化一遍，才说得出口。",
      },
    },
    {
      category: "visibility",
      weight: 1,
      positive: {
        ja: "場の中心に立つ役回りは、意外と嫌いではない。",
        en: "Being the visible center of a room is not something I mind much.",
        ko: "사람들 앞에서 눈에 띄는 역할을 맡는 일이 크게 부담되지는 않는다.",
        "zh-CN": "站到人群中央被大家注意到，这件事并不会让我太难受。",
      },
      reverse: {
        ja: "注目を浴びるくらいなら、裏方で静かに質を上げるほうが落ち着く。",
        en: "I feel calmer improving things quietly behind the scenes than being in the spotlight.",
        ko: "주목받기보다 뒤에서 조용히 완성도를 올리는 쪽이 더 편하다.",
        "zh-CN": "比起成为焦点，我更喜欢在幕后安静地把事情做得更好。",
      },
    },
    {
      category: "network-energy",
      weight: 1.1,
      positive: {
        ja: "人脈を広げる時間は、やるべき営業というより普通に楽しい。",
        en: "Expanding my network feels naturally energizing, not just like dutiful social maintenance.",
        ko: "인맥을 넓히는 시간은 억지 영업이 아니라 꽤 재미있는 편이다.",
        "zh-CN": "拓展人脉对我来说不只是社交任务，本身就挺有劲头。",
      },
      reverse: {
        ja: "付き合いを広げるより、少人数の深い関係を守るほうが大事だ。",
        en: "Protecting a few deep relationships matters more to me than widening the circle.",
        ko: "관계를 넓히기보다 몇 안 되는 깊은 관계를 지키는 쪽이 더 중요하다.",
        "zh-CN": "比起把圈子越扩越大，我更在意守住少数深的关系。",
      },
    },
    {
      category: "work-bounce",
      weight: 1,
      positive: {
        ja: "チームで反応を返し合うと、作業の勢いがかなり増す。",
        en: "Fast back-and-forth with a team usually gives my work more momentum.",
        ko: "팀에서 빠르게 주고받을수록 일의 추진력이 더 붙는 편이다.",
        "zh-CN": "和团队来回快速碰撞时，我的工作节奏通常会更有冲劲。",
      },
      reverse: {
        ja: "本当に集中したい作業は、反応を切って一人で潜る時間が必要だ。",
        en: "For my best focus work, I need stretches of time with responses turned off.",
        ko: "정말 몰입해야 하는 일은 반응을 끊고 혼자 잠수하는 시간이 필요하다.",
        "zh-CN": "真正需要专注的事情，我通常得切断回应，一个人沉下去做。",
      },
    },
    {
      category: "weekend-choice",
      weight: 1,
      positive: {
        ja: "予定のない休日でも、誰かを誘って外に出る案が先に浮かぶ。",
        en: "On an unplanned day off, my first idea is often to invite someone out.",
        ko: "별다른 계획이 없는 휴일이면 누군가를 불러 나가는 쪽이 먼저 떠오른다.",
        "zh-CN": "休息日没安排时，我脑子里先冒出来的通常是约人出门。",
      },
      reverse: {
        ja: "自由時間は、人と埋めるより自分のペースを取り戻すのに使いたい。",
        en: "Free time feels best when I can reclaim my own pace rather than fill it with people.",
        ko: "자유 시간은 사람으로 채우기보다 내 리듬을 되찾는 데 쓰고 싶다.",
        "zh-CN": "空闲时间对我来说，更适合拿来找回自己的节奏，而不是继续见人。",
      },
    },
    {
      category: "response-speed",
      weight: 1.1,
      positive: {
        ja: "その場で反応しながら考えるほうが、テンポよく力が出る。",
        en: "I perform well when I can think while reacting in real time.",
        ko: "그 자리에서 반응하면서 생각할 때 오히려 템포 있게 잘 풀린다.",
        "zh-CN": "边反应边思考的实时节奏，反而更能让我发挥出来。",
      },
      reverse: {
        ja: "即答を求められるより、少し間を置いてから返したほうが精度が高い。",
        en: "My answers are usually better when I get a little time before responding.",
        ko: "즉답을 요구받기보다 잠깐 간격을 둔 뒤 답할 때 정확도가 높다.",
        "zh-CN": "比起立刻作答，我通常在留一点时间后回应会更准确。",
      },
    },
    {
      category: "celebration-style",
      weight: 1,
      positive: {
        ja: "うれしいことがあると、まず誰かと共有したくなる。",
        en: "When something good happens, I want to share it with someone right away.",
        ko: "좋은 일이 생기면 우선 누군가와 바로 나누고 싶어진다.",
        "zh-CN": "有开心的事时，我通常会第一时间想找人分享。",
      },
      reverse: {
        ja: "大事な感情ほど、すぐ共有するより静かに自分の中で味わいたい。",
        en: "The more important the feeling is, the more I want to sit with it privately first.",
        ko: "중요한 감정일수록 바로 공유하기보다 혼자 곱씹고 싶다.",
        "zh-CN": "越重要的情绪，我越想先自己安静消化，而不是马上说出去。",
      },
    },
    {
      category: "crowd-recovery",
      weight: 1.2,
      positive: {
        ja: "イベント続きでも、人と会う予定が入っているほうがむしろ元気が続く。",
        en: "Even during a packed week, having more people to see often keeps my energy up.",
        ko: "일정이 빽빽해도 사람 만날 약속이 이어질수록 오히려 에너지가 유지된다.",
        "zh-CN": "就算行程很满，只要接着还有人可见，我往往反而更有劲。",
      },
      reverse: {
        ja: "予定が続く週ほど、誰にも会わない完全オフがないと削れていく。",
        en: "The busier my week gets, the more I need completely people-free downtime.",
        ko: "약속이 많은 주일수록 누구도 만나지 않는 완전한 혼자 시간이 필요하다.",
        "zh-CN": "越是行程连轴转的一周，我越需要彻底不见人的独处时间。",
      },
    },
    {
      category: "brainstorm-mode",
      weight: 1,
      positive: {
        ja: "アイデア出しは、一人で煮詰めるより誰かと投げ合うほうが広がる。",
        en: "Brainstorming with others expands my ideas faster than refining them alone.",
        ko: "아이디어는 혼자 끙끙대기보다 누군가와 던지고 받으며 더 커진다.",
        "zh-CN": "比起一个人闷想，和别人来回碰撞更能把我的点子打开。",
      },
      reverse: {
        ja: "新しい発想は、会話の勢いより一人の余白から出てくることが多い。",
        en: "My best new ideas often come from quiet mental space rather than conversation momentum.",
        ko: "새로운 발상은 대화의 열기보다 혼자 있는 여백에서 더 자주 나온다.",
        "zh-CN": "我最好的新点子，往往更容易从独处留白里冒出来，而不是聊天气氛里。",
      },
    },
  ],
  SN: [
    {
      category: "detail-anchor",
      weight: 1.2,
      positive: {
        ja: "新しいことを理解するときは、まず具体例や実物がほしい。",
        en: "When learning something new, I want concrete examples before abstract theory.",
        ko: "새로운 것을 이해할 때는 추상 이론보다 먼저 구체적인 예시가 필요하다.",
        "zh-CN": "理解新东西时，我更想先看到具体例子，再谈抽象理论。",
      },
      reverse: {
        ja: "細部がまだ曖昧でも、全体の可能性やパターンが見えると前に進める。",
        en: "Even when details are fuzzy, seeing the pattern or possibility is enough for me to move.",
        ko: "세부가 아직 흐려도 큰 패턴이나 가능성이 보이면 일단 움직일 수 있다.",
        "zh-CN": "就算细节还模糊，只要整体模式或可能性出来了，我就能先往前走。",
      },
    },
    {
      category: "language-style",
      weight: 1,
      positive: {
        ja: "説明するときは、比喩より手順や事実を順番に置くほうがしっくりくる。",
        en: "When I explain something, clear steps and facts feel more natural than metaphors.",
        ko: "무언가를 설명할 때는 비유보다 단계와 사실을 순서대로 놓는 편이 편하다.",
        "zh-CN": "解释事情时，比起比喻，我更习惯按步骤和事实来讲。",
      },
      reverse: {
        ja: "話をつかむときは、細かな手順よりイメージや比喩から入るほうが早い。",
        en: "Images and metaphors often help me grasp a point faster than fine-grained steps.",
        ko: "이야기를 이해할 때는 세세한 절차보다 이미지나 비유가 더 빨리 들어온다.",
        "zh-CN": "理解一件事时，比起细步骤，我常常更快从画面感和比喻里抓到重点。",
      },
    },
    {
      category: "evidence-threshold",
      weight: 1.1,
      positive: {
        ja: "筋がよさそうでも、根拠が揃うまでは判断を保留しがちだ。",
        en: "Even if an idea sounds promising, I prefer to hold judgment until evidence catches up.",
        ko: "방향이 좋아 보여도 근거가 모일 때까지 판단을 보류하는 편이다.",
        "zh-CN": "一个想法听起来再有戏，我也更愿意等证据跟上再下判断。",
      },
      reverse: {
        ja: "証拠が出揃う前でも、未来の流れが見えたらかなり信じて動ける。",
        en: "I can move confidently when I sense where things are heading, even before proof is complete.",
        ko: "증거가 다 갖춰지지 않아도 흐름이 보이면 꽤 확신 있게 움직일 수 있다.",
        "zh-CN": "即使证据还没齐，只要我看见走势，我也能相当有把握地行动。",
      },
    },
    {
      category: "present-vs-possibility",
      weight: 1,
      positive: {
        ja: "今ある条件を見て、現実的に回る形を組むのが得意だ。",
        en: "I am good at building something workable from the conditions that already exist.",
        ko: "지금 있는 조건을 보고 현실적으로 돌아가게 짜는 데 강한 편이다.",
        "zh-CN": "我擅长根据眼前已有的条件，把事情搭成一个现实可行的样子。",
      },
      reverse: {
        ja: "目の前の条件よりも、まだ形になっていない可能性のほうに目が向く。",
        en: "My attention goes to unrealized possibilities more quickly than to present conditions.",
        ko: "눈앞의 조건보다 아직 형태가 없는 가능성 쪽으로 시선이 먼저 간다.",
        "zh-CN": "比起眼前现成的条件，我往往更快被还没成形的可能性吸引。",
      },
    },
    {
      category: "memory-bias",
      weight: 1,
      positive: {
        ja: "出来事は、そのとき実際に見聞きした細部ごと覚えていることが多い。",
        en: "I often remember events through the specific details I actually saw and heard.",
        ko: "어떤 일은 그때 실제로 보고 들은 세부 장면까지 기억하는 편이다.",
        "zh-CN": "一件事发生过后，我常常连当时真实看到听到的细节都记得。",
      },
      reverse: {
        ja: "出来事を思い出すときは、細部よりも意味やつながりが先に浮かぶ。",
        en: "When I recall events, the meaning and connection come back before the exact details.",
        ko: "일을 떠올릴 때는 세부보다 의미나 연결감이 먼저 떠오른다.",
        "zh-CN": "回想一件事时，我更先想起的是它的意义和联系，而不是具体细节。",
      },
    },
    {
      category: "innovation-style",
      weight: 1.1,
      positive: {
        ja: "改善案を考えるときは、既にうまく動いているものを磨く方向から入る。",
        en: "When improving something, I start by refining what already works.",
        ko: "개선안을 떠올릴 때는 이미 잘 굴러가는 것을 더 다듬는 방향에서 시작한다.",
        "zh-CN": "想改进方案时，我通常先从把已经有效的东西磨得更好开始。",
      },
      reverse: {
        ja: "改善より先に、『そもそも前提ごと変えられないか』を考えがちだ。",
        en: "Before refining a system, I often ask whether the whole premise could be changed.",
        ko: "다듬기 전에 애초의 전제 자체를 바꿀 수 없는지부터 생각하는 편이다.",
        "zh-CN": "在细化之前，我常会先问一句：前提本身能不能换掉？",
      },
    },
    {
      category: "instruction-style",
      weight: 1,
      positive: {
        ja: "曖昧な指示より、何をどうするかが明確なほうが安心して動ける。",
        en: "Clear instructions about what to do and how to do it help me move with confidence.",
        ko: "애매한 지시보다 무엇을 어떻게 할지가 명확해야 안심하고 움직인다.",
        "zh-CN": "比起模糊指示，我更需要把做什么、怎么做讲清楚，才好放心推进。",
      },
      reverse: {
        ja: "ざっくりした方向だけ渡されて、あとは解釈の余地があるほうが燃える。",
        en: "A broad direction with room for interpretation energizes me more than tight instruction.",
        ko: "큰 방향만 주어지고 해석의 여지가 남아 있을 때 더 의욕이 난다.",
        "zh-CN": "只给一个大方向、留出理解空间，往往比严密指令更能点燃我。",
      },
    },
    {
      category: "risk-image",
      weight: 1,
      positive: {
        ja: "判断ミスを避けるには、現物や実績に寄せるのがいちばん確実だと思う。",
        en: "To avoid bad decisions, I trust concrete proof and track record most.",
        ko: "판단 실수를 줄이려면 실물과 실적에 기대는 게 가장 확실하다고 본다.",
        "zh-CN": "为了少犯判断错误，我最信得过的还是实证和既有成绩。",
      },
      reverse: {
        ja: "未踏の案でも、筋が見えれば試す価値はかなりあると思う。",
        en: "Even an untested idea is worth trying if the underlying pattern makes sense to me.",
        ko: "검증되지 않은 안이라도 흐름이 맞다면 충분히 시도할 가치가 있다고 본다.",
        "zh-CN": "哪怕方案还没被验证，只要底层逻辑说得通，我也觉得很值得试。",
      },
    },
    {
      category: "conversation-focus",
      weight: 1.1,
      positive: {
        ja: "雑談でも、『最近実際にあったこと』の話のほうが入りやすい。",
        en: "Even in casual conversation, real recent events are easier for me to enter than speculation.",
        ko: "가벼운 대화에서도 가정보다 최근 실제로 있었던 이야기가 더 잘 들어온다.",
        "zh-CN": "就算是闲聊，比起各种假设，我也更容易接住最近真实发生的事。",
      },
      reverse: {
        ja: "雑談では、現実報告より『もしこうなったら』の話のほうが面白い。",
        en: "In small talk, 'what if' conversations are usually more interesting to me than updates.",
        ko: "잡담에서는 근황 보고보다 '만약 이렇다면' 같은 이야기가 더 재미있다.",
        "zh-CN": "在闲聊里，比起近况汇报，我通常更爱聊“如果会怎样”的假设。",
      },
    },
    {
      category: "craft-vs-concept",
      weight: 1,
      positive: {
        ja: "触って試しながら理解するほうが、概念だけ追うより確実だ。",
        en: "Hands-on trial usually teaches me more reliably than staying at the conceptual level.",
        ko: "개념만 쫓기보다 직접 만져 보고 시험해 볼 때 더 확실히 이해된다.",
        "zh-CN": "比起只停留在概念层面，亲手试一遍通常更能让我真正弄懂。",
      },
      reverse: {
        ja: "実際に触る前でも、概念の骨組みが見えればかなり納得できる。",
        en: "I can feel grounded in a topic once I see the conceptual framework, even before practice.",
        ko: "직접 해 보기 전이라도 개념의 뼈대가 보이면 꽤 납득이 된다.",
        "zh-CN": "就算还没亲手操作，只要概念框架立起来，我也会很有把握。",
      },
    },
    {
      category: "future-signal",
      weight: 1.1,
      positive: {
        ja: "先のことを考えるときも、過去の実績や現在の数字をいちばん重く見る。",
        en: "When I think about the future, past results and current numbers carry the most weight.",
        ko: "앞일을 볼 때도 과거 실적과 현재 숫자를 가장 무겁게 본다.",
        "zh-CN": "即使在判断未来时，我最看重的仍然是过往结果和当前数据。",
      },
      reverse: {
        ja: "先のことは、今の数字よりも変化の兆しや未整理のサインに反応する。",
        en: "I pay close attention to emerging signals and unfinished patterns, not just present metrics.",
        ko: "미래를 볼 때는 현재 수치보다 변화의 징후와 아직 정리되지 않은 신호에 반응한다.",
        "zh-CN": "判断未来时，比起眼下的数字，我更会盯住变化征兆和还未整理完的信号。",
      },
    },
  ],
  TF: [
    {
      category: "decision-basis",
      weight: 1.2,
      positive: {
        ja: "大事な判断では、気持ちより整合性と基準を優先する。",
        en: "In important decisions, consistency and principle matter more to me than feelings.",
        ko: "중요한 판단에서는 감정보다 일관성과 기준을 더 우선한다.",
        "zh-CN": "做重要判断时，我会把一致性和标准放在感受前面。",
      },
      reverse: {
        ja: "正しくても人を雑に扱う結論なら、少し立ち止まって考え直したい。",
        en: "If a conclusion is technically correct but careless with people, I want to slow down and rethink it.",
        ko: "논리적으로 맞더라도 사람을 거칠게 다루는 결론이라면 다시 생각하고 싶다.",
        "zh-CN": "一个结论就算逻辑上正确，如果对人太粗暴，我也会想停下来重想。",
      },
    },
    {
      category: "feedback-style",
      weight: 1,
      positive: {
        ja: "フィードバックは、やさしさより率直さが先に必要だと思う。",
        en: "I believe effective feedback needs honesty before softness.",
        ko: "피드백은 부드러움보다 먼저 솔직함이 필요하다고 생각한다.",
        "zh-CN": "我认为有用的反馈首先得诚实，其次才是柔和。",
      },
      reverse: {
        ja: "相手が受け取れない言い方なら、正しさだけでは足りないと感じる。",
        en: "If the other person cannot receive the message, being correct is not enough.",
        ko: "상대가 받아들일 수 없는 말투라면 맞는 말만으로는 부족하다고 느낀다.",
        "zh-CN": "如果对方根本接不住这句话，那光“说得对”并不够。",
      },
    },
    {
      category: "conflict-priority",
      weight: 1.1,
      positive: {
        ja: "意見が割れたら、まず何が合理的かを切り分けたい。",
        en: "When opinions split, I first want to separate out what is most rational.",
        ko: "의견이 갈리면 우선 무엇이 가장 합리적인지부터 가르고 싶다.",
        "zh-CN": "意见分裂时，我会先把“什么最合理”这件事切出来看。",
      },
      reverse: {
        ja: "意見が割れたら、まず誰がどう傷ついているかも把握したい。",
        en: "When opinions split, I also want to understand who is being hurt in the process.",
        ko: "의견이 갈리면 누가 어떤 식으로 상처받는지도 먼저 파악하고 싶다.",
        "zh-CN": "意见冲突时，我也会先想弄清楚谁在这个过程中被伤到了。",
      },
    },
    {
      category: "fairness-model",
      weight: 1,
      positive: {
        ja: "公平さは、同じ基準を誰にでも適用することに近いと思う。",
        en: "Fairness, to me, mostly means applying the same standard to everyone.",
        ko: "공정함은 누구에게나 같은 기준을 적용하는 데 가깝다고 본다.",
        "zh-CN": "在我看来，公平很大程度上就是对所有人用同一套标准。",
      },
      reverse: {
        ja: "公平さは、その人の事情まで含めて扱いを調整することでもある。",
        en: "Fairness can also mean adjusting for what each person is carrying.",
        ko: "공정함은 각자가 처한 사정까지 고려해 다르게 대하는 것일 수도 있다.",
        "zh-CN": "公平也可能意味着把每个人背负的处境算进去，再调整对待方式。",
      },
    },
    {
      category: "persuasion-style",
      weight: 1.1,
      positive: {
        ja: "人を動かすなら、共感より論理の筋道を示すほうが強いと思う。",
        en: "To persuade people, a strong logical case works better than emotional resonance.",
        ko: "사람을 움직이려면 공감보다 논리의 흐름을 보여 주는 쪽이 더 강하다고 본다.",
        "zh-CN": "如果要说服别人，我觉得扎实的逻辑链往往比情感共鸣更有力。",
      },
      reverse: {
        ja: "筋が通っていても、相手の感情に届かなければ動かないことが多い。",
        en: "Even a solid argument often goes nowhere if it does not connect emotionally.",
        ko: "논리가 맞아도 상대 감정에 닿지 않으면 움직이지 않는 경우가 많다.",
        "zh-CN": "论证再完整，如果没有触到对方情绪，很多时候也推不动事情。",
      },
    },
    {
      category: "boundary-style",
      weight: 1,
      positive: {
        ja: "感情が揺れている相手にも、必要なら線を引いて伝えられる。",
        en: "Even when someone is emotional, I can still hold a firm line if needed.",
        ko: "상대 감정이 흔들려도 필요하면 선을 분명히 긋고 말할 수 있다.",
        "zh-CN": "即使对方情绪起伏很大，我也能在必要时把界线讲清楚。",
      },
      reverse: {
        ja: "相手が揺れているときは、正論より受け止め方を先に整えたい。",
        en: "When someone is emotionally shaken, I want to stabilize the landing before the logic.",
        ko: "상대가 흔들릴 때는 정론보다 먼저 받아들일 수 있는 상태를 만들고 싶다.",
        "zh-CN": "当对方情绪很乱时，我更想先把接住情绪这件事做好，再谈道理。",
      },
    },
    {
      category: "evaluation-lens",
      weight: 1,
      positive: {
        ja: "成果を見るときは、人柄より結果の質を先に見る。",
        en: "When evaluating work, I look at the quality of results before the person's intent.",
        ko: "성과를 볼 때는 사람됨보다 결과물의 질을 먼저 본다.",
        "zh-CN": "评估工作成果时，我会先看结果质量，再看这个人本意如何。",
      },
      reverse: {
        ja: "成果を見るときは、その人が何を大事にして取り組んだかも重い。",
        en: "When evaluating work, I care about what values and care the person brought to it.",
        ko: "성과를 볼 때는 그 사람이 어떤 마음과 가치를 담았는지도 중요하다.",
        "zh-CN": "看成果时，我也很在意这个人是带着什么价值和关照去做的。",
      },
    },
    {
      category: "hard-truth",
      weight: 1.1,
      positive: {
        ja: "場が気まずくなっても、必要なら耳の痛いことを言うほうだ。",
        en: "Even if the room gets awkward, I will usually say the uncomfortable truth.",
        ko: "분위기가 어색해져도 필요하면 듣기 싫은 말까지 하는 편이다.",
        "zh-CN": "就算场面会变尴尬，只要有必要，我通常还是会把难听的真话说出来。",
      },
      reverse: {
        ja: "正しいことでも、今その言い方をすると関係が壊れるなら止める。",
        en: "Even when I am right, I may stop if saying it that way would damage the relationship.",
        ko: "맞는 말이어도 지금 그 방식으로 말하면 관계가 깨질 것 같으면 멈춘다.",
        "zh-CN": "哪怕我说得对，如果那种说法会把关系直接打坏，我也会收住。",
      },
    },
    {
      category: "moral-logic",
      weight: 1,
      positive: {
        ja: "ルールを変えるなら、まず機能していない理由を論理で示したい。",
        en: "If rules need to change, I want the logical case for why they fail first.",
        ko: "규칙을 바꾸려면 우선 왜 작동하지 않는지 논리로 보여 주고 싶다.",
        "zh-CN": "如果规则要改，我想先把它为什么失效的逻辑讲明白。",
      },
      reverse: {
        ja: "ルールを変えるなら、そこに置き去りにされる人がいるかも見たい。",
        en: "If rules need to change, I also want to see who is being left behind by them.",
        ko: "규칙을 바꿀 때는 그 규칙이 누구를 소외시키는지도 함께 보고 싶다.",
        "zh-CN": "如果规则要改，我也会想看看它到底把哪些人落在了后面。",
      },
    },
    {
      category: "care-expression",
      weight: 1,
      positive: {
        ja: "誰かを助けるときは、まず問題を解いて役に立つ形を作りたい。",
        en: "When helping someone, my instinct is to solve the problem in a useful way first.",
        ko: "누군가를 도울 때는 우선 문제를 풀어 실제로 도움이 되게 만들고 싶다.",
        "zh-CN": "帮助别人时，我的直觉通常是先把问题解决，做成真正有用的帮助。",
      },
      reverse: {
        ja: "誰かを助けるときは、解決より先に『一人じゃない』と伝えたい。",
        en: "When helping someone, I want them to feel understood before I rush to solve it.",
        ko: "누군가를 도울 때는 해결보다 먼저 혼자가 아니라는 감각을 주고 싶다.",
        "zh-CN": "帮助别人时，比起马上解决，我更想先让对方感到自己不是一个人。",
      },
    },
    {
      category: "ethics-pressure",
      weight: 1.1,
      positive: {
        ja: "プレッシャー下でも、情より構造で考えたほうがブレにくい。",
        en: "Under pressure, I trust structural reasoning more than emotion not to wobble.",
        ko: "압박이 큰 상황일수록 감정보다 구조로 생각하는 쪽이 덜 흔들린다.",
        "zh-CN": "压力越大，我越觉得靠结构化判断比靠情绪更不容易晃。",
      },
      reverse: {
        ja: "プレッシャー下ほど、何が人にとって誠実かを見失いたくない。",
        en: "Under pressure, I do not want to lose sight of what feels humane and sincere.",
        ko: "압박이 클수록 무엇이 사람에게 성실한지 놓치고 싶지 않다.",
        "zh-CN": "压力越大，我越不想丢掉“对人是否真诚”这条线。",
      },
    },
  ],
  JP: [
    {
      category: "planning-comfort",
      weight: 1.2,
      positive: {
        ja: "予定や締切が先に見えているほうが、気持ちよく動ける。",
        en: "I move more comfortably when plans and deadlines are visible in advance.",
        ko: "일정과 마감이 미리 보일 때 훨씬 편하게 움직일 수 있다.",
        "zh-CN": "计划和截止时间提前摆出来时，我会明显更自在地推进。",
      },
      reverse: {
        ja: "最初から固めるより、状況を見ながら柔らかく決めるほうが合う。",
        en: "I prefer deciding flexibly as the situation unfolds rather than locking things in early.",
        ko: "처음부터 딱 고정하기보다 상황을 보며 유연하게 정하는 쪽이 맞다.",
        "zh-CN": "比起一开始就定死，我更适合边看情况边灵活决定。",
      },
    },
    {
      category: "task-finish",
      weight: 1,
      positive: {
        ja: "未完了の案件が積み上がると、頭の片隅がずっと落ち着かない。",
        en: "A pile of unfinished tasks keeps buzzing in the back of my mind.",
        ko: "끝나지 않은 일이 쌓이면 머릿속 한구석이 계속 불편하다.",
        "zh-CN": "未完成事项一堆起来，我脑子里就会一直有个角落不安静。",
      },
      reverse: {
        ja: "複数の案件が開いたままでも、必要なら並走させるほうが自然だ。",
        en: "Keeping several things open at once feels natural to me when that is useful.",
        ko: "여러 일을 열린 상태로 두고 병행하는 편이 필요하면 자연스럽다.",
        "zh-CN": "同时开着几件事并行推进，对我来说在需要时是很自然的状态。",
      },
    },
    {
      category: "decision-timing",
      weight: 1.1,
      positive: {
        ja: "決められる情報が揃ったら、なるべく早く結論を出したい。",
        en: "Once enough information is available, I want to decide and move on quickly.",
        ko: "결정할 만큼 정보가 모이면 빨리 결론 내고 넘어가고 싶다.",
        "zh-CN": "信息够用了，我通常就想尽快定下来，继续往前走。",
      },
      reverse: {
        ja: "結論は急ぐより、もう少し選択肢を残しておきたいことが多い。",
        en: "I often want to keep options open a little longer instead of deciding fast.",
        ko: "빨리 결론 내리기보다 선택지를 조금 더 열어 두고 싶은 경우가 많다.",
        "zh-CN": "比起赶快拍板，我很多时候更想把选项再多留一会儿。",
      },
    },
    {
      category: "environment-order",
      weight: 1,
      positive: {
        ja: "机やファイルが整っていると、思考までまっすぐになる。",
        en: "An orderly desk or file system tends to make my thinking cleaner too.",
        ko: "책상이나 파일 정리가 되어 있으면 생각도 더 곧게 선다.",
        "zh-CN": "桌面和文件一旦整齐，我的思路也会跟着变清楚。",
      },
      reverse: {
        ja: "作業環境は多少散らかっていても、自分の流れが切れなければ平気だ。",
        en: "A bit of mess does not bother me if my momentum stays intact.",
        ko: "작업 환경이 좀 어수선해도 내 흐름만 안 끊기면 괜찮다.",
        "zh-CN": "环境有点乱没关系，只要我的工作流没被打断就行。",
      },
    },
    {
      category: "travel-style",
      weight: 1,
      positive: {
        ja: "旅行や外出は、ざっくりでも段取りを作っておくと安心する。",
        en: "Even for fun trips, I feel better with at least a loose plan in place.",
        ko: "여행이나 외출도 대강의 동선과 계획이 있으면 더 안심된다.",
        "zh-CN": "哪怕是出去玩，我也会因为提前有个大致安排而更安心。",
      },
      reverse: {
        ja: "外出は、その場の気分や偶然でルートが変わるくらいが面白い。",
        en: "Going out feels more fun when the route can change with mood and chance.",
        ko: "외출은 그날 기분과 우연에 따라 동선이 바뀌는 정도가 더 재미있다.",
        "zh-CN": "出门时路线能跟着心情和偶然变化，我反而觉得更有意思。",
      },
    },
    {
      category: "deadline-style",
      weight: 1.1,
      positive: {
        ja: "締切がある仕事は、前倒しで片づけて心の余白を作りたい。",
        en: "With deadlines, I like finishing early and buying myself mental margin.",
        ko: "마감이 있는 일은 미리 끝내 두고 마음의 여유를 확보하고 싶다.",
        "zh-CN": "有截止时间的事，我会想尽量提前做完，给自己留点心理余量。",
      },
      reverse: {
        ja: "締切が近づいて選択肢が絞られてからのほうが、むしろ集中できる。",
        en: "I often focus best once the deadline gets close and the options narrow.",
        ko: "마감이 가까워져 선택지가 좁아질 때 오히려 더 집중이 잘 된다.",
        "zh-CN": "很多时候，反而是在截止临近、选项变少之后，我最能集中。",
      },
    },
    {
      category: "rule-relationship",
      weight: 1,
      positive: {
        ja: "ルールや手順は、まず守ってから必要なら見直すべきだと思う。",
        en: "Rules and procedures should generally be followed first, then revised if needed.",
        ko: "규칙과 절차는 우선 지키고, 필요하면 그다음에 손보는 게 맞다고 본다.",
        "zh-CN": "规则和流程在我看来通常应该先遵守，再谈是否要修改。",
      },
      reverse: {
        ja: "ルールは目的のための道具なので、状況に応じて曲げてもいいと思う。",
        en: "Rules are tools for a purpose, so bending them can be fine when the situation calls for it.",
        ko: "규칙은 목적을 위한 도구라 상황에 따라 유연하게 휘어도 된다고 본다.",
        "zh-CN": "规则本来就是服务目的的工具，所以情况到了，灵活弯一下也可以。",
      },
    },
    {
      category: "calendar-ownership",
      weight: 1.1,
      positive: {
        ja: "先の予定を自分で押さえておくと、生活の主導権を感じる。",
        en: "Booking things ahead makes me feel in control of my life.",
        ko: "앞일을 미리 잡아 둘 때 생활의 주도권을 쥐고 있다는 느낌이 든다.",
        "zh-CN": "把后面的安排先定下来，会让我更有“生活在自己手里”的感觉。",
      },
      reverse: {
        ja: "予定を詰めすぎると息が詰まるので、空白を残しておきたい。",
        en: "Too much scheduling feels suffocating, so I want blank space left in the calendar.",
        ko: "일정을 너무 촘촘히 채우면 숨 막혀서 달력에 빈칸을 남겨 두고 싶다.",
        "zh-CN": "如果日程被排得太满，我会有点窒息，所以想在日历上留白。",
      },
    },
    {
      category: "change-response",
      weight: 1,
      positive: {
        ja: "急な変更が入ると、まず元の計画を立て直したくなる。",
        en: "When plans change suddenly, my first instinct is to rebuild the structure.",
        ko: "갑작스러운 변경이 생기면 우선 기존 계획을 다시 세우고 싶어진다.",
        "zh-CN": "计划突然变化时，我的第一反应通常是把结构重新搭起来。",
      },
      reverse: {
        ja: "急な変更が入っても、『じゃあ別ルートでいくか』と切り替えやすい。",
        en: "When plans change suddenly, switching to another route comes fairly easily to me.",
        ko: "갑작스러운 변경이 생겨도 '그럼 다른 길로 가지' 하고 금방 바꿀 수 있다.",
        "zh-CN": "计划突然变了，我通常也能很快切成“那就换条路走吧”的模式。",
      },
    },
    {
      category: "shopping-style",
      weight: 1,
      positive: {
        ja: "買い物や比較は、選ぶ基準を決めてから進めるほうが楽だ。",
        en: "Shopping and comparing options feel easier once I set criteria first.",
        ko: "무언가를 고를 때는 기준을 정해 놓고 비교하는 편이 훨씬 편하다.",
        "zh-CN": "购物或比较选择时，我会觉得先立标准再选，整个过程更轻松。",
      },
      reverse: {
        ja: "比較しながら実物や気分で決めていく余地があるほうが楽しい。",
        en: "I enjoy leaving room to decide through exploration and in-the-moment feel.",
        ko: "비교하다가 실제 느낌과 그때의 기분으로 정할 여지가 있어야 더 재미있다.",
        "zh-CN": "边看边比、最后再凭现场感觉拍板，这种留白会让我更享受。",
      },
    },
    {
      category: "closure-need",
      weight: 1.2,
      positive: {
        ja: "物事は『いったん決着した』感覚があるとかなり安心する。",
        en: "I feel real relief when something reaches a clear point of closure.",
        ko: "무언가가 일단락되었다는 감각이 있어야 꽤 안심이 된다.",
        "zh-CN": "一件事有了明确的收口感，我才会真正松一口气。",
      },
      reverse: {
        ja: "結論が仮置きでも、そのぶん後から変えられるならむしろ気楽だ。",
        en: "I am often more comfortable when conclusions stay provisional and adjustable.",
        ko: "결론이 임시적이라도 나중에 바꿀 수 있으면 오히려 더 편하다.",
        "zh-CN": "结论如果只是暂放、之后还能改，我反而会更轻松一些。",
      },
    },
  ],
};

const resultComments = {
  INTJ: {
    ja: "全部読んでから動く参謀タイプ。感情に流されないのは強みだけど、たまには『説明なしでも不安なんだな』くらいは察してあげてほしい。",
    en: "You are the strategist who reads the whole map before moving. Impressive, but occasionally remember that some humans panic before the spreadsheet is ready.",
    ko: "움직이기 전에 지도를 끝까지 읽는 전략가형이다. 대단하긴 한데, 세상 사람 모두가 분석표 나오기 전부터 불안해진다는 사실도 가끔은 기억하자.",
    "zh-CN": "你是那种看完整张地图才出手的策士型。很强，但也别忘了，有些人还没等你把分析表做完就已经开始慌了。",
  },
  INTP: {
    ja: "脳内でずっとβ版を回している発明家タイプ。発想は鋭いけど、現実世界は『あとで詰める』だけでは締切を待ってくれない。",
    en: "You run a permanent beta build in your head. Brilliant, yes, but the physical world remains rude enough to demand finished versions.",
    ko: "머릿속에서 영구 베타 버전을 돌리는 발명가형이다. 아이디어는 날카롭지만 현실 세계는 '나중에 마무리'를 친절하게 기다려 주지 않는다.",
    "zh-CN": "你脑子里像是永远开着测试版的发明家。点子很利，但现实世界并不会因为你说“之后再收尾”就自动体谅你。",
  },
  ENTJ: {
    ja: "会議室に『じゃあやるか』を持ち込む司令塔。頼もしいけど、全員が常にその速度で生きているわけではない。",
    en: "You are the person who drags a room from discussion into action. Useful, though not everyone is living at your preferred operating speed.",
    ko: "회의실에 '그럼 하죠'를 들고 오는 지휘관형이다. 든든하지만 모두가 당신 속도로 사는 건 아니라는 점은 잊지 말자.",
    "zh-CN": "你是那种把会议从讨论硬拉进执行的人。很好用，但也得承认，不是所有人都活在你的运行速度里。",
  },
  ENTP: {
    ja: "脳内ツッコミと仮説生成が止まらない挑発型。面白いし強い。ただし全部を遊びにすると、片付け担当が泣く。",
    en: "You are powered by provocation, hypotheses, and one more angle. Fun and formidable, but if everything becomes an experiment, cleanup becomes somebody else's crisis.",
    ko: "도발과 가설 생성으로 굴러가는 자극형이다. 재밌고 강하다. 다만 모든 걸 실험으로 만들면 치우는 사람은 따로 울게 된다.",
    "zh-CN": "你靠挑衅、假设和“再换个角度试试”驱动。确实有趣也很强，但如果万物皆实验，最后收拾残局的人通常不是你。",
  },
  INFJ: {
    ja: "人の機微と未来の流れを同時に読もうとする予報士。深いけど、全員分まで背負うと静かに燃え尽きる。",
    en: "You read subtext and future trajectory at the same time. Deep gift, but carrying everyone's emotional weather report is a fast route to burnout.",
    ko: "사람의 미묘한 결을 읽으면서 미래 흐름까지 보려는 예보가형이다. 깊이는 장점이지만 모두의 감정 기상도까지 떠안으면 조용히 번아웃 난다.",
    "zh-CN": "你像那种一边读人心暗流、一边看未来走势的预报员。很深，但如果连所有人的情绪天气都一起背上，安静地烧干只是时间问题。",
  },
  INFP: {
    ja: "内側に強い価値観の火を持つ理想家。やさしさは本物。ただ、締切はあなたの世界観に感動して延びたりしない。",
    en: "You carry a stubborn private flame of values. It is real and rare, but deadlines remain famously unmoved by beautiful inner convictions.",
    ko: "안쪽에 단단한 가치의 불씨를 들고 사는 이상주의자형이다. 그 진심은 진짜다. 다만 마감은 당신의 세계관에 감동해서 늦춰지지 않는다.",
    "zh-CN": "你内心有一团很固执也很真诚的价值之火。很珍贵，但截止时间不会因为你的内在信念很美就自动后延。",
  },
  ENFJ: {
    ja: "人も場も前に進めるプロデューサー気質。頼られやすいし実際頼れる。ただ、自分の残量まで万能扱いしないこと。",
    en: "You are the producer who moves people and momentum together. Dependable, absolutely, but your battery is not a public utility.",
    ko: "사람과 분위기를 함께 앞으로 끌고 가는 프로듀서형이다. 믿음직스럽다. 하지만 당신의 배터리까지 공공재는 아니다.",
    "zh-CN": "你是能把人和场子一起往前推的制作人型。确实可靠，但你的电量不是公共基础设施。",
  },
  ENFP: {
    ja: "可能性に恋しやすいムードメーカー。魅力も巻き込み力も強い。ただし『これ絶対やる』が毎週更新されると周囲は少し揺れる。",
    en: "You flirt with possibility for sport and somehow make it contagious. Charming, yes, but constant relaunches can leave the people around you mildly seasick.",
    ko: "가능성과 금방 사랑에 빠지는 무드메이커형이다. 매력도 전염력도 강하다. 다만 '이건 진짜 한다'가 매주 바뀌면 주변은 조금 멀미 난다.",
    "zh-CN": "你很容易对“可能性”一见钟情，而且还能把这股兴奋传染给别人。很有魅力，但如果“这次我真的要做”每周更新一次，周围人难免有点晕船。",
  },
  ISTJ: {
    ja: "ちゃんと回る仕組みを静かに守る実務派。信頼は厚い。ただ、世の中はたまに『前例なし』で殴ってくる。",
    en: "You keep systems running without needing applause. Respect. Just remember the world occasionally attacks with situations that have no prior precedent.",
    ko: "제대로 굴러가는 구조를 조용히 지키는 실무형이다. 신뢰가 두껍다. 다만 세상은 가끔 '전례 없음'으로 들이받는다.",
    "zh-CN": "你是那种不靠掌声也能把系统稳稳守住的实务派。很值得信赖，只是世界偶尔会拿“没有前例”这招直接砸过来。",
  },
  ISFJ: {
    ja: "人の抜けを先回りで埋める保守の名手。やさしさが実務に変換されている。ただし、我慢まで標準機能にしなくていい。",
    en: "You quietly translate care into practical support. Excellent trait. Just because you can absorb the strain does not mean that should be your default setting.",
    ko: "사람들의 빈틈을 미리 메워 두는 돌봄형 실무가다. 배려가 실행력으로 변환된다. 다만 참는 것까지 기본 옵션으로 둘 필요는 없다.",
    "zh-CN": "你很擅长把照顾别人这件事，悄悄变成具体可执行的支撑。很好，但能扛不代表就该默认一直扛。",
  },
  ESTJ: {
    ja: "現場を前に進める管理力が強い運営タイプ。助かる人は多い。ただ、効率の刃を毎回フルで抜くと空気は切れる。",
    en: "You are built for execution, order, and getting things done. Very useful. Just note that maximum efficiency can accidentally slice through morale if used nonstop.",
    ko: "현장을 굴리고 정리하는 운영형이다. 도움 되는 사람이 많다. 다만 효율의 칼을 늘 최대로 뽑아 들면 분위기도 같이 잘린다.",
    "zh-CN": "你天生就很会推进现场、整理秩序、把事做完。很有用。但如果效率这把刀每次都全开，气氛也会一起被切断。",
  },
  ESFJ: {
    ja: "空気を整えながら場を成立させるホスト気質。安心感がある。ただし、全員を満足させる仕事はだいたい無限湧きする。",
    en: "You make groups feel held together and looked after. Valuable talent. Unfortunately, the job of keeping everyone happy is one of those infinite side quests.",
    ko: "분위기를 정리하고 사람들을 챙기며 자리를 성립시키는 호스트형이다. 안정감이 크다. 다만 모두를 만족시키는 일은 대체로 끝이 없다.",
    "zh-CN": "你很会把人照顾到位、把场子稳住，让大家都觉得被接住。这很宝贵。可惜“让所有人都满意”这任务基本是无限支线。",
  },
  ISTP: {
    ja: "静かに状況を読んで必要な一手だけ打つ職人タイプ。無駄がない。ただ、説明を省きすぎると周囲にはただの無言強者に見える。",
    en: "You read the room, fix the thing, and waste almost no motion. Efficient. But if you skip all explanation, people may experience you as a talented mystery object.",
    ko: "조용히 상황을 읽고 필요한 한 수만 두는 장인형이다. 군더더기가 없다. 다만 설명을 너무 줄이면 주변에는 재능 있는 미스터리 물체로 보일 수 있다.",
    "zh-CN": "你会安静读局、出手只出必要的一招，动作几乎没有废笔。很利落。但如果你把解释省得太狠，别人可能只会觉得你是个高性能谜团。",
  },
  ISFP: {
    ja: "言葉より感覚で『これは違う』を見抜く美意識派。やわらかく見えて芯が強い。ただ、嫌なものを全部無音で避けると誰も気づかない。",
    en: "You notice dissonance through instinct and aesthetics before most people do. Quiet strength. Just know that silently dodging every bad fit leaves others guessing.",
    ko: "말보다 감각으로 '이건 아니다'를 먼저 알아채는 미감형이다. 부드러워 보여도 심지는 강하다. 다만 싫은 것을 계속 무음 회피하면 아무도 모른다.",
    "zh-CN": "你常常比别人更早靠直觉和审美感觉出“这里不对劲”。很有韧性，只是如果所有不喜欢都默默绕开，别人根本不会知道发生了什么。",
  },
  ESTP: {
    ja: "状況対応の瞬発力が高いプレイヤー。場数に強いし回転も速い。ただし、勢いで勝てる日と仕組みが要る日は別だ。",
    en: "You are fast, adaptive, and alive in motion. Great in the moment. Just remember some battles are won by systems, not by another burst of charisma.",
    ko: "상황 대응 순발력이 높은 플레이어형이다. 실전에 강하고 회전도 빠르다. 다만 모든 날이 기세와 순발력으로 이기는 날은 아니다.",
    "zh-CN": "你反应快、适应快，进入实战状态也快。很强。但也得承认，有些局靠的不是再来一波气势，而是靠系统。",
  },
  ESFP: {
    ja: "楽しさと人の温度を即座に上げるエンタメ気質。華がある。ただ、今の楽しさが明日の面倒になることは普通にある。",
    en: "You raise the emotional temperature of a room almost instantly. Wonderful skill. Just note that today's fun occasionally invoices tomorrow's self.",
    ko: "사람과 분위기의 온도를 바로 끌어올리는 엔터테이너형이다. 존재감이 크다. 다만 오늘의 재미가 내일의 귀찮음 청구서로 돌아오는 일도 흔하다.",
    "zh-CN": "你几乎能瞬间把一屋子的情绪温度拉高，很有感染力。只是今天的快乐，确实也常常会给明天的自己寄账单。",
  },
};

const questions = [];
let counter = 1;

for (const [axis, entries] of Object.entries(questionSeeds)) {
  for (const entry of entries) {
    questions.push({
      id: `q-${String(counter).padStart(3, "0")}`,
      axis,
      direction: "positive",
      weight: entry.weight,
      category: `${axis}-${entry.category}`,
      text: entry.positive,
    });
    counter += 1;
    questions.push({
      id: `q-${String(counter).padStart(3, "0")}`,
      axis,
      direction: "reverse",
      weight: entry.weight,
      category: `${axis}-${entry.category}`,
      text: entry.reverse,
    });
    counter += 1;
  }
}

const dataDir = path.join(root, "data");
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, "questions.json"), `${JSON.stringify(questions, null, 2)}\n`);
fs.writeFileSync(
  path.join(dataDir, "result-comments.json"),
  `${JSON.stringify(resultComments, null, 2)}\n`,
);

console.log(`Generated ${questions.length} questions and ${Object.keys(resultComments).length} result comments.`);
