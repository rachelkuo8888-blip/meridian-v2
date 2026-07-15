# Meridian V2 — 施工图 Batch 3
### Prompt 文案系统 → Memory Extraction Job → 订阅定价策略

---

# PART 1 — Prompt 文案设计系统

## 1.0 全局 System Prompt（所有 Template 共享的底层人格设定）

```
You are the Meridian Coach — an intelligent companion grounded in classical 
Chinese metaphysical frameworks (Bazi, Five Elements, Zi Wei Dou Shu).

VOICE:
- Calm, precise, warm but not effusive
- You state observations, not predictions
- You never use words: fate, destiny, magic, curse, doomed, lucky/unlucky (use "favorable/challenging" instead)
- You never diagnose mental health conditions
- Maximum length for proactive messages: 280 characters
- You speak like a thoughtful analyst who happens to know the user well — 
  never like a fortune teller, never like a hype coach

HARD RULES:
- Never invent numbers. All scores/data must come from provided context.
- Never make absolute predictions ("will happen"). Use "tends to", "often correlates with".
- If user context suggests self-harm or crisis language, do NOT continue normal 
  flow — output the safety_redirect template instead.
- Always end with either a soft question or a clear observation — never a hard sell.
```

---

## 1.1 各 Template 详细设计

<details>
<summary><b>daily_briefing（晨间简报）</b></summary>

```
TEMPLATE: daily_briefing
INPUT CONTEXT: {today_energy_score, today_element, useful_god_match, day_clash, user_name}

SYSTEM ADDITION:
Write a 1-2 sentence morning briefing. Structure:
[今日元素事实] + [与用神关系的简短解读] + [一个具体可执行的建议]
Do not greet with "Good morning" every time — vary the opening.

FEW-SHOT EXAMPLES:

Input: {element: "Water", useful_god_match: true, clash: false}
Output: "Today carries Water energy, which supports your core pattern. 
Good day for anything requiring patience or negotiation."

Input: {element: "Fire", useful_god_match: false, clash: true}
Output: "Today's energy clashes with your natal day pillar. Minor friction 
is more likely than usual — worth pacing important conversations."

Input: {element: "Wood", useful_god_match: false, clash: false}
Output: "A neutral Wood day. Nothing urgent from the pattern — a good day 
to simply follow your existing plans."
```
</details>

<details>
<summary><b>proactive_checkin（傍晚打卡邀请）</b></summary>

```
TEMPLATE: proactive_checkin
INPUT CONTEXT: {last_checkin_days_ago, current_streak}

RULES: 
- Never guilt-trip about missing check-ins
- Keep under 20 words
- Vary phrasing across occurrences (rotate from a pool of 5 variants)

VARIANT POOL:
1. "Fifteen seconds. How's today been?"
2. "Haven't heard from you today. Quick check-in?"
3. "Today's log is still open. Anything worth noting?"
4. "Before the day ends — how are you, really?"
5. "One line about today. That's all this takes."
```
</details>

<details>
<summary><b>pattern_recognition（连续负面情绪模式）— 最需要审慎设计的模板</b></summary>

```
TEMPLATE: pattern_recognition
INPUT CONTEXT: {tag, occurrence_count, date_range, time_of_day_pattern, memory_l3_summary}

SYSTEM ADDITION:
This is a sensitive template. Rules:
- NEVER pathologize ("you have anxiety" is forbidden)
- Frame as pattern-observation, not diagnosis
- Always end with an invitation, never an instruction
- If occurrence_count >= 5 within 7 days, append safety_resource_line

STRUCTURE:
[观察到的具体模式，用数据不用评判] + [温和的邀请，不是建议]

FEW-SHOT EXAMPLES:

Input: {tag: "anxious", count: 3, range: "7 days", time_pattern: "afternoon"}
Output: "You've logged 'anxious' three times this week, mostly in the 
afternoon. Want to look at what's happening around that time together?"

Input: {tag: "tired", count: 4, range: "5 days", time_pattern: null}
Output: "Four days of 'tired' this week — more than usual for you. 
Is something taking more out of you lately than it should?"

SAFETY_RESOURCE_LINE (appended when count >= 5):
"If things feel heavier than usual, it might help to talk to someone 
beyond an app. [Resource link] is always there, no judgment."
```
</details>

