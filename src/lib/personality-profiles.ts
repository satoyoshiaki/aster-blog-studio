import type { SupportedLocale } from "@/lib/quiz-types";

type LocaleText = Record<SupportedLocale, string>;
type Letter = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";

const typeTitles: Record<string, LocaleText> = {
  INTJ: {
    ja: "冷静な設計参謀",
    en: "Cold-Eyed Architect",
    ko: "냉정한 설계 참모",
    "zh-CN": "冷静蓝图参谋",
  },
  INTP: {
    ja: "観察型ハッカー",
    en: "Speculative Hacker",
    ko: "관찰형 해커",
    "zh-CN": "观察型脑洞客",
  },
  ENTJ: {
    ja: "推進力の司令塔",
    en: "Command-Deck Driver",
    ko: "추진력 지휘관",
    "zh-CN": "推进型指挥台",
  },
  ENTP: {
    ja: "論点攪拌メーカー",
    en: "Chaos-Fueled Debater",
    ko: "논점 교란 메이커",
    "zh-CN": "话题搅拌机",
  },
  INFJ: {
    ja: "静かな未来翻訳者",
    en: "Quiet Pattern Mystic",
    ko: "조용한 미래 번역가",
    "zh-CN": "安静的未来翻译者",
  },
  INFP: {
    ja: "内燃式ロマン派",
    en: "Private-Fire Idealist",
    ko: "내연식 로맨티스트",
    "zh-CN": "内燃式理想派",
  },
  ENFJ: {
    ja: "場を動かす演出家",
    en: "Momentum Producer",
    ko: "판을 움직이는 연출가",
    "zh-CN": "推动全场的制作人",
  },
  ENFP: {
    ja: "可能性ジャンキー",
    en: "Possibility Sparkplug",
    ko: "가능성 중독 메이커",
    "zh-CN": "可能性点火器",
  },
  ISTJ: {
    ja: "堅実な運用担当",
    en: "Steady Operations Core",
    ko: "탄탄한 운영 담당",
    "zh-CN": "稳健运转核心",
  },
  ISFJ: {
    ja: "静かな支援主任",
    en: "Quiet Care Anchor",
    ko: "조용한 지원 총괄",
    "zh-CN": "安静支援中枢",
  },
  ESTJ: {
    ja: "現場統率マネージャー",
    en: "Execution Manager",
    ko: "현장 통솔 매니저",
    "zh-CN": "执行型现场经理",
  },
  ESFJ: {
    ja: "空気整備ホスト",
    en: "Social Gravity Host",
    ko: "분위기 정비 호스트",
    "zh-CN": "氛围维持主场控",
  },
  ISTP: {
    ja: "無言の修理職人",
    en: "Silent Fixer",
    ko: "말없는 수리 장인",
    "zh-CN": "沉默修理匠",
  },
  ISFP: {
    ja: "感覚派クラフト職人",
    en: "Instinctive Crafter",
    ko: "감각파 크래프터",
    "zh-CN": "感性工坊手",
  },
  ESTP: {
    ja: "瞬発型プレイヤー",
    en: "Live-Wire Operator",
    ko: "순간 대응 플레이어",
    "zh-CN": "即时出手玩家",
  },
  ESFP: {
    ja: "熱量拡散エンタメ班",
    en: "Spotlight Instigator",
    ko: "열기 확산 엔터형",
    "zh-CN": "气氛点燃器",
  },
};

const strengthText = {
  E: {
    ja: "人を巻き込みながら前に進む推進力がある",
    en: "You generate momentum by pulling people into motion",
    ko: "사람을 끌어들이며 앞으로 밀어붙이는 추진력이 있다",
    "zh-CN": "你能把人卷进来，一起形成推进力",
  },
  I: {
    ja: "静かな環境でも深く掘れる集中力がある",
    en: "You can go deep without needing noise or audience",
    ko: "조용한 환경에서도 깊게 파고드는 집중력이 있다",
    "zh-CN": "你不靠热闹也能沉得很深，专注力很强",
  },
  S: {
    ja: "実感と現実に基づいて手堅く判断できる",
    en: "You make grounded decisions based on what is real and usable",
    ko: "현실과 체감에 기반해 안정적으로 판단한다",
    "zh-CN": "你会基于真实情况和可用信息做稳妥判断",
  },
  N: {
    ja: "今見えていない可能性まで拾い上げられる",
    en: "You notice possibilities that are not obvious yet",
    ko: "아직 드러나지 않은 가능성까지 끌어올릴 수 있다",
    "zh-CN": "你能捞出眼前还没成形的可能性",
  },
  T: {
    ja: "感情に引っ張られず筋道で整理できる",
    en: "You can sort complexity through logic without losing the line",
    ko: "감정에 휩쓸리지 않고 논리로 정리할 수 있다",
    "zh-CN": "你能不被情绪带偏，把复杂问题理顺",
  },
  F: {
    ja: "人の温度や関係性を見ながら判断できる",
    en: "You read human temperature and relationship impact well",
    ko: "사람의 온도와 관계의 영향을 읽으며 판단한다",
    "zh-CN": "你能把人的感受和关系影响一起看进去",
  },
  J: {
    ja: "決めて整えて進める力が強い",
    en: "You are strong at structuring, deciding, and closing loops",
    ko: "정리하고 결정하고 마무리하는 힘이 강하다",
    "zh-CN": "你很擅长把事情定下来、排整齐、收好口",
  },
  P: {
    ja: "変化に合わせてしなやかに打ち手を変えられる",
    en: "You adapt your moves fluidly as reality changes",
    ko: "변화에 맞춰 유연하게 대응 방식을 바꾼다",
    "zh-CN": "现实一变化，你能很顺地换招",
  },
} satisfies Record<string, LocaleText>;

