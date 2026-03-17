// POST /api/assess
// Accepts 10-question assessment answers, runs role classification + risk scoring
// via Claude, persists results to career_assessments, and returns the assessment ID.
// No auth required — the free assessment is anonymous.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { classifyRole } from '@/lib/anthropic/classify';
import { generateRiskScore } from '@/lib/anthropic/assess';
import type { AssessmentResponses } from '@/prompts/assess';

// ─── Input schema — mirrors AssessmentAnswers in AssessmentContext.tsx ────────

const AssessmentRequestSchema = z.object({
  email: z.string().email('A valid email address is required'),
  responses: z.object({
    // Screen 1 — About Your Role
    jobTitle: z.string().min(2).max(200),
    industry: z.string().min(2).max(200),
    yearsInRole: z.string().min(1).max(100),
    dailyTools: z.array(z.string().max(100)).max(20),
    dailyToolsOther: z.string().max(500),
    // Screen 2 — About Your Future
    aiConcernLevel: z.number().int().min(0).max(5),
    consideredCareerChange: z.enum(['Yes', 'No', 'Not sure', '']),
    biggestConcern: z.string().max(500),
    skillsToDevelop: z.array(z.string().max(100)).max(20),
    learningHoursPerWeek: z.string().max(100),
    preferredLearningFormat: z.string().max(200),
    // Screen 3 — About Your Situation
    salaryRange: z.string().max(100),
    nextRolePriorities: z.array(z.string().max(200)).max(10),
    holdingBack: z.array(z.string().max(200)).max(10),
  }),
});

type AssessmentRequest = z.infer<typeof AssessmentRequestSchema>;

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  // 1. Parse and validate request body
  let body: AssessmentRequest;
  try {
    const raw = await request.json() as unknown;
    console.log('[assess:body]', JSON.stringify(raw, null, 2));
    const result = AssessmentRequestSchema.safeParse(raw);
    if (!result.success) {
      console.log('[assess:validation]', JSON.stringify(result.error.flatten(), null, 2));
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: result.error.flatten() },
        { status: 400 },
      );
    }
    body = result.data;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Request body could not be parsed as JSON' },
      { status: 400 },
    );
  }

  const supabase = createClient();

  // 2. Upsert user by email → get the user id for the FK on career_assessments
  const { data: user, error: userError } = await supabase
    .from('users')
    .upsert({ email: body.email }, { onConflict: 'email' })
    .select('id')
    .single();

  if (userError || !user) {
    console.error('[assess] Failed to upsert user record:', userError);
    return NextResponse.json(
      { success: false, error: 'Could not save your assessment. Please try again.' },
      { status: 500 },
    );
  }

  // 3. Insert a placeholder assessment row so the client has an ID to poll
  const { data: insertedRow, error: insertError } = await supabase
    .from('career_assessments')
    .insert({
      user_id: user.id,
      responses: body.responses as Record<string, unknown>,
      status: 'processing',
    })
    .select('id')
    .single();

  if (insertError || !insertedRow) {
    console.error('[assess] Failed to insert assessment record:', insertError);
    return NextResponse.json(
      { success: false, error: 'Could not save your assessment. Please try again.' },
      { status: 500 },
    );
  }

  const assessmentId = insertedRow.id;

  // Helper: mark the record as failed so the client can surface a retry message
  async function markFailed() {
    await supabase
      .from('career_assessments')
      .update({ status: 'failed' })
      .eq('id', assessmentId);
  }

  // 4. Map form fields → AssessmentResponses shape expected by Claude prompts.
  // The form uses its own field names (matching AssessmentContext); Claude prompts
  // use a normalised schema. We translate here so neither side needs to change.
  const {
    jobTitle, industry, yearsInRole, dailyTools, dailyToolsOther,
    aiConcernLevel, biggestConcern, skillsToDevelop,
    learningHoursPerWeek, preferredLearningFormat,
    nextRolePriorities, holdingBack,
  } = body.responses;

  // Include free-text tool entry if the user filled it in
  const tools = dailyToolsOther.trim()
    ? [...dailyTools, dailyToolsOther.trim()]
    : dailyTools;

  // Parse the first number out of strings like "3-5 years" or "< 1 year"
  const yearsMatch = yearsInRole.match(/\d+/);
  const yearsExperience = yearsMatch ? parseInt(yearsMatch[0], 10) : 0;

  const claudeResponses: AssessmentResponses = {
    jobTitle,
    industry,
    yearsExperience,
    tools,
    // Not collected in the form — Claude treats absent evidence as neutral (50)
    educationLevel: 'Not specified',
    // Synthesise target direction from the user's stated concerns and priorities
    targetDirection: [biggestConcern, ...skillsToDevelop, ...nextRolePriorities]
      .filter(Boolean)
      .join('; '),
    financialRunway: 'Not specified',
    concernLevel: aiConcernLevel,
    recentLearning: [learningHoursPerWeek, preferredLearningFormat]
      .filter(Boolean)
      .join(', '),
    // Barriers to change give Claude signal on dependency / inertia
    employerDependency: holdingBack.length > 0 ? holdingBack.join('; ') : 'Not specified',
  };

  // 5. Run role classification
  let classification;
  try {
    classification = await classifyRole(jobTitle, industry, tools);
  } catch (err) {
    console.error('[assess] classifyRole failed:', err);
    await markFailed();
    return NextResponse.json(
      { success: false, error: 'Role classification failed. Please try again.' },
      { status: 500 },
    );
  }

  // 6. Run risk scoring (depends on classification from step 5)
  let riskResult;
  try {
    riskResult = await generateRiskScore(claudeResponses, classification);
  } catch (err) {
    console.error('[assess] generateRiskScore failed:', err);
    await markFailed();
    return NextResponse.json(
      { success: false, error: 'Risk score generation failed. Please try again.' },
      { status: 500 },
    );
  }

  // 7. Persist results — store confidence string directly as TEXT
  const { error: updateError } = await supabase
    .from('career_assessments')
    .update({
      status: 'scored',
      risk_score: riskResult.headline_score,
      risk_score_confidence: riskResult.confidence,
      // Store the full weighted breakdown (JSONB column accepts this shape)
      risk_score_breakdown: riskResult.breakdown as unknown as import('@/types/database').RiskScoreBreakdown,
      // Store the string label on the classification column alongside the object
      role_classification: JSON.stringify(classification),
      // Store the complete Claude output for the free results page
      free_results: riskResult as unknown as import('@/types/database').FreeResults,
    })
    .eq('id', assessmentId);

  if (updateError) {
    console.error('[assess] Failed to update assessment with results:', updateError);
    await markFailed();
    return NextResponse.json(
      { success: false, error: 'Failed to save results. Please try again.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, assessmentId });
}
