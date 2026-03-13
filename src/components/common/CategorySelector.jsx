import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as Icons from 'react-icons/ri';

/**
 * CategorySelector - 分类下拉选择器组件
 * 左侧一级分类，右侧二级分类，下拉框形式
 * @param {Object} props
 * @param {Array} props.categories - 所有分类数据（扁平结构）
 * @param {string} props.type - 'expense' | 'income'
 * @param {number} props.selectedCategoryId - 选中的一级分类ID
 * @param {number} props.selectedSubCategoryId - 选中的二级分类ID
 * @param {Function} props.onSelect - 选择回调 (categoryId, subCategoryId, categoryName, subCategoryName)
 * @param {string} props.placeholder - 占位符文字
 */
function CategorySelector({ 
  categories = [], 
  type = 'expense',
  selectedCategoryId,
  selectedSubCategoryId,
  onSelect,
  placeholder = '请选择分类'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // 过滤出当前类型的分类
  const typeCategories = useMemo(() => {
    return categories.filter(c => c.type === type);
  }, [categories, type]);

  // 一级分类
  const parentCategories = useMemo(() => {
    return typeCategories.filter(c => !c.parentId);
  }, [typeCategories]);

  // 当前选中的一级分类（优先使用已选的，否则用第一个）
  const [activeParentId, setActiveParentId] = useState(selectedCategoryId || parentCategories[0]?.id);

  // 当选中的分类变化时，更新 activeParentId
  useEffect(() => {
    if (selectedCategoryId) {
      setActiveParentId(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  // 根据选中的一级分类获取二级分类
  const subCategories = useMemo(() => {
    if (!activeParentId) return [];
    return typeCategories.filter(c => c.parentId === activeParentId);
  }, [typeCategories, activeParentId]);

  // 获取当前选中的一级分类信息
  const activeParent = useMemo(() => {
    return parentCategories.find(c => c.id === activeParentId);
  }, [parentCategories, activeParentId]);

  // 获取选中的分类显示文本
  const selectedText = useMemo(() => {
    if (!selectedCategoryId) return '';
    const parent = parentCategories.find(c => c.id === selectedCategoryId);
    if (!parent) return '';
    if (!selectedSubCategoryId) return parent.name;
    const sub = typeCategories.find(c => c.id === selectedSubCategoryId);
    return `${parent.name} / ${sub?.name || ''}`;
  }, [selectedCategoryId, selectedSubCategoryId, parentCategories, typeCategories]);

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
    setIsOpen(false);
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
    setIsOpen(false);
  };

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 渲染图标组件
  const renderIcon = (iconName) => {
    if (!iconName) return <span className="text-gray-400 text-xs">-</span>;
    const IconComponent = Icons[iconName];
    if (IconComponent) {
      return <IconComponent className="text-lg" />;
    }
    return <span className="text-gray-400 text-xs">-</span>;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* 触发按钮 */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 border rounded-lg cursor-pointer transition-colors bg-white flex items-center justify-between ${
          isOpen ? 'border-orange-500 ring-1 ring-orange-500' : 'border-gray-200 hover:border-orange-300'
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedText ? (
            <span className="text-gray-800 truncate">{selectedText}</span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <Icons.RiArrowDownSLine className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* 下拉面板 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="flex h-72">
            {/* 左侧：一级分类 */}
            <div className="w-2/5 border-r border-gray-100 overflow-y-auto bg-gray-50/50">
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
                  <Icons.RiArrowRightSLine className={`text-gray-400 ${activeParentId === parent.id ? 'text-orange-500' : ''}`} />
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
                  <div className="w-6 h-6 flex items-center justify-center text-gray-600">
                    {renderIcon(activeParent.icon)}
                  </div>
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
                    <div className="w-6 h-6 flex items-center justify-center text-gray-600">
                      {renderIcon(sub.icon)}
                    </div>
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
        </div>
      )}
    </div>
  );
}

export default CategorySelector;
