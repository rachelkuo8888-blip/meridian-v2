# Calculation Engine — 详细算法设计
### 八字 / 五行 / 紫微 / 节气 · 确定性计算规则

---

## 1. 整体计算流水线

```
输入: birth_date + birth_time(可空) + birth_location
        │
        ▼
┌───────────────────┐
│ Step 1: 真太阳时校正 │  → 得到校正后的精确时间
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Step 2: 公历→农历   │  → 得到农历年月日
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Step 3: 四柱排盘    │  → 年柱/月柱/日柱/时柱
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Step 4: 五行分析    │  → 五行占比、日主强弱、用神
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Step 5: 紫微排盘    │  → 十二宫、主星分布
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Step 6: 大运/流年   │  → 当前及未来周期
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Step 7: 每日能量计算 │  → 日柱与本命互动分数(每日增量任务)
└───────────────────┘
```

---

## 2. Step 1 — 真太阳时校正

**为什么必须做这一步：** 用户填的是"手表时间"（如伦敦本地时间），但八字排盘依赖的是"真太阳时"（太阳实际经过当地子午线的时间）。经度每差 15°，时差约1小时；同一个手表时间，伦敦人和纽约人的真太阳时完全不同，会导致时柱排错。

```
true_solar_time = local_civil_time
                 + longitude_correction
                 + equation_of_time_correction

longitude_correction = (birth_longitude - timezone_standard_longitude) × 4分钟/度

equation_of_time_correction = 查表(每年日期对应的均时差，范围约 -14分钟 ~ +16分钟)
```

**数据依赖：** 需要一份 `equation_of_time_table`（366天×分钟偏移值，可预计算存为静态 JSON，不需要每次实时计算天文公式）。

**容错设计：**
```python
def correct_to_true_solar_time(civil_time, longitude, tz_standard_longitude, date):
    lon_correction_minutes = (longitude - tz_standard_longitude) * 4
    eot_correction_minutes = EQUATION_OF_TIME_TABLE[date.strftime("%m-%d")]
    total_correction = lon_correction_minutes + eot_correction_minutes
    return civil_time + timedelta(minutes=total_correction)
```

> 如果用户 `birth_time_confidence = "unknown"`，跳过此步骤，时柱标记为 `null`，下游所有依赖时柱的模块（时柱五行、紫微身宫等）自动降级为"数据不足"状态，UI层面友好提示而非报错。

---

## 3. Step 2 — 公历转农历

**核心依赖：** 一份从 1900–2100 年的农历数据表（每年闰月位置、每月大小月、每年立春时间）。这是命理计算最基础的静态数据资产，一次构建，永久复用。

```
LunarDate = {
  year: int,
  month: int,
  day: int,
  is_leap_month: bool,
  year_ganzhi: str      // 年干支，如"甲子"
}
```

**关键规则：**
- 年柱以"立春"为界，不是以农历正月初一为界（这是命理界的标准做法，很多简化版工具会错误地用正月初一分界）
- 立春时间每年不同，需精确到分钟（存于同一份静态节气表中）

```python
def get_year_pillar(true_solar_datetime):
    lichun_time = SOLAR_TERM_TABLE[true_solar_datetime.year]["立春"]
    if true_solar_datetime < lichun_time:
        ganzhi_year = true_solar_datetime.year - 1
    else:
        ganzhi_year = true_solar_datetime.year
    return YEAR_GANZHI_TABLE[ganzhi_year]  # 60甲子循环表查值
```

---

## 4. Step 3 — 四柱排盘（核心算法）

### 4.1 年柱
已在上面给出：以立春分界，查60甲子循环表。

### 4.2 月柱
**规则：** 月柱以"节气"分界（不是农历初一），一年12个节，每个节对应固定的月支。

```
节气 → 月支 对照（固定不变）：
立春→寅  惊蛰→卯  清明→辰  立夏→巳  芒种→午  小暑→未
立秋→申  白露→酉  寒露→戌  立冬→亥  大雪→子  小寒→丑
```

