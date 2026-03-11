import React from 'react'

/**
 * ProgressBar - 进度条组件
 * @param {Object} props
 * @param {number} props.percentage - 百分比 (0-100)
 * @param {string} props.color - 进度条颜色
 * @param {number} props.height - 进度条高度
 * @param {boolean} props.showLabel - 是否显示百分比标签
 * @param {boolean} props.animated - 是否启用动画
 */
function ProgressBar({ 
  percentage = 0, 
  color = '#f97316', 
  height = 8,
  showLabel = false,
  animated = true
}) {
  // 限制百分比在0-100之间
  const validPercentage = Math.min(Math.max(percentage, 0), 100)

  return (
    <div className="flex items-center gap-3">
      {/* 进度条容器 */}
      <div 
        className="flex-1 bg-gray-100 rounded-full overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <div
          className={`h-full rounded-full progress-animate ${animated ? '' : ''}`}
          style={{ 
            width: `${validPercentage}%`,
            backgroundColor: color,
            transition: animated ? 'width 0.6s ease' : 'none'
          }}
        />
      </div>
      
      {/* 百分比标签 */}
      {showLabel && (
        <span className="text-sm text-gray-500 min-w-[50px] text-right">
          {validPercentage.toFixed(2)}%
        </span>
      )}
    </div>
  )
}

export default ProgressBar
