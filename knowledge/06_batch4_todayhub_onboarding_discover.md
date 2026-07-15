# Meridian V2 — 施工图 Batch 4
### Today Hub / Coach Feed UI → Onboarding 逐屏设计 → Discover Engine 内容生产 Pipeline

---

# PART 1 — Today Hub & Coach Feed 视觉施工图

## 1.0 设计延续声明

严格复用已定稿的 Meridian Design System：

```
色彩: Meridian Black #0D0D0D · Ivory #F7F5F0 · Gold #C4A96B(≤5%覆盖率) · Deep Navy #0E1117
字体: Display用Serif(Canela/Liberation Serif) · 正文用Sans(Inter) · 数据用Mono(IBM Plex Mono)
原则: 极简、留白、无图标堆砌、无渐变、无阴影
```

App 场景与 PDF 报告场景的核心差异：**PDF是"一次性交付物"，App是"每日容器"——所以App UI必须比PDF更克制，信息密度必须更低，留白必须更多。**

---

## 1.1 Today Hub 页面结构（首页，最高频页面）

```
┌─────────────────────────────────┐
│  [状态栏]                        │
│                                   │
│  Good morning, Alex.       ⚙    │ ← Sans 8pt, Muted / 设置icon极简线条
│                                   │
│                                   │
│         ╭─────────╮              │
│        ╱           ╲             │ ← Energy Ring
│       │      82     │            │   外环: Gold描边，粗细随分数变化
│       │             │            │   中心数字: Serif Bold 42pt, Ink
│        ╲  Water Day ╱             │   环下文字: Mono 7pt, Muted
│         ╰─────────╯              │
│                                   │
│   "今天的能量支持耐心与协商。"      │ ← Serif Italic 11pt, Ink，居中
│                                   │   单行，不超过一句话
│  ─────────────────────────────   │ ← Smoke 0.3pt 分隔线
│                                   │
│  Today's Focus                   │ ← Sans Bold 8pt, tracking+90, Muted
│  ○ 上午适合推进需要专注的事        │ ← Gold圆点bullet + Sans 8.5pt
│                                   │
│  ─────────────────────────────   │
│                                   │
│  ┌─────────────────────────┐    │
│  │  How are you today?      │    │ ← Check-in卡片
│  │  😔  😐  🙂  😊  🤩       │    │   5档心情，非精美插画，纯几何/极简emoji风格
│  └─────────────────────────┘    │
│                                   │
│  ┌───────────┐  ┌────────────┐  │
│  │ Ask about  │  │  Ask about │  │ ← 快捷入口（非底部导航，是首页内嵌卡片）
│  │  Today     │  │  This Week │  │
│  └───────────┘  └────────────┘  │
│                                   │
│  [🔥 12-day streak]              │ ← 底部固定小条，Mono字体，Gold文字
└─────────────────────────────────┘
```

### 关键组件规格

<details>
<summary><b>Energy Ring 组件详细规格</b></summary>

```
Component: EnergyRing
Dimensions: 直径 180pt（移动端），140pt（紧凑模式）
Structure:
  - 背景环: stroke=6pt, color=Smoke(#E8E6E1)
  - 数据环: stroke=6pt, color=Gold(#C4A96B), 
            弧长 = (score/100) × 360°, 起始角度=-90°(顶部12点方向)
  - 环形动效: 首次加载时从0动画填充至目标值，duration=1200ms, easing=ease-out
  - 中心数字: Serif Bold, 字号按容器动态缩放(约容器直径的23%)
  - 环下标签: 显示"今日日柱元素"，如"Water Day"

Score区间的视觉/文案联动(非颜色分级，保持极简，只用文案区分):
  85-100: "Peak" 
  65-84:  "Favorable"
  40-64:  "Neutral"
  20-39:  "Reflective"
  0-19:   "Rest"
  
注意：绝不用红/黄/绿traffic-light配色区分好坏分数——
这是"算命App"最俗气的信号，Meridian只用金色单色环+文案区分。
```
</details>

<details>
<summary><b>Check-in Card 组件规格</b></summary>

