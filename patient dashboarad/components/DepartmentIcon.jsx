const ICONS = {
  'general-medicine': <path d="M20.8 12.5H17l-2 5-4-9-2 4H3.2" />,
  pediatrics: <path d="M7 21c-2-3-2-6-1-8 1-3 3-3 3-6a3 3 0 0 1 6 0c0 3 2 3 3 6 1 2 1 5-1 8" />,
  cardiology: <path d="M20.8 12.5H17l-2 5-4-9-2 4H3.2" />,
  orthopedics: <path d="M8 3v4M16 3v4M4 9h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />,
  dermatology: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
    </>
  ),
};

export default function DepartmentIcon({ icon }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[icon] || ICONS['general-medicine']}
    </svg>
  );
}
