'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useMockAuth } from '@/lib/useMockAuth';
import { useRouter } from '@/i18n/navigation';

export function CustomerLoginForm() {
  const t = useTranslations('loginPage');
  const { login } = useMockAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;
      try {
        const klantDoc = await getDoc(doc(db, 'klanten', uid));
        const status = klantDoc.exists() ? (klantDoc.data() as { status?: string }).status : null;

        if (status === 'Goedgekeurd') {
          login(email, uid);
          router.replace('/account');
        } else if (status === 'Beoordelen') {
          setError(t('pendingMessage'));
        } else if (status === 'Afgewezen') {
          setError(t('rejectedMessage'));
        } else {
          setError(t('loginError'));
        }
      } finally {
        await signOut(auth);
      }
    } catch {
      setError(t('loginError'));
    }
  }

  const fieldClassName = 'rounded-sm bg-black/40 px-3 py-2 text-sm text-white';
  const labelClassName = 'flex flex-col gap-1 text-xs uppercase tracking-wide text-white/60';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm text-white/80">
      <label className={labelClassName}>
        {t('labelEmail')}
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          data-testid="login-email"
          className={fieldClassName}
        />
      </label>

      <label className={labelClassName}>
        {t('labelPassword')}
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          data-testid="login-password"
          className={fieldClassName}
        />
      </label>

      {error && (
        <p data-testid="login-error" className="text-xs text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        data-testid="login-submit"
        className="mt-2 rounded-sm bg-silver px-4 py-2.5 text-xs tracking-[0.15em] text-ink"
      >
        {t('submit')}
      </button>
    </form>
  );
}
