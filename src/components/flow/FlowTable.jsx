import React from 'react'
import * as Icons from 'react-icons/ri'
import { formatAmount } from '../../utils/helpers'

/**
 * FlowTable - 流水表格组件
 * 字段：分类(一级+二级)、金额、成员、时间、项目、备注
 * @param {Object} props
 * @param {Array} props.data - 账单数据
 * @param {Function} props.onEdit - 编辑回调
 * @param {Function} props.onDelete - 删除回调
 */
function FlowTable({ data, onEdit = null, onDelete }) {
  console.log('data',data)

  // 渲染图标
  const renderIcon = (iconName) => {
    if (!iconName) return null
    const IconComponent = Icons[iconName]
    if (IconComponent) {
      return <IconComponent className="text-base" />
    }
    return null
  }

  // 格式化日期
  const formatDate = (dateStr) => {
    try {
      const date = dateStr ? new Date(dateStr) : new Date()
      if (isNaN(date.getTime())) {
        return { day: '-', week: '-' }
      }
      return {
        day: date.getDate(),
        week: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
      }
    } catch {
      return { day: '-', week: '-' }
    }
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
        暂无记录
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 表头 */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 text-sm text-gray-600 font-medium border-b border-gray-100">
        <div className="col-span-2">日期</div>
        <div className="col-span-2">分类</div>
        <div className="col-span-1">金额</div>
        <div className="col-span-1">成员</div>
        <div className="col-span-2">时间</div>
        <div className="col-span-2">项目</div>
        <div className="col-span-1">备注</div>
        <div className="col-span-1 text-right">操作</div>
      </div>

      {/* 表格内容 */}
      <div className="divide-y divide-gray-100">
        {data.map((day) => {
          const { day: dayNum, week } = formatDate(day.date)

          return (
            <div key={day.date} className="group">
              {/* 日期分组标题 */}
              <div className="flex items-center gap-4 px-4 py-2 bg-gray-50/50 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-primary-500 font-semibold">{dayNum}日</span>
                  <span className="text-gray-400 text-xs">周{week}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-expense">支出 {formatAmount(day.expense)}</span>
                  <span className="text-income">收入 {formatAmount(day.income)}</span>
                </div>
              </div>

              {/* 当日记录 */}
              {day.records.map((record) => (
                <div 
                  key={record.id} 
                  className="grid grid-cols-12 gap-4 px-4 py-3 items-center text-sm hover:bg-gray-50 transition-colors"
                >
                  <div className="col-span-2"></div>
                  {/* 分类（一级+二级） */}
                  <div className="col-span-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        {record.categoryIcon && (
                          <span className="text-gray-500">{renderIcon(record.categoryIcon)}</span>
                        )}
                        <span className="text-gray-800 font-medium">{record.category}</span>
                      </div>
                      {record.subCategory && (
                        <div className="flex items-center gap-1.5 ml-0">
                          {record.subCategoryIcon && (
                            <span className="text-gray-400 text-xs">{renderIcon(record.subCategoryIcon)}</span>
                          )}
                          <span className="text-gray-400 text-xs">{record.subCategory}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* 金额 */}
                  <div className={`col-span-1 font-medium ${record.type === 'income' ? 'text-income' : 'text-expense'}`}>
                    {record.type === 'income' ? '+' : '-'}{formatAmount(record.amount)}
                  </div>
                  {/* 成员 */}
                  <div className="col-span-1 text-gray-600">{record.member || '-'}</div>
                  {/* 日期 */}
                  <div className="col-span-2 text-gray-500">
                    {record.date}
                  </div>
                  {/* 项目 */}
                  <div className="col-span-2 text-gray-600 truncate" title={record.project}>
                    {record.project || '-'}
                  </div>
                  {/* 备注 */}
                  <div className="col-span-1 text-gray-500 truncate" title={record.note}>
                    {record.note || '-'}
                  </div>
                  {/* 操作 */}
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(record)}
                        className="p-1.5 text-primary-500 hover:bg-primary-50 rounded"
                        title="编辑"
                      >
                        <Icons.RiEditLine />
                      </button>
                    )}
                    <button 
                      onClick={() => onDelete(record.id)}
                      className="p-1.5 text-expense hover:bg-red-50 rounded"
                      title="删除"
                    >
                      <Icons.RiDeleteBinLine />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FlowTable
