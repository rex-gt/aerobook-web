# Vercel CLI Scripts for WingTime Web

Batch scripts to manage Vercel deployments and settings from your local CLI.

## Prerequisites

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Link to your project:**
   ```bash
   cd wingtime-web
   vercel link
   ```

## Available Scripts

### 1. `vercel-setup.sh` - Environment Variables Setup

Sets up environment variables for your Vercel deployment.

**Usage:**
```bash
chmod +x vercel-setup.sh
./vercel-setup.sh
```

**What you need:**
- Your Railway API URL (e.g., `https://wingtime-api-production.up.railway.app`)

**Variables it sets:**
- `VITE_API_URL` - Backend API endpoint

**Environments:**
- Production
- Preview
- Development (optional)

### 2. `vercel-view-vars.sh` - View Environment Variables

Displays all environment variables for all environments.

**Usage:**
```bash
chmod +x vercel-view-vars.sh
./vercel-view-vars.sh
```

**Shows:**
- All variables across environments
- Production variables
- Preview variables  
- Development variables
- Option to download to `.env.local`

### 3. `vercel-deploy.sh` - Deploy Application

Interactive deployment script with options for production, preview, or development.

**Usage:**
```bash
chmod +x vercel-deploy.sh
./vercel-deploy.sh
```

**Options:**
1. **Production** - Live deployment (updates your production site)
2. **Preview** - Test deployment (gets unique URL)
3. **Development** - Local development server

### 4. `vercel-configure.sh` - Project Configuration

Creates `vercel.json` with recommended settings for your Vue/Vite app.

**Usage:**
```bash
chmod +x vercel-configure.sh
./vercel-configure.sh
```

**Configures:**
- Framework preset (Vite)
- Build command
- Output directory
- SPA rewrites
- Cache headers

### 5. `vercel-logs.sh` - View Deployment Logs

View build and runtime logs from your deployments.

**Usage:**
```bash
chmod +x vercel-logs.sh
./vercel-logs.sh
```

**Options:**
1. Latest deployment logs
2. Production logs
3. Live logs (follow mode)
4. Build logs only
5. Runtime logs only

## Quick Start Guide

### Initial Setup

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Navigate to your project
cd wingtime-web

# 4. Link to Vercel
vercel link

# 5. Make scripts executable
chmod +x vercel-*.sh

# 6. Run setup
./vercel-setup.sh

# 7. Configure project
./vercel-configure.sh

# 8. Deploy
./vercel-deploy.sh
```

### Typical Workflow

```bash
# 1. Make code changes
# ... edit your files ...

# 2. Test locally
npm run dev

# 3. Commit changes
git add .
git commit -m "Add new feature"

# 4. Push (triggers auto-deploy if configured)
git push

# Or deploy manually:
./vercel-deploy.sh

# 5. View logs
./vercel-logs.sh

# 6. Check variables
./vercel-view-vars.sh
```

## Environment Variables

### Required Variables

**VITE_API_URL** - Your backend API URL
```bash
# Production
VITE_API_URL=https://wingtime-api-production.up.railway.app

# Preview/Development  
VITE_API_URL=https://wingtime-api-staging.up.railway.app
```

### How Vite Uses Environment Variables

In your code:
```typescript
// Accessing the API URL
const apiUrl = import.meta.env.VITE_API_URL;

// Making API calls
fetch(`${import.meta.env.VITE_API_URL}/api/members`)
```

**Important:** Only variables prefixed with `VITE_` are exposed to your app!

### Local Development

Create `.env.local` for local development:
```bash
VITE_API_URL=http://localhost:3000
```

**Note:** `.env.local` should be in `.gitignore`

## Vercel.json Configuration

The `vercel-configure.sh` script creates this file:

```json
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
```

**What this does:**
- **rewrites**: Enables SPA routing (all routes go to index.html)
- **headers**: Caches static assets for 1 year
- **framework**: Tells Vercel to use Vite preset

## Deployment Environments

### Production
- Branch: `main`
- URL: `https://wingtime.vercel.app` (your custom domain)
- Auto-deploys on push to main

