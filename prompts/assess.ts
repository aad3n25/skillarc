// Career risk scoring prompt — weighted multi-factor assessment.
// Called after role classification to produce the free results score.

import type { ClassificationResult } from './classify';

/** The 10-question assessment answers collected from the user */
export interface AssessmentResponses {
  jobTitle: string;
  industry: string;
  yearsExperience: number;
  tools: string[];             // tools / technologies currently used
  educationLevel: string;
  targetDirection: string;     // where the user wants to transition to
  financialRunway: string;     // e.g. "3-6 months"
  concernLevel: number;        // 1-10 self-reported concern about career security
  recentLearning: string;      // any upskilling in the past 12 months
  employerDependency: string;  // e.g. "single employer, public sector"
}

export interface ScoreBreakdownItem {
  score: number;
  weight: number;
  evidenced: boolean;
}

export interface RiskScoreResult {
  headline_score: number;
  confidence: 'HIGH' | 'MODERATE' | 'LOW';
  breakdown: {
    automation_exposure: ScoreBreakdownItem;
    skill_recency: ScoreBreakdownItem;
    market_demand: ScoreBreakdownItem;
    trajectory_breadth: ScoreBreakdownItem;
    employer_dependency: ScoreBreakdownItem;
  };
  skills_snapshot: {
    core: string[];
    emerging: string[];
    developing: string[];
  };
  assumed_inputs: string[];
  summary: string;
}

/**
 * Builds the user-turn prompt for career risk scoring.
 * The response will be a JSON object matching RiskScoreResult.
 */
export function buildAssessPrompt(
  responses: AssessmentResponses,
  classification: ClassificationResult,
): string {
  return `CONTEXT:
You are a career transition risk analyst. You have received a user's career assessment answers
and a pre-computed role classification.

ASSESSMENT ANSWERS:
- Job title: ${responses.jobTitle}
- Industry: ${responses.industry}
- Years of experience: ${responses.yearsExperience}
- Tools / technologies: ${responses.tools.length > 0 ? responses.tools.join(', ') : 'none specified'}
- Education level: ${responses.educationLevel}
- Target direction: ${responses.targetDirection}
- Financial runway: ${responses.financialRunway}
- Concern level (1–10, self-reported): ${responses.concernLevel}
- Recent learning (past 12 months): ${responses.recentLearning || 'none mentioned'}
- Employer / sector dependency: ${responses.employerDependency}

ROLE CLASSIFICATION:
- Primary function: ${classification.primaryFunction}
- Automation exposure: ${classification.automationExposure}
- Automation reason: ${classification.automationReason}
- Understates responsibility: ${classification.understatesResponsibility}

TASK:
Calculate a career transition risk score from 0 (no risk) to 100 (extreme risk) using
EXACTLY these five weighted inputs:

| Input                        | Weight |
|------------------------------|--------|
| Role automation exposure     | 30 %   |
| Skill recency                | 25 %   |
| Market demand signal         | 20 %   |
| Career trajectory breadth    | 15 %   |
| Dependency on single employer/sector | 10 % |

SCORING RULES:
- Each input scores 0–100 independently (higher = more risk).
- Weighted sum gives headline_score.
- If evidence for an input is insufficient, assign score 50 (neutral midpoint),
  set evidenced: false, and add the input name to assumed_inputs.
- confidence reflects how much of the score is evidence-based:
    HIGH     = all 5 inputs evidenced
    MODERATE = 3–4 inputs evidenced
    LOW      = fewer than 3 inputs evidenced

skills_snapshot should reflect the user's stated tools and experience:
- core:      skills the user actively uses and are market-relevant now
- emerging:  skills the user is developing or that complement their direction
- developing: skills they should prioritise to reduce risk

FORMAT:
Respond ONLY with valid JSON — no markdown, no backticks, no text outside the object:
{
  "headline_score": number (0–100 integer),
  "confidence": "HIGH" | "MODERATE" | "LOW",
  "breakdown": {
    "automation_exposure":  { "score": number, "weight": 0.30, "evidenced": boolean },
    "skill_recency":        { "score": number, "weight": 0.25, "evidenced": boolean },
    "market_demand":        { "score": number, "weight": 0.20, "evidenced": boolean },
    "trajectory_breadth":   { "score": number, "weight": 0.15, "evidenced": boolean },
    "employer_dependency":  { "score": number, "weight": 0.10, "evidenced": boolean }
  },
  "skills_snapshot": {
    "core":       string[],
    "emerging":   string[],
    "developing": string[]
  },
  "assumed_inputs": string[],
  "summary": string (2–3 sentences, plain English, no jargon)
}

GUARDRAILS:
- Do not invent qualifications or experience not present in the input
- Do not provide salary predictions or financial advice
- Do not reference the user's concern level score directly in the summary
- Keep the summary factual and constructive`;
}
