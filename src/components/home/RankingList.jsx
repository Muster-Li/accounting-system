import React from 'react'
import { formatAmount } from '../../utils/helpers'
import ProgressBar from '../common/ProgressBar'
import * as Icons from 'react-icons/ri'

/**
 * RankingList - 支出排行列表组件
 * 显示分类支出排行（带进度条）
 * @param {Array} categoryExpense - 分类支出数据 [{ id, name, icon, color, amount }]
 */
function RankingList({ categoryExpense }) {
  // 处理数据
  const rankings = (categoryExpense || [])
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .map((item, index) => ({
      ...item,
      percentage: 0, // 稍后计算
      rank: index + 1
    }))

  // 计算总支出和百分比
  const totalExpense = rankings.reduce((sum, item) => sum + (item.amount || 0), 0)
  
  rankings.forEach(item => {
    item.percentage = totalExpense > 0 ? ((item.amount || 0) / totalExpense * 100) : 0
  })

  // 获取图标组件
  const getIconComponent = (iconName) => {
    if (!iconName) return Icons.RiMoreLine
    return Icons[iconName] || Icons.RiMoreLine
  }

  // 获取颜色
  const getColor = (color) => {
    return color || '#f97316'
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">本月各分类支出排行</h3>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>总支出 <span className="font-medium text-expense">{formatAmount(totalExpense)}</span></span>
        </div>
      </div>

      {/* 排行列表 */}
      <div className="space-y-4">
        {rankings.length > 0 ? (
          rankings.map((item) => {
            const IconComponent = getIconComponent(item.icon)
            const color = getColor(item.color)
            
            return (
              <div key={item.id || item.rank} className="space-y-2">
                <div className="flex items-center justify-between">
                  {/* 左侧：排名+图标+名称 */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 w-4">{item.rank}</span>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gray-100">
                      <IconComponent className="text-sm" style={{ color }} />
                    </div>
                    <span className="font-medium text-gray-800">{item.name || '未分类'}</span>
                  </div>

                  {/* 右侧：百分比+金额 */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">{item.percentage.toFixed(2)}%</span>
                    <span className="font-medium text-gray-800 min-w-[70px] text-right">{formatAmount(item.amount || 0)}</span>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="ml-7">
                  <ProgressBar 
                    percentage={item.percentage} 
                    color={color} 
                    height={6}
                    animated={true}
                  />
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center text-gray-400 py-8">暂无数据</div>
        )}
      </div>

    </div>
  )
}

export default RankingList
