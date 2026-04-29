import streamlit as st
import datetime
from lunar_python import Lunar, Solar

# ──────────────────────────────────────────────
# Page Config (must be first Streamlit command)
# ──────────────────────────────────────────────
st.set_page_config(page_title="香港風水大師", page_icon="🏮", layout="wide")

# ──────────────────────────────────────────────
# Feng Shui Data Tables
# ──────────────────────────────────────────────

HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

STEM_ELEMENTS = {
    "甲": "木", "乙": "木",
    "丙": "火", "丁": "火",
    "戊": "土", "己": "土",
    "庚": "金", "辛": "金",
    "壬": "水", "癸": "水",
}

BRANCH_ELEMENTS = {
    "子": "水", "丑": "土", "寅": "木", "卯": "木",
    "辰": "土", "巳": "火", "午": "火", "未": "土",
    "申": "金", "酉": "金", "戌": "土", "亥": "水",
}

STEM_YINYANG = {
    "甲": "陽", "乙": "陰", "丙": "陽", "丁": "陰",
    "戊": "陽", "己": "陰", "庚": "陽", "辛": "陰",
    "壬": "陽", "癸": "陰",
}

BRANCH_ANIMALS = {
    "子": "鼠", "丑": "牛", "寅": "虎", "卯": "兔",
    "辰": "龍", "巳": "蛇", "午": "馬", "未": "羊",
    "申": "猴", "酉": "雞", "戌": "狗", "亥": "豬",
}

ELEMENT_COLORS = {
    "金": ["白色", "金色", "銀色"],
    "木": ["綠色", "青色", "棕色"],
    "水": ["黑色", "藍色", "深藍色"],
    "火": ["紅色", "橙色", "紫色", "粉紅色"],
    "土": ["黃色", "米色", "棕褐色", "赭色"],
}

ELEMENT_EMOJI = {"金": "🪙", "木": "🌳", "水": "💧", "火": "🔥", "土": "🌍"}

ELEMENT_DIRECTIONS = {
    "金": ["西方", "西北方"],
    "木": ["東方", "東南方"],
    "水": ["北方"],
    "火": ["南方"],
    "土": ["中央", "東北方", "西南方"],
}

# 相生: 木→火→土→金→水→木
PRODUCTIVE = {"木": "火", "火": "土", "土": "金", "金": "水", "水": "木"}
# 相剋: 木→土→水→火→金→木
DESTRUCTIVE = {"木": "土", "土": "水", "水": "火", "火": "金", "金": "木"}

HOUR_BRANCHES = [
    (23, 1, "子"), (1, 3, "丑"), (3, 5, "寅"), (5, 7, "卯"),
    (7, 9, "辰"), (9, 11, "巳"), (11, 13, "午"), (13, 15, "未"),
    (15, 17, "申"), (17, 19, "酉"), (19, 21, "戌"), (21, 23, "亥"),
]

KUA_DIRECTIONS = {
    1: {"group": "東四命", "best": "東南", "health": "東",   "romance": "南",   "personal": "北",
        "avoid": ["西", "西北", "西南", "東北"]},
    2: {"group": "西四命", "best": "東北", "health": "西",   "romance": "西北", "personal": "西南",
        "avoid": ["東", "東南", "南", "北"]},
    3: {"group": "東四命", "best": "南",   "health": "北",   "romance": "東南", "personal": "東",
        "avoid": ["西", "西北", "西南", "東北"]},
    4: {"group": "東四命", "best": "北",   "health": "南",   "romance": "東",   "personal": "東南",
        "avoid": ["西", "西北", "西南", "東北"]},
    6: {"group": "西四命", "best": "西",   "health": "東北", "romance": "西南", "personal": "西北",
        "avoid": ["東", "東南", "南", "北"]},
    7: {"group": "西四命", "best": "西北", "health": "西南", "romance": "東北", "personal": "西",
        "avoid": ["東", "東南", "南", "北"]},
    8: {"group": "西四命", "best": "西南", "health": "西北", "romance": "西",   "personal": "東北",
        "avoid": ["東", "東南", "南", "北"]},
    9: {"group": "東四命", "best": "東",   "health": "東南", "romance": "北",   "personal": "南",
        "avoid": ["西", "西北", "西南", "東北"]},
}


# ──────────────────────────────────────────────
# Helper Functions
# ──────────────────────────────────────────────

def get_hour_branch(hour: int) -> str:
    for start, end, branch in HOUR_BRANCHES:
        if start > end:
            if hour >= start or hour < end:
                return branch
        else:
            if start <= hour < end:
                return branch
    return "子"


