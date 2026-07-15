# Coach Agent — 触发规则表设计
### MVP 阶段完整规则清单 · Trigger Engine 落地施工图

---

## 0. 规则表设计原则

在列出具体规则前，先定三条硬性约束，避免做成"骚扰型推送"：

| 约束 | 具体规则 |
|------|---------|
| **每用户每日消息上限** | 最多 2 条主动 Coach 消息（1条晨间 + 1条触发型），高优先级紧急规则可突破至3条 |
| **规则冷却期** | 每条规则独立冷却，同一规则触发后进入冷却，冷却期内即使条件仍满足也不重复触发 |
| **优先级仲裁** | 同一时刻多条规则同时满足时，只发送优先级最高的一条，其余进入队列延后 |

```python
class TriggerRule:
    id: str
    category: str          # time_based / behavior_based / chart_based / lifecycle_based
    condition: Callable
    cooldown_hours: int
    priority: int           # 1-10，10最高
    prompt_template_id: str
    requires_subscription: bool   # 是否仅付费用户可触发
```

---

## 1. 规则分类总览

```
Category A — 时间型（Time-Based）        4条
Category B — 行为型（Behavior-Based）     6条
Category C — 命理型（Chart-Based）        6条
Category D — 生命周期型（Lifecycle）       4条
────────────────────────────────────────
合计 MVP 规则数：20条
```

---

## 2. Category A — 时间型触发（4条）

<details>
<summary><b>点击展开</b></summary>

### A1 — 每日晨间简报
```yaml
id: daily_morning_briefing
condition: 用户本地时间到达其设置的提醒时段(默认8:00)
cooldown_hours: 20
priority: 8
prompt_template_id: daily_briefing
requires_subscription: false
context_needed: [today_energy_score, useful_god_status, day_clash_check]
```
**示例输出：** *"今天是水日，与你的用神相合。上午适合处理需要耐心的事。"*

### A2 — 傍晚复盘提示
```yaml
id: evening_reflection_prompt
condition: 用户本地时间19:00-21:00 且 今日未完成check-in
cooldown_hours: 20
priority: 5
prompt_template_id: proactive_checkin
requires_subscription: false
```
**示例输出：** *"今天还没记录状态。花15秒，今天感觉怎么样？"*

### A3 — 周报生成提醒
```yaml
id: weekly_review_ready
condition: 每周日本地时间18:00 且 本周check-in次数≥3
cooldown_hours: 144
priority: 6
prompt_template_id: weekly_summary
requires_subscription: true
```
**示例输出：** *"本周的模式已经生成。想看看这周你的能量曲线吗？"*

### A4 — 节气提醒
```yaml
id: solar_term_arrival
condition: 今日是24节气交界日（全局广播，非个体判断）
cooldown_hours: 336  # 约14天，防止节气临近多次误触发
priority: 7
prompt_template_id: discover_content
requires_subscription: false
```
**示例输出：** *"今天立秋。你的命盘中，金元素开始转旺。"*

</details>

---

## 3. Category B — 行为型触发（6条）

<details>
<summary><b>点击展开</b></summary>

### B1 — 连续负面情绪模式
```yaml
id: recurring_negative_mood
condition: 近7天check-in中，同一负面tag(如"焦虑")出现≥3次
cooldown_hours: 168  # 7天内不重复提及同一模式
priority: 9
prompt_template_id: pattern_recognition
requires_subscription: true
context_needed: [tag_history_7d, memory_l3_profile]
```
**示例输出：** *"最近7天你记录了3次焦虑，都在下午出现。要不要一起看看？"*

### B2 — Streak中断挽留
```yaml
id: streak_broken_recovery
condition: 用户streak在昨天中断(前一日streak≥3天，今日未check-in)
cooldown_hours: 24
priority: 7
prompt_template_id: streak_recovery
requires_subscription: false
```
**示例输出：** *"昨天断签了，没关系。今天重新开始，之前的记录都还在。"*

### B3 — 长期未打开挽回
```yaml
id: lapsed_user_recall
condition: 用户连续3天未打开App
cooldown_hours: 72
priority: 6
prompt_template_id: lapsed_recall
requires_subscription: false
```
**示例输出：** *"这三天你的能量曲线有点变化，什么时候方便可以看看。"*

