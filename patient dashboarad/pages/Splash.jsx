import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Splash.css';

export default function Splash() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (Math.random() * 18 + 8);
        if (next >= 100) {
          clearInterval(intervalRef.current);
          setTimeout(() => {
            setIsLeaving(true);
            setTimeout(() => navigate('/dashboard'), 500);
          }, 250);
          return 100;
        }
        return next;
      });
    }, 260);

    return () => clearInterval(intervalRef.current);
  }, [navigate]);

  return (
    <main className={`splash-screen${isLeaving ? ' is-leaving' : ''}`}>
      <div className="ambient-blur mesh-drift" style={{ width: 340, height: 340, background: '#14C8C2', top: -120, left: -90 }} />
      <div className="ambient-blur mesh-drift" style={{ width: 300, height: 300, background: '#D4AF37', bottom: -100, right: -80, animationDelay: '2s' }} />

      <div className="splash-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="splash-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" />
            <path d="M9 12h6M12 9v6" />
          </svg>
        </div>
        <h1 className="splash-name">HealEasy</h1>
      </div>

      <p className="splash-tagline">Find your way. Tell your story once.</p>

      <div className="splash-loader" role="status" aria-label="Loading HealEasy">
        <div className="splash-progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
    </main>
  );
}
