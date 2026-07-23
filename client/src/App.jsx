import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import CalendarPage from './pages/CalendarPage.jsx';
import DogsPage from './pages/DogsPage.jsx';
import OwnersPage from './pages/OwnersPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import { DataProvider } from './DataContext.jsx';
import { LanguageProvider, useLanguage } from './LanguageContext.jsx';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import './App.css';

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="language-switcher" role="group" aria-label="Language">
      <button
        type="button"
        className={language === 'en' ? 'active' : ''}
        onClick={() => setLanguage('en')}
      >
        EN
      </button>
      <button
        type="button"
        className={language === 'pl' ? 'active' : ''}
        onClick={() => setLanguage('pl')}
      >
        PL
      </button>
    </div>
  );
}

function AppShell() {
  const { t } = useLanguage();
  const { logout } = useAuth();
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header-inner">
            <h1 className="app-title">🐾 {t('app.title')}</h1>
            <nav className="app-nav">
              <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                {t('nav.calendar')}
              </NavLink>
              <NavLink to="/dogs" className={({ isActive }) => (isActive ? 'active' : '')}>
                {t('nav.dogs')}
              </NavLink>
              <NavLink to="/owners" className={({ isActive }) => (isActive ? 'active' : '')}>
                {t('nav.owners')}
              </NavLink>
            </nav>
            <div className="app-header-actions">
              <LanguageSwitcher />
              <button type="button" className="btn btn-secondary" onClick={logout}>
                {t('common.logout')}
              </button>
            </div>
          </div>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<CalendarPage />} />
            <Route path="/dogs" element={<DogsPage />} />
            <Route path="/owners" element={<OwnersPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function AuthGate() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <LoginPage />;
  return (
    <DataProvider>
      <AppShell />
    </DataProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
