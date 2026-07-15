/**
 * MVP Learning Content for Meridian Learn module.
 * All content stored as TypeScript constants — no external CMS or database.
 *
 * Each learning path has:
 *  - id: kebab-case slug, e.g. "five-elements"
 *  - title: display title
 *  - description: short description
 *  - lessonCount: total lessons (excluding quizzes)
 *  - quizCount: number of quizzes
 *  - lessons: array of lesson objects
 *  - quizzes: optional quiz at the tagged location
 */

export interface GlossaryTerm {
  term: string
  pinyin?: string
  definition: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
}

export interface Lesson {
  id: string
  title: string
  duration: number // minutes
  content: string // markdown-like text
  tips?: string[] // gold-bordered tip cards
}

export interface LearningPath {
  id: string
  title: string
  description: string
  featured: boolean
  lessons: Lesson[]
  quizzes: Quiz[]
}

// ───────────────────────────────
// Path 1: 五行入门 (Five Elements)
// ───────────────────────────────

const fiveElementsPath: LearningPath = {
  id: 'five-elements',
  title: '五行入门',
  description: '理解金木水火土的核心概念',
  featured: true,
  lessons: [
    {
      id: 'basics',
      title: '什么是五行？',
      duration: 5,
      content:
        '五行学说是中国古代哲学的核心理论之一，最早见于《尚书·洪范》。五行指木、火、土、金、水五种基本物质及其运动变化。\n\n五行的概念不是简单的五种物质分类，而是对宇宙万物属性的抽象归纳。每一行都有其独特的特性、象征和对应的自然界与人体现象。\n\n五行学说在中医、命理、风水、音乐、军事等多个领域都有广泛应用。理解五行是学习东方智慧的基础。',
      tips: [
        '五行最早作为治国方略出现在《尚书》中，后来才发展成哲学体系。',
        '不要将五行简单地理解为五种物质——它们代表的是五种能量和运动模式。',
      ],
    },
    {
      id: 'wood',
      title: '木',
      duration: 8,
      content:
        '木（Wood）——象征生长、条达、舒展。\n\n特性：\n• 方向：东方\n• 季节：春季\n• 颜色：绿色\n• 味道：酸\n• 脏腑：肝、胆\n• 情志：怒\n• 性质：生发、柔和\n\n木代表一切具有生长、升发、条达舒畅属性的事物。春天万物复苏、草木萌发，正是"木"气的体现。木型人通常性格温和、有仁爱之心、善于规划。\n\n在人格特质上，木德为"仁"，表现为宽容、慈爱、有远见。过于旺盛则可能固执己见；不足则可能缺乏主见。',
      tips: [
        '木的"条达"是通畅舒展的意思，就像树木自由生长。',
        '在八字中，木旺的人往往有领导力和创造力。',
      ],
    },
    {
      id: 'fire',
      title: '火',
      duration: 8,
      content:
        '火（Fire）——象征炎热、向上、光明。\n\n特性：\n• 方向：南方\n• 季节：夏季\n• 颜色：红色\n• 味道：苦\n• 脏腑：心、小肠\n• 情志：喜\n• 性质：炎热、升腾\n\n火代表一切具有温热、升腾、光明属性的事物。夏季炎热、太阳高照，是"火"气的鼎盛时期。火型人通常热情开朗、有礼貌、思维敏捷。\n\n火德为"礼"，表现为文明、礼貌、热情。过于旺盛则容易急躁冲动；不足则可能缺乏热情、冷漠。',
      tips: ['火对应的颜色是红色——在中国文化中红色代表吉祥、喜庆不是偶然的。', '心属火，所以中医说"心主神明"，思维和情绪都与火相关。'],
    },
    {
      id: 'earth',
      title: '土',
      duration: 7,
      content:
        '土（Earth）——象征承载、化育、中和。\n\n特性：\n• 方向：中央\n• 季节：季夏（每个季节的最后一个月）\n• 颜色：黄色\n• 味道：甘\n• 脏腑：脾、胃\n• 情志：思\n• 性质：承载、化生\n\n土代表一切具有承载、孕育、转化属性的事物。大地承载万物，是生养之本。土型人通常稳重、诚信、包容。\n\n土德为"信"，表现为诚信、踏实、包容。过于旺盛则可能固执保守；不足则可能缺乏稳定性。\n\n在五行中，土居于中央，有"中和"的特性，是其他四行的枢纽。',
      tips: ['土在四季中各占18天，称为"季土"或"土王用事"。', '脾胃属土，所以饮食规律对健康至关重要。'],
    },
    {
      id: 'metal',
      title: '金',
      duration: 6,
      content:
        '金（Metal）——象征肃杀、收敛、变革。\n\n特性：\n• 方向：西方\n• 季节：秋季\n• 颜色：白色\n• 味道：辛\n• 脏腑：肺、大肠\n• 情志：悲\n• 性质：清肃、收敛\n\n金代表一切具有清肃、收敛、变革属性的事物。秋天万物凋零、果实成熟，是"金"气的体现。金型人通常果断、坚毅、有原则。\n\n金德为"义"，表现为正义、果断、有原则。过于旺盛则可能过于严苛；不足则可能优柔寡断。',
      tips: ['金的意象不只是金属，还包括秋天、西方、白色等抽象对应。', '在中医中，肺属金，主气，司呼吸。'],
    },
    {
      id: 'water',
      title: '水',
      duration: 6,
      content:
        '水（Water）——象征寒冷、向下、智慧。\n\n特性：\n• 方向：北方\n• 季节：冬季\n• 颜色：黑色\n• 味道：咸\n• 脏腑：肾、膀胱\n• 情志：恐\n• 性质：寒凉、滋润\n\n水代表一切具有寒凉、滋润、向下属性的事物。冬天万物收藏、水结成冰，是"水"气的体现。水型人通常智慧、灵活、善于变通。\n\n水德为"智"，表现为智慧、灵活、深沉。过于旺盛则可能阴险善变；不足则可能缺乏应变能力。',
      tips: ['水主智——所以"智者乐水"不是比喻，是五行理论的直接体现。', '肾属水，所以养肾就是养水的能量。'],
    },
    {
      id: 'generating-overcoming',
      title: '五行的相生相克',
      duration: 10,
      content:
        '五行之间有着特定的生克关系，这是五行学说的核心运作机制。\n\n**相生（Generating Cycle）：**\n木生火 → 火生土 → 土生金 → 金生水 → 水生木\n\n相生的含义：前者促进、滋生后者。就像树木燃烧产生火（木生火），火烧完后化为灰土（火生土），土中蕴藏金属矿物（土生金），金属熔化变为液体（金生水），水滋养树木生长（水生木）。\n\n**相克（Overcoming Cycle）：**\n木克土 → 土克水 → 水克火 → 火克金 → 金克木\n\n相克的含义：前者制约、克制后者。就像树木的根系可以固定土壤（木克土），土可以筑堤挡水（土克水），水可以灭火（水克火），火可以熔化金属（火克金），金属刀具可以砍伐树木（金克木）。\n\n**生克关系的重要性：**\n相生使五行得以循环、延续；相克使五行保持平衡、不过度。生克关系提供了理解宇宙万物变化的基本框架。',
      tips: [
        '相生是"母子"关系——生我者为母，我生者为子。',
        '相克是"制约"关系——没有制约就会失去平衡。',
        '命理中看一个人的八字，就是在分析五行的生克平衡状况。',
      ],
    },
  ],
  quizzes: [
    {
      id: 'five-elements-quiz',
      title: '五行入门测验',
      questions: [
        {
          question: '五行的正确相生顺序是？',
          options: ['金木水火土', '木火土金水', '水火土金木', '土金水火木'],
          correctIndex: 1,
          explanation: '"木火土金水"是相生顺序。木生火、火生土、土生金、金生水、水生木，形成循环。',
        },
        {
          question: '哪个方向对应"火"行？',
          options: ['东方', '西方', '南方', '北方'],
          correctIndex: 2,
          explanation: '火对应南方。南方炎热，与火的热性相应。',
        },
        {
          question: '木克什么？',
          options: ['火', '土', '金', '水'],
          correctIndex: 1,
          explanation: '木克土。树木的根系可以固定和穿透土壤。',
        },
        {
          question: '五脏中，哪个属于"土"行？',
          options: ['肝', '心', '脾', '肾'],
          correctIndex: 2,
          explanation: '脾属土。脾胃负责消化吸收，具有土的"承载化育"特性。',
        },
        {
          question: '在五行理论中，"水"对应的德行是？',
          options: ['仁', '义', '礼', '智'],
          correctIndex: 3,
          explanation: '水德为"智"。水善于变通、适应，象征智慧。',
        },
      ],
    },
  ],
}

