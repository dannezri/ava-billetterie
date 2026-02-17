# 🚀 Uploadcare - Guide de démarrage rapide

## Configuration en 3 étapes

### 1️⃣ Obtenir les clés API

```bash
# 1. Aller sur https://uploadcare.com/
# 2. Créer un compte gratuit
# 3. Créer un projet
# 4. Copier Public Key et Secret Key depuis Settings > API keys
```

### 2️⃣ Configurer les variables d'environnement

```bash
# Ajouter dans .env.local
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=your_public_key_here
UPLOADCARE_SECRET_KEY=your_secret_key_here
```

### 3️⃣ Vérifier l'installation

```bash
npm run env:validate
```

## ✅ C'est prêt !

L'intégration Uploadcare est maintenant opérationnelle avec :

- ✅ Widget d'upload configuré
- ✅ Validation 5MB max, PDF uniquement
- ✅ Formulaire "Vendre mon billet" intégré
- ✅ Tests de validation
- ✅ API de création de billet
- ✅ Détection de doublons

## 📝 Utilisation

### Dans un composant

```tsx
import { SellTicketForm } from '@/components/tickets';

function Page() {
  return (
    <SellTicketForm
      eventId="uuid-event"
      onSuccess={(ticketId) => console.log('Créé:', ticketId)}
      onError={(error) => console.error('Erreur:', error)}
    />
  );
}
```

## 🧪 Tester

```bash
# Lancer les tests (sans mode watch)
npm test -- uploadcare.test.ts --no-watch

# Résultat attendu: 12/12 tests passent ✅

# Tests manuels
# 1. Upload PDF < 5MB : ✅ Doit réussir
# 2. Upload PDF > 5MB : ❌ Doit rejeter
# 3. Upload JPG/PNG : ❌ Doit rejeter
# 4. Upload même PDF 2x : ❌ Doit détecter doublon
```

## 📚 Documentation complète

Voir `docs/UPLOADCARE_INTEGRATION.md` pour :
- Architecture détaillée
- Workflow complet
- Gestion des erreurs
- Monitoring
- Migration production

## 🆘 Problèmes courants

**Widget ne s'affiche pas ?**
```bash
# Vérifier que la clé publique est bien définie
echo $NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY
```

**Erreur "Missing environment variable" ?**
```bash
# Vérifier le fichier .env.local
cat .env.local | grep UPLOADCARE
```

**Upload échoue ?**
```bash
# Vérifier les logs navigateur (Console)
# Vérifier que le fichier est bien un PDF < 5MB
```

## 🔗 Liens utiles

- Dashboard : https://app.uploadcare.com/
- Documentation : https://uploadcare.com/docs/
- Support : https://uploadcare.com/support/
