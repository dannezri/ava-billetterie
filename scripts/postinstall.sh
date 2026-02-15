#!/bin/bash

# Script postinstall - génère Prisma Client seulement si DATABASE_URL existe
if [ -n "$DATABASE_URL" ]; then
  echo "✅ DATABASE_URL found - generating Prisma Client..."
  npx prisma generate
else
  echo "⚠️  DATABASE_URL not found - skipping Prisma generation (static build)"
fi