// ───────────────────────────────
// Path 2: 八字基础 (BaZi Basics)
// ───────────────────────────────

const baziPath: LearningPath = {
  id: 'bazi-basics',
  title: '八字基础',
  description: '学会看懂你的出生时间密码',
  featured: false,
  lessons: [
    {
      id: 'what-is-bazi',
      title: '什么是八字',
      duration: 5,
      content:
        '八字，又称四柱命理学，是中国传统命理学的核心体系之一。\n\n"八字"指的是一个人出生时的年、月、日、时，用天干地支分别表示，共八个字，故称"八字"。\n\n年柱：出生年份的天干地支\n月柱：出生月份的天干地支\n日柱：出生日期的天干地支\n时柱：出生时辰的天干地支\n\n八字理论认为，一个人出生时宇宙的气场状态（即四柱八字的五行配置）会影响其一生的性格、运势和发展轨迹。',
      tips: [
        '八字不是迷信，而是一套基于天文历法（干支纪时）的分析框架。',
        '八字的历史可追溯到唐代李虚中，宋代徐子平将其完善为现今的体系。',
      ],
    },
    {
      id: 'heavenly-stems-earthly-branches',
      title: '天干地支',
      duration: 8,
      content:
        '天干地支是中国古代记录时间的符号系统，也是八字的基础工具。\n\n**十天干（Heavenly Stems）：**\n甲、乙、丙、丁、戊、己、庚、辛、壬、癸\n\n天干分阴阳：\n• 阳干：甲、丙、戊、庚、壬\n• 阴干：乙、丁、己、辛、癸\n\n天干配五行：\n• 甲乙-木、丙丁-火、戊己-土、庚辛-金、壬癸-水\n\n**十二地支（Earthly Branches）：**\n子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥\n\n地支配生肖：\n子鼠、丑牛、寅虎、卯兔、辰龙、巳蛇、午马、未羊、申猴、酉鸡、戌狗、亥猪\n\n地支配五行：\n寅卯-木、巳午-火、申酉-金、亥子-水、辰戌丑未-土',
      tips: [
        '天干地支起源于商代，距今已有三千多年历史。',
        '地支除了五行属性，每个还藏有若干"藏干"，在八字分析中至关重要。',
      ],
    },
    {
      id: 'four-pillars-structure',
      title: '四柱结构',
      duration: 7,
      content:
        '四柱是八字的骨架，每一柱由一个天干和一个地支组成。\n\n**年柱：**代表祖上、童年、大环境。年柱的天干叫"年干"，地支叫"年支"。\n\n**月柱：**代表父母、青年时期、家庭背景。月柱还反映季节和五行旺衰——这是八字分析的"月令"概念。\n\n**日柱：**代表自己和配偶、中年时期。日柱的天干叫"日主"或"日元"——这是八字分析的核心，代表命主本人。\n\n**时柱：**代表子女、晚年、最终成就。\n\n四柱排列示例：\n年柱  月柱  日柱  时柱\n甲辰  丙寅  戊戌  庚申\n\n其中，日柱的"戊"就是日主——这个人属于"戊土"命。',
      tips: [
        '排四柱需要准确的出生年月日时和出生地（用于真太阳时校正）。',
        '月柱由年干和月支共同决定——有一套"五虎遁"口诀来确定。',
      ],
    },
    {
      id: 'day-master-five-elements',
      title: '日主与五行',
      duration: 7,
      content:
        '日主（Day Master）是一个八字中最重要的概念。\n\n日主就是日柱的天干，代表命主本人。日主是什么五行，这个人的基础特质就与那一行相关。\n\n**五行的日主类型：**\n\n甲木（阳木）：如参天大树——正直、有担当、有领导力\n乙木（阴木）：如花草藤蔓——柔韧、灵活、善于适应\n\n丙火（阳火）：如太阳——热情、光明、感染力强\n丁火（阴火）：如灯烛——温暖、细腻、有艺术气质\n\n戊土（阳土）：如高山——稳重、包容、有格局\n己土（阴土）：如田园——细腻、滋养、善于培养\n\n庚金（阳金）：如刀剑——果断、刚毅、有原则\n辛金（阴金）：如珠宝——精致、优雅、追求完美\n\n壬水（阳水）：如江河——奔放、智慧、善于变通\n癸水（阴水）：如雨露——细腻、敏感、洞察力强\n\n**身强与身弱：**\n八字分析中一个重要概念是"身强"和"身弱"——不是指身体素质，而是日主在八字中的力量强弱。身强的人通常自信、独立、承受力强；身弱的人则可能敏感、依赖、需要借力。',
      tips: [
        '日主的五行只是起点分析，还必须看月令（季节旺衰）、其他三柱的生克关系。',
        '没有绝对的好坏——身强身弱各有优缺点，关键是看五行是否平衡。',
      ],
    },
  ],
  quizzes: [
    {
      id: 'bazi-quiz',
      title: '八字基础测验',
      questions: [
        {
          question: '"八字"中的"字"是指什么？',
          options: ['八个文字', '天干地支的八个符号', '八种五行', '八个方位'],
          correctIndex: 1,
          explanation: '八字由年、月、日、时各一干一支组成，共八个字（符号）。',
        },
        {
          question: '十天干中，属木的是哪一组？',
          options: ['甲、乙', '丙、丁', '戊、己', '庚、辛'],
          correctIndex: 0,
          explanation: '甲乙属木，甲为阳木，乙为阴木。',
        },
        {
          question: '八字的"日主"指的是什么？',
          options: ['出生日期的地支', '日柱的天干', '生日当天的五行', '太阳在八字中的位置'],
          correctIndex: 1,
          explanation: '日主是日柱的天干，代表命主本人。它是八字分析的核心。',
        },
        {
          question: '地支"午"对应的生肖是什么？',
          options: ['蛇', '羊', '马', '猴'],
          correctIndex: 2,
          explanation: '午对应马。子鼠、丑牛、寅虎、卯兔、辰龙、巳蛇、午马、未羊、申猴、酉鸡、戌狗、亥猪。',
        },
      ],
    },
  ],
}

