#!/bin/bash

# =============================================================================
# Script de test Stripe Connect
# =============================================================================
# Ce script permet de tester facilement les fonctionnalités Stripe Connect
# Utilisation: bash scripts/test-stripe-connect.sh [command]
# =============================================================================

set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:3000}"

# =============================================================================
# FONCTIONS UTILITAIRES
# =============================================================================

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_server() {
    log_info "Vérification du serveur Next.js..."
    
    if curl -s "${API_URL}/api/health" > /dev/null 2>&1; then
        log_success "Serveur Next.js accessible"
        return 0
    else
        log_error "Serveur Next.js non accessible sur ${API_URL}"
        log_warning "Lancez 'npm run dev' dans un autre terminal"
        return 1
    fi
}

check_stripe_cli() {
    log_info "Vérification de Stripe CLI..."
    
    if command -v stripe &> /dev/null; then
        log_success "Stripe CLI installé"
        return 0
    else
        log_error "Stripe CLI non trouvé"
        log_warning "Installation: brew install stripe/stripe-cli/stripe"
        return 1
    fi
}

# =============================================================================
# COMMANDES DE TEST
# =============================================================================

test_create_account() {
    log_info "Test : Création d'un compte Connect..."
    
    RESPONSE=$(curl -s -X POST "${API_URL}/api/stripe-connect/test/create-account" \
        -H "Content-Type: application/json" \
        -d '{
            "userId": "test-user-'$(date +%s)'",
            "email": "test-seller-'$(date +%s)'@example.com",
            "country": "FR",
            "businessType": "individual"
        }')
    
    if echo "$RESPONSE" | grep -q "success"; then
        log_success "Compte créé avec succès"
        echo "$RESPONSE" | jq '.'
        
        # Sauvegarder l'accountId pour les tests suivants
        ACCOUNT_ID=$(echo "$RESPONSE" | jq -r '.accountId')
        echo "$ACCOUNT_ID" > /tmp/stripe-test-account-id
    else
        log_error "Échec de la création du compte"
        echo "$RESPONSE"
    fi
}

test_onboarding_link() {
    log_info "Test : Génération du lien d'onboarding..."
    
    # Récupérer l'accountId du test précédent
    if [ -f /tmp/stripe-test-account-id ]; then
        ACCOUNT_ID=$(cat /tmp/stripe-test-account-id)
    else
        log_error "Aucun compte créé - exécutez d'abord 'create'"
        return 1
    fi
    
    RESPONSE=$(curl -s -X POST "${API_URL}/api/stripe-connect/test/onboarding-link" \
        -H "Content-Type: application/json" \
        -d "{\"accountId\": \"${ACCOUNT_ID}\"}")
    
    if echo "$RESPONSE" | grep -q "onboardingUrl"; then
        log_success "Lien d'onboarding généré"
        echo "$RESPONSE" | jq '.'
        
        URL=$(echo "$RESPONSE" | jq -r '.onboardingUrl')
        log_info "Ouvrir dans le navigateur : ${URL}"
    else
        log_error "Échec de la génération du lien"
        echo "$RESPONSE"
    fi
}

test_account_status() {
    log_info "Test : Récupération du statut du compte..."
    
    # Récupérer l'accountId du test précédent
    if [ -f /tmp/stripe-test-account-id ]; then
        ACCOUNT_ID=$(cat /tmp/stripe-test-account-id)
    else
        log_error "Aucun compte créé - exécutez d'abord 'create'"
        return 1
    fi
    
    RESPONSE=$(curl -s "${API_URL}/api/stripe-connect/test/account-status?accountId=${ACCOUNT_ID}")
    
    if echo "$RESPONSE" | grep -q "success"; then
        log_success "Statut récupéré"
        echo "$RESPONSE" | jq '.'
    else
        log_error "Échec de la récupération du statut"
        echo "$RESPONSE"
    fi
}

test_dashboard_link() {
    log_info "Test : Génération du lien dashboard..."
    
    # Récupérer l'accountId du test précédent
    if [ -f /tmp/stripe-test-account-id ]; then
        ACCOUNT_ID=$(cat /tmp/stripe-test-account-id)
    else
        log_error "Aucun compte créé - exécutez d'abord 'create'"
        return 1
    fi
    
    RESPONSE=$(curl -s -X POST "${API_URL}/api/stripe-connect/test/dashboard-link" \
        -H "Content-Type: application/json" \
        -d "{\"accountId\": \"${ACCOUNT_ID}\"}")
    
    if echo "$RESPONSE" | grep -q "url"; then
        log_success "Lien dashboard généré"
        echo "$RESPONSE" | jq '.'
    else
        log_error "Échec de la génération du lien dashboard"
        echo "$RESPONSE"
    fi
}

