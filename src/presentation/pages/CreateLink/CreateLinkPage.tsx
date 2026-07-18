import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useCreatePaymentLink } from '../../../application/payment-links/usePaymentLinks';
import { toPaymentLinkViewModel } from '../../../application/mappers/paymentLinkMapper';
import { formatXofFromCents, xofToCents } from '../../../shared/utils/money';
import { copyToClipboard, shareLink } from '../../../shared/utils/share';
import { getErrorMessage } from '../../../shared/utils/errors';
import { useToast } from '../../providers/ToastProvider';
import { Button } from '../../../shared/ui/Button';
import { Field, TextArea, TextInput } from '../../../shared/ui/Field';
import { QrDisplay } from '../../../shared/ui/QrDisplay';
import styles from './CreateLinkPage.module.css';

const schema = z.object({
  amountXof: z
    .number({ error: 'Montant requis' })
    .positive('Montant requis')
    .max(50_000_000, 'Montant trop élevé'),
  description: z.string().max(200, '200 caractères max').optional(),
  expiresInMinutes: z
    .number({ error: 'Durée requise' })
    .int()
    .min(5, 'Minimum 5 minutes')
    .max(10080, 'Maximum 7 jours'),
});

type FormValues = z.infer<typeof schema>;

const DURATION_PRESETS = [
  { label: '1 h', minutes: 60 },
  { label: '24 h', minutes: 1440 },
  { label: '3 j', minutes: 4320 },
  { label: '7 j', minutes: 10080 },
] as const;

function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 1) return '—';
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) {
    const h = Math.round(minutes / 60);
    return `${h} h`;
  }
  const days = Math.round(minutes / 1440);
  return `${days} j`;
}

export function CreateLinkPage() {
  const create = useCreatePaymentLink();
  const { pushToast } = useToast();
  const [createdToken, setCreatedToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amountXof: 1500,
      description: '',
      expiresInMinutes: 1440,
    },
  });

  const amountXof = useWatch({ control, name: 'amountXof' });
  const description = useWatch({ control, name: 'description' });
  const expiresInMinutes = useWatch({ control, name: 'expiresInMinutes' });

  const previewAmount = useMemo(() => {
    if (!Number.isFinite(amountXof) || amountXof <= 0) return '—';
    try {
      return formatXofFromCents(xofToCents(amountXof));
    } catch {
      return '—';
    }
  }, [amountXof]);

  const createdVm =
    create.data && createdToken ? toPaymentLinkViewModel(create.data) : null;

  if (createdVm) {
    return (
      <div className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.kicker}>Succès</p>
          <h1>Lien prêt à partager</h1>
          <p>Envoyez-le à votre client par WhatsApp, SMS ou e-mail.</p>
        </header>

        <div className={styles.successLayout}>
          <div className={styles.successCard}>
            <p className={styles.amount}>{createdVm.amountLabel}</p>
            <p className={styles.desc}>{createdVm.description}</p>
            <QrDisplay svg={createdVm.svg} payload={createdVm.qrPayload} size={220} />
            <p className={styles.url}>{createdVm.url}</p>
            <div className={styles.actions}>
              <Button
                fullWidth
                onClick={async () => {
                  const ok = await copyToClipboard(createdVm.url);
                  pushToast(
                    ok ? 'Lien copié' : 'Impossible de copier',
                    ok ? 'success' : 'error',
                  );
                }}
              >
                Copier le lien
              </Button>
              <Button
                fullWidth
                variant="secondary"
                onClick={async () => {
                  const result = await shareLink({
                    title: 'Paiement DiziPay',
                    text: `Payez ${createdVm.amountLabel} via DiziPay`,
                    url: createdVm.url,
                  });
                  if (result === 'shared') pushToast('Lien partagé', 'success');
                  if (result === 'copied') pushToast('Lien copié', 'success');
                  if (result === 'failed') pushToast('Partage annulé', 'info');
                }}
              >
                Partager
              </Button>
              <Link className={styles.detailLink} to={`/links/${createdVm.token}`}>
                Voir le détail
              </Link>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => {
                  setCreatedToken(null);
                  create.reset();
                }}
              >
                Créer un autre lien
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.kicker}>Nouveau paiement</p>
        <h1>Créer un lien</h1>
        <p>Indiquez le montant en francs CFA (XOF). Le lien sera prêt à partager.</p>
      </header>

      <div className={styles.layout}>
        <form
          className={styles.formCard}
          onSubmit={handleSubmit(async (values) => {
            try {
              const link = await create.mutateAsync({
                amount: xofToCents(values.amountXof),
                description: values.description?.trim() || undefined,
                expiresInMinutes: values.expiresInMinutes,
                includeSvg: true,
              });
              setCreatedToken(link.token);
              pushToast('Lien créé', 'success');
            } catch {
              // surface via create.error
            }
          })}
          noValidate
        >
          <div className={styles.amountBlock}>
            <Field
              label="Montant à encaisser"
              htmlFor="amountXof"
              error={errors.amountXof?.message}
              hint="Saisissez le montant en francs CFA (XOF)"
            >
              <div className={styles.amountField}>
                <TextInput
                  id="amountXof"
                  type="number"
                  inputMode="decimal"
                  min={1}
                  step={1}
                  {...register('amountXof', { valueAsNumber: true })}
                />
                <span className={styles.currency}>XOF</span>
              </div>
            </Field>
          </div>

          <Field
            label="Description (optionnel)"
            htmlFor="description"
            error={errors.description?.message}
            hint="Visible par votre client sur la page de paiement"
          >
            <TextArea
              id="description"
              maxLength={200}
              placeholder="Ex. Consultation pharmacie, facture #42…"
              {...register('description')}
            />
          </Field>

          <div className={styles.durationBlock}>
            <p className={styles.durationLabel}>Durée de validité</p>
            <div className={styles.presets} role="group" aria-label="Durées rapides">
              {DURATION_PRESETS.map((preset) => {
                const selected = expiresInMinutes === preset.minutes;
                return (
                  <button
                    key={preset.minutes}
                    type="button"
                    className={`${styles.preset} ${selected ? styles.presetActive : ''}`}
                    onClick={() =>
                      setValue('expiresInMinutes', preset.minutes, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <Field
              label="Minutes (personnalisé)"
              htmlFor="expiresInMinutes"
              error={errors.expiresInMinutes?.message}
              hint="Entre 5 minutes et 7 jours (10 080 min)"
            >
              <TextInput
                id="expiresInMinutes"
                type="number"
                min={5}
                max={10080}
                {...register('expiresInMinutes', { valueAsNumber: true })}
              />
            </Field>
          </div>

          {create.isError ? (
            <p className={styles.error} role="alert">
              {getErrorMessage(create.error)}
            </p>
          ) : null}

          <Button type="submit" fullWidth disabled={create.isPending}>
            {create.isPending ? 'Création…' : 'Générer le lien'}
          </Button>
        </form>

        <aside className={styles.preview} aria-live="polite">
          <p className={styles.previewEyebrow}>Aperçu client</p>
          <div className={styles.previewCard}>
            <p className={styles.previewMerchant}>Votre commerce</p>
            <p className={styles.previewAmount}>{previewAmount}</p>
            <p className={styles.previewDesc}>
              {description?.trim() || 'Aucune description'}
            </p>
            <div className={styles.previewQr} aria-hidden>
              <span />
            </div>
            <div className={styles.previewMeta}>
              <span>Validité</span>
              <strong>{formatDuration(expiresInMinutes)}</strong>
            </div>
            <p className={styles.previewHint}>
              Le client verra un QR PI-SPI et pourra aussi payer via son numéro.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
