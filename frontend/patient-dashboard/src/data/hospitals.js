/**
 * Mock hospital records.
 * Shape mirrors what a Django REST endpoint (e.g. GET /api/hospitals/) would return,
 * so swapping this file for a fetch() call later is a drop-in change.
 */
const hospitals = [
  {
    id: 'sunrise-wellness',
    name: 'Sunrise Wellness',
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=700&q=80',
    alt: 'Sunrise Wellness Hospital reception hall',
    badge: { type: 'open', label: 'Open now' },
    metaDashboard: '1.2 km away',
    metaSearch: '1.2 km · Anna Nagar',
    rating: 4.9,
    chips: ['Cardiology', 'ICU'],
    chipsFull: ['Cardiology', 'ICU', 'Lab'],
  },
  {
    id: 'meridian-heart',
    name: 'Meridian Heart',
    fullName: 'Meridian Heart Institute',
    image: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=700&q=80',
    alt: 'Meridian Heart Institute exterior',
    badge: { type: 'luxury', label: 'Premium care' },
    metaDashboard: '2.6 km away',
    metaSearch: '2.6 km · Kilpauk',
    rating: 4.7,
    chips: ['Neurology', 'Diagnostics'],
    chipsFull: ['Neurology', 'Diagnostics'],
  },
  {
    id: 'northgate-general',
    name: 'Northgate General',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=700&q=80',
    alt: 'Northgate General Hospital lobby',
    badge: { type: 'busy', label: 'Moderate wait' },
    metaDashboard: '3.4 km away',
    metaSearch: '3.4 km · Kolathur',
    rating: 4.6,
    chips: ['Pediatrics', 'Emergency'],
    chipsFull: ['Pediatrics', 'Emergency'],
  },
  {
    id: 'riverside-community',
    name: 'Riverside Community',
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=700&q=80',
    alt: 'Riverside Community Clinic entrance',
    badge: { type: 'busy', label: 'Moderate wait' },
    metaDashboard: '0.8 km away',
    metaSearch: '0.8 km · T. Nagar',
    rating: 4.5,
    chips: ['General', 'Lab'],
    chipsFull: ['General', 'Lab'],
  },
];

export default hospitals;

export function getHospitalById(id) {
  return hospitals.find((h) => h.id === id);
}
