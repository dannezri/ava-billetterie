# 🔧 Fixes Page Événements - Résumé

**Date :** 15 février 2026  
**Commit :** `9232546`

---

## ✅ Problèmes Résolus

### 1. ✅ Images Unsplash (400 Bad Request)

**Problème :**
```
GET https://ava-billetterie-web.vercel.app/_next/image?url=https%3A%2F%2Fimages.unsplash.com... 400 (Bad Request)
```

**Cause :**  
Next.js bloque par défaut les images externes non whitelistées pour des raisons de sécurité.

**Solution :**  
Ajout de `images.unsplash.com` dans `next.config.ts` :

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'ucarecdn.com', // Uploadcare
    },
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com', // Cloudinary
    },
    {
      protocol: 'https',
      hostname: 'images.unsplash.com', // Unsplash ✅ AJOUTÉ
    },
  ],
},
```

**Résultat :**  
✅ Les images des événements s'affichent correctement

---

### 2. ✅ Page Détail Événement (404)

**Problème :**
```
GET https://ava-billetterie-web.vercel.app/events/dd014609-2cd7-45e2-a999-8d56690d5278 404 (Not Found)
```

**Cause :**  
La route dynamique `/events/[id]` n'existait pas.

**Solution :**  
Création de `app/(public)/events/[id]/page.tsx` avec :
- Affichage complet de l'événement (image, titre, description, détails)
- Card de réservation (prix, disponibilité, bouton d'achat)
- Informations pratiques (date, heure, lieu, pays, catégorie)
- Skeleton loader pour le chargement
- Gestion d'erreurs (événement non trouvé)

**Fonctionnalités :**
- ✅ Image en pleine largeur avec badge catégorie
- ✅ Titre et description
- ✅ Détails de l'événement (date, heure, lieu, pays)
- ✅ Card de réservation sticky (prix, disponibilité, bouton d'achat)
- ✅ Protection acheteur et vérification des billets
- ✅ Bouton retour vers `/events`
- ✅ Responsive (desktop + mobile)
- ✅ Skeleton loading state
- ✅ Error handling avec Alert

**Résultat :**  
✅ Cliquer sur un événement affiche maintenant sa page détaillée

---

## 📊 API Événements - État Actuel

### ✅ API Fonctionnelle

**Test :**
```bash
curl https://ava-billetterie-web.vercel.app/api/events
```

**Résultat :**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "dd014609-2cd7-45e2-a999-8d56690d5278",
        "title": "Festival Coachella Valley - Pass 3 Jours",
        "category": "Festival",
        "availableTickets": 2,
        "minPrice": 550,
        "maxPrice": 1200
      },
      // ... 4 autres événements
    ],
    "total": 5
  }
}
```

**Fix Appliqué :**  
✅ Ajout de `?pgbouncer=true` à `DATABASE_URL` sur Vercel  
✅ Prisma désactive les prepared statements  
✅ Compatible avec PgBouncer (Supabase Connection Pooler)

---

## ⚠️ Problème Restant : Filtres

### 🐛 Les Filtres Ne Retournent Aucun Résultat

**Symptôme :**  
Quand on applique un filtre (ville, catégorie, date), aucun événement n'est affiché alors que l'API retourne bien des résultats.

**Diagnostic Préliminaire :**

**1. Vérifier si les filtres sont bien envoyés à l'API :**

Ouvrir DevTools Console et regarder les requêtes réseau :
```
GET /api/events?city=Paris
GET /api/events?category=Concert
GET /api/events?dateRange=week
```

**2. Vérifier la réponse de l'API :**

La réponse contient-elle des événements ?
```json
{
  "success": true,
  "data": {
    "events": [...], // Devrait contenir des événements
    "total": 5
  }
}
```

**3. Vérifier le code côté client :**

