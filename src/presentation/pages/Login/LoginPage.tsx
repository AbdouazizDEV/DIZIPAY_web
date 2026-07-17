import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLogin } from '../../../application/auth/useLogin';
import { getErrorMessage } from '../../../shared/utils/errors';
import { Button } from '../../../shared/ui/Button';
import { BrandLogo } from '../../../shared/ui/BrandLogo';
import { Field, TextInput } from '../../../shared/ui/Field';
import { useAuth } from '../../providers/AuthProvider';
import styles from './LoginPage.module.css';

const schema = z.object({
  email: z.email('Email invalide'),
  password: z.string().min(8, 'Mot de passe requis'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { setSession } = useAuth();
  const login = useLogin(setSession);
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from &&
    (location.state as { from?: string }).from !== '/login'
      ? (location.state as { from: string }).from
      : '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: 'merchant@dizipay.local',
      password: '',
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.stage}>
        <aside className={styles.hero} aria-hidden={false}>
          <BrandLogo variant="full" className={styles.heroLogo} priority />
          <h1 className={styles.heroTitle}>Paiements PI-SPI, simplement.</h1>
          <p className={styles.heroText}>
            Créez un lien, partagez-le, encaisez en XOF — pensé pour les marchands de
            la zone UEMOA.
          </p>
          <ul className={styles.heroList}>
            <li>QR dynamique sécurisé</li>
            <li>Suivi en temps réel</li>
            <li>Installable en PWA</li>
          </ul>
        </aside>

        <div className={styles.panel}>
          <div className={styles.mobileBrand}>
            <BrandLogo variant="full" priority />
          </div>
          <p className={styles.kicker}>Espace marchand</p>
          <h2>Connexion</h2>
          <p className={styles.lead}>Accédez à vos liens de paiement DiziPay.</p>

          <form
            className={styles.form}
            onSubmit={handleSubmit(async (values) => {
              try {
                await login.mutateAsync(values);
                navigate(from, { replace: true });
              } catch {
                // handled via login.error
              }
            })}
            noValidate
          >
            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <TextInput
                id="email"
                type="email"
                autoComplete="username"
                {...register('email')}
              />
            </Field>
            <Field label="Mot de passe" htmlFor="password" error={errors.password?.message}>
              <TextInput
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
              />
            </Field>

            {login.isError ? (
              <p className={styles.error} role="alert">
                {getErrorMessage(login.error, 'Identifiants incorrects')}
              </p>
            ) : null}

            <Button type="submit" fullWidth disabled={login.isPending}>
              {login.isPending ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
