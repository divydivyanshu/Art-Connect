# ArtConnect - Artist Booking Marketplace

A modern marketplace connecting customers with verified artists for custom portraits, paintings, and digital art.

## Features

- 🎨 Browse verified artists by style, price, and location
- 📦 Multiple packages with add-ons (extra person, detailed background, express delivery)
- 🔐 Secure authentication (email/password + phone OTP)
- 📊 Dashboards for buyers, artists, and admins
- ⭐ Review and rating system
- 🎯 Admin panel for artist verification

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Styling**: Vanilla CSS with design system

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed with demo data
npx prisma db seed

# Start dev server
npm run dev
```

## Deployment

Deployed on Vercel with Neon PostgreSQL.

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@artconnect.com | admin123 |
| Buyer | buyer@demo.com | buyer123 |
| Artist | priya@artist.com | artist123 |

## License

MIT
