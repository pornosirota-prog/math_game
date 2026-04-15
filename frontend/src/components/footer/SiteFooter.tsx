import { NavLink } from 'react-router-dom';

export const SiteFooter = () => (
  <footer className="site-footer layout">
    <div>
      <strong>Math Game</strong>
      <p>Тренируй скорость счёта, улучшай точность и отслеживай прогресс каждый день.</p>
    </div>
    <nav className="footer-links" aria-label="Footer navigation">
      <NavLink to="/about">About</NavLink>
      <NavLink to="/faq">FAQ</NavLink>
      <NavLink to="/how-to-play">How to Play</NavLink>
      <NavLink to="/modes">Modes</NavLink>
      <NavLink to="/daily-challenge">Daily Challenge</NavLink>
      <NavLink to="/privacy">Privacy</NavLink>
      <NavLink to="/terms">Terms</NavLink>
      <NavLink to="/contact">Contact</NavLink>
    </nav>
  </footer>
);
