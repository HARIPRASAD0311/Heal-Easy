import { useState } from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import HospitalCard from '../components/HospitalCard';
import PageShell from '../components/PageShell';
import usePageEffects from '../hooks/usePageEffects';
import hospitals from '../data/hospitals';

const filters = ['All', 'Open now', 'Top rated', 'Nearby', 'Cardiology', 'Pediatrics', 'Emergency'];

export default function HospitalSearch() {
  usePageEffects();
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <PageShell>
      <Navbar
        title="Find a hospital"
        rightActions={
          <button className="icon-btn" aria-label="Filter">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
          </button>
        }
      />

      <main id="main" className="container mt-md">
        <SearchBar variant="page" placeholder="Hospitals, departments, doctors…" />

        <div className="filter-row mt-md">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`filter-pill${activeFilter === filter ? ' is-active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <p className="text-secondary text-small mt-md" style={{ fontSize: 'var(--fs-small)' }}>
          36 hospitals near Anna Nagar, Chennai
        </p>

        <div className="nearby-list mt-sm" data-reveal-group>
          {hospitals.map((hospital) => (
            <HospitalCard key={hospital.id} hospital={hospital} variant="list" />
          ))}
        </div>
      </main>
    </PageShell>
  );
}
