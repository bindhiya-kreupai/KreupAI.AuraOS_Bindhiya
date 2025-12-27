#!/bin/bash

###############################################################################
# Dependency Security Scanning Script
# Week 11-12: Security Testing
#
# Runs comprehensive dependency security scanning using:
# - npm audit (built-in)
# - pnpm audit (workspace-aware)
# - Snyk (if configured)
# - retire.js (JavaScript library scanner)
#
# Usage:
#   ./dependency-scan.sh [--fix] [--production]
#
# Options:
#   --fix         Automatically fix vulnerabilities where possible
#   --production  Only scan production dependencies
#   --json        Output results in JSON format
#   --fail-on     Fail on severity level (low|moderate|high|critical)
#
# Examples:
#   ./dependency-scan.sh
#   ./dependency-scan.sh --fix
#   ./dependency-scan.sh --production --fail-on high
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
FIX_MODE=false
PRODUCTION_ONLY=false
JSON_OUTPUT=false
FAIL_ON_SEVERITY=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --fix)
            FIX_MODE=true
            shift
            ;;
        --production)
            PRODUCTION_ONLY=true
            shift
            ;;
        --json)
            JSON_OUTPUT=true
            shift
            ;;
        --fail-on)
            FAIL_ON_SEVERITY="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORTS_DIR="reports/dependency-scan/${TIMESTAMP}"
mkdir -p "${REPORTS_DIR}"

echo -e "${BLUE}"
echo "════════════════════════════════════════════════════════"
echo "  Dependency Security Scan"
echo "  Timestamp: ${TIMESTAMP}"
echo "  Fix Mode: ${FIX_MODE}"
echo "  Production Only: ${PRODUCTION_ONLY}"
echo "════════════════════════════════════════════════════════"
echo -e "${NC}"

# Track overall status
TOTAL_VULNERABILITIES=0
CRITICAL_COUNT=0
HIGH_COUNT=0
MODERATE_COUNT=0
LOW_COUNT=0
SCAN_FAILED=false

##############################################################################
# 1. NPM Audit
##############################################################################
echo ""
echo -e "${BLUE}──────────────────────────────────────────────────────${NC}"
echo -e "${BLUE}Running npm audit...${NC}"
echo -e "${BLUE}──────────────────────────────────────────────────────${NC}"

if command -v npm &> /dev/null; then
    NPM_AUDIT_ARGS="audit"

    if [ "$JSON_OUTPUT" = true ]; then
        NPM_AUDIT_ARGS="$NPM_AUDIT_ARGS --json"
    fi

    if [ "$PRODUCTION_ONLY" = true ]; then
        NPM_AUDIT_ARGS="$NPM_AUDIT_ARGS --production"
    fi

    if [ "$FIX_MODE" = true ]; then
        echo "Running npm audit fix..."
        npm audit fix --force || true
    fi

    # Run audit and save results
    npm ${NPM_AUDIT_ARGS} > "${REPORTS_DIR}/npm-audit.json" 2>&1 || true

    # Parse results
    if [ -f "${REPORTS_DIR}/npm-audit.json" ]; then
        if command -v jq &> /dev/null; then
            # Extract vulnerability counts
            NPM_CRITICAL=$(jq '.metadata.vulnerabilities.critical // 0' "${REPORTS_DIR}/npm-audit.json" 2>/dev/null || echo 0)
            NPM_HIGH=$(jq '.metadata.vulnerabilities.high // 0' "${REPORTS_DIR}/npm-audit.json" 2>/dev/null || echo 0)
            NPM_MODERATE=$(jq '.metadata.vulnerabilities.moderate // 0' "${REPORTS_DIR}/npm-audit.json" 2>/dev/null || echo 0)
            NPM_LOW=$(jq '.metadata.vulnerabilities.low // 0' "${REPORTS_DIR}/npm-audit.json" 2>/dev/null || echo 0)

            CRITICAL_COUNT=$((CRITICAL_COUNT + NPM_CRITICAL))
            HIGH_COUNT=$((HIGH_COUNT + NPM_HIGH))
            MODERATE_COUNT=$((MODERATE_COUNT + NPM_MODERATE))
            LOW_COUNT=$((LOW_COUNT + NPM_LOW))

            echo -e "${GREEN}✓${NC} npm audit completed"
            echo "  Critical:  $NPM_CRITICAL"
            echo "  High:      $NPM_HIGH"
            echo "  Moderate:  $NPM_MODERATE"
            echo "  Low:       $NPM_LOW"
        else
            echo -e "${YELLOW}⚠${NC}  jq not installed, cannot parse npm audit results"
        fi
    fi
