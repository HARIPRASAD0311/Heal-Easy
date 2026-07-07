import { useUI } from '../context/UIContext';

export default function Toast() {
  const { toastMessage, toastVisible } = useUI();

  return (
    <div className={`toast${toastVisible ? ' is-visible' : ''}`} role="status" aria-live="polite">
      {toastMessage}
    </div>
  );
}
