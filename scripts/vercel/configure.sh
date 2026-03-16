#!/bin/bash

# Vercel Project Settings Configuration
# Configures build settings, deployment settings, etc.

# Always run from project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "=========================================="
echo "AeroBook - Vercel Project Configuration"
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

echo "This script will create/update vercel.json with recommended settings"
echo ""

# Check if vercel.json exists
if [ -f vercel.json ]; then
    echo "⚠️  vercel.json already exists"
    cat vercel.json
    echo ""
    read -p "Overwrite existing vercel.json? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
fi

# Create vercel.json
echo "Creating vercel.json..."
cat > vercel.json << 'EOF'
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
EOF

echo "✓ vercel.json created"
echo ""

# Show the file
echo "Contents of vercel.json:"
cat vercel.json
echo ""

# Git settings
echo "=========================================="
echo "Git Integration Settings"
echo "=========================================="
echo ""
echo "Recommended settings (configure in Vercel dashboard):"
echo ""
echo "Production Branch: main"
echo "  - Auto-deploy on push to main"
echo ""
echo "Preview Branches: All branches"
echo "  - Create preview deployments for PRs"
echo ""
echo "Build & Development Settings:"
echo "  - Framework Preset: Vite"
echo "  - Build Command: npm run build"
echo "  - Output Directory: dist"
echo "  - Install Command: npm install"
echo ""

read -p "Open Vercel dashboard to configure? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel
fi

# Add to git
echo ""
echo "=========================================="
echo "Git Configuration"
echo "=========================================="
echo ""
read -p "Add vercel.json to git? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add vercel.json
    echo "✓ Added to git (not committed yet)"
    echo ""
    echo "Commit with:"
    echo "  git commit -m 'Add Vercel configuration'"
fi

echo ""
echo "=========================================="
echo "Configuration Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review vercel.json"
echo "2. Commit changes: git commit -m 'Add Vercel config'"
echo "3. Push to trigger deployment: git push"
echo ""
echo "Configure additional settings in dashboard:"
echo "  vercel"
echo ""
