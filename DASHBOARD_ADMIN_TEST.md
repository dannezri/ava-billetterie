# Test du Dashboard Admin - Guide Pratique

## Configuration rapide (1 minute)

### 1. Ajouter votre email comme admin

```bash
# Éditer .env.local
ADMIN_EMAILS=votre-email@example.com
```

### 2. Redémarrer le serveur

```bash
npm run dev
```

## Scénario de test complet (5 minutes)

### Étape 1 : Créer un billet de test

1. Ouvrir http://localhost:3000
2. Se connecter avec un compte vendeur (pas l'admin)
3. Aller sur `/sell-ticket` ou `/tickets/new`
4. Soumettre un billet avec :
   - Un événement existant
   - Un PDF (ou URL Uploadcare)
   - Un prix ≤ prix facial

**Résultat attendu :**
- Billet créé avec `status: PENDING_VALIDATION`
- Visible dans la DB :
  ```sql
  SELECT * FROM tickets WHERE status = 'PENDING_VALIDATION';
  ```

### Étape 2 : Accéder au dashboard admin

1. Se déconnecter du compte vendeur
2. Se connecter avec l'email admin configuré
3. Aller sur http://localhost:3000/admin/tickets/validation

**Résultat attendu :**
- Page affichée sans erreur
- Statistiques en haut (cartes colorées)
- Le billet test visible dans la liste
- 3 boutons d'action affichés

### Étape 3 : Tester l'approbation

1. Cliquer sur **"Approuver"** sur le billet test
2. (Optionnel) Ajouter une note interne
3. Cliquer sur **"Confirmer l'approbation"**

**Résultats attendus :**

✅ **Dans la DB :**
```sql
SELECT status, verification_status 
FROM tickets 
WHERE id = 'votre-ticket-id';

-- status: ACTIVE
-- verification_status: APPROVED
```

✅ **Dans les logs d'audit :**
```sql
SELECT * FROM audit_logs 
WHERE action = 'ADMIN_ACTION' 
ORDER BY created_at DESC 
LIMIT 1;

-- metadata devrait contenir: { "action": "APPROVE_TICKET", "ticketId": "..." }
```

✅ **Email envoyé :**
```
Vérifier la console du terminal :
📧 [MOCK RESEND] Email envoyé à vendeur@example.com : ✅ Votre billet...
```

✅ **UI :**
- Toast de confirmation affiché
- Billet disparu de la liste
- Statistiques mises à jour

### Étape 4 : Tester le rejet

1. Créer un nouveau billet de test (comme Étape 1)
2. Revenir au dashboard admin
3. Cliquer sur **"Rejeter"** sur ce billet
4. Saisir une raison : "PDF illisible, merci de soumettre une meilleure version"
5. Cliquer sur **"Confirmer le rejet"**

**Résultats attendus :**

✅ **Dans la DB :**
```sql
SELECT status, verification_status, rejection_reason 
FROM tickets 
WHERE id = 'votre-ticket-id';

-- status: CANCELLED
-- verification_status: REJECTED
-- rejection_reason: "PDF illisible, merci de..."
```

✅ **Email envoyé :**
```
📧 Email envoyé : ⚠️ Problème avec votre billet...
(contenant la raison du rejet)
```

### Étape 5 : Tester la demande d'info

1. Créer un troisième billet de test
2. Cliquer sur **"Demander info"**
3. Saisir un message : "Pouvez-vous confirmer que le prix facial est bien de 75€ ?"
4. Cliquer sur **"Envoyer la demande"**

**Résultats attendus :**

✅ **Dans la DB :**
```sql
SELECT status FROM tickets WHERE id = 'votre-ticket-id';
-- status: PENDING_VALIDATION (reste inchangé)
```

✅ **Email envoyé :**
```
📧 Email envoyé : ℹ️ Informations requises...
(contenant le message de l'admin)
```

### Étape 6 : Tester la sécurité

1. Se déconnecter du compte admin
2. Se connecter avec un email NON dans `ADMIN_EMAILS`
3. Tenter d'accéder à `/admin/tickets/validation`

**Résultat attendu :**
- ❌ Redirection automatique vers `/dashboard`
- Message d'erreur ou accès refusé

4. Tester aussi via tRPC directement (DevTools) :
   ```javascript
   // Dans la console du navigateur
   trpc.admin.getPendingTickets.query({ limit: 10 })
   ```

**Résultat attendu :**
- Erreur : "Accès réservé aux administrateurs"
- Code HTTP 403 FORBIDDEN

## Checklist de validation ✅

### Fonctionnalités
- [ ] Page admin accessible avec email admin
- [ ] Liste des billets pending affichée
- [ ] Statistiques affichées correctement
- [ ] Bouton "Voir le PDF" ouvre le PDF
- [ ] Modale d'approbation fonctionne
- [ ] Modale de rejet fonctionne
- [ ] Modale de demande d'info fonctionne
- [ ] Rafraîchissement après action
- [ ] Messages toast affichés

### Base de données
- [ ] Status mis à jour (ACTIVE/CANCELLED)
- [ ] Verification status mis à jour (APPROVED/REJECTED)
- [ ] Rejection reason stockée
- [ ] Audit logs créés

### Emails
- [ ] Email d'approbation envoyé
- [ ] Email de rejet envoyé (avec raison)
- [ ] Email de demande d'info envoyé
- [ ] Contenu des emails correct

### Sécurité
- [ ] Non-admin redirigé
- [ ] Erreur tRPC si non-admin
- [ ] Logs d'audit créés
- [ ] IP et User-Agent capturés

### UI/UX
- [ ] Design responsive
- [ ] Statistiques à jour
- [ ] États de chargement affichés
- [ ] Messages d'erreur clairs
- [ ] Navigation fluide

## Queries SQL utiles pour les tests

### Voir tous les billets en attente
```sql
SELECT 
  t.id,
  t.status,
  t.verification_status,
  e.title as event_title,
  u.email as seller_email,
  t.created_at
FROM tickets t
JOIN events e ON t.event_id = e.id
JOIN users u ON t.seller_id = u.id
WHERE t.status = 'PENDING_VALIDATION'
ORDER BY t.created_at ASC;
```

### Voir l'historique des validations
```sql
SELECT 
  al.created_at,
  u.email as admin_email,
  al.metadata->>'action' as action,
  al.metadata->>'ticketId' as ticket_id,
  al.metadata->>'reason' as reason
FROM audit_logs al
JOIN users u ON al.user_id = u.id
WHERE al.action = 'ADMIN_ACTION'
ORDER BY al.created_at DESC
LIMIT 20;
```

### Statistiques générales
```sql
SELECT 
  COUNT(*) FILTER (WHERE status = 'PENDING_VALIDATION') as pending,
  COUNT(*) FILTER (WHERE status = 'ACTIVE') as active,
  COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled,
  COUNT(*) FILTER (WHERE verification_status = 'APPROVED') as approved,
  COUNT(*) FILTER (WHERE verification_status = 'REJECTED') as rejected
FROM tickets;
```

### Nettoyer les données de test
```sql
-- Attention : Supprimer uniquement en DEV !
DELETE FROM audit_logs WHERE action = 'ADMIN_ACTION';
DELETE FROM tickets WHERE status IN ('PENDING_VALIDATION', 'CANCELLED');
```

## Dépannage

### Problème : "Accès réservé aux administrateurs"

**Causes possibles :**
1. Email pas dans `ADMIN_EMAILS`
2. Serveur pas redémarré après modif `.env.local`
3. Session pas rafraîchie

**Solution :**
```bash
# 1. Vérifier .env.local
cat .env.local | grep ADMIN_EMAILS

# 2. Redémarrer le serveur
npm run dev

# 3. Se déconnecter et reconnecter
```

### Problème : Billet pas visible dans la liste

**Causes possibles :**
1. Status du billet pas `PENDING_VALIDATION`
2. Erreur de requête tRPC
3. Problème de pagination

**Solution :**
```sql
-- Vérifier le status
SELECT id, status, verification_status FROM tickets;

-- Forcer le status
UPDATE tickets SET status = 'PENDING_VALIDATION' WHERE id = 'xxx';
```

### Problème : PDF ne s'ouvre pas

**Causes possibles :**
1. `pdfUrl` NULL dans la DB
2. URL Uploadcare expirée
3. Problème CORS

**Solution :**
```sql
-- Vérifier pdfUrl
SELECT id, pdf_url FROM tickets WHERE id = 'xxx';

-- Tester l'URL manuellement dans un navigateur
```

### Problème : Email pas reçu

**Causes possibles :**
1. `RESEND_API_KEY` pas configurée
2. Service email en mode mock
3. Email du vendeur incorrect

**Solution :**
```bash
# Vérifier la configuration
cat .env.local | grep RESEND_API_KEY

# Consulter les logs de la console
# L'email devrait être loggé même en mode mock
```

## Performance

### Temps de chargement attendus

- **Page initiale** : < 1s
- **Approbation d'un billet** : < 2s
- **Rejet d'un billet** : < 2s
- **Demande d'info** : < 2s
- **Rafraîchissement** : < 1s

Si plus lent, vérifier :
- Connexion DB
- Performance Prisma
- Taille des données

## Prêt pour la production ?

Avant de déployer en production :

- [ ] Tests fonctionnels tous passés
- [ ] Configuration Resend (emails réels)
- [ ] ADMIN_EMAILS configuré en production
- [ ] Tests de sécurité validés
- [ ] Logs d'audit vérifiés
- [ ] Documentation lue par l'équipe
- [ ] Formation des modérateurs effectuée

## Besoin d'aide ?

- **Documentation complète** : `DASHBOARD_ADMIN_README.md`
- **Quick Start** : `DASHBOARD_ADMIN_QUICK_START.md`
- **Implémentation** : `DASHBOARD_ADMIN_IMPLEMENTATION.md`
- **MVP** : `MVP.md`

---

**Bon test ! 🚀**
