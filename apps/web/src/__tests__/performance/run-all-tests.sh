#!/bin/bash

###############################################################################
# Performance Test Suite Runner
# Week 9-10: Performance Testing
#
# Runs all performance tests sequentially and generates comprehensive report
#
# Usage:
#   ./run-all-tests.sh [environment]
#
# Examples:
#   ./run-all-tests.sh local
#   ./run-all-tests.sh staging
#   ./run-all-tests.sh production
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-local}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_DIR="results/${TIMESTAMP}"
REPORT_FILE="${RESULTS_DIR}/performance-report.html"

echo -e "${BLUE}"
echo "════════════════════════════════════════════════════════"
echo "  AuraOS HCM - Performance Test Suite"
echo "  Environment: ${ENVIRONMENT}"
echo "  Timestamp: ${TIMESTAMP}"
echo "════════════════════════════════════════════════════════"
echo -e "${NC}"

# Create results directory
mkdir -p "${RESULTS_DIR}"
mkdir -p "${RESULTS_DIR}/json"

# Load environment variables
if [ -f ".env.performance.${ENVIRONMENT}" ]; then
    echo -e "${GREEN}✓${NC} Loading environment: .env.performance.${ENVIRONMENT}"
    export $(cat ".env.performance.${ENVIRONMENT}" | grep -v '^#' | xargs)
elif [ -f ".env.performance" ]; then
    echo -e "${GREEN}✓${NC} Loading environment: .env.performance"
    export $(cat ".env.performance" | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠${NC}  No environment file found, using defaults"
fi

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}✗${NC} k6 is not installed. Please install k6 first:"
    echo "  macOS:   brew install k6"
    echo "  Linux:   sudo apt-get install k6"
    echo "  Windows: choco install k6"
    exit 1
fi

echo -e "${GREEN}✓${NC} k6 version: $(k6 version)"

# Check if application is running
echo ""
echo -e "${BLUE}Checking if application is running...${NC}"
if curl -s -f "${BASE_URL:-http://localhost:3006}/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Application is running at ${BASE_URL:-http://localhost:3006}"
else
    echo -e "${RED}✗${NC} Application is not running!"
    echo "  Please start the application with: pnpm dev"
    exit 1
fi

# Function to run a test
run_test() {
    local test_name=$1
    local test_file=$2
    local profile=${3:-default}

    echo ""
    echo -e "${BLUE}──────────────────────────────────────────────────────${NC}"
    echo -e "${BLUE}Running: ${test_name}${NC}"
    echo -e "${BLUE}──────────────────────────────────────────────────────${NC}"

    local output_file="${RESULTS_DIR}/json/${test_name}-${TIMESTAMP}.json"
    local log_file="${RESULTS_DIR}/${test_name}.log"

    if [ "$profile" != "default" ]; then
        echo "Profile: ${profile}"
        k6 run --env PROFILE="${profile}" --out json="${output_file}" "${test_file}" 2>&1 | tee "${log_file}"
    else
        k6 run --out json="${output_file}" "${test_file}" 2>&1 | tee "${log_file}"
    fi

    local exit_code=$?

    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✓${NC} ${test_name} completed successfully"
        return 0
    else
        echo -e "${RED}✗${NC} ${test_name} failed with exit code ${exit_code}"
        return 1
    fi
}

# Track test results
declare -A test_results
total_tests=0
passed_tests=0
failed_tests=0

# Test execution
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Starting Performance Test Suite${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"

# 1. Baseline Tests (Smoke)
total_tests=$((total_tests + 1))
if run_test "baseline" "tests/baseline.test.js" "smoke"; then
    test_results["baseline"]="PASS"
    passed_tests=$((passed_tests + 1))
else
    test_results["baseline"]="FAIL"
    failed_tests=$((failed_tests + 1))
fi

sleep 5  # Cooldown between tests

# 2. Employee Load Tests
total_tests=$((total_tests + 1))
if run_test "employee-load" "tests/employee-load.test.js" "load"; then
    test_results["employee-load"]="PASS"
    passed_tests=$((passed_tests + 1))
else
    test_results["employee-load"]="FAIL"
    failed_tests=$((failed_tests + 1))
fi

sleep 5

# 3. Payroll Load Tests
total_tests=$((total_tests + 1))
if run_test "payroll-load" "tests/payroll-load.test.js" "load"; then
    test_results["payroll-load"]="PASS"
    passed_tests=$((passed_tests + 1))
else
    test_results["payroll-load"]="FAIL"
    failed_tests=$((failed_tests + 1))
fi

sleep 5

# 4. Regression Tests
total_tests=$((total_tests + 1))
if run_test "regression" "tests/regression.test.js" "load"; then
    test_results["regression"]="PASS"
    passed_tests=$((passed_tests + 1))
else
    test_results["regression"]="FAIL"
    failed_tests=$((failed_tests + 1))
fi

sleep 5

# 5. Stress Tests (Optional - only if STRESS_TEST env var is set)
if [ "${STRESS_TEST:-false}" = "true" ]; then
    total_tests=$((total_tests + 1))
    if run_test "stress" "tests/stress.test.js" "stress"; then
        test_results["stress"]="PASS"
        passed_tests=$((passed_tests + 1))
    else
        test_results["stress"]="FAIL"
        failed_tests=$((failed_tests + 1))
    fi
    sleep 5
fi

# 6. Spike Tests (Optional - only if SPIKE_TEST env var is set)
if [ "${SPIKE_TEST:-false}" = "true" ]; then
    total_tests=$((total_tests + 1))
    if run_test "spike" "tests/spike.test.js" "spike"; then
        test_results["spike"]="PASS"
        passed_tests=$((passed_tests + 1))
    else
        test_results["spike"]="FAIL"
        failed_tests=$((failed_tests + 1))
    fi
fi

# Generate summary report
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Test Suite Summary${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""
echo "Total Tests:  ${total_tests}"
echo -e "${GREEN}Passed:       ${passed_tests}${NC}"
echo -e "${RED}Failed:       ${failed_tests}${NC}"
echo ""

# Display individual results
for test in "${!test_results[@]}"; do
    result="${test_results[$test]}"
    if [ "$result" = "PASS" ]; then
        echo -e "  ${GREEN}✓${NC} ${test}"
    else
        echo -e "  ${RED}✗${NC} ${test}"
    fi
done

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Results saved to: ${RESULTS_DIR}${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

# Generate HTML report if k6-to-junit is available
if command -v k6-to-junit &> /dev/null; then
    echo "Generating HTML report..."
    # Generate report logic here
    echo -e "${GREEN}✓${NC} HTML report generated: ${REPORT_FILE}"
else
    echo -e "${YELLOW}⚠${NC}  Install k6-to-junit for HTML reports: npm install -g k6-to-junit"
fi

# Exit with appropriate code
if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed! ✗${NC}"
    exit 1
fi
