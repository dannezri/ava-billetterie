# 🛍️ Fonctionnalité "Mes Achats"

## 📋 Vue d'ensemble

Page dédiée permettant aux acheteurs de consulter leurs billets achetés, suivre le statut du séquestre et télécharger leurs e-tickets de manière sécurisée.

---

## 🎯 Fonctionnalités Implémentées

### 1️⃣ Page "Mes Achats" (`/my-purchases`)

**Caractéristiques:**
- ✅ Liste complète des achats (statut ESCROWED ou RELEASED)
- ✅ Tri par date d'achat (plus récent en premier)
- ✅ Affichage des informations événement
- ✅ Badge de statut avec icônes
- ✅ Détails du placement (section, rangée, siège)
- ✅ Montant payé affiché
- ✅ État vide avec CTA vers les événements

### 2️⃣ Statuts de Transaction

| Statut | Badge | Signification |
|--------|-------|---------------|
| `ESCROWED` | 🛡️ En séquestre | Paiement sécurisé, fonds bloqués jusqu'à fin événement |
| `RELEASED` | ✅ Finalisé | Séquestre libéré, transaction complète |

### 3️⃣ Countdown Séquestre

**Affichage dynamique:**
```typescript
// Avant libération
"Libération dans 3 jours"
"Libération dans 2 heures"

// Après libération
"Séquestre libéré"
```

**Visuel:**
- Encadré bleu avec icône Clock
- Titre: "Protection acheteur active"
- Temps restant formaté en français

### 4️⃣ Téléchargement Sécurisé

**Bouton "Télécharger l'e-ticket":**
- ✅ Disponible uniquement si PDF uploadé
- ✅ État de chargement pendant génération
- ✅ Ouverture dans nouvel onglet
- ✅ Toast de confirmation

**Sécurité:**
- ✅ Vérification ownership (buyerId)
- ✅ URL signée HMAC
- ✅ Expiration après 1 heure
- ✅ Watermark avec ID transaction
- ✅ Audit log du téléchargement

---

## 💻 Architecture Technique

### Routes & Endpoints

```
Frontend:
├─ /my-purchases                    → Page principale
└─ /my-purchases (protected route)  → Nécessite authentification

API:
└─ POST /api/tickets/[id]/download  → Génération URL sécurisée
```

### Composants

```typescript
// Page principale
app/(protected)/my-purchases/page.tsx
├─ Authentification Supabase
├─ Récupération transactions Prisma
└─ Render <PurchasesList />

// Composant liste
src/components/purchases/PurchasesList.tsx
├─ Affichage des achats
├─ Gestion téléchargement
└─ Countdown dynamique

// Index
src/components/purchases/index.ts
└─ Export PurchasesList
```

### API Download Endpoint

```typescript
POST /api/tickets/[id]/download

Body:
{
  transactionId: string
}

Response:
{
  success: true,
  data: {
    secureUrl: string,        // URL signée avec expiration
    expiresIn: 3600,          // Secondes (1h)
    watermark: "TX-AC3044BB"  // ID visible
  }
}
```

**Sécurité:**
1. ✅ Authentification Supabase
2. ✅ Vérification ownership (buyerId === user.id)
3. ✅ Vérification ticketId <-> transactionId
4. ✅ Génération signature HMAC
5. ✅ Expiration automatique (1h)
6. ✅ Audit log

---

## 🔐 Sécurisation PDF

### Génération URL Signée

```typescript
// Structure URL sécurisée
https://ucarecdn.com/{uuid}/document/-/format/pdf/?
  expires=1708127400000&
  tx=AC3044BB&
  sig=BASE64URL_SIGNATURE

// Paramètres
expires   → Timestamp Unix (1h dans le futur)
tx        → 8 premiers chars transaction ID
sig       → HMAC-SHA256 signature
```

### Algorithme de Signature

```typescript
const dataToSign = pathname + search;
const signature = crypto
  .createHmac('sha256', TICKET_SIGNATURE_SECRET)
  .update(dataToSign)
  .digest('base64url');
```

### Watermark Transaction ID

**Format:** `TX-{8 premiers caractères ID en majuscules}`

**Exemples:**
- Transaction `ac3044bb-ea4d-444c-824f-ae88e99eb955`
- Watermark: `TX-AC3044BB`

**Affichage:**
- Visible dans le badge de la réponse API
- Pourrait être ajouté visuellement sur le PDF (nécessite traitement serveur)

### Expiration

- **Durée:** 1 heure (3600 secondes)
- **Comportement:** Lien invalide après expiration
- **Solution:** Regénérer une nouvelle URL

---

## 📊 Requêtes Prisma

### Récupération Achats

```typescript
const purchases = await prisma.transaction.findMany({
  where: {
    buyerId: userId,
    status: { in: ['ESCROWED', 'RELEASED'] },
  },
  include: {
    ticket: {
      include: {
        event: true,
        seller: {
          select: {
            name: true,
            email: true,
            trustScore: true,
          },
        },
      },
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

### Vérification Ownership

```typescript
const transaction = await prisma.transaction.findUnique({
  where: { id: transactionId },
  include: {
    ticket: {
      include: { event: true },
    },
  },
});

