#!/bin/bash

###############################################################################
# OWASP ZAP Security Scan Runner
# Week 11-12: Security Testing
#
# Runs OWASP ZAP automated security scanning against AuraOS HCM Platform
#
# Usage:
#   ./run-zap-scan.sh [scan-type] [target-url]
#
# Scan Types:
#   baseline  - Quick baseline scan (passive only, ~5 minutes)
#   full      - Full active scan (~30 minutes)
#   api       - API-focused scan (~15 minutes)
#
# Examples:
#   ./run-zap-scan.sh baseline http://localhost:3006
#   ./run-zap-scan.sh full http://localhost:3006
#   ./run-zap-scan.sh api http://localhost:3006/api/v1
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCAN_TYPE=${1:-baseline}
TARGET_URL=${2:-http://localhost:3006}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORTS_DIR="reports/${TIMESTAMP}"
DOCKER_IMAGE="owasp/zap2docker-stable"

echo -e "${BLUE}"
echo "════════════════════════════════════════════════════════"
echo "  OWASP ZAP Security Scan"
echo "  Scan Type: ${SCAN_TYPE}"
echo "  Target: ${TARGET_URL}"
echo "  Timestamp: ${TIMESTAMP}"
echo "════════════════════════════════════════════════════════"
echo -e "${NC}"

# Create reports directory
mkdir -p "${REPORTS_DIR}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗${NC} Docker is not running. Please start Docker first."
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker is running"

# Pull latest ZAP image
echo ""
echo -e "${BLUE}Pulling latest OWASP ZAP Docker image...${NC}"
docker pull ${DOCKER_IMAGE}

# Check if target is accessible
echo ""
echo -e "${BLUE}Checking if target is accessible...${NC}"
if curl -s -f "${TARGET_URL}/api/health" > /dev/null 2>&1 || curl -s -f "${TARGET_URL}" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Target is accessible: ${TARGET_URL}"
else
    echo -e "${RED}✗${NC} Target is not accessible!"
    echo "  Please ensure the application is running."
    exit 1
fi

# Run scan based on type
case ${SCAN_TYPE} in
    baseline)
        echo ""
        echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
        echo -e "${BLUE}Running Baseline Scan (Passive Only)${NC}"
        echo -e "${BLUE}Duration: ~5 minutes${NC}"
        echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
        echo ""

        docker run -v $(pwd):/zap/wrk/:rw -t ${DOCKER_IMAGE} \
            zap-baseline.py \
            -t "${TARGET_URL}" \
            -r "${REPORTS_DIR}/baseline-report.html" \
            -J "${REPORTS_DIR}/baseline-report.json" \
            -w "${REPORTS_DIR}/baseline-report.md" \
            -d \
            -c baseline-scan.conf \
            -I

        echo -e "${GREEN}✓${NC} Baseline scan completed"
        ;;

    full)
        echo ""
        echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
        echo -e "${BLUE}Running Full Active Scan${NC}"
        echo -e "${BLUE}Duration: ~30 minutes${NC}"
        echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
        echo ""

        # Use automation framework for full scan
        docker run -v $(pwd):/zap/wrk/:rw -t ${DOCKER_IMAGE} \
            zap-full-scan.py \
            -t "${TARGET_URL}" \
            -r "${REPORTS_DIR}/full-report.html" \
            -J "${REPORTS_DIR}/full-report.json" \
            -w "${REPORTS_DIR}/full-report.md" \
            -d \
            -m 30 \
            -T 60 \
            -I

        echo -e "${GREEN}✓${NC} Full scan completed"
        ;;

    api)
        echo ""
        echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
        echo -e "${BLUE}Running API Scan${NC}"
        echo -e "${BLUE}Duration: ~15 minutes${NC}"
        echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
        echo ""

        docker run -v $(pwd):/zap/wrk/:rw -t ${DOCKER_IMAGE} \
            zap-api-scan.py \
            -t "${TARGET_URL}" \
            -f openapi \
            -r "${REPORTS_DIR}/api-report.html" \
            -J "${REPORTS_DIR}/api-report.json" \
            -w "${REPORTS_DIR}/api-report.md" \
            -d \
            -T 60 \
            -I

        echo -e "${GREEN}✓${NC} API scan completed"
        ;;

    automation)
        echo ""
        echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
        echo -e "${BLUE}Running Automation Framework Scan${NC}"
        echo -e "${BLUE}Using zap-config.yaml${NC}"
        echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
        echo ""

        docker run -v $(pwd):/zap/wrk/:rw -t ${DOCKER_IMAGE} \
            zap.sh -cmd \
            -autorun /zap/wrk/zap-config.yaml

        echo -e "${GREEN}✓${NC} Automation scan completed"
        ;;

    *)
        echo -e "${RED}✗${NC} Invalid scan type: ${SCAN_TYPE}"
        echo "  Valid types: baseline, full, api, automation"
        exit 1
        ;;
