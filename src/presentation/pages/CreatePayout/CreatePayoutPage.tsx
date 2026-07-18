import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createPayoutFormSchema,
  formValuesToPayoutInput,
  generatePayoutReference,
  useCreatePayout,
  type CreatePayoutFormValues,
} from '../../../application/payouts/useCreatePayout';
import { getErrorMessage } from '../../../shared/utils/errors';
import { useToast } from '../../providers/ToastProvider';
import { Button } from '../../../shared/ui/Button';
import { Field, TextArea, TextInput } from '../../../shared/ui/Field';
import styles from './CreatePayoutPage.module.css';

const SEED_DEBIT_ACCOUNT = '10188672388920614979';

function mobileDefaults(): CreatePayoutFormValues {
  return {
    accountType: 'MOBILE_MONEY',
    debitAccount: SEED_DEBIT_ACCOUNT,
    pispiAccountId: SEED_DEBIT_ACCOUNT,
    holderName: '',
    phoneNumber: '',
    amountXof: 5000,
    reference: generatePayoutReference('OUT-MM'),
    description: '',
  };
}

function bankDefaults(): CreatePayoutFormValues {
  return {
    accountType: 'BANK_ACCOUNT',
    debitAccount: SEED_DEBIT_ACCOUNT,
    iban: '',
    holderName: '',
    bic: '',
    countryCode: 'SN',
    amountXof: 5000,
    reference: generatePayoutReference('OUT-BANK'),
    description: '',
  };
}

export function CreatePayoutPage() {
  const create = useCreatePayout();
  const { pushToast } = useToast();
  const [successId, setSuccessId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreatePayoutFormValues>({
    resolver: zodResolver(createPayoutFormSchema),
    defaultValues: mobileDefaults(),
  });

  const accountType = watch('accountType');

  if (successId) {
    return (
      <div className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.kicker}>Succès</p>
          <h1>Virement initié</h1>
          <p>La demande a été transmise au fournisseur de paiement.</p>
        </header>
        <div className={styles.successCard}>
          <p className={styles.successId}>
            Réf. fournisseur : <strong>{successId}</strong>
          </p>
          <Button
            fullWidth
            onClick={() => {
              setSuccessId(null);
              create.reset();
              reset(mobileDefaults());
            }}
          >
            Nouveau virement
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.kicker}>Sortie de fonds</p>
        <h1>Initier un virement</h1>
        <p>Mobile money ou compte bancaire — montant en francs CFA (XOF).</p>
      </header>

      <form
        className={styles.formCard}
        onSubmit={handleSubmit(async (values) => {
          try {
            const result = await create.mutateAsync(formValuesToPayoutInput(values));
            const id =
              (typeof result.providerPayoutId === 'string' && result.providerPayoutId) ||
              values.reference;
            setSuccessId(id);
            pushToast('Virement initié', 'success');
          } catch (err) {
            pushToast(getErrorMessage(err, 'Échec du virement'), 'error');
          }
        })}
        noValidate
      >
        <div className={styles.typeBlock}>
          <p className={styles.typeLabel}>Type de compte bénéficiaire</p>
          <div className={styles.presets} role="group" aria-label="Type de virement">
            <button
              type="button"
              className={`${styles.preset} ${accountType === 'MOBILE_MONEY' ? styles.presetActive : ''}`}
              onClick={() => reset(mobileDefaults())}
            >
              Mobile money
            </button>
            <button
              type="button"
              className={`${styles.preset} ${accountType === 'BANK_ACCOUNT' ? styles.presetActive : ''}`}
              onClick={() => reset(bankDefaults())}
            >
              Compte bancaire
            </button>
          </div>
        </div>

        <Field
          label="Compte de débit (marchand)"
          htmlFor="debitAccount"
          error={errors.debitAccount?.message}
          hint="Compte débité pour ce virement (prérempli pour la démo)"
        >
          <TextInput id="debitAccount" {...register('debitAccount')} />
        </Field>

        <div className={styles.amountBlock}>
          <Field
            label="Montant (XOF)"
            htmlFor="amountXof"
            error={errors.amountXof?.message}
            hint="Montant en francs CFA"
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
          label="Nom du bénéficiaire"
          htmlFor="holderName"
          error={errors.holderName?.message}
        >
          <TextInput id="holderName" autoComplete="name" {...register('holderName')} />
        </Field>

        {accountType === 'MOBILE_MONEY' ? (
          <>
            <Field
              label="Identifiant compte PI-SPI"
              htmlFor="pispiAccountId"
              error={
                accountType === 'MOBILE_MONEY' && 'pispiAccountId' in errors
                  ? errors.pispiAccountId?.message
                  : undefined
              }
            >
              <TextInput id="pispiAccountId" {...register('pispiAccountId')} />
            </Field>
            <Field
              label="Téléphone bénéficiaire"
              htmlFor="phoneNumber"
              error={
                accountType === 'MOBILE_MONEY' && 'phoneNumber' in errors
                  ? errors.phoneNumber?.message
                  : undefined
              }
              hint="Ex. +221771234567"
            >
              <TextInput
                id="phoneNumber"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                {...register('phoneNumber')}
              />
            </Field>
          </>
        ) : (
          <>
            <Field
              label="IBAN"
              htmlFor="iban"
              error={
                accountType === 'BANK_ACCOUNT' && 'iban' in errors
                  ? errors.iban?.message
                  : undefined
              }
            >
              <TextInput id="iban" autoComplete="off" {...register('iban')} />
            </Field>
            <div className={styles.row}>
              <Field
                label="BIC (optionnel)"
                htmlFor="bic"
                error={
                  accountType === 'BANK_ACCOUNT' && 'bic' in errors
                    ? errors.bic?.message
                    : undefined
                }
              >
                <TextInput id="bic" {...register('bic')} />
              </Field>
              <Field
                label="Pays"
                htmlFor="countryCode"
                error={
                  accountType === 'BANK_ACCOUNT' && 'countryCode' in errors
                    ? errors.countryCode?.message
                    : undefined
                }
                hint="Code pays (ex. SN, FR)"
              >
                <TextInput id="countryCode" maxLength={2} {...register('countryCode')} />
              </Field>
            </div>
          </>
        )}

        <Field
          label="Référence"
          htmlFor="reference"
          error={errors.reference?.message}
          hint="Identifiant unique de votre virement (8 caractères minimum)"
        >
          <TextInput id="reference" {...register('reference')} />
        </Field>

        <Field
          label="Description (optionnel)"
          htmlFor="description"
          error={errors.description?.message}
        >
          <TextArea id="description" maxLength={200} {...register('description')} />
        </Field>

        {create.isError ? (
          <p className={styles.error} role="alert">
            {getErrorMessage(create.error)}
          </p>
        ) : null}

        <Button type="submit" fullWidth disabled={create.isPending}>
          {create.isPending ? 'Envoi en cours…' : 'Envoyer le virement'}
        </Button>
      </form>
    </div>
  );
}
