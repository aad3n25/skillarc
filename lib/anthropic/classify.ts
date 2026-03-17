// Server-side only — never import from client components.
// Calls Claude to classify a job role before risk scoring.

import Anthropic from '@anthropic-ai/sdk';
import { buildClassifyPrompt, type ClassificationResult } from '@/prompts/classify';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Classifies a job role using Claude.
 * Returns a ClassificationResult with primary function, automation exposure,
 * a one-sentence reason, and whether the title understates seniority.
 */
export async function classifyRole(
  jobTitle: string,
  industry: string,
  tools: string[],
): Promise<ClassificationResult> {
  const prompt = buildClassifyPrompt(jobTitle, industry, tools);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  });

  // Extract the text content block from the response
  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Claude returned no text content during role classification');
  }

  const raw = textBlock.text;

  // Strip any accidental markdown fences before parsing
  const cleaned = raw.replace(/```json\n?|```\n?/g, '').trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `Role classification failed — Claude response was not valid JSON. Raw: ${raw.slice(0, 200)}`,
    );
  }

  // Validate the shape before returning
  const result = parsed as Record<string, unknown>;

  const validFunctions = ['strategic', 'operational', 'executional', 'technical', 'hybrid'];
  const validExposures = ['high', 'medium', 'low'];

  if (
    !validFunctions.includes(result.primaryFunction as string) ||
    !validExposures.includes(result.automationExposure as string) ||
    typeof result.automationReason !== 'string' ||
    typeof result.understatesResponsibility !== 'boolean'
  ) {
    throw new Error(
      `Role classification returned an unexpected shape. Raw: ${raw.slice(0, 200)}`,
    );
  }

  return result as unknown as ClassificationResult;
}
