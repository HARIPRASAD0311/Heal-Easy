import { Link } from 'react-router-dom';

export default function QuickActions() {
  return (
    <section className="section container" data-reveal>
      <div className="section-head">
        <h2>Quick actions</h2>
      </div>
      <div className="quick-actions-grid" data-reveal-group>
        <Link to="/ai-assistant" className="quick-action">
          <span className="quick-action-icon icon-teal">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3.2" />
              <circle cx="12" cy="12" r="8.5" strokeDasharray="2 3" />
            </svg>
          </span>
          <span className="quick-action-title">AI Symptom Checker</span>
        </Link>
        <Link to="/hospital-search" className="quick-action">
          <span className="quick-action-icon icon-navy">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-3.5-3.5" />
            </svg>
          </span>
          <span className="quick-action-title">Find Hospital</span>
        </Link>
        <Link to="/hospital-details/sunrise-wellness" className="quick-action">
          <span className="quick-action-icon icon-gold">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 5.6 5.4 5.4 0 0 1 21.3 12c-2.3 4.4-9.3 9-9.3 9Z" />
            </svg>
          </span>
          <span className="quick-action-title">Navigation</span>
        </Link>
        <button className="quick-action" data-requires-auth="Queue Token" data-auth-redirect="/get-token">
          <span className="quick-action-icon icon-teal">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="5" width="16" height="14" rx="2.5" />
              <path d="M8 3v4M16 3v4M8 13h8M8 17h5" />
            </svg>
          </span>
          <span className="quick-action-title">Queue Token</span>
        </button>
        <button className="quick-action" data-requires-auth="Book Appointment" data-auth-redirect="/book-appointment">
          <span className="quick-action-icon icon-gold">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="5" width="16" height="15" rx="2.5" />
              <path d="M4 9h16M8 3v4M16 3v4M12 13v5M9.5 15.5h5" />
            </svg>
          </span>
          <span className="quick-action-title">Book Appointment</span>
        </button>
        <button className="quick-action emergency">
          <span className="quick-action-icon icon-rose">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" />
              <path d="M12 8v4M12 15h.01" />
            </svg>
          </span>
          <span className="quick-action-title">Emergency SOS</span>
        </button>
        <button className="quick-action" data-requires-auth="Appointments" data-auth-redirect="/my-appointments">
          <span className="quick-action-icon icon-navy">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="5" width="16" height="15" rx="2.5" />
              <path d="M4 9h16M8 3v4M16 3v4" />
              <path d="m9 14 1.6 1.6L14.5 12" />
            </svg>
          </span>
          <span className="quick-action-title">Appointments</span>
        </button>
      </div>
    </section>
  );
}
