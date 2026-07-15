# MERIDIAN V2 — Technical Architecture
### 技术架构设计文档 · AI Coach + Memory-Driven Companion

---

## 0. 架构核心哲学

在写任何代码之前，先定一条最重要的架构原则：

> **命理计算是"确定性系统"，AI 生成是"概率性系统"，两者必须物理隔离。**

这决定了整个技术架构分三层，且永不混淆：

```
┌─────────────────────────────────────────────────────────┐
│  Layer 3 · GENERATION（生成层）                           │
│  LLM 负责"怎么说"——语气、共情、建议表达方式                  │
├─────────────────────────────────────────────────────────┤
│  Layer 2 · MEMORY（记忆层）                                │
│  负责"记住什么"——用户画像、历史模式、长期趋势                │
├─────────────────────────────────────────────────────────┤
│  Layer 1 · CALCULATION（计算层）                           │
│  确定性算法负责"事实是什么"——八字/紫微/五行/节气             │
│  相同输入 = 相同输出，永远不让 LLM 参与计算                   │
└─────────────────────────────────────────────────────────┘
```

**为什么这条线不能破：**
- 如果让 LLM "计算"八字，会产生幻觉（错误的十神、错误的大运），一旦被懂命理的用户发现，品牌信任瞬间崩塌
- Calculation Engine 必须是纯规则引擎（农历转换表、真太阳时、节气表、干支排盘算法），LLM 永远只消费计算结果，不生成计算结果

---

## 1. 系统架构图（System Architecture）

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                              │
│   PWA (Next.js) ── iOS Wrapper (Capacitor) ── Android Wrapper     │
│   Web Push / APNs / FCM        Home Screen Widget (later)         │
└───────────────────────────┬────────────────────────────────────────┘
                            │ HTTPS / WebSocket
┌───────────────────────────▼────────────────────────────────────────┐
│                       API GATEWAY (BFF)                           │
│         Auth middleware · Rate limit · Request routing            │
└───┬─────────┬──────────┬───────────┬───────────┬──────────┬───────┘
    │         │          │           │           │          │
┌───▼───┐ ┌───▼────┐ ┌───▼─────┐ ┌───▼──────┐ ┌──▼──────┐ ┌─▼─────────┐
│ Auth  │ │ Chart  │ │  Coach   │ │ Memory   │ │ Content │ │ Billing   │
│Service│ │ Engine │ │  Agent   │ │ Service  │ │(Discover│ │ Service   │
│       │ │(Calc)  │ │(Orchestr)│ │          │ │ Engine) │ │           │
└───┬───┘ └───┬────┘ └───┬──────┘ └───┬──────┘ └──┬──────┘ └───┬───────┘
    │         │          │            │           │            │
    │         │      ┌───▼──────┐     │           │            │
    │         │      │  LLM     │     │           │            │
    │         │      │ Gateway  │     │           │            │
    │         │      │(Claude/  │     │           │            │
    │         │      │ GPT API) │     │           │            │
    │         │      └──────────┘     │           │            │
    │         │                        │           │            │
┌───▼─────────▼────────────────────────▼───────────▼────────────▼───┐
│                          DATA LAYER                                │
│  PostgreSQL (核心数据)  │ pgvector (记忆向量)  │ Redis (缓存/队列)   │
│  Object Storage (S3, 生成的分享卡图片)                              │
└─────────────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┴──────────────┐
              │      SCHEDULER / EVENTS     │
              │  Cron Jobs · Event Bus       │
              │  (触发 Coach 主动消息的核心)   │
              └───────────────────────────────┘
