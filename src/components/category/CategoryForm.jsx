import { useState, useEffect, useMemo } from 'react'
import Modal from '../common/Modal'
import IconSelector from '../common/IconSelector'
import { useCategories } from '../../hooks/useDatabase.js'

/**
 * CategoryForm - 新增/编辑分类表单组件
 * @param {Object} props
 * @param {boolean} props.isOpen - 是否显示
 * @param {Function} props.onClose - 关闭回调
 * @param {string} props.type - 分类类型 (expense|income)
 * @param {Function} props.onSave - 保存回调
 * @param {Object} props.initialData - 编辑时的初始数据
 */
function CategoryForm({ isOpen, onClose, type = 'expense', onSave, initialData = null }) {
  const isEditing = !!initialData

  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    icon: ''
  })

  const [categoryType, setCategoryType] = useState(type)

  // 从缓存获取分类数据
  const { categories: allCategories } = useCategories()

  // 获取当前类型的一级分类选项
  const parentOptions = useMemo(() => {
    const typeParents = allCategories.filter(c => 
      c.type === categoryType && !c.parentId
    )
    return [
      { id: '', name: '无（作为一级分类）' },
      ...typeParents.map(c => ({ id: c.id, name: c.name }))
    ]
  }, [allCategories, categoryType])

  // 初始化表单数据（编辑模式）
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        parentId: initialData.parentId || '',
        icon: initialData.icon || ''
      })
      setCategoryType(initialData.type || type)
    } else {
      // 新增模式重置
      setFormData({
        name: '',
        parentId: '',
        icon: ''
      })
      setCategoryType(type)
    }
  }, [initialData, type, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSave) {
      onSave({ 
        ...formData, 
        type: categoryType,
        // 如果 parentId 为空字符串，转为 null
        parentId: formData.parentId || null
      })
    }
    // 由父组件控制弹窗关闭
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? '编辑分类' : '新增分类'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* 分类类型 */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            分类类型 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="expense"
                checked={categoryType === 'expense'}
                onChange={(e) => setCategoryType(e.target.value)}
                disabled={isEditing}
                className="text-primary-500 focus:ring-primary-500 disabled:opacity-50"
              />
              <span className={`text-sm ${categoryType === 'expense' ? 'text-primary-500 font-medium' : 'text-gray-600'}`}>
                支出分类
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="income"
                checked={categoryType === 'income'}
                onChange={(e) => setCategoryType(e.target.value)}
                disabled={isEditing}
                className="text-primary-500 focus:ring-primary-500 disabled:opacity-50"
              />
              <span className={`text-sm ${categoryType === 'income' ? 'text-primary-500 font-medium' : 'text-gray-600'}`}>
                收入分类
              </span>
            </label>
          </div>
        </div>

        {/* 分类名称 */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            分类名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入分类名称"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
            required
          />
        </div>

        {/* 分类图标 */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            分类图标 <span className="text-red-500">*</span>
          </label>
          <IconSelector
            value={formData.icon}
            onChange={(icon) => setFormData({ ...formData, icon })}
            placeholder="请选择图标"
          />
        </div>

        {/* 所属一级分类 */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            所属一级分类
            <span className="text-gray-400 text-xs ml-1">（为空则作为一级分类）</span>
          </label>
          <select
            value={formData.parentId}
            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
            disabled={isEditing}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400"
          >
            {parentOptions.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
          {isEditing && (
            <p className="text-xs text-gray-400 mt-1">编辑时不允许修改所属分类</p>
          )}
        </div>

        {/* 按钮 */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
          >
            {isEditing ? '保存修改' : '保存'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CategoryForm
