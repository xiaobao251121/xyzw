/**
 * 统一的动作元数据注册表
 * 功能配置和日常任务系统共用此注册表，
 * 确保两个页面的功能列表完全一致。
 *
 * 每个动作定义：
 * - label: 显示名称
 * - group: 所属分组 key
 * - params: 可配置的参数列表
 *   - key: 参数名（对应后端 GameActions.actions 的 params 字段）
 *   - label: 参数显示名
 *   - type: 'number' | 'select' | 'switch'
 *   - default: 默认值
 *   - min/max: number 类型的范围
 *   - options: select 类型的选项 [{label, value}]
 * - requiresActivity: 是否需要活动开启
 * - activity: 对应的活动名称 key
 * - actionType: 'normal' | 'helperModal' | 'legacyGift' | 'wecomPush' | 'warGuess'
 *   用于前端区分点击行为（普通执行 vs 弹窗配置 vs 特殊弹窗）
 */

// 分组定义
export const actionGroups = [
  { name: 'daily', label: '日常' },
  { name: 'dungeon', label: '副本' },
  { name: 'baoku', label: '宝库' },
  { name: 'weirdTower', label: '怪异塔' },
  { name: 'resource', label: '资源' },
  { name: 'legacy', label: '功法' },
  { name: 'monthly', label: '月度' },
]

/**
 * 完整的动作注册表
 * key = 动作名（对应后端 GameActions.actions 的 key）
 */
export const actionRegistry = {
  // ======================== 日常 ========================
  claimHangUpRewards: {
    label: '领取挂机',
    group: 'daily',
    params: [],
  },
  batchAddHangUpTime: {
    label: '一键加钟',
    group: 'daily',
    params: [],
  },
  resetBottles: {
    label: '重置罐子',
    group: 'daily',
    params: [],
  },
  batchlingguanzi: {
    label: '一键领取罐子',
    group: 'daily',
    params: [],
  },
  batchclubsign: {
    label: '一键俱乐部签到',
    group: 'daily',
    params: [],
  },
  batchStudy: {
    label: '一键答题',
    group: 'daily',
    params: [],
  },
  batcharenafight: {
    label: '一键竞技场战斗',
    group: 'daily',
    requiresActivity: true,
    activity: 'arena',
    params: [
      { key: 'count', label: '战斗次数', type: 'number', default: 3, min: 1, max: 10 },
    ],
  },
  batchSmartSendCar: {
    label: '智能发车',
    group: 'daily',
    requiresActivity: true,
    activity: 'car',
    params: [
      { key: 'carMinColor', label: '最低品质', type: 'select', default: 1,
        options: [
          { label: '不限', value: 0 },
          { label: '绿色', value: 1 },
          { label: '蓝色', value: 2 },
          { label: '紫色', value: 3 },
          { label: '橙色', value: 4 },
        ] },
    ],
  },
  batchClaimCars: {
    label: '一键收车',
    group: 'daily',
    requiresActivity: true,
    activity: 'car',
    params: [],
  },
  store_purchase: {
    label: '一键黑市采购',
    group: 'daily',
    params: [
      { key: 'goodsId', label: '物品ID', type: 'number', default: 1, min: 1 },
    ],
  },
  collection_claimfreereward: {
    label: '一键领取珍宝阁',
    group: 'daily',
    params: [],
  },
  gacha_drawreward: {
    label: '一键免费扭蛋',
    group: 'daily',
    params: [
      { key: 'num', label: '抽取次数', type: 'number', default: 1, min: 1, max: 10 },
      { key: 'isGroup', label: '是否十连', type: 'switch', default: false },
    ],
  },
  pkroom_appoint: {
    label: '比赛订阅-领取666金砖',
    group: 'daily',
    params: [],
  },
  activity_buystoregoods: {
    label: '招募周领取免费招募令',
    group: 'daily',
    params: [
      { key: 'activityId', label: '活动ID', type: 'number', default: 6 },
      { key: 'buyNum', label: '购买数量', type: 'number', default: 1, min: 1 },
      { key: 'goodsIndex', label: '商品索引', type: 'number', default: 0 },
    ],
  },
  batchGenieSweep: {
    label: '一键灯神扫荡',
    group: 'daily',
    params: [
      { key: 'genieId', label: '灯神ID', type: 'number', default: 1, min: 1, max: 5 },
    ],
  },

  // ======================== 副本 ========================
  climbTower: {
    label: '一键爬塔',
    group: 'dungeon',
    params: [],
  },
  batchmengjing: {
    label: '一键梦境',
    group: 'dungeon',
    requiresActivity: true,
    activity: 'mengjing',
    params: [],
  },
  skinChallenge: {
    label: '一键换皮闯关',
    group: 'dungeon',
    params: [],
  },
  batchClaimPeachTasks: {
    label: '一键领取蟠桃园任务',
    group: 'dungeon',
    params: [],
  },
  batchBuyDreamItems: {
    label: '一键购买梦境商品',
    group: 'dungeon',
    requiresActivity: true,
    activity: 'mengjing',
    params: [],
  },

  // ======================== 宝库 ========================
  batchbaoku13: {
    label: '一键宝库前3层',
    group: 'baoku',
    requiresActivity: true,
    activity: 'baoku',
    params: [],
  },
  batchbaoku45: {
    label: '一键宝库4,5层',
    group: 'baoku',
    requiresActivity: true,
    activity: 'baoku',
    params: [],
  },

  // ======================== 怪异塔 ========================
  climbWeirdTower: {
    label: '一键爬怪异塔',
    group: 'weirdTower',
    requiresActivity: true,
    activity: 'weirdTower',
    params: [],
  },
  batchUseItems: {
    label: '一键使用怪异塔道具',
    group: 'weirdTower',
    requiresActivity: true,
    activity: 'weirdTower',
    params: [],
  },
  batchMergeItems: {
    label: '一键怪异塔合成',
    group: 'weirdTower',
    requiresActivity: true,
    activity: 'weirdTower',
    params: [
      { key: 'actType', label: '合成类型', type: 'select', default: 1,
        options: [
          { label: '普通', value: 1 },
          { label: '高级', value: 2 },
        ] },
    ],
  },
  batchClaimFreeEnergy: {
    label: '一键领取怪异塔免费道具',
    group: 'weirdTower',
    requiresActivity: true,
    activity: 'weirdTower',
    params: [],
  },

  // ======================== 资源 ========================
  batchOpenBox: {
    label: '批量开箱',
    group: 'resource',
    params: [
      { key: 'itemId', label: '物品ID', type: 'number', default: 2001 },
      { key: 'number', label: '数量', type: 'number', default: 10, min: 1, max: 100 },
    ],
  },
  batchOpenBoxByPoints: {
    label: '按积分开箱',
    group: 'resource',
    params: [],
  },
  batchClaimBoxPointReward: {
    label: '领取宝箱积分',
    group: 'resource',
    params: [],
  },
  batchFish: {
    label: '批量钓鱼',
    group: 'resource',
    params: [
      { key: 'lotteryNumber', label: '抽奖次数', type: 'number', default: 1, min: 1, max: 100 },
      { key: 'type', label: '抽奖类型', type: 'select', default: 1,
        options: [
          { label: '普通', value: 1 },
          { label: '高级', value: 2 },
        ] },
    ],
  },
  batchRecruit: {
    label: '批量招募',
    group: 'resource',
    params: [
      { key: 'recruitNumber', label: '招募次数', type: 'number', default: 1, min: 1, max: 10 },
      { key: 'recruitType', label: '招募类型', type: 'select', default: 3,
        options: [
          { label: '普通', value: 1 },
          { label: '高级', value: 2 },
          { label: '超级', value: 3 },
        ] },
      { key: 'byClub', label: '仅俱乐部', type: 'switch', default: false },
    ],
  },
  batchHeroUpgrade: {
    label: '一键英雄升星',
    group: 'resource',
    params: [],
  },
  batchBookUpgrade: {
    label: '一键图鉴升星',
    group: 'resource',
    params: [],
  },
  batchClaimStarRewards: {
    label: '一键领取图鉴奖励',
    group: 'resource',
    params: [],
  },
  legion_storebuygoods: {
    label: '一键购买四圣碎片',
    group: 'resource',
    params: [],
  },
  legionStoreBuySkinCoins: {
    label: '一键购买俱乐部5皮肤币',
    group: 'resource',
    params: [],
  },

  // ======================== 功法 ========================
  batchLegacyClaim: {
    label: '批量功法残卷领取',
    group: 'legacy',
    params: [],
  },
  batchLegacyGiftSendEnhanced: {
    label: '批量功法残卷赠送',
    group: 'legacy',
    params: [],
  },

  // ======================== 月度 ========================
  batchTopUpFish: {
    label: '一键钓鱼补齐',
    group: 'monthly',
    params: [],
  },
  batchTopUpArena: {
    label: '一键竞技场补齐',
    group: 'monthly',
    requiresActivity: true,
    activity: 'arena',
    params: [],
  },
  batchWarGuessCheer: {
    label: '月赛助威',
    group: 'monthly',
    requiresActivity: true,
    activity: 'warGuess',
    params: [],
  },
}

