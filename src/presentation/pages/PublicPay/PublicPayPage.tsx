import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import {
  usePayPaymentLink,
  usePaymentLinkStatus,
  usePublicPaymentLink,
} from '../../../application/payment-links/usePaymentLinks';
import { PaymentLinkStatus } from '../../../domain/entities/PaymentLink';
import { ApiError } from '../../../domain/errors/ApiError';
import { getErrorMessage } from '../../../shared/utils/errors';
import { Button } from '../../../shared/ui/Button';
import { BrandLogo } from '../../../shared/ui/BrandLogo';
import { Field, TextInput } from '../../../shared/ui/Field';
import { QrDisplay } from '../../../shared/ui/QrDisplay';
import { InstallPrompt } from '../../components/layout/InstallPrompt';
import styles from './PublicPayPage.module.css';

const phoneSchema = z.object({
  clientPhone: z
    .string()
    .min(8, 'Numéro requis')
    .max(32, 'Numéro trop long')
    .regex(/^\+?[0-9\s-]{8,32}$/, 'Format téléphone invalide'),
});

type PhoneForm = z.infer<typeof phoneSchema>;

function OfflineBanner({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className={styles.offline} role="status">
      Hors ligne — reconnectez-vous pour actualiser le statut.
    </div>
  );
}

export function PublicPayPage() {
  const { token } = useParams<{ token: string }>();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showPhoneForm, setShowPhoneForm] = useState(false);

  useEffect(() => {
    const on = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const publicLink = usePublicPaymentLink(token);
  const liveStatus = usePaymentLinkStatus(token, {
    enabled: Boolean(token) && !isOffline && !publicLink.isError,
    pollMs: 4000,
  });
  const pay = usePayPaymentLink(token ?? '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { clientPhone: '' },
  });

  if (publicLink.isLoading) {
    return (
      <div className={styles.shell}>
        <p className={styles.centerMsg}>Chargement du paiement…</p>
      </div>
    );
  }

  if (publicLink.isError || !publicLink.data) {
    const notFound =
      publicLink.error instanceof ApiError && publicLink.error.isNotFound;
    return (
      <div className={styles.shell}>
        <div className={styles.statePanel}>
          <BrandLogo variant="compact" className={styles.brand} priority />
          <h1>{notFound ? 'Lien introuvable' : 'Erreur'}</h1>
          <p>{getErrorMessage(publicLink.error, 'Impossible de charger ce lien.')}</p>
          <Button variant="secondary" onClick={() => void publicLink.refetch()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  const link = publicLink.data;
  const status = liveStatus.data?.status ?? link.status;

  if (status === PaymentLinkStatus.PAID) {
    return (
      <div className={styles.shell}>
        <div className={`${styles.statePanel} ${styles.success}`}>
          <BrandLogo variant="compact" className={styles.brand} />
          <h1>Paiement reçu</h1>
          <p className={styles.heroAmount}>{link.amountLabel}</p>
          <p>Merci. Le marchand {link.merchantName} a été notifié.</p>
        </div>
      </div>
    );
  }

  if (status === PaymentLinkStatus.EXPIRED || status === PaymentLinkStatus.CANCELLED) {
    return (
      <div className={styles.shell}>
        <div className={styles.statePanel}>
          <BrandLogo variant="compact" className={styles.brand} />
          <h1>{status === PaymentLinkStatus.EXPIRED ? 'Lien expiré' : 'Lien annulé'}</h1>
          <p className={styles.heroAmount}>{link.amountLabel}</p>
          <p>Ce paiement n’est plus disponible.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <OfflineBanner visible={isOffline} />
      <div className={styles.pay}>
        <BrandLogo variant="compact" className={styles.brand} priority />
        <p className={styles.merchant}>{link.merchantName}</p>
        <h1 className={styles.heroAmount}>{link.amountLabel}</h1>
        {link.description ? <p className={styles.description}>{link.description}</p> : null}
        <p className={styles.expiry}>Valable jusqu’au {link.expiresAtLabel}</p>

        <QrDisplay svg={link.svg} payload={link.qrPayload} size={260} />
        <p className={styles.hint}>{link.instructions}</p>

        <div className={styles.phoneBlock}>
          {!showPhoneForm ? (
            <Button fullWidth variant="secondary" onClick={() => setShowPhoneForm(true)}>
              Payer avec mon numéro
            </Button>
          ) : (
            <form
              className={styles.phoneForm}
              onSubmit={handleSubmit(async (values) => {
                try {
                  await pay.mutateAsync({
                    clientPhone: values.clientPhone.replace(/\s+/g, ''),
                  });
                  reset();
                  await liveStatus.refetch();
                } catch {
                  // pay.error
                }
              })}
              noValidate
            >
              <Field
                label="Téléphone wallet"
                htmlFor="clientPhone"
                error={errors.clientPhone?.message}
                hint="Ex. +221771234567"
              >
                <TextInput
                  id="clientPhone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+221…"
                  {...register('clientPhone')}
                />
              </Field>
              {pay.isError ? (
                <p className={styles.error} role="alert">
                  {getErrorMessage(pay.error)}
                </p>
              ) : null}
              <Button type="submit" fullWidth disabled={pay.isPending || isOffline}>
                {pay.isPending ? 'Initiation…' : 'Initier le paiement'}
              </Button>
            </form>
          )}
        </div>

        <p className={styles.live} role="status">
          En attente du paiement…
        </p>

        <div className={styles.install}>
          <InstallPrompt />
        </div>
      </div>
    </div>
  );
}