const weaknessText = {
  E: {
    ja: "勢いで話しながら整理すると、粗さが残ることがある",
    en: "Thinking out loud can make you move before the details are ready",
    ko: "말하며 정리하다 보면 디테일이 덜 다듬어진 채 나갈 수 있다",
    "zh-CN": "边说边想很快，但也容易让细节还没磨好就先冲出去",
  },
  I: {
    ja: "抱え込みすぎると、周囲から意図が見えにくくなる",
    en: "If you keep too much inside, people can lose sight of your intent",
    ko: "너무 안으로만 안고 가면 주변이 당신 의도를 읽기 어려워진다",
    "zh-CN": "如果什么都先闷着，周围人会越来越看不懂你想干什么",
  },
  S: {
    ja: "前例や確実性を重く見すぎて機会を逃すことがある",
    en: "Leaning too hard on certainty can make you miss emerging openings",
    ko: "확실함을 너무 중시하면 새 기회를 놓칠 수 있다",
    "zh-CN": "太看重确定性时，你可能会错过正在冒头的新机会",
  },
  N: {
    ja: "可能性を広げすぎると、現実の足場が薄くなる",
    en: "If you chase too many possibilities, practical footing gets thin",
    ko: "가능성을 너무 넓히면 현실적인 발판이 얇아진다",
    "zh-CN": "可能性开太多时，现实落脚点会变薄",
  },
  T: {
    ja: "正しさを急ぐあまり、受け取り手の温度を置き去りにしやすい",
    en: "Your correctness can outrun the other person's emotional bandwidth",
    ko: "맞는 말을 서두르다 보면 상대의 감정 수용 폭을 놓치기 쉽다",
    "zh-CN": "你容易在“说得对”上跑太快，把对方的承受度甩在后面",
  },
  F: {
    ja: "配慮を優先しすぎると、線引きや厳しさが遅れる",
    en: "Protecting harmony too hard can delay needed boundaries",
    ko: "배려를 너무 앞세우면 필요한 선 긋기가 늦어진다",
    "zh-CN": "过度顾及和气时，必要的边界和狠劲会来得太晚",
  },
  J: {
    ja: "早く決めたい気持ちが、余白や迂回路を狭めることがある",
    en: "Your desire for closure can narrow useful detours too soon",
    ko: "빨리 결론 내리고 싶은 마음이 유용한 우회로를 빨리 닫을 수 있다",
    "zh-CN": "你想尽快收口的劲头，有时会把本来有用的绕路过早关掉",
  },
  P: {
    ja: "柔軟さが続くと、決断のタイミングを後ろに送ってしまう",
    en: "Staying open too long can quietly postpone the decision itself",
    ko: "유연함이 길어지면 정작 결단 시점이 뒤로 밀릴 수 있다",
    "zh-CN": "一直保持弹性很好，但也容易把真正该定的时候越拖越后",
  },
} satisfies Record<string, LocaleText>;

