/**
 * Mock department records used by Get Token and Book Appointment flows.
 * Shape mirrors what a Django REST endpoint (e.g. GET /api/departments/) would return.
 * `icon` is a key resolved to an SVG by <DepartmentIcon /> (see components/DepartmentIcon.jsx)
 * so this file stays plain data with no JSX.
 */
const departments = [
  {
    id: 'general-medicine',
    name: 'General Medicine',
    icon: 'general-medicine',
    description: 'Everyday illnesses, checkups, and referrals.',
    avgWait: '18 min',
    currentQueue: 12,
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    icon: 'pediatrics',
    description: 'Care for infants, children, and teens.',
    avgWait: '24 min',
    currentQueue: 9,
  },
  {
    id: 'cardiology',
    name: 'Cardiology',
    icon: 'cardiology',
    description: 'Heart health, ECGs, and follow-up care.',
    avgWait: '31 min',
    currentQueue: 15,
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    icon: 'orthopedics',
    description: 'Bones, joints, and sports injuries.',
    avgWait: '20 min',
    currentQueue: 7,
  },
  {
    id: 'dermatology',
    name: 'Dermatology',
    icon: 'dermatology',
    description: 'Skin, hair, and nail conditions.',
    avgWait: '15 min',
    currentQueue: 5,
  },
];

export default departments;

export function getDepartmentById(id) {
  return departments.find((d) => d.id === id);
}
