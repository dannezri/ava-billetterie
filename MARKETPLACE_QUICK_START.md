# 🚀 Démarrage Rapide - Marketplace

Guide rapide pour tester les nouvelles fonctionnalités de la marketplace.

---

## 🎯 Fonctionnalités à Tester

1. **Recherche d'événements** avec autocomplete
2. **Page détail événement** avec liste de billets
3. **Filtres de billets** (prix, catégorie, tri)
4. **Cartes billets** avec trust score et badges

---

## 🏃 Démarrage

### 1. Lancer le Serveur de Développement

```bash
cd /Users/dannezri/Desktop/ava
npm run dev
```

Le site sera accessible sur: **http://localhost:3000**

---

## 📍 URLs à Tester

### Page Liste des Événements
```
http://localhost:3000/events
```

**À tester:**
- ✅ Barre de recherche en haut de page
- ✅ Saisir "concert" ou "paris" dans la recherche
- ✅ Autocomplete apparaît avec 300ms de debounce
- ✅ Cliquer sur un résultat pour naviguer vers le détail

### Page Détail d'un Événement
```
http://localhost:3000/events/[id-event]
```

Remplacez `[id-event]` par l'ID d'un événement existant dans votre base de données.

**À tester:**
1. **En-tête événement**
   - Image plein écran
   - Titre et artiste
   - Badge de catégorie

2. **Détails événement**
   - Date, heure, lieu
   - Nombre de billets disponibles

3. **Liste des billets** (actuellement avec données mockées)
   - Grille 2 colonnes
   - Cartes avec prix, vendeur, trust score
   - Badge "Vérifié" vert

4. **Sidebar Filtres (gauche)**
   - Menu déroulant "Trier par"
   - Sliders prix min/max
   - Checkboxes catégories
   - Badges filtres actifs

5. **Interactions**
   - Ajuster les sliders de prix
   - Cocher/décocher des catégories
   - Changer le tri
   - Cliquer "Tout effacer"

---

## 🎨 Composants Créés

### 1. SearchBar

**Emplacement:** `/events` (en haut de page)

```tsx
import { SearchBar } from '@/components/events';

<SearchBar placeholder="Rechercher..." />
```

**Test:**
1. Taper au moins 2 caractères
2. Attendre 300ms (debounce)
3. Voir l'autocomplete apparaître
4. Cliquer sur un résultat

### 2. TicketCard

**Emplacement:** `/events/[id]` (grille de billets)

```tsx
import { TicketCard } from '@/components/tickets';

<TicketCard
  id="ticket-1"
  price={89.99}
  originalPrice={120}
  section="Fosse"
  verificationStatus="APPROVED"
  seller={{
    id: "seller-1",
    name: "Marie L.",
    email: "marie@example.com",
    trustScore: 95
  }}
  onBuy={() => alert('Achat!')}
/>
```

**Vérifier:**
- ✅ Badge "Vérifié" vert en haut
- ✅ Prix en gros (89.99€)
- ✅ Prix original barré (120.00€)
- ✅ Badge réduction (-25%)
- ✅ Section/Rangée/Siège
- ✅ Avatar vendeur avec initiales
- ✅ Trust score avec étoile colorée
- ✅ Bouton "Acheter ce billet"

### 3. FilterSidebar

**Emplacement:** `/events/[id]` (sidebar gauche)

```tsx
import { FilterSidebar, type TicketFilters } from '@/components/events';

const [filters, setFilters] = useState<TicketFilters>({
  minPrice: 0,
  maxPrice: 500,
  categories: [],
  sortBy: 'price_asc',
});

<FilterSidebar
  filters={filters}
  onFiltersChange={setFilters}
  availableCategories={['Fosse', 'Gradins', 'VIP']}
  priceRange={{ min: 0, max: 500 }}
/>
```

**Vérifier:**
- ✅ Menu "Trier par" (3 options)
- ✅ Slider prix min/max fonctionnel
- ✅ Checkboxes catégories
- ✅ Badges filtres actifs
- ✅ Bouton "Tout effacer"

---

## 🧪 Scénarios de Test

### Scénario 1: Recherche Complète

1. Aller sur `/events`
2. Cliquer dans la barre de recherche
3. Taper "par" → Attendre autocomplete
4. Voir les événements à Paris
5. Cliquer sur un événement
6. Vérifier la redirection vers `/events/[id]`

### Scénario 2: Filtrage de Billets