// ───────────────────────────────
// Path 3: 紫微十二宫 (Zi Wei Palaces)
// ───────────────────────────────

const ziweiPath: LearningPath = {
  id: 'ziwei-palaces',
  title: '紫微十二宫',
  description: '探索紫微斗数的宫位系统',
  featured: false,
  lessons: [
    {
      id: 'ziwei-overview',
      title: '紫微斗数概述',
      duration: 5,
      content:
        '紫微斗数是中华传统命理学中最具体系化的术数之一，与八字并列为两大主流命理工具。\n\n传说紫微斗数起源于宋代，由陈抟（希夷先生）所创。它以北天极的紫微星为名，象征"众星之主"。\n\n**紫微斗数的核心特点：**\n\n1. **星曜体系**：以紫微星为首的百余颗星曜，每颗星有独特的属性和吉凶意义。核心星曜约30颗。\n\n2. **宫位体系**：将人生分为12个宫位，涵盖命、兄弟、夫妻、子女等各方面。\n\n3. **四化飞星**：化禄、化权、化科、化忌——星曜在不同宫位会产生四种变化。\n\n4. **大限与流年**：以十年为一大限，逐年为流年，动态分析运势变化。',
      tips: ['紫微斗数的排盘比八字复杂，但解读起来更具象、更直观。', '在华人世界，尤其是在港澳台和东南亚，紫微斗数比八字更受欢迎。'],
    },
    {
      id: 'twelve-palaces',
      title: '十二宫含义',
      duration: 8,
      content:
        '紫微斗数将人生划分为十二个宫位，每个宫位代表一个生活领域。\n\n**命宫**：代表人的本质、性格、命运基调。是最重要的宫位。\n\n**兄弟宫**：代表兄弟姐妹关系，也可看妈妈、同事。\n\n**夫妻宫**：代表婚姻状况、配偶特质、感情模式。\n\n**子女宫**：代表子女情况、生育能力、与晚辈的关系。\n\n**财帛宫**：代表财运、理财能力、收入方式。\n\n**疾厄宫**：代表健康状况、易患的疾病类型。\n\n**迁移宫**：代表外出发展、旅行、人际交往能力。\n\n**交友宫（仆役宫）**：代表朋友、社交圈、下属。\n\n**官禄宫**：代表事业、学业、职业发展。\n\n**田宅宫**：代表房产、居住环境、家族根基。\n\n**福德宫**：代表精神生活、福气、内心世界、兴趣。\n\n**父母宫**：代表父母关系、遗传、社会背景。',
      tips: [
        '命宫是十二宫之首，其他宫位都要以命宫为立足点来分析。',
        '每个宫位中都有星曜，星曜的组合和吉凶决定了该宫位的好坏。',
      ],
    },
    {
      id: 'ming-palace',
      title: '命宫详解',
      duration: 7,
      content:
        '命宫是紫微斗数最重要的宫位，代表一个人的先天性格、命运基调。\n\n**命宫的确定：**\n命宫的位置由出生月份和时辰决定。排盘时，从寅宫起正月，顺时针数到出生月，然后从该位置逆时针数到出生时——这就是命宫所在。\n\n**命宫主要看什么：**\n\n1. **主星**：命宫中的主星决定了性格基调。例如：\n   - 紫微坐命：有领导欲，自尊心强\n   - 天机坐命：聪明善变，思维敏捷\n   - 太阳坐命：热情大方，光明磊落\n   - 武曲坐命：刚毅果断，有执行力\n\n2. **辅星**：左辅、右弼、文昌、文曲等辅星可以增强或调整主星的特质。\n\n3. **四化**：命宫的化禄、化权、化科、化忌会极大影响命局。\n\n4. **三方四正**：命宫的对宫（迁移宫）、三合宫（财帛、官禄）会形成综合判断。',
      tips: [
        '命宫空宫的情况也很常见——这并不意味着命不好，主星会借对宫来体现。',
        '命宫的分析需要结合整个命盘，单看一个宫位容易片面。',
      ],
    },
  ],
  quizzes: [
    {
      id: 'ziwei-quiz',
      title: '十二宫基础测验',
      questions: [
        {
          question: '紫微斗数中，代表婚姻和配偶的宫位是？',
          options: ['命宫', '夫妻宫', '交友宫', '田宅宫'],
          correctIndex: 1,
          explanation: '夫妻宫代表婚姻状况、配偶特质和感情模式。',
        },
        {
          question: '紫微斗数共有多少个宫位？',
          options: ['10个', '12个', '14个', '36个'],
          correctIndex: 1,
          explanation: '紫微斗数有十二个宫位，涵盖人生的各个方面。',
        },
        {
          question: '命宫的三方四正中，不包括以下哪个？',
          options: ['迁移宫', '财帛宫', '官禄宫', '父母宫'],
          correctIndex: 3,
          explanation: '命宫的三方四正包括：命宫本身、迁移宫（对宫）、财帛宫和官禄宫（三合宫）。',
        },
        {
          question: '紫微斗数的"四化"是哪四化？',
          options: ['化吉、化凶、化福、化祸', '化禄、化权、化科、化忌', '化金、化木、化水、化火', '化福、化寿、化财、化官'],
          correctIndex: 1,
          explanation: '四化是化禄（财运）、化权（权力）、化科（名声）、化忌（困扰），是星曜在不同宫位产生的变化。',
        },
      ],
    },
  ],
}

