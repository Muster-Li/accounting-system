// API 配置
export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:3000/api';

// 通用请求函数
export async function fetchAPI(endpoint, options = {}) {
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
  getList: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/bills${queryString ? `?${queryString}` : ''}`);
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
};

// 成员 API
export const memberAPI = {
  getList: () => fetchAPI('/members'),
};

// 账户 API
export const accountAPI = {
  getList: () => fetchAPI('/accounts'),
};
