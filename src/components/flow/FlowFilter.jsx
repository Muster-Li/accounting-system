import React, { useState } from 'react'
import { RiCalendarLine, RiFilter3Line, RiSearchLine, RiDownloadLine } from 'react-icons/ri'

/**
 * FlowFilter - 流水页筛选栏组件
 */
function FlowFilter() {
  const [timeRange, setTimeRange] = useState('3月')
  const [dimension, setDimension] = useState('day')

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        {/* 左侧筛选 */}
        <div className="flex items-center gap-4">
          {/* 时间选择 */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100">
              <RiCalendarLine />
              <span>2026年</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary-500 bg-primary-50 rounded-lg font-medium">
              {timeRange}
            </button>
          </div>

          {/* 汇总维度 */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>汇总：</span>
            <select 
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 rounded-lg border-none text-gray-700 cursor-pointer"
            >
              <option value="day">日</option>
              <option value="week">周</option>
              <option value="month">月</option>
            </select>
          </div>
        </div>

        {/* 右侧操作 */}
        <div className="flex items-center gap-3">
          {/* 搜索 */}
          <div className="relative">
            <input
              type="text"
              placeholder="搜索"
              className="pl-9 pr-4 py-1.5 text-sm bg-gray-50 rounded-lg border-none w-48"
            />
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* 筛选按钮 */}
          <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary-500 border border-primary-200 rounded-lg hover:bg-primary-50">
            <RiFilter3Line />
            <span>筛选</span>
          </button>

          {/* 批量操作 */}
          <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary-500 border border-primary-200 rounded-lg hover:bg-primary-50">
            <span>批量操作</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default FlowFilter
