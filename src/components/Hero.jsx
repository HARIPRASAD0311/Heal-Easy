import useGreeting from '../hooks/useGreeting';
import SearchBar from './SearchBar';

export default function Hero() {
  const greeting = useGreeting();

  return (
    <section className="hero">
      <div className="hero-media parallax-layer" data-parallax-speed="0.18">
        <img
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80"
          alt="Modern hospital building exterior at dusk"
          loading="eager"
        />
      </div>

      <p className="hero-greeting"><span>{greeting}</span>, Guest</p>
      <h1 className="hero-title">Find your way.<br />Tell your story once.</h1>

      <SearchBar variant="hero" />

      <div className="hero-stats" data-reveal-group>
        <div className="hero-stat-card">
          <div className="stat-number" data-count-to="482" data-count-suffix="+">0</div>
          <div className="stat-label">Hospitals mapped</div>
        </div>
        <div className="hero-stat-card">
          <div className="stat-number" data-count-to="19" data-count-suffix="k+">0</div>
          <div className="stat-label">Patients guided</div>
        </div>
        <div className="hero-stat-card">
          <div className="stat-number" data-count-to="4.8" data-count-decimals="1">0</div>
          <div className="stat-label">Avg. experience</div>
        </div>
      </div>
    </section>
  );
}
