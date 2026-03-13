/**
 * 常量定义文件
 */

// 导航菜单配置
export const NAV_MENU = [
  {
    id: 'home',
    label: '首页',
    icon: 'RiHomeLine',
    path: 'home'
  },
  {
    id: 'flow',
    label: '流水',
    icon: 'RiBillLine',
    path: 'flow'
  },
  {
    id: 'report',
    label: '报表',
    icon: 'RiPieChartLine',
    path: 'report',
    children: []
  },
  {
    id: 'category',
    label: '分类标签',
    icon: 'RiPriceTag3Line',
    path: 'category',
    children: [
      { id: 'category-manage', label: '收支分类', path: 'category' },
      { id: 'member-manage', label: '成员管理', path: 'member' },
    ]
  }
]

// 分类图标映射
export const CATEGORY_ICONS = {
  '三餐': { icon: 'RiRestaurantLine', color: '#f97316' },
  '餐饮': { icon: 'RiRestaurantLine', color: '#f97316' },
  '美食': { icon: 'RiRestaurantLine', color: '#f97316' },
  '早餐': { icon: 'RiCupLine', color: '#f97316' },
  '中餐': { icon: 'RiRestaurantLine', color: '#f97316' },
  '晚餐': { icon: 'RiRestaurantLine', color: '#f97316' },
  '水果': { icon: 'RiAppleLine', color: '#f97316' },
  '零食': { icon: 'RiCakeLine', color: '#f97316' },
  '买菜': { icon: 'RiShoppingBasketLine', color: '#22c55e' },
  '日用品': { icon: 'RiShoppingBagLine', color: '#f97316' },
  '快递费': { icon: 'RiTruckLine', color: '#3b82f6' },
  '打印费': { icon: 'RiPrinterLine', color: '#8b5cf6' },
  '零食饮料': { icon: 'RiDrinksLine', color: '#f97316' },
  '推广费': { icon: 'RiMegaphoneLine', color: '#ef4444' },
  '出去吃饭': { icon: 'RiRestaurantLine', color: '#f97316' },
  '职业收入': { icon: 'RiBriefcaseLine', color: '#22c55e' },
  '人情收礼': { icon: 'RiGiftLine', color: '#f97316' },
  '其他收入': { icon: 'RiWalletLine', color: '#3b82f6' },
  'D起居': { icon: 'RiHomeLine', color: '#f97316' },
  'A餐饮': { icon: 'RiRestaurantLine', color: '#f97316' },
  'C通勤': { icon: 'RiBusLine', color: '#3b82f6' },
  'B杂项': { icon: 'RiShoppingBagLine', color: '#8b5cf6' },
  'J其他': { icon: 'RiMoreLine', color: '#6b7280' },
}

// 默认分类数据
export const DEFAULT_CATEGORIES = {
  expense: [
    {
      id: 1,
      name: '食品酒水',
      amount: 0,
      children: [
        { id: 11, name: '伙食费', amount: 0 },
        { id: 12, name: '早餐', amount: 0 },
        { id: 13, name: '中餐', amount: 0 },
        { id: 14, name: '晚餐', amount: 0 },
        { id: 15, name: '水果', amount: 0 },
        { id: 16, name: '零食', amount: 0 },
        { id: 17, name: '买菜', amount: 0 },
        { id: 18, name: '柴米油盐', amount: 0 },
        { id: 19, name: '饮料酒水', amount: 0 },
        { id: 20, name: '外出美食', amount: 0 },
      ]
    },
    {
      id: 2,
      name: '居家生活',
      amount: 57.15,
      children: []
    },
  ],
  income: [
    { id: 101, name: '职业收入', amount: 0, children: [] },
    { id: 102, name: '人情收礼', amount: 0, children: [] },
    { id: 103, name: '其他收入', amount: 0, children: [] },
  ]
}

// 成员列表
export const MEMBERS = [
  { id: 'all', name: '所有' },
  { id: 'steve', name: 'Steve' },
  { id: 'qingxia', name: '青霞' },
  { id: 'ruihan', name: '瑞韩' },
]
