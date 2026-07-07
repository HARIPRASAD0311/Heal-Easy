/**
 * Mock doctor records, keyed to hospital ids from ./hospitals.js.
 * Shape mirrors what a Django REST endpoint (e.g. GET /api/doctors/?hospital=) would return.
 */
const doctors = [
  {
    id: 'dr-ananya-rao',
    hospitalId: 'sunrise-wellness',
    name: 'Dr. Ananya Rao',
    specialty: 'Cardiology',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
    rating: 4.9,
    experience: '14 yrs exp.',
    fee: 700,
    availableToday: true,
  },
  {
    id: 'dr-karthik-iyer',
    hospitalId: 'sunrise-wellness',
    name: 'Dr. Karthik Iyer',
    specialty: 'Emergency Medicine',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
    rating: 4.7,
    experience: '9 yrs exp.',
    fee: 500,
    availableToday: true,
  },
  {
    id: 'dr-meera-nair',
    hospitalId: 'meridian-heart',
    name: 'Dr. Meera Nair',
    specialty: 'Neurology',
    photo: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=200&q=80',
    rating: 4.8,
    experience: '17 yrs exp.',
    fee: 900,
    availableToday: false,
  },
  {
    id: 'dr-vikram-sethi',
    hospitalId: 'meridian-heart',
    name: 'Dr. Vikram Sethi',
    specialty: 'Diagnostics',
    photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&q=80',
    rating: 4.6,
    experience: '11 yrs exp.',
    fee: 600,
    availableToday: true,
  },
  {
    id: 'dr-priya-menon',
    hospitalId: 'northgate-general',
    name: 'Dr. Priya Menon',
    specialty: 'Pediatrics',
    photo: 'https://images.unsplash.com/photo-1580281657702-257584239a55?auto=format&fit=crop&w=200&q=80',
    rating: 4.9,
    experience: '12 yrs exp.',
    fee: 550,
    availableToday: true,
  },
  {
    id: 'dr-arjun-das',
    hospitalId: 'northgate-general',
    name: 'Dr. Arjun Das',
    specialty: 'Emergency',
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=200&q=80',
    rating: 4.5,
    experience: '8 yrs exp.',
    fee: 500,
    availableToday: false,
  },
  {
    id: 'dr-sana-farooqui',
    hospitalId: 'riverside-community',
    name: 'Dr. Sana Farooqui',
    specialty: 'General Medicine',
    photo: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=200&q=80',
    rating: 4.7,
    experience: '10 yrs exp.',
    fee: 450,
    availableToday: true,
  },
  {
    id: 'dr-rohan-kapoor',
    hospitalId: 'riverside-community',
    name: 'Dr. Rohan Kapoor',
    specialty: 'Laboratory',
    photo: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&w=200&q=80',
    rating: 4.6,
    experience: '7 yrs exp.',
    fee: 400,
    availableToday: true,
  },
];

export default doctors;

export function getDoctorsByHospital(hospitalId) {
  return doctors.filter((d) => d.hospitalId === hospitalId);
}

export function getDoctorById(id) {
  return doctors.find((d) => d.id === id);
}
