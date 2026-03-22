#!/bin/bash

# Vercel Environment Variables Setup Script
# Sets up all environment variables for AeroBook web app

# Always run from project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "=========================================="
echo "AeroBook - Vercel Setup"
echo "=========================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo ""
    echo "Install it with: npm install -g vercel"
    echo "Or visit: https://vercel.com/docs/cli"
    exit 1
fi

echo "✓ Vercel CLI is ready"
echo ""

# Check if in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository."
    echo "Please run this from your aerobook-web directory."
    exit 1
fi

# Check if already linked
if [ ! -f .vercel/project.json ]; then
    echo "⚠️  Project not linked to Vercel."
    echo ""
    read -p "Would you like to link to Vercel now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        vercel link
    else
        echo "Please run 'vercel link' first, then run this script again."
        exit 1
    fi
fi

echo "Current Vercel project:"
vercel project ls 2>/dev/null || echo "Linked to Vercel"
echo ""

# Get API URL from env files
echo "=========================================="
echo "Backend API Configuration"
echo "=========================================="
echo ""

# Resolve paths: .env.production (in project root) has the deployed URL,
# .env.local (in project root) has the local dev URL — check .env.production first.
ENV_PROD="$PROJECT_ROOT/.env.production"
# Resolve paths: .env.production (in project root) has the deployed URL,
# .env.local (in project root) has the local dev URL — check .env.production first.
ENV_PROD="$PROJECT_ROOT/.env.production"
ENV_LOCAL="$PROJECT_ROOT/.env.local"

api_url=""
env_source=""

# Prefer .env.production (Vercel-pulled, has production URL)
if [ -f "$ENV_PROD" ]; then
    api_url=$(grep -E '^VITE_API_URL=' "$ENV_PROD" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'")
    [ -n "$api_url" ] && env_source="$ENV_PROD"
fi

# Fall back to project root .env.local (has local dev URL)
if [ -z "$api_url" ] && [ -f "$ENV_LOCAL" ]; then
# Prefer .env.production (Vercel-pulled, has production URL)
if [ -f "$ENV_PROD" ]; then
    api_url=$(grep -E '^VITE_API_URL=' "$ENV_PROD" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'")
    [ -n "$api_url" ] && env_source="$ENV_PROD"
fi

# Fall back to project root .env.local (has local dev URL)
if [ -z "$api_url" ] && [ -f "$ENV_LOCAL" ]; then
    api_url=$(grep -E '^VITE_API_URL=' "$ENV_LOCAL" | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'")
    [ -n "$api_url" ] && env_source="$ENV_LOCAL"
fi

if [ -z "$api_url" ]; then
    echo "⚠️  VITE_API_URL not found in $ENV_PROD or $ENV_LOCAL"
    echo "⚠️  VITE_API_URL not found in $ENV_PROD or $ENV_LOCAL"
    echo ""
    echo "Enter your Railway API URL"
    echo "Example: https://aerobook-api-production.up.railway.app"
    echo ""
    read -p "API URL: " api_url
    echo ""
else
    echo "Read from $env_source:"
    echo "  VITE_API_URL=$api_url"
    echo ""
fi

# Validate URL
if [[ ! $api_url =~ ^https?:// ]]; then
    echo "❌ Invalid URL. Must start with http:// or https://"
    exit 1
fi

# Confirm settings
echo "=========================================="
echo "Configuration Summary"
echo "=========================================="
echo "VITE_API_URL: $api_url"
echo ""
echo "These variables will be set for:"
echo "  - Production"
echo "  - Preview"
echo "  - Development"
echo ""

read -p "Is this correct? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

# Set environment variables
echo ""
echo "Setting Vercel environment variables..."
echo ""

# Remove existing VITE_API_URL if present (suppress errors if not set)
echo "Removing existing VITE_API_URL (if any)..."
vercel env rm VITE_API_URL production -y 2>/dev/null
vercel env rm VITE_API_URL preview -y 2>/dev/null
vercel env rm VITE_API_URL development -y 2>/dev/null
echo ""

# Production
echo "Setting for Production..."
printf '%s' "$api_url" | vercel env add VITE_API_URL production

# Preview
echo "Setting for Preview..."
printf '%s' "$api_url" | vercel env add VITE_API_URL preview

# Development (optional - usually uses localhost)
read -p "Set for Development environment too? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Setting for Development..."
    printf '%s' "$api_url" | vercel env add VITE_API_URL development
else
    echo "Skipping Development (will use local .env.local)"
fi

echo ""
echo "✓ Environment variables set successfully!"
echo ""

# Pull variables to local
echo "=========================================="
echo "Pull Variables to Local Repo .env.production"
echo "Pull Variables to Local Repo .env.production"
echo "=========================================="
echo ""
read -p "Download variables to local .env.production file? (y/n) " -n 1 -r
read -p "Download variables to local .env.production file? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel env pull .env.production
    echo "✓ Variables downloaded to .env.production"
    vercel env pull .env.production
    echo "✓ Variables downloaded to .env.production"
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Trigger a redeploy: vercel --prod"
echo "2. Or push to GitHub (auto-deploys)"
echo "3. Check deployment: vercel inspect"
echo ""
echo "To view all variables:"
echo "  vercel env ls"
echo ""
echo "To update a variable:"
echo "  vercel env rm VARIABLE_NAME"
echo "  vercel env add VARIABLE_NAME"
echo ""