### B4 — 情绪显著改善反馈
```yaml
id: positive_trend_detected
condition: 近14天正面mood_score均值较前14天提升≥20%
cooldown_hours: 336
priority: 6
prompt_template_id: growth_reflection
requires_subscription: true
```
**示例输出：** *"过去两周，你的状态比之前稳定了不少。你自己感觉到了吗？"*

### B5 — 首次完成7天连续打卡
```yaml
id: first_week_streak_milestone
condition: streak恰好达到7天(仅首次触发一次，全生命周期唯一)
cooldown_hours: 999999  # 相当于永不重复
priority: 8
prompt_template_id: milestone_celebration
requires_subscription: false
```
**示例输出：** *"连续7天了。这是你和自己对话最久的一次记录。"*

### B6 — Companion深度对话后跟进
```yaml
id: followup_after_deep_conversation
condition: 用户在对话中出现关键决策类关键词(如"要不要""该不该")，且对话在24小时前结束、未再联系
cooldown_hours: 48
priority: 7
prompt_template_id: decision_followup
requires_subscription: true
```
**示例输出：** *"昨天你在想那个决定。后来想清楚了吗？"*

</details>

---

## 4. Category C — 命理型触发（6条）

<details>
<summary><b>点击展开</b></summary>

### C1 — 日柱冲本命日支
```yaml
id: day_clash_natal
condition: 今日日柱地支与本命日支构成"六冲"关系
cooldown_hours: 20  # 每次发生都可提醒，但同日不重复
priority: 9
prompt_template_id: clash_warning
requires_subscription: false
context_needed: [today_pillar, natal_day_pillar]
```
**示例输出：** *"今天与你的本命日柱相冲。情绪容易波动，重要对话建议放到明天。"*

### C2 — 今日五行为用神
```yaml
id: useful_god_activation
condition: 今日日柱五行 == 命盘用神
cooldown_hours: 20
priority: 6
prompt_template_id: favorable_day
requires_subscription: false
```
**示例输出：** *"今天的元素对你有利，适合推进重要的事。"*

### C3 — 大运/流年转换临近
```yaml
id: da_yun_transition_approaching
condition: 距离用户下一个大运周期切换 ≤ 90天
cooldown_hours: 720  # 30天内不重复
priority: 8
prompt_template_id: cycle_transition_notice
requires_subscription: true
```
**示例输出：** *"再过三个月，你会进入一个新的十年周期。现在开始感受到一些变化了吗？"*

### C4 — 流年冲太岁
```yaml
id: annual_clash_year
condition: 当前年份流年地支与本命年支相冲(俗称"犯太岁"，用中性语言表达)
cooldown_hours: 8760  # 一年一次即可
priority: 7
prompt_template_id: annual_caution
requires_subscription: true
```
**示例输出：** *"今年的流年与你的本命年柱形成张力。这类年份通常伴随较大变化，留意节奏。"*

### C5 — 三合/半合有利日
```yaml
id: favorable_combination_day
condition: 今日地支与命盘日支或大运构成三合/半合关系
cooldown_hours: 20
priority: 5
prompt_template_id: favorable_day
requires_subscription: false
```
**示例输出：** *"今天的能量与你的节奏很契合，适合做需要合作的事。"*

### C6 — 高能量分数日（≥85分）
```yaml
id: high_energy_score_day
condition: today_energy_score ≥ 85（Calculation Engine输出，非LLM生成）
cooldown_hours: 20
priority: 6
prompt_template_id: high_energy_encouragement
requires_subscription: false
```
**示例输出：** *"今天的分数是这个月最高的几天之一。别浪费在琐事上。"*

</details>

---

## 5. Category D — 生命周期型触发（4条）

<details>
<summary><b>点击展开</b></summary>

### D1 — 试用期即将结束
```yaml
id: trial_ending_soon
condition: 免费试用剩余≤2天 且 用户近7天有活跃行为(≥3次打开)
cooldown_hours: 999999  # 单次生命周期仅一次
priority: 9
prompt_template_id: trial_conversion
requires_subscription: false
```
**示例输出：** *"试用还剩2天。这段时间你已经记录了[N]次，看得出你在认真用它。"*

### D2 — 30天里程碑成长报告
```yaml
id: milestone_30day_report
condition: 用户注册满30天 且 累计check-in≥10次
cooldown_hours: 999999
priority: 8
prompt_template_id: longitudinal_report_30d
requires_subscription: true
```
**示例输出：** *"你用了30天。想看看这一个月，你的状态是怎么变化的吗？"*