else
    echo -e "${YELLOW}⚠${NC}  npm not found, skipping npm audit"
fi

##############################################################################
# 2. PNPM Audit (Workspace-aware)
##############################################################################
echo ""
echo -e "${BLUE}──────────────────────────────────────────────────────${NC}"
echo -e "${BLUE}Running pnpm audit...${NC}"
echo -e "${BLUE}──────────────────────────────────────────────────────${NC}"

if command -v pnpm &> /dev/null; then
    PNPM_AUDIT_ARGS="audit"

    if [ "$JSON_OUTPUT" = true ]; then
        PNPM_AUDIT_ARGS="$PNPM_AUDIT_ARGS --json"
    fi

    if [ "$PRODUCTION_ONLY" = true ]; then
        PNPM_AUDIT_ARGS="$PNPM_AUDIT_ARGS --prod"
    fi

    if [ "$FIX_MODE" = true ]; then
        echo "Running pnpm audit fix..."
        pnpm audit --fix || true
    fi

    # Run audit and save results
    pnpm ${PNPM_AUDIT_ARGS} > "${REPORTS_DIR}/pnpm-audit.json" 2>&1 || true

    echo -e "${GREEN}✓${NC} pnpm audit completed"

    # Display summary
    if [ -f "${REPORTS_DIR}/pnpm-audit.json" ]; then
        cat "${REPORTS_DIR}/pnpm-audit.json"
    fi
else
    echo -e "${YELLOW}⚠${NC}  pnpm not found, skipping pnpm audit"
fi

##############################################################################
# 3. Snyk Security Scan
##############################################################################
echo ""
echo -e "${BLUE}──────────────────────────────────────────────────────${NC}"
echo -e "${BLUE}Running Snyk security scan...${NC}"
echo -e "${BLUE}──────────────────────────────────────────────────────${NC}"

if command -v snyk &> /dev/null; then
    # Check if Snyk is authenticated
    if snyk auth check &> /dev/null; then
        SNYK_ARGS="test"

        if [ "$JSON_OUTPUT" = true ]; then
            SNYK_ARGS="$SNYK_ARGS --json"
        fi

        if [ "$PRODUCTION_ONLY" = true ]; then
            SNYK_ARGS="$SNYK_ARGS --prune-repeated-subdependencies"
        fi

        if [ "$FAIL_ON_SEVERITY" != "" ]; then
            SNYK_ARGS="$SNYK_ARGS --severity-threshold=${FAIL_ON_SEVERITY}"
        fi

        # Run Snyk test
        snyk ${SNYK_ARGS} > "${REPORTS_DIR}/snyk-test.json" 2>&1 || true

        # Run Snyk code (SAST)
        snyk code test --json > "${REPORTS_DIR}/snyk-code.json" 2>&1 || true

        echo -e "${GREEN}✓${NC} Snyk scan completed"

        # Display summary if JSON output
        if [ -f "${REPORTS_DIR}/snyk-test.json" ]; then
            if command -v jq &> /dev/null; then
                SNYK_VULNS=$(jq '.vulnerabilities | length' "${REPORTS_DIR}/snyk-test.json" 2>/dev/null || echo 0)
                echo "  Vulnerabilities found: $SNYK_VULNS"
            fi
        fi
    else
        echo -e "${YELLOW}⚠${NC}  Snyk not authenticated. Run: snyk auth"
        echo "  Skipping Snyk scan"
    fi
else
    echo -e "${YELLOW}⚠${NC}  Snyk not installed. Install with: npm install -g snyk"
    echo "  Skipping Snyk scan"
fi

##############################################################################
# 4. Retire.js - JavaScript Library Scanner
##############################################################################
echo ""
echo -e "${BLUE}──────────────────────────────────────────────────────${NC}"
echo -e "${BLUE}Running retire.js scan...${NC}"
echo -e "${BLUE}──────────────────────────────────────────────────────${NC}"

if command -v retire &> /dev/null; then
    # Scan for vulnerable JavaScript libraries
    retire --path . --outputformat json --outputpath "${REPORTS_DIR}/retire-scan.json" || true

    echo -e "${GREEN}✓${NC} retire.js scan completed"

    if [ -f "${REPORTS_DIR}/retire-scan.json" ]; then
        echo "  Results saved to: ${REPORTS_DIR}/retire-scan.json"
    fi
