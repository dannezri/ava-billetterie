#!/bin/bash
set -e

echo "🚀 Starting Vercel build..."

# Vérifier si DATABASE_URL est défini
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not found - building static landing page"
  echo "📦 Building Next.js (static mode)..."
  export SKIP_TYPE_CHECK=true
  npm run build:static
else
  echo "✅ DATABASE_URL found - running full build with Prisma"
  echo "🔧 Generating Prisma Client..."
  npx prisma generate
  
  echo "📦 Building Next.js..."
  npm run build
fi

echo "✅ Build completed successfully!"
