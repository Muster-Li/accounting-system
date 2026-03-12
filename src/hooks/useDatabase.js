import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getBills,
  createBill,
  updateBill,
  deleteBill,
  getCategories,
  getMembers,
  checkConnection
} from '../../lib/api.js';

// 缓存分类和成员数据（全局缓存，避免重复请求）
let categoriesCache = null;
let membersCache = null;

/**
 * 数据库连接 Hook
 */
export function useDatabase() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkConnection()
      .then(() => setConnected(true))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { connected, loading, error };
}

/**
 * 账单列表 Hook
 * 手动控制查询，不自动加载
 * @param {Object} filters - 筛选条件
 * @param {Array} externalCategories - 外部传入的分类数据（可选）
 * @param {Array} externalMembers - 外部传入的成员数据（可选）
 */
export function useBills(filters = {}, externalCategories = null, externalMembers = null) {
  const [allBills, setAllBills] = useState([]); // 存储所有账单
  const [hasLoaded, setHasLoaded] = useState(false); // 是否已加载过
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 使用外部传入的数据，或回退到缓存
  const categories = externalCategories || categoriesCache || [];
  const members = externalMembers || membersCache || [];

  // 前端根据 type 筛选账单
  const filteredBills = useMemo(() => {
    if (!filters.type) return allBills;
    return allBills.filter(bill => bill.type === filters.type);
  }, [allBills, filters.type]);

  // 构建查找映射表
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach(cat => {
      map[cat.id] = cat;
    });
    return map;
  }, [categories]);

  const memberMap = useMemo(() => {
    const map = {};
    members.forEach(member => {
      map[member.id] = member;
    });
    return map;
  }, [members]);

  // 合并后的账单数据
  const enrichedBills = useMemo(() => {
    return filteredBills.map(bill => {
      const category = categoryMap[bill.categoryId];
      const subCategory = categoryMap[bill.subCategoryId];
      const member = memberMap[bill.memberId];

      return {
        ...bill,
        category: category || { name: '-', id: bill.categoryId },
        subCategory: subCategory || null,
        member: member || { name: '-', id: bill.memberId },
      };
    });
  }, [filteredBills, categoryMap, memberMap]);

  // 前端计算统计信息
  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    filteredBills.forEach(bill => {
      const amount = parseFloat(bill.amount) || 0;
      if (bill.type === 'income') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
      }
    });

    return {
      totalIncome: totalIncome.toFixed(2),
      totalExpense: totalExpense.toFixed(2),
    };
  }, [filteredBills]);

  // 手动获取账单数据（不自动执行）
  const fetchBills = useCallback(async (force = false) => {
    // 如果已经加载过且不是强制刷新，跳过
    if (hasLoaded && !force) return;

    setLoading(true);
    try {
      const queryFilters = {
        startDate: filters.startDate,
        endDate: filters.endDate,
      };

      const billsData = await getBills(queryFilters);
      setAllBills(billsData);
      setHasLoaded(true);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch bills:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate, hasLoaded]);

  const addBill = async (data) => {
    const newBill = await createBill(data);
    setAllBills((prev) => [newBill, ...prev]);
    return newBill;
  };

  const editBill = async (id, data) => {
    const updated = await updateBill(id, data);
    setAllBills((prev) =>
      prev.map((bill) => (bill.id === id ? updated : bill))
    );
    return updated;
  };

  const removeBill = async (id) => {
    await deleteBill(id);
    setAllBills((prev) => prev.filter((bill) => bill.id !== id));
  };

  // 强制刷新
  const refresh = useCallback(async () => {
    await fetchBills(true);
  }, [fetchBills]);

  return {
    bills: enrichedBills,
    stats,
    loading,
    error,
    hasLoaded,
    fetchBills,
    refresh,
    addBill,
    editBill,
    removeBill
  };
}

/**
 * 分类列表 Hook - 只加载一次
 */
export function useCategories(type) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchData = useCallback(async () => {
    if (categoriesCache) {
      const filtered = type
        ? categoriesCache.filter(c => c.type === type)
        : categoriesCache;
      setCategories(filtered);
      return;
    }

    setLoading(true);
    try {
      const data = await getCategories(type);
      categoriesCache = data;
      setCategories(data);
      setHasLoaded(true);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  }, [type]);

  // 只在首次加载时执行
  useEffect(() => {
    if (!hasLoaded && !categoriesCache) {
      fetchData();
    } else if (categoriesCache) {
      const filtered = type
        ? categoriesCache.filter(c => c.type === type)
        : categoriesCache;
      setCategories(filtered);
      setHasLoaded(true);
    }
  }, [type, fetchData, hasLoaded]);

  return { categories, loading, hasLoaded, refetch: fetchData };
}

/**
 * 成员列表 Hook - 只加载一次
 */
export function useMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchData = useCallback(async () => {
    if (membersCache) {
      setMembers(membersCache);
      return;
    }

    setLoading(true);
    try {
      const data = await getMembers();
      membersCache = data;
      setMembers(data);
      setHasLoaded(true);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 只在首次加载时执行
  useEffect(() => {
    if (!hasLoaded && !membersCache) {
      fetchData();
    } else if (membersCache) {
      setMembers(membersCache);
      setHasLoaded(true);
    }
  }, [fetchData, hasLoaded]);

  return { members, loading, hasLoaded, refetch: fetchData };
}

/**
 * 预加载 Hook - 在 App 中使用，确保分类和成员只加载一次
 */
export function usePreload() {
  const [isReady, setIsReady] = useState(false);

  const { categories, hasLoaded: catsLoaded } = useCategories();
  const { members, hasLoaded: memsLoaded } = useMembers();

  useEffect(() => {
    if (catsLoaded && memsLoaded) {
      setIsReady(true);
    }
  }, [catsLoaded, memsLoaded]);

  return {
    isReady,
    categories,
    members
  };
}

/**
 * 账单统计 Hook（已弃用）
 */
export function useBillStats(startDate, endDate) {
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 统计信息现在由 useBills 计算
  }, [startDate, endDate]);

  return { stats, loading };
}