1. Aller sur `/events/[id]` (n'importe quel événement)
2. Observer les billets affichés (données mockées)
3. **Filtrer par prix:**
   - Ajuster slider min à 50€
   - Ajuster slider max à 100€
   - Voir les billets se filtrer
4. **Filtrer par catégorie:**
   - Cocher "Fosse"
   - Voir seulement les billets Fosse
5. **Trier:**
   - Sélectionner "Prix décroissant"
   - Voir l'ordre changer
6. **Réinitialiser:**
   - Cliquer "Tout effacer"
   - Voir tous les filtres disparaître

### Scénario 3: Achat d'un Billet

1. Sur `/events/[id]`, trouver un billet avec badge "Vérifié"
2. Vérifier le trust score du vendeur (couleur)
3. Cliquer "Acheter ce billet"
4. Voir l'alerte (TODO: implémenter Stripe)

### Scénario 4: Mobile

1. Réduire la fenêtre à < 768px
2. Vérifier le responsive:
   - SearchBar pleine largeur
   - Filtres en 1 colonne
   - Grille billets en 1 colonne
   - Sliders tactiles

---

## 📊 Données de Test

### Événements
Si vous n'avez pas d'événements, utilisez le seed:

```bash
npx prisma db seed
```

Ou créez-en manuellement via Prisma Studio:

```bash
npx prisma studio
```

### Billets (Mock Data)
Les billets sont actuellement en données mockées dans:
```
app/(public)/events/[id]/page.tsx
```

Cherchez la variable `mockTickets` pour modifier les données de test.

---

## 🔍 API Endpoints

### Recherche d'Événements

```bash
# Terminal
curl "http://localhost:3000/api/events/search?q=concert&limit=5"
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "events": [...],
    "total": 3,
    "query": "concert"
  }
}
```

### Liste des Événements

```bash
curl "http://localhost:3000/api/events"
```

---

## 🎨 Personnalisation

### Modifier les Données Mockées

**Fichier:** `app/(public)/events/[id]/page.tsx`

```tsx
const mockTickets: Ticket[] = [
  {
    id: '1',
    price: 89.99,
    originalPrice: 120.00,
    section: 'Fosse',
    verificationStatus: 'APPROVED',
    seller: {
      id: 'seller1',
      name: 'Votre Nom',
      email: 'email@example.com',
      trustScore: 95,
    },
  },
  // Ajoutez plus de billets ici
];
```

### Modifier les Catégories

Les catégories sont extraites automatiquement des billets, mais vous pouvez les forcer:

```tsx
const availableCategories = ['Fosse', 'Gradins', 'Balcon', 'VIP', 'Carré Or'];
```

### Modifier la Plage de Prix

```tsx
const priceRange = { min: 0, max: 1000 };
```

---

## 🐛 Problèmes Courants

### Autocomplete ne s'affiche pas

**Cause:** Moins de 2 caractères saisis  
**Solution:** Taper au moins 2 caractères

### Pas de résultats de recherche

**Cause:** Pas d'événements dans la DB  
**Solution:** 
```bash
npx prisma db seed
```

### Erreur "Event not found"

**Cause:** ID événement invalide  
**Solution:** Aller d'abord sur `/events` pour voir les IDs valides

### Filtres ne fonctionnent pas

**Cause:** Données mockées non compatibles  
**Solution:** Vérifier que `mockTickets` a bien les champs `section`, `price`, etc.

---

## 📝 TODO: Prochaines Étapes

### Backend
- [ ] Créer API `/api/events/[id]/tickets` pour vrais billets
- [ ] Remplacer données mockées par vraies données Prisma
- [ ] Implémenter logique de réservation

### Frontend
- [ ] Intégrer Stripe pour paiement
- [ ] Modal de confirmation d'achat
- [ ] Gestion des favoris
- [ ] Notifications toast

### Tests
- [ ] Tests unitaires composants
- [ ] Tests E2E avec Playwright
- [ ] Tests API avec Jest

---

## 📞 Support

**Fichiers de référence:**
- `MARKETPLACE_FEATURES.md` - Documentation complète
- `MVP.md` - Schéma base de données
- `DESIGN_SYSTEM.md` - Composants UI
- `prisma/schema.prisma` - Modèles Prisma

**En cas de problème:**
1. Vérifier les logs console (F12)
2. Vérifier les erreurs API (Network tab)
3. Vérifier que la DB est connectée
4. Redémarrer le serveur dev

---

**Bon test ! 🚀**
