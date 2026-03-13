import { useState } from 'react'
import CategoryTree from '../components/category/CategoryTree'
import CategoryForm from '../components/category/CategoryForm'
import ConfirmModal from '../components/common/ConfirmModal'
import { RiAddLine } from 'react-icons/ri'
import { useCategories } from '../hooks/useDatabase.js'

/**
 * CategoryPage - 分类管理页组件
 * 管理收支分类
 */
function CategoryPage() {
  // 当前选中的标签
  const [activeTab, setActiveTab] = useState('expense')
  // 是否显示分类表单弹窗
  const [showFormModal, setShowFormModal] = useState(false)
  // 当前编辑的分类数据
  const [editingCategory, setEditingCategory] = useState(null)
  // 是否显示删除确认弹窗
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  // 待删除的分类
  const [deletingCategory, setDeletingCategory] = useState(null)

  // 获取分类数据操作函数（CRUD 方法已自动更新缓存和state）
  const { categories, createCategory, editCategory, removeCategory } = useCategories()

  // 标签配置
  const tabs = [
    { id: 'expense', label: '支出类型' },
    { id: 'income', label: '收入类型' },
  ]

  // 处理新增分类
  const handleAdd = () => {
    setEditingCategory(null)
    setShowFormModal(true)
  }

  // 处理编辑分类
  const handleEdit = (category) => {
    setEditingCategory(category)
    setShowFormModal(true)
  }

  // 处理删除分类
  const handleDelete = (category) => {
    setDeletingCategory(category)
    setShowDeleteConfirm(true)
  }

  // 确认删除（removeCategory 已自动更新缓存和state）
  const confirmDelete = async () => {
    if (deletingCategory) {
      try {
        await removeCategory(deletingCategory.id)
      } catch (error) {
        console.error('删除分类失败:', error)
        alert('删除失败: ' + (error.message || '未知错误'))
      }
    }
    setDeletingCategory(null)
  }

  // 保存分类（新增或编辑，CRUD方法已自动更新缓存和state）
  const handleSave = async (data) => {
    try {
      if (editingCategory) {
        // 编辑模式
        await editCategory(editingCategory.id, data)
      } else {
        // 新增模式
        await createCategory(data)
      }
      // 关闭弹窗
      setShowFormModal(false)
      setEditingCategory(null)
    } catch (error) {
      console.error('保存分类失败:', error)
      alert('保存失败: ' + (error.message || '未知错误'))
    }
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">收支分类管理</h1>
          <p className="text-gray-500 text-sm mt-1">管理您的收支分类</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <RiAddLine />
          <span>新增分类</span>
        </button>
      </div>

      {/* 内容区域 */}
      <div className="space-y-4">
        {/* 标签切换 */}
        <div className="flex items-center gap-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
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

        {/* 分类列表 */}
        <CategoryTree 
          type={activeTab} 
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* 分类表单弹窗（新增/编辑共用） */}
      {showFormModal && (
        <CategoryForm
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false)
            setEditingCategory(null)
          }}
          type={activeTab}
          initialData={editingCategory}
          onSave={handleSave}
        />
      )}

      {/* 删除确认弹窗 */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setDeletingCategory(null)
        }}
        onConfirm={confirmDelete}
        title="删除分类"
        message={`确定要删除分类"${deletingCategory?.name}"吗？此操作不可恢复。`}
        confirmText="确认删除"
        type="danger"
      />
    </div>
  )
}

export default CategoryPage
