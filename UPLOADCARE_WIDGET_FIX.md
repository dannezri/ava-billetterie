# 🔧 Correction Widget Uploadcare API

## ❌ Erreur

```
TypeError: widget.onProgress is not a function
```

## 🔍 Cause

L'API du widget Uploadcare utilise des **callbacks** avec `.add()` au lieu d'appels directs de fonction.

## ✅ Solution

### Ancienne API (❌ incorrect)

```typescript
widget.onUploadComplete((fileInfo) => { ... });
widget.onProgress((uploadInfo) => { ... });
widget.onChange((fileInfo) => { ... });
```

### Nouvelle API (✅ correct)

```typescript
// Utiliser .add() pour ajouter des callbacks
widget.onUploadComplete.add((fileInfo) => { ... });
widget.onChange.add((fileInfo) => { ... });

// Pour la progression, utiliser fileInfo.progress()
widget.onChange.add((fileInfo) => {
  if (fileInfo) {
    fileInfo.progress((progressInfo) => {
      setUploadProgress(progressInfo.progress * 100);
    });
  }
});
```

## 📚 Événements disponibles

### `onUploadComplete.add(callback)`
Appelé quand l'upload est terminé avec succès.

```typescript
widget.onUploadComplete.add((fileInfo) => {
  console.log('Upload terminé:', fileInfo);
});
```

### `onChange.add(callback)`
Appelé quand un fichier est sélectionné ou supprimé.

```typescript
widget.onChange.add((fileInfo) => {
  if (fileInfo) {
    console.log('Fichier sélectionné');
  } else {
    console.log('Fichier supprimé');
  }
});
```

### `fileInfo.progress(callback)`
Suit la progression de l'upload (0 à 1).

```typescript
fileInfo.progress((progressInfo) => {
  const percent = Math.round(progressInfo.progress * 100);
  console.log(`Progression: ${percent}%`);
});
```

### `fileInfo.fail(callback)`
Gère les erreurs d'upload.

```typescript
fileInfo.fail((error) => {
  console.error('Erreur upload:', error);
});
```

## 🔄 Workflow corrigé

```
1. Utilisateur sélectionne fichier
   ↓
2. onChange.add() → Détection fichier
   ↓
3. Validation (validators.push)
   ↓
4. fileInfo.progress() → Mise à jour progression
   ↓
5. onUploadComplete.add() → Upload terminé
   ou
   fileInfo.fail() → Gestion erreur
```

## ✅ Corrections appliquées

1. ✅ `widget.onUploadComplete()` → `widget.onUploadComplete.add()`
2. ✅ `widget.onChange()` → `widget.onChange.add()`
3. ✅ `widget.onProgress()` → `fileInfo.progress()` (dans onChange)
4. ✅ Ajout de `fileInfo.fail()` pour gérer les erreurs

## 🧪 Test

Après correction :
- ✅ Sélection de fichier fonctionne
- ✅ Barre de progression s'affiche (0-100%)
- ✅ Upload se termine avec succès
- ✅ Erreurs gérées correctement

---

**Date :** 2026-02-16  
**Correction :** API Widget Uploadcare
**Documentation :** https://uploadcare.com/docs/uploads/widget/