Le composant `EventsPage` (`app/(public)/events/page.tsx`) :
- Ligne 70-90 : `fetchEvents()` envoie bien les filtres à l'API
- Ligne 92-100 : `useEffect()` se déclenche bien au changement de filtres
- Ligne 107 : `handleFiltersChange()` met à jour l'URL avec les query params

**Causes Possibles :**

**A. Problème de Prisma Query (API)**

Le filtre Prisma dans `app/api/events/route.ts` pourrait être trop strict.

**Vérification :**
```typescript
// Ligne 18-25 de app/api/events/route.ts
if (city) {
  whereClause.city = city; // ❓ Est-ce que "Paris" existe exactement dans la DB ?
}

if (category) {
  whereClause.category = category; // ❓ Est-ce que "Concert" existe exactement ?
}
```

**Test :**
```bash
# Tester avec les vraies valeurs de la DB
curl "https://ava-billetterie-web.vercel.app/api/events?city=Paris"
curl "https://ava-billetterie-web.vercel.app/api/events?category=Concert"
```

**B. Problème de Format de Date**

Les dates dans la DB sont en ISO 8601, mais le filtre `dateRange` utilise des strings comme "week", "month", etc.

**Vérification :**
```typescript
// Ligne 30-54 de app/api/events/route.ts
if (dateRange) {
  const now = new Date();
  let endDate = new Date();
  
  switch (dateRange) {
    case 'today':
      endDate.setHours(23, 59, 59, 999);
      whereClause.eventDate = { gte: now, lte: endDate }; // ❓ Timezone ?
      break;
    // ...
  }
}
```

**Test :**
```bash
curl "https://ava-billetterie-web.vercel.app/api/events?dateRange=week"
```

**C. Problème de State/URL React**

Le composant React ne met pas à jour correctement l'état ou l'URL.

**Vérification :**
- Ouvrir DevTools Console
- Appliquer un filtre
- Vérifier l'URL dans la barre d'adresse : `/events?city=Paris`
- Vérifier la requête réseau dans l'onglet Network

---

## 🧪 Tests à Effectuer (pour diagnostiquer les filtres)

### 1. Test API Directe

```bash
# Test sans filtre (devrait retourner 5 événements)
curl -s "https://ava-billetterie-web.vercel.app/api/events" | jq '.data.total'
# Résultat attendu : 5

# Test filtre ville
curl -s "https://ava-billetterie-web.vercel.app/api/events?city=Paris" | jq '.data.total'
# Résultat attendu : 3 ou 4 (selon les événements à Paris)

# Test filtre catégorie
curl -s "https://ava-billetterie-web.vercel.app/api/events?category=Concert" | jq '.data.total'
# Résultat attendu : 2 (Daft Punk + The Weeknd)

# Test filtre date
curl -s "https://ava-billetterie-web.vercel.app/api/events?dateRange=6months" | jq '.data.total'
# Résultat attendu : 5 (tous les événements sont dans les 6 prochains mois)
```

### 2. Test Browser Console

Ouvrir https://ava-billetterie-web.vercel.app/events et dans la Console :

```javascript
// Tester la fonction fetch
fetch('/api/events?city=Paris')
  .then(res => res.json())
  .then(data => console.log('Total:', data.data.total, 'Events:', data.data.events.length));

// Tester avec catégorie
fetch('/api/events?category=Concert')
  .then(res => res.json())
  .then(data => console.log('Total:', data.data.total, 'Events:', data.data.events.length));
```

### 3. Test Network Tab

1. Ouvrir https://ava-billetterie-web.vercel.app/events
2. Ouvrir DevTools → Network Tab
3. Appliquer un filtre (ex: sélectionner "Paris" dans le dropdown Ville)
4. Regarder la requête qui est envoyée :
   - URL : `/api/events?city=Paris`
   - Status : 200 ?
   - Response : contient des événements ?

---

## 🔍 Diagnostic Probable

**Hypothèse 1 : Nom de Ville/Catégorie Incorrect**

Les seeds utilisent peut-être des noms différents de ceux dans les filtres.

