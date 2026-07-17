import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useCancelPaymentLink,
  usePaymentLinks,
} from '../../../application/payment-links/usePaymentLinks';
import { PaymentLinkStatus } from '../../../domain/entities/PaymentLink';
import { copyToClipboard } from '../../../shared/utils/share';
import { getErrorMessage } from '../../../shared/utils/errors';
import { useToast } from '../../providers/ToastProvider';
import { Button } from '../../../shared/ui/Button';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { StatusBadge } from '../../../shared/ui/StatusBadge';
import styles from './LinksListPage.module.css';

const FILTERS = [
  { value: 'ALL', label: 'Tous' },
  { value: PaymentLinkStatus.ACTIVE, label: 'Actifs' },
  { value: PaymentLinkStatus.PAID, label: 'Payés' },
  { value: PaymentLinkStatus.EXPIRED, label: 'Expirés' },
  { value: PaymentLinkStatus.CANCELLED, label: 'Annulés' },
] as const;

type FilterValue = (typeof FILTERS)[number]['value'];

export function LinksListPage() {
  const { data, isLoading, isError, error, refetch } = usePaymentLinks();
  const cancel = useCancelPaymentLink();
  const { pushToast } = useToast();
  const [filter, setFilter] = useState<FilterValue>('ALL');

  const links = useMemo(() => {
    const items = data?.links ?? [];
    if (filter === 'ALL') return items;
    return items.filter((link) => link.status === filter);
  }, [data?.links, filter]);

  if (isLoading) {
    return <p className={styles.muted}>Chargement des liens…</p>;
  }

  if (isError) {
    return (
      <EmptyState
        title="Impossible de charger la liste"
        description={getErrorMessage(error)}
        action={
          <Button variant="secondary" onClick={() => void refetch()}>
            Réessayer
          </Button>
        }
      />
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Mes liens</h1>
          <p>Copiez, ouvrez ou annulez un lien actif.</p>
        </div>
        <Link className={styles.newLink} to="/links/new">
          Nouveau
        </Link>
      </header>

      <div className={styles.filters} role="tablist" aria-label="Filtrer par statut">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={filter === item.value}
            className={`${styles.filter} ${filter === item.value ? styles.filterActive : ''}`}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {links.length === 0 ? (
        <EmptyState
          title="Aucun lien"
          description="Créez votre premier lien de paiement pour commencer."
          action={
            <Link className={styles.newLink} to="/links/new">
              Créer un lien
            </Link>
          }
        />
      ) : (
        <ul className={styles.list}>
          {links.map((link) => (
            <li key={link.id} className={styles.item}>
              <div className={styles.itemTop}>
                <strong>{link.amountLabel}</strong>
                <StatusBadge status={link.status} label={link.statusLabel} />
              </div>
              <p className={styles.desc}>{link.description}</p>
              <p className={styles.meta}>Expire : {link.expiresAtLabel}</p>
              <div className={styles.actions}>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    const ok = await copyToClipboard(link.url);
                    pushToast(ok ? 'Lien copié' : 'Échec copie', ok ? 'success' : 'error');
                  }}
                >
                  Copier
                </Button>
                <a className={styles.open} href={link.url} target="_blank" rel="noreferrer">
                  Ouvrir
                </a>
                <Link className={styles.open} to={`/links/${link.token}`}>
                  Détail
                </Link>
                {link.canCancel ? (
                  <Button
                    variant="danger"
                    disabled={cancel.isPending}
                    onClick={async () => {
                      const confirmed = window.confirm('Annuler ce lien actif ?');
                      if (!confirmed) return;
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
