import React from 'react'
import { formatAmount } from '../../utils/helpers'

/**
 * FlowHeader - 流水页顶部汇总栏组件
 * @param {Object} props
 * @param {Object} props.summary - 汇总数据
 */
function FlowHeader({ summary }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-8">
        {/* 结余 */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">结余</span>
          <span className={`text-xl font-bold ${summary.balance < 0 ? 'text-expense' : 'text-income'}`}>
            {summary.balance < 0 ? '' : '+'}{formatAmount(summary.balance)}
          </span>
        </div>

        {/* 收入 */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">收入</span>
          <span className="text-xl font-bold text-income">
            +{formatAmount(summary.income)}
          </span>
        </div>

        {/* 支出 */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">支出</span>
          <span className="text-xl font-bold text-expense">
            -{formatAmount(summary.expense)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default FlowHeader
