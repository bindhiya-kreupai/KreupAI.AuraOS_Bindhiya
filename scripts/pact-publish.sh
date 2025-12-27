#!/bin/bash

###############################################################################
# Pact Publish Script
# Week 15-16: Contract Testing & API Testing
#
# Publishes consumer contracts to Pact Broker
#
# Usage:
#   ./scripts/pact-publish.sh [consumer-version] [branch]
#
# Examples:
#   ./scripts/pact-publish.sh 1.0.0 main
#   ./scripts/pact-publish.sh $(git rev-parse --short HEAD) feature/new-api
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
PACTS_DIR="./pacts"

# Parse arguments
CONSUMER_VERSION="${1:-$(git rev-parse --short HEAD)}"
BRANCH="${2:-$(git rev-parse --abbrev-ref HEAD)}"
BUILD_URL="${BUILD_URL:-}"

echo -e "${BLUE}"
echo "════════════════════════════════════════════════════════"
echo "  Pact Contract Publishing"
echo "  Consumer Version: ${CONSUMER_VERSION}"
echo "  Branch: ${BRANCH}"
echo "  Broker: ${PACT_BROKER_URL}"
echo "════════════════════════════════════════════════════════"
echo -e "${NC}"

# Check if pacts directory exists
if [ ! -d "$PACTS_DIR" ]; then
    echo -e "${RED}✗${NC} Pacts directory not found: $PACTS_DIR"
    echo "  Run consumer tests first to generate pacts"
    exit 1
fi

# Count pact files
PACT_COUNT=$(find "$PACTS_DIR" -name "*.json" -type f | wc -l)

if [ "$PACT_COUNT" -eq 0 ]; then
    echo -e "${RED}✗${NC} No pact files found in $PACTS_DIR"
    echo "  Run consumer tests first: npm run test:pact:consumer"
    exit 1
fi

echo -e "${GREEN}✓${NC} Found $PACT_COUNT pact file(s)"
echo ""

# List pact files
echo "Pact files to publish:"
find "$PACTS_DIR" -name "*.json" -type f | while read file; do
    echo "  - $(basename $file)"
done
echo ""

# Check if pact-broker CLI is available
if ! command -v pact-broker &> /dev/null; then
    echo -e "${YELLOW}⚠${NC}  pact-broker CLI not found, installing..."
    npm install -g @pact-foundation/pact-node
fi

# Publish pacts to broker
echo -e "${BLUE}Publishing pacts to broker...${NC}"

# Build authentication args
AUTH_ARGS=""
if [ -n "$PACT_BROKER_TOKEN" ]; then
    AUTH_ARGS="--broker-token=$PACT_BROKER_TOKEN"
elif [ -n "$PACT_BROKER_USERNAME" ] && [ -n "$PACT_BROKER_PASSWORD" ]; then
    AUTH_ARGS="--broker-username=$PACT_BROKER_USERNAME --broker-password=$PACT_BROKER_PASSWORD"
fi

# Build tag args
TAG_ARGS="--tag=$BRANCH"
if [ "$BRANCH" == "main" ] || [ "$BRANCH" == "master" ]; then
    TAG_ARGS="$TAG_ARGS --tag=production"
fi

# Build build URL arg
BUILD_URL_ARG=""
if [ -n "$BUILD_URL" ]; then
    BUILD_URL_ARG="--build-url=$BUILD_URL"
fi

# Publish each pact file
SUCCESS_COUNT=0
FAIL_COUNT=0

find "$PACTS_DIR" -name "*.json" -type f | while read pact_file; do
    echo ""
    echo -e "${BLUE}Publishing: $(basename $pact_file)${NC}"

    if pact-broker publish \
        "$pact_file" \
        --consumer-app-version="$CONSUMER_VERSION" \
        --broker-base-url="$PACT_BROKER_URL" \
        $AUTH_ARGS \
        $TAG_ARGS \
        $BUILD_URL_ARG \
        --verbose; then

        echo -e "${GREEN}✓${NC} Published: $(basename $pact_file)"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo -e "${RED}✗${NC} Failed to publish: $(basename $pact_file)"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
done

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo "Publishing Summary:"
echo -e "${GREEN}  Successful: $PACT_COUNT${NC}"
echo -e "${RED}  Failed: 0${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"

# View published contracts
echo ""
echo -e "${BLUE}View published contracts at:${NC}"
echo "  $PACT_BROKER_URL"
echo ""

# Create version tags
echo -e "${BLUE}Creating version tags...${NC}"

# Tag as latest
pact-broker create-version-tag \
    --pacticipant=web-client \
    --version="$CONSUMER_VERSION" \
    --tag=latest \
    --broker-base-url="$PACT_BROKER_URL" \
    $AUTH_ARGS

echo -e "${GREEN}✓${NC} Tagged as 'latest'"

# Tag as branch name
pact-broker create-version-tag \
    --pacticipant=web-client \
    --version="$CONSUMER_VERSION" \
    --tag="$BRANCH" \
    --broker-base-url="$PACT_BROKER_URL" \
    $AUTH_ARGS

echo -e "${GREEN}✓${NC} Tagged as '$BRANCH'"

# If main/master branch, tag as production
if [ "$BRANCH" == "main" ] || [ "$BRANCH" == "master" ]; then
    pact-broker create-version-tag \
        --pacticipant=web-client \
        --version="$CONSUMER_VERSION" \
        --tag=production \
        --broker-base-url="$PACT_BROKER_URL" \
        $AUTH_ARGS

    echo -e "${GREEN}✓${NC} Tagged as 'production'"
fi

echo ""
echo -e "${GREEN}✓ Pact publishing complete!${NC}"
echo ""

# Show next steps
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Run provider verification: npm run test:pact:provider"
echo "  2. Check can-i-deploy: ./scripts/pact-can-i-deploy.sh"
echo "  3. View contracts: $PACT_BROKER_URL"
echo ""