// ───────────────────────────────
// Glossary Terms
// ───────────────────────────────

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: '甲',
    pinyin: 'jiǎ',
    definition: '十天干之首，属阳木。象征参天大树，代表正直、有担当的特质。在八字中为年干或月干时，往往代表领导力。',
  },
  {
    term: '乙',
    pinyin: 'yǐ',
    definition: '十天干次位，属阴木。象征花草藤蔓，代表柔韧、灵活、善于适应的特质。乙木人通常有艺术气质。',
  },
  {
    term: '丙',
    pinyin: 'bǐng',
    definition: '十天干第三，属阳火。象征太阳之火，代表热情、光明、有感染力。丙火人通常性格开朗、有领袖魅力。',
  },
  {
    term: '丁',
    pinyin: 'dīng',
    definition: '十天干第四，属阴火。象征灯烛之火，代表温暖、细腻、专注。丁火人通常有洞察力和艺术天赋。',
  },
  {
    term: '戊',
    pinyin: 'wù',
    definition: '十天干第五，属阳土。象征高山厚土，代表稳重、包容、有格局。戊土人通常踏实可信，有大将之风。',
  },
  {
    term: '己',
    pinyin: 'jǐ',
    definition: '十天干第六，属阴土。象征田园之土，代表细腻、滋养、善于培育。己土人通常有服务精神和耐心。',
  },
  {
    term: '庚',
    pinyin: 'gēng',
    definition: '十天干第七，属阳金。象征刀剑钢铁，代表果断、刚毅、有原则。庚金人通常执行力强、正义感强。',
  },
  {
    term: '辛',
    pinyin: 'xīn',
    definition: '十天干第八，属阴金。象征珠宝玉石，代表精致、优雅、追求完美。辛金人通常审美出众、有品位。',
  },
  {
    term: '壬',
    pinyin: 'rén',
    definition: '十天干第九，属阳水。象征江河大海，代表智慧、奔放、善于变通。壬水人通常思维开阔、社交能力强。',
  },
  {
    term: '癸',
    pinyin: 'guǐ',
    definition: '十天干最末，属阴水。象征雨露甘霖，代表细腻、敏感、洞察力强。癸水人通常直觉敏锐、有灵性。',
  },
  {
    term: '用神',
    pinyin: 'yòng shén',
    definition: '八字分析的核心概念。用神是对命主最有利的五行或干支，能补足八字中的缺失、平衡过旺或过弱的力量。找准用神是八字断命的关键。',
  },
  {
    term: '大运',
    pinyin: 'dà yùn',
    definition: '八字中每十年为一"大运"，代表一个人在不同人生阶段的运势走向。大运的起运时间和内容由出生时间和八字共同决定。',
  },
  {
    term: '日主',
    pinyin: 'rì zhǔ',
    definition: '又称日元，即八字中日柱的天干。日主代表命主本人，是八字分析的核心。日主的五行属性决定了人的基础特质。',
  },
  {
    term: '四柱',
    pinyin: 'sì zhù',
    definition: '年柱、月柱、日柱、时柱的合称。每柱由一个天干和一个地支组成，共八个字，即"八字"。四柱分别代表人生的不同阶段和领域。',
  },
  {
    term: '相生',
    pinyin: 'xiāng shēng',
    definition: '五行的生成关系：木生火、火生土、土生金、金生水、水生木。相生使五行得以循环延续。',
  },
  {
    term: '相克',
    pinyin: 'xiāng kè',
    definition: '五行的制约关系：木克土、土克水、水克火、火克金、金克木。相克使五行保持平衡、不过度。',
  },
  {
    term: '紫微星',
    pinyin: 'zǐ wēi xīng',
    definition: '紫微斗数中的主星之首，为帝星。紫微星坐命的人通常有领导欲、自尊心强、有格局。紫微斗数即以此星命名。',
  },
  {
    term: '化忌',
    pinyin: 'huà jì',
    definition: '紫微斗数"四化"之一。化忌代表困扰、阻碍、缺失，是四化中较不吉的一种。但化忌所在宫位也往往是一个人最需要修炼和突破的领域。',
  },
  {
    term: '命宫',
    pinyin: 'mìng gōng',
    definition: '紫微斗数最重要的宫位。命宫代表一个人的先天性格、命运基调。命宫中的星曜组合决定了性格特质。',
  },
  {
    term: '身宫',
    pinyin: 'shēn gōng',
    definition: '紫微斗数中的辅助宫位，与命宫互为表里。命宫代表"先天"，身宫代表"后天"——即一个人后天的努力方向和人生着力点。身宫通常与命宫或其他宫位同宫。',
  },
]

