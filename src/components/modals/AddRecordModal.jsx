import React, { useState, useEffect, useMemo } from 'react'
import { RiCloseLine, RiCheckLine, RiArrowRightSLine } from 'react-icons/ri'
import { useCategories, useMembers } from '../../hooks/useDatabase.js'
import CategorySelector from '../common/CategorySelector.jsx'

/**
 * AddRecordModal - 记一笔弹窗组件
 * 使用缓存的分类和成员数据
 * 分类采用二级联动选择器（图片样式）
 * @param {Object} props
 * @param {boolean} props.isOpen - 是否显示
 * @param {Function} props.onClose - 关闭回调
 * @param {Object} props.initialData - 编辑时的初始数据
 * @param {Function} props.onSubmit - 创建提交回调
 * @param {Function} props.onUpdate - 更新提交回调
 * @param {number} props.editingId - 编辑的账单ID
 */
function AddRecordModal({ isOpen, onClose, initialData, onSubmit, onUpdate, editingId }) {
  const isEditing = !!initialData

  // 当前选中的标签
  const [activeTab, setActiveTab] = useState(initialData?.type || 'expense')

  // 表单数据
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    subCategoryId: '',
    categoryName: '',
    subCategoryName: '',
    memberId: '',
    memberName: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    project: '',
    note: '',
  })

  // 显示分类选择器
  const [showCategorySelector, setShowCategorySelector] = useState(false)

  // 成功提示状态
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // 从缓存获取分类和成员数据
  const { categories, loading: categoriesLoading } = useCategories()
  const { members, loading: membersLoading } = useMembers()

  // 成员下拉数据
  const activeMembers = useMemo(() => {
    return members.filter(m => m.isActive !== false)
  }, [members])

  // 标签配置
  const tabs = [
    { id: 'expense', label: '支出' },
    { id: 'income', label: '收入' },
  ]

  // 初始化表单数据
  useEffect(() => {
    if (initialData) {
      setActiveTab(initialData.type || 'expense')
      setFormData({
        amount: initialData.amount?.toString() || '',
        categoryId: initialData.categoryId?.toString() || '',
        subCategoryId: initialData.subCategoryId?.toString() || '',
        categoryName: initialData.category?.name || '',
        subCategoryName: initialData.subCategory?.name || '',
        memberId: initialData.memberId?.toString() || '',
        memberName: initialData.member?.name || '',
        date: initialData.billDate || new Date().toISOString().split('T')[0],
        time: initialData.billTime || new Date().toTimeString().slice(0, 5),
        project: initialData.project || '',
        note: initialData.note || '',
      })
    } else {
      // 重置表单
      setActiveTab('expense')
      setFormData({
        amount: '',
        categoryId: '',
        subCategoryId: '',
        categoryName: '',
        subCategoryName: '',
        memberId: '',
        memberName: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        project: '',
        note: '',
      })
    }
    // 清除成功提示
    setShowSuccess(false)
    setShowCategorySelector(false)
  }, [initialData, isOpen])

  // 当标签切换时，清空分类选择（因为不同类型分类不同）
  const handleTabChange = (tabId) => {
    if (isEditing) return
    setActiveTab(tabId)
    setFormData(prev => ({
      ...prev,
      categoryId: '',
      subCategoryId: '',
      categoryName: '',
      subCategoryName: '',
    }))
  }

  // 处理分类选择
  const handleCategorySelect = (selection) => {
    setFormData(prev => ({
      ...prev,
      categoryId: selection.categoryId,
      subCategoryId: selection.subCategoryId,
      categoryName: selection.categoryName,
      subCategoryName: selection.subCategoryName,
    }))
    setShowCategorySelector(false)
  }

  // 处理成员选择
  const handleMemberChange = (memberId) => {
    const member = members.find(m => m.id.toString() === memberId)
    setFormData(prev => ({
      ...prev,
      memberId: memberId,
      memberName: member?.name || '',
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 验证必填项
    if (!formData.categoryId) {
      alert('请选择分类')
      return
    }
    if (!formData.memberId) {
      alert('请选择成员')
      return
    }

    try {
      const submitData = {
        type: activeTab,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId),
        subCategoryId: formData.subCategoryId ? parseInt(formData.subCategoryId) : null,
        memberId: parseInt(formData.memberId),
        billDate: formData.date,
        billTime: formData.time || null,
        project: formData.project,
        note: formData.note,
      }

      if (isEditing && editingId && onUpdate) {
        await onUpdate(editingId, submitData)
      } else if (onSubmit) {
        await onSubmit(submitData)
      } else {
        console.error('Submit failed:', { isEditing, editingId, hasOnUpdate: !!onUpdate, hasOnSubmit: !!onSubmit })
        throw new Error('提交函数未定义')
      }

      // 显示成功提示
      setSuccessMessage(isEditing ? '修改成功！' : '保存成功！')
      setShowSuccess(true)

      // 1.5秒后关闭弹窗
      setTimeout(() => {
        setShowSuccess(false)
        onClose()
      }, 1500)

    } catch (error) {
      console.error('Submit error:', error)
      alert('保存失败: ' + (error.message || '未知错误'))
    }
  }

  const loading = categoriesLoading || membersLoading

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* 成功提示 */}
      {showSuccess && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-60">
          <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
            <RiCheckLine className="text-2xl" />
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* 分类选择器弹窗 */}
      {showCategorySelector && (
        <CategorySelector
          categories={categories}
          type={activeTab}
          selectedCategoryId={formData.categoryId ? parseInt(formData.categoryId) : null}
          selectedSubCategoryId={formData.subCategoryId ? parseInt(formData.subCategoryId) : null}
          onSelect={handleCategorySelect}
          onClose={() => setShowCategorySelector(false)}
        />
      )}

      {/* 主弹窗内容 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-blue-600">
            {isEditing ? '编辑账单' : '记一笔'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        {/* 标签切换 */}
        <div className="flex border-b border-gray-100">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              disabled={isEditing}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              } ${isEditing ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-4">
          {loading ? (
            <div className="py-8 text-center text-gray-500">
              <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-2 text-sm">加载中...</p>
            </div>
          ) : (
            <>
              {/* 分类选择（图片样式） */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  分类 <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() => setShowCategorySelector(true)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {formData.categoryName ? (
                      <>
                        <span className="text-gray-800">{formData.categoryName}</span>
                        {formData.subCategoryName && (
                          <>
                            <RiArrowRightSLine className="text-gray-400" />
                            <span className="text-gray-600">{formData.subCategoryName}</span>
                          </>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">请选择分类</span>
                    )}
                  </div>
                  <RiArrowRightSLine className="text-gray-400" />
                </div>
              </div>

              {/* 金额 */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  金额 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="请输入金额"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              {/* 成员 */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  成员 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.memberId}
                  onChange={(e) => handleMemberChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm bg-white"
                  required
                >
                  <option value="">请选择成员</option>
                  {activeMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>

              {/* 日期和时间 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">时间</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* 项目 */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">项目</label>
                <input
                  type="text"
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  placeholder="请输入项目名称"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* 备注 */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">备注</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="请输入备注"
                    maxLength={100}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    {formData.note.length}/100
                  </span>
                </div>
              </div>

              {/* 按钮 */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={showSuccess}
                  className={`w-full py-3 text-sm font-medium text-white rounded-lg transition-colors ${
                    showSuccess
                      ? 'bg-green-500 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {showSuccess ? '保存成功' : (isEditing ? '保存修改' : '保存')}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

export default AddRecordModal