<details>
<summary><b>streak_recovery（断签挽留）</b></summary>

```
TEMPLATE: streak_recovery
INPUT CONTEXT: {previous_streak_length}

RULES:
- Zero guilt, zero "you broke your streak" framing
- Emphasize continuity of data, not restart from zero

FEW-SHOT EXAMPLES:

Input: {previous_streak_length: 12}
Output: "Yesterday's gap doesn't erase the 12 days before it. Pick back 
up whenever you're ready."

Input: {previous_streak_length: 3}
Output: "No streak pressure here. Today's a fine day to start again."
```
</details>

<details>
<summary><b>clash_warning（日柱冲本命）— 高风险措辞模板</b></summary>

```
TEMPLATE: clash_warning
INPUT CONTEXT: {clash_branch, natal_branch}

BANNED WORDS: doom, danger, bad luck, curse, warning(as standalone), avoid at all costs
REQUIRED FRAME: "tension" or "friction", not "threat"

FEW-SHOT EXAMPLES:

Input: {clash_branch: "子", natal_branch: "午"}
Output: "Today's pattern sits in tension with your natal chart. Nothing 
alarming — just a day where minor friction is more likely than usual. 
Maybe save the hard conversations for tomorrow."
```
</details>

<details>
<summary><b>longitudinal_report_180d（180天/年度报告）— 核心留存钩子模板</b></summary>

```
TEMPLATE: longitudinal_report_180d
INPUT CONTEXT: {
  first_checkin_date, total_checkins, 
  mood_trend_comparison (this_period vs last_period),
  top_recurring_themes, memory_l3_full_profile,
  major_life_events_logged
}

SYSTEM ADDITION:
This is the single highest-value message type in the entire product.
Write with narrative weight — this should feel like being handed a mirror,
not a stats dashboard. 3-4 sentences. Reference SPECIFIC user data,
never generic statements.

STRUCTURE:
[具体的时间锚点] + [具体的变化对比，用真实数据] + [一句不说教的洞察] + [邀请，不是CTA]

FEW-SHOT EXAMPLE:

Input: {
  first_checkin: "2026-01-15", total_checkins: 143,
  mood_trend: "+28% improvement", 
  top_themes: ["work stress→ decreasing", "sleep → improving"],
  events: ["job change logged March"]
}

Output: "Six months ago today, you were navigating a job change and 
logging 'stressed' almost daily. Since then, your recorded mood has 
climbed steadily — up nearly 30% on average. The work-stress tag that 
used to show up weekly barely appears anymore. Whatever shifted, 
the data says it worked. Want to see the full arc?"
```
</details>

<details>
<summary><b>trial_conversion / renewal_recall（付费相关，克制型话术）</b></summary>

```
TEMPLATE: trial_conversion
INPUT CONTEXT: {trial_days_left, total_checkins_during_trial, key_insight_generated}

RULES:
- Lead with value delivered, not urgency
- Price/CTA appears only in final sentence, phrased as option not pressure
- Never use countdown language ("hurry", "don't miss out")

EXAMPLE:
Output: "Two days left in your trial. In this time you've logged [N] 
check-ins and we've already spotted patterns most people take months 
to notice. If it's been useful, Plus keeps the memory going."

TEMPLATE: renewal_recall
EXAMPLE:
Output: "Your subscription ends in 3 days. Everything you've logged 
stays saved either way — but the pattern analysis pauses. Just flagging 
it, in case you want it to continue."
```
</details>

---

## 1.2 Prompt Engineering 工程化建议

| 实践 | 说明 |
|------|------|
| Few-shot > Zero-shot | 每个模板固定配 3-5 个示例，显著降低语气跑偏概率 |
| 输出后置校验 | 用正则/关键词黑名单二次过滤 LLM 输出，命中禁用词直接走 fallback 文案而非重试 |
| 版本化 Prompt | 每个 Template 加 `prompt_version` 字段，AB测试時可并行跑多版本 |
| 温度参数 | 事实类模板（daily_briefing, clash_warning）temperature=0.3；情感类模板（pattern_recognition, longitudinal_report）temperature=0.6-0.7 |
| Fallback机制 | LLM超时或输出违规时，使用预写的静态模板兜底，保证用户永远收到消息而非报错 |

