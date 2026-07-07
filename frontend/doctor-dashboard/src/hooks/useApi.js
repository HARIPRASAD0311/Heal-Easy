// Generic data-fetching hook used by all pages.
// Returns { data, loading, error, refetch }

import { useState, useEffect, useCallback, useRef } from 'react'

export function useApi(apiFn, ...args) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const mounted = useRef(true)

  const run = useCallback(async () => {
    if (!apiFn) return
    setLoading(true)
    setError(null)
    try {
      const result = await apiFn(...args)
      if (mounted.current) setData(result)
    } catch (err) {
      if (mounted.current) setError(err.message ?? 'Request failed')
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [apiFn, ...args]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mounted.current = true
    run()
    return () => { mounted.current = false }
  }, [run])

  return { data, loading, error, refetch: run }
}
