import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { InstallPrompt } from '../components/layout/InstallPrompt';
import { BrandLogo, BrandWordmark } from '../../shared/ui/BrandLogo';
import { Button } from '../../shared/ui/Button';
import styles from './MerchantLayout.module.css';

const links = [
  {
    to: '/',
    label: 'Tableau',
    icon: '◈',
    match: (pathname: string) => pathname === '/',
  },
  {
    to: '/links/new',
    label: 'Créer',
    icon: '+',
    match: (pathname: string) => pathname === '/links/new',
  },
  {
    to: '/links',
    label: 'Mes liens',
    icon: '☰',
    match: (pathname: string) =>
      pathname === '/links' ||
      (pathname.startsWith('/links/') && pathname !== '/links/new'),
  },
  {
    to: '/payouts/new',
    label: 'Virement',
    icon: '↗',
    match: (pathname: string) => pathname.startsWith('/payouts'),
  },
];

export function MerchantLayout() {
  const { clearSession } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Navigation marchand">
        <div className={styles.brandBlock}>
          <BrandLogo variant="full" className={styles.sidebarLogo} priority />
          <p className={styles.brandTag}>Espace marchand</p>
        </div>
        <nav className={styles.nav}>
          {links.map((link) => {
            const active = link.match(pathname);
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={`${styles.navLink} ${active ? styles.active : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className={styles.navIcon} aria-hidden>
                  {link.icon}
                </span>
                {link.label}
              </NavLink>
            );
          })}
        </nav>
        <div className={styles.sidebarFoot}>
          <p className={styles.sidebarHint}>Paiements PI-SPI · XOF</p>
          <Button variant="secondary" onClick={clearSession} className={styles.logout}>
            Déconnexion
          </Button>
        </div>
      </aside>

      <div className={styles.mainColumn}>
        <header className={styles.topbar}>
          <BrandWordmark />
          <Button variant="ghost" onClick={clearSession}>
            Sortir
          </Button>
        </header>
        <main className={styles.content}>
          <div className={styles.installSlot}>
            <InstallPrompt />
          </div>
          <Outlet />
        </main>
      </div>

      <nav className={styles.bottomNav} aria-label="Navigation mobile">
        {links.map((link) => {
          const active = link.match(pathname);
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={`${styles.bottomLink} ${active ? styles.active : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className={styles.bottomIcon} aria-hidden>
                {link.icon}
              </span>
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
