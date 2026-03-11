import React from 'react'
import { formatAmount } from '../../utils/helpers'

/**
 * AssetCard - 资产卡片组件
 * 显示净资产、总资产、总负债信息
 */
function AssetCard() {
  // 资产数据（与截图一致）
  const assetData = {
    netAssets: -10368.90,
    totalAssets: -10368.90,
    totalLiabilities: 0.00,
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 h-48">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        {/* 模拟海边家庭背景图 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-400" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-600/50 to-transparent" />
        {/* 装饰圆 */}
        <div className="absolute top-4 right-4 w-24 h-24 bg-white/10 rounded-full" />
        <div className="absolute top-12 right-20 w-16 h-16 bg-white/5 rounded-full" />
      </div>

      {/* 内容 */}
      <div className="relative z-10">
        <p className="text-blue-100 text-sm mb-1">净资产</p>
        <h2 className="text-4xl font-bold mb-4">
          {assetData.netAssets < 0 ? '-' : ''}¥{formatAmount(Math.abs(assetData.netAssets))}
        </h2>
        
        <div className="flex gap-8">
          <div>
            <p className="text-blue-100 text-xs mb-1">总资产</p>
            <p className="font-semibold">
              {assetData.totalAssets < 0 ? '-' : ''}¥{formatAmount(Math.abs(assetData.totalAssets))}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-xs mb-1">总负债</p>
            <p className="font-semibold">¥{formatAmount(assetData.totalLiabilities)}</p>
          </div>
        </div>
      </div>

      {/* 装饰性家庭图标 */}
      <div className="absolute bottom-4 right-4 text-white/20">
        <svg width="80" height="60" viewBox="0 0 80 60" fill="currentColor">
          <ellipse cx="40" cy="55" rx="35" ry="5" opacity="0.3" />
          <circle cx="25" cy="25" r="8" />
          <rect x="17" y="33" width="16" height="20" rx="3" />
          <circle cx="40" cy="20" r="10" />
          <rect x="30" y="30" width="20" height="25" rx="3" />
          <circle cx="55" cy="28" r="7" />
          <rect x="48" y="35" width="14" height="18" rx="3" />
        </svg>
      </div>
    </div>
  )
}

export default AssetCard
