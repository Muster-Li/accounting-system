import React from 'react'
import { formatAmount } from '../../utils/helpers'
import { RiBriefcaseLine, RiGiftLine, RiWalletLine } from 'react-icons/ri'

/**
 * IncomeCategories - 分类收入统计组件
 */
function IncomeCategories() {
  // 收入分类数据（与截图一致）
  const incomeData = [
    { 
      id: 1, 
      name: '职业收入', 
      amount: 0, 
      count: 0,
      icon: RiBriefcaseLine,
      color: '#f97316'
    },
    { 
      id: 2, 
      name: '人情收礼', 
      amount: 0, 
      count: 0,
      icon: RiGiftLine,
      color: '#f97316'
    },
    { 
      id: 3, 
      name: '其他收入', 
      amount: 0, 
      count: 0,
      icon: RiWalletLine,
      color: '#3b82f6'
    },
  ]

  const totalCount = 0
  const totalIncome = 0

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">本月分类收入</h3>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>收入笔数 <span className="font-medium text-gray-800">{totalCount}</span></span>
          <span>总收入 <span className="font-medium text-income">{formatAmount(totalIncome)}</span></span>
        </div>
      </div>

      {/* 收入列表 */}
      <div className="space-y-3">
        {incomeData.map(item => (
          <div 
            key={item.id}
            className="flex items-center justify-between py-2"
          >
            {/* 左侧：图标+名称 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                <item.icon className="text-xl" style={{ color: item.color }} />
              </div>
              <div>
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-400">收入类型</p>
              </div>
            </div>

            {/* 右侧：笔数+金额 */}
            <div className="text-right">
              <p className="text-xs text-gray-400">收入笔数 {item.count}</p>
              <p className="font-medium text-gray-800">总收入 {formatAmount(item.amount)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default IncomeCategories
