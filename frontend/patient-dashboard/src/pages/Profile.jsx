import Navbar from '../components/Navbar';
import PageShell from '../components/PageShell';
import usePageEffects from '../hooks/usePageEffects';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import '../styles/Profile.css';

export default function Profile() {
  usePageEffects();
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useUI();

  function handleLogout() {
    logout();
    showToast('Signed out');
  }

  return (
    <PageShell>
      <Navbar title="Profile" />

      <main id="main" className="container mt-md">
        {isAuthenticated ? (
          <div className="glass-card guest-card" data-reveal>
            <div className="profile-avatar" style={{ marginInline: 'auto' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="3.4" />
                <path d="M5 20c1-3.6 4-5.4 7-5.4s6 1.8 7 5.4" />
              </svg>
            </div>
            <h2 className="mt-md" style={{ textAlign: 'center' }}>{user.name}</h2>
            <p className="text-secondary mt-xs" style={{ textAlign: 'center' }}>{user.email}</p>
            <button className="btn btn-ghost mt-lg" onClick={handleLogout}>Sign out</button>
          </div>
        ) : (
          <div className="glass-card guest-card" data-reveal>
            <div className="profile-avatar" style={{ marginInline: 'auto' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="3.4" />
                <path d="M5 20c1-3.6 4-5.4 7-5.4s6 1.8 7 5.4" />
              </svg>
            </div>
            <h2 className="mt-md">You're browsing as a guest</h2>
            <p className="text-secondary mt-xs">Sign in to save hospitals, book queue tokens, and keep your health story in one place.</p>
            <button className="btn btn-primary mt-lg" data-requires-auth="your profile" data-auth-redirect="/profile">Sign in</button>
          </div>
        )}

        <section className="section" data-reveal>
          <div className="section-head"><h2 className="h3">Your care</h2></div>
          <div className="locked-list card" style={{ position: 'relative', overflow: 'hidden' }}>
            <a href="#" className="profile-menu-item" data-requires-auth="Appointments" data-auth-redirect="/my-appointments">
              <span className="profile-menu-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="4" y="5" width="16" height="15" rx="2.5" />
                  <path d="M4 9h16M8 3v4M16 3v4" />
                </svg>
              </span>
              My appointments
              <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </a>
            <a href="#" className="profile-menu-item" data-requires-auth="your Queue Token history" data-auth-redirect="/my-tokens">
              <span className="profile-menu-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="4" y="5" width="16" height="14" rx="2.5" />
                  <path d="M8 3v4M16 3v4M8 13h8M8 17h5" />
                </svg>
              </span>
              My tokens
              <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </a>
            <a href="#" className="profile-menu-item" data-requires-auth="Medical Records">
              <span className="profile-menu-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 3v4M15 3v4M6 7h12l-1.2 12.2A2 2 0 0 1 14.8 21H9.2a2 2 0 0 1-2-1.8L6 7Z" />
                </svg>
              </span>
              Medical records
              <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </a>
            <a href="#" className="profile-menu-item" data-requires-auth="Saved Hospitals">
              <span className="profile-menu-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 20s-7-4.4-9.3-8.8A4.9 4.9 0 0 1 12 6a4.9 4.9 0 0 1 9.3 5.2C19 15.6 12 20 12 20Z" />
                </svg>
              </span>
              Saved hospitals
              <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </section>

        <section className="section" data-reveal>
          <div className="section-head"><h2 className="h3">General</h2></div>
          <div className="card">
            <a href="#" className="profile-menu-item">
              <span className="profile-menu-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z" />
                </svg>
              </span>
              Settings
              <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </a>
            <a href="#" className="profile-menu-item">
              <span className="profile-menu-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8v.4" />
                  <path d="M12 17h.01" />
                </svg>
              </span>
              Help &amp; support
              <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