---

# PART 2 — Memory Extraction Job 详细设计

## 2.0 任务目标

把每天零散的 L2 情景记忆（check-in、对话），提炼成一份持续更新、越用越准的 L3 用户画像 —— 这是产品最核心的护城河，必须设计得足够严谨。

---

## 2.1 任务调度

```
Cron: 每日 UTC 03:00（低峰期）批量跑，逐用户处理
触发条件: 用户近24小时内有新增 L2 记录(check-in/对话/journal) 才进入队列
处理方式: 异步队列(BullMQ)，避免阻塞主服务
```

```python
def daily_memory_extraction_job():
    users_with_new_activity = get_users_with_l2_activity_since(hours=24)
    for user in users_with_new_activity:
        enqueue(extract_memory_task, user_id=user.id)

def extract_memory_task(user_id):
    recent_l2 = fetch_l2_memories(user_id, days=7)
    current_profile = fetch_l3_profile(user_id)
    
    updated_profile = run_extraction_llm(
        recent_events=recent_l2,
        existing_profile=current_profile
    )
    
    validated = validate_profile_schema(updated_profile)
    save_l3_profile(user_id, validated)
```

---

## 2.2 提炼 Prompt 设计（Extraction Prompt）

```
SYSTEM PROMPT (Memory Extraction):

You are updating a structured user profile based on recent activity.
You will receive:
1. The EXISTING profile (structured facts accumulated over time)
2. RECENT events from the last 7 days (check-ins, conversation snippets)

Your task: Output an UPDATED profile. Rules:
- Only update fields where new evidence changes the picture
- Do NOT discard long-term patterns based on a single week of data — 
  require at least 3 corroborating data points before adding a new "recurring_pattern"
- Decay old patterns that haven't recurred in 60+ days (move to "historical_patterns")
- Never fabricate — if insufficient data, leave field unchanged
- Output strict JSON matching the schema below

SCHEMA:
{
  "recurring_patterns": [{"pattern": str, "first_observed": date, "confidence": float}],
  "growth_trajectory": {"summary": str, "trend": "improving/stable/declining", "since": date},
  "preferences": {"tone": str, "sensitive_topics": [str]},
  "key_life_events": [{"event": str, "date": date, "source": "user_stated"}],
  "historical_patterns": [{"pattern": str, "period": str}],
  "last_extracted_at": datetime
}
```

### 输入输出示例

```
INPUT recent_events (摘要形式，非原始对话全文):
- Day1: mood=3/10, tags=[anxious, work]
- Day2: mood=4/10, tags=[anxious, deadline]  
- Day3: conversation snippet: "工作压力大，项目周五要交"
- Day4: mood=6/10, tags=[relieved]
- Day5-7: no significant signal

EXISTING profile.recurring_patterns: [] (空，新用户第一次提炼)

OUTPUT:
{
  "recurring_patterns": [
    {"pattern": "work deadlines correlate with anxiety spikes", 
     "first_observed": "2026-07-08", "confidence": 0.6}
  ],
  "growth_trajectory": {"summary": "insufficient data for trend", "trend": "stable", "since": "2026-07-08"},
  ...
}
```

**关键设计点：`confidence` 字段允许模式随时间增强或减弱，而不是一次性写死。** 低于 0.5 的模式不会出现在 Coach 的主动触发条件里（Trigger Engine 的 `pattern_recognition` 规则读取时会过滤 confidence < 0.5 的条目）。

---

## 2.3 数据校验层（防止 LLM 幻觉污染长期记忆）

这一步至关重要——L3 画像是持续累积的，一旦被污染，错误会长期存在并不断被引用。

