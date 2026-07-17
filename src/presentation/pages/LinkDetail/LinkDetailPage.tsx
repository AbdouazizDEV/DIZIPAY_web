import { Link, useParams } from 'react-router-dom';
import {
  useCancelPaymentLink,
  useMerchantPaymentLink,
  usePaymentLinkStatus,
} from '../../../application/payment-links/usePaymentLinks';
import { PaymentLinkStatus } from '../../../domain/entities/PaymentLink';
import { copyToClipboard, shareLink } from '../../../shared/utils/share';
import { getErrorMessage } from '../../../shared/utils/errors';
import { useToast } from '../../providers/ToastProvider';
import { Button } from '../../../shared/ui/Button';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { QrDisplay } from '../../../shared/ui/QrDisplay';
import { StatusBadge } from '../../../shared/ui/StatusBadge';
import styles from './LinkDetailPage.module.css';

export function LinkDetailPage() {
  const { token } = useParams<{ token: string }>();
  const { pushToast } = useToast();
  const detail = useMerchantPaymentLink(token);
  const status = usePaymentLinkStatus(token, {
    enabled: Boolean(token),
    pollMs: 4000,
  });
  const cancel = useCancelPaymentLink();

  if (detail.isLoading) {
    return <p className={styles.muted}>Chargement du lien…</p>;
  }

  if (detail.isError || !detail.data) {
    return (
      <EmptyState
        title="Lien introuvable"
        description={getErrorMessage(detail.error, 'Ce lien n’existe pas.')}
        action={
          <Link className={styles.back} to="/links">
            Retour à la liste
          </Link>
        }
      />
    );
  }

  const link = detail.data;
  const liveStatus = status.data?.status ?? link.status;
  const statusLabel =
    liveStatus === PaymentLinkStatus.ACTIVE
      ? 'Actif'
      : liveStatus === PaymentLinkStatus.PAID
        ? 'Payé'
        : liveStatus === PaymentLinkStatus.EXPIRED
          ? 'Expiré'
          : 'Annulé';

  return (
    <div className={styles.page}>
      <Link className={styles.back} to="/links">
        ← Mes liens
      </Link>

      <header className={styles.header}>
        <h1>{link.amountLabel}</h1>
        <StatusBadge status={liveStatus} label={statusLabel} />
      </header>

      <p className={styles.desc}>{link.description}</p>
      <dl className={styles.meta}>
        <div>
          <dt>Expiration</dt>
          <dd>{link.expiresAtLabel}</dd>
        </div>
        <div>
          <dt>Créé</dt>
          <dd>{link.createdAtLabel}</dd>
        </div>
        {status.data?.paidAt ? (
          <div>
            <dt>Payé le</dt>
            <dd>{new Date(status.data.paidAt).toLocaleString('fr-FR')}</dd>
          </div>
        ) : null}
      </dl>

      {liveStatus === PaymentLinkStatus.ACTIVE ? (
        <p className={styles.live} role="status">
          Suivi en direct — actualisation automatique
        </p>
      ) : null}

      {(link.svg || link.qrPayload) && liveStatus === PaymentLinkStatus.ACTIVE ? (
        <QrDisplay svg={link.svg} payload={link.qrPayload} size={220} />
      ) : null}

      <p className={styles.url}>{link.url}</p>

      <div className={styles.actions}>
        <Button
          onClick={async () => {
            const ok = await copyToClipboard(link.url);
            pushToast(ok ? 'Lien copié' : 'Échec copie', ok ? 'success' : 'error');
          }}
        >
          Copier
        </Button>
        <Button
          variant="secondary"
          onClick={async () => {
            const result = await shareLink({
              title: 'Paiement DiziPay',
              text: `Payez ${link.amountLabel}`,
              url: link.url,
            });
            if (result === 'shared' || result === 'copied') {
              pushToast(result === 'shared' ? 'Partagé' : 'Copié', 'success');
            }
          }}
        >
          Partager
        </Button>
        {liveStatus === PaymentLinkStatus.ACTIVE ? (
          <Button
            variant="danger"
            disabled={cancel.isPending}
            onClick={async () => {
              if (!window.confirm('Annuler ce lien ?')) return;
              try {
                await cancel.mutateAsync(link.token);
                pushToast('Lien annulé', 'success');
              } catch (err) {
                pushToast(getErrorMessage(err), 'error');
              }
            }}
          >
            Annuler
          </Button>
        ) : null}
      </div>
    </div>
  );
}
