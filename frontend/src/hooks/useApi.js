// ─────────────────────────────────────────────────────────────
//  useApi – generic data-fetching hook with loading/error state
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';

/**
 * useApi(apiFn, deps?)
 *
 * @param {Function} apiFn  – async function that returns data
 * @param {Array}    deps   – re-fetch when these change
 *
 * Returns { data, loading, error, refetch }
 */
export function useApi(apiFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn();
      // Backend wraps in { success, data } or { success, data: { ... } }
      setData(result?.data ?? result);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * useMutation(apiFn)
 *
 * Returns { mutate, loading, error, data }
 * Call mutate(args) to trigger the API call.
 */
export function useMutation(apiFn) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...args);
      setData(result?.data ?? result);
      return result?.data ?? result;
    } catch (err) {
      setError(err.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  return { mutate, loading, error, data };
}
