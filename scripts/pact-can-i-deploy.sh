#!/bin/bash

###############################################################################
# Pact Can-I-Deploy Script
# Week 15-16: Contract Testing & API Testing
#
# Checks if it's safe to deploy a version based on contract verification
#
# Usage:
#   ./scripts/pact-can-i-deploy.sh [pacticipant] [version] [environment]
#
# Examples:
#   ./scripts/pact-can-i-deploy.sh web-client 1.0.0 production
#   ./scripts/pact-can-i-deploy.sh employee-service $(git rev-parse --short HEAD) staging
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PACT_BROKER_URL="${PACT_BROKER_URL:-http://localhost:9292}"
PACT_BROKER_USERNAME="${PACT_BROKER_USERNAME:-pactbroker}"
PACT_BROKER_PASSWORD="${PACT_BROKER_PASSWORD:-pactbroker}"
PACT_BROKER_TOKEN="${PACT_BROKER_TOKEN:-}"

# Parse arguments
PACTICIPANT="${1}"
VERSION="${2:-$(git rev-parse --short HEAD)}"
ENVIRONMENT="${3:-production}"

# Show usage if no pacticipant specified
if [ -z "$PACTICIPANT" ]; then
    echo "Usage: $0 <pacticipant> [version] [environment]"
    echo ""
    echo "Examples:"
    echo "  $0 web-client 1.0.0 production"
    echo "  $0 employee-service \$(git rev-parse --short HEAD) staging"
    echo ""
    echo "Available pacticipants:"
    echo "  - web-client"
    echo "  - employee-service"
    echo "  - payroll-service"
    echo "  - leave-service"
    echo "  - attendance-service"
    exit 1
fi

echo -e "${BLUE}"
echo "════════════════════════════════════════════════════════"
echo "  Pact Can-I-Deploy Check"
echo "  Pacticipant: ${PACTICIPANT}"
echo "  Version: ${VERSION}"
echo "  Environment: ${ENVIRONMENT}"
echo "  Broker: ${PACT_BROKER_URL}"
echo "════════════════════════════════════════════════════════"
echo -e "${NC}"

# Check if pact-broker CLI is available
if ! command -v pact-broker &> /dev/null; then
    echo -e "${YELLOW}⚠${NC}  pact-broker CLI not found, installing..."
    npm install -g @pact-foundation/pact-node
fi

# Build authentication args
AUTH_ARGS=""
if [ -n "$PACT_BROKER_TOKEN" ]; then
    AUTH_ARGS="--broker-token=$PACT_BROKER_TOKEN"
elif [ -n "$PACT_BROKER_USERNAME" ] && [ -n "$PACT_BROKER_PASSWORD" ]; then
    AUTH_ARGS="--broker-username=$PACT_BROKER_USERNAME --broker-password=$PACT_BROKER_PASSWORD"
fi

# Run can-i-deploy check
echo -e "${BLUE}Checking deployment safety...${NC}"
echo ""

# For web-client (consumer), check against all providers
if [ "$PACTICIPANT" == "web-client" ]; then
    echo "Checking web-client against all providers..."

    if pact-broker can-i-deploy \
        --pacticipant="$PACTICIPANT" \
        --version="$VERSION" \
        --to-environment="$ENVIRONMENT" \
        --broker-base-url="$PACT_BROKER_URL" \
        $AUTH_ARGS \
        --retry-while-unknown=0 \
        --retry-interval=10 \
        --verbose; then

        echo ""
        echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}✓ SAFE TO DEPLOY${NC}"
        echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
        echo ""
        echo -e "${GREEN}$PACTICIPANT version $VERSION can be safely deployed to $ENVIRONMENT${NC}"
        echo ""
        echo "All provider contracts are verified and compatible."
        echo ""
        exit 0
    else
        echo ""
        echo -e "${RED}════════════════════════════════════════════════════════${NC}"
        echo -e "${RED}✗ NOT SAFE TO DEPLOY${NC}"
        echo -e "${RED}════════════════════════════════════════════════════════${NC}"
        echo ""
        echo -e "${RED}$PACTICIPANT version $VERSION cannot be deployed to $ENVIRONMENT${NC}"
        echo ""
        echo "Reasons this might fail:"
        echo "  1. Provider has not verified the contract yet"
        echo "  2. Provider verification failed"
        echo "  3. Breaking changes in the contract"
        echo "  4. Provider version not deployed to environment"
        echo ""
        echo "Next steps:"
        echo "  1. Check Pact Broker: $PACT_BROKER_URL"
        echo "  2. Run provider verification: npm run test:pact:provider"
        echo "  3. Review contract changes"
        echo ""
        exit 1
    fi

# For providers, check against all consumers
else
    echo "Checking $PACTICIPANT against all consumers..."

    if pact-broker can-i-deploy \
        --pacticipant="$PACTICIPANT" \
        --version="$VERSION" \
        --to-environment="$ENVIRONMENT" \
        --broker-base-url="$PACT_BROKER_URL" \
        $AUTH_ARGS \
        --retry-while-unknown=0 \
        --retry-interval=10 \
        --verbose; then

        echo ""
        echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}✓ SAFE TO DEPLOY${NC}"
        echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
        echo ""
        echo -e "${GREEN}$PACTICIPANT version $VERSION can be safely deployed to $ENVIRONMENT${NC}"
        echo ""
        echo "All consumer contracts are satisfied."
        echo ""
        exit 0
    else
        echo ""
        echo -e "${RED}════════════════════════════════════════════════════════${NC}"
        echo -e "${RED}✗ NOT SAFE TO DEPLOY${NC}"
        echo -e "${RED}════════════════════════════════════════════════════════${NC}"
        echo ""
        echo -e "${RED}$PACTICIPANT version $VERSION cannot be deployed to $ENVIRONMENT${NC}"
        echo ""
        echo "This provider does not satisfy all consumer contracts."
        echo ""
        echo "Next steps:"
        echo "  1. Check Pact Broker: $PACT_BROKER_URL"
        echo "  2. Review failing verifications"
        echo "  3. Update provider to meet contract requirements"
        echo "  4. Re-run provider verification"
        echo ""
        exit 1
    fi
fi
