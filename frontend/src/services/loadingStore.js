/**
 * loadingStore — lightweight global request counter.
 *
 * Tracks how many API requests are in-flight so any component can
 * subscribe to a global "is loading" state without Redux or Context.
 *
 * Usage:
 *   import { subscribe, isLoading } from "./loadingStore";
 *   const [busy, setBusy] = useState(isLoading());
 *   useEffect(() => subscribe(setBusy), []);
 */

let count = 0;
const listeners = new Set();

function notify() {
  const busy = count > 0;
  listeners.forEach((fn) => fn(busy));
}

export function increment() {
  count++;
  notify();
}

export function decrement() {
  count = Math.max(0, count - 1);
  notify();
}

/** Returns true if any request is currently in-flight. */
export function isLoading() {
  return count > 0;
}

/**
 * Subscribe to loading state changes.
 * @param {(busy: boolean) => void} fn
 * @returns {() => void} unsubscribe
 */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
