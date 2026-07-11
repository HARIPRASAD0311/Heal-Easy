import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import QuickActions from '../components/QuickActions';
import HospitalCard from '../components/HospitalCard';
import PageShell from '../components/PageShell';
import usePageEffects from '../hooks/usePageEffects';
import { getHospitalById } from '../api/services';
// NOTE: was `import { getHospitalById } from '../data/hospitals';` — now hits
// the real backend instead of the static mock array.

const departments = [
  { label: 'Cardiology', icon: <path d="M20.8 12.5H17l-2 5-4-9-2 4H3.2" /> },
  { label: 'Neurology', icon: <><path d="M9 4a3 3 0 0 1 6 0v2a3 3 0 0 1 3 3v3a5 5 0 0 1-10 0" /><path d="M9 9v3a3 3 0 1 1-6 0V9" /></> },
  { label: 'Ophthalmology', icon: <><circle cx="12" cy="12" r="3" /><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" /></> },
  { label: 'Orthopedics', icon: <path d="M8 3v4M16 3v4M4 9h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /> },
  { label: 'Pediatrics', icon: <path d="M7 21c-2-3-2-6-1-8 1-3 3-3 3-6a3 3 0 0 1 6 0c0 3 2 3 3 6 1 2 1 5-1 8" /> },
  { label: 'Dental', icon: <><path d="M9 3v4M15 3v4M6 7h12l-1 4a5 5 0 0 1-10 0Z" /><path d="M9 15v2a3 3 0 0 0 6 0v-2" /></> },
  { label: 'Diagnostics', icon: <><rect x="3" y="7" width="18" height="12" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></> },
  { label: 'Emergency', icon: <><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" /><path d="M12 8v4M12 15h.01" /></> },
];

const articles = [
  {
    title: 'Reading your blood pressure numbers correctly',
    meta: '5 min read · Cardiology',
    thumb: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=200&q=80',
  },
  {
    title: 'When a fever in children needs a doctor',
    meta: '4 min read · Pediatrics',
    thumb: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=200&q=80',
  },
];

const featuredIds = ['sunrise-wellness', 'meridian-heart', 'northgate-general'];
// NOTE: these IDs must exist as real hospitalId values in your seeded
// DynamoDB data, or getHospitalById() will 404 for them. Check against
// scripts/healeasy_mock_data.json — you may need to swap these to IDs
// that actually exist (e.g. 'sunrise-wellness', 'apollo-care').

export default function Dashboard() {
  usePageEffects();

  const [featuredHospitals, setFeaturedHospitals] = useState([]);
  const [nearestER, setNearestER] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      try {
        // Fetch all featured hospitals in parallel rather than one at a
        // time — same end result as the old synchronous array lookups,
        // just async now.
        const featuredResults = await Promise.all(
          featuredIds.map((id) => getHospitalById(id).catch(() => null))
        );

        const er = await getHospitalById('riverside-community').catch(() => null);

        if (!cancelled) {
          setFeaturedHospitals(featuredResults.filter(Boolean));
          setNearestER(er);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboardData();
    return () => { cancelled = true; };
  }, []);

  return (
    <PageShell>
      <Navbar variant="dashboard" />

      <main id="main">
        <Hero />
        <QuickActions />

        <section className="section featured-band" data-reveal>
          <div className="section-head container">
            <h2>Featured hospitals</h2>
            <Link to="/hospital-search" className="see-all">
              See all
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
          <div className="hscroll">
            {loading && <p className="caption">Loading hospitals…</p>}
            {!loading && featuredHospitals.length === 0 && (
              <p className="caption">No featured hospitals available right now.</p>
            )}
            {featuredHospitals.map((hospital) => (
              <HospitalCard key={hospital.hospitalId} hospital={hospital} variant="scroll" />
            ))}
          </div>
        </section>

        <section
          className="section container bg-secondary"
          style={{ borderRadius: 'var(--radius-xl)', paddingBlock: 'var(--space-xl)' }}
          data-reveal
        >
          <div className="section-head">
            <h2>Department finder</h2>
          </div>
          <div className="dept-grid" data-reveal-group>
            {departments.map((dept) => (
              <Link to="/hospital-search" className="dept-item" key={dept.label}>
                <span className="dept-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {dept.icon}
                  </svg>
                </span>
                <span className="dept-label">{dept.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section container" data-reveal>
          <div className="section-head">
            <h2>Nearby hospitals</h2>
            <Link to="/hospital-search" className="see-all">
              See all
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
          <div className="nearby-list" data-reveal-group>
            {nearestER && <HospitalCard hospital={nearestER} variant="list" />}
            {!loading && !nearestER && <p className="caption">No nearby hospitals found.</p>}
          </div>
        </section>

        <section className="section container" data-reveal="scale">
          <div className="ai-teaser">
            <div className="ambient-blur" style={{ width: 220, height: 220, background: '#14C8C2', top: -60, left: '50%', transform: 'translateX(-50%)' }} />
            <p className="eyebrow" style={{ justifyContent: 'center' }}>AI Assistant</p>
            <h2 className="mt-sm" style={{ color: '#fff' }}>Not sure what's wrong?</h2>
            <p className="text-inverse-secondary mt-sm">
              Describe your symptoms and let HealEasy's assistant guide you to the right department, calmly and privately.
            </p>
            <Link to="/ai-assistant" className="btn btn-accent mt-lg">Start a conversation</Link>
          </div>
        </section>

        <section className="section container" data-reveal>
          <div className="emergency-section">
            <div className="ambient-blur" style={{ width: 200, height: 200, background: '#E14C6D', bottom: -60, right: -40 }} />
            <p className="eyebrow" style={{ justifyContent: 'center' }}>Emergency</p>
            <h2 className="mt-sm text-inverse" style={{ textAlign: 'center' }}>Help is one tap away</h2>
            <button className="sos-btn mt-lg" aria-label="Send SOS alert">SOS</button>
            <p className="text-inverse-secondary mt-lg" style={{ textAlign: 'center' }}>
              Nearest ER: <strong className="text-inverse">{nearestER?.name || 'Riverside Community'}</strong>
              {nearestER?.metaDashboard ? ` · ${nearestER.metaDashboard}` : ' · 0.8 km'}
            </p>
            <div className="mt-lg">
              <div className="emergency-contact-row">
                <span className="text-inverse">Ambulance</span>
                <a href="tel:108" className="link" style={{ color: 'var(--color-accent)', borderColor: 'transparent' }}>108</a>
              </div>
              <div className="emergency-contact-row">
                <span className="text-inverse">Poison Control</span>
                <a href="tel:1066" className="link" style={{ color: 'var(--color-accent)', borderColor: 'transparent' }}>1066</a>
              </div>
            </div>
          </div>
        </section>

        <section className="section container" data-reveal>
          <div className="section-head">
            <h2>Health articles</h2>
          </div>
          <div className="article-list">
            {articles.map((article) => (
              <a href="#" className="article-card" key={article.title}>
                <div className="article-thumb"><img src={article.thumb} alt="" loading="lazy" /></div>
                <div>
                  <div className="article-title">{article.title}</div>
                  <p className="caption mt-xs">{article.meta}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </PageShell>
  );
}