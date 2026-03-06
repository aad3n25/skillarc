# CLAUDE.md — SkillArc (Knowledge Flow)

## Project Overview

SkillArc is an AI-powered career transition platform. Users complete a 10-question career assessment (or upload a CV), receive a free career risk score (0–100) with a skills snapshot, and can purchase a full transition report (£19) with 3 personalised career pathways. Phase 2 adds AI-tutored guided pathways (£149–249) with evidence-based learner profiling embedded in onboarding.

**Solo founder, beginner developer — all code is AI-generated via prompts.**

## Tech Stack

- **Framework:** Next.js 15, App Router, TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL + Auth + Storage + RLS)
- **AI/LLM:** Claude API — model `claude-sonnet-4-20250514`
- **Payments:** Stripe Checkout (hosted) + Webhooks
- **Hosting:** Vercel
- **Analytics:** Plausible or PostHog
- **Errors:** Sentry
- **IDE:** Cursor with Claude Code extension

## Architecture Rules

1. **All Claude API calls are server-side only.** Use Next.js Route Handlers (`app/api/`) — never call the Anthropic SDK from client components.
2. **All secrets live in environment variables.** Never hardcode Supabase keys, Anthropic API keys, or Stripe secrets. Use `.env.local` for dev, Vercel environment settings for prod.
3. **Supabase Row Level Security (RLS) is mandatory** on every table containing user data. No table should be created without RLS policies.
4. **TypeScript strict mode is enforced.** No `any` types. Define interfaces for all API responses, database rows, and Claude structured outputs.
5. **One component per file.** Keep components small and focused. Shared UI goes in `components/ui/`, feature-specific in `components/[feature]/`.

## File Structure

```
skillarc/
├── app/
│   ├── (marketing)/          # Landing, pricing
│   ├── (auth)/                # Login, signup
│   ├── assessment/            # 10-question career assessment (or CV upload)
│   ├── results/               # Free risk score + skills snapshot
│   ├── report/                # Paid full report (gated)
│   ├── tutor/                 # Phase 2: AI tutor
│   └── api/
│       ├── assessment/        # Score calculation via Claude
│       ├── report/            # Full report generation via Claude
│       ├── stripe/            # Checkout session + webhook
│       ├── upload/            # CV upload to Supabase Storage
│       └── tutor/             # Phase 2: streaming AI tutor
├── components/
├── lib/
│   ├── supabase/              # Client + server helpers
│   ├── anthropic/             # Claude API wrapper + prompts
│   ├── stripe/                # Stripe helpers
│   └── validators/            # Zod schemas for all inputs
├── types/                     # Shared TypeScript interfaces
└── prompts/                   # Claude system prompts as .ts constants
```

## Claude API Integration Patterns

### System Prompt Convention
Store all Claude system prompts in `prompts/` as typed constants. Every prompt must include:
- A role definition ("You are a career transition analyst…")
- Explicit output format instructions (JSON schema)
- Constraints and boundaries ("Do not invent qualifications the user hasn't mentioned")

### Structured JSON Output
For report generation and scoring, always request JSON output:
```typescript
// prompts/career-score.ts
export const CAREER_SCORE_SYSTEM_PROMPT = `
You are a career transition risk analyst. Given a user's assessment 
answers and optional CV data, produce a career risk score.

Respond ONLY with valid JSON matching this schema:
{
  "riskScore": number (0-100),
  "confidence": number (0-1),
  "topFactors": [{ "factor": string, "impact": "positive" | "negative", "weight": number }],
  "skillsSnapshot": [{ "skill": string, "trend": "rising" | "stable" | "falling", "relevance": number }],
  "recommendedDirection": string (single best transition direction),
  "summary": string (2-3 sentences)
}

Do not include markdown, backticks, or any text outside the JSON object.
`;
```

### Extended Thinking for Complex Analysis
Use Claude's extended thinking when generating full career reports. The multi-pathway analysis benefits from step-by-step reasoning before producing the structured output.

### Streaming (Phase 2 — AI Tutor)
Use the Anthropic SDK's streaming mode for the tutor endpoint. Pipe `stream.on('text')` events through a ReadableStream in the Route Handler to the client via `fetch` with streaming.

## Assessment Form

- 10 questions (role, years, tools, industry, concern level, goals, etc.) OR CV upload as alternative entry
- Two paths to the same result: form answers → Claude scores, OR CV upload → Claude parses skills → Claude scores
- State managed via `useReducer` in a context provider (`AssessmentContext`)
- Validate each screen with Zod before allowing "Next"
- Persist partial progress to `localStorage` so users can resume
- On final submit: POST to `/api/assessment` → server calls Claude → returns risk score + skills snapshot
- Never send raw form state to Claude — transform into a clean prompt string server-side
- If CV parsing fails, gracefully fall back to manual entry with a helpful message

## Payment Flow

