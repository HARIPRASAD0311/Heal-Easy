import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PageShell from '../components/PageShell';
import usePageEffects from '../hooks/usePageEffects';
import { useUI } from '../context/UIContext';
import { getAppointments, updateAppointmentStatus, rescheduleAppointment } from '../data/localRecords';
import '../styles/Booking.css';

const TABS = ['Upcoming', 'Past', 'Cancelled'];

function statusForTab(appointment) {
  if (appointment.status === 'cancelled') return 'Cancelled';
  const isPast = new Date(appointment.date) < new Date(new Date().toDateString());
  return isPast || appointment.status === 'completed' ? 'Past' : 'Upcoming';
}

export default function MyAppointments() {
  usePageEffects();
  const { showToast } = useUI();
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('Upcoming');

  useEffect(() => {
    setAppointments(getAppointments());
  }, []);

  function refresh() {
    setAppointments(getAppointments());
  }

  function handleCancel(id) {
    updateAppointmentStatus(id, 'cancelled');
    refresh();
    showToast('Appointment cancelled');
  }

  function handleReschedule(id) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    rescheduleAppointment(id, { date: nextWeek.toISOString(), time: '11:00 AM' });
    refresh();
    showToast('Rescheduled to next week, 11:00 AM');
  }

  const filtered = appointments.filter((a) => statusForTab(a) === tab);

  return (
    <PageShell>
      <Navbar title="My appointments" />
      <main id="main" className="container mt-md">
        <div className="filter-row">
          {TABS.map((t) => (
            <button key={t} className={`filter-pill${tab === t ? ' is-active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state mt-lg" data-reveal>
            <p className="text-secondary" style={{ textAlign: 'center' }}>No {tab.toLowerCase()} appointments yet.</p>
            <Link to="/book-appointment" className="btn btn-primary mt-md" style={{ marginInline: 'auto', display: 'inline-flex' }}>Book an appointment</Link>
          </div>
        )}

        <div className="record-list mt-md" data-reveal-group>
          {filtered.map((a) => (
            <div className="record-card card" key={a.id}>
              <div className="record-card-top">
                <div>
                  <div style={{ fontWeight: 700 }}>{a.doctorName}</div>
                  <p className="caption mt-xs">{a.hospitalName}</p>
                </div>
                <span className={`badge badge-${a.status === 'cancelled' ? 'busy' : 'open'}`}>{statusForTab(a)}</span>
              </div>
              <div className="record-card-meta">
                <span>{new Date(a.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span>·</span>
                <span>{a.time}</span>
              </div>
              <div className="hospital-card-actions">
                <button className="btn btn-ghost" onClick={() => showToast(`Appointment ${a.id} · ${a.specialty}`)}>View</button>
                {tab === 'Upcoming' && (
                  <>
                    <button className="btn btn-ghost" onClick={() => handleReschedule(a.id)}>Reschedule</button>
                    <button className="btn btn-primary" onClick={() => handleCancel(a.id)}>Cancel</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </PageShell>
  );
}