else
    echo -e "${YELLOW}⚠${NC}  retire.js not installed. Install with: npm install -g retire"
    echo "  Skipping retire.js scan"
fi

##############################################################################
# 5. License Compliance Check
##############################################################################
echo ""
echo -e "${BLUE}──────────────────────────────────────────────────────${NC}"
echo -e "${BLUE}Running license compliance check...${NC}"
echo -e "${BLUE}──────────────────────────────────────────────────────${NC}"

if command -v license-checker &> /dev/null; then
    license-checker --json > "${REPORTS_DIR}/licenses.json" 2>&1 || true

    echo -e "${GREEN}✓${NC} License check completed"

    # Check for problematic licenses
    if command -v jq &> /dev/null && [ -f "${REPORTS_DIR}/licenses.json" ]; then
        PROBLEMATIC_LICENSES=("GPL" "AGPL" "LGPL" "SSPL")

        for license in "${PROBLEMATIC_LICENSES[@]}"; do
            COUNT=$(jq -r 'to_entries[] | select(.value.licenses | contains("'$license'")) | .key' "${REPORTS_DIR}/licenses.json" 2>/dev/null | wc -l)
            if [ "$COUNT" -gt 0 ]; then
                echo -e "  ${YELLOW}⚠${NC}  Found $COUNT packages with $license license"
            fi
        done
    fi
else
    echo -e "${YELLOW}⚠${NC}  license-checker not installed. Install with: npm install -g license-checker"
fi

##############################################################################
# 6. Generate Summary Report
##############################################################################
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Security Scan Summary${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

# Calculate total
TOTAL_VULNERABILITIES=$((CRITICAL_COUNT + HIGH_COUNT + MODERATE_COUNT + LOW_COUNT))

echo "Total Vulnerabilities: $TOTAL_VULNERABILITIES"
echo ""

if [ $CRITICAL_COUNT -gt 0 ]; then
    echo -e "${RED}Critical:  $CRITICAL_COUNT${NC}"
else
    echo -e "${GREEN}Critical:  0${NC}"
fi

if [ $HIGH_COUNT -gt 0 ]; then
    echo -e "${YELLOW}High:      $HIGH_COUNT${NC}"
else
    echo -e "${GREEN}High:      0${NC}"
fi

echo "Moderate:  $MODERATE_COUNT"
echo "Low:       $LOW_COUNT"

echo ""
echo "Reports saved to: ${REPORTS_DIR}"
echo ""

# List generated reports
echo "Generated Reports:"
for report in "${REPORTS_DIR}"/*; do
    if [ -f "$report" ]; then
        echo "  - $(basename "$report")"
    fi
done

##############################################################################
# 7. Determine Exit Code
##############################################################################
echo ""

# Check against fail-on threshold
if [ "$FAIL_ON_SEVERITY" != "" ]; then
    SHOULD_FAIL=false

    case $FAIL_ON_SEVERITY in
        low)
            if [ $TOTAL_VULNERABILITIES -gt 0 ]; then
                SHOULD_FAIL=true
            fi
            ;;
        moderate)
            if [ $MODERATE_COUNT -gt 0 ] || [ $HIGH_COUNT -gt 0 ] || [ $CRITICAL_COUNT -gt 0 ]; then
                SHOULD_FAIL=true
            fi
            ;;
        high)
            if [ $HIGH_COUNT -gt 0 ] || [ $CRITICAL_COUNT -gt 0 ]; then
                SHOULD_FAIL=true
            fi
            ;;
        critical)
            if [ $CRITICAL_COUNT -gt 0 ]; then
                SHOULD_FAIL=true
            fi
            ;;
    esac

    if [ "$SHOULD_FAIL" = true ]; then
        echo -e "${RED}✗ Build failed: Found vulnerabilities at or above '$FAIL_ON_SEVERITY' severity${NC}"
        exit 1
    fi
fi

# Default: fail on critical
if [ $CRITICAL_COUNT -gt 0 ]; then
    echo -e "${RED}✗ Critical vulnerabilities found! Please fix immediately.${NC}"
    exit 1
elif [ $HIGH_COUNT -gt 0 ]; then
    echo -e "${YELLOW}⚠ High severity vulnerabilities found. Please review.${NC}"
    exit 0
else
    echo -e "${GREEN}✓ No critical or high severity vulnerabilities found!${NC}"
    exit 0
fi