1. User sees free risk score on `/results`
2. User clicks "Get Full Report" → POST to `/api/stripe` → creates Checkout Session
3. Stripe redirects to `/report?session_id=...`
4. `/api/stripe/webhook` receives `checkout.session.completed` → updates Supabase `report_purchases` table
5. `/report` page checks purchase status via Supabase before rendering
6. **Always verify webhook signatures** with `stripe.webhooks.constructEvent()`

## Database Tables (Supabase)

All tables require RLS. Naming convention: `snake_case`, plural.

| Table | Purpose | Key columns |
|---|---|---|
| `career_assessments` | Stores 10-question answers + CV reference | `user_id`, `answers (jsonb)`, `cv_path`, `risk_score`, `skills_snapshot (jsonb)` |
| `career_reports` | Full £19 report content (3 pathways) | `user_id`, `assessment_id`, `report_content (jsonb)`, `generated_at` |
| `report_purchases` | Stripe payment records | `user_id`, `stripe_session_id`, `amount`, `status`, `purchased_at` |
| `pathway_enrollments` | Phase 2: pathway access records | `user_id`, `pathway_id`, `tier`, `stripe_session_id`, `enrolled_at` |
| `learner_profiles` | Phase 2: onboarding assessment (10 evidence-based questions) | `user_id`, `dispositions (jsonb)`, `motivation (jsonb)`, `time_constraints (jsonb)`, `observed_patterns (jsonb)` |

When referencing tables in code, use these exact names. Do not invent table names like `assessments` or `purchases` — use the full names above.

## Security Requirements (CRITICAL)

- **GDPR:** CV uploads contain personal data. Store in Supabase Storage with authenticated-only access. Provide delete account / data export functionality.
- **Input validation:** Validate ALL user input with Zod — form answers, file uploads (type + size), API parameters.
- **CV upload:** Accept only PDF/DOCX, max 5MB, scan filename for path traversal, store with UUID filenames.
- **Stripe webhooks:** Always verify signatures. Never trust client-side payment confirmation alone.
- **API routes:** Check Supabase auth session in every protected route. Return 401 immediately if missing.
- **Rate limiting:** Add rate limiting to Claude API routes (e.g., 5 requests/min per user) to prevent abuse.
- **Content Security Policy:** Configure in `next.config.js` to prevent XSS.

## Code Style Preferences

- Always include inline comments explaining WHY, not just WHAT
- Use descriptive variable names — `careerRiskScore` not `score`
- Error messages should be user-friendly in the UI, detailed in server logs
- Every `try/catch` must log to Sentry in the catch block
- Prefer early returns over deep nesting
- Use `loading.tsx` and `error.tsx` for every route segment

## Design System 

### Colours
- Primary gradient: `from-purple-600 to-blue-600`
- Hover gradient: `from-purple-700 to-blue-700`
- Background: `bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900`
- Glass surface: `bg-white/10 backdrop-blur-md`
- Selected state: `border-purple-500 bg-purple-500/20`

### Components
- Cards: `bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl shadow-xl`
- Buttons: `bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl py-3 px-6 font-bold`
- Inputs: `bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-xl px-4 py-3`
- Focus ring: `focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50`

### Fonts
- UI: Sora (weights 300, 600, 700, 800)
- Code/meta: JetBrains Mono

### Rules
- Always use glassmorphic cards, never flat/solid fills
- All interactive elements must have hover transitions (`transition-all`)
- Mobile-first: base `px-4`, then `sm:px-8`


## Development Phases

### Phase 1 (Weeks 1–3): Career Risk Score + £19 Report (~11 days at 15–20 hrs/week)
Week 1: Landing page, 10-question career assessment UI, CV upload endpoint
Week 2: Claude API integration (risk score generation, report generation), free results page
Week 3: Stripe integration (£19 product), report results page, auth (needed for purchase gating), analytics setup, deploy to Vercel

Build order matches the user journey: entry → free value → payment → paid content.
Auth is deferred to Week 3 because the free assessment doesn't require an account.

### Phase 2 (Weeks 4–8): Guided Pathways + AI Tutor (~16 days)
Week 4–5: Evidence-based learner assessment (10 onboarding questions), AI tutor prompt engineering
Week 6–7: Pathway content structure, first pathway (built from actual assessment demand data), pathway UI
Week 8: Stripe integration (£149–249 products), polish, launch

### Phase 3 (Months 3–6): Scale + B2B
Additional pathways based on demand signals, observational learner profile (Week 3 insight surfacing), B2B pilot infrastructure, inbound B2B outreach via build-in-public audience

## When Debugging

1. Paste the full error message and stack trace
2. Include the relevant file path and function name
3. Mention what you expected vs what happened
4. Check common AI-code pitfalls: hallucinated imports, wrong API signatures, missing null checks
5. For Supabase errors: check RLS policies first
6. For Stripe errors: check webhook signature and event type handling
7. For Claude API errors: check prompt length, model name, and response parsing
