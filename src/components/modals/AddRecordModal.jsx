import React, { useState } from 'react'
import { RiCloseLine, RiTimeLine } from 'react-icons/ri'
import { getCurrentTime } from '../../utils/helpers'

/**
 * AddRecordModal - 记一笔弹窗组件
 * @param {Object} props
 * @param {boolean} props.isOpen - 是否显示
 * @param {Function} props.onClose - 关闭回调
 */
function AddRecordModal({ isOpen, onClose }) {
  // 当前选中的标签
  const [activeTab, setActiveTab] = useState('expense')
  
  // 表单数据
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    account: '',
    time: getCurrentTime(),
    member: 'all',
    merchant: '',
    note: '',
  })

  // 标签配置 - 只保留支出和收入
  const tabs = [
    { id: 'expense', label: '支出' },
    { id: 'income', label: '收入' },
  ]

  // 下拉选项
  const categories = [
    { id: '', name: '请选择' },
    { id: 'food', name: '三餐' },
    { id: 'shopping', name: '购物' },
    { id: 'transport', name: '交通' },
    { id: 'entertainment', name: '娱乐' },
  ]

  const accounts = [
    { id: '', name: '请选择' },
    { id: 'alipay', name: '支付宝' },
    { id: 'wechat', name: '微信' },
    { id: 'cash', name: '现金' },
    { id: 'card', name: '银行卡' },
  ]

  const members = [
    { id: 'all', name: '所有 / Steve' },
    { id: 'steve', name: 'Steve' },
    { id: 'qingxia', name: '青霞' },
    { id: 'ruihan', name: '瑞韩' },
  ]

  const merchants = [
    { id: '', name: '请选择' },
    { id: 'meituan', name: '美团' },
    { id: 'taobao', name: '淘宝' },
    { id: 'jd', name: '京东' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('保存记账:', formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div className="absolute inset-0 modal-overlay" onClick={onClose} />
      
      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden slide-up">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-primary-500">记一笔</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        {/* 标签切换 - 只保留支出和收入 */}
        <div className="flex border-b border-gray-100">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id 
                  ? 'text-primary-500' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
              )}
            </button>
          ))}
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-4">
          {/* 金额 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              金额 <span className="text-expense">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="请输入金额"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
              required
            />
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              分类 <span className="text-expense">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm bg-white appearance-none"
              required
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* 账户 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              账户 <span className="text-expense">*</span>
            </label>
            <select
              value={formData.account}
              onChange={(e) => setFormData({ ...formData, account: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm bg-white appearance-none"
              required
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          {/* 记账时间 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">记账时间</label>
            <div className="relative">
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
              />
              <RiTimeLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* 成员 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">成员</label>
            <select
              value={formData.member}
              onChange={(e) => setFormData({ ...formData, member: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm bg-white appearance-none"
            >
              {members.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>

          {/* 商家 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">商家</label>
            <select
              value={formData.merchant}
              onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm bg-white appearance-none"
            >
              {merchants.map(merchant => (
                <option key={merchant.id} value={merchant.id}>{merchant.name}</option>
              ))}
            </select>
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
                maxLength={50}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {formData.note.length}/50
              </span>
            </div>
          </div>

          {/* 按钮 - 只保留保存 */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddRecordModal
