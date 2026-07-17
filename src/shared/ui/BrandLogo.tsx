import styles from './BrandLogo.module.css';

type BrandLogoVariant = 'full' | 'compact' | 'mark';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  className?: string;
  priority?: boolean;
}

const LOGO_SRC = '/brand/dizipay-logo.jpg';

export function BrandLogo({
  variant = 'full',
  className = '',
  priority = false,
}: BrandLogoProps) {
  return (
    <img
      src={LOGO_SRC}
      alt="DiziPay"
      className={`${styles.logo} ${styles[variant]} ${className}`.trim()}
      decoding="async"
      loading={priority ? 'eager' : 'lazy'}
    />
  );
}

export function BrandWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`${styles.wordmark} ${className}`.trim()} aria-label="DiziPay">
      <span className={styles.dizi}>Dizi</span>
      <span className={styles.pay}>Pay</span>
    </span>
  );
}
