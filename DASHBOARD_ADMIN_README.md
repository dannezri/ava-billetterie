# Dashboard Admin - Validation des Billets

## Vue d'ensemble

Le dashboard admin permet à l'équipe de modération de valider les billets soumis par les vendeurs avant qu'ils ne soient publiés sur la marketplace.

## Accès

### Configuration des admins

Les admins sont définis via la variable d'environnement `ADMIN_EMAILS` :

```bash
# .env.local
ADMIN_EMAILS=admin@ava-tickets.com,moderator@ava-tickets.com
```

**Important** : Seuls les utilisateurs avec ces emails peuvent accéder aux routes `/admin/*`.

### URL d'accès

```
http://localhost:3000/admin/tickets/validation
```

En production :
```
https://your-domain.com/admin/tickets/validation
```

## Fonctionnalités

### 1. Vue d'ensemble (Statistiques)

Le dashboard affiche des statistiques en temps réel :

- **Billets en attente** : Nombre de billets à valider
- **Billets actifs** : Billets approuvés et visibles sur la marketplace
- **Billets rejetés** : Total des billets rejetés
- **Litiges ouverts** : Nombre de litiges en cours
- **Transactions totales** : Nombre total de transactions

### 2. Liste des billets en attente

Chaque carte de billet affiche :

#### Informations sur l'événement
- Titre et artiste
- Date et heure
- Lieu (salle et ville)

#### Informations sur le billet
- Prix de vente
- Prix facial (pour vérification du respect de la limite)
- Placement (section, rangée, siège)
- Code-barres (si extrait)

#### Informations sur le vendeur
- Nom et email
- Statut KYC (Vérifié, En attente, Rejeté)
- Score de confiance (0-100)
- Date de soumission

#### Accès au PDF
- Bouton pour visualiser le PDF du billet dans un nouvel onglet

### 3. Actions de validation

Trois actions sont disponibles pour chaque billet :

#### ✅ Approuver

**Quand approuver ?**
- Le PDF est lisible et complet
- Le code-barres est visible
- Le prix de vente ≤ prix facial
- Aucun signe de manipulation/falsification
- L'événement correspond aux informations

**Processus :**
1. Cliquer sur "Approuver"
2. (Optionnel) Ajouter des notes internes
3. Confirmer

**Résultat :**
- Statut du billet → `ACTIVE`
- Verification status → `APPROVED`
- Billet visible sur la marketplace
- Email envoyé au vendeur
- Log d'audit créé

#### ❌ Rejeter

**Quand rejeter ?**
- PDF illisible ou incomplet
- Code-barres non visible
- Prix supérieur au prix facial
- Signes de falsification
- Informations incohérentes
- Document incorrect (pas un billet)

**Processus :**
1. Cliquer sur "Rejeter"
2. **Obligatoire** : Saisir la raison du rejet (minimum 10 caractères)
3. Confirmer

**Exemples de raisons :**
```
- "Le PDF est illisible, merci de soumettre une version de meilleure qualité"
- "Le prix de vente (85€) dépasse le prix facial indiqué (75€)"
- "Le code-barres n'est pas visible sur le document"
- "Ce document ne semble pas être un billet officiel"
- "L'événement indiqué ne correspond pas au billet soumis"
```

**Résultat :**
- Statut du billet → `CANCELLED`
- Verification status → `REJECTED`
- Raison stockée dans `rejectionReason`
- Email détaillé envoyé au vendeur
- Log d'audit créé

#### ℹ️ Demander des informations

**Quand demander des infos ?**
- Document partiellement lisible
- Besoin de confirmation sur certains détails
- Document borderline qui nécessite des éclaircissements
- Incertitude sur la validité

**Processus :**
1. Cliquer sur "Demander info"
2. Rédiger un message clair (minimum 10 caractères)
3. Envoyer

**Exemples de messages :**
```
- "Pouvez-vous nous fournir un scan plus net du code-barres ?"
- "Confirmez-vous que le prix facial du billet est bien de 120€ ?"
- "Le document semble coupé en bas, avez-vous la version complète ?"
```

**Résultat :**
- Statut du billet reste `PENDING_VALIDATION`
- Email envoyé au vendeur avec le message
- Le vendeur peut répondre par email
- Log d'audit créé

## Architecture technique

### Router tRPC (`src/server/routers/admin.ts`)

```typescript
admin.getPendingTickets()  // Liste des billets en attente
admin.approveTicket()      // Approuver un billet
admin.rejectTicket()       // Rejeter un billet
admin.requestTicketInfo()  // Demander des infos
admin.getStats()           // Statistiques
```

### Composants React

```
src/components/admin/
├── TicketValidationCard.tsx  // Carte d'affichage d'un billet
├── TicketActionModal.tsx     // Modale des actions
└── index.ts                  // Exports
```

