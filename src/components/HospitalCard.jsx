import { useNavigate } from 'react-router-dom';

const RATING_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.9 6.6L22 9.3l-5.2 4.7L18.2 21 12 17.3 5.8 21l1.4-7-5.2-4.7 7.1-.7L12 2z" />
  </svg>
);

const PIN_ICON = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 5.6 5.4 5.4 0 0 1 21.3 12c-2.3 4.4-9.3 9-9.3 9Z" />
  </svg>
);

/**
 * variant="scroll"  -> compact card used inside a horizontal-scroll rail (Featured hospitals)
 * variant="list"    -> full-width card with chips + action buttons (Nearby hospitals / Search results)
 *
 * Rendered as a clickable div (not an <a>) so the inner Navigate/Book token
 * controls stay valid, independently-clickable interactive elements.
 */
export default function HospitalCard({ hospital, variant = 'list' }) {
  const navigate = useNavigate();
  const meta = variant === 'scroll' ? hospital.metaDashboard : hospital.metaSearch;
  const chips = variant === 'scroll' ? hospital.chips : hospital.chipsFull;
  const displayName = variant === 'scroll' ? hospital.name : hospital.fullName || hospital.name;

  function goToDetails() {
    navigate(`/hospital-details/${hospital.id}`);
  }

  function handleKeyDown(evt) {
    if (evt.key === 'Enter' || evt.key === ' ') {
      evt.preventDefault();
      goToDetails();
    }
  }

  return (
    <div
      className="hospital-card"
      role="link"
      tabIndex={0}
      onClick={goToDetails}
      onKeyDown={handleKeyDown}
    >
      <div className="hospital-card-media">
        <span className={`badge badge-${hospital.badge.type}`}>{hospital.badge.label}</span>
        <button className="hospital-fav" aria-label="Save to favourites">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20s-7-4.4-9.3-8.8A4.9 4.9 0 0 1 12 6a4.9 4.9 0 0 1 9.3 5.2C19 15.6 12 20 12 20Z" />
          </svg>
        </button>
        <img src={hospital.image} alt={hospital.alt} loading="lazy" />
      </div>
      <div className="hospital-card-body">
        <div className="hospital-card-top">
          <div>
            <div className="hospital-card-name">{displayName}</div>
            <div className="hospital-card-meta">
              {PIN_ICON}
              {meta}
            </div>
          </div>
          <span className="rating">
            {RATING_ICON}
            {hospital.rating}
          </span>
        </div>
        <div className="hospital-card-chips">
          {chips.map((chip) => (
            <span className="chip" key={chip}>{chip}</span>
          ))}
        </div>
        {variant === 'list' && (
          <div className="hospital-card-actions">
            <button
              className="btn btn-ghost"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/hospital-details/${hospital.id}#navigate`);
              }}
            >
              Navigate
            </button>
            <button
              className="btn btn-primary"
              data-requires-auth="Queue Token"
              data-auth-redirect="/get-token"
              onClick={(e) => e.stopPropagation()}
            >
              Book token
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
