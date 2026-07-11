import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PageShell from '../components/PageShell';
import usePageEffects from '../hooks/usePageEffects';
import { useUI } from '../context/UIContext';
import hospitals from '../data/hospitals';
import { getDoctorsByHospital } from '../data/doctors';
import { addAppointment } from '../data/localRecords';
import '../styles/Booking.css';

const STEPS = ['Hospital', 'Doctor', 'Date & Time', 'Confirm'];

function nextSevenDays() {
  const days = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

const SLOTS = ['9:00 AM', '9:30 AM', '10:15 AM', '11:00 AM', '2:00 PM', '2:45 PM', '4:30 PM', '5:15 PM'];

export default function BookAppointment() {
  usePageEffects();
  const navigate = useNavigate();
  const { showToast } = useUI();

  const [step, setStep] = useState(0);
  const [hospitalId, setHospitalId] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  const days = useMemo(() => nextSevenDays(), []);
  const hospital = hospitals.find((h) => h.id === hospitalId);
  const doctorsForHospital = useMemo(() => (hospitalId ? getDoctorsByHospital(hospitalId) : []), [hospitalId]);
  const doctor = doctorsForHospital.find((d) => d.id === doctorId);

  function goStep(index) {
    setStep(Math.max(0, Math.min(STEPS.length - 1, index)));
  }

  function handleSelectHospital(id) {
    setHospitalId(id);
    setDoctorId(null);
    goStep(1);
  }

  function handleSelectDoctor(id) {
    setDoctorId(id);
    goStep(2);
  }

  function handleConfirmDateTime() {
    if (!selectedDate || !selectedSlot) {
      showToast('Pick a date and time to continue');
      return;
    }
    goStep(3);
  }

  function handleFinalConfirm() {
    const record = addAppointment({
      hospitalId: hospital.id,
      hospitalName: hospital.fullName || hospital.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date: selectedDate.toISOString(),
      time: selectedSlot,
    });
    setConfirmedAppointment(record);
    showToast('Appointment booked');
  }

  return (
    <PageShell>
      <Navbar title="Book appointment" />
      <main id="main" className="container mt-md booking-flow">
        {!confirmedAppointment && (
          <div className="stepper" data-reveal>
            {STEPS.map((label, idx) => (
              <div key={label} className={`stepper-item${idx === step ? ' is-active' : ''}${idx < step ? ' is-done' : ''}`}>
                <span className="stepper-dot">{idx < step ? '✓' : idx + 1}</span>
                <span className="stepper-label">{label}</span>
              </div>
            ))}
          </div>
        )}

        {!confirmedAppointment && step === 0 && (
          <section className="section" data-reveal>
            <div className="section-head"><h2 className="h3">Choose a hospital</h2></div>
            <div className="booking-hospital-list">
              {hospitals.map((h) => (
                <button key={h.id} className="booking-select-card" onClick={() => handleSelectHospital(h.id)}>
                  <img src={h.image} alt={h.alt} loading="lazy" />
                  <div>
                    <div style={{ fontWeight: 700 }}>{h.fullName || h.name}</div>
                    <p className="caption mt-xs">{h.metaSearch}</p>
                    <div className="hospital-card-chips mt-xs">
                      <span className={`badge badge-${h.badge.type}`}>{h.badge.label}</span>
                    </div>
                  </div>
                  <span className="rating" style={{ marginLeft: 'auto' }}>
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6L22 9.3l-5.2 4.7L18.2 21 12 17.3 5.8 21l1.4-7-5.2-4.7 7.1-.7L12 2z" /></svg>
                    {h.rating}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {!confirmedAppointment && step === 1 && hospital && (
          <section className="section" data-reveal>
            <div className="section-head">
              <h2 className="h3">Choose a doctor</h2>
              <button className="see-all" onClick={() => goStep(0)}>Change hospital</button>
            </div>
            <div className="booking-doctor-list">
              {doctorsForHospital.map((d) => (
                <button key={d.id} className="booking-select-card" onClick={() => handleSelectDoctor(d.id)}>
                  <img className="doctor-avatar" src={d.photo} alt={d.name} loading="lazy" />
                  <div>
                    <div style={{ fontWeight: 700 }}>{d.name}</div>
                    <p className="caption mt-xs">{d.specialty} · {d.experience}</p>
                    <p className="caption mt-xs">Consultation fee ₹{d.fee}</p>
                  </div>
                  <div className="booking-doctor-side">
                    <span className="rating">
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6L22 9.3l-5.2 4.7L18.2 21 12 17.3 5.8 21l1.4-7-5.2-4.7 7.1-.7L12 2z" /></svg>
                      {d.rating}
                    </span>
                    {d.availableToday && <span className="badge badge-open mt-xs">Available today</span>}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {!confirmedAppointment && step === 2 && doctor && (
          <section className="section" data-reveal>
            <div className="section-head">
              <h2 className="h3">Pick date &amp; time</h2>
              <button className="see-all" onClick={() => goStep(1)}>Change doctor</button>
            </div>
            <div className="booking-calendar">
              {days.map((d) => {
                const isActive = selectedDate && d.toDateString() === selectedDate.toDateString();
                return (
                  <button
                    key={d.toISOString()}
                    className={`booking-day${isActive ? ' is-active' : ''}`}
                    onClick={() => setSelectedDate(d)}
                  >
                    <span className="booking-day-name">{d.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                    <span className="booking-day-num">{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
            <div className="booking-slot-grid mt-md">
              {SLOTS.map((slot) => (
                <button
                  key={slot}
                  className={`booking-slot${selectedSlot === slot ? ' is-active' : ''}`}
                  onClick={() => setSelectedSlot(slot)}
                  disabled={!selectedDate}
                >
                  {slot}
                </button>
              ))}
            </div>
            <button className="btn btn-primary btn-block mt-lg" onClick={handleConfirmDateTime}>Continue</button>
          </section>
        )}

        {!confirmedAppointment && step === 3 && doctor && hospital && (
          <section className="section" data-reveal>
            <div className="section-head"><h2 className="h3">Review &amp; confirm</h2></div>
            <div className="card booking-summary">
              <div className="booking-summary-row"><span>Hospital</span><strong>{hospital.fullName || hospital.name}</strong></div>
              <div className="booking-summary-row"><span>Doctor</span><strong>{doctor.name}</strong></div>
              <div className="booking-summary-row"><span>Department</span><strong>{doctor.specialty}</strong></div>
              <div className="booking-summary-row"><span>Date</span><strong>{selectedDate?.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
              <div className="booking-summary-row"><span>Time</span><strong>{selectedSlot}</strong></div>
              <div className="booking-summary-row"><span>Consultation fee</span><strong>₹{doctor.fee}</strong></div>
            </div>
            <button className="btn btn-primary btn-block mt-lg" onClick={handleFinalConfirm}>Confirm appointment</button>
          </section>
        )}

        {confirmedAppointment && (
          <section className="section booking-success" data-reveal="scale">
            <div className="booking-success-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2 className="mt-md" style={{ textAlign: 'center' }}>Appointment confirmed</h2>
            <p className="text-secondary mt-xs" style={{ textAlign: 'center' }}>Your visit has been booked. A reminder will appear in My Appointments.</p>

            <div className="card booking-summary mt-lg">
              <div className="booking-summary-row"><span>Appointment ID</span><strong>{confirmedAppointment.id}</strong></div>
              <div className="booking-summary-row"><span>Doctor</span><strong>{confirmedAppointment.doctorName}</strong></div>
              <div className="booking-summary-row"><span>Hospital</span><strong>{confirmedAppointment.hospitalName}</strong></div>
              <div className="booking-summary-row"><span>Department</span><strong>{confirmedAppointment.specialty}</strong></div>
              <div className="booking-summary-row"><span>Date</span><strong>{new Date(confirmedAppointment.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
              <div className="booking-summary-row"><span>Time</span><strong>{confirmedAppointment.time}</strong></div>
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
              <p className="caption mt-xs">Show this QR code at reception</p>
            </div>

            <div className="flex gap-sm mt-lg">
              <button className="btn btn-ghost btn-block" onClick={() => showToast('Added to calendar')}>Add to calendar</button>
              <button className="btn btn-primary btn-block" onClick={() => navigate('/my-appointments')}>View appointment</button>
            </div>
          </section>
        )}
      </main>
    </PageShell>
  );
}
