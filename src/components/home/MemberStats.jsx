import React from 'react'
import { formatAmount } from '../../utils/helpers'

/**
 * MemberStats - 成员收支统计组件
 * @param {Array} memberStats - 成员统计数据 [{ id, name, income, expense }]
 */
function MemberStats({ memberStats }) {
  // 处理数据
  const members = (memberStats || []).map(member => ({
    ...member,
    income: member.income || 0,
    expense: member.expense || 0,
    avatarColor: getAvatarColor(member.id)
  }))

  // 根据 ID 获取头像颜色
  function getAvatarColor(id) {
    const colors = ['bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-indigo-400']
    if (!id) return colors[0]
    const index = (parseInt(id) || 0) % colors.length
    return colors[index]
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* 标题 */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">本月各成员收支</h3>

      {/* 成员列表 */}
      <div className="space-y-4">
        {members.length > 0 ? (
          members.map(member => (
            <div 
              key={member.id}
              className="flex items-center justify-between"
            >
              {/* 左侧：头像+信息 */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${member.avatarColor} rounded-full flex items-center justify-center text-white font-medium`}>
                  {member.name ? member.name[0] : '?'}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{member.name || '未命名'}</p>
                  <p className="text-xs text-gray-400">成员</p>
                </div>
              </div>

            {/* 右侧：收支金额 - 支出在上面 */}
            <div className="text-right text-sm">
              <p className="text-gray-500">
                支出 <span className="text-expense font-medium">-{formatAmount(member.expense)}</span>
              </p>
              <p className="text-gray-500">
                收入 <span className="text-income font-medium">{member.income > 0 ? '+' : ''}{formatAmount(member.income)}</span>
              </p>
            </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">暂无成员数据</div>
        )}
      </div>
    </div>
  )
}

export default MemberStats

