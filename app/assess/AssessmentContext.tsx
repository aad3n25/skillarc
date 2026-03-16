'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AssessmentAnswers {
  // Screen 1 — About Your Role
  jobTitle: string;
  industry: string;
  yearsInRole: string;
  dailyTools: string[];
  dailyToolsOther: string;

  // Screen 2 — About Your Future
  aiConcernLevel: number; // 1-5, 0 = not yet answered
  consideredCareerChange: 'Yes' | 'No' | 'Not sure' | '';
  biggestConcern: string;
  skillsToDevelop: string[];
  learningHoursPerWeek: string;
  preferredLearningFormat: string;

  // Screen 3 — About Your Situation
  salaryRange: string; // optional
  nextRolePriorities: string[]; // ordered list of 5 items
  holdingBack: string[];

  // Screen 4 — Email capture
  email: string;
}

export interface AssessmentState {
  currentScreen: 0 | 1 | 2 | 3;
  answers: AssessmentAnswers;
  errors: Partial<Record<string, string>>;
  isSubmitting: boolean;
}

type AssessmentAction =
  | { type: 'SET_FIELD'; field: keyof AssessmentAnswers; value: AssessmentAnswers[keyof AssessmentAnswers] }
  | { type: 'SET_SCREEN'; screen: 0 | 1 | 2 | 3 }
  | { type: 'SET_ERRORS'; errors: Partial<Record<string, string>> }
  | { type: 'SET_SUBMITTING'; value: boolean };

// ─── Initial state ────────────────────────────────────────────────────────────

const PRIORITY_ITEMS = [
  'Salary increase',
  'Work flexibility',
  'Meaningful impact',
  'Learning & growth',
  'Job stability',
];

const initialAnswers: AssessmentAnswers = {
  jobTitle: '',
  industry: '',
  yearsInRole: '',
  dailyTools: [],
  dailyToolsOther: '',
  aiConcernLevel: 0,
  consideredCareerChange: '',
  biggestConcern: '',
  skillsToDevelop: [],
  learningHoursPerWeek: '',
  preferredLearningFormat: '',
  salaryRange: '',
  nextRolePriorities: PRIORITY_ITEMS,
  holdingBack: [],
  email: '',
};

const initialState: AssessmentState = {
  currentScreen: 0,
  answers: initialAnswers,
  errors: {},
  isSubmitting: false,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function assessmentReducer(state: AssessmentState, action: AssessmentAction): AssessmentState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        answers: { ...state.answers, [action.field]: action.value },
        // Clear error for the field being updated
        errors: { ...state.errors, [action.field]: undefined },
      };
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.screen, errors: {} };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.value };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AssessmentContextValue {
  state: AssessmentState;
  dispatch: React.Dispatch<AssessmentAction>;
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(assessmentReducer, initialState);
  return (
    <AssessmentContext.Provider value={{ state, dispatch }}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment(): AssessmentContextValue {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error('useAssessment must be used within AssessmentProvider');
  return ctx;
}