// ───────────────────────────────
// Badges
// ───────────────────────────────

export interface Badge {
  id: string
  label: string
  description: string
  icon: string
  condition: 'path-complete' | 'days-streak' | 'all-paths'
  pathId?: string
  requiredDays?: number
}

export const badges: Badge[] = [
  {
    id: 'five-elements-master',
    label: '五行入门',
    description: '完成五行入门全部课程',
    icon: '🪵',
    condition: 'path-complete',
    pathId: 'five-elements',
  },
  {
    id: 'bazi-master',
    label: '八字基础',
    description: '完成八字基础全部课程',
    icon: '📜',
    condition: 'path-complete',
    pathId: 'bazi-basics',
  },
  {
    id: 'day-7-streak',
    label: '第7天打卡',
    description: '连续学习7天',
    icon: '🔥',
    condition: 'days-streak',
    requiredDays: 7,
  },
  {
    id: 'day-30-streak',
    label: '30天坚持',
    description: '连续学习30天',
    icon: '⭐',
    condition: 'days-streak',
    requiredDays: 30,
  },
  {
    id: 'ziwei-master',
    label: '紫微入门',
    description: '完成紫微十二宫全部课程',
    icon: '🌟',
    condition: 'path-complete',
    pathId: 'ziwei-palaces',
  },
  {
    id: 'theorist',
    label: '理论家',
    description: '完成所有学习路径',
    icon: '📚',
    condition: 'all-paths',
  },
  {
    id: 'explorer',
    label: '探索者',
    description: '浏览过所有学习路径',
    icon: '🧭',
    condition: 'all-paths',
  },
]

// ───────────────────────────────
// Exported collection
// ───────────────────────────────

export const learningPaths: LearningPath[] = [
  fiveElementsPath,
  baziPath,
  ziweiPath,
]

export function getPathById(id: string): LearningPath | undefined {
  return learningPaths.find((p) => p.id === id)
}

export function getLessonById(pathId: string, lessonId: string): Lesson | undefined {
  const path = getPathById(pathId)
  return path?.lessons.find((l) => l.id === lessonId)
}

export function getQuizById(pathId: string, quizId: string): Quiz | undefined {
  const path = getPathById(pathId)
  return path?.quizzes.find((q) => q.id === quizId)
}

export function getTotalLessonCount(): number {
  return learningPaths.reduce((sum, p) => sum + p.lessons.length, 0)
}
