import { useToast } from '../../providers/ToastProvider';
import styles from './ToastViewport.module.css';

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className={styles.viewport} aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.tone]}`}
          role={toast.tone === 'error' ? 'alert' : 'status'}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            className={styles.close}
            aria-label="Fermer la notification"
            onClick={() => dismissToast(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