trigger_webhooks() {
    log_info "Déclenchement des webhooks de test..."
    
    if ! check_stripe_cli; then
        return 1
    fi
    
    log_info "1. account.updated"
    stripe trigger account.updated
    sleep 2
    
    log_info "2. payment_intent.succeeded"
    stripe trigger payment_intent.succeeded
    sleep 2
    
    log_info "3. transfer.created"
    stripe trigger transfer.created
    sleep 2
    
    log_success "Webhooks déclenchés - vérifiez les logs du serveur"
}

run_all_tests() {
    log_info "=== Exécution de tous les tests ==="
    echo ""
    
    if ! check_server; then
        return 1
    fi
    
    # Nettoyer l'ancien accountId
    rm -f /tmp/stripe-test-account-id
    
    echo ""
    test_create_account
    sleep 2
    
    echo ""
    test_onboarding_link
    sleep 2
    
    echo ""
    test_account_status
    sleep 2
    
    echo ""
    test_dashboard_link
    sleep 2
    
    echo ""
    log_success "Tous les tests sont terminés !"
    
    # Afficher l'accountId pour référence
    if [ -f /tmp/stripe-test-account-id ]; then
        ACCOUNT_ID=$(cat /tmp/stripe-test-account-id)
        log_info "Account ID de test : ${ACCOUNT_ID}"
    fi
}

setup_stripe_webhook() {
    log_info "Configuration du webhook Stripe local..."
    
    if ! check_stripe_cli; then
        return 1
    fi
    
    log_warning "Cette commande va bloquer le terminal"
    log_warning "Copiez le 'webhook signing secret' dans .env.local"
    log_warning "Puis redémarrez le serveur Next.js"
    echo ""
    
    stripe listen --forward-to "${API_URL}/api/webhooks/stripe"
}

create_test_account_stripe_cli() {
    log_info "Création d'un compte Connect de test via Stripe CLI..."
    
    if ! check_stripe_cli; then
        return 1
    fi
    
    stripe accounts create \
        --type=custom \
        --country=FR \
        --email="test-seller@example.com" \
        --business-type=individual \
        --capabilities[card_payments][requested]=true \
        --capabilities[transfers][requested]=true
    
    log_success "Compte créé via Stripe CLI"
}

list_accounts() {
    log_info "Liste des comptes Connect..."
    
    if ! check_stripe_cli; then
        return 1
    fi
    
    stripe accounts list --limit=10
}

show_help() {
    echo "Usage: bash scripts/test-stripe-connect.sh [command]"
    echo ""
    echo "Commandes disponibles:"
    echo "  test             - Exécuter tous les tests"
    echo "  create           - Créer un compte Connect"
    echo "  onboarding       - Générer un lien d'onboarding"
    echo "  status           - Récupérer le statut du compte"
    echo "  dashboard        - Générer un lien dashboard"
    echo "  webhooks         - Déclencher des webhooks de test"
    echo "  listen           - Écouter les webhooks locaux (Stripe CLI)"
    echo "  create-cli       - Créer un compte via Stripe CLI"
    echo "  list             - Lister les comptes Connect"
    echo "  help             - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  bash scripts/test-stripe-connect.sh test"
    echo "  bash scripts/test-stripe-connect.sh listen"
    echo "  bash scripts/test-stripe-connect.sh webhooks"
}

# =============================================================================
# MAIN
# =============================================================================

case "$1" in
    test)
        run_all_tests
        ;;
    create)
        test_create_account
        ;;
    onboarding)
        test_onboarding_link
        ;;
    status)
        test_account_status
        ;;
    dashboard)
        test_dashboard_link
        ;;
    webhooks)
        trigger_webhooks
        ;;
    listen)
        setup_stripe_webhook
        ;;
    create-cli)
        create_test_account_stripe_cli
        ;;
    list)
        list_accounts
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        log_error "Commande inconnue: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
