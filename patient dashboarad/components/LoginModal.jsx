import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';

export default function LoginModal() {
  const {modalOpen,modalReason,modalRedirect,closeLoginModal,showToast,} = useUI();

  const { login } = useAuth();
  const navigate = useNavigate();

  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (modalOpen) {
      const firstInput = modalRef.current?.querySelector('input');
      firstInput?.focus();
    } else {
      setEmail('');
      setPassword('');
      setSubmitting(false);
      setError('');
    }
  }, [modalOpen]);

  useEffect(() => {
    function handleKeydown(e) {
      if (!modalOpen) return;

      if (e.key === 'Escape') {
        closeLoginModal();
      }

      if (e.key === 'Tab') {
        const focusables =
          modalRef.current?.querySelectorAll(
            'input,button,a'
          ) || [];

        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeydown);

    return () =>
      document.removeEventListener('keydown', handleKeydown);
  }, [modalOpen, closeLoginModal]);

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) {
      closeLoginModal();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError('');

    try {
      await login(email, password);

      showToast('Welcome back');

      closeLoginModal();

      if (modalRedirect) {
        navigate(modalRedirect);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Incorrect email or password.');
    } finally {
      setSubmitting(false);
    }
  }

  const reasonText = modalReason
    ? `Sign in to access ${modalReason}.`
    : 'Sign in to continue.';

  return (
    <div
      className={`modal-overlay${modalOpen ? ' is-open' : ''}`}
      aria-hidden={!modalOpen}
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div
        className="login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        ref={modalRef}
      >
        <div className="modal-handle"></div>

        <button
          className="modal-close"
          aria-label="Close"
          onClick={closeLoginModal}
        >
          ✕
        </button>

        <p className="eyebrow">Welcome back</p>

        <h2 id="login-title">Sign in to HealEasy</h2>

        <p className="text-secondary">
          {reasonText}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Email</label>

            <input
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />
          </div>

          <div className="form-field">
            <label>Password</label>

            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />
          </div>

          {error && (
            <p
              style={{
                color: '#dc2626',
                marginTop: '10px',
                marginBottom: '10px',
                fontSize: '14px',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block mt-lg"
            disabled={submitting}
          >
            {submitting
              ? 'Signing in...'
              : 'Sign In'}
          </button>
        </form>

        <div className="divider-text">
          or continue with
        </div>

        <div className="flex gap-sm">
          <button
            type="button"
            className="btn btn-ghost btn-block"
          >
            Google
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-block"
          >
            Apple
          </button>
        </div>
      </div>
    </div>
  );
}