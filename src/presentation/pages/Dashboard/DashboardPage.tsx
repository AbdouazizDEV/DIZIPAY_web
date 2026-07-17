import { Link } from 'react-router-dom';
import { usePaymentLinks } from '../../../application/payment-links/usePaymentLinks';
import { Button } from '../../../shared/ui/Button';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { getErrorMessage } from '../../../shared/utils/errors';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = usePaymentLinks();

  if (isLoading) {
    return <p className={styles.muted}>Chargement du tableau de bord…</p>;
  }

  if (isError) {
    return (
      <EmptyState
        title="Impossible de charger les liens"
        description={getErrorMessage(error)}
        action={
          <Button onClick={() => void refetch()} variant="secondary">
            Réessayer
          </Button>
        }
      />
    );
  }

  const summary = data?.summary ?? { active: 0, paid: 0, total: 0 };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>Vue d’ensemble</p>
          <h1>Tableau de bord</h1>
          <p className={styles.lead}>
            Suivez vos liens actifs et vos encaissements en un coup d’œil.
          </p>
        </div>
        <Link className={styles.primaryCta} to="/links/new">
          Créer un lien
        </Link>
      </section>

      <div className={styles.stats}>
        <article className={`${styles.stat} ${styles.statAccent}`}>
          <p>Actifs</p>
          <strong>{summary.active}</strong>
          <span className={styles.statHint}>En attente de paiement</span>
        </article>
        <article className={styles.stat}>
          <p>Payés</p>
          <strong>{summary.paid}</strong>
          <span className={styles.statHint}>Transactions réussies</span>
        </article>
        <article className={styles.stat}>
          <p>Total</p>
          <strong>{summary.total}</strong>
          <span className={styles.statHint}>Liens créés</span>
        </article>
      </div>

      <section className={styles.panel}>
        <div>
          <h2>Continuer</h2>
          <p>Générez un nouveau lien ou consultez l’historique.</p>
        </div>
        <div className={styles.cta}>
          <Link className={styles.secondaryCta} to="/links">
            Voir tous les liens
          </Link>
        </div>
      </section>
    </div>
  );
}