月干则由"五虎遁"口诀计算（年干决定正月的月干起点，之后按顺序推）：

```python
WU_HU_DUN = {  # 年干 → 正月(寅月)月干
    "甲": "丙", "己": "丙",
    "乙": "戊", "庚": "戊",
    "丙": "庚", "辛": "庚",
    "丁": "壬", "壬": "壬",
    "戊": "甲", "癸": "甲"
}

def get_month_pillar(year_stem, solar_term_period_index):
    # solar_term_period_index: 0=寅月, 1=卯月...11=丑月
    start_stem = WU_HU_DUN[year_stem]
    month_stem = shift_stem(start_stem, solar_term_period_index)
    month_branch = MONTH_BRANCH_SEQUENCE[solar_term_period_index]
    return (month_stem, month_branch)
```

### 4.3 日柱
**规则：** 日柱是纯粹的日期累加循环，与节气无关——从固定基准日（如公元1900年1月31日=甲辰日）开始，按真太阳时校正后的日期，累计天数对60取余。

```python
BASE_DATE = date(1900, 1, 31)
BASE_GANZHI_INDEX = 0  # 甲子为0

def get_day_pillar(true_solar_date):
    delta_days = (true_solar_date.date() - BASE_DATE).days
    ganzhi_index = (BASE_GANZHI_INDEX + delta_days) % 60
    return GANZHI_60_TABLE[ganzhi_index]
```

> **注意换日时间点：** 命理传统上以"子时（23:00）"作为一天的分界，不是午夜0点。23:00–24:59出生的人，日柱要算作次日。这是最容易被简化工具做错的细节，必须在此处特别处理。

### 4.4 时柱
**规则：** 时支固定对应两小时区间（子时23-1点，丑时1-3点...），时干由"五鼠遁"口诀根据日干推算。

```python
WU_SHU_DUN = {  # 日干 → 子时时干起点
    "甲": "甲", "己": "甲",
    "乙": "丙", "庚": "丙",
    "丙": "戊", "辛": "戊",
    "丁": "庚", "壬": "庚",
    "戊": "壬", "癸": "壬"
}

HOUR_BRANCH_TABLE = [
    (23,1,"子"),(1,3,"丑"),(3,5,"寅"),(5,7,"卯"),
    (7,9,"辰"),(9,11,"巳"),(11,13,"午"),(13,15,"未"),
    (15,17,"申"),(17,19,"酉"),(19,21,"戌"),(21,23,"亥")
]

def get_hour_pillar(day_stem, true_solar_hour):
    branch_index = find_branch_index(true_solar_hour, HOUR_BRANCH_TABLE)
    start_stem = WU_SHU_DUN[day_stem]
    hour_stem = shift_stem(start_stem, branch_index)
    return (hour_stem, HOUR_BRANCH_TABLE[branch_index][2])
```

---

## 5. Step 4 — 五行分析引擎

### 5.1 天干地支五行映射表（静态常量）

```
天干五行: 甲乙→木  丙丁→火  戊己→土  庚辛→金  壬癸→水
地支五行: 寅卯→木  巳午→火  辰戌丑未→土  申酉→金  子亥→水

地支藏干（每个地支内部隐藏的天干及权重，用于精细五行占比计算）：
子: 癸100%
丑: 己60% 癸30% 辛10%
寅: 甲60% 丙30% 戊10%
... (12地支完整藏干表)
```

### 5.2 五行占比计算

```python
def calculate_element_distribution(four_pillars):
    element_weight = {"wood":0,"fire":0,"earth":0,"metal":0,"water":0}
    
    for pillar in four_pillars:  # 年月日时 四柱
        stem_element = STEM_ELEMENT[pillar.stem]
        element_weight[stem_element] += 1.0  # 天干权重1
        
        hidden_stems = BRANCH_HIDDEN_STEMS[pillar.branch]
        for hidden_stem, weight in hidden_stems.items():
            hidden_element = STEM_ELEMENT[hidden_stem]
            element_weight[hidden_element] += weight  # 地支藏干按权重累加
    
    total = sum(element_weight.values())
    return {k: round(v/total*100, 1) for k, v in element_weight.items()}
```