```

---

## 2. Calculation Engine（计算层详细设计）

**独立微服务，不接触任何 LLM，纯算法。**

```
Calculation Engine
├── Lunar Converter          （公历↔农历，真太阳时校正）
├── Bazi Generator           （四柱排盘：年柱/月柱/日柱/时柱）
├── Five Elements Analyzer   （五行占比、旺衰、用神/忌神）
├── ZiWei Chart Generator    （紫微十二宫排盘）
├── Da Yun / Liu Nian Engine （大运、流年、流月周期计算）
├── Solar Term Calendar      （24节气精确时间表，UTC换算）
└── Daily Energy Calculator  （今日日柱 × 本命盘 → 能量分数算法）
```

**关键设计决策：**

| 决策 | 原因 |
|------|------|
| 独立部署为微服务（非 Serverless Function） | 排盘计算涉及大量查表和历法运算，需要常驻内存缓存农历数据表 |
| 输出格式标准化为 `ChartObject` (JSON Schema) | 所有下游服务（Coach、Memory、Blueprint UI）消费同一份结构化数据 |
| 结果永久缓存 | 本命盘一次计算，终身不变；每日能量分数每天计算一次后缓存 |
| 语言选型：Python | 历法计算库生态成熟（如 lunardate、cnlunar 类库可自建） |

**`ChartObject` 核心结构示例：**

```json
{
  "user_id": "usr_xxx",
  "natal": {
    "pillars": {
      "year": {"stem": "甲", "branch": "子"},
      "month": {"stem": "丙", "branch": "寅"},
      "day": {"stem": "庚", "branch": "午"},
      "hour": {"stem": "壬", "branch": "申"}
    },
    "day_master": "庚",
    "element_distribution": {"wood":18,"fire":12,"earth":10,"metal":38,"water":22},
    "useful_god": "水",
    "ziwei": { "life_palace": "天相", "body_palace": "...", "twelve_palaces": {...} }
  },
  "current_cycle": {
    "da_yun": {"range": "2022-2032", "stem_branch": "..."},
    "liu_nian_2026": {"stem_branch": "...", "clash": false}
  },
  "computed_at": "2026-07-14T00:00:00Z",
  "engine_version": "calc-v1.3"
}
```

> `engine_version` 字段至关重要——未来算法迭代时，用于判断哪些用户的图谱需要重算。

---

## 3. AI Coach Agent 架构（核心创新，重点设计）

这是本次架构升级中最关键的部分：**从"被动 Chat"变成"主动 Coach"。**

### 3.1 Coach 与普通 Chatbot 的架构差异

```
普通 Chatbot：           User Message → LLM → Response
                         （单向、被动、无状态触发）

Meridian Coach：         Event/Time Trigger → Rule Engine 
                         → Context Assembly → LLM → Proactive Message
                         （事件驱动、主动、有状态触发）
```

### 3.2 Coach Agent 内部结构

```
┌────────────────────────────────────────────────────┐
│                  COACH AGENT                        │
│                                                      │
│  ┌────────────┐   ┌─────────────┐   ┌────────────┐ │
│  │  Trigger    │──▶│   Context    │──▶│   Prompt   │ │
│  │  Engine     │   │  Assembler   │   │   Router   │ │
│  └────────────┘   └─────────────┘   └──────┬─────┘ │
│                                              │       │
│                                       ┌──────▼─────┐ │
│                                       │ LLM Gateway│ │
│                                       └──────┬─────┘ │
│                                              │       │
│                                       ┌──────▼─────┐ │
│                                       │  Output    │ │
│                                       │  Validator │ │
│                                       └────────────┘ │
└────────────────────────────────────────────────────┘
```

### 3.3 Trigger Engine（触发引擎）— Coach 主动性的来源

触发分两类：**时间型触发** 和 **事件型触发**

| 类型 | 触发条件示例 | 频率控制 |
|------|-------------|---------|
| 时间型 | 每日固定时段（早晨能量播报、傍晚复盘提醒） | 每用户每天固定次数上限 |
| 事件型 | 连续3天记录"焦虑" | 同一模式7天内只触发一次 |
| 事件型 | 用户命盘当日"日柱冲本命" | 命理规则表驱动，非LLM判断 |
| 事件型 | Streak 中断 | 24小时内触发一次挽留消息 |
| 事件型 | 节气到来/流年切换 | 全局广播型，一年固定几次 |

```python
# Trigger Engine 伪代码结构
class TriggerRule:
    id: str
    condition: Callable[[UserContext], bool]
    cooldown_hours: int
    priority: int
    prompt_template_id: str