```
Component: CheckinCard
背景: White #FFFFFF, border-radius=12pt, border=0.4pt Smoke
Padding: 16pt all sides
情绪选择器: 5个自定义SVG图标(非系统emoji)
  - 未选中态: outline样式，Dust色描边
  - 选中态: fill样式，Ink色填充 + 轻微scale(1.1)动效
  - 选中后自动展开: 可选tag多选(如 anxious/tired/excited/focused...)
  - Tag选择完成后自动收起，无需点击"提交"按钮(减少摩擦)
```
</details>

<details>
<summary><b>快捷入口卡片</b></summary>

```
Component: QuickAskCard
两个并排卡片，等宽
背景: Ivory tint (#F2EFEA)
文字: Sans 8pt Bold, Ink
点击行为: 直接跳转Coach Feed并预填充问题模板到输入框
  "Ask about Today" → 预填 "帮我解读一下今天"
  "Ask about This Week" → 预填 "这一周整体怎么样"
```
</details>

---

## 1.2 Coach Feed 页面结构（第二大高频页面）

**设计核心理念：这不是聊天窗口，是一条"时间线"——像 Twitter/微博的Feed，混合AI主动消息和用户对话，按时间倒序。**

```
┌─────────────────────────────────┐
│  Coach                           │ ← Serif 18pt, Ink
│  ─────────────────────────────   │
│                                   │
│  ┌─────────────────────────┐    │
│  │ TODAY · 8:02 AM           │    │ ← Mono 6pt, Dust, 时间戳
│  │                            │    │
│  │ Today carries Water        │    │ ← AI主动消息卡片
│  │ energy, which supports     │    │   Serif 10pt, Ink, 无气泡框
│  │ your core pattern.         │    │   左侧细金线代替头像
│  │                            │    │
│  │ ▎                          │    │
│  └─────────────────────────┘    │
│                                   │
│           You  ·  8:15 AM        │ ← 用户消息：右对齐，
│      ┌──────────────────┐        │   浅灰背景气泡，与AI消息形成区分
│      │ 那我今天该避免什么？  │      │
│      └──────────────────┘        │
│                                   │
│  ┌─────────────────────────┐    │
│  │ Given today's pattern,     │    │ ← AI回复
│  │ avoid rushing financial     │    │
│  │ decisions before evening.   │    │
│  └─────────────────────────┘    │
│                                   │
│  ─── Yesterday ──────────────    │ ← 日期分隔线，Sans 7pt, Dust, 居中
│                                   │
│  [更早的Feed内容...]              │
│                                   │
├─────────────────────────────────┤
│  [Ask Meridian...        ] [➤]  │ ← 底部输入框，固定
└─────────────────────────────────┘
```

### 关键交互设计

<details>
<summary><b>AI主动消息 vs 用户发起对话的视觉区分</b></summary>

```
AI主动消息(Coach Trigger发出):
  - 左侧2pt Gold竖线标记(呼应PDF设计语言中的Trait Marker组件)
  - 无背景色，直接在Ivory背景上
  - 顶部显示触发来源标签(极小字号): "Daily Briefing" / "Pattern Noticed" 等
  - 用户可以对其"追问"(点击后自动进入对话延续)

用户主动提问 + AI应答:
  - 用户消息: 右对齐，浅灰气泡(#F2EFEA)，Sans字体(与AI的Serif形成区分)
  - AI应答: 左对齐，无气泡，Serif字体
  - 这个字体差异化处理，是"东方智慧沉稳感"与"用户口语化"的视觉区分
```
</details>

<details>
<summary><b>输入框与建议问题</b></summary>

```
Component: CoachInputBar
默认态: placeholder = "Ask Meridian anything..."
聚焦态: 上方弹出3个建议问题(Chip样式)，基于当前上下文动态生成
  例如根据当日命理状态: 
  ["为什么今天建议谨慎决策？" / "我的用神是什么意思？" / "这周整体如何？"]
Chip样式: 圆角胶囊, border=Dust 0.4pt, Sans 7pt, 点击后填入输入框
```
</details>

---

## 1.3 Blueprint 趋势页局部规格（Memory驱动的核心展示）

