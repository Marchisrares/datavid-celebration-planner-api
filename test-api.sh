#!/bin/bash

# Celebration Planner API - Comprehensive Test Suite
# This script tests all API endpoints according to the review criteria

API_URL="http://localhost:3000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "============================================"
echo "Celebration Planner API - Test Suite"
echo "============================================"
echo ""

# Counter for test results
PASSED=0
FAILED=0

# Helper function to run tests
test_endpoint() {
  local test_name="$1"
  local method="$2"
  local endpoint="$3"
  local data="$4"
  local expected_status="$5"

  echo -e "${BLUE}TEST: $test_name${NC}"

  if [ "$method" == "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint")
  elif [ "$method" == "POST" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  elif [ "$method" == "PUT" ]; then
    response=$(curl -s -w "\n%{http_code}" -X PUT "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  elif [ "$method" == "DELETE" ]; then
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL$endpoint")
  fi

  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$status_code" == "$expected_status" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (Status: $status_code)"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAILED${NC} (Expected: $expected_status, Got: $status_code)"
    ((FAILED++))
  fi

  # Pretty print JSON response (first 200 chars)
  echo "$body" | head -c 200
  echo ""
  echo "---"
  echo ""
}

echo "=== 1. VALIDATION TESTS ==="
echo ""

# Test 1.1: Create member under 18 (should fail)
test_endpoint \
  "1.1 Create member under 18 years old (should fail)" \
  "POST" \
  "/members" \
  '{
    "firstName": "Young",
    "lastName": "Person",
    "birthDate": "2010-01-01",
    "country": "USA",
    "city": "New York",
    "tz": "America/New_York",
    "email": "young@test.com"
  }' \
  "400"

# Test 1.2: Create valid member
test_endpoint \
  "1.2 Create valid member (18+ years old)" \
  "POST" \
  "/members" \
  '{
    "firstName": "John",
    "lastName": "Smith",
    "birthDate": "1990-06-15",
    "country": "USA",
    "city": "Boston",
    "tz": "America/New_York",
    "email": "john.smith@test.com"
  }' \
  "201"

# Test 1.3: Create duplicate member (should fail)
test_endpoint \
  "1.3 Create duplicate member (same name+city+country)" \
  "POST" \
  "/members" \
  '{
    "firstName": "John",
    "lastName": "Smith",
    "birthDate": "1990-06-15",
    "country": "USA",
    "city": "Boston",
    "tz": "America/New_York",
    "email": "different@test.com"
  }' \
  "409"

# Test 1.4: Missing required fields
test_endpoint \
  "1.4 Create member with missing fields (should fail)" \
  "POST" \
  "/members" \
  '{
    "firstName": "Jane",
    "email": "jane@test.com"
  }' \
  "400"

# Test 1.5: Invalid email format
test_endpoint \
  "1.5 Create member with invalid email (should fail)" \
  "POST" \
  "/members" \
  '{
    "firstName": "Invalid",
    "lastName": "Email",
    "birthDate": "1990-01-01",
    "country": "USA",
    "city": "Boston",
    "tz": "America/New_York",
    "email": "not-an-email"
  }' \
  "400"

echo ""
echo "=== 2. MEMBER CRUD TESTS ==="
echo ""

# Test 2.1: Get all members
test_endpoint \
  "2.1 Get all members" \
  "GET" \
  "/members" \
  "" \
  "200"

# Test 2.2: Get all members sorted by created date
test_endpoint \
  "2.2 Get members sorted by created date" \
  "GET" \
  "/members?sort=created" \
  "" \
  "200"

# Test 2.3: Get all members sorted by upcoming birthday
test_endpoint \
  "2.3 Get members sorted by upcoming birthday" \
  "GET" \
  "/members?sort=upcoming" \
  "" \
  "200"

# Test 2.4: Get member by ID (assuming ID 1 exists)
test_endpoint \
  "2.4 Get member by ID" \
  "GET" \
  "/members/1" \
  "" \
  "200"

# Test 2.5: Get non-existent member
test_endpoint \
  "2.5 Get non-existent member (should fail)" \
  "GET" \
  "/members/99999" \
  "" \
  "404"

# Test 2.6: Update member
test_endpoint \
  "2.6 Update existing member" \
  "PUT" \
  "/members/1" \
  '{
    "firstName": "Luca",
    "lastName": "Rossi",
    "birthDate": "1990-01-15",
    "country": "Romania",
    "city": "Bucharest",
    "tz": "Europe/Bucharest",
    "email": "luca.rossi@datavid.test"
  }' \
  "200"

echo ""
echo "=== 3. BIRTHDAY TESTS ==="
echo ""

# Test 3.1: Get today's birthdays
test_endpoint \
  "3.1 Get birthdays happening today" \
  "GET" \
  "/birthdays/today" \
  "" \
  "200"

# Test 3.2: Get upcoming birthdays (default 30 days)
test_endpoint \
  "3.2 Get upcoming birthdays in next 30 days" \
  "GET" \
  "/birthdays/upcoming?days=30" \
  "" \
  "200"

# Test 3.3: Get upcoming birthdays (60 days)
test_endpoint \
  "3.3 Get upcoming birthdays in next 60 days" \
  "GET" \
  "/birthdays/upcoming?days=60" \
  "" \
  "200"

# Test 3.4: Get upcoming birthdays (7 days)
test_endpoint \
  "3.4 Get upcoming birthdays in next 7 days" \
  "GET" \
  "/birthdays/upcoming?days=7" \
  "" \
  "200"

echo ""
echo "=== 4. AI MESSAGE TESTS ==="
echo ""

# Test 4.1: Generate friendly AI message
test_endpoint \
  "4.1 Generate friendly birthday message" \
  "POST" \
  "/ai/message" \
  '{
    "memberId": 1,
    "tone": "friendly"
  }' \
  "200"

# Test 4.2: Generate formal AI message
test_endpoint \
  "4.2 Generate formal birthday message" \
  "POST" \
  "/ai/message" \
  '{
    "memberId": 1,
    "tone": "formal"
  }' \
  "200"

# Test 4.3: Generate AI message with email dry-run
test_endpoint \
  "4.3 Generate message with email dry-run" \
  "POST" \
  "/ai/message" \
  '{
    "memberId": 1,
    "tone": "friendly",
    "sendEmail": true,
    "dryRunEmail": true
  }' \
  "200"

# Test 4.4: Generate AI message for non-existent member
test_endpoint \
  "4.4 Generate message for non-existent member (should fail)" \
  "POST" \
  "/ai/message" \
  '{
    "memberId": 99999,
    "tone": "friendly"
  }' \
  "404"

# Test 4.5: AI message with different member (to test locale detection)
test_endpoint \
  "4.5 Generate message for member 2 (different locale)" \
  "POST" \
  "/ai/message" \
  '{
    "memberId": 2,
    "tone": "friendly"
  }' \
  "200"

echo ""
echo "=== 5. ERROR HANDLING TESTS ==="
echo ""

# Test 5.1: Invalid ID format
test_endpoint \
  "5.1 Get member with invalid ID format" \
  "GET" \
  "/members/abc" \
  "" \
  "400"

# Test 5.2: Invalid JSON
test_endpoint \
  "5.2 Create member with invalid JSON (should fail)" \
  "POST" \
  "/members" \
  '{invalid json}' \
  "400"

echo ""
echo "============================================"
echo "TEST SUMMARY"
echo "============================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
fi
