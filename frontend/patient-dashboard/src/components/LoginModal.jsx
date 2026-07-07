import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';

export default function LoginModal() {
  const { modalOpen, modalReason, modalRedirect, closeLoginModal, showToast } = useUI();
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (modalOpen) {
      const firstInput = modalRef.current?.querySelector('input, button');
      if (firstInput) firstInput.focus();
    } else {
      setMode('signin');
      setName('');
      setEmail('');
      setPassword('');
      setSubmitting(false);
    }
  }, [modalOpen]);

  useEffect(() => {
    function handleKeydown(evt) {
      if (!modalOpen) return;
      if (evt.key === 'Escape') {
        closeLoginModal();
        return;
      }
      if (evt.key === 'Tab') {
        const focusables = modalRef.current?.querySelectorAll('input, button, a');
        if (!focusables || !focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (evt.shiftKey && document.activeElement === first) {
          evt.preventDefault();
          last.focus();
        } else if (!evt.shiftKey && document.activeElement === last) {
          evt.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [modalOpen, closeLoginModal]);

  function handleOverlayClick(evt) {
    if (evt.target === overlayRef.current) closeLoginModal();
  }

  function handleSubmit(evt) {
    evt.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    // Prototype authentication: no backend call, just simulate a short delay
    // then persist a session and route the person to what they originally asked for.
    setTimeout(() => {
      if (mode === 'signup') {
        signup(name, email);
      } else {
        login(email);
      }
      closeLoginModal();
      showToast(mode === 'signup' ? 'Account created — welcome to HealEasy' : 'Welcome back');
      if (modalRedirect) navigate(modalRedirect);
    }, 350);
  }

  const reasonText = modalReason ? `Sign in to access ${modalReason}.` : 'Sign in to continue.';
  const isSignup = mode === 'signup';

  return (
    <div
      className={`modal-overlay${modalOpen ? ' is-open' : ''}`}
      id="login-modal-overlay"
      aria-hidden={!modalOpen}
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div className="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-title" ref={modalRef}>
        <div className="modal-handle"></div>
        <button className="modal-close" aria-label="Close" onClick={closeLoginModal}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        <p className="eyebrow">{isSignup ? 'Create your account' : 'Welcome back'}</p>
        <h2 id="login-title" className="mt-sm">{isSignup ? 'Sign up for HealEasy' : 'Sign in to HealEasy'}</h2>
        <p className="text-secondary mt-xs" data-modal-reason>{reasonText}</p>
        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div className="form-field">
              <label htmlFor="login-name">Full name</label>
              <input
                id="login-name"
                type="text"
                placeholder="Jane Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div className="form-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block mt-lg" disabled={submitting}>
            {submitting ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <div className="divider-text">or continue with</div>
        <div className="flex gap-sm">
          <button className="btn btn-ghost btn-block" type="button">Google</button>
          <button className="btn btn-ghost btn-block" type="button">Apple</button>
        </div>
        <p className="caption mt-lg" style={{ textAlign: 'center' }}>
          {isSignup ? (
            <>
              Already have an account?{' '}
              <button type="button" className="link" onClick={() => setMode('signin')}>Sign in</button>
            </>
          ) : (
            <>
              New to HealEasy?{' '}
              <button type="button" className="link" onClick={() => setMode('signup')}>Create an account</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
