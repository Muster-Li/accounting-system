import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

/**
 * DailyChart - 每日支出折线图组件
 * @param {Object} monthlyTrend - 月度趋势数据 { day: [], expense: [] }
 */
function DailyChart({ monthlyTrend }) {
  // 默认空数据
  const defaultData = {
    day: [],
    expense: []
  }

  const data = monthlyTrend || defaultData
  const days = data.day || []
  const expenseData = data.expense || []

  // 图表数据配置
  const chartData = {
    labels: days,
    datasets: [
      {
        label: '支出',
        data: expenseData,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.4,
        fill: true,
      },
    ],
  }

  // 图表选项配置
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false, // 只有一个数据集，隐藏图例
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 13,
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          label: function(context) {
            let label = '支出: '
            if (context.parsed.y !== null) {
              label += '¥' + context.parsed.y.toFixed(2)
            }
            return label
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#9ca3af',
          maxTicksLimit: 10,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#9ca3af',
          callback: function(value) {
            if (value === 0) return '0'
            if (value >= 1000) return (value / 1000) + 'k'
            return value
          }
        },
      },
    },
  }

  // 计算总支出
  const totalExpense = expenseData.reduce((sum, val) => sum + (val || 0), 0)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">本月每日支出</h3>
        <span className="text-sm text-gray-500">
          总支出 <span className="font-medium text-expense">¥{totalExpense.toFixed(2)}</span>
        </span>
      </div>
      <div className="chart-container">
        {days.length > 0 ? (
          <Line data={chartData} options={options} height={300} />
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            暂无数据
          </div>
        )}
      </div>
    </div>
  )
}

export default DailyChart
