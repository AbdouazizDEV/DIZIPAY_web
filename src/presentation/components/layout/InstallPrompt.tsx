import { useEffect, useState } from 'react';
import { Button } from '../../../shared/ui/Button';
import styles from './InstallPrompt.module.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  if (!deferred || hidden) return null;

  return (
    <div className={styles.banner} role="region" aria-label="Installer l’application">
      <div>
        <strong>Installer DiziPay</strong>
        <p>Accédez plus vite aux paiements, même hors ligne.</p>
      </div>
      <div className={styles.actions}>
        <Button
          variant="secondary"
          onClick={() => {
            setHidden(true);
          }}
        >
          Plus tard
        </Button>
        <Button
          onClick={async () => {
            await deferred.prompt();
            await deferred.userChoice;
            setDeferred(null);
            setHidden(true);
          }}
        >
          Installer
        </Button>
      </div>
    </div>
  );
}
