// Role classification prompt — used to understand job function and automation exposure
// before running the full risk score calculation.

export interface ClassificationResult {
  primaryFunction: 'strategic' | 'operational' | 'executional' | 'technical' | 'hybrid';
  automationExposure: 'high' | 'medium' | 'low';
  automationReason: string;
  understatesResponsibility: boolean;
}

/**
 * Builds the user-turn prompt for role classification.
 * The response will be a JSON object matching ClassificationResult.
 */
export function buildClassifyPrompt(
  jobTitle: string,
  industry: string,
  tools: string[],
): string {
  const toolList = tools.length > 0 ? tools.join(', ') : 'none specified';

  return `CONTEXT:
You are a labour-market analyst specialising in automation risk and occupational classification.

INPUT:
- Job title: ${jobTitle}
- Industry: ${industry}
- Tools / technologies used: ${toolList}

TASK:
1. Classify the PRIMARY FUNCTION of this role into one of five categories:
   - strategic: sets direction, manages ambiguity, owns outcomes (e.g. VP, Head of, Director)
   - operational: coordinates processes, enforces standards, manages throughput (e.g. ops manager, project manager)
   - executional: carries out defined tasks with limited discretion (e.g. data entry, customer service rep)
   - technical: applies specialist knowledge to build or solve (e.g. engineer, analyst, designer)
   - hybrid: genuinely spans two or more of the above with roughly equal weight

2. Assess AUTOMATION EXPOSURE based on how much of the core work could be automated
   by current or near-term AI / robotics within the next 3–5 years:
   - high:   > 60 % of tasks automatable
   - medium: 30–60 % automatable
   - low:    < 30 % automatable

3. Write a single-sentence AUTOMATION REASON explaining the key driver of that exposure.

4. Set UNDERSTATES_RESPONSIBILITY to true if the job title is likely a modest description
   of a more senior role (e.g. "co-ordinator" doing head-of-department work).

FORMAT:
Respond ONLY with valid JSON — no markdown, no backticks, no text outside the object:
{
  "primaryFunction": "strategic" | "operational" | "executional" | "technical" | "hybrid",
  "automationExposure": "high" | "medium" | "low",
  "automationReason": string,
  "understatesResponsibility": boolean
}

GUARDRAILS:
- Do not invent skills or experience not mentioned in the input
- Base automation exposure on the tools listed, not on assumptions about the industry alone
- Keep automationReason to one sentence, plain English, no jargon`;
}
