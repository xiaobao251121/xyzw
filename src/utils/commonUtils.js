// ==================== 活动周期计算 ====================

/**
 * 根据任意日期计算该日期所处的活动周（黑市周/招募周/宝箱周）
 * 游戏内3周循环活动周期
 * @param {Date} [targetDate] - 目标日期，默认当前时间
 * @returns {'黑市周'|'招募周'|'宝箱周'|null}
 */
export function getActivityWeekForDate(targetDate) {
  const d = targetDate ? new Date(targetDate.getTime()) : new Date()
  const start = new Date('2025-11-21T12:00:00') // 起始锚点：黑市周开始（周五）
  const weekDuration = 7 * 24 * 60 * 60 * 1000
  const cycleDuration = 3 * weekDuration

  const elapsed = d.getTime() - start.getTime()
  if (elapsed < 0) return null

  const cyclePosition = elapsed % cycleDuration

  if (cyclePosition < weekDuration) return '黑市周'
  if (cyclePosition < 2 * weekDuration) return '招募周'
  return '宝箱周'
}

/**
 * 获取当前活动周（黑市周/招募周/宝箱周）
 * 游戏内3周循环活动周期
 * @returns {'黑市周'|'招募周'|'宝箱周'|null}
 */
export function getCurrentActivityWeek() {
  return getActivityWeekForDate()
}

/**
 * 获取下周活动名称及剩余时间
 * @returns {{ name: string, daysLeft: number, msLeft: number }|null}
 */
export function getNextActivityWeek() {
  const now = new Date()
  const start = new Date('2025-11-21T12:00:00')
  const weekDuration = 7 * 24 * 60 * 60 * 1000
  const cycleDuration = 3 * weekDuration

  const elapsed = now.getTime() - start.getTime()
  if (elapsed < 0) return null

  const cyclePosition = elapsed % cycleDuration
  const weekIndex = Math.floor(cyclePosition / weekDuration) // 0, 1, 2
  const msIntoWeek = cyclePosition % weekDuration
  const msLeft = weekDuration - msIntoWeek
  const daysIntoWeek = msIntoWeek / (24 * 60 * 60 * 1000)
  const daysLeft = Math.ceil(7 - daysIntoWeek)

  const weekNames = ['黑市周', '招募周', '宝箱周']
  const nextName = weekNames[(weekIndex + 1) % 3]

  return { name: nextName, daysLeft: Math.max(0, daysLeft), msLeft: Math.max(0, msLeft) }
}

/**
 * 计算周年庆日期（国庆假期 10/1~10/7 后的第 2 个周五）
 * @param {number} year
 * @returns {Date}
 */
function getAnniversaryDate(year) {
  const d = new Date(year, 9, 8) // 从 10月8日 开始
  let fridayCount = 0
  while (fridayCount < 2) {
    if (d.getDay() === 5) fridayCount++
    if (fridayCount < 2) d.setDate(d.getDate() + 1)
  }
  return new Date(year, d.getMonth(), d.getDate())
}

// =========================================================
// 【查表法】农历节日 → 公历映射 (2025-2050)
// =========================================================
// 说明：
//   - 数组格式: [月份, 日期]
//   - 注意：JS 月份从 0 开始（0=1月, 5=6月, 8=9月...）
//   - 覆盖 26 年，游戏工具场景足够
// =========================================================

const DUANWU_MAP = {          // 【端午】农历五月初五
  2025: [5, 31],  // → 2025年6月31日
  2026: [5, 19],  // → 2026年6月19日
  2027: [5,  9],  // → 2027年6月 9日
  2028: [4, 28],  // → 2028年5月28日
  2029: [5, 16],  // → 2029年6月16日
  2030: [5,  5],  // → 2030年6月 5日
  2031: [6, 24],  // → 2031年7月24日
  2032: [6, 12],  // → 2032年7月12日
  2033: [6,  1],  // → 2033年7月 1日
  2034: [6, 20],  // → 2034年7月20日
  2035: [6, 10],  // → 2035年7月10日
  2036: [5, 30],  // → 2036年6月30日
  2037: [6, 18],  // → 2037年7月18日
  2038: [6,  7],  // → 2038年7月 7日
  2039: [5, 27],  // → 2039年6月27日
  2040: [6, 14],  // → 2040年7月14日
  2041: [6,  3],  // → 2041年7月 3日
  2042: [5, 23],  // → 2042年6月23日
  2043: [6, 11],  // → 2043年7月11日
  2044: [5, 31],  // → 2044年6月31日
  2045: [6, 19],  // → 2045年7月19日
  2046: [6,  8],  // → 2046年7月 8日
  2047: [5, 29],  // → 2047年6月29日
  2048: [6, 16],  // → 2048年7月16日
  2049: [6,  5],  // → 2049年7月 5日
  2050: [5, 25],  // → 2050年6月25日
}

