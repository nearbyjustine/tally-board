# Lagablab Tally Board — Progress Tracker

**Stack:** Next.js 16 · React 19 · TypeScript · Supabase · Tailwind v4 · shadcn/ui (base-nova) · Sonner · Vercel  
**Last updated:** April 2, 2026

---

## ✅ Completed

### Infrastructure
- [x] Next.js 16 project bootstrapped (TypeScript, Tailwind v4, App Router)
- [x] Dependencies installed: `@supabase/supabase-js`, `@base-ui/react`, `lucide-react`, `sonner`, `next-themes`, `shadcn`
- [x] shadcn/ui initialized (base-nova style, Tailwind CSS vars)
- [x] `.env.local` template created with placeholder values
- [x] `tsconfig.json` — strict mode, `@/*` alias, bundler resolution
- [x] `lib/supabase.ts` — singleton typed Supabase client (`createClient<Database>`)
- [x] `lib/types.ts` — all TypeScript interfaces + `Database` type for typed Supabase queries
- [x] `lib/utils.ts` — `cn()` Tailwind merge helper
- [x] `utils/scoring.ts` — pure scoring functions (`computeTeamScores`, `getTeamGameBreakdown`, `RANK_LABEL`)
- [x] `hooks/useScoreData.ts` — fetches all 7 tables, sets up Supabase Realtime subscriptions

### Database
- [x] `supabase/schema.sql` — complete SQL migration: 7 tables, FK constraints, CHECK constraints, UNIQUE constraints, RLS policies (public read + anon write)

### Public Dashboard (`/`)
- [x] `app/page.tsx` — live scoreboard with real-time updates
- [x] `app/layout.tsx` — Lagablab branding, Geist font, Toaster
- [x] `components/dashboard/TeamCard.tsx` — expandable card with rank medal, total score, breakdowns (Games / Missions / Deductions tabs)

### Admin Panel (`/admin`)
- [x] `components/admin/PinGate.tsx` — PIN gate (sessionStorage, 3-attempt hint, validated vs `NEXT_PUBLIC_ADMIN_PIN`)
- [x] `components/admin/AdminNav.tsx` — sidebar with 5 nav links, active-state, logout
- [x] `app/admin/layout.tsx` — wraps all admin routes in PinGate + AdminNav
- [x] `app/admin/page.tsx` — overview: quick-nav cards, current standings table
- [x] `app/admin/teams/page.tsx` — full CRUD for Teams + Members (roles, color picker)
- [x] `app/admin/games/page.tsx` — full CRUD for Games + rank assignment UI (upsert logic)
- [x] `app/admin/missions/page.tsx` — full CRUD for Missions + per-team completion toggles
- [x] `app/admin/deductions/page.tsx` — apply/delete deductions per team, filter list, per-team summary

### shadcn UI Components
- [x] badge, button, card, dialog, input, label, select, sonner, table, tabs, textarea

---

## 🐛 Errors to Resolve

### Critical — TypeScript Compile Errors (14 errors across 4 files)

The root cause: the `Database` type in `lib/types.ts` doesn't fully satisfy the new supabase-js v2.101 `GenericSchema` constraint, causing `insert()`, `update()`, and spread operations to resolve as `never`.

**Specifically failing:**

| File | Lines | Error |
|---|---|---|
| `app/admin/deductions/page.tsx` | 66 | `insert({ team_id, amount, reason })` → arg type `never` |
| `app/admin/games/page.tsx` | 93, 97 | `insert(gamePayload)` and `update(gamePayload)` → arg type `never` |
| `app/admin/games/page.tsx` | 131 | `insert({ game_id, team_id, rank })` → arg type `never` |
| `app/admin/missions/page.tsx` | 71, 75 | `insert(missionPayload)` and `update(missionPayload)` → arg type `never` |
| `app/admin/missions/page.tsx` | 104 | `insert({ mission_id, team_id })` → arg type `never` |
| `app/admin/teams/page.tsx` | 62–63 | Spread on `never` type + missing `team_id`/`id` properties |
| `app/admin/teams/page.tsx` | 94, 101 | `insert/update({ name, color })` → arg type `never` |
| `app/admin/teams/page.tsx` | 141, 148 | `insert/update({ name, role })` and `insert({ team_id, name, role })` → arg type `never` |

**Root cause detail:**  
`lib/types.ts` `Database` type uses:
```ts
Views: Record<string, { Row: ...; Relationships: ... }>;
Functions: Record<string, { Args: ...; Returns: unknown }>;
```
But supabase-js v2.101 `GenericSchema` has stricter constraints on `GenericView` and `GenericFunction` shapes, causing `Omit<Database, '__InternalSupabase'>['public']` to fail the `extends GenericSchema` check → `Schema` resolves to `never` → all `.from()` operations are untyped `never`.

**Fix needed:**  
Update the `Database` type in `lib/types.ts` so `Views` and `Functions` precisely match the `GenericView`/`GenericFunction` constraints in `@supabase/postgrest-js`. Alternatively, use `as any` escape hatches on the `createClient` call (quick workaround, not preferred).

### Minor — Select `onValueChange` null handling

Already fixed in:
- `app/admin/deductions/page.tsx` lines 143, 235
- `app/admin/games/page.tsx` line 336

The `@base-ui/react` `Select.Root.onValueChange` passes `(string | null, eventDetails)` — setState wrappers already updated to use `(v) => setState(v ?? "")`.

---

## 🔜 What's Next (in order)