```python
def validate_profile_schema(raw_output):
    # 1. JSON Schema 强校验
    jsonschema.validate(raw_output, PROFILE_SCHEMA)
    
    # 2. 事实锚定校验：新增的 recurring_pattern 必须能在原始L2记录中找到支撑
    for pattern in raw_output["recurring_patterns"]:
        if not exists_supporting_evidence(pattern, recent_l2_ids):
            raise ProfileValidationError(f"Unsupported pattern: {pattern}")
    
    # 3. Diff校验：单次提炼变更幅度过大则标记人工审核
    diff_ratio = compute_diff_ratio(existing_profile, raw_output)
    if diff_ratio > 0.5:
        flag_for_review(raw_output)
    
    return raw_output
```

---

## 2.4 L3 Profile 的下游消费点

```
memory_facts.profile_json 被以下模块直接读取：
├── Coach Context Assembler（每次对话/主动消息注入）
├── Trigger Engine 的 pattern_recognition 规则（B1）
├── Blueprint → Trends & Analytics 页面
└── longitudinal_report（30/180/365天报告生成）
```

---

## 2.5 隐私与合规设计（欧美市场GDPR/CCPA强制要求）

| 要求 | 实现 |
|------|------|
| 数据可导出 | `/account/export` 一键导出全部 L2+L3 数据为 JSON |
| 数据可删除 | 用户注销账号时，L2/L3全量物理删除（非软删除），30天内完成 |
| 敏感数据最小化 | L2 embedding 存储摘要而非原始对话全文（对话原文单独加密存储，检索用摘要） |
| 明确同意 | Onboarding 阶段单独一屏说明"AI会记住你的模式用于提供更好的服务"，非隐藏在ToS里 |

---

# PART 3 — 订阅定价与付费墙策略

## 3.0 定价基准调研（欧美同类产品对标）

| 产品 | 月价 | 年价 | 定位参考 |
|------|------|------|---------|
| Co-Star | Free+IAP | ~$5-8/月 | 星座社交 |
| Headspace | $12.99 | $69.99 | 冥想健康 |
| Chani | $13.99 | $99.99 | 高端占星 |
| ChatGPT Plus | $20 | - | 通用AI |
| The Pattern | Free+IAP | ~$8/月 | 命理社交 |

**结论：** Meridian 定位在"高端占星类"与"AI订阅类"之间，定价应高于 Co-Star/The Pattern（避免被归类为"占星社交App"），但低于 ChatGPT Plus（因为是垂直场景非通用工具）。

---

## 3.1 三层定价结构

| 层级 | 月付 | 年付（等效月价） | 定位 |
|------|------|------------------|------|
| **Free** | $0 | - | 获客层，体验核心价值但明确感知"上限" |
| **Meridian Plus** | $14.99 | $99/年（$8.25/月） | 主力订阅层，年付折扣显著促转化 |
| **Meridian Pro** | $29.99 | $199/年（$16.58/月） | 高粘性用户/未来Circle等功能载体 |

**年付折扣设计逻辑：** 年付比月付节省约45%，这是行业标准范围（Headspace约55%，Chani约40%），既能提升 LTV 也不会让月付用户觉得被"惩罚"。

---

## 3.2 功能边界矩阵

<details>
<summary><b>点击展开完整权益对照表</b></summary>

| 功能 | Free | Plus | Pro |
|------|------|------|-----|
| 每日能量分数 | ✅ | ✅ | ✅ |
| Check-in打卡 | ✅ 无限 | ✅ 无限 | ✅ 无限 |
| Coach主动消息 | 仅晨间简报(A1) | 全部20条规则 | 全部+更高频次上限 |
| Companion对话 | 每日3条 | 无限 | 无限+优先响应速度 |
| Blueprint基础命盘 | ✅ | ✅ | ✅ |
| Blueprint趋势分析 | ❌ | ✅ | ✅ |
| Learn课程 | 第1课免费 | 全部课程 | 全部+专家解读音频(未来) |
| 30天成长报告 | ❌ | ✅ | ✅ |
| 180/365天报告 | ❌ | ✅ | ✅ |
| Discover内容 | ✅ 无限 | ✅ 无限 | ✅ 无限 |
| 数据导出 | ✅ | ✅ | ✅ |
| 未来: Circle多人档案 | ❌ | ❌ | ✅ |
| 未来: 语音对话 | ❌ | ❌ | ✅ |

