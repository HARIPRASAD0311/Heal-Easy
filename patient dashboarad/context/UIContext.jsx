import { createContext, useCallback, useContext, useRef, useState } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState('');
  const [modalRedirect, setModalRedirect] = useState(null);
  const lastFocused = useRef(null);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2400);
  }, []);

  const openLoginModal = useCallback((reason, redirectTo) => {
    lastFocused.current = document.activeElement;
    setModalReason(reason || '');
    setModalRedirect(redirectTo || null);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLoginModal = useCallback(() => {
    setModalOpen(false);
    document.body.style.overflow = '';
    if (lastFocused.current && lastFocused.current.focus) {
      lastFocused.current.focus();
    }
  }, []);

  const value = {
    toastMessage,
    toastVisible,
    showToast,
    modalOpen,
    modalReason,
    modalRedirect,
    openLoginModal,
    closeLoginModal,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within a UIProvider');
  return ctx;
}
