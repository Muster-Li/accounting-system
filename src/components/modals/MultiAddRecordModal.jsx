import React, { useState, useMemo, useEffect } from 'react'
import { RiCloseLine, RiCheckLine, RiAddLine, RiDeleteBinLine } from 'react-icons/ri'
import CategorySelector from '../common/CategorySelector.jsx'
import { useCategories, useMembers } from '../../hooks/useDatabase.js'
import { createBillsBatch } from '../../../lib/api.js'

/**
 * MultiAddRecordModal - 记多笔弹窗组件
 * 支持批量添加多条账单
 * @param {Object} props
 * @param {boolean} props.isOpen - 是否显示
 * @param {Function} props.onClose - 关闭回调
 * @param {Function} props.onSuccess - 成功回调（传入账单数组）
 */
function MultiAddRecordModal({ isOpen, onClose, onSuccess }) {
  // 当前选中的标签
  const [activeTab, setActiveTab] = useState('expense')

  // 统一日期（默认为今天）
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0])

  // 统一成员（一次记录一个成员的多个账单）
  const [globalMemberId, setGlobalMemberId] = useState('')

  // 账单列表
  const [records, setRecords] = useState([createEmptyRecord()])

  // 成功提示状态
  const [showSuccess, setShowSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  // 弹窗打开时重置所有状态
  useEffect(() => {
    if (isOpen) {
      setActiveTab('expense')
      setBillDate(new Date().toISOString().split('T')[0])
      setGlobalMemberId('')
      setRecords([createEmptyRecord()])
      setShowSuccess(false)
      setSaving(false)
    }
  }, [isOpen])

  // 从缓存获取分类和成员数据
  const { categories } = useCategories()
  const { members } = useMembers()

  // 标签配置
  const tabs = [
    { id: 'expense', label: '支出' },
    { id: 'income', label: '收入' },
  ]

  // 创建空记录
  function createEmptyRecord() {
    return {
      amount: '',
      categoryId: '',
      subCategoryId: '',
      memberId: '',
      project: '',
      note: '',
    }
  }

  // 获取当前类型的一级分类
  const availableCategories = useMemo(() => {
    return categories
      .filter(cat => {
        const isTopLevel = cat.parentId === null || cat.parentId === undefined
        if (!isTopLevel) return false
        return cat.type === activeTab
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [categories, activeTab])

  // 根据选中一级分类获取二级分类
  const getSubCategories = (categoryId) => {
    if (!categoryId) return []
    const selectedId = String(categoryId)
    return categories
      .filter(cat => cat.parentId !== null && cat.parentId !== undefined && String(cat.parentId) === selectedId)
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  // 活跃成员
  const activeMembers = members.filter(m => m.isActive !== false)

  // 切换标签
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    // 清空所有记录的分类
    setRecords(prev => prev.map(r => ({
      ...r,
      categoryId: '',
      subCategoryId: '',
    })))
  }

  // 更新单条记录
  const updateRecord = (index, field, value) => {
    setRecords(prev => {
      const newRecords = [...prev]
      newRecords[index] = { ...newRecords[index], [field]: value }
      return newRecords
    })
  }

  // 处理分类选择
  const handleCategorySelect = (index, { categoryId, subCategoryId }) => {
    updateRecord(index, 'categoryId', categoryId)
    updateRecord(index, 'subCategoryId', subCategoryId || '')
  }

  // 添加新记录
  const addRecord = () => {
    setRecords(prev => [...prev, createEmptyRecord()])
  }

  // 删除记录
  const deleteRecord = (index) => {
    if (records.length <= 1) return
    setRecords(prev => prev.filter((_, i) => i !== index))
  }

  // 验证单条记录
  const validateRecord = (record, index) => {
    if (!record.categoryId) {
      return `第 ${index + 1} 行：请选择分类`
    }
    if (!record.amount || parseFloat(record.amount) <= 0) {
      return `第 ${index + 1} 行：请输入有效金额`
    }
    return null
  }

  // 保存所有记录
  const handleSave = async () => {
    // 验证成员
    if (!globalMemberId) {
      alert('请选择成员')
      return
    }

    // 验证每条记录
    for (let i = 0; i < records.length; i++) {
      const error = validateRecord(records[i], i)
      if (error) {
        alert(error)
        return
      }
    }

    // 检查是否有数据
    const validRecords = records.filter(r => r.amount && r.categoryId)
    if (validRecords.length === 0) {
      alert('请至少填写一条完整的账单记录')
      return
    }

    setSaving(true)
    try {
      const billsToSave = validRecords.map(r => ({
        type: activeTab,
        amount: parseFloat(r.amount),
        categoryId: parseInt(r.categoryId),
        subCategoryId: r.subCategoryId ? parseInt(r.subCategoryId) : null,
        memberId: parseInt(globalMemberId),
        billDate: billDate,
        project: r.project,
        note: r.note,
      }))

      const result = await createBillsBatch(billsToSave)

      if (!result.success) {
        throw new Error(result.error || '保存失败')
      }

      // 显示成功提示
      setShowSuccess(true)

      // 1.5秒后关闭
      setTimeout(() => {
        setShowSuccess(false)
        setRecords([createEmptyRecord()])
        onSuccess(result.data)
        onClose()
      }, 1500)

    } catch (error) {
      console.error('Save error:', error)
      alert('保存失败: ' + (error.message || '未知错误'))
    } finally {
      setSaving(false)
    }
  }

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
            <span className="font-medium">保存成功！</span>
          </div>
        </div>
      )}

      {/* 主弹窗内容 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-lg font-semibold text-blue-600">记多笔</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        {/* 标签切换 */}
        <div className="flex border-b border-gray-100 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>

        {/* 日期和成员选择 */}
        <div className="px-6 py-3 border-b border-gray-100 shrink-0 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">记账日期</span>
            <input
              type="date"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">成员</span>
            <select
              value={globalMemberId}
              onChange={(e) => setGlobalMemberId(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white min-w-[120px]"
            >
              <option value="">选择成员</option>
              {activeMembers.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 表单内容 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 表头 */}
          <div className="grid grid-cols-12 gap-3 mb-2 text-xs text-gray-500 font-medium px-1">
            <div className="col-span-5">分类</div>
            <div className="col-span-3">金额</div>
            <div className="col-span-3">项目/备注</div>
            <div className="col-span-1"></div>
          </div>

          {/* 记录列表 */}
          <div className="space-y-2">
            {records.map((record, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-3 items-center bg-gray-50 rounded-lg p-2"
              >
                {/* 分类选择 */}
                <div className="col-span-5">
                  <CategorySelector
                    categories={categories}
                    type={activeTab}
                    selectedCategoryId={record.categoryId ? parseInt(record.categoryId) : null}
                    selectedSubCategoryId={record.subCategoryId ? parseInt(record.subCategoryId) : null}
                    onSelect={(data) => handleCategorySelect(index, data)}
                    placeholder="选择分类"
                  />
                </div>

                {/* 金额 */}
                <div className="col-span-3">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={record.amount}
                    onChange={(e) => updateRecord(index, 'amount', e.target.value)}
                    placeholder="金额"
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 项目/备注 */}
                <div className="col-span-3 flex gap-1">
                  <input
                    type="text"
                    value={record.project}
                    onChange={(e) => updateRecord(index, 'project', e.target.value)}
                    placeholder="项目"
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={record.note}
                    onChange={(e) => updateRecord(index, 'note', e.target.value)}
                    placeholder="备注"
                    maxLength={100}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 操作 */}
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => deleteRecord(index)}
                    disabled={records.length <= 1}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="删除此行"
                  >
                    <RiDeleteBinLine className="text-base" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 添加按钮 */}
          <button
            onClick={addRecord}
            className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <RiAddLine className="text-lg" />
            <span className="text-sm font-medium">添加一行</span>
          </button>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              共 <span className="font-medium text-gray-700">{records.length}</span> 条记录
            </div>
            <button
              onClick={handleSave}
              disabled={saving || showSuccess}
              className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 ${
                saving || showSuccess
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>保存中...</span>
                </>
              ) : showSuccess ? (
                <>
                  <RiCheckLine className="text-lg" />
                  <span>保存成功</span>
                </>
              ) : (
                <>
                  <RiCheckLine className="text-lg" />
                  <span>保存全部</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MultiAddRecordModal