esac

# Generate summary
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Scan Summary${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""
echo "Scan Type:    ${SCAN_TYPE}"
echo "Target:       ${TARGET_URL}"
echo "Reports Dir:  ${REPORTS_DIR}"
echo ""
echo "Generated Reports:"

if [ -f "${REPORTS_DIR}/${SCAN_TYPE}-report.html" ]; then
    echo -e "  ${GREEN}✓${NC} HTML Report: ${REPORTS_DIR}/${SCAN_TYPE}-report.html"
fi

if [ -f "${REPORTS_DIR}/${SCAN_TYPE}-report.json" ]; then
    echo -e "  ${GREEN}✓${NC} JSON Report: ${REPORTS_DIR}/${SCAN_TYPE}-report.json"
fi

if [ -f "${REPORTS_DIR}/${SCAN_TYPE}-report.md" ]; then
    echo -e "  ${GREEN}✓${NC} Markdown Report: ${REPORTS_DIR}/${SCAN_TYPE}-report.md"
fi

# Parse JSON report if available and show summary
if [ -f "${REPORTS_DIR}/${SCAN_TYPE}-report.json" ]; then
    echo ""
    echo "Alert Summary:"

    # Extract alert counts by risk level
    high=$(grep -o '"risk":"High"' "${REPORTS_DIR}/${SCAN_TYPE}-report.json" | wc -l | tr -d ' ')
    medium=$(grep -o '"risk":"Medium"' "${REPORTS_DIR}/${SCAN_TYPE}-report.json" | wc -l | tr -d ' ')
    low=$(grep -o '"risk":"Low"' "${REPORTS_DIR}/${SCAN_TYPE}-report.json" | wc -l | tr -d ' ')
    info=$(grep -o '"risk":"Informational"' "${REPORTS_DIR}/${SCAN_TYPE}-report.json" | wc -l | tr -d ' ')

    if [ "$high" -gt 0 ]; then
        echo -e "  ${RED}High:          ${high}${NC}"
    else
        echo -e "  ${GREEN}High:          0${NC}"
    fi

    if [ "$medium" -gt 0 ]; then
        echo -e "  ${YELLOW}Medium:        ${medium}${NC}"
    else
        echo -e "  ${GREEN}Medium:        0${NC}"
    fi

    echo "  Low:           ${low}"
    echo "  Informational: ${info}"

    # Determine exit code based on findings
    if [ "$high" -gt 0 ]; then
        echo ""
        echo -e "${RED}✗ Security scan found HIGH risk vulnerabilities!${NC}"
        echo "  Please review the report and fix critical issues."
        exit 1
    elif [ "$medium" -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}⚠ Security scan found MEDIUM risk vulnerabilities${NC}"
        echo "  Please review the report."
        exit 0
    else
        echo ""
        echo -e "${GREEN}✓ No high or medium risk vulnerabilities found!${NC}"
        exit 0
    fi
else
    echo ""
    echo -e "${YELLOW}⚠${NC} Could not parse JSON report for summary"
    exit 0
fi
