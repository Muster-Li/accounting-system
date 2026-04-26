import { useState, useMemo, useEffect } from 'react'
import FlowHeader from '../components/flow/FlowHeader'
import FlowTable from '../components/flow/FlowTable'
import AddRecordModal from '../components/modals/AddRecordModal'
import ConfirmModal from '../components/common/ConfirmModal'
import { format } from 'date-fns'
import { RiRefreshLine, RiCalendarLine, RiSearchLine } from 'react-icons/ri'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

/**
 * FlowPage - 流水页组件
 * 手动加载账单数据
 * @param {Object} props
 * @param {Object} props.billsHook - useBills hook 返回的对象
 * @param {Array} props.categories - 分类数据
 * @param {Array} props.members - 成员数据
 */
function FlowPage({ billsHook, categories, members }) {
  const {
    bills,
    stats,
    loading,
    error,
    hasLoaded,
    fetchBills,
    refresh,
    removeBill,
    editBill
  } = billsHook

  // 筛选条件
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    type: '',
    categoryId: '',
    subCategoryId: '',
    searchKeyword: '',
  })

  // 编辑弹窗状态
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  // 删除确认弹窗状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingRecordId, setDeletingRecordId] = useState(null)

  // 页面首次加载时获取账单（传入当前日期筛选）
  useEffect(() => {
    if (!hasLoaded) {
      fetchBills(false, { 
        startDate: format(filters.startDate, 'yyyy-MM-dd'), 
        endDate: format(filters.endDate, 'yyyy-MM-dd') 
      })
    }
  }, [hasLoaded, fetchBills])

  // 当日期范围变化时重新获取（强制刷新，传入新的日期）
  useEffect(() => {
    if (hasLoaded) {
      fetchBills(true, { 
        startDate: format(filters.startDate, 'yyyy-MM-dd'), 
        endDate: format(filters.endDate, 'yyyy-MM-dd') 
      })
    }
  }, [filters.startDate, filters.endDate])

  // 从缓存中获取所有一级分类（parentId 为 null 的分类）
  // 如果选择了类型（收入/支出），则只显示对应类型的一级分类
  const availableCategories = useMemo(() => {
    return categories
      .filter(cat => {
        // 必须是一级分类
        const isTopLevel = cat.parentId === null || cat.parentId === undefined
        if (!isTopLevel) return false
        // 如果选择了类型，只显示对应类型的分类
        if (filters.type) {
          return cat.type === filters.type
        }
        return true
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [categories, filters.type])

  // 根据选中一级分类从缓存中获取二级分类
  const availableSubCategories = useMemo(() => {
    if (!filters.categoryId) return []
    const selectedId = String(filters.categoryId)
    return categories
      .filter(cat => cat.parentId !== null && cat.parentId !== undefined && String(cat.parentId) === selectedId)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [categories, filters.categoryId])

  // 将平坦数据转换为按日期分组的格式
  const groupedData = useMemo(() => {
    if (!bills || bills.length === 0) return []

    const grouped = {}

    bills.forEach(bill => {
      // 安全地解析日期
      const billDate = bill.billDate ? new Date(bill.billDate) : new Date()
      const dateKey = isNaN(billDate.getTime())
        ? format(new Date(), 'yyyy-MM-dd')
        : format(billDate, 'yyyy-MM-dd')

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          expense: 0,
          income: 0,
          records: []
        }
      }

      // 计算当日收支
      const amount = parseFloat(bill.amount) || 0
      if (bill.type === 'expense') {
        grouped[dateKey].expense += amount
      } else {
        grouped[dateKey].income += amount
      }

      // 添加记录（已包含合并的分类和成员信息）
      grouped[dateKey].records.push({
        id: bill.id,
        type: bill.type,
        amount: amount,
        category: bill.category?.name || '-',
        categoryIcon: bill.category?.icon || '',
        categoryId: bill.categoryId,
        subCategory: bill.subCategory?.name || '',
        subCategoryIcon: bill.subCategory?.icon || '',
        subCategoryId: bill.subCategoryId,
        member: bill.member?.name || '-',
        date: dateKey,
        project: bill.project || '',
        note: bill.note || '',
        // 保留原始数据用于编辑
        rawData: bill
      })
    })

    // 按日期降序排列
    return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [bills])

  // 前端计算的汇总数据
  const summary = useMemo(() => {
    const income = parseFloat(stats?.totalIncome || 0)
    const expense = parseFloat(stats?.totalExpense || 0)
    return {
      income,
      expense,
      balance: income - expense,
    }
  }, [stats])

  // 删除账单 - 打开确认弹窗
  const handleDelete = (id) => {
    setDeletingRecordId(id)
    setShowDeleteConfirm(true)
  }

  // 确认删除
  const confirmDelete = async () => {
    if (!deletingRecordId) return

    try {
      await removeBill(deletingRecordId)
    } catch (err) {
      alert('删除失败: ' + err.message)
    } finally {
      setShowDeleteConfirm(false)
      setDeletingRecordId(null)
    }
  }

  // 编辑账单 - 打开编辑弹窗
  const handleEdit = (record) => {
    // 从 rawData 获取完整数据
    const rawData = record.rawData || record
    // 格式化日期为 yyyy-MM-dd 字符串
    let billDateStr = record.date
    
    setEditingRecord({
      id: rawData.id,
      type: rawData.type,
      amount: rawData.amount,
      categoryId: rawData.categoryId,
      subCategoryId: rawData.subCategoryId,
      category: rawData.category,
      subCategory: rawData.subCategory,
      memberId: rawData.memberId,
      member: rawData.member,
      billDate: billDateStr,
      project: rawData.project || '',
      note: rawData.note || ''
    })
    setShowEditModal(true)
  }

  // 处理更新
  const handleUpdate = async (id, data) => {
    try {
      await editBill(id, data)
      setShowEditModal(false)
      setEditingRecord(null)
      return Promise.resolve()
    } catch (err) {
      console.error('Update error:', err)
      return Promise.reject(err)
    }
  }

  // 处理刷新 - 带上当前日期范围
  const handleRefresh = () => {
    fetchBills(true, {
      startDate: format(filters.startDate, 'yyyy-MM-dd'),
      endDate: format(filters.endDate, 'yyyy-MM-dd')
    })
  }

  // 处理日期变更
  const handleDateChange = (field, date) => {
    setFilters(prev => ({ ...prev, [field]: date }))
  }

  // 处理一级分类变更
  const handleCategoryChange = (categoryId) => {
    setFilters(prev => ({
      ...prev,
      categoryId,
      subCategoryId: '' // 重置二级分类
    }))
  }

  // 处理搜索关键词变更
  const handleSearchChange = (value) => {
    setFilters(prev => ({ ...prev, searchKeyword: value }))
  }

  // 筛选后的数据（前端筛选：类型、分类、搜索）
  const filteredData = useMemo(() => {
    let result = groupedData

    // 类型筛选
    if (filters.type) {
      result = result.map(day => ({
        ...day,
        records: day.records.filter(r => r.type === filters.type),
        income: filters.type === 'income' ? day.income : 0,
        expense: filters.type === 'expense' ? day.expense : 0
      })).filter(day => day.records.length > 0)
    }

    // 一级分类筛选（转换为字符串比较）
    if (filters.categoryId) {
      const selectedCategoryId = String(filters.categoryId)
      result = result.map(day => ({
        ...day,
        records: day.records.filter(r => String(r.categoryId) === selectedCategoryId)
      })).filter(day => day.records.length > 0)
    }

    // 二级分类筛选（转换为字符串比较）
    if (filters.subCategoryId) {
      const selectedSubCategoryId = String(filters.subCategoryId)
      result = result.map(day => ({
        ...day,
        records: day.records.filter(r => String(r.subCategoryId) === selectedSubCategoryId)
      })).filter(day => day.records.length > 0)
    }

    // 搜索筛选（项目和备注模糊搜索）
    if (filters.searchKeyword.trim()) {
      const keyword = filters.searchKeyword.toLowerCase().trim()
      result = result.map(day => ({
        ...day,
        records: day.records.filter(r =>
          (r.project && r.project.toLowerCase().includes(keyword)) ||
          (r.note && r.note.toLowerCase().includes(keyword))
        )
      })).filter(day => day.records.length > 0)
    }

    return result
  }, [groupedData, filters.type, filters.categoryId, filters.subCategoryId, filters.searchKeyword])

  // 自定义日期选择器样式
  const datePickerClassName = "px-3 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg border-none outline-none focus:ring-2 focus:ring-primary-200 w-[130px]"

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* 页面标题 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">流水列表</h1>
          <p className="text-gray-500 text-sm mt-1">
            查看所有记账记录
            <span className="ml-2 text-xs text-gray-400">
              (分类: {categories.length} | 成员: {members.length})
            </span>
          </p>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="space-y-4">
        {/* 汇总栏 - 使用前端计算的统计 */}
        <FlowHeader summary={summary} loading={loading} />

        {/* 筛选栏 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            {/* 左侧筛选 */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* 时间选择 - 使用第三方日期选择器 */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <DatePicker
                    selected={filters.startDate}
                    onChange={(date) => handleDateChange('startDate', date)}
                    selectsStart
                    startDate={filters.startDate}
                    endDate={filters.endDate}
                    dateFormat="yyyy-MM-dd"
                    className={datePickerClassName}
                    placeholderText="开始日期"
                  />
                  <RiCalendarLine className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                </div>
                <span className="text-gray-400">至</span>
                <div className="relative">
                  <DatePicker
                    selected={filters.endDate}
                    onChange={(date) => handleDateChange('endDate', date)}
                    selectsEnd
                    startDate={filters.startDate}
                    endDate={filters.endDate}
                    minDate={filters.startDate}
                    dateFormat="yyyy-MM-dd"
                    className={datePickerClassName}
                    placeholderText="结束日期"
                  />
                  <RiCalendarLine className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                </div>
              </div>

              {/* 类型筛选 */}
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  type: e.target.value,
                  categoryId: '',
                  subCategoryId: ''
                }))}
                className="px-3 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg border-none outline-none focus:ring-2 focus:ring-primary-200"
              >
                <option value="">全部类型</option>
                <option value="expense">支出</option>
                <option value="income">收入</option>
              </select>

              {/* 一级分类筛选 */}
              <select
                value={filters.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-3 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg border-none outline-none focus:ring-2 focus:ring-primary-200 min-w-[100px]"
              >
                <option value="">全部分类</option>
                {availableCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              {/* 二级分类筛选 */}
              <select
                value={filters.subCategoryId}
                onChange={(e) => setFilters(prev => ({ ...prev, subCategoryId: e.target.value }))}
                disabled={!filters.categoryId}
                className="px-3 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg border-none outline-none focus:ring-2 focus:ring-primary-200 min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">全部子分类</option>
                {availableSubCategories.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>

              {/* 搜索框 - 项目和备注 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索项目或备注"
                  value={filters.searchKeyword}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg border-none outline-none focus:ring-2 focus:ring-primary-200 w-44"
                />
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              {/* 清除筛选按钮 */}
              {(filters.type || filters.categoryId || filters.subCategoryId || filters.searchKeyword) && (
                <button
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    type: '',
                    categoryId: '',
                    subCategoryId: '',
                    searchKeyword: ''
                  }))}
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  清除筛选
                </button>
              )}
            </div>

            {/* 右侧操作 - 刷新按钮 */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary-500 border border-primary-200 rounded-lg hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RiRefreshLine className={`${loading ? 'animate-spin' : ''}`} />
              <span>刷新</span>
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            加载失败: {error}
          </div>
        )}

        {/* 加载状态 */}
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2">加载中...</p>
          </div>
        ) : !hasLoaded ? (
          <div className="p-8 text-center text-gray-500">
            <p>点击刷新按钮加载数据</p>
          </div>
        ) : (
          /* 流水表格 */
          <FlowTable
            data={filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* 编辑弹窗 */}
      <AddRecordModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingRecord(null)
        }}
        initialData={editingRecord}
        onSubmit={null}
        onUpdate={handleUpdate}
        editingId={editingRecord?.id || null}
      />

      {/* 删除确认弹窗 */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setDeletingRecordId(null)
        }}
        onConfirm={confirmDelete}
        title="删除账单"
        message="确定要删除这条账单记录吗？此操作不可恢复。"
        confirmText="确认删除"
        type="danger"
      />
    </div>
  )
}

export default FlowPage
