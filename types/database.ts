// ─── Shared primitives ────────────────────────────────────────────────────────

/** ISO 8601 timestamp string as returned by Supabase */
type ISOTimestamp = string;

// ─── career_assessments ───────────────────────────────────────────────────────

// ─── users ────────────────────────────────────────────────────────────────────

/** Row shape for the `users` table */
export interface User {
  id: string;
  email: string;
  created_at: ISOTimestamp;
}

// ─── career_assessments ───────────────────────────────────────────────────────

/** Row shape for the `career_assessments` table */
export interface CareerAssessment {
  id: string;
  user_id: string; // FK → users.id

  // Raw answers stored as submitted
  responses: Record<string, unknown>;
  cv_file_url: string | null;

  // Scoring outputs — null until Claude has processed the submission
  risk_score: number | null;
  risk_score_confidence: string | null; // "HIGH" | "MODERATE" | "LOW"
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
// Uses the same conventions as Supabase CLI-generated types so that supabase-js
// generic constraints resolve correctly.  Empty collections use the mapped-type
// `{ [_ in never]: never }` pattern rather than `Record<string, never>`.

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
        };
        Relationships: [];
      };
      career_assessments: {
        Row: {
          id: string;
          user_id: string;
          responses: Record<string, unknown>;
          cv_file_url: string | null;
          risk_score: number | null;
          risk_score_confidence: string | null;
          risk_score_breakdown: RiskScoreBreakdown | null;
          role_classification: string | null;
          status: AssessmentStatus;
          free_results: FreeResults | null;
          paid_report: PaidReport | null;
          paid_report_qa: boolean;
          email_sent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          responses: Record<string, unknown>;
          cv_file_url?: string | null;
          risk_score?: number | null;
          risk_score_confidence?: string | null;
          risk_score_breakdown?: RiskScoreBreakdown | null;
          role_classification?: string | null;
          status?: AssessmentStatus;
          free_results?: FreeResults | null;
          paid_report?: PaidReport | null;
          paid_report_qa?: boolean;
          email_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          responses?: Record<string, unknown>;
          cv_file_url?: string | null;
          risk_score?: number | null;
          risk_score_confidence?: string | null;
          risk_score_breakdown?: RiskScoreBreakdown | null;
          role_classification?: string | null;
          status?: AssessmentStatus;
          free_results?: FreeResults | null;
          paid_report?: PaidReport | null;
          paid_report_qa?: boolean;
          email_sent?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      career_reports: {
        Row: {
          id: string;
          user_id: string;
          assessment_id: string;
          report_content: PaidReport;
          generated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          assessment_id: string;
          report_content: PaidReport;
          generated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          assessment_id?: string;
          report_content?: PaidReport;
          generated_at?: string;
        };
        Relationships: [];
      };
      report_purchases: {
        Row: {
          id: string;
          user_id: string;
          assessment_id: string;
          stripe_session_id: string;
          amount: number;
          currency: string;
          status: PurchaseStatus;
          purchased_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          assessment_id: string;
          stripe_session_id: string;
          amount: number;
          currency: string;
          status?: PurchaseStatus;
          purchased_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          assessment_id?: string;
          stripe_session_id?: string;
          amount?: number;
          currency?: string;
          status?: PurchaseStatus;
          purchased_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
