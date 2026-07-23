import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { useLanguage } from '../LanguageContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const { t, tError, language, setLanguage } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(tError(err.message) || t('common.genericError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="language-switcher login-language-switcher" role="group" aria-label="Language">
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
      <form className="login-card form" onSubmit={handleSubmit}>
        <h1 className="login-title">🐾 {t('app.title')}</h1>
        <label>
          {t('login.username')}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />
        </label>
        <label>
          {t('login.password')}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? t('common.saving') : t('login.submit')}
        </button>
      </form>
    </div>
  );
}
