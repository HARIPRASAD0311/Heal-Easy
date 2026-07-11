import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PageShell from '../components/PageShell';
import DepartmentIcon from '../components/DepartmentIcon';
import usePageEffects from '../hooks/usePageEffects';
import { useUI } from '../context/UIContext';
import hospitals from '../data/hospitals';
import departments from '../data/departments';
import { addToken } from '../data/localRecords';
import '../styles/Booking.css';

const DEPT_CODES = {
  'general-medicine': 'GM',
  pediatrics: 'PD',
  cardiology: 'CD',
  orthopedics: 'OR',
  dermatology: 'DR',
};

export default function GetToken() {
  usePageEffects();
  const navigate = useNavigate();
  const { showToast } = useUI();

  const [hospitalId, setHospitalId] = useState(hospitals[0]?.id || null);
  const [departmentId, setDepartmentId] = useState(null);
  const [issuedToken, setIssuedToken] = useState(null);

  const hospital = hospitals.find((h) => h.id === hospitalId);
  const department = departments.find((d) => d.id === departmentId);

  function handleGenerate() {
    if (!hospital || !department) {
      showToast('Choose a hospital and department first');
      return;
    }
    const token = addToken({
      hospitalId: hospital.id,
      hospitalName: hospital.fullName || hospital.name,
      departmentId: department.id,
      departmentName: department.name,
      departmentCode: DEPT_CODES[department.id] || 'GN',
    });
    setIssuedToken(token);
    showToast('Token generated');
  }

  return (
    <PageShell>
      <Navbar title="Get token" />
      <main id="main" className="container mt-md booking-flow">
        {!issuedToken && (
          <>
            <section className="section" data-reveal>
              <div className="section-head"><h2 className="h3">Hospital</h2></div>
              <div className="filter-row">
                {hospitals.map((h) => (
                  <button
                    key={h.id}
                    className={`filter-pill${hospitalId === h.id ? ' is-active' : ''}`}
                    onClick={() => setHospitalId(h.id)}
                  >
                    {h.name}
                  </button>
                ))}
              </div>
            </section>

            <section className="section" data-reveal>
              <div className="section-head"><h2 className="h3">Department</h2></div>
              <div className="dept-grid" data-reveal-group>
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    className={`dept-item${departmentId === dept.id ? ' is-active' : ''}`}
                    onClick={() => setDepartmentId(dept.id)}
                  >
                    <span className="dept-icon"><DepartmentIcon icon={dept.icon} /></span>
                    <span className="dept-label">{dept.name}</span>
                    <span className="caption mt-xs">{dept.currentQueue} in queue · ~{dept.avgWait}</span>
                  </button>
                ))}
              </div>
            </section>

            <button className="btn btn-primary btn-block mt-lg" onClick={handleGenerate}>Generate token</button>
          </>
        )}

        {issuedToken && (
          <section className="section booking-success" data-reveal="scale">
            <div className="booking-success-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2 className="mt-md" style={{ textAlign: 'center' }}>Token issued</h2>
            <p className="text-secondary mt-xs" style={{ textAlign: 'center' }}>Keep an eye on My Tokens — the queue updates live.</p>

            <div className="card token-hero mt-lg">
              <p className="eyebrow" style={{ justifyContent: 'center' }}>Your token</p>
              <div className="token-number">{issuedToken.tokenNumber}</div>
              <div className="booking-summary-row"><span>Hospital</span><strong>{issuedToken.hospitalName}</strong></div>
              <div className="booking-summary-row"><span>Department</span><strong>{issuedToken.departmentName}</strong></div>
              <div className="booking-summary-row"><span>Queue position</span><strong>{issuedToken.queuePosition}</strong></div>
              <div className="booking-summary-row"><span>Estimated wait</span><strong>{issuedToken.estimatedWait}</strong></div>
            </div>

            <div className="booking-qr">
              <svg viewBox="0 0 100 100" width="120" height="120" aria-hidden="true">
                <rect width="100" height="100" fill="#fff" />
                <rect x="6" y="6" width="20" height="20" fill="var(--color-primary)" />
                <rect x="74" y="6" width="20" height="20" fill="var(--color-primary)" />
                <rect x="6" y="74" width="20" height="20" fill="var(--color-primary)" />
                <rect x="34" y="34" width="10" height="10" fill="var(--color-primary)" />
                <rect x="50" y="34" width="10" height="10" fill="var(--color-accent)" />
                <rect x="34" y="50" width="10" height="10" fill="var(--color-accent)" />
                <rect x="50" y="50" width="10" height="10" fill="var(--color-primary)" />
                <rect x="66" y="66" width="10" height="10" fill="var(--color-primary)" />
                <rect x="46" y="66" width="10" height="10" fill="var(--color-accent)" />
              </svg>
              <p className="caption mt-xs">Show this QR code to the attendant</p>
            </div>

            <button className="btn btn-primary btn-block mt-lg" onClick={() => navigate('/my-tokens')}>View my tokens</button>
          </section>
        )}
      </main>
    </PageShell>
  );
}