def get_hour_stem(day_stem: str, hour_branch: str) -> str:
    day_idx = HEAVENLY_STEMS.index(day_stem)
    branch_idx = EARTHLY_BRANCHES.index(hour_branch)
    base = (day_idx % 5) * 2
    stem_idx = (base + branch_idx) % 10
    return HEAVENLY_STEMS[stem_idx]


def compute_bazi(solar_date: datetime.date, birth_hour: int):
    solar = Solar.fromYmd(solar_date.year, solar_date.month, solar_date.day)
    lunar = solar.getLunar()
    bazi = lunar.getEightChar()

    year_stem = bazi.getYearGan()
    year_branch = bazi.getYearZhi()
    month_stem = bazi.getMonthGan()
    month_branch = bazi.getMonthZhi()
    day_stem = bazi.getDayGan()
    day_branch = bazi.getDayZhi()

    hour_branch = get_hour_branch(birth_hour)
    hour_stem = get_hour_stem(day_stem, hour_branch)

    pillars = {
        "年柱": {"stem": year_stem,  "branch": year_branch},
        "月柱": {"stem": month_stem, "branch": month_branch},
        "日柱": {"stem": day_stem,   "branch": day_branch},
        "時柱": {"stem": hour_stem,  "branch": hour_branch},
    }
    return pillars, lunar


def count_elements(pillars: dict) -> dict:
    counts = {"金": 0, "木": 0, "水": 0, "火": 0, "土": 0}
    for p in pillars.values():
        counts[STEM_ELEMENTS[p["stem"]]] += 1
        counts[BRANCH_ELEMENTS[p["branch"]]] += 1
    return counts


def compute_kua(year: int, gender: str) -> int:
    digits_sum = year
    while digits_sum >= 10:
        digits_sum = sum(int(d) for d in str(digits_sum))
    if gender == "男":
        kua = 11 - digits_sum
        if kua > 9:
            kua -= 9
    else:
        kua = digits_sum + 4
        if kua > 9:
            kua -= 9
    if kua == 5:
        kua = 2 if gender == "男" else 8
    return kua


def get_favorable_element(day_stem: str, element_counts: dict) -> dict:
    day_element = STEM_ELEMENTS[day_stem]
    same_count = element_counts[day_element]
    producing = {v: k for k, v in PRODUCTIVE.items()}
    producer = producing[day_element]
    support = same_count + element_counts[producer]
    total = sum(element_counts.values())
    strong = support > total / 2

    if strong:
        favorable = [PRODUCTIVE[day_element], DESTRUCTIVE[day_element]]
        unfavorable = [day_element, producer]
    else:
        favorable = [day_element, producer]
        unfavorable = [PRODUCTIVE[day_element], DESTRUCTIVE[day_element]]

    return {
        "day_element": day_element,
        "strong": strong,
        "favorable": favorable,
        "unfavorable": unfavorable,
    }


def lucky_numbers(el1, el2):
    num_map = {"金": [4, 9], "木": [3, 8], "水": [1, 6], "火": [2, 7], "土": [5, 0]}
    nums = sorted(set(num_map.get(el1, []) + num_map.get(el2, [])))
    return "根據喜用神推算之幸運數字：**" + "、".join(str(n) for n in nums) + "**"


# ──────────────────────────────────────────────
# Streamlit UI
# ──────────────────────────────────────────────

st.markdown("""
<style>
    .main-header {
        text-align: center; padding: 10px 0 0 0;
    }
    .main-header h1 { color: #b22222; font-size: 2.4rem; }
    .main-header p  { color: #555; font-size: 1.1rem; }
    .pillar-card {
        background: linear-gradient(135deg, #fff8e1, #ffe0b2);
        border-radius: 12px; padding: 16px; text-align: center;
        border: 2px solid #d4a017; min-height: 170px;
    }
    .pillar-card h4 { margin: 0 0 6px 0; color: #8b0000; }
    .pillar-card .stem   { font-size: 2rem; }
    .pillar-card .branch { font-size: 2rem; }
    .element-bar {
        border-radius: 6px; padding: 6px 14px; margin: 3px 0;
        color: #fff; font-weight: 600; display: inline-block;
    }
    .section-title { border-left: 5px solid #b22222; padding-left: 12px; margin-top: 28px; }
    .rec-box {
        background: #fdf6ec; border-left: 4px solid #d4a017;
        border-radius: 6px; padding: 14px 18px; margin: 6px 0;
    }
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="main-header">
    <h1>🏮 香港風水大師 🏮</h1>
    <p>傳統八字命理與風水分析系統 — 以中國古典玄學為基礎</p>
</div>
""", unsafe_allow_html=True)