```
┌─────────────────────────────────┐
│  Your Patterns                   │ ← Serif 18pt
│  Last 90 days                     │ ← Sans 7pt, Muted
│  ─────────────────────────────   │
│                                   │
│  Mood Trend                       │ ← Sans Bold 8pt
│  ╭─╮  ╭╮      ╭──╮               │ ← 极简折线图，
│  ╯ ╰──╯╰──────╯  ╰──             │   仅Gold单色线条，无网格背景
│                                   │
│  ─────────────────────────────   │
│                                   │
│  Recurring Patterns               │
│  ┃ Work deadlines → anxiety spike │ ← Gold竖线bullet(复用PDF组件)
│    First noticed: 3 weeks ago     │   Sans 7pt Muted 副标
│                                   │
│  ┃ Sunday evenings → low energy   │
│    Confidence: high               │
│                                   │
│  ─────────────────────────────   │
│                                   │
│  [ View 180-Day Story → ]         │ ← 付费墙CTA(Free用户模糊化此区域)
└─────────────────────────────────┘
```

---

# PART 2 — Onboarding 逐屏设计（决定次日留存的关键路径）

## 2.0 设计目标与心理学依据

| 屏幕 | 目的 | 借鉴产品 |
|------|------|---------|
| 品牌理念屏 | 建立"这不是算命App"的认知框架 | Headspace的价值观先行 |
| 数据采集屏 | 降低填写摩擦，允许不确定性 | Duolingo的渐进式提问 |
| 计算等待屏 | 用仪式感掩盖计算耗时，制造期待 | 所有占星App的"生成动画" |
| 首个洞察屏 | "啊哈"时刻，决定是否留存的关键 | Co-Star的犀利洞察风格 |
| 功能预览屏 | 让用户看到"每天打开"的理由 | Duolingo的连续学习承诺 |
| 软付费墙屏 | 无摩擦试用，不设信用卡门槛 | Headspace/Calm的试用策略 |

---

## 2.1 逐屏设计详图

<details>
<summary><b>Screen 1 — 品牌理念屏</b></summary>

```
背景: Deep Navy #0E1117
视觉: 3条极细金色对角线，缓慢移动动效(呼应PDF封面设计语言)

文案(逐行淡入动效，每行间隔800ms):
  "You were born with a pattern."
  "Not a fortune. A structure."
  "Meridian helps you see it — every day."

底部: [Continue →] 按钮，Ghost样式(透明背景+Gold描边)
```

**设计意图：** 第一屏就明确"pattern not fortune"的定位区隔，为后续所有体验设定认知框架，用户不会带着"来算命"的期待打开对话功能。
</details>

<details>
<summary><b>Screen 2 — 出生信息采集（分3个子步骤，非单一长表单）</b></summary>

```
Step 2a — 日期
  "When were you born?"
  [日期选择器 - 原生风格，非自定义轮盘，降低认知负担]

Step 2b — 时间(允许不确定)
  "What time, if you know it?"
  [时间选择器]
  下方文字链接: "I'm not sure" ← 点击后不确定，但仍引导:
    "That's okay. Try your best guess — 
     even 'morning' or 'evening' helps."
    [Morning / Afternoon / Evening / Night / Skip entirely]

Step 2c — 地点
  "Where were you born?"
  [城市搜索框，自动补全，用于真太阳时校正]
```

**关键UX决策：** 把长表单拆成3个各自轻量的步骤，每完成一步显示进度点(●●○)，符合Duolingo式"渐进式承诺"心理——单个大表单会在此环节造成显著流失。
</details>

<details>
<summary><b>Screen 3 — 计算等待屏（仪式感动效，6-8秒）</b></summary>

```
背景: Deep Navy
中央动效: 四个方块(代表四柱)依次从模糊到清晰浮现，
         每个方块显示一个汉字(甲/丙/庚/壬等)，逐一点亮
文案(动效同步变化):
  "Calculating your Four Pillars..."
  "Mapping your elemental balance..."
  "Locating your natal chart..."
  
最终: 四个方块组合成一个简洁的图形，过渡到下一屏
```

**设计意图：** 真实计算可能<1秒完成，但故意保留6-8秒的"仪式感等待"——这在所有成功的命理类产品中都被验证有效（用户对"瞬间生成"的结果信任度反而更低）。
</details>

<details>
<summary><b>Screen 4 — 首个洞察屏（全流程最关键的一屏）</b></summary>

