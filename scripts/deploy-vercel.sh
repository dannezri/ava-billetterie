#!/bin/bash

# =============================================================================
# Script de déploiement sur Vercel
# =============================================================================
# Ce script aide à déployer l'application sur différents environnements Vercel
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

# Vérifier que Vercel CLI est installé
check_vercel_cli() {
  if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI n'est pas installé"
    print_message "Installation: npm i -g vercel"
    exit 1
  fi
}

# Vérifier que l'utilisateur est connecté
check_vercel_auth() {
  if ! vercel whoami &> /dev/null; then
    print_error "Vous n'êtes pas connecté à Vercel"
    print_message "Exécutez: vercel login"
    exit 1
  fi
}

# Déployer en preview (staging)
deploy_preview() {
  print_header "Déploiement en Preview (Staging)"
  
  print_message "Vérification des variables d'environnement..."
  
  print_message "Déploiement sur Vercel..."
  vercel --yes
  
  print_message "✓ Déploiement preview terminé"
}

# Déployer en production
deploy_production() {
  print_header "Déploiement en Production"
  
  print_warning "Vous êtes sur le point de déployer en PRODUCTION"
  read -p "Êtes-vous sûr ? (yes/N) " -r
  echo
  
  if [[ ! $REPLY == "yes" ]]; then
    print_message "Déploiement annulé"
    exit 0
  fi
  
  print_message "Vérification de la branche..."
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  
  if [[ $CURRENT_BRANCH != "main" ]]; then
    print_error "Vous devez être sur la branche 'main' pour déployer en production"
    print_message "Branche actuelle: $CURRENT_BRANCH"
    exit 1
  fi
  
  print_message "Vérification des tests..."
  npm run test:ci || {
    print_error "Les tests ont échoué"
    exit 1
  }
  
  print_message "Vérification du build..."
  npm run build || {
    print_error "Le build a échoué"
    exit 1
  }
  
  print_message "Déploiement sur Vercel (production)..."
  vercel --prod --yes
  
  print_message "✓ Déploiement production terminé"
}

# Configurer les variables d'environnement
setup_env_vars() {
  print_header "Configuration des variables d'environnement"
  
  ENV_TYPE=$1
  ENV_FILE="config/env.${ENV_TYPE}.example"
  
  if [[ ! -f $ENV_FILE ]]; then
    print_error "Fichier $ENV_FILE introuvable"
    exit 1
  fi
  
  print_message "Configuration des variables pour: $ENV_TYPE"
  print_warning "Vous devrez entrer les valeurs pour chaque variable"
  
  # Lire le fichier et extraire les variables
  while IFS= read -r line; do
    # Ignorer les commentaires et les lignes vides
    if [[ $line =~ ^[[:space:]]*# ]] || [[ -z $line ]]; then
      continue
    fi
    
    # Extraire le nom de la variable
    VAR_NAME=$(echo "$line" | cut -d'=' -f1)
    
    if [[ -n $VAR_NAME ]]; then
      echo ""
      read -p "Valeur pour $VAR_NAME: " VAR_VALUE
      
      if [[ -n $VAR_VALUE ]]; then
        if [[ $ENV_TYPE == "production" ]]; then
          vercel env add "$VAR_NAME" production <<< "$VAR_VALUE"
        elif [[ $ENV_TYPE == "staging" ]]; then
          vercel env add "$VAR_NAME" preview <<< "$VAR_VALUE"
        else
          vercel env add "$VAR_NAME" development <<< "$VAR_VALUE"
        fi
      fi
    fi
  done < "$ENV_FILE"
  
  print_message "✓ Variables d'environnement configurées"
}

# Lister les variables d'environnement
list_env_vars() {
  print_header "Variables d'environnement Vercel"
  vercel env ls
}

# Afficher l'aide
show_help() {
  cat << EOF
Usage: ./scripts/deploy-vercel.sh [COMMAND]

Commands:
  preview       Déployer en preview (staging)
  production    Déployer en production
  setup-env     Configurer les variables d'environnement
  list-env      Lister les variables d'environnement
  help          Afficher cette aide

Examples:
  ./scripts/deploy-vercel.sh preview
  ./scripts/deploy-vercel.sh production
  ./scripts/deploy-vercel.sh setup-env staging
  ./scripts/deploy-vercel.sh list-env

Pour plus d'informations, consultez ENVIRONMENT.md
EOF
}

# Point d'entrée principal
main() {
  check_vercel_cli
  check_vercel_auth
  
  case "${1:-}" in
    preview)
      deploy_preview
      ;;
    production)
      deploy_production
      ;;
    setup-env)
      if [[ -z "${2:-}" ]]; then
        print_error "Vous devez spécifier l'environnement: development, staging ou production"
        exit 1
      fi
      setup_env_vars "$2"
      ;;
    list-env)
      list_env_vars
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
