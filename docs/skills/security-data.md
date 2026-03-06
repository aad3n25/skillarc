# Skill: Security & Data Protection — SkillArc

## When to Use
Reference this skill whenever you are working on authentication, file uploads, payment processing, API route protection, database policies, or anything touching user personal data (CV content, assessment answers, account info).

---

## 1. Validate Every Input with Zod at the Boundary

Every API route must validate its input before doing anything else. Define schemas in `lib/validators/` and reuse them across server and client.

```typescript
// lib/validators/assessment.ts
import { z } from 'zod';

export const AssessmentAnswersSchema = z.object({
  currentRole: z.string().min(2).max(200),
  yearsExperience: z.number().int().min(0).max(60),
  targetIndustry: z.string().min(2).max(200),
  financialRunway: z.enum(['< 3 months', '3-6 months', '6-12 months', '12+ months']),
  // ... all 10 questions with tight constraints (role, years, tools, industry, concern level, goals, etc.)
});

export type AssessmentAnswers = z.infer<typeof AssessmentAnswersSchema>;
```

```typescript
// app/api/assessment/route.ts
import { AssessmentAnswersSchema } from '@/lib/validators/assessment';

export async function POST(req: Request) {
  const body = await req.json();
  
  const result = AssessmentAnswersSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: 'Invalid input', details: result.error.flatten() },
      { status: 400 }
    );
  }
  
  // Only use result.data from here — never raw body
  const answers = result.data;
  // ...
}
```

**Apply to:** Assessment form submissions, CV upload metadata, Stripe webhook payloads, tutor chat messages.

Ref: Rule 26 — [Input Validation](https://www.qodo.ai/blog/3-steps-securing-your-ai-generated-code/)

---

## 2. CV Upload Security Checklist

CV files contain personally identifiable information. Every upload must pass these checks:

```typescript
// app/api/upload/route.ts
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  const session = await getServerSession(); // Check auth FIRST
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('cv') as File;

  // Type check (don't trust Content-Type header alone)
  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ error: 'Only PDF and DOCX files accepted' }, { status: 400 });
  }

  // Size check
  if (file.size > MAX_SIZE) {
    return Response.json({ error: 'File must be under 5MB' }, { status: 400 });
  }

  // Generate safe filename — NEVER use the original filename
  const safeFilename = `${session.user.id}/${crypto.randomUUID()}.${file.type === 'application/pdf' ? 'pdf' : 'docx'}`;

  // Upload to Supabase Storage (authenticated bucket)
  const { error } = await supabase.storage
    .from('cvs')
    .upload(safeFilename, file, { upsert: false });

  if (error) throw error;

  return Response.json({ path: safeFilename });
}
```

**Supabase Storage policy:** The `cvs` bucket must be set to private. Create an RLS policy so users can only read/delete their own files (where path starts with their user ID).

---

## 3. Supabase Row Level Security — Every Table

No table should exist without RLS. Here's the pattern for SkillArc:

```sql
-- Enable RLS on all tables (do this for every new table)
ALTER TABLE career_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE pathway_enrollments ENABLE ROW LEVEL SECURITY;  -- Phase 2
ALTER TABLE learner_profiles ENABLE ROW LEVEL SECURITY;     -- Phase 2

-- Users can only see their own assessments
CREATE POLICY "Users read own assessments"
  ON career_assessments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own assessments
CREATE POLICY "Users insert own assessments"
  ON career_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Same pattern for career_reports, report_purchases, etc.
-- Service role (API routes) can update career_reports after generation
-- Use supabase service role client ONLY in server-side API routes
```

**Rule of thumb:** If you can't explain who should and shouldn't see a row, don't create the table yet.

---

## 4. Stripe Webhook Verification

Never process a payment event without verifying its signature:

```typescript
// app/api/stripe/webhook/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text(); // Must be raw text, not parsed JSON
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    // Update purchase record in Supabase using service role client
    // THEN trigger report generation
  }

  return Response.json({ received: true });
}
```

**Critical:** The route must read the raw request body (not `req.json()`). Configure the Next.js route segment to disable body parsing if needed.

---

## 5. API Key and Secret Management

```
NEVER in client code:
  ✗ process.env.ANTHROPIC_API_KEY in a 'use client' component
  ✗ Supabase service_role key in browser bundle
  ✗ Stripe secret key anywhere except API routes

ALWAYS:
  ✓ NEXT_PUBLIC_ prefix ONLY for truly public values (Supabase anon key, Stripe publishable key)
  ✓ All other keys in .env.local without NEXT_PUBLIC_ prefix
  ✓ Vercel environment variables for production
  ✓ Rotate keys immediately if accidentally committed to git
```

Add to `.gitignore`:
```
.env.local
.env*.local
```

---

## 6. GDPR Compliance Minimum

Since you handle CV data from UK/EU users:

- **Data export:** Provide an API route that returns all user data as JSON (assessment answers, reports, CV metadata)
- **Account deletion:** When a user deletes their account, also delete their CV from Supabase Storage and all rows from `career_assessments`, `career_reports`, `report_purchases`, `pathway_enrollments`, and `learner_profiles`
- **Privacy policy:** State what data is sent to the Claude API (assessment answers, CV text) and that it is processed by Anthropic
- **Retention:** Don't store CV text longer than needed — extract what you need for the report, then consider deleting the raw file after 30 days

Ref: Rules 25, 27 — [Security Review](https://blogs.cisco.com/ai/announcing-new-framework-securing-ai-generated-code), [OWASP](https://www.stackhawk.com/blog/4-best-practices-for-ai-code-security-a-developers-guide/)

---

## 7. Security Review Checklist (Run Before Every Deploy)

Before merging or deploying, check:

- [ ] No API keys in client components (search codebase for `ANTHROPIC_API_KEY`, `STRIPE_SECRET`, `service_role`)
- [ ] All new API routes check auth session at the top
- [ ] All new database tables have RLS enabled with policies
- [ ] All user input is validated with Zod before use
- [ ] Stripe webhook signature is verified
- [ ] CV uploads check file type and size
- [ ] Error messages don't leak internal details to the client
- [ ] Sentry is capturing errors in all catch blocks