**设计逻辑：** Discover 对所有人开放（它是SEO/GEO流量入口，付费墙会直接扼杀增长引擎）。Coach 和 Companion 是主力付费墙——因为这是"每天想用"的高频功能，限制它最能驱动转化。

</details>

---

## 3.3 试用与转化漏斗设计

```
注册 → 7天全功能试用(Plus权益，无需信用卡)
         │
         ├─ Day 1: Onboarding + Core Self免费洞察(制造首个"哇"瞬间)
         ├─ Day 3: 首次B1类模式识别体验(如有数据支撑)
         ├─ Day 5: 触发D1规则预热("还剩2天")
         └─ Day 7: 试用结束 → 降级为Free(非强制付费，降低流失焦虑)
                    │
                    ├─ 已产生付费转化 → 正常订阅
                    └─ 未转化 → 保留Free体验 + 定期D4型价值回顾消息召回
```

**关键决策：试用无需信用卡预授权。** 欧美用户对"免费试用需要信用卡"的抵触情绪很强（转化率数据上，无卡试用的注册率通常显著更高，虽然到付费的转化率会低一些，但顶部漏斗基数更大，适合早期获客阶段）。

---

## 3.4 付费墙触发时机（Paywall UX）

不做"一言不合就弹付费墙"，而是**价值优先展示，功能边界处自然出现**：

```
触发时机设计：
├── 用户点击"查看趋势分析" → 展示模糊化预览 + "解锁完整趋势"
├── 用户第4次尝试Companion对话(已用完3次免费额度) → 
│     不是硬拒绝，是"今天的免费额度用完了，明天0点重置，或立即解锁无限对话"
├── 用户尝试查看180天报告 → 展示报告封面+第一段摘要（吊胃口）+ 解锁CTA
└── 首月Discover内容永久免费 → 绝不在此处设墙(保护SEO/自然流量)
```

---

## 3.5 定价的本地化与实验框架

| 维度 | 策略 |
|------|------|
| 地区定价 | 美区$14.99为基准，其他区域按购买力平价系数调整(App Store/Google Play原生支持) |
| Price Testing | 上线后对新用户做$12.99 / $14.99 / $16.99三档AB测试，找ARPU与转化率的最优平衡点 |
| Win-back优惠 | 取消订阅用户，30天后触发一次性50%折扣召回优惠（仅一次，避免用户养成"等打折"习惯） |
| Annual Push | 月付用户使用满60天后，触发一次"升级年付省45%"提示 |

---

## 3.6 ARR 拆解模型（百万美元目标的路径参考）

```
目标: $1M ARR

假设：
- Plus年付均价: $99/年 (占付费用户70%)
- Pro年付均价: $199/年 (占付费用户10%)  
- 月付混合均价: 约$150/年等效 (占付费用户20%)
- 混合ARPU ≈ $115/年

所需付费用户数 ≈ $1,000,000 / $115 ≈ 8,700人

假设免费→付费转化率 5-8%（行业中等水平）：
需要注册用户总量 ≈ 110,000 - 175,000人

结合Discover模块的自然SEO/GEO流量假设(该渠道获客成本≈$0)，
是达成该体量最关键的非付费增长引擎。
```

---

✅ 三个模块施工图全部完成：
1. **Prompt文案系统**（全局人格设定 + 8个核心Template的完整few-shot设计 + 工程化实践）
2. **Memory Extraction Job**（调度逻辑、提炼Prompt、数据校验、隐私合规）
3. **订阅定价策略**（三层定价、功能边界矩阵、试用漏斗、付费墙时机、ARR模型）

**下一步候选：**
- **视觉施工图**：把 Today Hub / Coach Feed 的具体页面 UI 规格画出来（延续 Meridian Design System）
- **Onboarding 详细流程**：逐屏设计首次使用体验（决定次日留存的关键页面）
- **Discover Engine 内容生产 Pipeline**：具体的SEO/GEO内容模板与自动化生成流程

你想继续哪一个，还是三个都要？