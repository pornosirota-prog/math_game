import { NavLink } from 'react-router-dom';

const FOOTER_LINKS = [
  { to: '/about', label: 'О проекте' },
  { to: '/how-to-play', label: 'Как играть' },
  { to: '/modes', label: 'Режимы' },
  { to: '/daily-challenge', label: 'Daily Challenge' },
  { to: '/faq', label: 'FAQ' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/contact', label: 'Contact' }
];

export const SiteFooter = () => (
  <footer className="site-footer layout">
    <div>
      <strong>Math Game</strong>
      <p>Тренируй скорость счёта, отслеживай прогресс и возвращайся к ежедневной практике.</p>
    </div>
    <nav className="footer-links" aria-label="Навигация в подвале сайта">
      {FOOTER_LINKS.map((item) => (
        <NavLink key={item.to} to={item.to}>{item.label}</NavLink>
      ))}
    </nav>
  </footer>
);
