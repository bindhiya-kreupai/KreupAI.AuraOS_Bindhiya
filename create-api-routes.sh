#!/bin/bash

# Phase 2 - API Route Generation Script
# Creates all API routes for Performance, Core HR, and Onboarding modules

BASE_DIR="/Users/sabujohnbosco/KreupAI/KreupAI.AuraOS/apps/web/src/app/api"

# Function to create a standard CRUD API route
create_crud_route() {
    local module=$1
    local resource=$2
    local resource_singular=$3
    local resource_plural=$4

    mkdir -p "$BASE_DIR/$module/$resource"

    cat > "$BASE_DIR/$module/$resource/route.ts" << 'EOFTEMPLATE'
import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    // Mock data - replace with actual database queries
    const RESOURCE_PLURAL_UPPER = [];

    return NextResponse.json({ RESOURCE_PLURAL: RESOURCE_PLURAL_UPPER }, { status: 200 });
  } catch (error) {
    console.error('Error fetching RESOURCE_PLURAL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Mock create - replace with actual database insert
    const RESOURCE_SINGULAR = {
      id: `RESOURCE_SINGULAR-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      createdBy: user.userId,
    };

    return NextResponse.json({ RESOURCE_SINGULAR }, { status: 201 });
  } catch (error) {
    console.error('Error creating RESOURCE_SINGULAR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Mock update - replace with actual database update
    const RESOURCE_SINGULAR = {
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: user.userId,
    };

    return NextResponse.json({ RESOURCE_SINGULAR }, { status: 200 });
  } catch (error) {
    console.error('Error updating RESOURCE_SINGULAR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
EOFTEMPLATE

    # Replace placeholders
    sed -i '' "s/RESOURCE_PLURAL/$resource_plural/g" "$BASE_DIR/$module/$resource/route.ts"
    sed -i '' "s/RESOURCE_SINGULAR/$resource_singular/g" "$BASE_DIR/$module/$resource/route.ts"
}

echo "Creating Performance API routes..."
create_crud_route "performance" "reviews" "review" "reviews"
create_crud_route "performance" "cycles" "cycle" "cycles"
create_crud_route "performance" "goals" "goal" "goals"
create_crud_route "performance" "competencies" "competency" "competencies"
create_crud_route "performance" "development-plans" "plan" "plans"
create_crud_route "performance" "calibrations" "session" "sessions"

# Performance Analytics route
mkdir -p "$BASE_DIR/performance/analytics"
cat > "$BASE_DIR/performance/analytics/route.ts" << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const stats = {
      totalReviews: 150,
      completedReviews: 120,
      averageRating: 4.2,
      ratingDistribution: {
        1: 5,
        2: 10,
        3: 30,
        4: 50,
        5: 25,
      },
      goalAchievementRate: 85,
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
EOF

echo "Creating Core HR API routes..."
create_crud_route "core-hr" "employees" "employee" "employees"
create_crud_route "core-hr" "organization" "unit" "units"
create_crud_route "core-hr" "employment-history" "record" "history"
create_crud_route "core-hr" "documents" "document" "documents"
create_crud_route "core-hr" "document-templates" "template" "templates"
create_crud_route "core-hr" "positions" "position" "positions"
create_crud_route "core-hr" "cost-centers" "costCenter" "costCenters"
create_crud_route "core-hr" "life-events" "event" "events"
create_crud_route "core-hr" "mass-updates" "update" "updates"
create_crud_route "core-hr" "id-cards" "card" "cards"
create_crud_route "core-hr" "letters" "request" "requests"
create_crud_route "core-hr" "exits" "exit" "exits"
create_crud_route "core-hr" "anniversaries" "anniversary" "anniversaries"
create_crud_route "core-hr" "auto-numbers" "sequence" "sequences"
create_crud_route "core-hr" "probation" "record" "records"
create_crud_route "core-hr" "confirmation-letters" "letter" "letters"
create_crud_route "core-hr" "assets" "asset" "assets"
create_crud_route "core-hr" "asset-assignments" "assignment" "assignments"
create_crud_route "core-hr" "settings" "settings" "settings"

echo "Creating Onboarding API routes..."
create_crud_route "onboarding" "programs" "program" "programs"
create_crud_route "onboarding" "instances" "instance" "instances"
create_crud_route "onboarding" "tasks" "task" "tasks"
create_crud_route "onboarding" "documents" "document" "documents"
create_crud_route "onboarding" "equipment" "equipment" "equipment"
create_crud_route "onboarding" "access" "access" "access"
create_crud_route "onboarding" "training" "training" "training"
create_crud_route "onboarding" "buddies" "assignment" "assignments"
create_crud_route "onboarding" "day-plans" "plan" "plans"
create_crud_route "onboarding" "surveys" "survey" "surveys"
create_crud_route "onboarding" "feedback" "feedback" "feedback"
create_crud_route "onboarding" "pre-boarding" "package" "packages"
create_crud_route "onboarding" "analytics" "metrics" "metrics"
create_crud_route "onboarding" "settings" "settings" "settings"

echo "API routes created successfully!"
echo "Performance: 7 routes"
echo "Core HR: 19 routes"
echo "Onboarding: 14 routes"
echo "Total: 40 API routes"
