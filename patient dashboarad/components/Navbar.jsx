import { Link } from 'react-router-dom';
import { useRef } from 'react';
import useStickyNavbar from '../hooks/useStickyNavbar';

/**
 * variant="dashboard"  -> brand mark + notification/profile icons, on-dark style
 * variant="sub"        -> back button + title, used on inner pages
 */
export default function Navbar({ variant = 'sub', title, backTo = '/dashboard', rightActions = null }) {
  const navRef = useRef(null);
  useStickyNavbar(navRef);

  if (variant === 'dashboard') {
    return (
      <header className="navbar on-dark" id="navbar" ref={navRef}>
        <Link to="/dashboard" className="brand">
          <span className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" />
            </svg>
          </span>
          HealEasy
        </Link>
        <div className="navbar-actions">
          <button className="icon-btn" aria-label="Notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 1 0-12 0c0 3.6-1 5.2-2 6.8h16c-1-1.6-2-3.2-2-6.8Z" />
              <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
            </svg>
          </button>
          <button className="icon-btn" aria-label="Your profile" data-requires-auth="your profile" data-auth-redirect="/profile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="3.4" />
              <path d="M5 20c1-3.6 4-5.4 7-5.4s6 1.8 7 5.4" />
            </svg>
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="navbar" id="navbar" ref={navRef}>
      <div className="flex items-center gap-sm">
        <Link to={backTo} className="icon-btn" aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <span className="h3">{title}</span>
      </div>
      {rightActions && <div className="navbar-actions">{rightActions}</div>}
    </header>
  );
}