### Page principale

```
app/(protected)/admin/tickets/validation/page.tsx
```

### Layout de protection

```
app/(protected)/admin/layout.tsx
```

Vérifie :
1. Utilisateur connecté (Supabase Auth)
2. Email dans la liste `ADMIN_EMAILS`

## Emails envoyés

### Email d'approbation

```
Sujet: ✅ Votre billet pour "[Événement]" est approuvé !

Contenu:
- Message de félicitations
- Lien vers le dashboard vendeur
- Information sur la visibilité du billet
```

### Email de rejet

```
Sujet: ⚠️ Problème avec votre billet pour "[Événement]"

Contenu:
- Explication du problème
- Raison détaillée du rejet
- Instructions pour soumettre un nouveau billet
- Lien vers le formulaire de soumission
```

### Email de demande d'information

```
Sujet: ℹ️ Informations requises pour votre billet "[Événement]"

Contenu:
- Message personnalisé de l'admin
- Invitation à répondre par email
- Lien vers le dashboard vendeur
```

## Logs d'audit

Chaque action admin est enregistrée dans `audit_logs` :

```typescript
{
  userId: "admin-id",
  action: "ADMIN_ACTION",
  metadata: {
    action: "APPROVE_TICKET" | "REJECT_TICKET" | "REQUEST_TICKET_INFO",
    ticketId: "ticket-id",
    reason?: "rejection reason",
    notes?: "admin notes",
    message?: "info request message"
  },
  ipAddress: "x.x.x.x",
  userAgent: "browser info",
  createdAt: "timestamp"
}
```

## Sécurité

### Contrôles d'accès

1. **Authentification** : Vérifiée via Supabase Auth
2. **Autorisation** : Email dans `ADMIN_EMAILS`
3. **Layout protégé** : Redirection automatique si non autorisé
4. **Router tRPC** : Vérification côté serveur avec `assertIsAdmin()`

### Traçabilité

- Toutes les actions sont loguées dans `audit_logs`
- IP et User-Agent capturés
- Métadonnées détaillées (raison, notes, etc.)

## Bonnes pratiques

### Pour les modérateurs

1. **Vérifiez toujours le PDF** avant de valider
2. **Soyez précis** dans les raisons de rejet
3. **Utilisez "Demander info"** en cas de doute
4. **Vérifiez le prix facial** systématiquement
5. **Contrôlez le statut KYC** du vendeur

### Critères de validation

✅ **À approuver :**
- PDF clair et lisible
- Code-barres visible
- Prix ≤ prix facial
- Vendeur KYC vérifié
- Informations cohérentes

❌ **À rejeter :**
- Document illisible
- Prix abusif (> facial)
- Signes de falsification
- Informations incohérentes
- Document non officiel

ℹ️ **Demander des infos :**
- Document partiellement lisible
- Détails manquants
- Besoin de confirmation

## Développement

### Ajouter un admin

1. Ajouter l'email dans `.env.local` :
```bash
ADMIN_EMAILS=admin@example.com,new-admin@example.com
```

2. Redémarrer le serveur de développement

### Tester en local

1. Configurer `ADMIN_EMAILS` avec votre email de test
2. Se connecter avec cet email
3. Accéder à `/admin/tickets/validation`

### Migration future : Champ `isAdmin` dans la DB

Pour une gestion plus robuste, envisagez d'ajouter un champ `isAdmin` dans le modèle `User` :

```prisma
model User {
  // ... autres champs
  isAdmin Boolean @default(false)
}
```

Puis modifier la fonction `assertIsAdmin()` :

```typescript
async function assertIsAdmin(userId: string, ctx: Context) {
  const user = await ctx.prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true }
  });
  
  if (!user?.isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Accès réservé aux administrateurs',
    });
  }
}
```

## Support

Pour toute question ou problème avec le dashboard admin, consultez :

- Documentation technique : `MVP.md`
- Architecture : `ARCHITECTURE.md`
- Configuration Stripe : `STRIPE_CONNECT_START_HERE.md`
- Configuration Uploadcare : `UPLOADCARE_START_HERE.md`

## TODO / Améliorations futures

- [ ] Ajouter pagination infinie (load more)
- [ ] Filtres par date, vendeur, événement
- [ ] Recherche par code-barres
- [ ] Historique des validations par admin
- [ ] Statistiques avancées (temps moyen de validation, etc.)
- [ ] Notifications en temps réel (WebSocket)
- [ ] Système de commentaires internes entre admins
- [ ] Preview PDF intégré (sans ouvrir nouvel onglet)
- [ ] Validation en masse (bulk actions)
- [ ] Assignation de billets à des modérateurs spécifiques