const ZHONGQIU_MAP = {         // 【中秋】农历八月十五
  2025: [ 9,  6],  // → 2025年10月 6日
  2026: [ 8, 25],  // → 2026年 9月25日
  2027: [ 8, 15],  // → 2027年 9月15日
  2028: [ 9,  3],  // → 2028年10月 3日
  2029: [ 8, 22],  // → 2029年 9月22日
  2030: [ 8, 12],  // → 2030年 9月12日
  2031: [10,  1],  // → 2031年11月 1日
  2032: [ 9, 19],  // → 2032年10月19日
  2033: [ 9,  8],  // → 2033年10月 8日
  2034: [ 8, 28],  // → 2034年 9月28日
  2035: [ 9, 16],  // → 2035年10月16日
  2036: [10,  4],  // → 2036年11月 4日
  2037: [ 9, 24],  // → 2037年10月24日
  2038: [ 9, 13],  // → 2038年10月13日
  2039: [ 9,  2],  // → 2039年10月 2日
  2040: [ 9, 20],  // → 2040年10月20日
  2041: [ 9, 10],  // → 2041年10月10日
  2042: [ 8, 29],  // → 2042年 9月29日
  2043: [ 9, 17],  // → 2043年10月17日
  2044: [10,  6],  // → 2044年11月 6日
  2045: [ 9, 25],  // → 2045年10月25日
  2046: [ 9, 15],  // → 2046年10月15日
  2047: [10,  4],  // → 2047年11月 4日
  2048: [ 9, 21],  // → 2048年10月21日
  2049: [ 9, 10],  // → 2049年10月10日
  2050: [ 8, 30],  // → 2050年 9月30日
}

function getDragonBoatDate(year) {
  const d = DUANWU_MAP[year]
  return d ? new Date(year, d[0], d[1], 12, 0, 0) : new Date(year, 5, 15, 12, 0, 0)
}

function getMidAutumnDate(year) {
  const d = ZHONGQIU_MAP[year]
  return d ? new Date(year, d[0], d[1], 12, 0, 0) : new Date(year, 8, 15, 12, 0, 0)
}

/**
 * 节日活动定义
 * solarMonth/solarDay：公历固定日期
 * dynamic：动态计算函数
 * @type {Array<{name: string, type: 'paid'|'free', solarMonth?: number, solarDay?: number, dynamic?: Function}>}
 */
const FESTIVAL_EVENTS = [
  // 氪金活动
  { name: '五一', type: 'paid', solarMonth: 5, solarDay: 1 }, // 公历5月1日
  { name: '周年庆', type: 'paid', dynamic: getAnniversaryDate }, // 国庆后第2个周五
  // 白嫖活动
  { name: '元旦', type: 'free', solarMonth: 1, solarDay: 1 }, // 公历1月1日
  { name: '端午', type: 'free', dynamic: getDragonBoatDate }, // 农历五月初五
  { name: '中秋', type: 'free', dynamic: getMidAutumnDate }, // 农历八月十五
]

/**
 * 获取某个活动在某年的公历日期
 * @param {object} event - 活动定义
 * @param {number} year - 年份
 * @returns {Date|null}
 */
function getEventDate(event, year) {
  // 动态计算（如周年庆）
  if (event.dynamic) {
    return event.dynamic(year)
  }
  // 公历固定日期
  if (event.solarMonth && event.solarDay) {
    return new Date(year, event.solarMonth - 1, event.solarDay, 12, 0, 0)
  }
  return null
}

/**
 * 获取最近的活动倒计时（氪金 + 白嫖各一个）
 * @returns {{ paid: {name: string, type: string, date: Date, daysLeft: number}|null, free: {name: string, type: string, date: Date, daysLeft: number}|null }}
 */
export function getNextFestivalCountdown() {
  const now = new Date()
  const events = []
  const currentYear = now.getFullYear()

  // 检查今年和明年的活动（覆盖跨年场景）
  for (const event of FESTIVAL_EVENTS) {
    for (const year of [currentYear, currentYear + 1]) {
      const date = getEventDate(event, year)
      if (!date) continue
      const diffMs = date.getTime() - now.getTime()
      const daysLeft = Math.ceil(diffMs / (24 * 60 * 60 * 1000))
      if (daysLeft >= 0) {
        events.push({ name: event.name, type: event.type, date, daysLeft })
      }
    }
  }

  events.sort((a, b) => a.daysLeft - b.daysLeft)

  const paid = events.find((e) => e.type === 'paid') || null
  const free = events.find((e) => e.type === 'free') || null

  return { paid, free }
}