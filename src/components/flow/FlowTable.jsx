import React from 'react'
import { formatAmount } from '../../utils/helpers'
import { 
  RiRestaurantLine, 
  RiMovieLine, 
  RiShoppingBasketLine,
  RiTruckLine,
  RiPrinterLine,
  RiDrinksLine,
  RiMegaphoneLine,
  RiMoreLine
} from 'react-icons/ri'

/**
 * FlowTable - 流水表格组件
 * 已删除账户和记账人字段
 */
function FlowTable() {
  // 分类图标映射
  const getCategoryIcon = (category) => {
    const iconMap = {
      '三餐': <RiRestaurantLine className="text-orange-500" />,
      '餐饮': <RiRestaurantLine className="text-orange-500" />,
      '美食': <RiRestaurantLine className="text-orange-500" />,
      '影视': <RiMovieLine className="text-purple-500" />,
      '买菜': <RiShoppingBasketLine className="text-green-500" />,
      '快递费': <RiTruckLine className="text-blue-500" />,
      '打印费': <RiPrinterLine className="text-gray-500" />,
      '零食饮料': <RiDrinksLine className="text-orange-500" />,
      '推广费': <RiMegaphoneLine className="text-red-500" />,
    }
    return iconMap[category] || <RiMoreLine className="text-gray-400" />
  }

  // 流水数据（与截图一致）
  const flowData = [
    {
      date: '2026-03-09',
      records: [
        { id: 1, category: '三餐', subCategory: '', amount: 9.90, member: '青霞', time: '00:00', project: '拼好饭', note: '过桥米线' },
      ]
    },
    {
      date: '2026-03-08',
      records: [
        { id: 2, category: '影视', subCategory: '影视会员', amount: 118.00, member: '瑞韩', time: '00:00', project: '看电影', note: '-' },
        { id: 3, category: '美食', subCategory: '出去吃饭', amount: 690.00, member: '瑞韩', time: '00:00', project: '烤肉', note: '-' },
      ]
    },
    {
      date: '2026-03-07',
      records: [
        { id: 4, category: '快递费', subCategory: '', amount: 21.00, member: '瑞韩', time: '00:00', project: '邮政', note: '-' },
        { id: 5, category: '打印费', subCategory: '', amount: 1.50, member: '瑞韩', time: '08:00', project: '委托书店', note: '-' },
        { id: 6, category: '零食饮料', subCategory: '', amount: 56.74, member: '瑞韩', time: '00:00', project: '小象超市', note: '-' },
        { id: 7, category: '零食饮料', subCategory: '', amount: 39.90, member: '青霞', time: '00:00', project: '美可达', note: 'pdd' },
        { id: 8, category: '三餐', subCategory: '', amount: 11.90, member: '瑞韩', time: '00:00', project: '晚餐', note: '-' },
        { id: 9, category: '推广费', subCategory: '', amount: 150.00, member: '青霞', time: '00:00', project: '小红书', note: '小红书推广费' },
        { id: 10, category: '美食', subCategory: '出去吃饭', amount: 202.00, member: '瑞韩', time: '00:00', project: '汤菜馆', note: '-' },
      ]
    },
    {
      date: '2026-03-06',
      records: [
        { id: 11, category: '三餐', subCategory: '', amount: 41.00, member: '瑞韩', time: '00:00', project: '晚餐', note: '-' },
        { id: 12, category: '三餐', subCategory: '', amount: 21.00, member: '瑞韩', time: '00:00', project: '午餐', note: '-' },
        { id: 13, category: '三餐', subCategory: '', amount: 22.40, member: '青霞', time: '00:00', project: '午餐', note: '特食' },
        { id: 14, category: '三餐', subCategory: '', amount: 7.53, member: '瑞韩', time: '00:00', project: '早餐', note: '-' },
      ]
    },
  ]

  // 计算每日汇总
  const getDaySummary = (records) => {
    const income = records.filter(r => r.amount > 0 && r.category === '收入').reduce((sum, r) => sum + r.amount, 0)
    const expense = records.filter(r => r.amount > 0).reduce((sum, r) => sum + r.amount, 0)
    return { income, expense }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 表头 - 已删除账户和记账人字段 */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 text-sm text-gray-600 font-medium border-b border-gray-100">
        <div className="col-span-1">汇总</div>
        <div className="col-span-2">分类</div>
        <div className="col-span-1">金额</div>
        <div className="col-span-1">成员</div>
        <div className="col-span-3">时间</div>
        <div className="col-span-2">项目</div>
        <div className="col-span-1">备注</div>
        <div className="col-span-1 text-right">操作</div>
      </div>

      {/* 表格内容 */}
      <div className="divide-y divide-gray-100">
        {flowData.map((day) => {
          const summary = getDaySummary(day.records)
          const dateObj = new Date(day.date)
          const dayNum = dateObj.getDate()
          const weekDay = dateObj.toLocaleDateString('zh-CN', { weekday: 'short' })

          return (
            <div key={day.date} className="group">
              {/* 日期分组标题 */}
              <div className="flex items-center gap-4 px-4 py-2 bg-gray-50/50 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-primary-500 font-semibold">{dayNum}月</span>
                  <span className="text-gray-400 text-xs">{weekDay}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-expense">支出 {formatAmount(summary.expense)}</span>
                  <span className="text-income">收入 {formatAmount(summary.income)}</span>
                </div>
              </div>

              {/* 当日记录 - 已删除账户和记账人字段 */}
              {day.records.map((record) => (
                <div 
                  key={record.id} 
                  className="grid grid-cols-12 gap-4 px-4 py-3 items-center text-sm hover:bg-gray-50 transition-colors"
                >
                  <div className="col-span-1"></div>
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getCategoryIcon(record.category)}
                    </div>
                    <span className="text-gray-700">{record.category}</span>
                  </div>
                  <div className="col-span-1 font-medium text-expense">
                    {record.amount > 0 ? '-' : ''}{formatAmount(Math.abs(record.amount))}
                  </div>
                  <div className="col-span-1 text-gray-600">{record.member}</div>
                  <div className="col-span-3 text-gray-500">{day.date} {record.time}</div>
                  <div className="col-span-2 text-gray-600">{record.project || '-'}</div>
                  <div className="col-span-1 text-gray-500">{record.note || '-'}</div>
                  <div className="col-span-1 flex items-center justify-end gap-2">
                    <button className="px-2 py-1 text-xs text-primary-500 hover:bg-primary-50 rounded">编辑</button>
                    <button className="px-2 py-1 text-xs text-primary-500 hover:bg-primary-50 rounded">复制</button>
                    <button className="px-2 py-1 text-xs text-expense hover:bg-red-50 rounded">删除</button>
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
