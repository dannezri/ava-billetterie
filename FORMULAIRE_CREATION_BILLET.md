# 📝 Formulaire Création Billet - Documentation

## ✅ Fonctionnalités implémentées

### Formulaire en 2 étapes

#### **Étape 1 : Informations du billet**
- ✅ **Événement** : Select avec recherche
- ✅ **Prix facial** : Input numérique
- ✅ **Prix de vente** : Input numérique
- ✅ **Catégorie/Section** : Input texte (ex: "Carré Or", "Fosse")
- ✅ **Rangée** : Input optionnel
- ✅ **Numéro de siège** : Input optionnel
- ✅ **Code-barres** : Input optionnel

#### **Étape 2 : Upload PDF**
- ✅ Widget Uploadcare (5MB max, PDF uniquement)
- ✅ Upload en dernière étape (après validation infos)

### Validation Zod

```typescript
// Validation stricte
sellingPrice <= originalPrice
```

**Affichage en temps réel :**
- ✅ Message d'erreur si `sellingPrice > originalPrice`
- ✅ Message de confirmation avec économie calculée si valide

## 📁 Fichiers créés

### Composant principal
```
src/components/tickets/CreateTicketForm.tsx
```
Formulaire en 2 étapes avec validation Zod complète

### Page d'utilisation
```
app/(protected)/tickets/new/page.tsx
```
Page avec :
- Protection auth + KYC
- Récupération événements futurs depuis DB
- Affichage infos contextuelles

### Export
```
src/components/tickets/index.ts
```
Export `CreateTicketForm` ajouté

## 🎨 Interface utilisateur

### Indicateur d'étapes
```
[1 Informations] ─── [2 Upload PDF]
```
- Étape active : Bleu (primary)
- Étape complétée : Vert avec checkmark
- Étape future : Gris

### Étape 1 : Sélection et informations

```
┌────────────────────────────────────────┐
│ Événement *                            │
│ ┌────────────────────────────────────┐ │
│ │ Sélectionnez un événement       ▼  │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Prix facial *        Prix de vente *   │
│ [150.00 €]          [120.00 €]         │
│ ✓ Prix conforme (économie de 30.00€)  │
│                                        │
│ Catégorie / Section *                  │
│ [Carré Or]                             │
│                                        │
│ Rangée              Numéro de siège    │
│ [15]                [42]               │
│                                        │
│ Code-barres (optionnel)                │
│ [123456789]                            │
│                                        │
│                   [Suivant : Upload PDF →]
└────────────────────────────────────────┘
```

### Étape 2 : Upload PDF

```
┌────────────────────────────────────────┐
│ Billet PDF *                           │
│ Uploadez votre billet au format PDF   │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │   📄 Upload PDF                    │ │
│ │   Glissez-déposez ou cliquez       │ │
│ │   Maximum 5 MB                     │ │
│ └────────────────────────────────────┘ │
│                                        │
│ [← Retour]          [Mettre en vente]  │
└────────────────────────────────────────┘
```

## 🔒 Validation

### Validation Zod (schéma)

```typescript
const createTicketSchema = z.object({
  eventId: z.string().uuid('Veuillez sélectionner un événement'),
  originalPrice: z.number().min(1).max(5000),
  sellingPrice: z.number().min(1).max(5000),
  section: z.string().min(1).max(100),
  row: z.string().max(50).optional(),
  seatNumber: z.string().max(50).optional(),
  pdfUrl: z.string().url('PDF requis'),
  barcodeNumber: z.string().min(5).max(50).optional(),
}).refine(
  (data) => data.sellingPrice <= data.originalPrice,
  {
    message: 'Le prix de vente ne peut pas dépasser le prix facial',
    path: ['sellingPrice'],
  }
);
```

### Règles de validation

| Champ | Règles |
|-------|--------|
| **Événement** | UUID valide, requis |
| **Prix facial** | 1€ - 5000€, requis |
| **Prix de vente** | 1€ - 5000€, ≤ prix facial, requis |
| **Catégorie** | 1-100 caractères, requis |
| **Rangée** | 0-50 caractères, optionnel |
| **Siège** | 0-50 caractères, optionnel |
| **PDF** | URL valide, 5MB max, PDF uniquement, requis |
| **Code-barres** | 5-50 caractères, optionnel |

### Validation en temps réel

- ✅ Validation à la saisie (`mode: 'onChange'`)
- ✅ Messages d'erreur contextuels
- ✅ Désactivation bouton "Suivant" si erreurs
- ✅ Feedback visuel (vert si conforme)

## 🚀 Utilisation

### Page dédiée

Accéder à : **`/tickets/new`**

### Prérequis

1. **Authentifié** : Utilisateur connecté
2. **KYC vérifié** : `kycStatus === 'VERIFIED'`
3. **Événements disponibles** : Au moins 1 événement futur en DB

### Flux complet

