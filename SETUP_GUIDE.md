# LEGACORE Platform - Setup Guide

This guide walks you through setting up the LEGACORE Platform from scratch.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Vercel Postgres)
- Git

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/MadScientist85/LEGACORE-PLATFORM.git
cd LEGACORE-PLATFORM

# Install dependencies
npm install
```

## Step 2: Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your database credentials:

```env
# Postgres Database
POSTGRES_URL="postgresql://user:password@host:5432/database"
POSTGRES_PRISMA_URL="postgresql://user:password@host:5432/database?pgbouncer=true"
POSTGRES_URL_NO_SSL="postgresql://user:password@host:5432/database"
POSTGRES_URL_NON_POOLING="postgresql://user:password@host:5432/database"
POSTGRES_USER="user"
POSTGRES_HOST="host"
POSTGRES_PASSWORD="password"
POSTGRES_DATABASE="database"

# Optional: NextAuth (for authentication)
AUTH_SECRET="your-secret-key-here"

# Optional: OpenAI (for AI features)
OPENAI_API_KEY="sk-..."
```

## Step 3: Database Setup

The platform uses Prisma for database management. Follow these steps:

### 3.1 Generate Prisma Client

```bash
npm run prisma:generate
```

This generates the Prisma client based on the schema in `packages/database/prisma/schema.prisma`.

### 3.2 Create Database Tables

```bash
npm run prisma:migrate
```

This will prompt you to name the migration (e.g., "initial_setup").

### 3.3 Seed Demo Data

```bash
npm run prisma:seed
```

This populates your database with:
- 8 demo companies (one for each application)
- 3 users per company (admin, manager, user)
- Cases for legal/financial apps
- Documents and assets
- Credit accounts
- Projects for Quorentis, Aurelian, Lumora
- Analytics data for Aurelian and Admin Portal
- Government contracting opportunities for GrokCon

**OR run all steps at once:**

```bash
npm run db:setup
```

## Step 4: Verify Database

Open Prisma Studio to explore your database:

```bash
npm run prisma:studio
```

This opens a GUI at http://localhost:5555 where you can view and edit your data.

## Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Step 6: Access Applications

Each application has its own dashboard:

| Application | URL | Purpose |
|------------|-----|---------|
| Admin Portal | http://localhost:3000/apps/admin-portal/dashboard | System administration |
| HBU Asset Recovery | http://localhost:3000/apps/hbu-asset-recovery/dashboard | Debt collection cases |
| Vivat Legacy | http://localhost:3000/apps/vivat-legacy/dashboard | Estate planning |
| Turnaround Financial | http://localhost:3000/apps/turnaround-financial/dashboard | Business restructuring |
| Quorentis Financial | http://localhost:3000/apps/quorentis-financial/dashboard | Corporate finance projects |
| Aurelian Digital | http://localhost:3000/apps/aurelian-digital/dashboard | Digital transformation analytics |
| Lumora Creations | http://localhost:3000/apps/lumora-creations/dashboard | Creative assets |
| GrokCon Agent | http://localhost:3000/apps/grokcon-agent/dashboard | Government contracting |

## Demo Credentials

After seeding, each company has three user accounts:

**Format:** `{role}@{company-slug}.com` / `{Role}123!`

**Examples:**
- Admin Portal Admin: `admin@admin-portal.com` / `Admin123!`
- HBU Asset Recovery Manager: `manager@hbu-asset-recovery.com` / `Manager123!`
- GrokCon Agent User: `user@grokcon-agent.com` / `User123!`

## Testing API Routes

You can test API routes using curl or any HTTP client:

```bash
# Get companies
curl http://localhost:3000/apps/admin-portal/api/companies

# Get cases for HBU Asset Recovery
curl http://localhost:3000/apps/hbu-asset-recovery/api/cases

# Get opportunities for GrokCon
curl http://localhost:3000/apps/grokcon-agent/api/opportunities
```

## Development Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run type-check       # TypeScript type checking
npm run format:check     # Check code formatting
npm run format:write     # Format code with Prettier

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed demo data
npm run prisma:studio    # Open Prisma Studio
npm run db:setup         # Complete setup (generate + migrate + seed)
```

## Troubleshooting

### Issue: Prisma client errors

**Solution:** Generate the Prisma client:
```bash
npm run prisma:generate
```

### Issue: Database connection errors

**Solution:** Verify your `.env` file has correct database credentials and the database is running.

### Issue: Port 3000 already in use

**Solution:** Kill the process or use a different port:
```bash
PORT=3001 npm run dev
```

### Issue: TypeScript errors

**Solution:** Check types and regenerate Prisma client:
```bash
npm run prisma:generate
npm run type-check
```

## Project Structure

```
LEGACORE-PLATFORM/
├── apps/                          # White-label applications
│   ├── admin-portal/              # System administration
│   ├── hbu-asset-recovery/        # Asset recovery cases
│   ├── vivat-legacy/              # Estate planning
│   ├── turnaround-financial/      # Business restructuring
│   ├── quorentis-financial/       # Corporate finance
│   ├── aurelian-digital/          # Digital transformation
│   ├── lumora-creations/          # Creative agency
│   └── grokcon-agent/             # Government contracting
├── packages/
│   ├── database/                  # Prisma schema and seed
│   │   ├── prisma/schema.prisma   # Database schema
│   │   ├── seed.ts                # Seed script
│   │   └── index.ts               # Prisma client export
│   └── ai/                        # Shared AI utilities
├── lib/
│   └── errors/                    # Error handling utilities
├── components/                    # Shared UI components
├── app/                          # Main Next.js app
└── public/                       # Static assets
```

## Next Steps

1. **Authentication**: Implement NextAuth.js for user authentication
2. **UI Development**: Build forms and interactive components
3. **AI Integration**: Connect OpenAI or other AI providers
4. **Testing**: Add unit and integration tests
5. **Deployment**: Deploy to Vercel or your hosting platform

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## Support

For issues or questions:
1. Check the [COMPLETION_GUIDE.md](./COMPLETION_GUIDE.md) for implementation details
2. Review the [README.md](./README.md) for feature overview
3. Open an issue on GitHub

## License

MIT
