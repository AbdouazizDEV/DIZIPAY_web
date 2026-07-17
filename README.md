# DiziPay Website

Application web **React + TypeScript + PWA** pour générer et payer des liens de paiement DiziPay (PI-SPI / XOF), et initier des virements sortants.

## Prérequis

- Node.js 20+
- Backend NestJS DiziPay démarré sur `http://localhost:3000` (`API_PREFIX=api/v1`)

## Installation

```bash
npm install
cp .env.example .env
npm run dev
```

App : [http://localhost:5173](http://localhost:5173)

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Build production (+ service worker PWA) |
| `npm run preview` | Prévisualiser le build |
| `npm run test` | Tests unitaires (Vitest) |
| `npm run lint` | Lint (oxlint) |
| `npm run format` | Prettier |

## Variables d’environnement

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=DiziPay
```

Prod typique : `VITE_API_BASE_URL=https://dizipay-api.onrender.com/api/v1`

Côté backend, définir notamment :

- `PAYMENT_LINK_PUBLIC_BASE_URL=http://localhost:5173` (URLs `/pay/{token}`)
- `CORS_ORIGIN=http://localhost:5173` (ou liste incluant cette origine)

## Architecture (SOLID)

```text
src/
  domain/           # entités & contrats (auth, payment-links, providers, payouts)
  application/      # hooks métier + mappers DTO → ViewModel
  infrastructure/   # HTTP client, repos, sessionStorage JWT
  presentation/     # pages, layouts, routes, providers
  shared/           # design tokens, UI kit, utils
```

- UI = présentation uniquement
- Appels HTTP uniquement dans `infrastructure/`
- JWT marchand en **mémoire + `sessionStorage`** (pas de `localStorage` longue durée)

## Parcours

### Marchand

1. `/login` — `merchant@dizipay.local` / `DizipayDev1!`
2. `/` — résumé ACTIVE / PAID
3. `/links/new` — créer (montant en XOF → centimes API)
4. `/links` — liste, filtres, copier / ouvrir / annuler
5. `/links/:token` — détail + polling statut
6. `/payouts/new` — virement sortant MOBILE_MONEY ou BANK_ACCOUNT (`POST /payouts`)

### Client (public)

- `/pay/:token` — montant, **choix du mode** (PSPI / Wave via `GET /payment-providers`), QR, paiement téléphone avec `paymentProvider`, polling jusqu’à PAID / EXPIRED / CANCELLED
- Wave indisponible → chip désactivée + message `reason` ; HTTP **503** affiché clairement

## Montants

L’API exprime `amount` en **centimes XOF** (`150000` = `1 500 XOF`).  
Les formulaires marchand saisissent des unités XOF ; `xofToCents()` convertit avant l’appel API.

## PWA

- Manifest DiziPay, icônes 192/512, `display: standalone`
- Service worker Workbox : précache shell, **NetworkFirst** pour l’API
- Bannière « Installer l’app » (`beforeinstallprompt`)
- Hors ligne sur `/pay/:token` : bandeau « reconnectez-vous pour le statut »

Build PWA :

```bash
npm run build
npm run preview
```

Puis tester l’installation depuis Chrome (Android / desktop).

## Tester avec le backend local (:3000)

1. Démarrer l’API Nest (`npm run start:dev` dans `Dizipay_back`) sur le port **3000**.
2. Vérifier `CORS_ORIGIN` et `PAYMENT_LINK_PUBLIC_BASE_URL=http://localhost:5173`.
3. Lancer ce front : `npm run dev`.
4. Se connecter avec le compte seed `merchant@dizipay.local` / `DizipayDev1!`.
5. Créer un lien, ouvrir `/pay/{token}` : choisir PSPI, scanner le QR ou payer via téléphone.
6. Tester `/payouts/new` (mobile money avec le compte seed `10188672388920614979`).
