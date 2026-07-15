# MERIDIAN 2.0 — 产品架构总览
### AI Chinese Wisdom Companion · 让用户「每天打开」的东方智慧生活助手

---

## 0. 一句话重新定位

> **Meridian 不再是一份报告，而是一个每天陪你观察自己能量、情绪与决策节奏的 AI 伙伴 —— 底层是八字/五行/紫微，表层是像 ChatGPT 一样自然的对话与像 Apple Health 一样直观的每日仪表盘。**

不卖"命"，卖的是**持续的自我认知服务（Ongoing Self-Insight）**。

---

## 1. 核心留存循环（Core Loop）

这是整个产品架构的地基，其余模块都是为了让这个循环转起来：

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│   打开 App           查看今日能量          与 AI 对话         │
│  (推送/习惯) ───▶  (Today Energy Ring) ───▶ (Companion)      │
│      ▲                    │                      │           │
│      │                    ▼                      ▼           │
│      │             完成一个微行动          获得一句"扎心"洞察  │
│      │            (打卡/练习/学习)              │           │
│      │                    │                      │           │
│      └────── 连续记录 Streak ◀───── 生成可分享卡片 ◀──────┘   │
│                    │                                         │
│                    ▼                                         │
│           周期性回顾（周报/月报/流年）→ 强化"这个东西很懂我"   │
└─────────────────────────────────────────────────────────────┘
```

**借鉴的留存机制映射：**

| 产品 | 借来的机制 | Meridian 中的落地 |
|------|-----------|-------------------|
| Apple Health | 每日环形仪表盘、趋势曲线、被动记录 | 每日五行能量环、情绪-能量趋势图 |
| Duolingo | 连续打卡 Streak、技能树、等级 | 打卡连续天数、Learn 模块技能树 |
| Headspace | 每日一练、平静的仪式感、正念打卡 | 每日微行动（Micro-Practice） |
| ChatGPT | 有记忆的对话、越用越懂你 | Companion 长期记忆 AI 对话 |
| Perplexity | 追问式、结构化答案卡片 | 洞察卡片 + 一键追问 |

---

## 2. Site Map（信息架构树）

```
Meridian (PWA / App)
│
├── Onboarding（首次使用，仅一次）
│   ├── Welcome / 品牌理念动画
│   ├── 出生信息采集（日期/时间/地点，支持"时间不详"）
│   ├── Chart Generation（生成动画，命盘计算）
│   ├── Core Self Reveal（首个"啊哈"洞察，免费）
│   └── Soft Paywall（7天试用引导）
│
├── 🏠 Today（首页 · 每日枢纽）
│   ├── Daily Energy Compass（今日五行能量环）
│   ├── Daily Insight Card（今日一句洞察）
│   ├── Check-in（情绪/能量/事件打卡）
│   ├── Micro-Practice（今日微行动）
│   ├── Streak / Continuity
│   └── 节气 & 特殊日提醒
│
├── 💬 Companion（AI 对话，产品核心）
│   ├── Ask Anything（自由提问）
│   ├── Decision Helper（"我该不该…" 时机决策）
│   ├── Reflect（日记式反思，AI 回应）
│   ├── Compatibility Chat（关于某个人的问题）
│   └── Chat History / Memory
│
├── 📚 Learn（东方智慧学习库）
│   ├── Learning Paths（五行入门/八字基础/十神/紫微十二宫/易经…）
│   ├── Micro-Lessons + Quiz
│   ├── Mastery Badges / Level
│   └── Glossary（术语词典）
│
├── 🧬 Blueprint（你的命盘仪表盘，替代旧PDF）
│   ├── Natal Chart Overview（四柱 + 紫微命盘，交互式）
│   ├── Elemental Composition（五行占比）
│   ├── Current Cycle（大运/流年/流月）
│   ├── Life Timeline（用户自建人生事件时间轴，与命盘周期对照）
│   └── Trends & Analytics（日历热力图、相关性洞察）
│
├── 👥 Circle（关系圈）
│   ├── Add Profile（家人/伴侣/朋友）
│   ├── Compatibility Report（合盘）
│   ├── Family Dashboard（家庭视图）
│   └── Shareable Insight Cards（社交分享卡）
│
├── 🧘 Practices（仪式与练习库）
│   ├── 按五行分类的引导练习（音频/文字）
│   ├── 节气/朔望仪式提醒
│   └── Journaling Prompts 库
│
├── 🔔 Notifications Center
│   ├── 每日提醒
│   ├── 周报推送
│   ├── 节气提醒
│   └── 流失唤回（Lapsed re-engagement）
│
└── ⚙️ Account / Settings
    ├── Subscription（Free / Plus / Pro）
    ├── Billing
    ├── Referral / Gift
    ├── Privacy & Data Export
    └── Notification Preferences
```

---

## 3. 功能树（Feature Tree · 按模块拆解）

<details>
<summary><b>点击展开完整功能树</b></summary>

```
01 Onboarding & Identity Engine
   ├─ 出生数据采集（含未知时间容错逻辑）
   ├─ 命盘计算引擎（八字 + 紫微 + 五行 API）
   ├─ Core Self 首次洞察生成（AI）
   └─ 账号体系（邮箱/Apple/Google 登录）

