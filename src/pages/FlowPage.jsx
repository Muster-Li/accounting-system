import React, { useState, useMemo, useEffect } from 'react'
import FlowHeader from '../components/flow/FlowHeader'
import FlowTable from '../components/flow/FlowTable'
import AddRecordModal from '../components/modals/AddRecordModal'
import { format } from 'date-fns'
import { RiRefreshLine } from 'react-icons/ri'

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
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: '',
  })

  // 编辑弹窗状态
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  // 页面首次加载时获取账单
  useEffect(() => {
    if (!hasLoaded) {
      fetchBills()
    }
  }, [hasLoaded, fetchBills])

  // 当日期范围变化时重新获取
  useEffect(() => {
    if (hasLoaded) {
      fetchBills()
    }
  }, [filters.startDate, filters.endDate])

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
        subCategory: bill.subCategory?.name || '',
        member: bill.member?.name || '-',
        date: dateKey,
        time: bill.billTime || '',
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

  // 删除账单
  const handleDelete = async (id) => {
    if (!confirm('确定要删除这条记录吗？')) return

    try {
      await removeBill(id)
    } catch (err) {
      alert('删除失败: ' + err.message)
    }
  }

  // 编辑账单 - 打开编辑弹窗
  const handleEdit = (record) => {
    // 从 rawData 获取完整数据
    const rawData = record.rawData || record
    console.log('rawData.billDate', rawData.billDate)
    console.log('rawData.billTime', rawData.billTime)
    console.log('record.rawData', record.rawData)
    console.log('record', record)
    // 格式化日期为 yyyy-MM-dd 字符串
    let billDateStr = record.date
    // if (billDateStr instanceof Date) {
    //   billDateStr = billDateStr.toISOString().split('T')[0]
    // } else if (typeof billDateStr === 'string' && billDateStr.includes('T')) {
    //   billDateStr = billDateStr.split('T')[0]
    // }
    
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
      billTime: rawData.billTime || '',
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

  // 处理刷新
  const handleRefresh = () => {
    refresh()
  }

  // 处理日期变更
  const handleDateChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  // 筛选后的数据（前端筛选类型）
  const filteredData = useMemo(() => {
    if (!filters.type) return groupedData
    return groupedData.map(day => ({
      ...day,
      records: day.records.filter(r => r.type === filters.type),
      income: filters.type === 'income' ? day.income : 0,
      expense: filters.type === 'expense' ? day.expense : 0
    })).filter(day => day.records.length > 0)
  }, [groupedData, filters.type])

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
            <div className="flex items-center gap-4">
              {/* 时间选择 */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  className="px-3 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg border-none"
                />
                <span className="text-gray-400">至</span>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="px-3 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg border-none"
                />
              </div>

              {/* 类型筛选 */}
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="px-3 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg border-none"
              >
                <option value="">全部类型</option>
                <option value="expense">支出</option>
                <option value="income">收入</option>
              </select>
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
    </div>
  )
}

export default FlowPage