```
背景: Ivory
布局:
  顶部: "Your Core Pattern" (Sans 7pt, tracking+120, Gold)
  中央大字: "Yin Metal"  (Serif 32pt, Ink)
  副标题: "The Gem Cutter" (Serif Italic 14pt, Muted)
  
  正文(此处必须极其精准犀利，是留存的关键钩子):
  "You process the world through precision. Generic answers 
  frustrate you — you're drawn to what's specific and correct. 
  This has probably created friction with people who move faster 
  than they think."
  
  下方: 五行占比条形图(复用PDF Elemental Composition组件)
  
  底部CTA: [This is oddly accurate → Continue]
```

**关键文案原则：**
1. 必须包含至少一句"具体到略显冒犯"的观察（"这可能给追求速度的人造成困扰"）——这种"精准感"是Co-Star式产品验证过的最强转化钩子
2. 绝不使用可以套用在任何人身上的泛化描述
3. CTA按钮文案本身就是心理暗示："This is oddly accurate"引导用户产生认同感再点击
</details>

<details>
<summary><b>Screen 5 — 功能预览屏（建立"每天打开"的心理预期）</b></summary>

```
横向滑动卡片(3张)，每张展示一个核心场景：

Card 1: [Today Hub截图] 
  "Every morning, a new reading of your energy."

Card 2: [Coach Feed截图]
  "The more you check in, the more it understands 
   your actual patterns — not generic advice."

Card 3: [180-day report截图，用示例数据]
  "In 6 months, look back and see exactly how far you've come."
```

**设计意图：** Card 3 是刻意植入的"未来钩子"——让用户在第一天就知道"180天报告"的存在，制造长期使用的期待感，这是Duolingo连续学习激励机制的直接借鉴。
</details>

<details>
<summary><b>Screen 6 — 软付费墙屏（试用启动，无信用卡摩擦）</b></summary>

```
背景: Ivory
标题: "Try everything free for 7 days"
副标题: "No credit card. Cancel anytime — or don't, if it's useful."

功能列表(极简勾选样式，非花哨图标):
  ✓ Unlimited Coach conversations
  ✓ Full pattern analysis  
  ✓ Weekly & monthly insight reports

底部主CTA: [Start My 7 Days →] (黑底白字，全宽)
次要链接: "Continue with limited free version" (小字，Muted，不隐藏但不突出)
```

**关键决策：次要选项必须存在且可见，不能刻意隐藏"跳过付费"的路径。** 欧美用户对"暗黑模式UX"(强制诱导付费)的负面评价极其敏感，会直接反映在App Store评分上，损害长期获客成本。
</details>

<details>
<summary><b>Screen 7 — 提醒时间设置（最后一屏，直接影响Day1留存）</b></summary>

```
标题: "When should Meridian check in with you?"
[时间选择器，默认预填合理时间如8:00 AM]
副标题: "You can change this anytime."

完成后: 直接进入Today Hub，无额外过渡屏
```
</details>

---

## 2.2 Onboarding 关键指标与埋点设计

```
每一屏都需要埋点追踪的核心指标：
├── Screen 2 (数据采集): 完成率、"时间不确定"选择占比
├── Screen 4 (首个洞察): 停留时长(反映内容是否被认真阅读)
├── Screen 6 (付费墙): 试用启动率 vs 跳过率
└── Onboarding 整体完成率: 从Screen1到进入Today Hub的漏斗转化率

北极星指标: Day 1 Retention (次日是否回访Today Hub)
次要指标: Trial Start Rate (试用启动率)
```

---

# PART 3 — Discover Engine 内容生产 Pipeline

## 3.0 战略定位重申

Discover 是**唯一对所有用户（包括未注册访客）完全免费开放**的模块，因为它承担两个战略职能：

1. **SEO/GEO 流量入口** — 被 Google 和 ChatGPT/Perplexity 等 AI 搜索引擎收录，带来零成本获客
2. **每日打开理由** — 即使用户当天没有情绪波动、没有决策需求，Discover 依然给一个"打开App"的理由

---

## 3.1 内容类型矩阵

<details>
<summary><b>点击展开6种内容类型的生产规格</b></summary>

