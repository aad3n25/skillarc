// Server-side only — never import from client components.
// Calls Claude to generate the weighted career risk score.

import Anthropic from '@anthropic-ai/sdk';
import {
  buildAssessPrompt,
  type AssessmentResponses,
  type RiskScoreResult,
} from '@/prompts/assess';
import type { ClassificationResult } from '@/prompts/classify';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generates a career risk score using Claude.
 * Returns a RiskScoreResult with headline score, confidence,
 * weighted breakdown, skills snapshot, and plain-English summary.
 */
export async function generateRiskScore(
  responses: AssessmentResponses,
  classification: ClassificationResult,
): Promise<RiskScoreResult> {
  const prompt = buildAssessPrompt(responses, classification);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  });

  // Extract the text content block from the response
  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Claude returned no text content during risk scoring');
  }

  const raw = textBlock.text;

  // Strip any accidental markdown fences before parsing
  const cleaned = raw.replace(/```json\n?|```\n?/g, '').trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `Risk score generation failed — Claude response was not valid JSON. Raw: ${raw.slice(0, 200)}`,
    );
  }

  // Validate the critical fields before returning
  const result = parsed as Record<string, unknown>;

  const validConfidence = ['HIGH', 'MODERATE', 'LOW'];

  if (
    typeof result.headline_score !== 'number' ||
    result.headline_score < 0 ||
    result.headline_score > 100 ||
    !validConfidence.includes(result.confidence as string) ||
    typeof result.breakdown !== 'object' ||
    result.breakdown === null ||
    typeof result.skills_snapshot !== 'object' ||
    result.skills_snapshot === null ||
    !Array.isArray(result.assumed_inputs) ||
    typeof result.summary !== 'string'
  ) {
    throw new Error(
      `Risk score returned an unexpected shape. Raw: ${raw.slice(0, 200)}`,
    );
  }

  return result as unknown as RiskScoreResult;
}
