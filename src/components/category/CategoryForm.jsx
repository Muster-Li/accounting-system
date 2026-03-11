import React, { useState } from 'react'
import Modal from '../common/Modal'
import { RiImageLine } from 'react-icons/ri'

/**
 * CategoryForm - 新增/编辑分类表单组件
 * @param {Object} props
 * @param {boolean} props.isOpen - 是否显示
 * @param {Function} props.onClose - 关闭回调
 * @param {string} props.type - 分类类型 (expense|income)
 * @param {Function} props.onSave - 保存回调
 */
function CategoryForm({ isOpen, onClose, type = 'expense', onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    icon: null
  })

  const [categoryType, setCategoryType] = useState(type)

  // 一级分类选项
  const parentOptions = [
    { id: '', name: '无（作为一级分类）' },
    { id: 1, name: '食品酒水' },
    { id: 2, name: '居家生活' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSave) {
      onSave({ ...formData, type: categoryType })
    }
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="新增分类"
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* 分类类型 */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            分类类型 <span className="text-expense">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="expense"
                checked={categoryType === 'expense'}
                onChange={(e) => setCategoryType(e.target.value)}
                className="text-primary-500 focus:ring-primary-500"
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
                className="text-primary-500 focus:ring-primary-500"
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
            分类名称 <span className="text-expense">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
            required
          />
        </div>

        {/* 分类图标 */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            分类图标 <span className="text-expense">*</span>
          </label>
          <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <RiImageLine className="text-2xl text-gray-400" />
          </div>
        </div>

        {/* 所属一级分类 */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            所属一级分类 <span className="text-expense">*</span>
          </label>
          <select
            value={formData.parentId}
            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm bg-white"
          >
            {parentOptions.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
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
            保存
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CategoryForm
