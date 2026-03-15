#!/bin/bash

# Vercel Logs Viewer
# View deployment and runtime logs

echo "=========================================="
echo "WingTime - Vercel Logs"
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

echo "Log Options:"
echo "1. Latest deployment logs"
echo "2. Production deployment logs"
echo "3. Live logs (follow mode)"
echo "4. Build logs only"
echo "5. Runtime logs only"
echo ""

read -p "Select log type (1-5): " log_type
echo ""

case $log_type in
    1)
        echo "Fetching latest deployment logs..."
        echo ""
        vercel logs
        ;;
    2)
        echo "Fetching production deployment logs..."
        echo ""
        vercel logs --prod
        ;;
    3)
        echo "Following live logs (Ctrl+C to stop)..."
        echo ""
        vercel logs --follow
        ;;
    4)
        echo "Fetching build logs..."
        echo ""
        vercel logs --output=build
        ;;
    5)
        echo "Fetching runtime logs..."
        echo ""
        vercel logs --output=runtime
        ;;
    *)
        echo "Invalid option."
        exit 1
        ;;
esac

echo ""
