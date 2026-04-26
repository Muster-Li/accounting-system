import { useState, useMemo, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns'
import { RiCalendarLine, RiArrowLeftSLine, RiArrowRightSLine, RiWalletLine, RiArrowUpLine, RiArrowDownLine, RiCalculatorLine, RiRefreshLine } from 'react-icons/ri'
import * as Icons from 'react-icons/ri'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import { getMonthlyCategoryStats, calculateMonthlyCategoryStats } from '../api/statistics.js'

// 注册 ChartJS 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// 默认颜色数组（用于没有颜色的分类）
const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8B500', '#6C5CE7', '#00CEC9', '#FD79A8', '#FDCB6E'
]

// 获取图标组件
function getIconComponent(iconName) {
  if (!iconName) return Icons.RiMoreLine
  const IconComponent = Icons[iconName]
  return IconComponent || Icons.RiMoreLine
}

/**
 * ReportPage - 报表统计页面
 * 包含：账本流水统计、每日支出折线、一级/二级分类饼图和排行
 */
function ReportPage() {
  // 默认显示上个月
  const [currentDate, setCurrentDate] = useState(() => subMonths(new Date(), 1))
  const [statsData, setStatsData] = useState(null)
  const [calculatedAt, setCalculatedAt] = useState(null)
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState(null)

  // 获取统计数据
  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const result = await getMonthlyCategoryStats(year, month)
      setStatsData(result?.statsData || null)
      setCalculatedAt(result?.calculatedAt || null)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [currentDate])

  // 计算统计数据
  const handleCalculate = async () => {
    setCalculating(true)
    setError(null)
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const result = await calculateMonthlyCategoryStats(year, month)
      setStatsData(result?.statsData || null)
      setCalculatedAt(result?.calculatedAt || null)
    } catch (err) {
      console.error('Failed to calculate stats:', err)
      setError(err.message)
    } finally {
      setCalculating(false)
    }
  }

  // 刷新数据
  const handleRefresh = () => {
    fetchStats()
  }

  // 处理数据
  const processedData = useMemo(() => {
    if (!statsData) return null

    const summary = statsData.summary || { totalIncome: 0, totalExpense: 0, expenseCount: 0 }
    const dailyTrend = statsData.dailyTrend || { days: [], amounts: [] }
    const primaryCategories = (statsData.primaryCategories || [])
      .sort((a, b) => b.amount - a.amount)
      .map((cat, index) => ({
        ...cat,
        color: cat.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
        percentage: summary.totalExpense > 0 ? ((cat.amount / summary.totalExpense) * 100).toFixed(2) : 0,
        icon: cat.icon || 'RiMoreLine'
      }))
    const subCategories = (statsData.subCategories || [])
      .sort((a, b) => b.amount - a.amount)
      .map((cat, index) => ({
        ...cat,
        color: cat.color || DEFAULT_COLORS[(index + 5) % DEFAULT_COLORS.length],
        percentage: summary.totalExpense > 0 ? ((cat.amount / summary.totalExpense) * 100).toFixed(2) : 0,
        icon: cat.icon || 'RiMoreLine'
      }))

    return {
      summary: {
        ...summary,
        balance: summary.totalIncome - summary.totalExpense
      },
      dailyTrend,
      primaryCategories,
      subCategories
    }
  }, [statsData])

  // 获取当月天数
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return eachDayOfInterval({ start, end }).map((date, index) => index + 1)
  }, [currentDate])

  // 切换月份
  const changeMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  // 折线图数据
  const lineChartData = useMemo(() => {
    const amounts = processedData?.dailyTrend?.amounts || []
    return {
      labels: processedData?.dailyTrend?.days || daysInMonth,
      datasets: [
        {
          label: '每日支出',
          data: amounts.length > 0 ? amounts : daysInMonth.map(() => 0),
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#FF6B6B',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }
      ]
    }
  }, [processedData, daysInMonth])

  // 折线图配置
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `支出: ¥${context.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11
          },
          maxTicksLimit: 10
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6',
          drawBorder: false
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11
          },
          callback: (value) => `¥${value}`
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }

  // 一级分类饼图数据
  const primaryPieData = useMemo(() => ({
    labels: processedData?.primaryCategories.map(c => c.name) || [],
    datasets: [
      {
        data: processedData?.primaryCategories.map(c => c.amount) || [],
        backgroundColor: processedData?.primaryCategories.map(c => c.color) || [],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  }), [processedData])

  // 二级分类饼图数据
  const subPieData = useMemo(() => ({
    labels: processedData?.subCategories.map(c => c.name) || [],
    datasets: [
      {
        data: processedData?.subCategories.map(c => c.amount) || [],
        backgroundColor: processedData?.subCategories.map(c => c.color) || [],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  }), [processedData])

  // 饼图配置
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const label = context.label || ''
            const value = context.parsed
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(2)
            return `${label}: ¥${value.toFixed(2)} (${percentage}%)`
          }
        }
      }
    }
  }

  // 格式化最后计算时间
  const formatCalculatedAt = (dateStr) => {
    if (!dateStr) return '未计算'
    try {
      const date = new Date(dateStr)
      return `计算时间: ${format(date, 'MM-dd HH:mm')}`
    } catch {
      return '未计算'
    }
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* 页面标题和月份选择 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">基础统计</h1>
          <p className="text-gray-500 text-sm mt-1">查看收支统计分析</p>
        </div>

        <div className="flex items-center gap-4">
          {/* 最后计算时间 */}
          <span className="text-sm text-gray-400">
            {formatCalculatedAt(calculatedAt)}
          </span>

          {/* 月份选择器 */}
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RiArrowLeftSLine className="text-gray-500 text-xl" />
            </button>
            <div className="flex items-center gap-2 px-2">
              <RiCalendarLine className="text-gray-400" />
              <span className="text-gray-700 font-medium">
                {format(currentDate, 'yyyy年M月')}
              </span>
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RiArrowRightSLine className="text-gray-500 text-xl" />
            </button>
          </div>

          {/* 计算和刷新按钮 */}
          <button
            onClick={handleCalculate}
            disabled={calculating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {calculating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <RiCalculatorLine className="text-lg" />
            )}
            <span>计算</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm border border-gray-200"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <RiRefreshLine className="text-lg" />
            )}
            <span>刷新</span>
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          加载失败: {error}
        </div>
      )}

      {/* 第一行：账本流水统计 + 每日支出折线 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 账本流水统计卡片 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="relative p-6 bg-gradient-to-br from-emerald-400 to-teal-500">
            {/* 装饰背景 */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <circle cx="80" cy="20" r="30" fill="white" />
                <circle cx="20" cy="80" r="20" fill="white" />
              </svg>
            </div>

            <div className="relative z-10">
              <h3 className="text-white/80 text-sm font-medium mb-4">账本流水统计</h3>
              {processedData ? (
                <div className="text-white">
                  <div className="text-4xl font-bold mb-1">
                    {processedData.summary.balance >= 0 ? '+' : ''}{processedData.summary.balance.toFixed(2)}
                  </div>
                  <div className="text-white/70 text-sm mb-4">结余</div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <RiArrowUpLine className="text-white" />
                      </div>
                      <div>
                        <div className="text-white/70 text-xs">总收入</div>
                        <div className="font-medium">¥{processedData.summary.totalIncome.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <RiArrowDownLine className="text-white" />
                      </div>
                      <div>
                        <div className="text-white/70 text-xs">总支出</div>
                        <div className="font-medium">¥{processedData.summary.totalExpense.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-white text-center py-8">
                  <div className="text-white/60 text-sm">暂无数据</div>
                  <div className="text-white/40 text-xs mt-1">点击"计算"按钮生成统计</div>
                </div>
              )}
            </div>
          </div>

          {/* 记账里程碑 */}
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <RiWalletLine className="text-blue-500 text-lg" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">记账里程碑</div>
              <div className="text-xs text-gray-400">
                {processedData ? `本月已记账 ${processedData.summary.expenseCount} 笔` : '暂无数据'}
              </div>
            </div>
          </div>
        </div>

        {/* 本月每日支出折线图 */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 font-semibold">本月每日支出</h3>
            <div className="text-right">
              <div className="text-xs text-gray-400">总支出</div>
              <div className="text-sm font-medium text-red-500">
                {processedData ? `¥${processedData.summary.totalExpense.toFixed(2)}` : '¥0.00'}
              </div>
            </div>
          </div>
          <div className="h-48">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>
      </div>

      {/* 第二行：分类统计（左：一级分类，右：二级分类） */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左边：一级分类（饼图在上，排行在下） */}
        <div className="space-y-6">
          {/* 一级分类饼图 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-800 font-semibold">一级支出分类统计</h3>
              <div className="text-sm text-gray-500">
                总支出 <span className="font-medium text-gray-800">¥{processedData ? processedData.summary.totalExpense.toFixed(2) : '0.00'}</span>
              </div>
            </div>
            {processedData && processedData.primaryCategories.length > 0 ? (
              <div className="flex items-center gap-8">
                <div className="w-40 h-40">
                  <Doughnut data={primaryPieData} options={pieOptions} />
                </div>
                <div className="flex-1 space-y-3">
                  {processedData.primaryCategories.slice(0, 5).map((cat) => (
                    <div key={cat.id} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm text-gray-600 flex-1">{cat.name}</span>
                      <span className="text-sm font-medium text-gray-800">{cat.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                暂无数据
              </div>
            )}
          </div>

          {/* 一级分类排行 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-gray-800 font-semibold mb-4">一级分类支出排行</h3>
            {processedData && processedData.primaryCategories.length > 0 ? (
              <div className="space-y-4">
                {processedData.primaryCategories.map((cat, index) => {
                  const IconComponent = getIconComponent(cat.icon)
                  return (
                    <div key={cat.id} className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                        {index + 1}
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                        <IconComponent className="text-lg" style={{ color: cat.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                          <span className="text-sm font-medium text-gray-800">¥{cat.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-12 text-right">{cat.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                暂无数据
              </div>
            )}
          </div>
        </div>

        {/* 右边：二级分类（饼图在上，排行在下） */}
        <div className="space-y-6">
          {/* 二级分类饼图 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-800 font-semibold">二级支出分类统计</h3>
              <div className="text-sm text-gray-500">
                总支出 <span className="font-medium text-gray-800">¥{processedData ? processedData.summary.totalExpense.toFixed(2) : '0.00'}</span>
              </div>
            </div>
            {processedData && processedData.subCategories.length > 0 ? (
              <div className="flex items-center gap-8">
                <div className="w-40 h-40">
                  <Doughnut data={subPieData} options={pieOptions} />
                </div>
                <div className="flex-1 space-y-3">
                  {processedData.subCategories.slice(0, 5).map((cat) => (
                    <div key={cat.id} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm text-gray-600 flex-1">{cat.name}</span>
                      <span className="text-sm font-medium text-gray-800">{cat.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                暂无数据
              </div>
            )}
          </div>

          {/* 二级分类排行 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-gray-800 font-semibold mb-4">二级分类支出排行</h3>
            {processedData && processedData.subCategories.length > 0 ? (
              <div className="space-y-4">
                {processedData.subCategories.map((cat, index) => {
                  const IconComponent = getIconComponent(cat.icon)
                  return (
                    <div key={cat.id} className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                        {index + 1}
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                        <IconComponent className="text-lg" style={{ color: cat.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                          <span className="text-sm font-medium text-gray-800">¥{cat.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-12 text-right">{cat.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                暂无数据
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportPage
