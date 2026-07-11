import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageShell from '../components/PageShell';
import usePageEffects from '../hooks/usePageEffects';
import { getHospitalById } from '../data/hospitals';
import '../styles/HospitalDetails.css';

export default function HospitalDetails() {
  usePageEffects();
  const { id } = useParams();
  const hospital = getHospitalById(id) || getHospitalById('sunrise-wellness');

  // Preserve #navigate deep-linking behaviour (scrolls to the Directions section)
  useEffect(() => {
    if (window.location.hash === '#navigate') {
      const el = document.getElementById('navigate');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <PageShell>
      <div className="details-hero parallax-layer" data-parallax-speed="0.12">
        <img src={hospital.image} alt={hospital.alt} />
        <div className="details-hero-nav">
          <Link to="/hospital-search" className="icon-btn" aria-label="Back to search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div className="flex gap-sm">
            <button className="icon-btn hospital-fav" aria-label="Save to favourites">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20s-7-4.4-9.3-8.8A4.9 4.9 0 0 1 12 6a4.9 4.9 0 0 1 9.3 5.2C19 15.6 12 20 12 20Z" />
              </svg>
            </button>
            <button className="icon-btn" aria-label="Share">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="2.4" />
                <circle cx="6" cy="12" r="2.4" />
                <circle cx="18" cy="19" r="2.4" />
                <path d="M8.1 10.7l7.8-4.4M8.1 13.3l7.8 4.4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <main id="main" className="details-body container">
        <div className="glass-card" style={{ padding: 'var(--space-md)' }} data-reveal>
          <div className="flex justify-between items-center">
            <div>
              <p className="eyebrow">Multi-specialty hospital</p>
              <h1 className="h2 mt-xs">{hospital.fullName || hospital.name}</h1>
            </div>
            <span className="rating" style={{ fontSize: '1.05rem' }}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.9 6.6L22 9.3l-5.2 4.7L18.2 21 12 17.3 5.8 21l1.4-7-5.2-4.7 7.1-.7L12 2z" />
              </svg>
              {hospital.rating}
            </span>
          </div>
          <div className="flex items-center gap-sm mt-sm text-secondary" style={{ fontSize: 'var(--fs-small)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 5.6 5.4 5.4 0 0 1 21.3 12c-2.3 4.4-9.3 9-9.3 9Z" />
            </svg>
            12 Wellness Ave, Anna Nagar · {hospital.metaDashboard}
          </div>
          <div className="hospital-card-chips mt-sm">
            <span className={`badge badge-${hospital.badge.type}`}>{hospital.badge.label}</span>
            {hospital.chipsFull.map((chip) => (
              <span className="chip" key={chip}>{chip}</span>
            ))}
          </div>
          <div className="hospital-card-actions">
            <a href="#navigate" className="btn btn-ghost">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 5.6 5.4 5.4 0 0 1 21.3 12c-2.3 4.4-9.3 9-9.3 9Z" />
              </svg>
              Navigate
            </a>
            <button className="btn btn-primary" data-requires-auth="Queue Token" data-auth-redirect="/get-token">Book token</button>
            <button className="btn btn-accent" data-requires-auth="Book Appointment" data-auth-redirect="/book-appointment">Book appointment</button>
          </div>
        </div>

        <section className="section" data-reveal>
          <h2 className="h3">About</h2>
          <p className="text-secondary mt-sm">
            {hospital.name} is a 240-bed multi-specialty hospital known for cardiac care and 24/7 diagnostics,
            blending calm, private wards with a highly rated ICU team.
          </p>
        </section>

        <section className="section" data-reveal>
          <div className="section-head"><h2 className="h3">Doctors on duty</h2></div>
          <div className="card">
            <div className="doctor-row">
              <img
                className="doctor-avatar"
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&q=80"
                alt="Dr. Ananya Rao"
                loading="lazy"
              />
              <div>
                <div style={{ fontWeight: 700 }}>Dr. Ananya Rao</div>
                <p className="caption">Cardiologist · 14 yrs exp.</p>
              </div>
              <span className="badge badge-open" style={{ marginLeft: 'auto' }}>Available</span>
            </div>
            <div className="doctor-row">
              <img
                className="doctor-avatar"
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=100&q=80"
                alt="Dr. Karthik Iyer"
                loading="lazy"
              />
              <div>
                <div style={{ fontWeight: 700 }}>Dr. Karthik Iyer</div>
                <p className="caption">Emergency Medicine · 9 yrs exp.</p>
              </div>
              <span className="badge badge-busy" style={{ marginLeft: 'auto' }}>In 20 min</span>
            </div>
          </div>
        </section>

        <section className="section" id="navigate" data-reveal>
          <div className="section-head"><h2 className="h3">Directions</h2></div>
          <div className="map-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 5.6 5.4 5.4 0 0 1 21.3 12c-2.3 4.4-9.3 9-9.3 9Z" />
              <circle cx="12" cy="11" r="2.2" />
            </svg>
          </div>
          <a href="#" className="btn btn-primary btn-block mt-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 11l18-8-8 18-2-8-8-2Z" />
            </svg>
            Start navigation
          </a>
        </section>

        <section className="section" data-reveal>
          <div className="section-head"><h2 className="h3">Patient reviews</h2></div>
          <div className="review-card">
            <div className="flex justify-between items-center">
              <strong>Priya S.</strong>
              <span className="rating">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.9 6.6L22 9.3l-5.2 4.7L18.2 21 12 17.3 5.8 21l1.4-7-5.2-4.7 7.1-.7L12 2z" />
                </svg>
                5.0
              </span>
            </div>
            <p className="text-secondary mt-xs">
              Calm environment and the queue token system meant we barely waited. Highly recommend the cardiology team.
            </p>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
