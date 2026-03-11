import React, { useState } from 'react'
import Sidebar from './components/common/Sidebar'
import HomePage from './pages/HomePage'
import FlowPage from './pages/FlowPage'
import CategoryPage from './pages/CategoryPage'
import AddRecordModal from './components/modals/AddRecordModal'

/**
 * App - 应用根组件
 * 管理全局状态和页面路由
 */
function App() {
  // 当前选中的页面
  const [currentPage, setCurrentPage] = useState('home')
  // 记一笔弹窗显示状态
  const [showAddModal, setShowAddModal] = useState(false)

  // 渲染当前页面
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />
      case 'flow':
        return <FlowPage />
      case 'category':
        return <CategoryPage />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧导航栏 */}
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        onAddRecord={() => setShowAddModal(true)}
      />
      
      {/* 主内容区 */}
      <main className="flex-1 overflow-auto ml-64">
        {renderPage()}
      </main>

      {/* 记一笔弹窗 */}
      {showAddModal && (
        <AddRecordModal 
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}

export default App
