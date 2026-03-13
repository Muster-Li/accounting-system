import Modal from './Modal'
import { RiAlertLine } from 'react-icons/ri'

/**
 * ConfirmModal - 确认弹窗组件
 * @param {Object} props
 * @param {boolean} props.isOpen - 是否显示
 * @param {Function} props.onClose - 关闭回调
 * @param {Function} props.onConfirm - 确认回调
 * @param {string} props.title - 标题
 * @param {string} props.message - 提示消息
 * @param {string} props.confirmText - 确认按钮文字
 * @param {string} props.cancelText - 取消按钮文字
 * @param {string} props.type - 类型 (danger|warning|info)
 */
function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = '确认操作',
  message = '确定要执行此操作吗？',
  confirmText = '确认',
  cancelText = '取消',
  type = 'danger'
}) {
  const typeStyles = {
    danger: {
      icon: 'text-red-500 bg-red-50',
      button: 'bg-red-500 hover:bg-red-600'
    },
    warning: {
      icon: 'text-yellow-500 bg-yellow-50',
      button: 'bg-yellow-500 hover:bg-yellow-600'
    },
    info: {
      icon: 'text-blue-500 bg-blue-50',
      button: 'bg-blue-500 hover:bg-blue-600'
    }
  }

  const style = typeStyles[type]

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${style.icon}`}>
            <RiAlertLine className="text-2xl" />
          </div>
          <div className="flex-1">
            <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${style.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmModal
