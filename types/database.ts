// ─── Shared primitives ────────────────────────────────────────────────────────

/** ISO 8601 timestamp string as returned by Supabase */
type ISOTimestamp = string;

// ─── career_assessments ───────────────────────────────────────────────────────

/** Row shape for the `career_assessments` table */
export interface CareerAssessment {
  id: string;
  user_id: string | null; // null for anonymous/pre-auth submissions
  email: string;

  // Raw answers stored as submitted
  answers: Record<string, unknown>;
  cv_path: string | null;

  // Scoring outputs — null until Claude has processed the submission
  risk_score: number | null;
  risk_score_confidence: number | null; // 0-1 float
  risk_score_breakdown: RiskScoreBreakdown | null;
  role_classification: string | null;

  // Lifecycle status
  status: AssessmentStatus;

  // Structured Claude outputs for the free results page
  free_results: FreeResults | null;

  // Full paid report content (3 pathways) — null until purchased + generated
  paid_report: PaidReport | null;

  // QA flag set after human or automated review of paid report
  paid_report_qa: boolean;

  // Whether the results email has been dispatched
  email_sent: boolean;

  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
}

export type AssessmentStatus =
  | 'pending'      // submitted, awaiting Claude processing
  | 'processing'   // Claude is generating the score
  | 'scored'       // free results ready
  | 'purchased'    // payment confirmed, report generation queued
  | 'report_ready' // paid report generated and available
  | 'failed';      // Claude or processing error — check error logs

/** Top-level factors that contributed to the risk score */
export interface RiskFactor {
  factor: string;
  impact: 'positive' | 'negative';
  weight: number; // 0-1
}

/** Skill trend data for the skills snapshot */
export interface SkillSnapshot {
  skill: string;
  trend: 'rising' | 'stable' | 'falling';
  relevance: number; // 0-1
}

/** Structured breakdown stored in `risk_score_breakdown` */
export interface RiskScoreBreakdown {
  topFactors: RiskFactor[];
  skillsSnapshot: SkillSnapshot[];
  recommendedDirection: string;
  summary: string;
}

/** Content shown on the free /results page */
export interface FreeResults {
  riskScore: number;
  confidence: number;
  topFactors: RiskFactor[];
  skillsSnapshot: SkillSnapshot[];
  recommendedDirection: string;
  summary: string;
}

// ─── career_reports ───────────────────────────────────────────────────────────

/** A single career transition pathway within the paid report */
export interface CareerPathway {
  title: string;
  description: string;
  matchScore: number; // 0-100
  timeToTransition: string;
  salaryRange: string;
  requiredSkills: string[];
  skillGaps: string[];
  firstSteps: string[];
}

/** Full paid report content stored in `paid_report` / `career_reports.report_content` */
export interface PaidReport {
  pathways: [CareerPathway, CareerPathway, CareerPathway]; // always 3
  executiveSummary: string;
  generatedAt: ISOTimestamp;
}

/** Row shape for the `career_reports` table */
export interface CareerReport {
  id: string;
  user_id: string;
  assessment_id: string;
  report_content: PaidReport;
  generated_at: ISOTimestamp;
}

// ─── report_purchases ─────────────────────────────────────────────────────────

export type PurchaseStatus = 'pending' | 'completed' | 'refunded';

/** Row shape for the `report_purchases` table */
export interface ReportPurchase {
  id: string;
  user_id: string;
  assessment_id: string;
  stripe_session_id: string;
  amount: number; // in pence (e.g. 1900 = £19.00)
  currency: string; // 'gbp'
  status: PurchaseStatus;
  purchased_at: ISOTimestamp | null; // set on webhook confirmation
  created_at: ISOTimestamp;
}

// ─── Database type map (passed to createClient<Database>()) ──────────────────

export interface Database {
  public: {
    Tables: {
      career_assessments: {
        Row: CareerAssessment;
        Insert: Omit<CareerAssessment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CareerAssessment, 'id' | 'created_at'>>;
      };
      career_reports: {
        Row: CareerReport;
        Insert: Omit<CareerReport, 'id'>;
        Update: Partial<Omit<CareerReport, 'id'>>;
      };
      report_purchases: {
        Row: ReportPurchase;
        Insert: Omit<ReportPurchase, 'id' | 'created_at'>;
        Update: Partial<Omit<ReportPurchase, 'id' | 'created_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
