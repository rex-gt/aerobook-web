#!/bin/bash

# Vercel Variables Viewer
# Quick script to view all environment variables on Vercel

echo "=========================================="
echo "Vercel Environment Variables"
echo "=========================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    exit 1
fi

# Check if linked
if [ ! -f .vercel/project.json ]; then
    echo "❌ Not linked to a Vercel project."
    echo "Run: vercel link"
    exit 1
fi

echo "Project Info:"
if [ -f .vercel/project.json ]; then
    cat .vercel/project.json | grep -E "projectId|orgId" | head -2
fi
echo ""

echo "=========================================="
echo "All Environment Variables"
echo "=========================================="
echo ""
vercel env ls
echo ""

echo "=========================================="
echo "Production Variables"
echo "=========================================="
echo ""
vercel env ls production 2>/dev/null || echo "No production variables"
echo ""

echo "=========================================="
echo "Preview Variables"
echo "=========================================="
echo ""
vercel env ls preview 2>/dev/null || echo "No preview variables"
echo ""

echo "=========================================="
echo "Development Variables"
echo "=========================================="
echo ""
vercel env ls development 2>/dev/null || echo "No development variables"
echo ""

echo "=========================================="
echo "Pull Variables to Local .env"
echo "=========================================="
echo ""
read -p "Download variables to .env.local? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel env pull .env.local
    echo "✓ Variables saved to .env.local"
    echo ""
    echo "Contents:"
    cat .env.local
fi

echo ""
