import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind 类名
 * @param  {...any} inputs 
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化金额
 * @param {number} amount 
 * @returns {string}
 */
export function formatAmount(amount) {
  const num = parseFloat(amount);
  return new Intl.NumberFormat('zh-CN', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * 格式化日期
 * @param {Date|string} date 
 * @returns {string}
 */
export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * 生成唯一ID
 * @returns {string}
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * 获取日期范围
 * @param {string} range - 'today' | 'week' | 'month' | 'year'
 * @returns {{startDate: string, endDate: string}}
 */
export function getDateRange(range) {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];
  let startDate = new Date();

  switch (range) {
    case 'today':
      startDate = today;
      break;
    case 'week':
      startDate.setDate(today.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(today.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(today.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(today.getMonth() - 1);
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate,
  };
}
