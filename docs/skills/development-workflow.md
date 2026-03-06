# Skill: Development Workflow — SkillArc

## When to Use
Reference this skill for day-to-day development practices: planning features, requesting code from Cursor/Claude Code, debugging errors, managing your phased build, and maintaining code quality as a solo beginner developer.

---

## 1. Always Request Architecture Before Code

Before implementing any feature, ask Cursor/Claude Code to outline the structure first. This catches design mistakes before you write 200 lines in the wrong direction.

**Prompt pattern:**
```
I need to implement [feature]. Before writing any code, give me:
1. Which files need to be created or modified
2. The data flow (user action → component → API route → external service → response)
3. The TypeScript interfaces/types involved
4. Any edge cases or error states to handle

Don't write implementation code yet — just the plan.
```

**SkillArc examples where this matters most:**
- Assessment form → API route → Claude API → Supabase (many moving parts)
- Stripe checkout → webhook → purchase record → report generation (async chain)
- CV upload → storage → text extraction → prompt construction (file handling)

Once the plan looks right, THEN ask for implementation file by file.

Ref: Rule 11 — [Structure First](https://www.getmaxim.ai/articles/iterative-development-of-ai-agents-tools-and-techniques-for-rapid-prototyping-and-testing/)

---

## 2. Specify Versions in Every Code Request

AI tools may generate code for the wrong version of a library. Always include versions:

```
Use these exact versions:
- Next.js 15 (App Router, NOT Pages Router)
- TypeScript strict mode
- @supabase/supabase-js v2 (NOT v1 — different auth API)
- @anthropic-ai/sdk (latest — check import paths)
- stripe (Node.js SDK, NOT @stripe/stripe-js for server code)
- Tailwind CSS v3 (utility classes only, no @apply in components)

Do NOT use:
- getServerSideProps or getStaticProps (that's Pages Router)
- next/router (use next/navigation in App Router)
- supabase.auth.api.* (that's v1 syntax)
```

Pin this as a note in Cursor or include it in your system-level instructions so you don't repeat it every time.

Ref: Rule 12 — [Dependencies and Versions](https://www.augmentcode.com/guides/debugging-ai-generated-code-8-failure-patterns-and-fixes)

---

## 3. Demand Comments on Every Non-Obvious Decision

As a beginner developer, you need to understand the code you're shipping. Add this to every code request:

```
Add inline comments explaining:
- WHY this approach was chosen (not just what the line does)
- Any security implications
- What would break if this line were removed
- Links to relevant docs for unfamiliar APIs
```

**Good comment:**
```typescript
// Verify Stripe webhook signature BEFORE parsing the body.
// Without this, anyone could POST fake payment events to this endpoint.
const event = stripe.webhooks.constructEvent(body, signature, secret);
```

**Bad comment:**
```typescript
// Construct the event
const event = stripe.webhooks.constructEvent(body, signature, secret);
```

Ref: Rule 14 — [Code with Comments](https://graphite.com/guides/ai-code-documentation-automation)

---

## 4. Debugging: Paste the Full Error, Not a Summary

When something breaks, give Cursor/Claude Code maximum context:

**Template:**
```
ERROR in [file path]:
[paste full error message and stack trace]

WHAT I EXPECTED:
[describe expected behaviour]

WHAT ACTUALLY HAPPENED:
[describe actual behaviour]

RECENT CHANGES:
[list what you changed since it last worked]

@file [the file with the error]
@file [any related files]
```

**SkillArc-specific debug checklist:**
- **Supabase "permission denied"** → Check RLS policies first, not your query
- **Claude returns unexpected format** → Log the raw response before parsing. Check if your system prompt is actually being sent
- **Stripe webhook 400** → Check you're reading raw body text, not parsed JSON
- **"Module not found"** → Check import paths. App Router uses `@/` aliases. Ensure `tsconfig.json` paths are correct
- **Hydration mismatch** → You have a `use client` component rendering server-only data. Move the data fetch to a Server Component parent

Ref: Rules 15, 16 — [Debugging Methodology](https://speedscale.com/blog/the-developers-guide-to-debugging-ai-generated-code/), [Failure Patterns](https://www.augmentcode.com/guides/debugging-ai-generated-code-8-failure-patterns-and-fixes)

---

## 5. Build in Phases — Don't Skip Ahead

Your phased plan exists for a reason. Resist the urge to start Phase 2 before Phase 1 is working end-to-end.

### Phase 1 Milestones (validate each before moving on):
1. **Landing page works:** Single CTA → starts assessment
2. **Assessment works:** 10 questions, state persists, validates, OR CV upload as alternative entry
3. **Score works:** Assessment submits → API route → Claude returns valid JSON → risk score + skills snapshot displays on free results page
4. **Payment works:** "Get Full Report" → Stripe Checkout → webhook fires → purchase recorded in `report_purchases`
5. **Auth works:** User can sign up / log in (needed to gate the paid report)
6. **Report works:** Paid users see generated 3-pathway report, unpaid users see paywall
7. **Deployed:** Live on Vercel with production env vars, Stripe in live mode, analytics tracking each funnel step

**Do not start Phase 2 until all 7 milestones are passing in production.**

### Phase 2 Milestones:
1. Evidence-based learner assessment (10 onboarding questions) captures dispositions, motivation, time constraints, prior knowledge, format engagement
2. AI tutor prompt engineering produces personalised instruction based on learner profile + pathway content
3. Streaming tutor endpoint works locally, UI renders in real time
4. First pathway (built from actual Phase 1 demand data) is complete and stored in Supabase
5. Stripe products for £149–249 tiers are live

Ref: Rule 34 — [Break Into Phases](https://www.getmaxim.ai/articles/iterative-development-of-ai-agents-tools-and-techniques-for-rapid-prototyping-and-testing/)

---

## 6. Keep Cursor Context Tight

Your project will grow. Keep Cursor effective by:

- **@file references:** Always include the 2-3 most relevant files, not "the whole project"
- **When starting a new feature:** Open a new Cursor chat. Old chats accumulate stale context that causes wrong suggestions.
- **When a chat goes wrong:** Don't keep asking the same question. Start fresh, rephrase the problem, include the error output.
- **Use @codebase sparingly:** It searches your whole repo which is useful for "where is this function called?" but noisy for implementation questions.
- **Write a `.cursorrules` file** (optional) with the same version constraints from section 2 above, so every Cursor chat starts with the right context.

Ref: Rules 6, 19, 20 — [Cursor @Symbols](https://www.builder.io/blog/cursor-tips), [Codebase Context](https://refactoring.fm/p/managing-context-for-ai-coding), [Context Window](https://prompt.16x.engineer/blog/ai-coding-context-management)

---

## 7. AI-Generated Code Review Checklist

Before accepting any generated code, scan for these common issues:

- [ ] **Hallucinated imports:** Does the import path actually exist? (`import { X } from 'some-library/subpath'` — check it)
- [ ] **Wrong API version:** Is it using App Router patterns (not Pages Router)?
- [ ] **Missing error handling:** Does every `await` have a try/catch or error boundary?
- [ ] **No `any` types:** TypeScript strict mode means no type shortcuts
- [ ] **Client/server boundary:** Is `'use client'` only on components that need interactivity? Are server-only calls (Claude API, Supabase service role) in Route Handlers or Server Components?
- [ ] **Hardcoded values:** No API keys, URLs, or magic numbers in the code

Ref: Rule 40 — [AI-Specific Code Review](https://graphite.com/guides/ai-code-review-implementation-best-practices)
