// 账单服务 - 前端 API 调用
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// 通用请求函数
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// 账单 API
export const billAPI = {
  // 获取账单列表
  getList: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const result = await fetchAPI(`/bills${queryString ? `?${queryString}` : ''}`);
    return result;
  },

  // 创建账单
  create: (data) => fetchAPI('/bills', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 更新账单
  update: (id, data) => fetchAPI(`/bills?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // 删除账单
  delete: (id) => fetchAPI(`/bills?id=${id}`, {
    method: 'DELETE',
  }),
};

// 分类 API
export const categoryAPI = {
  getList: (type) => fetchAPI(`/categories${type ? `?type=${type}` : ''}`),
  create: (data) => fetchAPI('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/categories?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/categories?id=${id}`, {
    method: 'DELETE',
  }),
};

// 成员 API
export const memberAPI = {
  getList: () => fetchAPI('/members'),
};