```
类型1 — 今日日柱解读 (Daily Pillar Explainer)
  生产方式: 全自动，基于Calculation Engine输出的节气/日柱数据 + LLM润色
  更新频率: 每日
  SEO价值: 高(长尾关键词"today is a wood day meaning"等)
  示例标题: "Why Today Is a Wood Day — And What It Means"

类型2 — 节气专题 (Solar Term Deep Dive)
  生产方式: 半自动，节气数据触发 + 预写模板框架 + LLM填充细节
  更新频率: 24次/年(每个节气)
  SEO价值: 极高(节气类关键词搜索量大且竞争度低)
  示例标题: "What Is Lichun (立春)? The Chinese Solar Term Explained"

类型3 — 历史上的今天 (On This Day)
  生产方式: 全自动，基于历史事件数据库匹配公历日期
  更新频率: 每日
  SEO价值: 中(历史类内容长尾流量稳定)
  示例标题: "On This Day in History — July 14"

类型4 — 经典文献日读 (Classical Text Daily Reading)
  生产方式: 人工精选文本库(道德经/易经/庄子等公共领域文本) + LLM生成现代解读
  更新频率: 每日(库存充足可循环)
  SEO价值: 中高(经典文化内容有稳定搜索需求)
  示例标题: "Today's Reading from the Tao Te Ching — And What It Means for You"

类型5 — 术语科普 (Concept Explainer)
  生产方式: 人工编写框架 + LLM扩写，一次生产长期复用
  更新频率: 低频，建立内容库(如50篇覆盖所有核心术语)
  SEO价值: 极高(转化率最高的内容类型，直接对应"What is Bazi"类搜索)
  示例标题: "What Is Bazi? A Plain-Language Introduction"

类型6 — 个性化每日速览(仅登录用户)
  生产方式: 结合用户命盘的个性化版本，非公开可索引内容
  更新频率: 每日
  SEO价值: 无(不可公开索引，纯留存工具)
  示例: "Your Wood energy today pairs well with the collaborative themes in play."
```
</details>

---

## 3.2 内容生产技术流水线

```
┌────────────────────────────────────────────────────┐
│  Cron: 每日 UTC 00:00 触发内容生成批处理任务            │
└───────────────────┬────────────────────────────────┘
                     ▼
        ┌────────────────────────┐
        │  Fact Assembly Layer    │  ← 从Calculation Engine拉取
        │  (今日日柱/节气/历史匹配) │     今天确定性事实数据
        └───────────┬────────────┘
                     ▼
        ┌────────────────────────┐
        │  Template Selection     │  ← 根据日期类型判断
        │  (今天是否节气日/普通日)  │     选择对应内容模板
        └───────────┬────────────┘
                     ▼
        ┌────────────────────────┐
        │  LLM Content Generation │  ← 结构化事实 + Prompt模板
        │  (Discover专用Prompt)    │     → 生成可读文章正文
        └───────────┬────────────┘
                     ▼
        ┌────────────────────────┐
        │  SEO Metadata Generator │  ← 自动生成title/meta description/
        │                          │     Schema.org标记(Article/FAQPage)
        └───────────┬────────────┘
                     ▼
        ┌────────────────────────┐
        │  Fact-check Validator   │  ← 校验文中提及的日期/节气/干支
        │                          │     与Calculation Engine数据一致
        └───────────┬────────────┘
                     ▼
        ┌────────────────────────┐
        │  SSG Build & Deploy      │  ← 生成静态页面，永久URL
        │  (/discover/[slug])      │     供搜索引擎/AI爬虫抓取
        └────────────────────────┘
```

---

## 3.3 Discover专用Prompt设计示例

<details>
<summary><b>类型1 — 今日日柱解读 Prompt</b></summary>

```
SYSTEM PROMPT:
Write a short, engaging explainer article (300-400 words) about today's 
day pillar in Chinese metaphysics, for a general Western audience with 
zero prior knowledge.

RULES:
- Open with a hook question or statement, not "Today is..."
- Explain the concept in plain English, no unexplained jargon
- Include one practical, actionable takeaway
- End with a soft invitation to check personal chart (non-pushy)
- Tone: curious, intelligent, accessible — like a well-written science 
  blog, not a mystical fortune-telling site

INPUT: {date, day_stem, day_branch, element, ganzhi_name}

OUTPUT FORMAT: 
{
  "title": str,
  "meta_description": str (≤155 chars),
  "body_markdown": str,
  "faq": [{"question": str, "answer": str}]  // 用于FAQPage schema
}
```
</details>