```
┌──────────────────────────────────────────────────────────┐
│ 1. Utilisateur accède à /tickets/new                     │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 2. Vérification auth + KYC                               │
│    - Si non auth → redirect /login                       │
│    - Si KYC non vérifié → alerte + lien /account/kyc    │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 3. Récupération événements futurs depuis DB             │
│    - WHERE eventDate >= NOW()                            │
│    - ORDER BY eventDate ASC                              │
│    - LIMIT 50                                            │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 4. ÉTAPE 1 : Remplir informations                       │
│    - Sélectionner événement                              │
│    - Saisir prix (facial + vente)                        │
│    - Saisir catégorie                                    │
│    - Validation selling_price <= original_price          │
│    - Clic "Suivant"                                      │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 5. ÉTAPE 2 : Upload PDF                                 │
│    - Glisser-déposer ou sélectionner PDF                │
│    - Validation 5MB max, PDF uniquement                 │
│    - Upload vers Uploadcare                             │
│    - Clic "Mettre en vente"                             │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 6. Soumission API POST /api/tickets/create              │
│    - Validation serveur complète                         │
│    - Détection doublons                                  │
│    - Création billet (status: PENDING_VALIDATION)        │
│    - Audit log                                           │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│ 7. Redirection vers /tickets/{ticketId}                 │
│    Message : "Billet créé, en attente de validation"     │
└──────────────────────────────────────────────────────────┘
```

## 💻 Code d'intégration

### Dans une page Next.js

```tsx
import { CreateTicketForm } from '@/components/tickets';
import { prisma } from '@/lib/db/prisma';

export default async function Page() {
  // Récupérer les événements
  const events = await prisma.event.findMany({
    where: { eventDate: { gte: new Date() } },
    orderBy: { eventDate: 'asc' },
  });

  // Formater pour le composant
  const eventOptions = events.map((e) => ({
    id: e.id,
    title: e.title,
    eventDate: e.eventDate.toISOString(),
    venue: e.venue,
    city: e.city,
  }));

  return (
    <CreateTicketForm
      events={eventOptions}
      onSuccess={(ticketId) => {
        // Redirection ou notification
        window.location.href = `/tickets/${ticketId}`;
      }}
      onError={(error) => {
        console.error(error);
      }}
    />
  );
}
```

### Composant autonome

```tsx
import { CreateTicketForm } from '@/components/tickets';

const events = [
  {
    id: '123-uuid',
    title: 'Concert Example',
    eventDate: '2026-06-15T20:00:00Z',
    venue: 'Salle Pleyel',
    city: 'Paris',
  },
];

<CreateTicketForm
  events={events}
  onSuccess={(id) => console.log('Créé:', id)}
  onError={(err) => console.error(err)}
/>
```

## 🧪 Tests

### Tests manuels

1. **Validation prix**
   - Saisir prix facial : 100€
   - Saisir prix vente : 120€
   - Résultat : ❌ Erreur "Le prix de vente ne peut pas dépasser le prix facial"

2. **Validation conformé**
   - Saisir prix facial : 100€
   - Saisir prix vente : 80€
   - Résultat : ✅ "Prix conforme (économie de 20.00€)"

3. **Navigation entre étapes**
   - Remplir étape 1 → Clic "Suivant"
   - Étape 2 affichée, étape 1 marquée verte avec ✓
   - Clic "Retour" → Retour étape 1 (données conservées)

4. **Upload PDF**
   - Étape 2 → Upload PDF valide
   - Résultat : ✅ Fichier affiché avec infos
   - Bouton "Mettre en vente" activé

### Tests automatisés

Voir `__tests__/uploadcare.test.ts` pour les tests de validation

## 📊 Avantages UX

### Formulaire en étapes
- ✅ Moins intimidant (1 tâche à la fois)
- ✅ Upload PDF en dernier (après validation infos)
- ✅ Possibilité de revenir en arrière
- ✅ Données conservées entre étapes

### Select événements
- ✅ Recherche intégrée
- ✅ Affichage date + lieu
- ✅ Uniquement événements futurs
- ✅ Limitée à 50 pour performances

### Feedback immédiat
- ✅ Validation en temps réel
- ✅ Messages d'erreur contextuels
- ✅ Indicateur économie si prix conforme
- ✅ Progression visuelle

## 🔐 Sécurité

### Protection côté serveur
- ✅ Authentification requise
- ✅ KYC vérifié requis
- ✅ Validation Zod côté serveur
- ✅ Détection doublons (hash + barcode)
- ✅ Audit logs

### Protection côté client
- ✅ Validation Zod avant soumission
- ✅ Désactivation boutons si erreurs
- ✅ Upload sécurisé via Uploadcare
- ✅ Scan antivirus automatique

## 🎯 Conformité MVP

- ✅ Champs requis : Événement, Prix facial, Prix de vente, Catégorie
- ✅ Validation Zod : `selling_price <= original_price`
- ✅ Upload PDF en dernière étape
- ✅ Interface intuitive
- ✅ Protection KYC
- ✅ Détection doublons

---

**Créé le :** 2026-02-16  
**Statut :** ✅ Complet et testé  
**Route :** `/tickets/new`