st.divider()

# ── Sidebar: Customer Input ──────────────────
with st.sidebar:
    st.header("🧧 客戶資料")
    name = st.text_input("姓名", placeholder="例：陳大文")
    gender = st.selectbox("性別", ["男", "女"])
    birth_date = st.date_input(
        "出生日期（西曆）",
        value=datetime.date(1990, 1, 1),
        min_value=datetime.date(1920, 1, 1),
        max_value=datetime.date.today(),
    )
    birth_hour = st.slider("出生時辰（24小時制）", 0, 23, 12)
    st.caption(f"時辰地支：**{get_hour_branch(birth_hour)}** 時")
    analyze = st.button("🔮 開始分析", use_container_width=True, type="primary")

# ── Main Analysis ─────────────────────────────
if analyze:
    if not name.strip():
        st.warning("請輸入客戶姓名。")
        st.stop()

    pillars, lunar = compute_bazi(birth_date, birth_hour)
    element_counts = count_elements(pillars)
    kua = compute_kua(birth_date.year, gender)
    kua_info = KUA_DIRECTIONS.get(kua)
    day_stem = pillars["日柱"]["stem"]
    analysis = get_favorable_element(day_stem, element_counts)

    # ── Customer Summary ──
    st.markdown(f"### 📋 **{name}** 之命理分析報告")
    year_branch = pillars["年柱"]["branch"]

    col1, col2, col3 = st.columns(3)
    col1.metric("生肖", BRANCH_ANIMALS.get(year_branch, ""))
    col2.metric("卦數", kua)
    col3.metric("日主", f"{day_stem}（{STEM_ELEMENTS[day_stem]}{STEM_YINYANG[day_stem]}）")

    lunar_str = f"{lunar.getYearInChinese()}年{lunar.getMonthInChinese()}月{lunar.getDayInChinese()}"
    st.info(f"**農曆生日：** {lunar_str}")

    # ── Four Pillars ──
    st.markdown('<h3 class="section-title">八字四柱</h3>', unsafe_allow_html=True)
    cols = st.columns(4)
    for i, (label, pdata) in enumerate(pillars.items()):
        s_el = STEM_ELEMENTS[pdata["stem"]]
        b_el = BRANCH_ELEMENTS[pdata["branch"]]
        with cols[i]:
            st.markdown(f"""
            <div class="pillar-card">
                <h4>{label}</h4>
                <div class="stem">{pdata['stem']}</div>
                <div style="font-size:.8rem;color:#666">{s_el} {STEM_YINYANG[pdata['stem']]}</div>
                <hr style="margin:6px 0;border-color:#d4a017">
                <div class="branch">{pdata['branch']}</div>
                <div style="font-size:.8rem;color:#666">{b_el} · {BRANCH_ANIMALS.get(pdata['branch'], '')}</div>
            </div>
            """, unsafe_allow_html=True)

    # ── Five Elements Chart ──
    st.markdown('<h3 class="section-title">五行平衡</h3>', unsafe_allow_html=True)
    el_colors_map = {"金": "#9e9e9e", "木": "#4caf50", "水": "#2196f3", "火": "#f44336", "土": "#ff9800"}

    chart_cols = st.columns(5)
    for i, el in enumerate(["金", "木", "水", "火", "土"]):
        cnt = element_counts[el]
        chart_cols[i].markdown(
            f'<div style="text-align:center"><span style="font-size:2rem">{ELEMENT_EMOJI[el]}</span>'
            f'<br><b>{el}</b><br>'
            f'<span class="element-bar" style="background:{el_colors_map[el]}">{cnt}/8</span></div>',
            unsafe_allow_html=True,
        )

    max_el = max(element_counts, key=element_counts.get)
    min_el = min(element_counts, key=element_counts.get)
    st.markdown(f"**最旺之五行：** {ELEMENT_EMOJI[max_el]} {max_el}（{element_counts[max_el]}）｜"
                f"**最弱之五行：** {ELEMENT_EMOJI[min_el]} {min_el}（{element_counts[min_el]}）")

    # ── Day Master Strength ──
    st.markdown('<h3 class="section-title">日主分析</h3>', unsafe_allow_html=True)
    strength_label = "**身強**" if analysis["strong"] else "**身弱**"
    st.markdown(f"日主 **{day_stem}** 屬 **{analysis['day_element']}** 行，判定為{strength_label}。")

    fcol, ucol = st.columns(2)
    with fcol:
        st.success("**喜用神（有利元素）**")
        for el in analysis["favorable"]:
            colors = "、".join(ELEMENT_COLORS[el])
            dirs = "、".join(ELEMENT_DIRECTIONS[el])
            st.markdown(f"- {ELEMENT_EMOJI[el]} **{el}** — 顏色：{colors} · 方位：{dirs}")
    with ucol:
        st.error("**忌神（不利元素）**")
        for el in analysis["unfavorable"]:
            colors = "、".join(ELEMENT_COLORS[el])
            st.markdown(f"- {ELEMENT_EMOJI[el]} **{el}** — 宜避免顏色：{colors}")

    # ── Kua Number & Directions ──
    st.markdown('<h3 class="section-title">卦數與吉凶方位</h3>', unsafe_allow_html=True)
    if kua_info:
        st.markdown(f"卦數 **{kua}** — 屬 **{kua_info['group']}**")
        d1, d2, d3, d4 = st.columns(4)
        d1.success(f"**生氣（財位）**\n\n{kua_info['best']}")
        d2.success(f"**天醫（健康）**\n\n{kua_info['health']}")
        d3.success(f"**延年（桃花）**\n\n{kua_info['romance']}")
        d4.success(f"**伏位（穩定）**\n\n{kua_info['personal']}")

        st.warning("**凶方（宜避免之方位）：** " + "、".join(kua_info["avoid"]))
    else:
        st.info(f"卦數 {kua} — 方位資料暫缺。")

    # ── Comprehensive Recommendations ──
    st.markdown('<h3 class="section-title">風水建議</h3>', unsafe_allow_html=True)

    fav1 = analysis["favorable"][0] if analysis["favorable"] else "土"
    fav2 = analysis["favorable"][1] if len(analysis["favorable"]) > 1 else fav1

    recs = [
        ("🏠 家居布局",
         f"書桌或睡床宜朝向 **{kua_info['best'] if kua_info else '南'}** 方以催旺財運。"
         f"保持 **{kua_info['health'] if kua_info else '東'}** 方位整潔明亮，有助健康運。"),
        (f"{ELEMENT_EMOJI[fav1]} 喜用元素佈置",
         f"在居所中擺放屬 **{fav1}** 之物品。"
         f"建議顏色：**{'、'.join(ELEMENT_COLORS[fav1])}**。"
         f"最佳方位：**{'、'.join(ELEMENT_DIRECTIONS[fav1])}**。"),
        (f"{ELEMENT_EMOJI[fav2]} 輔助元素",
         f"**{fav2}** 行能輔助命局。"
         f"顏色：**{'、'.join(ELEMENT_COLORS[fav2])}**。"
         f"方位：**{'、'.join(ELEMENT_DIRECTIONS[fav2])}**。"),
        ("👔 事業與衣著",
         f"出席重要場合時，宜穿著喜用神顏色之衣物（{'、'.join(ELEMENT_COLORS[fav1][:2])}）。"
         f"從事與 **{fav1}** 行相關之行業最為適合。"),
        ("🔢 幸運數字",
         lucky_numbers(fav1, fav2)),
    ]

    for title, body in recs:
        st.markdown(f'<div class="rec-box"><b>{title}</b><br>{body}</div>', unsafe_allow_html=True)

    # ── Five Element Cycle Diagram ──
    st.markdown('<h3 class="section-title">五行相生相剋</h3>', unsafe_allow_html=True)
    cyc1, cyc2 = st.columns(2)
    with cyc1:
        st.markdown("**相生（互相滋養）：**")
        st.markdown("木 🌳 → 火 🔥 → 土 🌍 → 金 🪙 → 水 💧 → 木 🌳")
    with cyc2:
        st.markdown("**相剋（互相制約）：**")
        st.markdown("木 🌳 → 土 🌍 → 水 💧 → 火 🔥 → 金 🪙 → 木 🌳")

    st.divider()
    st.caption("🏮 本分析基於傳統香港式八字命理與風水學說，僅供參考，不構成任何專業建議。")

else:
    st.markdown("""
    ### 歡迎使用
    請於左側欄輸入客戶資料，然後按「**開始分析**」以生成完整風水命理報告。

    **本系統功能：**
    - **八字四柱** — 年柱、月柱、日柱、時柱之天干地支
    - **五行分析** — 金、木、水、火、土之平衡狀況
    - **日主強弱** — 身強身弱判定，配以喜用神與忌神
    - **卦數方位** — 吉方與凶方之推算
    - **個人化建議** — 家居布局、顏色、事業、幸運數字
    """)
