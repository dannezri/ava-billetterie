# 🐛 Guide de débogage - Formulaire création billet

## ✅ Logs ajoutés

J'ai ajouté des logs de débogage dans le formulaire pour identifier le problème.

## 📋 Comment déboguer

### 1. Ouvrir la console du navigateur
- **Mac** : `Cmd + Option + I`
- **Windows/Linux** : `F12`
- Aller dans l'onglet **"Console"**

### 2. Recharger la page
- Aller sur `/tickets/new`
- Appuyer sur `Cmd + Shift + R` (Mac) ou `Ctrl + Shift + R` (Windows)

### 3. Remplir le formulaire
- **Étape 1** : Sélectionner un événement, prix, catégorie
- Cliquer sur "Suivant"
- **Étape 2** : Uploader un PDF

### 4. Observer les logs

Vous devriez voir dans la console :

```
✅ Upload terminé, fileInfo: {
  uuid: "...",
  name: "...",
  size: ...,
  cdnUrl: "..."
}
📝 pdfUrl défini à: https://ucarecdn.com/...
```

### 5. Cliquer sur "Mettre en vente"

Vous devriez voir :

```
🖱️ Bouton cliqué
State - isSubmitting: false
State - uploadedFile: {...}
State - errors: {...}
🚀 onSubmit appelé avec data: {...}
📤 Envoi payload: {...}
```

## 🔍 Diagnostic selon les logs

### Cas 1 : Vous voyez "🖱️ Bouton cliqué" mais PAS "🚀 onSubmit appelé"

**Problème** : Erreur de validation du formulaire

**Solution** : Regarder `State - errors:` dans les logs. Il y a probablement un champ invalide.

**Erreurs possibles** :
- `eventId` manquant ou invalide
- `originalPrice` ou `sellingPrice` manquant
- `sellingPrice > originalPrice`
- `section` vide
- `pdfUrl` manquant

### Cas 2 : Vous voyez "🚀 onSubmit appelé" puis une erreur

**Problème** : Erreur de l'API backend

**Solution** : Regarder le message d'erreur dans la réponse

**Erreurs possibles** :
- 401 : Non authentifié
- 403 : KYC non vérifié
- 404 : Événement non trouvé
- 409 : Doublon (code-barres ou hash PDF)
- 500 : Erreur serveur

### Cas 3 : Vous NE voyez PAS "🖱️ Bouton cliqué"

**Problème** : Le clic n'est pas détecté

**Solution** : Le bouton est peut-être désactivé (grisé)

**Vérifier** :
- `uploadedFile` doit être défini (fichier uploadé)
- `isSubmitting` doit être `false`

### Cas 4 : Le bouton est grisé (disabled)

**Problème** : Conditions de désactivation

**Le bouton est désactivé si** :
- ❌ `uploadedFile` est `null` (pas de fichier uploadé)
- ❌ `isSubmitting` est `true` (soumission en cours)

**Solution** :
- Vérifier que l'upload est terminé avec succès
- Regarder les logs "✅ Upload terminé"

## 🎯 Checklist de validation

Avant de cliquer sur "Mettre en vente", vérifier :

### Étape 1
- [ ] Événement sélectionné (UUID valide)
- [ ] Prix facial saisi (> 0)
- [ ] Prix de vente saisi (> 0 et ≤ prix facial)
- [ ] Catégorie/Section saisie (min 1 caractère)

### Étape 2
- [ ] PDF uploadé avec succès
- [ ] Message "Fichier uploadé avec succès" visible
- [ ] Détails du fichier affichés (nom, taille, type)
- [ ] Bouton "Mettre en vente" coloré (pas grisé)

## 🆘 Si le problème persiste

Envoyez-moi :
1. **Tous les logs de la console** (copier-coller)
2. **Screenshot du formulaire** à l'étape 2
3. **État du bouton** : grisé ou coloré ?
4. **Messages d'erreur** visibles dans l'interface ?

---

**Fichier de débogage** : `src/components/tickets/CreateTicketForm.tsx` (logs temporaires)