/**
 * 获取指定分组的所有动作
 * @param {string} groupName - 分组名称
 * @returns {Array<{name: string, label: string, ...}>}
 */
export function getActionsByGroup(groupName) {
  return Object.entries(actionRegistry)
    .filter(([, meta]) => meta.group === groupName)
    .map(([name, meta]) => ({ name, ...meta }))
}

/**
 * 获取所有动作（用于功能配置下拉列表）
 * @returns {Array<{value: string, label: string, group: string, ...}>}
 */
export function getAllActions() {
  return Object.entries(actionRegistry).map(([name, meta]) => ({
    value: name,
    label: meta.label,
    group: meta.group,
    params: meta.params,
    requiresActivity: meta.requiresActivity || false,
    activity: meta.activity || null,
  }))
}

/**
 * 获取分组后的所有动作
 * @returns {Object} { groupName: [{value, label, params, ...}, ...] }
 */
export function getGroupedActions() {
  const groups = {}
  for (const group of actionGroups) {
    groups[group.name] = getActionsByGroup(group.name).map(a => ({
      value: a.name,
      label: a.label,
      params: a.params,
      requiresActivity: a.requiresActivity || false,
      activity: a.activity || null,
    }))
  }
  return groups
}

/**
 * 获取指定动作的元数据
 * @param {string} actionName
 * @returns {object|null}
 */
export function getActionMeta(actionName) {
  return actionRegistry[actionName] || null
}

/**
 * 构建动作的默认参数对象
 * @param {string} actionName
 * @returns {object}
 */
export function getDefaultParams(actionName) {
  const meta = actionRegistry[actionName]
  if (!meta || !meta.params) return {}
  const params = {}
  for (const p of meta.params) {
    if (p.default !== undefined) {
      params[p.key] = p.default
    }
  }
  return params
}
