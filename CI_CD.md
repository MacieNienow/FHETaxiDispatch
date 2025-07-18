# CI/CD Pipeline Documentation

Automated testing and deployment pipeline for Privacy-Focused Blockchain Ride Sharing Platform

## Overview

This project uses GitHub Actions for continuous integration and continuous deployment. The pipeline automatically runs tests, performs code quality checks, and generates coverage reports on every push and pull request.

## Pipeline Architecture

### Workflow Files

Located in `.github/workflows/`:
- **test.yml** - Main CI/CD pipeline

### Pipeline Jobs

#### 1. Test Job
Runs tests across multiple Node.js versions (18.x, 20.x)

**Steps:**
- Checkout code
- Setup Node.js environment
- Install dependencies (`npm ci`)
- Compile smart contracts
- Run Solhint linter
- Execute test suite
- Generate gas reports
- Generate coverage reports
- Upload to Codecov

**Matrix Strategy:**
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
```

#### 2. Build Job
Builds the Next.js application

**Steps:**
- Checkout code
- Setup Node.js 20.x
- Install dependencies
- Build Next.js app
- Upload build artifacts

**Runs after:** Test job completes successfully

#### 3. Security Job
Performs security audits

**Steps:**
- Run npm audit
- Check for outdated packages

#### 4. Code Quality Job
Enforces code quality standards

**Steps:**
- Run Solhint on Solidity files
- Check code formatting
- Run ESLint on JavaScript/TypeScript
- TypeScript type checking

## Triggers

### Push Events
Pipeline runs on push to:
- `main` branch
- `develop` branch

### Pull Request Events
Pipeline runs on pull requests targeting:
- `main` branch
- `develop` branch

## Configuration Files

### .solhint.json
Solidity linting rules
```json
{
  "extends": "solhint:recommended",
  "rules": {
    "compiler-version": ["error", "^0.8.0"],
    "func-visibility": ["warn", { "ignoreConstructors": true }],
    "max-line-length": ["warn", 120]
  }
}
```

### codecov.yml
Coverage reporting configuration
```yaml
coverage:
  precision: 2
  round: down
  range: "70...100"

  status:
    project:
      default:
        target: 90%
```

### .prettierrc.json
Code formatting rules
```json
{
  "printWidth": 120,
  "tabWidth": 2,
  "singleQuote": true,
  "overrides": [
    {
      "files": "*.sol",
      "options": {
        "printWidth": 120,
        "tabWidth": 4,
        "singleQuote": false
      }
    }
  ]
}
```

## Running Locally

### Install Dependencies
```bash
npm install
```

### Run Full CI Pipeline
```bash
npm run ci
```

### Individual Commands
```bash
# Lint Solidity files
npm run lint:solidity

# Compile contracts
npm run compile

# Run tests
npm test

# Run tests with gas reporting
npm run test:gas

# Generate coverage
npm run test:coverage

# Type check
npm run type-check

# Lint Next.js code
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

## Code Quality Checks

### Solhint Rules
- Compiler version enforcement (^0.8.0)
- Function visibility requirements
- Naming conventions (camelCase, snake_case)
- Maximum line length (120 characters)
- No console statements
- No empty blocks
- Explicit type declarations

### ESLint Rules
- Next.js recommended rules
- TypeScript best practices
- React hooks rules
- Accessibility checks

### Prettier Formatting
- Print width: 120 characters
- Tab width: 2 spaces (4 for Solidity)
- Single quotes (double for Solidity)
- Trailing commas
- Line endings: LF

## Coverage Reporting

### Codecov Integration
- Automatically uploads coverage on CI
- Tracks coverage trends
- Comments on pull requests
- Target: 90% project coverage, 85% patch coverage

### Local Coverage
```bash
npm run test:coverage
```

View report: `coverage/index.html`

## Security Audits

### npm audit
Checks for known vulnerabilities in dependencies
```bash
npm audit --audit-level=moderate
```

### Package Updates
Regular checks for outdated packages
```bash
npm outdated
```

## Build Artifacts

### Retention
- Build artifacts retained for 7 days
- Includes `.next/` and `artifacts/` directories

### Download
Available in GitHub Actions run summary

## Environment Variables

### Required for CI
- `CODECOV_TOKEN` - Codecov upload token (GitHub secret)

### Build Environment
- `NEXT_PUBLIC_CHAIN_ID` - Blockchain chain ID
- `NEXT_PUBLIC_NETWORK_NAME` - Network name

## Troubleshooting

### Test Failures
1. Check test logs in GitHub Actions
2. Run tests locally: `npm test`
3. Check for environment differences

### Coverage Issues
1. Ensure all tests run successfully
2. Check `coverage/` directory for details
3. Verify Codecov token is set

### Build Failures
1. Check Node.js version compatibility
2. Verify all dependencies installed
3. Check environment variables

### Linting Errors
1. Run locally: `npm run lint:solidity`
2. Auto-fix: `npm run format`
3. Check `.solhint.json` rules

## Best Practices

### Before Committing
1. Run full CI pipeline: `npm run ci`
2. Check code formatting: `npm run format:check`
3. Verify all tests pass: `npm test`
4. Review coverage: `npm run test:coverage`

### Pull Request Guidelines
1. Ensure CI passes
2. Maintain or improve coverage
3. Address linting warnings
4. Update documentation

### Commit Messages
- Use conventional commits format
- Be descriptive and concise
- Reference issues when applicable

## Maintenance

### Updating Dependencies
```bash
# Check for updates
npm outdated

# Update specific package
npm update <package-name>

# Update all packages
npm update
```

### Adding New Tests
1. Add test files to `test/` directory
2. Follow existing test patterns
3. Ensure coverage >90%
4. Verify CI passes

### Modifying Pipeline
1. Edit `.github/workflows/test.yml`
2. Test changes in feature branch
3. Monitor workflow runs
4. Update documentation

## Status Badges

Add to README.md:
```markdown
![CI/CD](https://github.com/username/repo/workflows/CI%2FCD%20Pipeline/badge.svg)
![Coverage](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg)
![Node](https://img.shields.io/badge/node-18.x%20%7C%2020.x-brightgreen)
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Codecov Documentation](https://docs.codecov.com)
- [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md)
- [Prettier Documentation](https://prettier.io/docs/en/)

---

**Pipeline Status**: ✅ Configured and ready
**Coverage Target**: 90%
**Supported Node.js**: 18.x, 20.x
**Last Updated**: 2025-10-24