### Preview
- Branch: Any non-main branch or PR
- URL: `https://wingtime-[random].vercel.app`
- Auto-deploys on push to PR branches

### Development
- Local only: `vercel dev`
- Uses `.env.local` variables

## Troubleshooting

### "Vercel CLI not found"
```bash
npm install -g vercel
```

### "Not linked to a project"
```bash
vercel link
```

### Check deployment status
```bash
vercel ls
```

### View deployment details
```bash
vercel inspect
```

### Failed build
```bash
# Check build logs
./vercel-logs.sh
# Select option 4 (Build logs only)

# Common issues:
# - Missing dependencies: npm install
# - TypeScript errors: npm run build locally first
# - Environment variables: ./vercel-view-vars.sh
```

### API calls failing
```bash
# 1. Check VITE_API_URL is set
./vercel-view-vars.sh

# 2. Verify Railway API is running
curl https://your-railway-url.railway.app/api/health

# 3. Check CORS settings in Railway API
# Make sure Railway allows your Vercel domain
```

### Update environment variable
```bash
# Remove old value
vercel env rm VITE_API_URL production

# Add new value
vercel env add VITE_API_URL production
# Enter new URL when prompted

# Redeploy
vercel --prod
```

## Useful Vercel Commands

```bash
# View current project
vercel

# List all deployments
vercel ls

# Get deployment URL
vercel inspect

# View logs
vercel logs

# Live logs
vercel logs --follow

# Rollback to previous deployment
vercel rollback

# Remove deployment
vercel remove [deployment-url]

# Set environment variable
vercel env add VARIABLE_NAME production

# Remove environment variable
vercel env rm VARIABLE_NAME production

# Pull variables to local
vercel env pull .env.local

# Open project in dashboard
vercel
```

## Project Structure

```
wingtime-web/
├── scripts/
│   └── vercel/
│       ├── setup.sh           # Setup environment variables
│       ├── view-vars.sh       # View all variables
│       ├── deploy.sh          # Deploy application
│       ├── configure.sh       # Configure project settings
│       ├── logs.sh            # View logs
│       └── README.md          # This file
├── src/
├── public/
├── .env.local                 # Local environment (gitignored)
├── .env.example               # Template
├── vercel.json                # Vercel configuration
├── vite.config.ts             # Vite configuration
└── package.json
```

## Git Integration

Vercel automatically deploys when you push to GitHub:

```bash
# Push to main = Production deployment
git checkout main
git push origin main

# Push to branch = Preview deployment  
git checkout feature-branch
git push origin feature-branch
```

## Custom Domains

Configure in Vercel dashboard or via CLI:

```bash
# Add domain
vercel domains add yourdomain.com

# List domains
vercel domains ls

# Remove domain
vercel domains rm yourdomain.com
```

## Security Best Practices

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Use different API URLs** for production/preview/development
3. **Rotate secrets regularly** - Update environment variables
4. **Review deployment logs** - Check for exposed secrets
5. **Enable deployment protection** - Require approval for production

## Performance Tips

1. **Use caching headers** (already in vercel.json)
2. **Optimize images** - Use Vercel Image Optimization
3. **Enable analytics** - `vercel analytics enable`
4. **Monitor bundle size** - Check build logs
5. **Use preview deployments** - Test before production

## CI/CD Integration

Vercel integrates automatically with GitHub. For custom CI/CD:

```bash
# In your CI pipeline (GitHub Actions, etc.)
- name: Deploy to Vercel
  run: |
    npm install -g vercel
    vercel --token ${{ secrets.VERCEL_TOKEN }} --prod
```

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel CLI Docs: https://vercel.com/docs/cli
- Vite Docs: https://vitejs.dev/

## License

MIT