### 1. Fix TypeScript errors (blocker)
Resolve the `Database` type issue so `npx tsc --noEmit` exits with 0 errors. Options:
- **Option A (recommended):** Generate the `Database` type from the actual Supabase project using `supabase gen types typescript` after connecting the project
- **Option B:** Manually align `Views`/`Functions` field shapes in `lib/types.ts` to match `GenericSchema` exactly
- **Option C:** Cast `createClient<Database>` to `createClient<any>` as a temporary unblock (loses type safety)

### 2. Supabase Project Setup
- Create a new project at [supabase.com](https://supabase.com)
- Run `supabase/schema.sql` in the SQL editor
- Copy the Project URL and anon key into `.env.local`
- Set the actual admin PIN in `.env.local`
- Verify RLS policies are active

### 3. Environment Variables for Vercel
When deploying, set these in Vercel project settings:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ADMIN_PIN=
```

### 4. End-to-End Testing
- [ ] Create 4 teams → verify they appear on dashboard ranked
- [ ] Add members to each team (Leader, Assistant Leader, Member roles)
- [ ] Create 2+ games → assign 1st–4th ranks → verify point totals
- [ ] Create 2+ missions → mark completions → verify one-time-only per team
- [ ] Apply deductions → verify total drops and shows in breakdown
- [ ] Edit a game's point values → verify dashboard recalculates live
- [ ] Open dashboard in a second tab → trigger score change from admin → verify real-time update fires

### 5. Deploy to Vercel
- Push repo to GitHub
- Connect to Vercel (import project)
- Add env vars in Vercel dashboard
- Confirm build passes and scoreboard loads

---

## 🚧 Features Still to Implement

### High Priority
- [ ] **Responsive mobile layout for admin** — current sidebar assumes desktop; needs hamburger/drawer on mobile
- [ ] **Real-time updates in admin** — admin pages only fetch on mount/action; add Realtime subscriptions so multiple admins see live changes
- [ ] **Confirmation dialogs** — currently using `window.confirm()` (blocks UI, not mobile-friendly); replace with shadcn `AlertDialog`

### Medium Priority
- [ ] **Dark mode toggle** — `next-themes` is installed, `ThemeProvider` and toggle button not yet added to layout
- [ ] **Activity log / audit trail** — no record of who changed what or when (beyond timestamps)
- [ ] **Empty state illustrations** — placeholder text only; add simple SVG illustrations
- [ ] **Score history / game replay** — no way to see how scores evolved over the event

### Nice to Have
- [ ] **Export to PDF/CSV** — download final standings for printing/sharing
- [ ] **Team profile page** — dedicated page per team showing all their games, missions, deductions
- [ ] **Projector / fullscreen mode** — large-font, auto-rotating scoreboard view for projection during the event
- [ ] **Confetti / animations** — celebrate rank changes on the public dashboard
- [ ] **Undo deduction** — currently "delete" only; a softer "undo" UX would be better
- [ ] **Image/icon per team** — color only right now; optional emoji or avatar upload

---

## 📁 File Structure Reference

```
tally-board/
├── app/
│   ├── globals.css          Tailwind v4 + shadcn CSS variables
│   ├── layout.tsx           Root layout (Geist font, Toaster, metadata)
│   ├── page.tsx             Public scoreboard dashboard (real-time)
│   └── admin/
│       ├── layout.tsx       PIN gate + sidebar wrapper
│       ├── page.tsx         Admin overview (stats + standings)
│       ├── teams/page.tsx   Teams & members CRUD
│       ├── games/page.tsx   Games CRUD + rank assignment
│       ├── missions/page.tsx Missions CRUD + completion toggles
│       └── deductions/page.tsx Apply/manage deductions
├── components/
│   ├── admin/
│   │   ├── AdminNav.tsx     Sidebar navigation
│   │   └── PinGate.tsx      PIN authentication gate
│   ├── dashboard/
│   │   └── TeamCard.tsx     Expandable team score card
│   └── ui/                  shadcn components (11 files)
├── hooks/
│   └── useScoreData.ts      Data fetching + Realtime hook
├── lib/
│   ├── supabase.ts          Singleton Supabase client
│   ├── types.ts             TypeScript interfaces + Database type
│   └── utils.ts             cn() helper
├── utils/
│   └── scoring.ts           Pure score computation logic
├── supabase/
│   └── schema.sql           Full DB migration (run this in Supabase SQL editor)
├── .env.local               ← Fill in your actual values before running
└── PROGRESS.md              This file
```

---

## 🔑 Environment Variables

| Variable | Where to get it | Example |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API | `eyJhbGci...` |
| `NEXT_PUBLIC_ADMIN_PIN` | You choose | `8421` |

---

## 🗄️ Database Tables Summary

| Table | Purpose |
|---|---|
| `teams` | 4 teams with name + color |
| `members` | Team members with Leader/Assistant Leader/Member role |
| `games` | Game events with configurable 1st–4th point values (default 100/70/50/30) |
| `game_scores` | Which team placed which rank in a game (unique per game+team, unique per game+rank) |
| `missions` | Side missions with no ranking, flat point reward |
| `mission_completions` | One-time mission completion per team (unique constraint) |
| `deductions` | Point penalties per team with required reason field |

All tables have RLS enabled. Policies: public `SELECT` + anon `INSERT`/`UPDATE`/`DELETE` (appropriate for an internal camp-only tool with no public mutation access needed beyond the PIN-gated admin).