<details>
<summary><b>类型5 — 术语科普 Prompt（转化率最高的内容类型）</b></summary>

```
SYSTEM PROMPT:
Write a comprehensive but accessible explainer (800-1200 words) about 
a core concept in Chinese metaphysics, optimized to be the best answer 
on the internet for someone Googling "What is [X]".

STRUCTURE:
1. One-sentence plain definition (featured-snippet optimized)
2. Historical/cultural context (2-3 paragraphs, non-mystical framing)
3. How it's actually used/calculated (demystify the mechanism)
4. Common misconceptions section
5. How Meridian approaches this concept differently
6. FAQ section (5 questions, structured for FAQPage schema)

TONE: Authoritative but never condescending. Written for an intelligent 
skeptic, not a believer.
```
</details>

---

## 3.4 SEO/GEO 技术实现要点

| 要点 | 实现方式 |
|------|---------|
| 必须SSR/SSG，非CSR | Next.js `generateStaticParams` 为每篇Discover文章预渲染静态HTML |
| Schema.org标记 | 术语科普类用 `FAQPage` + `Article`；每日速览类用 `Article` + `DefinedTerm` |
| 永久稳定URL | `/discover/wood-day-2026-07-14`（时间型内容）/ `/discover/what-is-bazi`（常青内容） |
| 内部链接网络 | 每篇文章自动插入3-5个相关术语的内链，构建主题集群(Topic Cluster)提升整体域权重 |
| Sitemap自动更新 | 每日新增内容自动写入 `sitemap.xml`，主动ping搜索引擎索引 |
| llms.txt / robots.txt | 显式允许AI爬虫(GPTBot, ClaudeBot, PerplexityBot等)抓取Discover内容，主动拥抱GEO趋势 |

---

## 3.5 内容库冷启动规划

```
上线前需要的内容库存(避免"上线当天空白"):
├── 类型5 术语科普: 预先生产 30-50篇 常青内容(覆盖八字/五行/紫微核心术语)
├── 类型2 节气专题: 预先生产全部 24节气 内容(一次性生产，每年循环复用+微调)
├── 类型4 经典文献: 预先精选并生产 100+条 道德经/易经/庄子摘录解读
└── 类型1/3/6: 无需预生产，上线即开始每日自动生成

内容审核机制: 
  自动生成内容进入"待审核"队列，MVP阶段人工review后发布(每日<20篇, 
  可控)，V2阶段随信任度建立逐步放开全自动发布
```

---

## 3.6 Discover 与其他模块的数据回路

```
Discover文章 → 文末CTA "See what this means for YOUR chart"
              → 未登录用户点击 → 引导注册(Discover是获客入口)
              → 已登录用户点击 → 跳转Blueprint对应板块(Discover是唤回入口)

这形成了完整闭环:
  SEO/GEO自然流量 → Discover内容消费 → 好奇心驱动注册 
  → Onboarding → Today Hub每日习惯 → 订阅转化
```

---

✅ 三个模块施工图全部完成：

1. **Today Hub & Coach Feed UI** — Energy Ring/Check-in Card/Coach Feed时间线组件规格，延续Meridian Design System的极简语言
2. **Onboarding 逐屏设计** — 7屏完整流程，含每屏的心理学设计意图和转化钩子
3. **Discover Engine Pipeline** — 6种内容类型、技术生产流水线、SEO/GEO技术实现、冷启动内容库规划

**整个 Meridian V2 的产品架构 + 技术架构 + 核心模块施工图，目前已经形成一套完整、可直接进入开发排期的设计文档体系。**

接下来如果需要，可以继续的方向：
- **数据分析与埋点体系**（North Star Metric 拆解、Retention Cohort 分析框架）
- **具体的开发排期与团队分工建议**（把所有模块拆成 Sprint）
- **Landing Page / App Store 素材设计**（获客侧的第一印象）

你希望往哪个方向继续，还是当前这套文档已经足够进入实际开发阶段？