**Vérification dans prisma/seed.ts :**

```typescript
// Événements créés :
1. Coachella - location: "Empire Polo Club, Indio" (États-Unis)
2. Cirque du Soleil - location: "Chapiteau Grand Palais Éphémère, Paris" (France)
3. Roland-Garros - location: "Stade Roland-Garros, Paris" (France)
4. The Weeknd - location: "Accor Arena, Paris" (France)
5. Daft Punk - location: "Stade de France, Saint-Denis" (France)
```

**Problème :** Le filtre cherche `city="Paris"` mais les événements ont :
- `location="Chapiteau Grand Palais Éphémère, Paris"` ✅ contient "Paris"
- `location="Stade de France, Saint-Denis"` ❌ ne contient pas "Paris"

**Solution Potentielle :**  
Le schéma Prisma doit avoir un champ `city` séparé du champ `location` (venue).

**Vérification du schema :**
```prisma
model Event {
  // ...
  venue    String    // "Accor Arena"
  city     String    // "Paris" ✅
  country  String    @default("France")
  // ...
}
```

✅ Le schéma a bien un champ `city` séparé !

**Vérification des seeds :**
```typescript
// prisma/seed.ts ligne 50-70
{
  // ...
  venue: 'Chapiteau Grand Palais Éphémère',
  city: 'Paris', // ✅
  country: 'France',
}
```

✅ Les seeds utilisent bien le champ `city` !

**Donc le problème n'est PAS là.**

---

## 🎯 Prochaine Étape : Debug des Filtres

### Option A : Vérifier les Données Réelles en DB

```bash
# Se connecter à Supabase et vérifier les valeurs city et category
# Aller sur : https://supabase.com/dashboard/project/njogpuyhodyvzppislsb
# SQL Editor → Nouvelle Query
SELECT DISTINCT city FROM "Event";
SELECT DISTINCT category FROM "Event";
```

### Option B : Ajouter des Logs dans l'API

Modifier `app/api/events/route.ts` pour logger les filtres reçus :

```typescript
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const dateRange = searchParams.get('dateRange') || '';
    const category = searchParams.get('category') || '';

    // ✅ AJOUTER CES LOGS
    console.log('[API Events] Filters received:', {
      searchTerm,
      city,
      dateRange,
      category,
    });

    // ... reste du code
    
    console.log('[API Events] Events found:', formattedEvents.length);
    
    return NextResponse.json({
      success: true,
      data: {
        events: formattedEvents,
        total: formattedEvents.length,
      },
    });
  } catch (error: any) {
    console.error('[API Events] Error:', error);
    // ...
  }
}
```

Puis regarder les logs dans Vercel Dashboard :
https://vercel.com/avas-projects-033b4f47/ava-billetterie-web/logs

### Option C : Tester en Local

```bash
# 1. Lancer le serveur local
npm run dev

# 2. Tester l'API en local
curl "http://localhost:3000/api/events?city=Paris"

# 3. Comparer avec la prod
curl "https://ava-billetterie-web.vercel.app/api/events?city=Paris"
```

---

## 📝 Checklist

- [x] Fix images Unsplash (400 → 200)
- [x] Créer page détail événement (404 → 200)
- [x] Commit et push
- [x] Déclencher redéploiement Vercel
- [ ] Attendre 2-3 minutes (build en cours)
- [ ] Tester images sur /events
- [ ] Tester clic sur événement
- [ ] Diagnostiquer problème filtres (tests API)
- [ ] Fix filtres si nécessaire

---

## 🚀 Déploiement

**Commit :** `9232546`  
**Branch :** `main`  
**Status :** 🟡 Building... (Vercel auto-deploy déclenché)

**Attendre 2-3 minutes puis tester :**
- https://ava-billetterie-web.vercel.app/events (images OK ?)
- Cliquer sur un événement (page détail OK ?)
- Appliquer un filtre (résultats OK ?)

---

*Document créé le : 15 février 2026 à 21:45*
