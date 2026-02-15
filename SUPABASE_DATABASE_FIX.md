# 🔧 Correction Connexion Database Supabase

## ⚠️ Problème Détecté

```
Can't reach database server at db.njogpuyhodyvzppislsb.supabase.co:5432
```

## 🔍 Cause

Vercel est un environnement **serverless** qui crée de nouvelles connexions à chaque requête. Supabase a une limite de connexions directes (port 5432).

Pour les environnements serverless, il faut utiliser le **Connection Pooler** de Supabase.

## ✅ Solution : Utiliser le Pooler Supabase

### Option 1 : URL Transaction Mode (Recommandé pour Prisma)

1. Allez sur : https://supabase.com/dashboard/project/njogpuyhodyvzppislsb/settings/database

2. Dans la section **Connection String**, sélectionnez :
   - **Transaction** (pour Prisma)
   - OU **Session** (si transaction ne fonctionne pas)

3. Copiez l'URL qui ressemble à :
   ```
   postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

4. Ajoutez-la à Vercel :
   ```bash
   cd /Users/dannezri/Desktop/ava
   
   # Supprimer l'ancienne
   vercel env rm DATABASE_URL production
   vercel env rm DATABASE_URL preview
   vercel env rm DATABASE_URL development
   
   # Ajouter la nouvelle (avec pooler)
   echo "VOTRE_NOUVELLE_URL" | vercel env add DATABASE_URL production
   echo "VOTRE_NOUVELLE_URL" | vercel env add DATABASE_URL preview
   echo "VOTRE_NOUVELLE_URL" | vercel env add DATABASE_URL development
   ```

### Option 2 : Modifier l'URL Actuelle (Plus Rapide)

Votre URL actuelle :
```
postgresql://postgres:[Loveshirel02$]@db.njogpuyhodyvzppislsb.supabase.co:5432/postgres
```

Doit devenir (avec pooler sur port 6543) :
```
postgresql://postgres.njogpuyhodyvzppislsb:[Loveshirel02$]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Note :** La région `us-east-1` peut varier selon où votre projet Supabase est hébergé.

## 🚀 Commandes Rapides (Option 2)

```bash
cd /Users/dannezri/Desktop/ava

# URL corrigée avec pooler
NEW_URL='postgresql://postgres.njogpuyhodyvzppislsb:[Loveshirel02$]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1'

# Production
vercel env rm DATABASE_URL production --yes
echo "$NEW_URL" | vercel env add DATABASE_URL production

# Preview
vercel env rm DATABASE_URL preview --yes
echo "$NEW_URL" | vercel env add DATABASE_URL preview

# Development
vercel env rm DATABASE_URL development --yes
echo "$NEW_URL" | vercel env add DATABASE_URL development

# Redéployer
vercel --prod
```

## 📚 Documentation

- Supabase Connection Pooling : https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pool
- Prisma + Supabase : https://www.prisma.io/docs/guides/database/supabase

## 🔍 Vérifier la Région

Pour trouver la bonne région de votre pooler :

1. Dashboard Supabase > Settings > Database
2. Regardez la section **Connection Pooling**
3. L'URL contient la région (ex: `aws-0-us-east-1`, `aws-0-eu-central-1`, etc.)

## ✅ Après Correction

1. **Tester** : `curl https://ava-billetterie-web.vercel.app/api/health/db`
2. **Devrait retourner** :
   ```json
   {
     "success": true,
     "data": {
       "status": "connected",
       "database": "PostgreSQL (Supabase)"
     }
   }
   ```

## 💡 Alternative : Prisma Data Proxy

Si le pooling ne résout pas le problème, considérez Prisma Data Proxy pour gérer les connexions : https://www.prisma.io/docs/data-platform/data-proxy

---

**Note :** Le health check principal (`/api/health`) fonctionne déjà ! Cette correction est uniquement pour activer la connexion database directe.
