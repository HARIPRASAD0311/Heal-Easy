import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PageShell from '../components/PageShell';
import usePageEffects from '../hooks/usePageEffects';
import { useUI } from '../context/UIContext';
import { getTokens, advanceToken, cancelToken } from '../data/localRecords';
import '../styles/Booking.css';

export default function MyTokens() {
  usePageEffects();
  const { showToast } = useUI();
  const [tokens, setTokens] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    setTokens(getTokens());

    // Simulated live queue: the active token's position ticks down over time,
    // mirroring what a real-time queue subscription would do.
    intervalRef.current = setInterval(() => {
      const current = getTokens();
      const active = current.find((t) => t.status === 'active');
      if (active) {
        advanceToken(active.id);
        setTokens(getTokens());
      }
    }, 6000);

    return () => clearInterval(intervalRef.current);
  }, []);

  function handleCancel(id) {
    cancelToken(id);
    setTokens(getTokens());
    showToast('Token cancelled');
  }

  const current = tokens.filter((t) => t.status === 'active');
  const previous = tokens.filter((t) => t.status !== 'active');

  return (
    <PageShell>
      <Navbar title="My tokens" />
      <main id="main" className="container mt-md">
        <section className="section" data-reveal>
          <div className="section-head"><h2 className="h3">Current token</h2></div>
          {current.length === 0 && (
            <div className="empty-state" data-reveal>
              <p className="text-secondary" style={{ textAlign: 'center' }}>No active token right now.</p>
              <Link to="/get-token" className="btn btn-primary mt-md" style={{ marginInline: 'auto', display: 'inline-flex' }}>Get a token</Link>
            </div>
          )}
          {current.map((t) => (
            <div className="card token-hero" key={t.id}>
              <p className="eyebrow" style={{ justifyContent: 'center' }}>{t.departmentName}</p>
              <div className="token-number">{t.tokenNumber}</div>
              <div className="booking-summary-row"><span>Hospital</span><strong>{t.hospitalName}</strong></div>
              <div className="booking-summary-row"><span>Queue position</span><strong>{t.queuePosition}</strong></div>
              <div className="booking-summary-row"><span>Estimated wait</span><strong>{t.estimatedWait}</strong></div>
              <button className="btn btn-ghost btn-block mt-md" onClick={() => handleCancel(t.id)}>Cancel token</button>
            </div>
          ))}
        </section>

        <section className="section" data-reveal>
          <div className="section-head"><h2 className="h3">Previous tokens</h2></div>
          {previous.length === 0 && <p className="text-secondary">No previous tokens yet.</p>}
          <div className="record-list" data-reveal-group>
            {previous.map((t) => (
              <div className="record-card card" key={t.id}>
                <div className="record-card-top">
                  <div>
                    <div style={{ fontWeight: 700 }}>{t.tokenNumber}</div>
                    <p className="caption mt-xs">{t.hospitalName} · {t.departmentName}</p>
                  </div>
                  <span className={`badge badge-${t.status === 'cancelled' ? 'busy' : 'open'}`}>
                    {t.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
