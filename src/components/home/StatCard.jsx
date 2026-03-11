import React from 'react'
import { formatAmount } from '../../utils/helpers'
import { RiCalendarLine, RiCalendarEventLine, RiCalendarCheckLine } from 'react-icons/ri'

/**
 * StatCard - 统计卡片组件
 * 显示今日/本月/本年收支统计
 */
function StatCard() {
  // 统计数据（与截图一致）
  const stats = [
    {
      id: 'today',
      label: '今天',
      date: '2026年03月11日',
      income: 0.00,
      expense: 0.00,
      icon: RiCalendarLine,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500'
    },
    {
      id: 'month',
      label: '本月',
      date: '03月01日-03月31日',
      income: 0.00,
      expense: 10368.90,
      icon: RiCalendarEventLine,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-500'
    },
    {
      id: 'year',
      label: '本年',
      date: '2026年',
      income: 0.00,
      expense: 10368.90,
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

            {/* 右侧收支金额 */}
            <div className="text-right space-y-1">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">总收入</span>
                <span className="font-medium text-income">{stat.income > 0 ? '+' : ''}{formatAmount(stat.income)}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">总支出</span>
                <span className="font-medium text-expense">-{formatAmount(stat.expense)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatCard
