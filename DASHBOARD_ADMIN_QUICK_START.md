# Quick Start - Dashboard Admin de Validation

## Configuration en 2 minutes

### 1. Ajouter votre email admin

Modifiez `.env.local` :

```bash
ADMIN_EMAILS=votre-email@example.com
```

### 2. Redémarrer le serveur

```bash
npm run dev
```

### 3. Accéder au dashboard

```
http://localhost:3000/admin/tickets/validation
```

## Validation rapide d'un billet

### Checklist de validation (30 secondes)

1. ✅ **Ouvrir le PDF** → Bouton "Voir le PDF du billet"
2. ✅ **Vérifier la lisibilité** → Document clair et complet ?
3. ✅ **Vérifier le code-barres** → Visible et non flou ?
4. ✅ **Comparer les prix** → Prix de vente ≤ Prix facial ?
5. ✅ **Vérifier le vendeur** → KYC vérifié ? Score > 50 ?

### Actions

#### ✅ Tout est OK ?
→ Cliquer **"Approuver"** → Confirmer

#### ❌ Problème détecté ?
→ Cliquer **"Rejeter"** → Expliquer pourquoi → Confirmer

#### ℹ️ Besoin de précisions ?
→ Cliquer **"Demander info"** → Poser votre question → Envoyer

## Exemples de raisons de rejet

### PDF illisible
```
Le PDF est de mauvaise qualité et illisible. 
Merci de soumettre un scan ou une photo plus nette.
```

### Prix supérieur
```
Le prix de vente (85€) dépasse le prix facial (75€).
Notre plateforme n'autorise pas la revente au-dessus du prix facial.
```

### Code-barres invisible
```
Le code-barres n'est pas visible sur le document.
Merci de fournir un document complet avec le code-barres lisible.
```

### Document incomplet
```
Le document semble coupé ou incomplet. 
Merci de soumettre l'intégralité du billet.
```

## Commandes utiles

### Voir les logs d'audit
```sql
SELECT * FROM audit_logs 
WHERE action = 'ADMIN_ACTION' 
ORDER BY created_at DESC 
LIMIT 20;
```

### Voir tous les billets en attente
```sql
SELECT t.*, e.title, u.email 
FROM tickets t
JOIN events e ON t.event_id = e.id
JOIN users u ON t.seller_id = u.id
WHERE t.status = 'PENDING_VALIDATION'
ORDER BY t.created_at ASC;
```

### Statistiques de validation
```sql
SELECT 
  COUNT(CASE WHEN verification_status = 'APPROVED' THEN 1 END) as approved,
  COUNT(CASE WHEN verification_status = 'REJECTED' THEN 1 END) as rejected,
  COUNT(CASE WHEN verification_status = 'PENDING' THEN 1 END) as pending
FROM tickets;
```

## Problèmes courants

### "Accès réservé aux administrateurs"

**Solution :**
1. Vérifier que votre email est dans `ADMIN_EMAILS`
2. Redémarrer le serveur : `npm run dev`
3. Se reconnecter à l'application

### Le PDF ne s'ouvre pas

**Solution :**
1. Vérifier que `pdfUrl` existe dans la DB
2. Vérifier la configuration Uploadcare
3. Vérifier les permissions CORS

### Email non envoyé au vendeur

**Solution :**
1. Vérifier `RESEND_API_KEY` dans `.env.local`
2. Consulter les logs : `npm run dev` (console)
3. Vérifier le service email dans `src/services/email/index.ts`

## Documentation complète

Pour plus de détails, consultez :
- `DASHBOARD_ADMIN_README.md` - Documentation complète
- `MVP.md` - Spécifications du projet
- `STRIPE_CONNECT_START_HERE.md` - Configuration paiements

## Support technique

En cas de problème :
1. Consulter les logs dans la console du terminal
2. Vérifier les variables d'environnement
3. Consulter `TROUBLESHOOTING.md`
