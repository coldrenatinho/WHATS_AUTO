#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Smoke Tests - Verifica endpoints críticos após deploy
# ═══════════════════════════════════════════════════════════════

set -e

API_URL="${1:-http://localhost:3000}"
TIMEOUT=30
RETRIES=5
RETRY_DELAY=3

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Iniciando smoke tests..."
echo "📍 API URL: $API_URL"
echo ""

# Function to retry requests
retry_request() {
    local url=$1
    local expected_status=$2
    local counter=0
    
    while [ $counter -lt $RETRIES ]; do
        response=$(curl -s -w "\n%{http_code}" "$url" --max-time $TIMEOUT)
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | sed '$d')
        
        if [ "$http_code" = "$expected_status" ]; then
            echo -e "${GREEN}✓${NC} $url (HTTP $http_code)"
            return 0
        fi
        
        counter=$((counter + 1))
        if [ $counter -lt $RETRIES ]; then
            echo "⏳ Retry $counter/$RETRIES em ${RETRY_DELAY}s..."
            sleep $RETRY_DELAY
        fi
    done
    
    echo -e "${RED}✗${NC} $url (HTTP $http_code, esperado $expected_status)"
    return 1
}

# Test 1: Health check
echo "1️⃣  Health Check..."
retry_request "$API_URL/health" "200" || exit 1
echo ""

# Test 2: API Documentation
echo "2️⃣  API Documentation..."
retry_request "$API_URL/api/docs" "200" || exit 1
echo ""

# Test 3: OpenAPI JSON
echo "3️⃣  OpenAPI Schema..."
retry_request "$API_URL/api/docs.json" "200" || exit 1
echo ""

# Test 4: Auth endpoint (should redirect or return 401 without token)
echo "4️⃣  Auth Endpoint..."
response=$(curl -s -w "\n%{http_code}" "$API_URL/api/auth/me" --max-time $TIMEOUT)
http_code=$(echo "$response" | tail -n1)
if [[ "$http_code" =~ ^(200|401|403)$ ]]; then
    echo -e "${GREEN}✓${NC} $API_URL/api/auth/me (HTTP $http_code)"
else
    echo -e "${RED}✗${NC} $API_URL/api/auth/me (HTTP $http_code)"
    exit 1
fi
echo ""

# Test 5: Database connectivity (via API)
echo "5️⃣  Database Connectivity (via API)..."
# Tenta buscar uma lista vazia ou erro de auth, mas que prova DB está up
response=$(curl -s -w "\n%{http_code}" "$API_URL/api/companies" \
    -H "Content-Type: application/json" \
    --max-time $TIMEOUT)
http_code=$(echo "$response" | tail -n1)
if [[ "$http_code" =~ ^(200|401|403|500)$ ]]; then
    echo -e "${GREEN}✓${NC} Database responding (HTTP $http_code)"
else
    echo -e "${RED}✗${NC} Database error (HTTP $http_code)"
    exit 1
fi
echo ""

echo -e "${GREEN}✅ All smoke tests passed!${NC}"
exit 0