### 5.3 日主强弱判定（决定"用神"）

```python
def judge_day_master_strength(day_stem, element_distribution, month_branch):
    day_element = STEM_ELEMENT[day_stem]
    same_element_pct = element_distribution[day_element]
    generating_element_pct = element_distribution[GENERATES[day_element]]  # 印星
    
    support_score = same_element_pct + generating_element_pct * 0.7
    is_month_supportive = month_branch in SUPPORTIVE_BRANCHES[day_element]
    
    if support_score > 40 or is_month_supportive:
        return "strong"
    elif support_score < 20:
        return "weak"
    return "balanced"

def determine_useful_god(strength, day_element):
    if strength == "strong":
        return WEAKENING_ELEMENT[day_element]   # 克/泄日主的元素为用神
    elif strength == "weak":
        return SUPPORTING_ELEMENT[day_element]  # 生/助日主的元素为用神
    return "balanced_no_dominant_god"
```

> 这一段是命理专业性最强的部分，建议 MVP 阶段先用简化规则（如上），后续引入命理顾问对规则表做校准迭代，而不是一开始追求学院级精确度。

---

## 6. Step 5 — 紫微斗数排盘（简化版，MVP范围）

<details>
<summary>点击展开紫微排盘核心规则</summary>

紫微排盘比八字复杂得多，MVP 阶段建议**只做"十二宫定位 + 命宫主星"**，完整14主星全布局留到 V2。

```
Step A: 定命宫
  命宫位置 = 根据农历生月+生时查"定命宫表"（固定查表法，非计算）

Step B: 十二宫顺排
  从命宫开始，逆时针依次排：命宫→兄弟→夫妻→子女→财帛→疾厄
  →迁移→交友→官禄→田宅→福德→父母

Step C: 安紫微星
  紫微星位置 = 根据农历生日查"五行局+紫微星表"
  （需先算出"五行局"：由生年干支决定，分水二局/木三局/金四局/土五局/火六局）

Step D: 安其余13主星
  以紫微星位置为基准，按固定偏移规则依次排布
  （天机在紫微逆一位，太阳在紫微顺三位...等固定口诀表）
```

**数据资产需求：** 定命宫表（12月×12时=144组合）、五行局对照表、紫微星位表、13主星偏移规则表——全部是静态查表，无需实时天文计算。

</details>

---

## 7. Step 6 — 大运与流年

```python
def calculate_da_yun(gender, year_stem, month_pillar, birth_date):
    # 阳男阴女顺排，阴男阳女逆排
    direction = "forward" if (is_yang_stem(year_stem) == is_male(gender)) else "backward"
    
    # 起运年龄 = 从出生到下一个节气(或上一个节气)的天数 ÷ 3
    days_to_adjacent_term = get_days_to_solar_term(birth_date, direction)
    start_age = days_to_adjacent_term / 3
    
    da_yun_pillars = []
    current = month_pillar
    for decade_index in range(8):  # 排未来8个大运，约80年
        current = shift_pillar(current, direction, decade_index + 1)
        da_yun_pillars.append({
            "pillar": current,
            "start_age": start_age + decade_index * 10,
            "end_age": start_age + (decade_index + 1) * 10
        })
    return da_yun_pillars

def calculate_liu_nian(target_year):
    return get_year_pillar_for_year(target_year)  # 复用Step 2的年柱算法
```

---

## 8. Step 7 — 每日能量分数算法（产品最高频调用）

这是 **Today Hub** 每天展示的核心数字，必须是"确定性规则算法"，绝不能让 LLM 生成分数。

