import React from 'react'
import { formatAmount } from '../../utils/helpers'

/**
 * MemberStats - 成员收支统计组件
 */
function MemberStats() {
  // 成员数据（与截图一致）
  const members = [
    { 
      id: 'qingxia', 
      name: '青霞', 
      income: 0, 
      expense: 1634.77,
      role: '成员',
      avatarColor: 'bg-pink-400'
    },
    { 
      id: 'ruihan', 
      name: '瑞韩', 
      income: 0, 
      expense: 8734.13,
      role: '成员',
      avatarColor: 'bg-blue-400'
    },
  ]

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* 标题 */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">本月各成员收支</h3>

      {/* 成员列表 */}
      <div className="space-y-4">
        {members.map(member => (
          <div 
            key={member.id}
            className="flex items-center justify-between"
          >
            {/* 左侧：头像+信息 */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${member.avatarColor} rounded-full flex items-center justify-center text-white font-medium`}>
                {member.name[0]}
              </div>
              <div>
                <p className="font-medium text-gray-800">{member.name}</p>
                <p className="text-xs text-gray-400">{member.role}</p>
              </div>
            </div>

            {/* 右侧：收支金额 */}
            <div className="text-right text-sm">
              <p className="text-gray-500">
                总收入 <span className="text-income font-medium">{formatAmount(member.income)}</span>
              </p>
              <p className="text-gray-500">
                总支出 <span className="text-expense font-medium">{formatAmount(member.expense)}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MemberStats