# 每小时跑一次 Cron，扫描活跃用户
def run_trigger_scan():
    for user in get_active_users():
        context = build_user_context(user)
        candidates = [r for r in ALL_RULES if r.condition(context)]
        if candidates:
            best = max(candidates, key=lambda r: r.priority)
            if not in_cooldown(user, best):
                enqueue_coach_message(user, best)
```

**关键点：触发的"判断条件"是规则引擎（if/else + 命理规则表），不是 LLM。LLM 只负责把已经判断好的事实，转化成有温度的语言。** 这保证了主动消息不会出现事实性幻觉。

### 3.4 Context Assembler（上下文组装器）

每次生成 Coach 消息前，组装以下上下文包，注入 Prompt：

```
Context Package
├── Static Profile      （命盘核心事实，来自 Calculation Engine，永不变）
├── Recent Memory        （近7-30天的 check-in 摘要，来自 Memory Service）
├── Long-term Memory     （用户画像摘要，AI生成的"关于这个人"的滚动总结）
├── Current Trigger Fact （本次触发的具体事实，如"连续3天焦虑"）
└── Conversation Style   （用户偏好的语气：简洁/温暖/直接）
```

### 3.5 Output Validator（防幻觉护栏）

LLM 输出前做规则校验：
- 禁止出现具体运算结果（如"你今天能量是87分"这类数字必须来自 Calculation Engine 直接注入，LLM 不能自己编数字）
- 禁止绝对化预测用语（"一定会""必然"）— 关键词黑名单过滤
- 输出长度限制（Coach 消息 ≤ 80 字，保持 push 通知的简洁感）

---

## 4. AI Memory 设计（护城河核心）

这是用户提到的"最赚钱的部分"，需要最严谨的设计。Memory 分三层，模仿人类记忆结构：

```
┌─────────────────────────────────────────────────────┐
│  L1 · Working Memory（工作记忆）                       │
│  当前对话 session 的上下文，存 Redis，TTL=会话结束        │
├─────────────────────────────────────────────────────┤
│  L2 · Episodic Memory（情景记忆）                      │
│  每一次 check-in / 对话 / 事件，向量化存储，可语义检索      │
├─────────────────────────────────────────────────────┤
│  L3 · Semantic Memory（语义记忆 / 用户画像）             │
│  滚动总结出的"关于这个人"的结构化事实，定期由 LLM 提炼更新   │
└─────────────────────────────────────────────────────┘
```

### 4.1 数据流：记忆如何形成

```
用户 check-in / 对话
        │
        ▼
[实时写入] Episodic Memory (raw event + embedding)
        │
        ▼ (异步任务，每日跑一次)
[Memory Extraction Job]
   LLM 读取近7天 episodic memory
   → 提炼出结构化事实变更
   → 更新 L3 User Profile
        │
        ▼
[User Profile] 例：
{
  "recurring_patterns": ["周一情绪偏低", "工作压力多集中在项目截止前"],
  "growth_trajectory": "过去90天焦虑频率下降35%",
  "preferences": {"tone": "direct", "avoid_topics": ["婚姻"]},
  "last_updated": "2026-07-14"
}
```

### 4.2 检索策略（Retrieval）— 每次对话如何"记起"

```
用户提问 → Query Embedding
              │
    ┌─────────┴──────────┐
    ▼                    ▼
语义检索 Top-K          结构化 Profile
(pgvector 相似度搜索      (直接读取，
 近90天相关记忆片段)       非检索，永远注入)
    │                    │
    └─────────┬──────────┘
              ▼
        组装最终 Prompt Context
