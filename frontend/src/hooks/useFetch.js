import { useState, useEffect, useCallback, useRef } from "react";

/**
 * useFetch — generic data-fetching hook.
 *
 * @param {Function|null} serviceCall — async fn; pass null to skip
 * @param {Array}         deps        — refetch when these change
 * @param {{ skip?: boolean }} options — set skip:true to suppress the call
 */
export default function useFetch(serviceCall, deps = [], { skip = false } = {}) {
  const shouldRun = !skip && serviceCall != null;

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(shouldRun);
  const [error,   setError]   = useState(null);
  const [status,  setStatus]  = useState(shouldRun ? "loading" : "idle");

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const execute = useCallback(async () => {
    if (!serviceCall || skip) return;

    if (mounted.current) {
      setLoading(true);
      setError(null);
      setStatus("loading");
    }

    try {
      const result = await serviceCall();
      if (mounted.current) {
        setData(result);
        setStatus("success");
      }
    } catch (err) {
      if (mounted.current) {
        setError(err?.message ?? "Something went wrong. Please try again.");
        setStatus("error");
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, status, refetch: execute };
}
