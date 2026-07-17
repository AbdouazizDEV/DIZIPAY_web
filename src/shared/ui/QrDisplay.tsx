import { QRCodeSVG } from 'qrcode.react';
import styles from './QrDisplay.module.css';

interface QrDisplayProps {
  svg?: string;
  payload?: string | null;
  size?: number;
  alt?: string;
}

export function QrDisplay({
  svg,
  payload,
  size = 240,
  alt = 'QR code de paiement',
}: QrDisplayProps) {
  if (svg) {
    return (
      <div className={styles.frame} style={{ width: size, height: size }}>
        <span className={styles.corners} aria-hidden />
        <div
          role="img"
          aria-label={alt}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    );
  }

  if (payload) {
    return (
      <div className={styles.frame} style={{ width: size, height: size }}>
        <span className={styles.corners} aria-hidden />
        <QRCodeSVG value={payload} size={size - 28} level="M" includeMargin={false} />
      </div>
    );
  }

  return (
    <div className={styles.empty} style={{ width: size, height: size }} role="status">
      QR indisponible
    </div>
  );
}