```

**关键设计：结构化 Profile 永远全量注入（因为它小，是"总结"），Episodic Memory 用语义检索只取最相关的 3-5 条（因为原始记录量会无限增长，不能全塞进 context）。**

### 4.3 长周期记忆产品化（180天效应）

这是用户强调的"AI Memory 商业价值"落地点，需要一个专门的服务：

```
Longitudinal Insight Service（长周期洞察服务）
├── 每满 30/90/180/365 天自动生成一次"成长报告"
├── 对比"去年同期 vs 今年同期"的 check-in 数据 + 对话情绪基调
├── 生成内容：Blueprint 模块的"Trends & Analytics"页面数据源
└── 这是订阅续费最强钩子——用得越久，报告越无法被替代
```

---

## 5. Prompt 路由设计（Prompt Router）

不同意图路由到不同的 System Prompt + 工具集，而不是一个巨型万能 Prompt。

| 路由 | 触发场景 | 系统 Prompt 侧重 | 可用工具 |
|------|---------|------------------|---------|
| `daily_briefing` | 每日 Coach 早报 | 简洁、播报式 | Chart数据、Memory摘要 |
| `proactive_checkin` | 事件触发主动消息 | 共情、非说教 | Trigger事实、近期Memory |
| `ask_anything` | 用户自由提问 | 平衡智识与温度 | 全量Chart+Memory+RAG检索 |
| `decision_helper` | "我该不该..." | 结构化分析框架 | 用神分析、流年数据 |
| `reflect_journal` | 日记式反思 | 倾听、少建议 | 近期情绪历史 |
| `discover_content` | Discover模块内容生成 | 教育性、可传播 | 节气表、经典文献库 |

```python
def route_prompt(user_input, context):
    intent = classify_intent(user_input)  # 轻量分类器，非LLM也可用小模型
    template = PROMPT_TEMPLATES[intent]
    tools = TOOL_MAP[intent]
    return build_prompt(template, context, tools)
```

---

## 6. Discover Engine（内容/SEO/GEO 引擎）

<details>
<summary><b>点击展开 Discover 模块技术设计</b></summary>

```
Content Generation Pipeline（每日批处理任务）
├── Solar Term Calendar → 自动生成节气相关内容
├── Historical Almanac DB → "历史上的今天"内容
├── Classical Text Corpus（道德经/易经/庄子）→ 每日一句 + AI 解读
├── Daily Element Theme（今日五行是什么）→ 结构化科普内容
└── 全部内容生成后：
    ├── 存入 CMS（结构化，非纯文本，便于SEO Schema标记）
    ├── 自动生成 Open Graph / Schema.org 标记（FAQ, Article）
    └── 生成静态可索引页面（SSR/SSG，供 Google/ChatGPT 抓取）
```

**技术要点：**
- Discover 内容页面必须是**服务端渲染（SSR/SSG）**，不能是纯客户端渲染的 SPA 内容，否则搜索引擎和 LLM 爬虫抓不到
- 每篇内容生成一个稳定的永久链接（`/discover/wood-day-2026-07-14`），用于长尾 SEO 积累
- 内容生成用 LLM，但基于**结构化事实模板**（哪一天是什么节气、哪一天日柱是什么），避免事实性错误被搜索引擎收录放大

</details>

---

## 7. 数据库设计

<details>
<summary><b>点击展开完整 ER 结构与表设计</b></summary>

### 核心实体关系

```
users ──1:1── birth_profiles ──1:1── natal_charts
  │
  ├──1:N── checkins
  ├──1:N── conversations ──1:N── messages
  ├──1:N── memory_facts（L3语义记忆）
  ├──1:N── memory_embeddings（L2情景记忆，pgvector）
  ├──1:N── coach_events（触发历史记录）
  ├──1:1── subscriptions
  └──1:N── notifications
