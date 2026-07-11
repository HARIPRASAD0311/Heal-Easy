import { NavLink } from 'react-router-dom';

const navLinkClass = ({ isActive }) => `bottom-nav-item${isActive ? ' is-active' : ''}`;

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      <NavLink to="/dashboard" className={navLinkClass}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 11 9-7 9 7v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        </svg>
        Home
      </NavLink>
      <NavLink to="/hospital-search" className={navLinkClass}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-3.5-3.5" />
        </svg>
        Search
      </NavLink>
      <NavLink to="/ai-assistant" className="bottom-nav-fab" aria-label="AI Assistant">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3.2" />
          <circle cx="12" cy="12" r="8.5" strokeDasharray="2 3" />
        </svg>
      </NavLink>
      <button className="bottom-nav-item" data-requires-auth="your Queue Token" data-auth-redirect="/get-token">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="5" width="16" height="14" rx="2.5" />
          <path d="M8 3v4M16 3v4M8 13h8M8 17h5" />
        </svg>
        Queue
      </button>
      <NavLink to="/profile" className={navLinkClass}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="3.4" />
          <path d="M5 20c1-3.6 4-5.4 7-5.4s6 1.8 7 5.4" />
        </svg>
        Profile
      </NavLink>
    </nav>
  );
}
