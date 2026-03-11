import React, { useState } from 'react'
import { formatAmount } from '../../utils/helpers'
import { 
  RiRestaurantLine, 
  RiHomeLine, 
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiEditLine,
  RiDeleteBinLine,
  RiFileListLine
} from 'react-icons/ri'

/**
 * CategoryTree - 分类树形列表组件
 * @param {Object} props
 * @param {string} props.type - 分类类型 (expense|income)
 */
function CategoryTree({ type = 'expense' }) {
  // 展开的分类
  const [expandedCategories, setExpandedCategories] = useState([1])

  // 切换展开/收起
  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  // 获取分类图标
  const getCategoryIcon = (name) => {
    const iconMap = {
      '食品酒水': <RiRestaurantLine className="text-orange-500" />,
      '伙食费': <RiRestaurantLine className="text-orange-500" />,
      '早餐': <span className="text-orange-500 text-xs">早餐</span>,
      '中餐': <RiRestaurantLine className="text-orange-500" />,
      '晚餐': <RiRestaurantLine className="text-orange-500" />,
      '水果': <RiRestaurantLine className="text-orange-500" />,
      '零食': <span className="text-orange-500 text-xs">零食</span>,
      '买菜': <span className="text-green-500 text-xs">买菜</span>,
      '柴米油盐': <span className="text-orange-500 text-xs">柴米</span>,
      '饮料酒水': <span className="text-orange-500 text-xs">饮料</span>,
      '外出美食': <span className="text-yellow-500 text-xs">美食</span>,
      '居家生活': <RiHomeLine className="text-yellow-500" />,
    }
    return iconMap[name] || <span className="text-gray-400 text-xs">{name[0]}</span>
  }

  // 分类数据
  const expenseCategories = [
    {
      id: 1,
      name: '食品酒水',
      amount: 0,
      children: [
        { id: 11, name: '伙食费', amount: 0 },
        { id: 12, name: '早餐', amount: 0 },
        { id: 13, name: '中餐', amount: 0 },
        { id: 14, name: '晚餐', amount: 0 },
        { id: 15, name: '水果', amount: 0 },
        { id: 16, name: '零食', amount: 0 },
        { id: 17, name: '买菜', amount: 0 },
        { id: 18, name: '柴米油盐', amount: 0 },
        { id: 19, name: '饮料酒水', amount: 0 },
        { id: 20, name: '外出美食', amount: 0 },
      ]
    },
    {
      id: 2,
      name: '居家生活',
      amount: 57.15,
      children: []
    },
  ]

  const incomeCategories = [
    { id: 101, name: '职业收入', amount: 0, children: [] },
    { id: 102, name: '人情收礼', amount: 0, children: [] },
    { id: 103, name: '其他收入', amount: 0, children: [] },
  ]

  const categories = type === 'expense' ? expenseCategories : incomeCategories

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 表头 */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 text-sm text-gray-600 font-medium border-b border-gray-100">
        <div className="col-span-5">分类名称</div>
        <div className="col-span-3 text-right">支出</div>
        <div className="col-span-4 text-right">操作</div>
      </div>

      {/* 分类列表 */}
      <div className="divide-y divide-gray-100">
        {categories.map((category) => (
          <div key={category.id}>
            {/* 一级分类 */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 transition-colors">
              <div className="col-span-5 flex items-center gap-2">
                {category.children && category.children.length > 0 ? (
                  <button 
                    onClick={() => toggleExpand(category.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedCategories.includes(category.id) ? (
                      <RiArrowDownSLine />
                    ) : (
                      <RiArrowRightSLine />
                    )}
                  </button>
                ) : (
                  <span className="w-4"></span>
                )}
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  {getCategoryIcon(category.name)}
                </div>
                <span className="font-medium text-gray-800">{category.name}</span>
              </div>
              <div className="col-span-3 text-right text-gray-600">
                {formatAmount(category.amount)}
              </div>
              <div className="col-span-4 flex items-center justify-end gap-3">
                <button className="flex items-center gap-1 px-2 py-1 text-xs text-primary-500 hover:bg-primary-50 rounded">
                  <RiEditLine />
                  <span>编辑</span>
                </button>
                <button className="flex items-center gap-1 px-2 py-1 text-xs text-expense hover:bg-red-50 rounded">
                  <RiDeleteBinLine />
                  <span>删除</span>
                </button>
              </div>
            </div>

            {/* 二级分类 */}
            {category.children && expandedCategories.includes(category.id) && (
              <div className="bg-gray-50/50">
                {category.children.map((child) => (
                  <div 
                    key={child.id} 
                    className="grid grid-cols-12 gap-4 px-4 py-2 items-center hover:bg-gray-50 transition-colors pl-12"
                  >
                    <div className="col-span-5 flex items-center gap-2">
                      <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        {getCategoryIcon(child.name)}
                      </div>
                      <span className="text-gray-700">{child.name}</span>
                    </div>
                    <div className="col-span-3 text-right text-gray-500 text-sm">
                      {formatAmount(child.amount)}
                    </div>
                    <div className="col-span-4 flex items-center justify-end gap-3">
                      <button className="flex items-center gap-1 px-2 py-1 text-xs text-primary-500 hover:bg-primary-50 rounded">
                        <RiEditLine />
                        <span>编辑</span>
                      </button>
                      <button className="flex items-center gap-1 px-2 py-1 text-xs text-expense hover:bg-red-50 rounded">
                        <RiDeleteBinLine />
                        <span>删除</span>
                      </button>
                      <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded">
                        <RiFileListLine />
                        <span>查看流水</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategoryTree
