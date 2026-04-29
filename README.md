# Contact Dashboard

A mobile-friendly contact manager for marketing teams:
- `/` Add contact details (name, organization, phone, designation, address/location, comments)
- `/phonebook` View all saved contacts

## Stack

- Next.js 16 (App Router)
- Prisma ORM
- PostgreSQL (free tier-friendly)
- Vercel deployment

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set your database URL:

```bash
DATABASE_URL="postgresql://username:password@hostname:5432/database?sslmode=require"
```

3. Push schema to database:

```bash
npm run db:push
```

4. Run development server:

```bash
npm run dev
```

## Free database option for Vercel

Recommended: **Neon (Free Tier) + PostgreSQL**

1. Create a Neon project (free).
2. Copy the Neon Postgres **pooled** connection string.
3. Add it as `DATABASE_URL`:
- Local `.env`
- Vercel Project Settings -> Environment Variables
4. Run `npm run db:push` once against that DB.
5. Deploy to Vercel.

This project is already configured for PostgreSQL via Prisma, so Neon plugs in directly.

## Vercel deployment checklist

1. Verify your build locally:

```bash
npm run check
```

2. Ensure DB schema is up to date (run this against the same DB used by Vercel):

```bash
npm run db:push
```

3. In Vercel -> Project -> Settings -> Environment Variables, set:
- `DATABASE_URL` (for Production, Preview, Development as needed)

4. Push your repository and import/select it in Vercel.
5. Deploy.

If you later change the Prisma schema, run `npm run db:push` again before/after deploy.

## Useful scripts

- `npm run dev` Start local app
- `npm run build` Production build
- `npm run lint` Lint code
- `npm run check` Lint + production build
- `npm run db:push` Sync Prisma schema to DB
- `npm run db:validate` Validate Prisma schema/config
- `npm run db:studio` Open Prisma Studio
