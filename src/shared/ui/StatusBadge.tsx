import styles from './StatusBadge.module.css';
import type { PaymentLinkStatus } from '../../domain/entities/PaymentLink';

const toneClass: Record<PaymentLinkStatus, string> = {
  ACTIVE: styles.active,
  PAID: styles.paid,
  EXPIRED: styles.expired,
  CANCELLED: styles.cancelled,
};

export function StatusBadge({
  status,
  label,
}: {
  status: PaymentLinkStatus;
  label: string;
}) {
  return <span className={`${styles.badge} ${toneClass[status]}`}>{label}</span>;
}
