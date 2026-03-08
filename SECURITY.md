# 🔐 SECURITY — Vulnérabilités Connues et Acceptées

## Contexte

Rapport généré le 8 mars 2026. Résultat `npm audit` : **8 vulnérabilités** (4 low, 4 high).

---

## Vulnérabilités HIGH — Next.js (non patchées en 14.x)

### CVE : GHSA-9g9p-9gw9-jx7f
- **Package** : `next` (14.x)
- **Severity** : High
- **Description** : DoS via Image Optimizer `remotePatterns` configuration
- **Mitigation appliquée** : `remotePatterns` restreint aux domaines connus uniquement (`ucarecdn.net`, `cloudinary.com`, `unsplash.com`, `ticketm.net`)
- **Fix disponible** : `next@16` (breaking change)
- **Action planifiée** : Migration Next.js 15 en **Phase 1** (3-4 semaines)
- **Risque actuel** : Faible — configuration `remotePatterns` restrictive

### CVE : GHSA-h25m-26qc-wcjf
- **Package** : `next` (14.x)
- **Severity** : High
- **Description** : HTTP request deserialization DoS with insecure React Server Components
- **Mitigation appliquée** : RSC utilisés uniquement pour lecture de données, pas de désérialisation d'inputs utilisateur non validés
- **Fix disponible** : `next@16` (breaking change)
- **Action planifiée** : Migration Next.js 15 en **Phase 1**
- **Risque actuel** : Faible — architecture RSC actuelle ne présente pas ce vecteur

---

## Vulnérabilités LOW — (4 résiduelle, transitives)

Ces vulnérabilités sont dans des dépendances transitives à faible exposition. Revue trimestrielle prévue.

---

## Historique des Corrections

| Date | Action | Vulns avant | Vulns après |
|------|--------|-------------|-------------|
| 8 mar 2026 | `npm audit fix` (rollup, etc.) | 11 | 8 |

---

## Prochaine Revue

**Prévue** : Juin 2026 (ou après migration Next.js 15)

## Signaler une Vulnérabilité

Pour signaler une vulnérabilité de sécurité, contacter : security@ava-billetterie.fr
