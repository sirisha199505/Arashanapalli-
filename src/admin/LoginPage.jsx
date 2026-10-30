import { useState } from 'react';
import { COMPANY } from '../data/catalog';
import { Button, Card, Icon, Logo, TextField } from '../components/ui';
import { postImage } from '../utils/stories';
import { login } from './adminApi';
import { ErrorNote } from './fields';

const ADMIN_ROLE = 1;

// store photo behind the sign-in card, darkened and tinted brand red so the card stays readable
const BACKDROP = {
  backgroundImage: `linear-gradient(135deg, rgba(20, 20, 20, 0.86), rgba(130, 25, 29, 0.72)), url(${postImage('DdVqVaYgZBE')})`,
};

/** Email + password sign-in. The backend checks the password; this only collects it. */
export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { token, info } = await login(form.email, form.password);
      if (info.role !== ADMIN_ROLE) throw new Error('This account is not an admin.');
      onLogin({ token, name: info.full_name, email: info.email });
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <main style={BACKDROP} className="grid min-h-svh place-items-center bg-dark bg-cover bg-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Card className="p-6 shadow-2xl shadow-black/40">
          <div className="mb-6 flex items-center gap-3">
            <Logo className="h-11 w-11" />
            <div>
              <h1 className="font-display text-xl font-semibold">{COMPANY.name}</h1>
              <p className="text-sm text-muted">Admin sign in</p>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <TextField id="admin-email" label="Email" type="email" autoComplete="username" required value={form.email} onChange={set('email')} />
            <div className="relative">
              <TextField
                id="admin-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={form.password}
                onChange={set('password')}
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute bottom-1 right-1 grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink"
              >
                <Icon name={showPassword ? 'eyeOff' : 'eye'} className="h-[18px] w-[18px]" />
              </button>
            </div>
            <ErrorNote error={error} />
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </Card>
        <p className="mt-5 text-center text-xs tracking-wide text-white/70">
          {COMPANY.tagline} · Serving {COMPANY.area} since {COMPANY.established}
        </p>
      </div>
    </main>
  );
}
