# NagrikOne — One Citizen. One Platform. Every Problem.

An AI-powered, statutory citizen complaint and dispute resolution engine. NagrikOne empowers citizens to triage grievances, automatically map them to legitimate statutory authorities, compile required evidence checklists, and escalate cases across Government, Municipal, Cyber, Banking, Consumer, and Utility sectors.

---

## Key Features & Upgrades

### 1. Interactive 3D Cyber-Civic Frontend
- **Interactive 3D WebGL / Canvas Mesh**: Real-time holographic 3D orbital city network with reactive mouse parallax, flowing photon energy beams, and pulsating citizen nodes (Government, Civic Hub, Cyber Shield 1930, Banking Ombudsman, Consumer Forum).
- **Interactive 3D Tilt Cards (`Card3D`)**: Perspective 3D cards with dynamic specular light glare reflecting cursor movement.
- **Modern Cyber-Civic Theme**: Obsidian midnight background (`#040914`), neon emerald, cyan, and violet glassmorphic panels (`backdrop-filter: blur(20px)`).

### 2. Multi-Lingual AI Triage Engine
- Understands complaints in **Hindi, Marathi, Hinglish, and English** (e.g. *"street light band hai 4 din se"*, *"online scam me OTP chala gaya"*, *"bank transaction failed money deducted"*, *"khadda near metro station"*).
- Calculates triage match confidence and flags urgency ratings (`URGENT`, `HIGH`, `MEDIUM`).
- Recommends statutory grievance routes (e.g. National Cyber Crime 1930, Municipal PWD, RBI Ombudsman, National Consumer Helpline).

### 3. Dual-Layer Resilient Backend
- **Canonical Knowledge Base (`lib/problemTypes.ts`)**: Built-in statutory catalog guarantees **zero downtime** for problem browsing and detection even without an active database connection.
- **Prisma ORM with PostgreSQL**: Production-ready schema for Users, Cases, Status Events, and Payments with automatic in-memory fallback for local preview and zero-database demo deployments.
- **Deep-Linkable UPI Payment Gateway**: Dynamic UPI URI scheme generation (`upi://pay?pa=...`), QR code display, one-click copy, and instant payment verification simulation.

---

## Quick Start

### Prerequisites
- Node.js 18+ (Node.js 20 LTS recommended)
- npm 9+

### 1. Installation
```bash
git clone https://github.com/Jahid-Tamboli/NagrikOne.git
cd NagrikOne
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Provide a PostgreSQL connection string in `DATABASE_URL`. If unconfigured, NagrikOne automatically runs in resilient in-memory mode).*

### 3. Build & Run
```bash
# Development mode
npm run dev

# Production build & start
npm run build
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/route` | Triage complaint, detect category, return questions & evidence |
| `GET` | `/api/problems` | List problem catalog with search & category filters |
| `GET` | `/api/cases` | Fetch all submitted citizen resolution cases |
| `POST` | `/api/cases` | Create a new citizen resolution draft case |
| `POST` | `/api/payment` | Generate UPI payment intent and simulate status callback |

---

## Deploy to Vercel

1. Push code to your GitHub repository.
2. Import repository into [Vercel](https://vercel.com).
3. Framework: **Next.js**.
4. Set optional environment variable `DATABASE_URL` (e.g. from Neon or Supabase).
5. Deploy! Vercel will automatically run `prisma generate && next build`.

---

## Creator & Attribution
- **Platform Architect**: Jahid Tamboli
- **License**: MIT
