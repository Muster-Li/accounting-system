import React from 'react'
import { RiCalendarLine, RiFilter3Line, RiSearchLine } from 'react-icons/ri'

/**
 * FlowFilter - 流水页筛选栏组件
 * @param {Object} props
 * @param {Object} props.filters - 筛选条件
 * @param {Function} props.onFilterChange - 筛选变更回调
 */
function FlowFilter({ filters, onFilterChange }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        {/* 左侧筛选 */}
        <div className="flex items-center gap-4">
          {/* 时间选择 */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onFilterChange({ startDate: e.target.value })}
              className="px-3 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg border-none"
            />
            <span className="text-gray-400">至</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => onFilterChange({ endDate: e.target.value })}
              className="px-3 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg border-none"
            />
          </div>

          {/* 类型筛选 */}
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({ type: e.target.value })}
            className="px-3 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg border-none"
          >
            <option value="">全部类型</option>
            <option value="expense">支出</option>
            <option value="income">收入</option>
          </select>
        </div>

        {/* 右侧操作 */}
        <div className="flex items-center gap-3">
          {/* 搜索 */}
          <div className="relative">
            <input
              type="text"
              placeholder="搜索备注"
              className="pl-9 pr-4 py-1.5 text-sm bg-gray-50 rounded-lg border-none w-48"
            />
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* 筛选按钮 */}
          <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary-500 border border-primary-200 rounded-lg hover:bg-primary-50">
            <RiFilter3Line />
            <span>筛选</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default FlowFilter
