import React, { useState } from 'react'
import {
  RiHomeLine,
  RiBillLine,
  RiPieChartLine,
  RiPriceTag3Line,
  RiAddLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
} from 'react-icons/ri'

/**
 * Sidebar - 左侧导航栏组件
 * @param {Object} props
 * @param {string} props.currentPage - 当前选中页面
 * @param {Function} props.onPageChange - 页面切换回调
 * @param {Function} props.onAddRecord - 记一笔按钮回调
 */
function Sidebar({ currentPage, onPageChange, onAddRecord }) {
  // 分类标签子菜单展开状态
  const [expandedMenus, setExpandedMenus] = useState(['category'])

  // 切换菜单展开/收起
  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    )
  }

  // 菜单配置
  const menuItems = [
    { id: 'home', label: '首页', icon: RiHomeLine },
    { id: 'flow', label: '流水', icon: RiBillLine },
    { id: 'report', label: '报表', icon: RiPieChartLine },
  ]

  // 处理菜单点击
  const handleMenuClick = (menuId) => {
    console.log('Menu clicked:', menuId)
    onPageChange(menuId)
  }

  // 分类标签子菜单
  const categorySubMenus = [
    { id: 'category', label: '收支分类' },
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 flex flex-col">
      {/* Logo区域 */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-100">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
          <span className="text-white text-xl font-bold">家</span>
        </div>
        <div>
          <h1 className="font-bold text-gray-800 text-lg">家庭账本</h1>
          <p className="text-xs text-gray-400">记账管理系统</p>
        </div>
      </div>

      {/* 记一笔按钮 */}
      <div className="p-4">
        <button
          onClick={onAddRecord}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white py-3 px-4 rounded-xl btn-hover shadow-lg shadow-primary-200"
        >
          <RiAddLine className="text-xl" />
          <span className="font-medium">记一笔</span>
        </button>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto px-3">
        {/* 主要菜单项 */}
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-200 ${
              currentPage === item.id
                ? 'nav-active shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon className="text-xl" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        {/* 分类标签（带子菜单） */}
        <div className="mt-2">
          <button
            onClick={() => toggleMenu('category')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-1 transition-all duration-200 ${
              currentPage === 'category'
                ? 'nav-active shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <RiPriceTag3Line className="text-xl" />
              <span className="font-medium">分类标签</span>
            </div>
            {expandedMenus.includes('category') ? (
              <RiArrowDownSLine className="text-gray-400" />
            ) : (
              <RiArrowRightSLine className="text-gray-400" />
            )}
          </button>

          {/* 子菜单 */}
          {expandedMenus.includes('category') && (
            <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-1">
              {categorySubMenus.map(subItem => (
                <button
                  key={subItem.id}
                  onClick={() => onPageChange(subItem.id === 'category' ? 'category' : subItem.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                    currentPage === subItem.id || (subItem.id === 'category' && currentPage === 'category')
                      ? 'text-primary-500 bg-primary-50 font-medium'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {subItem.label}
                </button>
              ))}
            </div>
          )}
        </div>

      </nav>

      {/* 底部信息 */}
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">家庭账本 v1.0</p>
      </div>
    </aside>
  )
}

export default Sidebar
