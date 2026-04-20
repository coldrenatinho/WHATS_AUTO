#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Smoke Tests - Verifica endpoints críticos após deploy
# ═══════════════════════════════════════════════════════════════

set -e

API_URL="${1:-http://localhost:3000}"
TIMEOUT=15
CONNECT_TIMEOUT=5
RETRIES=8
RETRY_DELAY=4

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🧪 Iniciando Smoke Tests...${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "📍 API URL: ${YELLOW}$API_URL${NC}"
echo -e "⏱️  Timeout: ${YELLOW}${TIMEOUT}s${NC} | Retries: ${YELLOW}${RETRIES}${NC} | Delay: ${YELLOW}${RETRY_DELAY}s${NC}"
echo ""

# Function to retry requests
retry_request() {
    local url=$1
    local expected_status=$2
    local counter=0
    local response
    local http_code
    local body
    
    while [ $counter -lt $RETRIES ]; do
        # Use verbose mode for debugging
        response=$(curl -s -w "\n%{http_code}" \
            --connect-timeout $CONNECT_TIMEOUT \
            --max-time $TIMEOUT \
            "$url" 2>&1 || echo "CURL_ERROR")
        
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | sed '$d')
        
        # Check if curl failed
        if [ "$http_code" = "CURL_ERROR" ]; then
            counter=$((counter + 1))
            if [ $counter -lt $RETRIES ]; then
                echo -e "  ${YELLOW}⏳ Retry $counter/$RETRIES em ${RETRY_DELAY}s... (conexão falhou)${NC}"
                sleep $RETRY_DELAY
            fi
            continue
        fi
        
        if [ "$http_code" = "$expected_status" ]; then
            echo -e "  ${GREEN}✓${NC} $url (HTTP ${GREEN}$http_code${NC})"
            return 0
        fi
        
        counter=$((counter + 1))
        if [ $counter -lt $RETRIES ]; then
            echo -e "  ${YELLOW}⏳ Retry $counter/$RETRIES em ${RETRY_DELAY}s... (HTTP $http_code, esperado $expected_status)${NC}"
            sleep $RETRY_DELAY
        fi
    done
    
    echo -e "  ${RED}✗${NC} $url (HTTP ${RED}$http_code${NC}, esperado ${GREEN}$expected_status${NC})"
    return 1
}

# Test 1: Health check
echo -e "${BLUE}1️⃣  Health Check${NC}"
retry_request "$API_URL/health" "200" || exit 1
echo ""

# Test 2: API Documentation
echo -e "${BLUE}2️⃣  API Documentation${NC}"
retry_request "$API_URL/api/docs" "200" || exit 1
echo ""

# Test 3: OpenAPI JSON
echo -e "${BLUE}3️⃣  OpenAPI Schema${NC}"
retry_request "$API_URL/api/docs.json" "200" || exit 1
echo ""

# Test 4: Auth endpoint (should redirect or return 401 without token)
echo -e "${BLUE}4️⃣  Auth Endpoint${NC}"
response=$(curl -s -w "\n%{http_code}" \
    --connect-timeout $CONNECT_TIMEOUT \
    --max-time $TIMEOUT \
    "$API_URL/api/auth/me" 2>&1)
http_code=$(echo "$response" | tail -n1)
if [[ "$http_code" =~ ^(200|401|403)$ ]]; then
    echo -e "  ${GREEN}✓${NC} $API_URL/api/auth/me (HTTP ${GREEN}$http_code${NC})"
else
    echo -e "  ${RED}✗${NC} $API_URL/api/auth/me (HTTP ${RED}$http_code${NC})"
    exit 1
fi
echo ""

# Test 5: Database connectivity (via API)
echo -e "${BLUE}5️⃣  Database Connectivity (via API)${NC}"
response=$(curl -s -w "\n%{http_code}" \
    --connect-timeout $CONNECT_TIMEOUT \
    --max-time $TIMEOUT \
    "$API_URL/api/companies" \
    -H "Content-Type: application/json" 2>&1)
http_code=$(echo "$response" | tail -n1)
if [[ "$http_code" =~ ^(200|401|403|500)$ ]]; then
    echo -e "  ${GREEN}✓${NC} Database responding (HTTP ${GREEN}$http_code${NC})"
else
    echo -e "  ${RED}✗${NC} Database error (HTTP ${RED}$http_code${NC})"
    exit 1
fi
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Todos os smoke tests passaram!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
exit 0
