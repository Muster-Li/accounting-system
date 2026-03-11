import React from 'react'
import AssetCard from '../components/home/AssetCard'
import StatCard from '../components/home/StatCard'
import DailyChart from '../components/home/DailyChart'
import RankingList from '../components/home/RankingList'
import IncomeCategories from '../components/home/IncomeCategories'
import MemberStats from '../components/home/MemberStats'

/**
 * HomePage - 首页组件
 * 包含资产卡片、统计卡片、图表、排行等模块
 */
function HomePage() {
  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">首页</h1>
        <p className="text-gray-500 text-sm mt-1">查看您的财务概览</p>
      </div>

      {/* 主要内容区 */}
      <div className="grid grid-cols-12 gap-6">
        {/* 左侧区域 */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* 资产卡片 */}
          <AssetCard />

          {/* 每日收支图表 */}
          <DailyChart />

          {/* 分类收入统计 */}
          <IncomeCategories />
        </div>

        {/* 右侧区域 */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* 今日/本月/本年统计 */}
          <StatCard />

          {/* 分类支出排行 */}
          <RankingList />

          {/* 成员收支统计 */}
          <MemberStats />
        </div>
      </div>
    </div>
  )
}

export default HomePage
