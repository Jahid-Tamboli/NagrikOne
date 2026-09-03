# NagrikOne Full MVP

A full-stack foundation for a citizen resolution platform.

## Includes
- Next.js frontend
- NOVA-style rule-based problem detection foundation
- 10 problem workflows
- Authority/company routing data
- PostgreSQL-ready Prisma data model (SQLite for local development)
- Cases + status events
- Payment record foundation
- UPI payment page with supplied QR
- Responsive 3D-style city UI
- API endpoints for routing, cases, problems and payment intents

## Local setup
1. Copy `.env.example` to `.env`
2. `npm install`
3. `npx prisma db push`
4. `npm run db:seed`
5. `npm run dev`
6. Open `http://localhost:3000`

## Production requirements
Replace SQLite with PostgreSQL, add authentication, secure evidence storage, official government/company integrations, jurisdiction verification, real payment gateway + webhook verification, rate limiting, audit logs, privacy/consent controls, email/SMS/push notifications and human escalation workflows.

The app intentionally does not claim that a complaint was submitted when no verified external integration exists.
