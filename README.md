# CalSnap — AI Calorie Tracking App

CalSnap is a modern, AI-powered calorie and nutrition tracking app built with Next.js 16, Supabase, and Google Gemini AI.

## Features

- 📸 **Snap & Analyze** — Take or upload a photo of your food and let Gemini AI instantly estimate calories and macros
- 🤖 **AI Assistant** — Chat with an intelligent nutrition assistant that proactively logs meals from natural language
- 📊 **Daily Dashboard** — Track calories, protein, carbs, and fat in real time with beautiful progress charts
- 📅 **Monthly Overview** — Review trends and averages across any month
- 🏋️ **Fitness Plan** — Personalised plan generated from your BMI, TDEE, and goals (lose weight / maintain / gain muscle)
- 💧 **Water & Habits** — Log water intake and daily habits with streak tracking
- ⚖️ **Weight Check-ins** — Track your weight over time with a historical graph
- 🌙 **Dark / Light Mode** — Fully themed with Tailwind CSS and `next-themes`
- 📱 **PWA / Mobile-first** — Installable as a Progressive Web App with push notifications

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Actions) |
| Database / Auth | [Supabase](https://supabase.com) (PostgreSQL + Row Level Security) |
| AI | [Google Gemini 2.5 Flash](https://ai.google.dev) via `@google/generative-ai` |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Charts | [Recharts](https://recharts.org) |
| Validation | [Zod](https://zod.dev) |
| Language | TypeScript 5 |

## Setup

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com) API key

### 1. Clone and install

```bash
git clone https://github.com/ConDaoMoiNhu/CalSnap.git
cd CalSnap
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Optional: Push Notifications (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

### 3. Set up Supabase

Apply the database migrations from the `supabase/` directory:

```bash
npx supabase db push
# or apply migrations manually via the Supabase dashboard
```

Key tables: `profiles`, `meal_logs`, `plan_adherence`, `weight_checkins`, `daily_habits`

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
CalSnap/
├── app/
│   ├── (app)/              # Authenticated app pages
│   │   ├── page.tsx        # Dashboard
│   │   ├── log/            # Meal log
│   │   ├── scan/           # Food scanner
│   │   ├── chat/           # Full-page AI chat
│   │   ├── fitness-plan/   # Personalised fitness plan
│   │   ├── profile/        # User profile & stats
│   │   └── monthly-overview/
│   ├── (auth)/             # Login / Signup / Onboarding
│   ├── actions/            # Next.js Server Actions
│   └── api/                # API routes
│       ├── analyze/        # Gemini food analysis
│       ├── assistant/      # AI assistant (widget)
│       └── chat/           # AI chat (full-page)
├── components/             # Shared React components
├── lib/
│   ├── types.ts            # TypeScript types & Supabase schema
│   ├── env.ts              # Environment variable validation
│   ├── rate-limit.ts       # In-memory rate limiter
│   ├── supabase/           # Supabase client factories
│   └── theme.ts            # Design tokens
├── supabase/               # Database migrations
├── instrumentation.ts      # Next.js startup hook (env validation)
└── middleware.ts            # Auth middleware
```

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## API Rate Limits

| Endpoint | Limit |
|---|---|
| `POST /api/analyze` | 10 requests / minute / IP |
| `POST /api/assistant` | 15 requests / minute / IP |
| `POST /api/chat` | 15 requests / minute / IP |


