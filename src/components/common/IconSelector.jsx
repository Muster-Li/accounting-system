import { useState } from 'react'
import * as Icons from 'react-icons/ri'
import { RiArrowDownSLine } from 'react-icons/ri'

// 常用图标列表
const COMMON_ICONS = [
  'RiRestaurantLine', 'RiHomeLine', 'RiBusLine', 'RiGamepadLine',
  'RiShoppingBagLine', 'RiSmartphoneLine', 'RiHeartPulseLine', 'RiGiftLine',
  'RiEmotionHappyLine', 'RiBookLine', 'RiTShirtLine', 'RiPlaneLine',
  'RiMoneyCnyCircleLine', 'RiWalletLine', 'RiBriefcaseLine', 'RiLineChartLine',
  'RiRedPacketLine', 'RiCupLine', 'RiAppleLine', 'RiCakeLine', 'RiDrinksLine',
  'RiShoppingBasketLine', 'RiLightbulbLine', 'RiBuildingLine', 'RiBrushLine',
  'RiToolsLine', 'RiSubwayLine', 'RiTaxiLine', 'RiOilLine', 'RiParkingLine',
  'RiSettingsLine', 'RiMovieLine', 'RiRunLine', 'RiTeamLine', 'RiFootprintLine',
  'RiMagicLine', 'RiPhoneLine', 'RiWifiLine', 'RiVideoLine', 'RiHospitalLine',
  'RiMedicineBottleLine', 'RiShieldLine', 'RiMoneyCnyBoxLine', 'RiMoreLine',
  'RiCarLine', 'RiBikeLine', 'RiCameraLine', 'RiMusicLine', 'RiPaintLine',
  'RiComputerLine', 'RiPlantLine', 'RiPetLine', 'RiBankCardLine'
]

/**
 * IconSelector - 图标选择器组件
 * @param {Object} props
 * @param {string} props.value - 当前选中的图标名称
 * @param {Function} props.onChange - 选择回调
 * @param {string} props.placeholder - 占位符
 */
function IconSelector({ value, onChange, placeholder = '请选择图标' }) {
  const [isOpen, setIsOpen] = useState(false)

  // 渲染选中的图标
  const renderSelectedIcon = () => {
    if (!value) return null
    const IconComponent = Icons[value]
    if (IconComponent) {
      return <IconComponent className="text-2xl text-primary-500" />
    }
    return null
  }

  return (
    <div className="relative">
      {/* 触发按钮 */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border rounded-lg cursor-pointer transition-colors bg-white flex items-center justify-between ${
          isOpen ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-200 hover:border-primary-300'
        }`}
      >
        <div className="flex items-center gap-3">
          {value ? (
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              {renderSelectedIcon()}
            </div>
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs">图标</span>
            </div>
          )}
          <span className={value ? 'text-gray-800' : 'text-gray-400'}>
            {value || placeholder}
          </span>
        </div>
        <RiArrowDownSLine className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* 图标选择面板 */}
      {isOpen && (
        <>
          {/* 遮罩层 - 点击关闭 */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          {/* 图标网格 */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 p-4 max-h-80 overflow-y-auto">
            <div className="grid grid-cols-8 gap-2">
              {COMMON_ICONS.map((iconName) => {
                const IconComponent = Icons[iconName]
                if (!IconComponent) return null
                
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onChange(iconName)
                      setIsOpen(false)
                    }}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      value === iconName
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-primary-50 hover:text-primary-500'
                    }`}
                    title={iconName}
                  >
                    <IconComponent className="text-xl" />
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default IconSelector
