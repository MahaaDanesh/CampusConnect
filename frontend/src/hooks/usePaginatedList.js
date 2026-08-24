import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../api/axios.js';

/**
 * Generic hook to fetch a paginated, filterable list from a `list(params)` API method.
 * Handles loading/error/empty state and exposes a `refresh` + `setFilters` API.
 */
export default function usePaginatedList(listFn, initialFilters = {}) {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ page: 1, limit: 10, ...initialFilters });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [extra, setExtra] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listFn(filters);
      setItems(res.data.data || []);
      setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });
      const { data, pagination: p, success, ...rest } = res.data;
      setExtra(rest);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value, page: key === 'page' ? value : 1 }));
  };

  return {
    items,
    setItems,
    filters,
    setFilters,
    updateFilter,
    pagination,
    loading,
    error,
    refresh: fetchData,
    extra,
  };
}