```

### 关键表结构

**`users`**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | PK |
| email | text | 唯一 |
| auth_provider | text | email/apple/google |
| timezone | text | 用于每日触发时间计算 |
| created_at | timestamp | |

**`birth_profiles`**
| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | uuid | FK |
| birth_date | date | |
| birth_time | time, nullable | 支持未知 |
| birth_time_confidence | enum | exact/approximate/unknown |
| birth_location | geography | 经纬度，用于真太阳时校正 |

**`natal_charts`**（Calculation Engine 输出缓存）
| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | uuid | FK |
| chart_json | jsonb | 完整 ChartObject |
| engine_version | text | 用于失效判断 |
| computed_at | timestamp | |

**`checkins`**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK |
| mood_score | int | |
| energy_score | int | |
| tags | text[] | 如 ["焦虑","工作"] |
| note | text, nullable | |
| created_at | timestamp | |

**`memory_embeddings`**（L2 情景记忆）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK |
| source_type | enum | checkin/conversation/journal |
| source_id | uuid | 关联原始记录 |
| content_summary | text | 摘要文本 |
| embedding | vector(1536) | pgvector |
| created_at | timestamp | |

**`memory_facts`**（L3 语义记忆/用户画像，单行滚动更新）
| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | uuid | PK |
| profile_json | jsonb | 结构化画像（见4.1示例） |
| last_extracted_at | timestamp | |

**`coach_events`**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK |
| rule_id | text | 触发的规则ID |
| triggered_at | timestamp | |
| message_sent | text | |
| user_reaction | enum, nullable | opened/dismissed/replied |

**`subscriptions`**
| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | uuid | FK |
| plan | enum | free/plus/pro |
| status | enum | active/trialing/canceled |
| provider | enum | stripe/apple_iap/google_play |
| renews_at | timestamp | |

</details>

---

## 8. API 设计（核心端点概览）

<details>
<summary><b>点击展开 API 端点列表</b></summary>

```
Auth
  POST   /auth/signup
  POST   /auth/login
  POST   /auth/refresh

Onboarding
  POST   /profile/birth-info
  GET    /chart/generate           → 触发 Calculation Engine
  GET    /chart/core-insight       → 首个免费洞察

Today
  GET    /today/energy             → 今日能量分数（缓存优先）
  POST   /checkins
  GET    /streak

Coach
  GET    /coach/feed               → 主动消息流（含历史）
  POST   /coach/chat                → 用户主动提问
  POST   /coach/feedback           → 用户对Coach消息的反应（用于优化触发规则）

Blueprint
  GET    /blueprint/natal
  GET    /blueprint/cycles         → 大运/流年
  GET    /blueprint/trends         → 长周期分析（Memory驱动）

Learn
  GET    /learn/paths
  GET    /learn/lessons/:id
  POST   /learn/progress

Discover
  GET    /discover/today           → 今日内容流
  GET    /discover/:slug           → 单篇内容（SSR）

Billing
  POST   /billing/checkout
  POST   /billing/webhook          → Stripe/Apple/Google 回调
  GET    /billing/status

Memory (内部服务，不对客户端暴露)
  INTERNAL /memory/extract         → 定时任务调用
  INTERNAL /memory/retrieve
```

</details>

---

## 9. 模块依赖关系图

```
                    ┌─────────────┐
                    │   Auth      │ (所有模块依赖)
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
      ┌───────────┐ ┌───────────┐ ┌───────────┐
      │Calculation│ │  Memory   │ │  Billing  │
      │  Engine   │ │  Service  │ │  Service  │
      └─────┬─────┘ └─────┬─────┘ └───────────┘
            │             │
            ├─────────────┤
            ▼             ▼
      ┌─────────────────────────┐
      │      Coach Agent         │ ◀── 依赖 Calc + Memory + LLM Gateway
      └─────────────┬───────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌──────────┐
   │  Today  │  │Blueprint│  │  Learn   │ （UI消费层，无状态）
   └─────────┘  └─────────┘  └──────────┘

   Discover Engine ── 独立依赖 Calc(节气数据) + LLM Gateway，与其他模块解耦
