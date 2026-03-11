import React from 'react'
import { formatAmount, calculatePercentage } from '../../utils/helpers'
import ProgressBar from '../common/ProgressBar'
import { 
  RiHomeLine, 
  RiRestaurantLine, 
  RiBusLine, 
  RiShoppingBagLine,
  RiMoreLine
} from 'react-icons/ri'

/**
 * RankingList - 支出排行列表组件
 * 显示分类支出排行（带进度条）
 */
function RankingList() {
  // 排行数据（与截图一致）
  const rankings = [
    { id: 1, name: 'D起居', amount: 7521.88, percentage: 72.54, color: '#f97316', icon: RiHomeLine },
    { id: 2, name: 'A餐饮', amount: 1278.24, percentage: 12.33, color: '#f97316', icon: RiRestaurantLine },
    { id: 3, name: 'C通勤', amount: 873.27, percentage: 8.42, color: '#3b82f6', icon: RiBusLine },
    { id: 4, name: 'B杂项', amount: 360.36, percentage: 3.48, color: '#8b5cf6', icon: RiShoppingBagLine },
    { id: 5, name: 'J其他', amount: 160.00, percentage: 1.54, color: '#6b7280', icon: RiMoreLine },
  ]

  const totalExpense = 10368.90
  const recordCount = 56

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">本月各分类支出排行</h3>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>记账笔数 <span className="font-medium text-gray-800">{recordCount}</span></span>
          <span>总支出 <span className="font-medium text-expense">{formatAmount(totalExpense)}</span></span>
        </div>
      </div>

      {/* 排行列表 */}
      <div className="space-y-4">
        {rankings.map((item, index) => (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center justify-between">
              {/* 左侧：排名+图标+名称 */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 w-4">{index + 1}</span>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center bg-gray-100`}>
                  <item.icon className="text-sm" style={{ color: item.color }} />
                </div>
                <span className="font-medium text-gray-800">{item.name}</span>
              </div>

              {/* 右侧：百分比+金额 */}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">{item.percentage.toFixed(2)}%</span>
                <span className="font-medium text-gray-800 min-w-[70px] text-right">{formatAmount(item.amount)}</span>
              </div>
            </div>

            {/* 进度条 */}
            <div className="ml-7">
              <ProgressBar 
                percentage={item.percentage} 
                color={item.color} 
                height={6}
                animated={true}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 展开更多 */}
      <div className="mt-4 text-center">
        <button className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto">
          点击展开
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default RankingList