### D3 — 180天/年度里程碑报告
```yaml
id: milestone_180day_report
condition: 用户注册满180天(及365天倍数)
cooldown_hours: 999999
priority: 9
prompt_template_id: longitudinal_report_180d
requires_subscription: true
```
**示例输出：** *"半年前你第一次打开这个App。这半年，很多东西已经不一样了。"*

### D4 — 订阅即将到期召回
```yaml
id: subscription_expiring_recall
condition: 订阅将在3天内到期 且 auto_renew=false
cooldown_hours: 999999
priority: 9
prompt_template_id: renewal_recall
requires_subscription: true
```
**示例输出：** *"你的订阅3天后到期。这段时间积累的记录会一直保留，但深度分析会暂停。"*

</details>

---

## 6. 规则触发扫描的完整调度逻辑

```python
def run_hourly_trigger_scan():
    active_users = get_users_active_in_last_7_days()
    
    for user in active_users:
        context = build_user_context(user)  # 见上份文档§3.4
        
        candidates = []
        for rule in ALL_20_RULES:
            if rule.requires_subscription and not user.is_subscribed:
                continue
            if is_in_cooldown(user, rule):
                continue
            if rule.condition(context):
                candidates.append(rule)
        
        if not candidates:
            continue
        
        # 当日消息数已达上限则跳过
        if get_today_message_count(user) >= DAILY_MESSAGE_CAP:
            continue
        
        best_rule = max(candidates, key=lambda r: r.priority)
        enqueue_coach_message(user, best_rule, context)
        record_cooldown(user, best_rule)
```

---

## 7. Prompt Template 与规则的映射关系

| Template ID | 对应规则数量 | 语气基调 |
|---|---|---|
| `daily_briefing` | A1 | 简洁播报 |
| `proactive_checkin` | A2 | 轻量邀请 |
| `weekly_summary` | A3 | 总结性 |
| `discover_content` | A4 | 教育性 |
| `pattern_recognition` | B1 | 温和、非评判 |
| `streak_recovery` | B2 | 鼓励、无负担 |
| `lapsed_recall` | B3 | 好奇、非说教 |
| `growth_reflection` | B4 | 肯定、克制 |
| `milestone_celebration` | B5 | 庆祝但不过度 |
| `decision_followup` | B6 | 关心、不追问细节 |
| `clash_warning` | C1 | 中性提醒，非恐吓 |
| `favorable_day` | C2, C5 | 简洁正向 |
| `cycle_transition_notice` | C3 | 平静、启发式 |
| `annual_caution` | C4 | 谨慎但不制造焦虑 |
| `high_energy_encouragement` | C6 | 激励行动 |
| `trial_conversion` | D1 | 价值总结型 |
| `longitudinal_report_30d/180d` | D2, D3 | 叙事性、有情感重量 |
| `renewal_recall` | D4 | 提醒价值，非威胁式 |

> 每个 Template 对应上一份文档 §3.2 的 Context Package 结构，实际 Prompt 文案设计（system prompt 全文）建议作为独立一轮施工图产出——涉及大量语气调优，需要专门迭代测试。

---

## 8. 关键风险控制点

| 风险 | 缓解设计 |
|------|---------|
| C1/C4 类"凶险"表述可能引发焦虑，损害"非算命"定位 | Prompt Template 强制使用中性语言黑名单过滤（禁止"凶""劫""破财"等词，替换为"张力""留意节奏"） |
| B1类心理健康相关触发可能涉及敏感话题 | 检测到自伤/极端负面关键词时，规则直接短路给出资源引导文案，不走正常Coach流程 |
| D1/D4类付费召回容易显得"push订阅" | 价值优先于转化——文案先讲用户已获得的价值，付费CTA放在消息末尾且可忽略 |
| 规则越多，AB测试和维护成本越高 | `coach_events.user_reaction` 数据从第一天开始收集，为V2的规则权重优化做训练数据准备 |

---

✅ Coach Agent 触发规则表完成（20条 MVP 规则，含分类、条件、冷却、优先级、Prompt映射、调度逻辑、风险控制）。

**下一步候选方向：**
1. **具体 Prompt 文案设计**（每个 Template 的完整 System Prompt，含语气示例库）
2. **Memory Extraction Job 详细设计**（L2→L3 每日提炼任务的具体算法与Prompt）
3. **订阅定价与付费墙策略**（Free/Plus/Pro 具体权益边界，欧美市场定价基准）

你想先做哪一个？