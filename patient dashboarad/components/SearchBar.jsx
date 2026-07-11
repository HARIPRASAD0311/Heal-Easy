import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SEARCH_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-3.5-3.5" />
  </svg>
);

/**
 * variant="hero" -> used in the dashboard hero, submits to /hospital-search?q=...
 * variant="page" -> used at the top of the Hospital Search page, has a "use my location" button
 */
export default function SearchBar({ variant = 'page', placeholder = 'Search hospitals, departments, doctors…', onChange }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(evt) {
    evt.preventDefault();
    if (variant === 'hero' && value.trim()) {
      navigate(`/hospital-search?q=${encodeURIComponent(value.trim())}`);
    }
  }

  function handleChange(evt) {
    setValue(evt.target.value);
    if (onChange) onChange(evt.target.value);
  }

  if (variant === 'hero') {
    return (
      <div className="hero-search-wrap" data-reveal="fade">
        <form
          className="search-bar"
          role="search"
          onSubmit={handleSubmit}
          style={focused ? { boxShadow: 'var(--shadow-lg)' } : undefined}
        >
          {SEARCH_ICON}
          <input
            type="search"
            name="q"
            placeholder={placeholder}
            aria-label="Search hospitals, departments, doctors"
            value={value}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <button type="submit" className="btn btn-primary btn-icon-only" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>
      </div>
    );
  }

  return (
    <form className="search-bar" role="search" onSubmit={handleSubmit}>
      {SEARCH_ICON}
      <input
        type="search"
        placeholder={placeholder}
        aria-label="Search"
        value={value}
        onChange={handleChange}
      />
      <button type="button" className="btn btn-icon-only btn-ghost" aria-label="Use my location">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 5.6 5.4 5.4 0 0 1 21.3 12c-2.3 4.4-9.3 9-9.3 9Z" />
          <circle cx="12" cy="11" r="2.2" />
        </svg>
      </button>
    </form>
  );
}
