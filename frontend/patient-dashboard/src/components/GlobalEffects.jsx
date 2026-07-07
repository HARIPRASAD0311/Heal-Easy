import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';

function attachRipple(el, evt) {
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.4;
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = size + 'px';

  const x = (evt.clientX ?? rect.left + rect.width / 2) - rect.left - size / 2;
  const y = (evt.clientY ?? rect.top + rect.height / 2) - rect.top - size / 2;
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';

  el.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

export default function GlobalEffects() {
  const { showToast, openLoginModal } = useUI();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleRipple(evt) {
      const el = evt.target.closest('.btn, .icon-btn, .quick-action, .filter-pill');
      if (!el) return;
      const computed = window.getComputedStyle(el);
      if (computed.position === 'static') el.style.position = 'relative';
      attachRipple(el, evt);
    }

    function handleFavourite(evt) {
      const btn = evt.target.closest('.hospital-fav');
      if (!btn) return;
      btn.classList.toggle('is-favourited');
      const label = btn.classList.contains('is-favourited')
        ? 'Saved to favourites'
        : 'Removed from favourites';
      showToast(label);
    }

    function handleAuthGate(evt) {
      const trigger = evt.target.closest('[data-requires-auth]');
      if (!trigger) return;
      evt.preventDefault();
      const redirectTo = trigger.getAttribute('data-auth-redirect');
      if (isAuthenticated) {
        if (redirectTo) navigate(redirectTo);
        return;
      }
      openLoginModal(trigger.getAttribute('data-requires-auth'), redirectTo);
    }

    document.addEventListener('click', handleRipple);
    document.addEventListener('click', handleFavourite);
    document.addEventListener('click', handleAuthGate);

    return () => {
      document.removeEventListener('click', handleRipple);
      document.removeEventListener('click', handleFavourite);
      document.removeEventListener('click', handleAuthGate);
    };
  }, [showToast, openLoginModal, isAuthenticated, navigate]);

  return null;
}
