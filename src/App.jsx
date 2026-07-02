import { useState } from 'react'
import Sidebar from './components/common/Sidebar'
import HomePage from './pages/HomePage'
import FlowPage from './pages/FlowPage'
import CategoryPage from './pages/CategoryPage'
import ReportPage from './pages/ReportPage'
import AddRecordModal from './components/modals/AddRecordModal'
import MultiAddRecordModal from './components/modals/MultiAddRecordModal'
import { usePreload, useBills } from './hooks/useDatabase.js'

/**
 * App - 应用根组件
 * 管理全局状态和页面路由
 * 预加载分类和成员数据（只加载一次）
 */
function App() {
  // 当前选中的页面
  const [currentPage, setCurrentPage] = useState('home')
  // 记一笔弹窗显示状态
  const [showAddModal, setShowAddModal] = useState(false)
  // 记多笔弹窗显示状态
  const [showMultiAddModal, setShowMultiAddModal] = useState(false)

  // 预加载分类和成员（全局只加载一次）
  const { isReady, categories, members } = usePreload()

  // 使用 useBills，传入预加载的分类和成员
  const billsHook = useBills({}, categories, members)

  // 处理创建账单
  const handleCreate = async (data) => {
    try {
      await billsHook.addBill(data)
      return Promise.resolve()
    } catch (err) {
      console.error('Create error:', err)
      return Promise.reject(err)
    }
  }

  // 渲染当前页面
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />
      case 'flow':
        return (
          <FlowPage
            billsHook={billsHook}
            categories={categories}
            members={members}
          />
        )
      case 'report':
        return <ReportPage />
      case 'category':
        return <CategoryPage />
      default:
        return <HomePage />
    }
  }

  // 加载中状态
  if (!isReady) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-gray-600">正在加载...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧导航栏 */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onAddRecord={() => setShowAddModal(true)}
        onAddMultiRecord={() => setShowMultiAddModal(true)}
      />

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto ml-64">
        {renderPage()}
      </main>

      {/* 记一笔弹窗 */}
      <AddRecordModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreate}
      />

      {/* 记多笔弹窗 */}
      <MultiAddRecordModal
        isOpen={showMultiAddModal}
        onClose={() => setShowMultiAddModal(false)}
        onSuccess={(bills) => {
          // 批量添加到状态（一次数据库批量插入，一次状态更新）
          billsHook.addBillsBatch(bills)
        }}
      />
    </div>
  )
}

export default App
