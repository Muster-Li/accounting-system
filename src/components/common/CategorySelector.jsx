import React, { useState, useMemo } from 'react';
import { RiArrowRightSLine } from 'react-icons/ri';

/**
 * CategorySelector - 分类选择器组件
 * 左侧一级分类，右侧二级分类，类似图片中的样式
 * @param {Object} props
 * @param {Array} props.categories - 所有分类数据（扁平结构）
 * @param {string} props.type - 'expense' | 'income'
 * @param {number} props.selectedCategoryId - 选中的一级分类ID
 * @param {number} props.selectedSubCategoryId - 选中的二级分类ID
 * @param {Function} props.onSelect - 选择回调 (categoryId, subCategoryId, categoryName, subCategoryName)
 * @param {Function} props.onClose - 关闭回调
 */
function CategorySelector({ 
  categories = [], 
  type = 'expense',
  selectedCategoryId,
  selectedSubCategoryId,
  onSelect,
  onClose 
}) {
  // 过滤出当前类型的分类
  const typeCategories = useMemo(() => {
    return categories.filter(c => c.type === type);
  }, [categories, type]);

  // 一级分类
  const parentCategories = useMemo(() => {
    return typeCategories.filter(c => !c.parentId);
  }, [typeCategories]);

  // 当前选中的一级分类
  const [activeParentId, setActiveParentId] = useState(selectedCategoryId || parentCategories[0]?.id);

  // 根据选中的一级分类获取二级分类
  const subCategories = useMemo(() => {
    if (!activeParentId) return [];
    return typeCategories.filter(c => c.parentId === activeParentId);
  }, [typeCategories, activeParentId]);

  // 获取当前选中的一级分类信息
  const activeParent = useMemo(() => {
    return parentCategories.find(c => c.id === activeParentId);
  }, [parentCategories, activeParentId]);

  // 处理一级分类点击
  const handleParentClick = (parentId) => {
    setActiveParentId(parentId);
  };

  // 处理二级分类点击（选择完成）
  const handleSubCategoryClick = (subCategory) => {
    const parent = parentCategories.find(c => c.id === activeParentId);
    onSelect({
      categoryId: activeParentId,
      subCategoryId: subCategory?.id || null,
      categoryName: parent?.name || '',
      subCategoryName: subCategory?.name || '',
    });
  };

  // 只选择一级分类（点击一级分类本身）
  const handleSelectParentOnly = () => {
    const parent = parentCategories.find(c => c.id === activeParentId);
    onSelect({
      categoryId: activeParentId,
      subCategoryId: null,
      categoryName: parent?.name || '',
      subCategoryName: '',
    });
  };

  // 图标映射（简化版，可以根据需要扩展）
  const getIcon = (categoryName) => {
    const iconMap = {
      '食品酒水': '🍜',
      '居家生活': '🏠',
      '交流通讯': '📱',
      '休闲娱乐': '🎮',
      '人情费用': '🎁',
      '宝宝费用': '👶',
      '出差旅游': '✈️',
      '职业收入': '💼',
      '其他收入': '💰',
    };
    return iconMap[categoryName] || '📋';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* 选择器内容 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-base font-medium text-gray-800">选择分类</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            取消
          </button>
        </div>

        {/* 分类选择区域 */}
        <div className="flex h-80">
          {/* 左侧：一级分类 */}
          <div className="w-1/3 border-r border-gray-100 overflow-y-auto bg-gray-50/50">
            {parentCategories.map(parent => (
              <div
                key={parent.id}
                onClick={() => handleParentClick(parent.id)}
                className={`flex items-center justify-between px-3 py-3 cursor-pointer transition-colors ${
                  activeParentId === parent.id
                    ? 'bg-white text-orange-500 border-l-3 border-orange-500'
                    : 'text-gray-700 hover:bg-white/50'
                }`}
              >
                <span className="text-sm font-medium truncate">{parent.name}</span>
                <RiArrowRightSLine className={`text-gray-400 ${activeParentId === parent.id ? 'text-orange-500' : ''}`} />
              </div>
            ))}
          </div>

          {/* 右侧：二级分类 */}
          <div className="flex-1 overflow-y-auto p-2">
            {/* 选择一级分类本身 */}
            {activeParent && (
              <div
                onClick={handleSelectParentOnly}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors mb-1 ${
                  selectedCategoryId === activeParentId && !selectedSubCategoryId
                    ? 'bg-orange-50 text-orange-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{getIcon(activeParent.name)}</span>
                <span className="text-sm">{activeParent.name}（不分具体）</span>
              </div>
            )}

            {/* 二级分类列表 */}
            <div className="space-y-1">
              {subCategories.map(sub => (
                <div
                  key={sub.id}
                  onClick={() => handleSubCategoryClick(sub)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    selectedSubCategoryId === sub.id
                      ? 'bg-orange-50 text-orange-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{getIcon(sub.name)}</span>
                  <span className="text-sm">{sub.name}</span>
                </div>
              ))}
            </div>

            {/* 空状态 */}
            {subCategories.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                暂无二级分类
              </div>
            )}
          </div>
        </div>

        {/* 底部提示 */}
        <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 text-center border-t border-gray-100">
          点击左侧选择大类，点击右侧选择具体分类
        </div>
      </div>
    </div>
  );
}

export default CategorySelector;
