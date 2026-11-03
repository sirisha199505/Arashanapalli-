import { useEffect, useState } from 'react';
import { COMPANY } from '../../data/catalog';
import usePageMeta from '../../hooks/usePageMeta';
import { fetchMyQuotations, loadCustomer, requestSignInCode, saveCustomer, verifySignInCode } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/format';
import Page from '../layout/Page';
import { customerStatusOf } from '../../utils/quoteStatus';
import { Badge, Button, Card, EmptyState, TextField } from '../ui';


/** /account: customers sign in with a code sent to their email and see every quotation made with that email. */
export default function AccountPage() {
  usePageMeta({ title: 'My quotations', description: `Sign in with your email to see your ${COMPANY.name} quotations.` });
  const [customer, setCustomer] = useState(loadCustomer);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email'); // email → code
  const [emailed, setEmailed] = useState(true); // false: no email set up (developer's computer) — the code is in the backend terminal
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [quotes, setQuotes] = useState(null);

  useEffect(() => {
    if (!customer) return undefined;
    let current = true;
    fetchMyQuotations(customer.token)
      .then((list) => current && setQuotes(list))
      .catch((err) => {
        if (!current) return;
        if (err.status === 401) signOut();
        else setError(err);
      });
    return () => {
      current = false;
    };
  }, [customer]);

  const run = async (action) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };
  const sendCode = (e) => {
    e.preventDefault();
    run(async () => {
      const sent = await requestSignInCode(email.trim());
      setEmailed(sent?.emailed !== false);
      setStep('code');
    });
  };
  const verify = (e) => {
    e.preventDefault();
    run(async () => {
      const session = await verifySignInCode(email.trim(), code.trim());
      saveCustomer(session);
      setCustomer(session);
    });
  };
  function signOut() {
    saveCustomer(null);
    setCustomer(null);
    setQuotes(null);
    setStep('email');
    setCode('');
  }

  if (!customer) {
    return (
      <Page eyebrow="Your account" title="My quotations" subtitle="Sign in with the email you gave us — we'll send you a 6-digit code.">
        <Card className="max-w-md p-5">
          {step === 'email' ? (
            <form onSubmit={sendCode} className="space-y-3">
              <TextField id="acc-email" label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? 'Sending…' : 'Send me a code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={verify} className="space-y-3">
              {emailed ? (
                <p className="text-sm text-muted">
                  We sent a code to <strong className="text-ink">{email}</strong>. It works for 10 minutes.
                </p>
              ) : (
                <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm text-muted">
                  <strong className="text-ink">Test mode — no email was sent.</strong> Email isn't set up on this computer, so the 6-digit code is printed in
                  the terminal where the backend runs (“sign-in code for {email}”). It works for 10 minutes.
                </p>
              )}
              <TextField id="acc-code" label="6-digit code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
              <Button type="submit" className="w-full" disabled={busy || code.length !== 6}>
                {busy ? 'Checking…' : 'Sign in'}
              </Button>
              <button type="button" onClick={() => setStep('email')} className="text-sm font-semibold text-primary hover:underline">
                Use a different email
              </button>
            </form>
          )}
          {error && (
            <p role="alert" className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
              {error.message}
            </p>
          )}
          <p className="mt-4 border-t border-line pt-3 text-xs text-muted">
            Have a Quotation ID? You can also{' '}
            <a href="/track" className="font-semibold text-primary hover:underline">
              look it up directly
            </a>
            .
          </p>
        </Card>
      </Page>
    );
  }

  return (
    <Page eyebrow="Your account" title="My quotations" subtitle={`Signed in as ${customer.email}`}>
      <div className="mb-4 flex justify-end">
        <Button variant="secondary" size="sm" onClick={signOut}>
          Sign out
        </Button>
      </div>
      {error && <p className="text-sm text-primary">{error.message}</p>}
      {quotes === null && !error && <p className="text-sm text-muted">Loading…</p>}
      {quotes?.length === 0 && (
        <Card>
          <EmptyState
            title="No quotations with this email yet"
            message="Quotations show here when you add your email while sending a quote request."
            action={
              <Button as="a" href="/quote">
                Get a quote
              </Button>
            }
          />
        </Card>
      )}
      {quotes?.length > 0 && (
        <Card className="divide-y divide-line">
          {quotes.map((q) => {
            const { label, tone } = customerStatusOf(q);
            return (
              <a key={q.quote_number} href={`/track/${q.quote_number}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4 hover:bg-surface-2/60">
                <span className="font-mono text-sm font-bold">{q.quote_number}</span>
                <Badge tone={tone}>{label}</Badge>
                <span className="text-sm text-muted">
                  {formatDate(new Date(q.created_at))} · {q.item_count} item{q.item_count === 1 ? '' : 's'}
                  {q.versions.length > 1 && ` · ${q.versions.length} versions`}
                </span>
                <span className="ml-auto font-semibold">{formatCurrency(q.total)}</span>
              </a>
            );
          })}
        </Card>
      )}
    </Page>
  );
}
