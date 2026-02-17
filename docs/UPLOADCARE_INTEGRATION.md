# Intégration Uploadcare - Documentation Complète

## 📋 Vue d'ensemble

Uploadcare est intégré dans la plateforme Ava pour gérer l'upload sécurisé des billets PDF. Cette intégration respecte les contraintes de sécurité définies dans le MVP :

- **Taille maximale** : 5 MB
- **Format accepté** : PDF uniquement
- **Sécurité** : Scan antivirus automatique, validation côté client et serveur
- **Détection de doublons** : Via hash SHA-256 du fichier

## 🚀 Configuration initiale

### 1. Créer un compte Uploadcare

1. Aller sur [https://uploadcare.com/](https://uploadcare.com/)
2. Créer un compte gratuit (3000 fichiers/mois inclus)
3. Créer un nouveau projet pour l'environnement (dev/staging/prod)

### 2. Obtenir les clés API

1. Dans le dashboard Uploadcare : [https://app.uploadcare.com/](https://app.uploadcare.com/)
2. Aller dans **Settings** > **API keys**
3. Copier :
   - **Public Key** (commence par `demopublickey` en test)
   - **Secret Key** (commence par `demoprivatekey` en test)

### 3. Configurer les variables d'environnement

Ajouter dans `.env.local` :

```bash
# Uploadcare - Upload de billets PDF
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=your_public_key_here
UPLOADCARE_SECRET_KEY=your_secret_key_here
```

### 4. Vérifier la configuration

```bash
npm run env:validate
```

## 🏗️ Architecture

### Fichiers créés

```
src/
├── config/
│   └── uploadcare.ts              # Configuration centralisée
├── components/
│   └── tickets/
│       ├── TicketUploadWidget.tsx # Widget d'upload
│       ├── SellTicketForm.tsx     # Formulaire complet
│       └── index.ts               # Exports
└── app/
    └── api/
        └── tickets/
            └── create/
                └── route.ts       # API de création de billet

__tests__/
└── uploadcare.test.ts             # Tests de validation
```

## 🔧 Utilisation

### Composant TicketUploadWidget

Widget autonome pour l'upload de PDF :

```tsx
import { TicketUploadWidget } from '@/components/tickets';

function MyComponent() {
  const handleUploadComplete = (fileInfo) => {
    console.log('Fichier uploadé:', fileInfo);
    // fileInfo contient: uuid, name, size, mimeType, cdnUrl, originalUrl
  };

  const handleUploadError = (error) => {
    console.error('Erreur upload:', error);
  };

  return (
    <TicketUploadWidget
      onUploadComplete={handleUploadComplete}
      onUploadError={handleUploadError}
      disabled={false}
    />
  );
}
```

### Formulaire complet SellTicketForm

Formulaire intégré avec upload et validation :

```tsx
import { SellTicketForm } from '@/components/tickets';

function SellTicketPage() {
  const eventId = 'uuid-de-l-evenement';

  const handleSuccess = (ticketId) => {
    console.log('Billet créé:', ticketId);
    router.push(`/seller/tickets/${ticketId}`);
  };

  const handleError = (error) => {
    console.error('Erreur:', error);
  };

  return (
    <SellTicketForm
      eventId={eventId}
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
```

## 🔒 Sécurité

### Validation côté client

Le fichier est validé **avant** l'upload :

```typescript
import { validateFile } from '@/config/uploadcare';

const file = document.querySelector('input[type="file"]').files[0];
const validation = validateFile(file);

if (!validation.valid) {
  console.error(validation.error);
  // Afficher l'erreur à l'utilisateur
}
```

### Contraintes appliquées

1. **Taille** : Maximum 5 MB (5 242 880 bytes)
2. **Type MIME** : `application/pdf` uniquement
3. **Extension** : `.pdf` uniquement (case-insensitive)
4. **Scan antivirus** : Automatique via Uploadcare

### Validation côté serveur

L'API `/api/tickets/create` vérifie :

1. **Authentification** : Utilisateur connecté
2. **KYC** : Statut vérifié (`VERIFIED`)
3. **Doublons** :
   - Code-barres existant
   - Hash PDF existant
4. **Prix** : Prix de vente ≤ Prix facial
5. **Événement** : Existe dans la DB

## 📊 Workflow complet

```
┌─────────────────────────────────────────────────────────────┐
│ 1. UTILISATEUR SÉLECTIONNE UN PDF                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. VALIDATION CLIENT (validateFile)                         │
│    ✓ Taille ≤ 5 MB                                          │
│    ✓ Type = application/pdf                                 │
│    ✓ Extension = .pdf                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. UPLOAD VERS UPLOADCARE                                   │
│    - Upload direct (pas de transit serveur)                 │
│    - Scan antivirus automatique                             │
│    - Génération UUID unique                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. CALLBACK onUploadComplete                                │
│    - Récupération fileInfo (uuid, cdnUrl, etc.)             │
│    - Mise à jour formulaire                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. SOUMISSION FORMULAIRE                                    │
│    POST /api/tickets/create                                 │
│    {                                                         │
│      eventId, prices, section, pdfUrl, pdfHash              │
│    }                                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. VALIDATION SERVEUR                                       │
│    ✓ Auth + KYC                                             │
│    ✓ Pas de doublon (barcode, hash)                         │
│    ✓ Prix valide                                            │
│    ✓ Événement existe                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. CRÉATION BILLET                                          │
│    - Status: PENDING_VALIDATION                             │
│    - VerificationStatus: PENDING                            │
│    - Audit log créé                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. NOTIFICATION ÉQUIPE VALIDATION                           │
│    (À implémenter)                                          │
└─────────────────────────────────────────────────────────────┘
```

## 🧪 Tests

### Lancer les tests

```bash
npm test uploadcare.test.ts
```

### Cas de test couverts

✅ Accepter PDF valide < 5MB  
✅ Rejeter fichier > 5MB  
✅ Rejeter fichier non-PDF (image, doc)  
✅ Rejeter PDF avec mauvaise extension  
✅ Accepter PDF avec extension majuscule  
✅ Valider taille limite exacte (5MB)  
✅ Rejeter 5MB + 1 byte  
✅ Extraire correctement les infos fichier  

### Tests manuels

1. **Upload PDF valide** :
   - Fichier : `billet-test.pdf` (< 5MB)
   - Résultat attendu : ✅ Upload réussi

2. **Upload fichier trop gros** :
   - Fichier : `gros-fichier.pdf` (> 5MB)
   - Résultat attendu : ❌ "Le fichier ne doit pas dépasser 5 MB"

3. **Upload mauvais format** :
   - Fichier : `image.jpg`
   - Résultat attendu : ❌ "Seuls les fichiers PDF sont acceptés"

4. **Upload doublon** :
   - Uploader le même PDF deux fois
   - Résultat attendu : ❌ "Ce fichier PDF a déjà été uploadé"

## 🔍 Détection de doublons

### Hash PDF

Le hash PDF est calculé côté Uploadcare (UUID unique) et stocké dans `tickets.pdfHash`.

```typescript
// Vérification doublon dans l'API
const existingHash = await prisma.ticket.findFirst({
  where: {
    pdfHash: validatedData.pdfHash,
    status: { notIn: ['CANCELLED'] },
  },
});

if (existingHash) {
  return NextResponse.json(
    { 
      error: 'Billet en doublon',
      message: 'Ce fichier PDF a déjà été uploadé',
      code: 'DUPLICATE_PDF_HASH'
    },
    { status: 409 }
  );
}
```

### Code-barres

Si fourni, le code-barres est également vérifié :

```typescript
if (validatedData.barcodeNumber) {
  const existingBarcode = await prisma.ticket.findFirst({
    where: {
      barcodeNumber: validatedData.barcodeNumber,
      status: { notIn: ['CANCELLED'] },
    },
  });

  if (existingBarcode) {
    // Rejet avec code DUPLICATE_BARCODE
  }
}
```

## 📈 Monitoring

### Dashboard Uploadcare

Accéder aux statistiques :
- [https://app.uploadcare.com/](https://app.uploadcare.com/)
- **Dashboard** > **Analytics**

Métriques disponibles :
- Nombre d'uploads
- Bande passante utilisée
- Fichiers stockés
- Erreurs d'upload

### Logs d'audit

Chaque upload de billet crée un audit log :

```typescript
await prisma.auditLog.create({
  data: {
    userId: dbUser.id,
    action: 'TICKET_UPLOAD',
    metadata: {
      ticketId: ticket.id,
      eventId: validatedData.eventId,
      price: validatedData.sellingPrice,
    },
    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  },
});
```

## 🚨 Gestion des erreurs

### Erreurs côté client

```typescript
const errors = {
  fileSizeExceeded: 'Le fichier ne doit pas dépasser 5 MB',
  invalidFileType: 'Seuls les fichiers PDF sont acceptés',
  uploadFailed: 'Erreur lors de l\'upload. Veuillez réessayer.',
  virusScanFailed: 'Le fichier n\'a pas passé la vérification de sécurité',
};
```

### Erreurs côté serveur

```typescript
// 401 - Non authentifié
{ error: 'Non authentifié' }

// 403 - KYC non vérifié
{ 
  error: 'KYC non vérifié',
  message: 'Vous devez vérifier votre identité avant de vendre des billets',
  code: 'KYC_NOT_VERIFIED'
}

// 404 - Événement non trouvé
{ error: 'Événement non trouvé' }

// 409 - Doublon
{ 
  error: 'Billet en doublon',
  message: 'Un billet avec ce code-barres existe déjà',
  code: 'DUPLICATE_BARCODE'
}

// 500 - Erreur serveur
{ error: 'Erreur lors de la création du billet' }
```

## 🔄 Migration vers production

### Checklist

- [ ] Créer compte Uploadcare production
- [ ] Configurer les variables d'environnement production
- [ ] Activer le scan antivirus (inclus dans plan payant)
- [ ] Configurer les webhooks Uploadcare (optionnel)
- [ ] Tester l'upload en production
- [ ] Vérifier les logs d'audit
- [ ] Monitorer les métriques Uploadcare

### Configuration recommandée (Production)

```bash
# .env.production
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=prod_public_key
UPLOADCARE_SECRET_KEY=prod_secret_key
```

### Limites du plan gratuit

- **3000 fichiers/mois**
- **3 GB stockage**
- **10 GB bande passante**

Pour le MVP (50 billets), le plan gratuit est largement suffisant.

## 📚 Ressources

- [Documentation Uploadcare](https://uploadcare.com/docs/)
- [Widget React](https://uploadcare.com/docs/integrations/react/)
- [API Reference](https://uploadcare.com/docs/api_reference/)
- [Security Best Practices](https://uploadcare.com/docs/security/)

## 🆘 Support

En cas de problème :

1. Vérifier les variables d'environnement
2. Consulter les logs du navigateur (Console)
3. Vérifier les logs serveur (API)
4. Consulter le dashboard Uploadcare
5. Contacter le support Uploadcare : [https://uploadcare.com/support/](https://uploadcare.com/support/)
