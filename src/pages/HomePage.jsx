import React, { useState, useEffect, useCallback } from 'react'
import StatCard from '../components/home/StatCard'
import DailyChart from '../components/home/DailyChart'
import RankingList from '../components/home/RankingList'
import IncomeCategories from '../components/home/IncomeCategories'
import MemberStats from '../components/home/MemberStats'
import { getHomeStatistics, calculateHomeStatistics } from '../api/statistics'
import { RiRefreshLine, RiCalculatorLine } from 'react-icons/ri'

/**
 * HomePage - 首页组件
 * 包含资产卡片、统计卡片、图表、排行等模块
 * 数据从 statistics 表获取
 */
function HomePage() {
  const [statsData, setStatsData] = useState(null)
  const [calculatedAt, setCalculatedAt] = useState(null)
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)

  // 加载统计数据
  const loadStatistics = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getHomeStatistics()
      if (result) {
        setStatsData(result.statsData)
        setCalculatedAt(result.calculatedAt)
      }
    } catch (error) {
      console.error('Failed to load statistics:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 计算统计数据
  const handleCalculate = async () => {
    setCalculating(true)
    try {
      const result = await calculateHomeStatistics()
      if (result) {
        setStatsData(result.statsData)
        setCalculatedAt(result.calculatedAt)
      }
    } catch (error) {
      console.error('Failed to calculate statistics:', error)
    } finally {
      setCalculating(false)
    }
  }

  // 刷新数据
  const handleRefresh = () => {
    loadStatistics()
  }

  // 页面加载时获取数据
  useEffect(() => {
    loadStatistics()
  }, [loadStatistics])

  // 格式化计算时间
  const formatCalculatedTime = (timestamp) => {
    if (!timestamp) return '未计算'
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* 页面标题和操作按钮 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">首页</h1>
          <p className="text-gray-500 text-sm mt-1">查看您的财务概览</p>
        </div>
        <div className="flex items-center gap-3">
          {/* 上次计算时间 */}
          <span className="text-xs text-gray-400">
            上次计算: {formatCalculatedTime(calculatedAt)}
          </span>
          {/* 计算按钮 */}
          <button
            onClick={handleCalculate}
            disabled={calculating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <RiCalculatorLine className={calculating ? 'animate-spin' : ''} />
            {calculating ? '计算中...' : '计算'}
          </button>
          {/* 刷新按钮 */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <RiRefreshLine className={loading ? 'animate-spin' : ''} />
            {loading ? '刷新中...' : '刷新'}
          </button>
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="grid grid-cols-12 gap-6">
        {/* 左侧区域 - 占8列 */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* 每日支出图表 */}
          <DailyChart monthlyTrend={statsData?.monthly_trend} />

          {/* 分类收入统计 */}
          <IncomeCategories categoryIncome={statsData?.category_income} />

          {/* 成员收支统计 */}
          <MemberStats memberStats={statsData?.member_stats} />
        </div>

        {/* 右侧区域 - 占4列 */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* 今日/本月/本年统计 - 放在右侧最上方 */}
          <StatCard 
            today={statsData?.today}
            month={statsData?.month}
            year={statsData?.year}
          />

          {/* 分类支出排行 */}
          <RankingList categoryExpense={statsData?.category_expense} />
        </div>
      </div>
    </div>
  )
}

export default HomePage
