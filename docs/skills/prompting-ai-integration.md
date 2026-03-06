# Skill: Prompting & AI Integration — SkillArc

## When to Use
Reference this skill whenever you are writing, editing, or debugging Claude API calls — including system prompts, scoring logic, report generation, CV parsing, or the Phase 2 AI tutor.

---

## 1. Structure Every Claude Prompt with Context → Task → Format

Every prompt sent to the Claude API must follow this pattern:

```
CONTEXT:  Who Claude is, what data it has access to in this call
TASK:     Exactly what to analyse, decide, or generate
FORMAT:   Precise output schema (JSON with field types and constraints)
GUARDRAILS: What NOT to do (hallucinate quals, exceed scope, etc.)
```

**SkillArc example — Career Risk Scoring:**
```typescript
const systemPrompt = `
CONTEXT: You are a career transition risk analyst. You will receive 
a user's answers to 10 career assessment questions and optionally 
their CV text.

TASK: Analyse the user's current career position, transferable skills, 
market demand for their target role, and financial runway to produce 
a career transition risk score from 0 (no risk) to 100 (extreme risk), 
plus a skills snapshot showing which of their skills are rising or 
falling in market demand.

FORMAT: Respond ONLY with valid JSON:
{
  "riskScore": number,         // 0-100 integer
  "confidence": number,        // 0.0-1.0
  "topFactors": [
    { "factor": string, "impact": "positive" | "negative", "weight": number }
  ],
  "skillsSnapshot": [
    { "skill": string, "trend": "rising" | "stable" | "falling", "relevance": number }
  ],
  "recommendedDirection": string,  // single best transition direction
  "summary": string            // 2-3 sentence plain English summary
}

GUARDRAILS:
- Do not invent qualifications or experience not present in the input
- If CV is missing, set confidence below 0.6 and note it in summary
- Do not provide financial advice or salary predictions
`;
```

**Why this matters:** Without explicit format instructions, Claude may return markdown, prose, or inconsistent JSON that breaks your parsing. Without guardrails, it may hallucinate user qualifications.

Ref: Rules 1, 3 — [Structured Prompting](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices), [System Prompts](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

---

## 2. Use Extended Thinking for Multi-Pathway Report Generation

The £19 full report requires Claude to reason across multiple dimensions (skills transfer, market analysis, financial viability) to produce 3 distinct career pathways. Enable extended thinking so Claude can reason before outputting structured JSON.

**When to use extended thinking:**
- Full career transition report (3 pathways)
- Learner profiling in Phase 2 (matching learning style to content)
- Any call where Claude must weigh competing factors

**When NOT to use it:**
- Simple risk score calculation (single output)
- CV text extraction (straightforward parsing)
- Tutor chat responses (latency matters more)

**Implementation:**
```typescript
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 16000,
  thinking: {
    type: 'enabled',
    budget_tokens: 10000
  },
  system: FULL_REPORT_SYSTEM_PROMPT,
  messages: [{ role: 'user', content: formattedUserData }]
});
```

Ref: Rule 38 — [Extended Thinking](https://www.anthropic.com/engineering/claude-code-best-practices)

---

## 3. Parse Claude Responses Defensively

Claude outputs JSON, but you must handle edge cases:

```typescript
// lib/anthropic/parse-response.ts
import { z } from 'zod';

const CareerScoreSchema = z.object({
  riskScore: z.number().int().min(0).max(100),
  confidence: z.number().min(0).max(1),
  topFactors: z.array(z.object({
    factor: z.string(),
    impact: z.enum(['positive', 'negative']),
    weight: z.number()
  })),
  skillsSnapshot: z.array(z.object({
    skill: z.string(),
    trend: z.enum(['rising', 'stable', 'falling']),
    relevance: z.number()
  })),
  recommendedDirection: z.string().min(5),
  summary: z.string().min(10)
});

export function parseCareerScore(raw: string) {
  // Strip markdown fences if Claude adds them despite instructions
  const cleaned = raw.replace(/```json\n?|```\n?/g, '').trim();
  
  try {
    const parsed = JSON.parse(cleaned);
    return CareerScoreSchema.parse(parsed); // Zod validates shape + types
  } catch (error) {
    // Log to Sentry with the raw response for debugging
    console.error('Claude response parsing failed:', { raw, error });
    throw new Error('Career analysis failed. Please try again.');
  }
}
```

**Key principle:** Never trust raw Claude output. Always validate with Zod before using in your UI or database.

---

## 4. Store Prompts as Versioned Constants

Keep all system prompts in `/prompts/*.ts` files so they are:
- Version-controlled in git (you can see what changed and when)
- Easy to A/B test by swapping constants
- Searchable when debugging unexpected Claude outputs

```
prompts/
├── career-score.ts          # Risk scoring system prompt
├── full-report.ts           # £19 report generation prompt
├── cv-parser.ts             # CV text extraction prompt
├── tutor-system.ts          # Phase 2: AI tutor base prompt
└── learner-profile.ts       # Phase 2: learning style analysis
```

Each file exports a single `const` string and a TypeScript interface for the expected response shape.

---

## 5. Cursor-Specific: Use @Symbols for Context

When working in Cursor, always attach relevant context to your prompts:

- **@file** `prompts/career-score.ts` when editing scoring logic
- **@file** `lib/anthropic/parse-response.ts` when debugging parsing
- **@file** `types/assessment.ts` when changing form fields (so Cursor knows the shape)
- **@codebase** when asking "where is X used?" or "what calls this function?"
- **@web** when checking Anthropic SDK docs or Supabase API changes

**Habit:** Before every Cursor prompt, ask yourself "what files does Cursor need to see to give me a correct answer?" and @-reference them.

Ref: Rule 6 — [Cursor @Symbols](https://www.builder.io/blog/cursor-tips)
