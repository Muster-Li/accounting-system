import React from 'react'
import { formatAmount } from '../../utils/helpers'
import { RiCalendarLine, RiCalendarEventLine, RiCalendarCheckLine } from 'react-icons/ri'

/**
 * StatCard - 统计卡片组件
 * 显示今日/本月/本年收支统计
 * @param {Object} today - 今日数据 { income, expense }
 * @param {Object} month - 本月数据 { income, expense }
 * @param {Object} year - 本年数据 { income, expense }
 */
function StatCard({ today, month, year }) {
  // 获取当前日期信息
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0')
  const currentDate = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })

  // 默认数据
  const defaultData = { income: 0, expense: 0 }
  
  const todayData = today || defaultData
  const monthData = month || defaultData
  const yearData = year || defaultData

  const stats = [
    {
      id: 'today',
      label: '今天',
      date: currentDate,
      income: todayData.income || 0,
      expense: todayData.expense || 0,
      icon: RiCalendarLine,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500'
    },
    {
      id: 'month',
      label: '本月',
      date: `${currentMonth}月01日-${currentMonth}月31日`,
      income: monthData.income || 0,
      expense: monthData.expense || 0,
      icon: RiCalendarEventLine,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-500'
    },
    {
      id: 'year',
      label: '本年',
      date: `${currentYear}年`,
      income: yearData.income || 0,
      expense: yearData.expense || 0,
      icon: RiCalendarCheckLine,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-500'
    }
  ]

  return (
    <div className="space-y-3">
      {stats.map(stat => (
        <div 
          key={stat.id}
          className="bg-white rounded-xl p-4 shadow-sm card-hover border border-gray-100"
        >
          <div className="flex items-center justify-between">
            {/* 左侧图标和信息 */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`text-xl ${stat.iconColor}`} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{stat.label}</p>
                <p className="text-xs text-gray-400">{stat.date}</p>
              </div>
            </div>

            {/* 右侧收支金额 - 支出在上面 */}
            <div className="text-right space-y-1">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">支出</span>
                <span className="font-medium text-expense">-{formatAmount(stat.expense)}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">收入</span>
                <span className="font-medium text-income">{stat.income > 0 ? '+' : ''}{formatAmount(stat.income)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatCard
