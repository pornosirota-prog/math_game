import { NavLink } from 'react-router-dom';

export const SiteFooter = () => (
  <footer className="site-footer layout">
    <div>
      <strong>Math Game</strong>
      <p>Тренируй скорость счёта и прогрессируй каждый день.</p>
    </div>
    <nav className="footer-links">
      <NavLink to="/about">About</NavLink>
      <NavLink to="/faq">FAQ</NavLink>
      <NavLink to="/privacy">Privacy Policy</NavLink>
      <NavLink to="/terms">Terms</NavLink>
      <NavLink to="/support">Contact / Support</NavLink>
    </nav>
  </footer>
);