const tendencyText = {
  E: {
    ja: "会話や反応の往復からエネルギーを作りやすい",
    en: "You often generate energy through interaction and external momentum",
    ko: "대화와 반응의 왕복 속에서 에너지를 만드는 편이다",
    "zh-CN": "你常常是在互动和外部节奏里把能量拉起来的",
  },
  I: {
    ja: "一人で咀嚼した時間のあとに本領を出しやすい",
    en: "You tend to show your best work after private processing time",
    ko: "혼자 곱씹는 시간을 가진 뒤에 본실력이 더 잘 나온다",
    "zh-CN": "你往往是在自己消化过后，才真正进入发挥状态",
  },
  S: {
    ja: "現物・経験・手触りのある情報を信頼しやすい",
    en: "You naturally trust tangible, experienced, and observable information",
    ko: "실물과 경험, 손에 잡히는 정보를 자연스럽게 신뢰한다",
    "zh-CN": "你天然更相信摸得着、见过、做过的信息",
  },
  N: {
    ja: "意味や流れ、まだ名前のない兆しを拾いやすい",
    en: "You naturally pick up meaning, trajectory, and unnamed signals",
    ko: "의미와 흐름, 아직 이름 붙지 않은 신호를 잘 잡아낸다",
    "zh-CN": "你很容易捕捉到意义、走势，以及还没被命名的信号",
  },
  T: {
    ja: "筋が通っているかどうかを判断の軸に置きやすい",
    en: "You tend to anchor decisions on internal logic and coherence",
    ko: "말이 되는 구조인지 여부를 판단의 축으로 두는 편이다",
    "zh-CN": "你判断时往往会把“逻辑是否通顺”放在主轴上",
  },
  F: {
    ja: "人がどう感じるかを判断プロセスに自然に入れる",
    en: "You naturally include human impact in the decision process",
    ko: "사람이 어떻게 느낄지를 판단 과정에 자연스럽게 넣는다",
    "zh-CN": "你会很自然地把“人会怎么感受”放进判断过程",
  },
  J: {
    ja: "終わり方と段取りを見える形にしたくなる",
    en: "You like the path and endpoint to become visible",
    ko: "진행 경로와 마무리 지점을 눈에 보이게 만들고 싶어 한다",
    "zh-CN": "你会本能地想把路径和终点都变得可见",
  },
  P: {
    ja: "走りながら最適化し、途中の発見を活かしやすい",
    en: "You optimize on the move and use discoveries made midstream",
    ko: "움직이면서 최적화하고 중간 발견을 잘 살린다",
    "zh-CN": "你擅长边走边调，把路上捡到的新发现立刻用起来",
  },
} satisfies Record<string, LocaleText>;

const cautionText = {
  E: {
    ja: "反応があるほど加速するので、休息まで予定化したほうがいい",
    en: "Because response energizes you, you may need to schedule recovery on purpose",
    ko: "반응이 있을수록 더 달리기 때문에 회복도 일정에 넣는 편이 낫다",
    "zh-CN": "你越有回应越会加速，所以休息最好也主动排进计划里",
  },
  I: {
    ja: "説明不足のまま距離を取ると、誤解だけが先に育つ",
    en: "If you retreat without explanation, misunderstanding grows faster than clarity",
    ko: "설명 없이 거리를 두면 오해가 이해보다 빨리 자란다",
    "zh-CN": "如果你一退就不解释，误会会比理解长得更快",
  },
  S: {
    ja: "安全策だけを守ると、次の伸びしろを他人に持っていかれやすい",
    en: "If you stay only with safe bets, someone else may capture the next opening",
    ko: "안전한 선택만 지키다 보면 다음 기회는 다른 사람이 가져갈 수 있다",
    "zh-CN": "如果你只守安全牌，下一个增长口子很可能会被别人拿走",
  },
  N: {
    ja: "着想の密度に対して着地の設計が足りないと、周囲はついてこない",
    en: "If landing design lags behind imagination, others stop following",
    ko: "상상력에 비해 착지 설계가 부족하면 주변은 따라오지 못한다",
    "zh-CN": "如果想象飞得太快、落地设计跟不上，别人就跟不上你",
  },
  T: {
    ja: "『正しいから十分』で押し切ると、協力コストが後で増える",
    en: "Forcing a correct answer through can raise the collaboration cost later",
    ko: "'맞으니 됐다'로 밀어붙이면 나중 협업 비용이 더 커질 수 있다",
    "zh-CN": "如果你靠“我就是对的”硬推进，后面的协作成本通常会反弹回来",
  },
  F: {
    ja: "全員の納得を待ちすぎると、必要な決定が蒸発する",
    en: "Waiting for everyone's comfort can make the needed decision evaporate",
    ko: "모두의 납득을 기다리다 보면 필요한 결정 자체가 흐려질 수 있다",
    "zh-CN": "如果你一直等所有人都舒服，真正该做的决定可能会直接蒸发",
  },
  J: {
    ja: "完成度を保つほど、変更に対して意地にならない工夫が必要",
    en: "The more you value completion, the more you need tools for graceful revision",
    ko: "완성도를 중시할수록 수정에 고집으로 버티지 않는 장치가 필요하다",
    "zh-CN": "你越重视成型，越需要一套能优雅改动、而不是死扛的机制",
  },
  P: {
    ja: "自由度を守るほど、締切や共有の節目を意識的に作る必要がある",
    en: "The more freedom you keep, the more intentionally you need checkpoints",
    ko: "자유도를 지킬수록 마감과 공유 시점을 의식적으로 만들어야 한다",
    "zh-CN": "你越想保留自由度，就越要主动给自己造检查点和截止点",
  },
} satisfies Record<string, LocaleText>;

export function getTypeTitle(type: string, locale: SupportedLocale) {
  return typeTitles[type]?.[locale] ?? type;
}

export function getTypeProfile(type: string, locale: SupportedLocale) {
  const letters = type.split("") as Letter[];

  return {
    title: getTypeTitle(type, locale),
    strengths: letters.map((letter) => strengthText[letter][locale]),
    weaknesses: letters.map((letter) => weaknessText[letter][locale]),
    tendencies: letters.map((letter) => tendencyText[letter][locale]),
    cautions: letters.map((letter) => cautionText[letter][locale]),
  };
}
