import { useState, useRef } from "react";

/**
 * useMutation — hook for write operations (POST / PUT / PATCH / DELETE).
 *
 * Unlike useFetch, this does NOT fire automatically.
 * Call `mutate(payload)` to trigger it.
 *
 * @param {Function} serviceCall  — fn that accepts the payload and returns a Promise
 * @param {{ onSuccess?, onError? }} options
 *
 * Returns:
 *   mutate    — fn(payload?) triggers the call
 *   loading   — true while in-flight
 *   error     — error message string (null on success)
 *   data      — last successful response
 *   status    — "idle" | "loading" | "success" | "error"
 *   reset     — resets state back to idle
 *
 * Example:
 *   const { mutate, loading, error } = useMutation(
 *     (data) => consultationService.updateConsultation(id, data),
 *     { onSuccess: () => navigate("/doctor/queue") }
 *   );
 *   <button onClick={() => mutate({ notes, diagnosis })}>Save</button>
 */
export default function useMutation(serviceCall, { onSuccess, onError } = {}) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [status,  setStatus]  = useState("idle");

  const mounted = useRef(true);

  async function mutate(payload) {
    mounted.current = true;
    setLoading(true);
    setError(null);
    setStatus("loading");

    try {
      const result = await serviceCall(payload);
      if (mounted.current) {
        setData(result);
        setStatus("success");
        onSuccess?.(result);
      }
      return result;
    } catch (err) {
      const msg = err?.message ?? "Operation failed. Please try again.";
      if (mounted.current) {
        setError(msg);
        setStatus("error");
        onError?.(err);
      }
      throw err; // re-throw so callers can handle inline if needed
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  function reset() {
    setData(null);
    setError(null);
    setLoading(false);
    setStatus("idle");
  }

  return { mutate, loading, error, data, status, reset };
}