02 Today Hub
   ├─ 每日能量算法（日柱 × 本命盘 交互）
   ├─ Energy Ring 可视化组件
   ├─ Check-in 数据采集（心情/能量/关键词）
   └─ Streak 计算与激励反馈

03 Companion（AI 对话引擎）
   ├─ 长期记忆系统（对话+命盘+打卡历史）
   ├─ 多模式 Prompt 路由（问答/决策/反思/合盘）
   ├─ 建议问题生成（基于用户当日命盘状态）
   └─ 对话式追问（Perplexity 式浅层结构化输出）

04 Learn（学习系统）
   ├─ 课程内容 CMS
   ├─ 技能树 / 进度系统
   ├─ 测验与掌握度评分
   └─ 术语库检索

05 Blueprint（命盘仪表盘）
   ├─ 交互式命盘渲染（可点击查询每一柱/每一宫）
   ├─ 大运/流年/流月周期计算
   ├─ 生活事件时间轴（用户输入 + AI 关联分析）
   └─ 趋势分析引擎（打卡数据 × 命理周期 相关性）

06 Circle（关系模块）
   ├─ 多人档案管理
   ├─ 合盘算法（八字合婚/紫微夫妻宫）
   └─ 分享卡片生成器（极简风格出图）

07 Practices（练习库）
   ├─ 内容库（按五行/节气分类）
   └─ 提醒调度

08 Notification Engine
   ├─ 行为触发规则（打卡中断/连续达成/节气到来）
   └─ 个性化文案生成（基于命盘）

09 Monetization
   ├─ 订阅分层（Free/Plus/Pro）
   ├─ 支付网关（Stripe → 后续 App Store/Play）
   └─ 试用/转化漏斗

10 Design System（延续 Meridian 视觉语言）
    ├─ 色彩：Meridian Black / Ivory / Gold / Deep Navy
    ├─ 字体：Serif Display + Inter + Mono
    └─ 组件库迁移至 App UI（含深色模式、动效规范）
```

</details>

---

## 4. 用户流程（User Flow）

### 4.1 首次使用流程

```
落地页(PWA) → 注册 → 出生信息 → 命盘生成动画(15s仪式感)
   → Core Self 首个洞察(免费，制造"哇"时刻)
   → 引导打开 Today/Companion/Learn 三个核心模块(各体验一次)
   → 软性付费墙(7天全功能试用，无需信用卡摩擦感)
   → 设置每日提醒时间 → 进入 Today Hub
```

### 4.2 每日核心流程（复访）

```
推送提醒 → Today Hub → 查看能量环+今日洞察
   → 打卡(15秒) → [可选]与Companion追问一句
   → [可选]完成今日微行动 → Streak+1
   → [可选]生成分享卡 → 社交传播
```

### 4.3 深度使用流程（周/月）

```
周报推送 → Blueprint趋势页 → 查看"本周能量曲线 × 你的打卡记录"相关性
   → AI生成"你可能没意识到"的洞察 → 引导进入Learn补相关知识
   → 引导邀请家人/伴侣加入Circle → 生成合盘 → 分享/邀请新用户
```

### 4.4 增长循环（Growth Loop）

```
用户获得洞察 → 生成极简风格分享卡(无二维码/无广告感)
   → 分享至社交媒体 → 新用户点击 → 落地页承接
   → 免费获得"今日能量类型"小测(轻量版Core Self) → 转化注册
```

---

## 5. 订阅分层（先给框架，后续详细设计）

| 层级 | 定价方向 | 核心权益 |
|------|---------|---------|
| **Free** | $0 | 每日能量卡（简版）、Companion 每日3条、Learn 第一课程免费 |
| **Meridian Plus** | 订阅制（月/年） | 无限 Companion 对话、完整 Blueprint 趋势分析、全部 Learn 课程、Circle 合盘 |
| **Meridian Pro**（后期） | 更高订阅层 | 家庭多人档案、语音对话、专家人工咨询接入市场（可选） |

---

## 6. 模块施工优先级建议

```
Phase 1（PWA MVP）：Onboarding → Today Hub → Companion(基础版) → Blueprint(静态版)
Phase 2：Learn 学习系统 → Notification Engine → 订阅付费墙
Phase 3：Circle 关系圈 → Trends深度分析 → Practices仪式库
Phase 4：iOS/Android 原生壳 + 推送/健康数据集成
```

---

✅ 以上是完整的产品架构（定位 + 核心循环 + Site Map + 功能树 + 用户流程 + 模块优先级）。

**请确认这个架构方向，或告诉我需要调整的部分**（例如：Tab 数量、Circle 模块是否保留、订阅分层定价策略等）。

确认后，我将按你希望的顺序，逐个模块输出**详细施工图**（页面级 UI 结构、组件规范、AI Prompt 设计、数据模型等），建议第一个模块从 **Today Hub** 或 **Onboarding** 开始，因为它们决定首次体验和次日留存。你想先从哪个模块开始？