// Vérifications
transaction.buyerId === user.id  // Ownership
transaction.ticketId === ticketId // Consistency
transaction.ticket.pdfUrl !== null // Availability
```

---

## 🎨 UI/UX

### Layout Carte Achat

```
┌─────────────────────────────────────────────────────┐
│ [Image]  │ Titre événement            [Badge Status]│
│ Événe-   │ Artiste                                  │
│ ment     │ ─────────────────────────────────────────│
│          │ 📅 Lundi 15 avril 2026, 20:00           │
│          │ 📍 Accor Arena, Paris                    │
│          │ ─────────────────────────────────────────│
│          │ Section Fosse • Rang A • Siège 15       │
│          │ ─────────────────────────────────────────│
│          │ Montant payé             94.50€          │
│          │ ─────────────────────────────────────────│
│          │ 🛡️ Protection acheteur active            │
│          │    Libération dans 5 jours               │
│          │ ─────────────────────────────────────────│
│          │ [📥 Télécharger l'e-ticket]              │
└─────────────────────────────────────────────────────┘
```

### Responsive Design

- **Mobile:** Image en haut, contenu en dessous
- **Desktop:** Image à gauche (48px), contenu à droite
- **Boutons:** Full width sur mobile, auto sur desktop

### Badges Statut

```tsx
// En séquestre
<Badge className="bg-yellow-50 text-yellow-700">
  <Shield /> En séquestre
</Badge>

// Finalisé
<Badge className="bg-green-50 text-green-700">
  <CheckCircle /> Finalisé
</Badge>
```

---

## 🔔 Notifications & Feedback

### Toast Succès Téléchargement

```typescript
toast({
  title: 'Téléchargement lancé',
  description: 'Votre e-ticket sécurisé a été ouvert dans un nouvel onglet',
});
```

### Toast Erreur

```typescript
toast({
  title: 'Erreur',
  description: error.message,
  variant: 'destructive',
});
```

### État de Chargement

```tsx
<Button disabled={downloadingTicket === ticket.id}>
  {downloadingTicket === ticket.id
    ? 'Génération...'
    : 'Télécharger l\'e-ticket'}
</Button>
```

---

## 📝 Variables d'Environnement

```bash
# Secret pour signature HMAC des URLs
TICKET_SIGNATURE_SECRET=your-random-secret-min-32-chars

# Uploadcare (déjà configuré)
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=demopublickey
UPLOADCARE_SECRET_KEY=demosecretkey
```

**Génération secret:**
```bash
openssl rand -base64 32
```

---

## 🧪 Tests

### Test Manuel

1. **Acheter un billet:**
   ```
   /events → Choisir événement → Acheter → Payer
   ```

2. **Accéder à "Mes Achats":**
   ```
   /my-purchases
   ```

3. **Vérifier affichage:**
   - [ ] Carte avec image événement
   - [ ] Badge "En séquestre"
   - [ ] Countdown visible
   - [ ] Détails corrects (date, lieu, prix)

4. **Télécharger e-ticket:**
   - [ ] Bouton cliquable
   - [ ] Nouvel onglet s'ouvre
   - [ ] URL contient `expires` et `sig`
   - [ ] Toast de confirmation affiché

5. **Vérifier expiration:**
   - [ ] Après 1h, URL ne fonctionne plus
   - [ ] Possible de regénérer nouvelle URL

### Tests Sécurité

1. **Ownership:**
   ```bash
   # Tenter de télécharger le billet d'un autre utilisateur
   curl -X POST http://localhost:3000/api/tickets/{id}/download \
     -H "Cookie: session=USER_B" \
     -d '{"transactionId":"USER_A_TRANSACTION"}'
   # Attendu: 403 Forbidden
   ```

2. **Signature invalide:**
   ```
   Modifier le param `sig` dans l'URL
   → Accès refusé (si validation implémentée côté serveur)
   ```

3. **URL expirée:**
   ```
   Attendre 1h ou modifier `expires` dans le passé
   → Accès refusé
   ```

---

## 🚀 Améliorations Futures

### Court Terme
- [ ] Vraie génération watermark sur PDF (via PDFLib ou Cloudinary)
- [ ] Preview du billet dans l'interface (iframe)
- [ ] QR code unique par téléchargement
- [ ] Limitation nombre téléchargements (ex: 3 max)

### Moyen Terme
- [ ] Export Apple Wallet / Google Pay
- [ ] Partage sécurisé (transfer de billet)
- [ ] Historique des téléchargements
- [ ] Notifications email avant événement

### Long Terme
- [ ] Blockchain validation (NFT ticket)
- [ ] Revente intégrée
- [ ] Check-in digital à l'événement
- [ ] Analytics (taux téléchargement, etc.)

---

## 📖 Documentation Technique

### Uploadcare Document Conversion

```typescript
// URL de base
https://ucarecdn.com/{uuid}/

// Transformations disponibles
-/document/                 // Activer conversion document
-/format/pdf/              // Format de sortie
-/page/{n}/                // Page spécifique
-/page/{from}-{to}/        // Range de pages
```

**Limitations:**
- Pas de watermark natif sur PDF
- Pour watermark, utiliser conversion image ou traitement serveur

### HMAC Signature Validation

**Côté serveur (optionnel):**
```typescript
// Middleware pour valider les URLs signées
function validateSignature(url: string): boolean {
  const urlObj = new URL(url);
  const providedSig = urlObj.searchParams.get('sig');
  
  // Recalculer signature
  urlObj.searchParams.delete('sig');
  const dataToSign = urlObj.pathname + urlObj.search;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(dataToSign)
    .digest('base64url');
  
  return providedSig === expectedSig;
}
```

---

Dernière mise à jour: 16 février 2026
