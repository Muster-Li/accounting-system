import React from 'react'
import { formatAmount } from '../../utils/helpers'
import * as Icons from 'react-icons/ri'

/**
 * IncomeCategories - 分类收入统计组件
 * @param {Array} categoryIncome - 收入分类数据 [{ id, name, icon, color, amount, count }]
 */
function IncomeCategories({ categoryIncome }) {
  // 处理数据
  const incomeData = (categoryIncome || [])

  // 计算总收入和笔数
  const totalIncome = incomeData.reduce((sum, item) => sum + (item.amount || 0), 0)
  const totalCount = incomeData.reduce((sum, item) => sum + (item.count || 0), 0)

  // 获取图标组件
  const getIconComponent = (iconName) => {
    if (!iconName) return Icons.RiWalletLine
    return Icons[iconName] || Icons.RiWalletLine
  }

  // 获取颜色
  const getColor = (color) => {
    return color || '#22c55e'
  }

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
        {incomeData.length > 0 ? (
          incomeData.map(item => {
            const IconComponent = getIconComponent(item.icon)
            const color = getColor(item.color)
            
            return (
              <div 
                key={item.id}
                className="flex items-center justify-between py-2"
              >
                {/* 左侧：图标+名称 */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                    <IconComponent className="text-xl" style={{ color }} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{item.name || '未分类'}</p>
                    <p className="text-xs text-gray-400">收入类型</p>
                  </div>
                </div>

                {/* 右侧：笔数+金额 */}
                <div className="text-right">
                  <p className="text-xs text-gray-400">收入笔数 {item.count || 0}</p>
                  <p className="font-medium text-gray-800">总收入 {formatAmount(item.amount || 0)}</p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center text-gray-400 py-8">暂无收入数据</div>
        )}
      </div>
    </div>
  )
}

export default IncomeCategories
