import React, { useState } from 'react'
import CategoryTree from '../components/category/CategoryTree'
import CategoryForm from '../components/category/CategoryForm'
import { RiAddLine } from 'react-icons/ri'

/**
 * CategoryPage - 分类管理页组件
 * 管理收支分类
 */
function CategoryPage() {
  // 当前选中的标签
  const [activeTab, setActiveTab] = useState('expense')
  // 是否显示隐藏分类
  const [showHidden, setShowHidden] = useState(false)
  // 是否显示新增弹窗
  const [showAddModal, setShowAddModal] = useState(false)

  // 标签配置
  const tabs = [
    { id: 'expense', label: '支出类型' },
    { id: 'income', label: '收入类型' },
  ]

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">收支分类管理</h1>
          <p className="text-gray-500 text-sm mt-1">管理您的收支分类</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <RiAddLine />
          <span>新增分类</span>
        </button>
      </div>

      {/* 内容区域 */}
      <div className="space-y-4">
        {/* 标签和筛选 */}
        <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-sm font-medium transition-colors relative pb-2 ${
                  activeTab === tab.id 
                    ? 'text-primary-500' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* 显示隐藏分类 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showHidden}
              onChange={(e) => setShowHidden(e.target.checked)}
              className="w-4 h-4 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600">显示已隐藏的分类</span>
          </label>
        </div>

        {/* 分类列表 */}
        <CategoryTree type={activeTab} />
      </div>

      {/* 新增分类弹窗 */}
      {showAddModal && (
        <CategoryForm
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          type={activeTab}
          onSave={(data) => {
            console.log('新增分类:', data)
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}

export default CategoryPage