```

**依赖关系的核心结论：Calculation Engine 和 Memory Service 是全系统地基，必须最先构建且保持稳定，其余模块都是消费层，可以并行开发。**

---

## 10. 技术栈推荐

| 层 | 技术选型 | 理由 |
|---|---------|------|
| 前端 | Next.js (PWA) + Tailwind | SSR支持Discover的SEO需求，PWA能力原生 |
| 未来原生壳 | Capacitor | 最快从PWA过渡到iOS/Android上架，复用现有代码 |
| 后端主服务 | Node.js + TypeScript (NestJS) | 与前端类型共享，生态成熟 |
| 计算引擎 | Python (独立微服务) | 历法/命理算法生态更成熟 |
| 数据库 | PostgreSQL + pgvector | 一套数据库同时支撑结构化数据和向量检索，降低初期架构复杂度 |
| 缓存/队列 | Redis + BullMQ | 触发引擎的定时任务和异步Memory提炼任务 |
| LLM | Claude API（主）+ 可切换GPT | Prompt Router层做抽象，不锁定单一供应商 |
| 支付 | Stripe（先）→ Apple IAP / Google Play（后） | Web先行，原生上架后补 |
| 部署 | Vercel(前端) + Railway/Render(后端) → 后期迁移至云厂商 | MVP阶段优先速度而非可扩展性 |

---

## 11. MVP 与后续版本拆分（技术视角）

```
┌─ MVP (Phase 1) ────────────────────────────────────────┐
│ Calculation Engine（八字+五行+紫微基础）                  │
│ Memory Service（仅 L1+L2，L3画像先用简单规则代替LLM提炼）  │
│ Coach Agent（仅时间型触发，事件型触发规则先做3-5条）        │
│ Today / Blueprint（静态展示为主）                         │
│ Billing（Stripe订阅，单一价格层）                          │
└──────────────────────────────────────────────────────────┘

┌─ V2 ───────────────────────────────────────────────────┐
│ Memory L3 完整语义画像 + 180天长周期报告                   │
│ Coach 事件型触发规则扩展至20+条                            │
│ Discover Engine 上线（SEO内容引擎）                        │
│ Learn 完整课程体系                                        │
│ 原生 iOS/Android 上架（Capacitor壳）                      │
└──────────────────────────────────────────────────────────┘

┌─ V3 ───────────────────────────────────────────────────┐
│ Apple Watch / Widget                                    │
│ Circle 关系圈（合盘、多人档案）                            │
│ Practices 仪式库                                          │
│ 多LLM供应商智能路由（成本优化）                             │
└──────────────────────────────────────────────────────────┘
```

---

## 12. 一个关键的架构风险提示

> **Coach 的"主动性"如果做不好触发频率控制，会变成骚扰型推送，导致卸载率上升而非留存率上升。**

建议在 MVP 阶段就把 `coach_events` 表的 `user_reaction` 字段用起来——记录用户对每条主动消息的反应（打开/忽略/回复），作为未来触发规则权重调整的训练数据。这是**Coach 越用越准的第二条护城河**，比单纯的 Memory 更容易被低估。

---

✅ 技术架构框架已完成（系统架构、三层引擎、Coach Agent、Memory设计、数据库、API、依赖关系、技术栈、版本拆分）。

**下一步建议**：从 **Calculation Engine 的详细算法设计**（八字排盘的具体规则表、真太阳时校正逻辑）开始施工，还是先做 **Coach Agent 的具体触发规则表**（把"连续3天焦虑"这类规则穷举出前20条)？这两者是 MVP 最先需要落地的硬核逻辑。