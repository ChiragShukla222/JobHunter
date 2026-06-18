# CI/CD Configuration

This project uses GitHub Actions for continuous integration and deployment.

## Workflows

### CI Pipeline (`.github/workflows/ci.yml`)

Runs on every push and pull request to `main` or `master` branches:

- **Test Job**: Runs tests on Node.js 18.x and 20.x
  - Installs dependencies
  - Validates package.json
  - Checks for syntax errors
  - Verifies server can start

- **Lint Job**: Basic code quality checks
  - Checks for console.log statements (warnings)
  - Validates code structure

- **Build Job**: Build validation
  - Validates Vercel configuration
  - Checks required files exist

### Deploy Pipeline (`.github/workflows/deploy.yml`)

Runs on pushes to `main`/`master` branches or version tags:

- Validates code
- Deploys to Vercel (if secrets are configured)

## Setup

### Required GitHub Secrets (for deployment)

If you want to use automated deployment via GitHub Actions, add these secrets in your GitHub repository settings:

1. `VERCEL_TOKEN` - Your Vercel API token (get it from [Vercel Settings](https://vercel.com/account/tokens))
2. `VERCEL_ORG_ID` - Your Vercel organization ID
3. `VERCEL_PROJECT_ID` - Your Vercel project ID

**Note**: If you're using Vercel's GitHub integration, deployments will happen automatically without needing these secrets. The deploy workflow is optional.

## Viewing Workflow Runs

You can view workflow runs in the "Actions" tab of your GitHub repository.



