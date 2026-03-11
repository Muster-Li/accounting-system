import React from 'react'
import FlowHeader from '../components/flow/FlowHeader'
import FlowFilter from '../components/flow/FlowFilter'
import FlowTable from '../components/flow/FlowTable'

/**
 * FlowPage - 流水页组件
 * 显示收支流水明细列表
 */
function FlowPage() {
  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">流水列表</h1>
        <p className="text-gray-500 text-sm mt-1">查看所有记账记录</p>
      </div>

      {/* 内容区域 */}
      <div className="space-y-4">
        {/* 汇总栏 */}
        <FlowHeader />

        {/* 筛选栏 */}
        <FlowFilter />

        {/* 流水表格 */}
        <FlowTable />
      </div>
    </div>
  )
}

export default FlowPage
