import { useState, useMemo } from 'react'
import * as Icons from 'react-icons/ri'

/**
 * CategoryTree - 分类树形列表组件
 * @param {Object} props
 * @param {string} props.type - 分类类型 (expense|income)
 * @param {Array} props.categories - 分类数据列表
 * @param {Function} props.onEdit - 编辑回调 (category)
 * @param {Function} props.onDelete - 删除回调 (category)
 */
function CategoryTree({ type = 'expense', categories: allCategories = [], onEdit, onDelete }) {
  // 展开的分类
  const [expandedCategories, setExpandedCategories] = useState([])

  // 根据类型过滤并构建树形结构
  const categories = useMemo(() => {
    // 过滤当前类型的分类
    const typeCategories = allCategories.filter(c => c.type === type)
    
    // 构建树形结构：找出父分类和子分类
    const parentCategories = typeCategories.filter(c => !c.parentId)
    
    return parentCategories.map(parent => ({
      ...parent,
      children: typeCategories.filter(c => c.parentId === parent.id)
    }))
  }, [allCategories, type])

  // 计算加载状态
  const loading = allCategories.length === 0

  // 切换展开/收起
  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  // 动态渲染图标
  const renderIcon = (iconName) => {
    if (!iconName) return <span className="text-gray-400 text-xs">-</span>
    const IconComponent = Icons[iconName]
    if (IconComponent) {
      return <IconComponent className="text-lg" />
    }
    return <span className="text-gray-400 text-xs">-</span>
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
        加载中...
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 表头 */}
      <div className="grid grid-cols-2 gap-4 px-4 py-3 bg-gray-50 text-sm text-gray-600 font-medium border-b border-gray-100">
        <div>分类名称</div>
        <div className="text-right">操作</div>
      </div>

      {/* 分类列表 */}
      <div className="divide-y divide-gray-100">
        {categories.map((category) => (
          <div key={category.id}>
            {/* 一级分类 */}
            <div className="grid grid-cols-2 gap-4 px-4 py-3 items-center hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2">
                {category.children && category.children.length > 0 ? (
                  <button 
                    onClick={() => toggleExpand(category.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedCategories.includes(category.id) ? (
                      <Icons.RiArrowDownSLine />
                    ) : (
                      <Icons.RiArrowRightSLine />
                    )}
                  </button>
                ) : (
                  <span className="w-4"></span>
                )}
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                  {renderIcon(category.icon)}
                </div>
                <span className="font-medium text-gray-800">{category.name}</span>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => onEdit && onEdit(category)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-primary-500 hover:bg-primary-50 rounded"
                >
                  <Icons.RiEditLine />
                  <span>编辑</span>
                </button>
                <button 
                  onClick={() => onDelete && onDelete(category)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-expense hover:bg-red-50 rounded"
                >
                  <Icons.RiDeleteBinLine />
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
                    className="grid grid-cols-2 gap-4 px-4 py-2 items-center hover:bg-gray-50 transition-colors pl-12"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm text-gray-600">
                        {renderIcon(child.icon)}
                      </div>
                      <span className="text-gray-700">{child.name}</span>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => onEdit && onEdit(child)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-primary-500 hover:bg-primary-50 rounded"
                      >
                        <Icons.RiEditLine />
                        <span>编辑</span>
                      </button>
                      <button 
                        onClick={() => onDelete && onDelete(child)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-expense hover:bg-red-50 rounded"
                      >
                        <Icons.RiDeleteBinLine />
                        <span>删除</span>
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
