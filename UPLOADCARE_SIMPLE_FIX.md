# 🔧 Nouvelle implémentation Uploadcare - Upload Client API

## ❌ Problème avec le widget legacy

Le widget Uploadcare legacy (`uploadcare.full.min.js`) cause des problèmes :
- API instable
- Événements qui ne fonctionnent pas correctement
- Erreurs "Oops! Something went wrong"

## ✅ Solution : Upload Client API

J'ai créé un nouveau composant `SimpleUploadWidget` qui utilise l'**Upload Client API** officielle d'Uploadcare :

### Avantages

1. ✅ **Plus fiable** : API moderne et stable
2. ✅ **Meilleure gestion des erreurs** : Erreurs claires
3. ✅ **Progression native** : Callback `onProgress` intégré
4. ✅ **Type-safe** : TypeScript support complet
5. ✅ **Pas de script externe** : Tout en JavaScript/TypeScript

### Architecture

```typescript
// Utilise @uploadcare/upload-client (déjà installé)
import { uploadFile } from '@uploadcare/upload-client';

// Upload simple et direct
const result = await uploadFile(file, {
  publicKey,
  store: 'auto',
  onProgress: ({ value }) => {
    setUploadProgress(Math.round(value * 100));
  },
});
```

## 📦 Fichiers créés

### Nouveau composant
```
src/components/tickets/SimpleUploadWidget.tsx
```

### Mise à jour
```
src/components/tickets/CreateTicketForm.tsx  → Utilise SimpleUploadWidget
src/components/tickets/index.ts              → Export SimpleUploadWidget
```

## 🔄 Changements

### Avant (widget legacy)
```typescript
import { TicketUploadWidget } from './TicketUploadWidget';
<TicketUploadWidget onUploadComplete={...} />
```

### Après (Upload Client API)
```typescript
import { SimpleUploadWidget } from './SimpleUploadWidget';
<SimpleUploadWidget onUploadComplete={...} />
```

## 🎯 Fonctionnalités

- ✅ **Sélection de fichier** via bouton
- ✅ **Validation** : 5MB max, PDF uniquement
- ✅ **Progression** : Barre 0-100%
- ✅ **Suppression** : Bouton pour réuploader
- ✅ **Gestion d'erreurs** : Messages clairs
- ✅ **Affichage infos** : Nom, taille, type

## 🧪 Test

1. **Redémarrer le serveur** : `npm run dev`
2. **Aller sur** `/tickets/new`
3. **Cliquer** sur "Sélectionner un fichier PDF"
4. **Choisir** un PDF < 5MB
5. **Observer** :
   - Barre de progression
   - Message "Fichier uploadé avec succès"
   - Infos du fichier affichées

## 🔑 Variables requises

```bash
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=3bde0f0118d36994c259
```

La secret key n'est pas nécessaire pour l'upload côté client.

## 📚 Documentation

- **Upload Client** : https://uploadcare.com/docs/api_reference/upload/
- **NPM Package** : @uploadcare/upload-client

## ✅ Avantages de cette approche

1. **Pas de widget externe** : Pas besoin du script `uploadcare.full.min.js`
2. **API moderne** : Utilise les dernières API Uploadcare
3. **Contrôle total** : UI personnalisée avec shadcn/ui
4. **Type-safe** : Full TypeScript
5. **Meilleure UX** : Boutons clairs, progression visible

---

**Cette solution devrait résoudre tous les problèmes d'upload ! 🎉**
