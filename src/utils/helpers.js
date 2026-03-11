/**
 * 工具函数文件
 */

import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

/**
 * 格式化金额显示
 * @param {number} amount - 金额
 * @returns {string} 格式化后的金额字符串
 */
export const formatAmount = (amount) => {
  if (amount === 0) return '0.00'
  const num = Number(amount)
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * 格式化日期显示
 * @param {Date|string} date - 日期
 * @param {string} pattern - 格式化模式
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, pattern = 'yyyy-MM-dd HH:mm') => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, pattern, { locale: zhCN })
}

/**
 * 格式化日期为中文显示
 * @param {Date|string} date - 日期
 * @returns {string} 格式化后的中文日期
 */
export const formatDateCN = (date) => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MM月dd日 EEEE', { locale: zhCN })
}

/**
 * 获取当前时间字符串
 * @returns {string} 当前时间字符串
 */
export const getCurrentTime = () => {
  return format(new Date(), 'yyyy-MM-dd HH:mm:ss')
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 计算百分比
 * @param {number} value - 当前值
 * @param {number} total - 总值
 * @returns {string} 百分比字符串
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return '0.00%'
  const percentage = (value / total) * 100
  return percentage.toFixed(2) + '%'
}

/**
 * 生成每日收支数据
 * @returns {Object} 图表数据
 */
export const generateDailyChartData = () => {
  const days = []
  const incomeData = []
  const expenseData = []
  
  // 生成3月份的日期数据
  for (let i = 1; i <= 31; i++) {
    days.push(`03.${i.toString().padStart(2, '0')}`)
    
    // 模拟数据：3月2日有一笔大额支出
    if (i === 2) {
      expenseData.push(7500)
    } else if (i >= 3 && i <= 11) {
      // 3月3-11日有小额支出
      expenseData.push(Math.floor(Math.random() * 500) + 100)
    } else {
      expenseData.push(0)
    }
    
    incomeData.push(0)
  }
  
  return { days, incomeData, expenseData }
}

/**
 * 生成分类支出排行数据
 * @returns {Array} 排行数据
 */
export const generateCategoryRanking = () => {
  const total = 10368.90
  return [
    { id: 1, name: 'D起居', amount: 7521.88, percentage: 72.54, color: '#f97316' },
    { id: 2, name: 'A餐饮', amount: 1278.24, percentage: 12.33, color: '#f97316' },
    { id: 3, name: 'C通勤', amount: 873.27, percentage: 8.42, color: '#3b82f6' },
    { id: 4, name: 'B杂项', amount: 360.36, percentage: 3.48, color: '#8b5cf6' },
    { id: 5, name: 'J其他', amount: 160.00, percentage: 1.54, color: '#6b7280' },
  ]
}

/**
 * 生成成员收支数据
 * @returns {Array} 成员数据
 */
export const generateMemberStats = () => {
  return [
    { id: 'qingxia', name: '青霞', income: 0, expense: 1634.77, avatar: 'bg-pink-400' },
    { id: 'ruihan', name: '瑞韩', income: 0, expense: 8734.13, avatar: 'bg-blue-400' },
  ]
}

/**
 * 生成分类收入数据
 * @returns {Array} 收入数据
 */
export const generateIncomeCategories = () => {
  return [
    { id: 1, name: '职业收入', amount: 0, count: 0 },
    { id: 2, name: '人情收礼', amount: 0, count: 0 },
    { id: 3, name: '其他收入', amount: 0, count: 0 },
  ]
}

/**
 * 节流函数
 * @param {Function} fn - 要节流的函数
 * @param {number} delay - 延迟时间
 * @returns {Function} 节流后的函数
 */
export const throttle = (fn, delay) => {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

/**
 * 防抖函数
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟时间
 * @returns {Function} 防抖后的函数
 */
export const debounce = (fn, delay) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
