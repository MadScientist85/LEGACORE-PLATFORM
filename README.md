<h1 align="center">LEGACORE Platform</h1>

<p align="center">
Multi-tenant white-label platform with AI-powered applications for legal, financial, and government contracting services.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#applications"><strong>Applications</strong></a> ·
  <a href="#architecture"><strong>Architecture</strong></a> ·
  <a href="#running-locally"><strong>Running Locally</strong></a> ·
  <a href="#database-setup"><strong>Database Setup</strong></a>
</p>
<br/>

## Features

### Core Platform
- Multi-tenant architecture with company-based data isolation
- Comprehensive Prisma database schema with user, case, document, credit, project, and analytics models
- Advanced error handling with custom error classes
- Robust database seeding with demo data
- AI utilities package for intelligent features

### White-Label Applications
- **Admin Portal** - Central administration and management
- **HBU Asset Recovery** - Professional asset recovery and debt collection
- **Vivat Legacy** - Estate planning and legacy management
- **Turnaround Financial** - Business turnaround and financial restructuring
- **Quorentis Financial** - Corporate finance and investment advisory with project management
- **Aurelian Digital** - Digital transformation with analytics dashboard
- **Lumora Creations** - Creative agency with digital asset management
- **GrokCon Agent** - AI-powered government contracting opportunities platform

### Technology Stack
- [Next.js](https://nextjs.org) 14 with App Router
- [Prisma](https://prisma.io) ORM for database management
- [TypeScript](https://typescriptlang.org) for type safety
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) for database
- Custom AI utilities package for intelligent features

## Applications

## Applications

Each application in the `apps/` directory is a fully-featured white-label solution with its own dashboard and API routes:

### 1. Admin Portal (`apps/admin-portal`)
- Company management
- User administration
- System-wide analytics
- **Dashboard**: `/apps/admin-portal/dashboard`
- **API**: `/apps/admin-portal/api/companies`, `/apps/admin-portal/api/users`

### 2. HBU Asset Recovery (`apps/hbu-asset-recovery`)
- Case management for asset recovery
- Debt collection tracking
- Priority-based workflow
- **Dashboard**: `/apps/hbu-asset-recovery/dashboard`
- **API**: `/apps/hbu-asset-recovery/api/cases`

### 3. Vivat Legacy (`apps/vivat-legacy`)
- Estate planning case management
- Legacy management solutions
- **Dashboard**: `/apps/vivat-legacy/dashboard`
- **API**: `/apps/vivat-legacy/api/cases`

### 4. Turnaround Financial (`apps/turnaround-financial`)
- Business restructuring cases
- Financial turnaround tracking
- **Dashboard**: `/apps/turnaround-financial/dashboard`
- **API**: `/apps/turnaround-financial/api/cases`

### 5. Quorentis Financial (`apps/quorentis-financial`)
- Corporate finance projects
- Investment advisory tracking
- Project management with budgets
- **Dashboard**: `/apps/quorentis-financial/dashboard`
- **API**: `/apps/quorentis-financial/api/projects`

### 6. Aurelian Digital (`apps/aurelian-digital`)
- Digital transformation analytics
- Business intelligence dashboard
- Metric tracking and aggregation
- **Dashboard**: `/apps/aurelian-digital/dashboard`
- **API**: `/apps/aurelian-digital/api/analytics`

### 7. Lumora Creations (`apps/lumora-creations`)
- Creative asset management
- Digital content production
- File tracking and organization
- **Dashboard**: `/apps/lumora-creations/dashboard`
- **API**: `/apps/lumora-creations/api/assets`

### 8. GrokCon Agent (`apps/grokcon-agent`)
- AI-powered government contracting platform
- Opportunity discovery and matching
- Automated relevance scoring
- AI-generated summaries
- **Dashboard**: `/apps/grokcon-agent/dashboard`
- **API**: `/apps/grokcon-agent/api/opportunities`

## Architecture

### Database (`packages/database`)
- Comprehensive Prisma schema with multi-tenant support
- Models: Company, User, Case, Document, Credit, Project, Analytics, ContractOpportunity
- Robust seeding script with demo data
- Advanced error handling and logging

### AI Package (`packages/ai`)
- Shared AI utilities for all applications
- Mock AI client for development
- Relevance scoring, summarization, keyword extraction
- Ready for integration with OpenAI, Anthropic, or custom models

### Error Handling (`lib/errors`)
- Custom error classes (ValidationError, AuthenticationError, NotFoundError, etc.)
- Consistent error responses across all API routes
- Error middleware for Next.js API routes

## Database Setup

## Database Setup

### Creating a Postgres Database Instance

Similarly, follow the steps outline in the [quick start guide](https://vercel.com/docs/storage/vercel-postgres/quickstart) provided by Vercel. This guide will assist you in creating and configuring your Postgres database instance on Vercel, enabling your application to interact with it.

Remember to update your environment variables (`POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NO_SSL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_USER`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`) in the `.env` file with the appropriate credentials provided during the Postgres database setup.

### Initializing the Database

Once you have set up your Postgres database:

1. Generate Prisma client:
```bash
npm run prisma:generate
```

2. Run migrations:
```bash
npm run prisma:migrate
```

3. Seed the database with demo data:
```bash
npm run prisma:seed
```

Or run all steps at once:
```bash
npm run db:setup
```

The seed script will populate your database with:
- 8 demo companies (one for each application)
- Users for each company (admin, manager, regular user)
- Cases for legal/financial applications
- Documents and creative assets
- Credit accounts and transactions
- Projects for Quorentis Financial
- Analytics data for Aurelian Digital
- Government contracting opportunities for GrokCon Agent

## Running Locally

## Running Locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run the LEGACORE Platform. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your database and authentication accounts.

### Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. Initialize database:
```bash
npm run db:setup
```

4. Start development server:
```bash
npm run dev
```

Your platform should now be running on [localhost:3000](http://localhost:3000/).

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with demo data
- `npm run prisma:studio` - Open Prisma Studio for database management
- `npm run db:setup` - Complete database setup (generate + migrate + seed)

## Accessing Applications

After seeding the database, you can access each application's dashboard:

- Admin Portal: `http://localhost:3000/apps/admin-portal/dashboard`
- HBU Asset Recovery: `http://localhost:3000/apps/hbu-asset-recovery/dashboard`
- Vivat Legacy: `http://localhost:3000/apps/vivat-legacy/dashboard`
- Turnaround Financial: `http://localhost:3000/apps/turnaround-financial/dashboard`
- Quorentis Financial: `http://localhost:3000/apps/quorentis-financial/dashboard`
- Aurelian Digital: `http://localhost:3000/apps/aurelian-digital/dashboard`
- Lumora Creations: `http://localhost:3000/apps/lumora-creations/dashboard`
- GrokCon Agent: `http://localhost:3000/apps/grokcon-agent/dashboard`

### Demo Credentials

After seeding, each company will have three users:
- **Admin**: `admin@{company-slug}.com` / `Admin123!`
- **Manager**: `manager@{company-slug}.com` / `Manager123!`
- **User**: `user@{company-slug}.com` / `User123!`

Example for HBU Asset Recovery:
- Admin: `admin@hbu-asset-recovery.com` / `Admin123!`

## Contributing

Contributions are welcome! Please ensure all API routes include proper error handling using the error utilities in `lib/errors`.

## License

MIT
