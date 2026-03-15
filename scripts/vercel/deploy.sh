#!/bin/bash

# Vercel Deploy Script
# Triggers deployment with options

echo "=========================================="
echo "WingTime - Vercel Deploy"
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

echo "Current project:"
cat .vercel/project.json 2>/dev/null | grep "projectId" | head -1
echo ""

# Deployment options
echo "Deployment Options:"
echo "1. Production (live deployment)"
echo "2. Preview (test deployment)"
echo "3. Development (local test)"
echo ""

read -p "Select deployment type (1-3): " deploy_type
echo ""

case $deploy_type in
    1)
        echo "Deploying to PRODUCTION..."
        echo ""
        read -p "This will update your live site. Continue? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            vercel --prod
        else
            echo "Cancelled."
            exit 0
        fi
        ;;
    2)
        echo "Creating PREVIEW deployment..."
        echo ""
        vercel
        ;;
    3)
        echo "Starting DEVELOPMENT server..."
        echo ""
        vercel dev
        ;;
    *)
        echo "Invalid option."
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Useful commands:"
echo "  vercel inspect          - View deployment details"
echo "  vercel logs            - View deployment logs"
echo "  vercel ls              - List all deployments"
echo "  vercel rollback        - Rollback to previous deployment"
echo ""