```python
def calculate_daily_energy(natal_chart, target_date):
    day_pillar_today = get_day_pillar(target_date)  # Step 3.3 算法复用
    day_master = natal_chart.day_master
    useful_god = natal_chart.useful_god
    
    score = 50  # 基线分
    
    # 规则1: 今日日柱五行是否为用神 → 加分
    today_element = get_pillar_element(day_pillar_today)
    if today_element == useful_god:
        score += 20
    
    # 规则2: 今日地支是否与命盘日支相冲 → 减分
    if is_clash(day_pillar_today.branch, natal_chart.day_pillar.branch):
        score -= 15
    
    # 规则3: 今日地支是否与命盘日支相合 → 加分
    if is_combine(day_pillar_today.branch, natal_chart.day_pillar.branch):
        score += 10
    
    # 规则4: 当前大运/流年是否与今日构成三合/半合 → 微调
    score += evaluate_da_yun_interaction(natal_chart.current_da_yun, day_pillar_today)
    
    return clamp(score, 0, 100)
```

**每日增量任务设计：**
```
Cron: 每天 UTC 00:00 后，按用户所在时区依次触发
  for each active_user:
      target_date = user's local "today"
      score = calculate_daily_energy(user.natal_chart, target_date)
      cache_to_redis(user_id, target_date, score, ttl=48h)
      trigger Coach的"daily_briefing" prompt route（见上一份文档 §5）
```

> **性能设计要点：** 相冲/相合/三合等关系判断都是固定的地支关系表（12×12矩阵，提前计算好存为常量），单次调用是 O(1) 查表操作，可以支撑百万级用户的每日批量计算而不需要复杂算力。

---

## 9. 节气日历（Solar Term Table）— 全系统共享的基础数据资产

```
SolarTermTable[year][term_name] = exact_utc_datetime

用途:
  - Step 2 年柱分界（立春）
  - Step 3 月柱分界（12节）
  - Discover模块每日节气内容
  - Coach的"节气触发"规则（见上份文档§3.3）
```

**数据来源建议：** 节气时刻可用天文算法（太阳黄经）精确计算，或直接采购/爬取一份 1900–2100 年的权威节气时刻表（分钟级精度）存为静态资产，MVP 阶段优先用现成表，避免自己实现天文算法。

---

## 10. 引擎输出与缓存策略

| 计算类型 | 计算频率 | 缓存策略 |
|---------|---------|---------|
| 四柱排盘（本命） | 一次性 | 永久存储于 `natal_charts` 表，仅 `engine_version` 升级时重算 |
| 五行/用神分析 | 一次性 | 随本命盘一起存储 |
| 大运 | 一次性（8个周期） | 随本命盘存储 |
| 流年 | 每年一次 | 按需计算，可预生成未来5年 |
| 每日能量分数 | 每日一次/用户 | Redis缓存48小时，Cron预热 |
| 节气表 | 静态资产 | 启动时加载进内存，不查数据库 |

---

## 11. 测试与校准策略

> 命理算法最大的风险不是性能，是**准确性一旦出错会被专业用户识破，摧毁品牌信任**。

建议在 MVP 上线前：

1. **黄金测试集**：找 50-100 组已知准确排盘结果的历史命例（可参考公开命理教材案例），逐条验证四柱/五行/大运输出是否与传统排盘工具完全一致
2. **交叉验证工具**：开发阶段用现成的开源排盘库（如 `sxtwl`）作为"参考基准"，自建引擎结果需与其在时间边界（子时、节气交界）等 edge case 上保持一致
3. **版本锁定机制**：`engine_version` 字段确保一旦发现算法bug修复后，不会静默改变已购买用户的历史报告数据，而是明确提示"我们升级了计算精度，是否重新生成你的图谱"

---

✅ Calculation Engine 详细算法设计完成（真太阳时校正、四柱排盘全流程、五行用神判定、紫微简化排盘、大运流年、每日能量算法、节气数据资产、缓存策略、测试校准方案）。

**下一步**：按计划进入 **Coach Agent 触发规则表**——把"连续3天焦虑""日柱冲本命""Streak中断"这类规则穷举出 MVP 阶段的前 15-20 条，包含每条规则的判断条件、冷却时间、优先级和对应 Prompt 模板 ID。要现在继续吗？