#!/bin/bash

# =============================================================================
# Script de configuration des environnements
# =============================================================================
# Ce script aide à configurer les fichiers d'environnement pour différents
# contextes (development, staging, production)
# =============================================================================

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher un message
print_message() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
  echo -e "\n${BLUE}================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}================================${NC}\n"
}

# Fonction pour vérifier si un fichier existe
file_exists() {
  [ -f "$1" ]
}

# Fonction pour copier le template d'environnement
setup_local_env() {
  print_header "Configuration de l'environnement local"
  
  if file_exists ".env.local"; then
    print_warning "Le fichier .env.local existe déjà."
    read -p "Voulez-vous le remplacer ? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      print_message "Configuration annulée."
      return 0
    fi
  fi
  
  if file_exists "env.template"; then
    cp env.template .env.local
    print_message "Fichier .env.local créé depuis env.template"
    print_warning "N'oubliez pas de remplir les valeurs dans .env.local"
  else
    print_error "Le fichier env.template n'existe pas"
    exit 1
  fi
}

# Fonction pour générer un secret NextAuth
generate_nextauth_secret() {
  print_header "Génération d'un secret NextAuth"
  
  if command -v openssl &> /dev/null; then
    SECRET=$(openssl rand -base64 32)
    print_message "Secret généré: $SECRET"
    echo -e "\n${GREEN}Ajoutez cette ligne à votre fichier .env.local:${NC}"
    echo "NEXTAUTH_SECRET=$SECRET"
  else
    print_error "OpenSSL n'est pas installé. Utilisez un générateur en ligne:"
    echo "https://generate-secret.vercel.app/32"
  fi
}

# Fonction pour valider les variables d'environnement
validate_env() {
  print_header "Validation des variables d'environnement"
  
  if ! file_exists ".env.local"; then
    print_error "Le fichier .env.local n'existe pas"
    print_message "Exécutez 'npm run env:setup' pour le créer"
    exit 1
  fi
  
  # Variables requises
  REQUIRED_VARS=(
    "DATABASE_URL"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "NEXTAUTH_URL"
    "NEXTAUTH_SECRET"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    "STRIPE_SECRET_KEY"
  )
  
  # Charger les variables depuis .env.local
  export $(grep -v '^#' .env.local | xargs)
  
  MISSING_VARS=()
  
  for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
      MISSING_VARS+=("$var")
    fi
  done
  
  if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    print_message "✓ Toutes les variables requises sont définies"
  else
    print_error "Variables manquantes ou vides:"
    for var in "${MISSING_VARS[@]}"; do
      echo "  - $var"
    done
    exit 1
  fi
}

# Fonction pour afficher l'aide
show_help() {
  cat << EOF
Usage: ./scripts/setup-env.sh [COMMAND]

Commands:
  setup       Configure le fichier .env.local pour le développement
  secret      Génère un secret pour NextAuth
  validate    Valide les variables d'environnement
  help        Affiche cette aide

Examples:
  ./scripts/setup-env.sh setup
  ./scripts/setup-env.sh secret
  ./scripts/setup-env.sh validate

Pour plus d'informations, consultez ENVIRONMENT.md
EOF
}

# Point d'entrée principal
main() {
  case "${1:-}" in
    setup)
      setup_local_env
      ;;
    secret)
      generate_nextauth_secret
      ;;
    validate)
      validate_env
      ;;
    help|--help|-h)
      show_help
      ;;
    *)
      print_error "Commande inconnue: ${1:-}"
      echo
      show_help
      exit 1
      ;;
  esac
}

main "$@"
