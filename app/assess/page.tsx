'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AssessmentProvider, useAssessment } from './AssessmentContext';
import ProgressBar from './ProgressBar';
import RoleScreen from './RoleScreen';
import FutureScreen from './FutureScreen';
import SituationScreen from './SituationScreen';
import EmailScreen from './EmailScreen';
import { screen1Schema } from './RoleScreen';
import { screen2Schema } from './FutureScreen';
import { screen3Schema } from './SituationScreen';
import { screen4Schema } from './EmailScreen';
import { ZodError } from 'zod';

// ─── Inner component (needs access to context) ────────────────────────────────

function AssessmentInner() {
  const { state, dispatch } = useAssessment();
  const { currentScreen, answers, isSubmitting } = state;
  const router = useRouter();

  // Controls the CSS fade-in animation key so it re-triggers on screen change
  const [fadeKey, setFadeKey] = useState(0);

  // ── Validation helpers ────────────────────────────────────────────────────

  function validateScreen(): boolean {
    try {
      if (currentScreen === 0) {
        screen1Schema.parse({
          jobTitle: answers.jobTitle,
          industry: answers.industry,
          yearsInRole: answers.yearsInRole,
          dailyTools: answers.dailyTools,
        });
      } else if (currentScreen === 1) {
        screen2Schema.parse({
          aiConcernLevel: answers.aiConcernLevel,
          consideredCareerChange: answers.consideredCareerChange,
          biggestConcern: answers.biggestConcern,
          skillsToDevelop: answers.skillsToDevelop,
          learningHoursPerWeek: answers.learningHoursPerWeek,
          preferredLearningFormat: answers.preferredLearningFormat,
        });
      } else if (currentScreen === 2) {
        screen3Schema.parse({
          nextRolePriorities: answers.nextRolePriorities,
          holdingBack: answers.holdingBack,
        });
      } else {
        screen4Schema.parse({ email: answers.email });
      }
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        const errorMap: Partial<Record<string, string>> = {};
        for (const issue of err.issues) {
          const field = issue.path[0] as string;
          if (field && !errorMap[field]) {
            errorMap[field] = issue.message;
          }
        }
        dispatch({ type: 'SET_ERRORS', errors: errorMap });
      }
      return false;
    }
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  function goNext() {
    if (!validateScreen()) return;
    const next = (currentScreen + 1) as 0 | 1 | 2 | 3;
    dispatch({ type: 'SET_SCREEN', screen: next });
    setFadeKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    const prev = (currentScreen - 1) as 0 | 1 | 2 | 3;
    dispatch({ type: 'SET_SCREEN', screen: prev });
    setFadeKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Submit — fires on screen 3 (email) only ───────────────────────────────

  async function handleSubmit() {
    if (!validateScreen()) return;

    dispatch({ type: 'SET_SUBMITTING', value: true });

    try {
      const payload = {
        email: answers.email,
        jobTitle: answers.jobTitle,
        industry: answers.industry,
        yearsInRole: answers.yearsInRole,
        dailyTools: answers.dailyTools,
        dailyToolsOther: answers.dailyToolsOther,
        aiConcernLevel: answers.aiConcernLevel,
        consideredCareerChange: answers.consideredCareerChange,
        biggestConcern: answers.biggestConcern,
        skillsToDevelop: answers.skillsToDevelop,
        learningHoursPerWeek: answers.learningHoursPerWeek,
        preferredLearningFormat: answers.preferredLearningFormat,
        salaryRange: answers.salaryRange,
        nextRolePriorities: answers.nextRolePriorities,
        holdingBack: answers.holdingBack,
      };

      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Non-blocking — route not yet implemented during development
        console.error('Assessment API responded with', res.status);
      }

      router.push('/assess/confirm');
    } catch (err) {
      console.error('Failed to submit assessment', err);
      // Still navigate — the confirm page can handle the pending state
      router.push('/assess/confirm');
    } finally {
      dispatch({ type: 'SET_SUBMITTING', value: false });
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Top nav — minimal brand wordmark */}
      <nav className="flex items-center justify-between px-4 py-5 sm:px-8">
        <span className="text-sm font-bold tracking-tight text-white">
          Skill<span className="text-blue-500">Arc</span>
        </span>
        <span className="text-xs text-slate-500">Free assessment</span>
      </nav>

      {/* Content column */}
      <main className="mx-auto w-full max-w-lg px-4 pb-24 pt-6 sm:px-6">
        <ProgressBar currentScreen={currentScreen} />

        {/* Screen wrapper — fade-in keyed on screen change */}
        <div key={fadeKey} className="animate-fadeIn">
          {currentScreen === 0 && <RoleScreen />}
          {currentScreen === 1 && <FutureScreen />}
          {currentScreen === 2 && <SituationScreen />}
          {currentScreen === 3 && <EmailScreen />}
        </div>

        {/* Navigation buttons */}
        <div className="mt-10 flex items-center gap-4">
          {/* Back button — screens 1 and 2 only; hidden on email screen per spec */}
          {currentScreen > 0 && currentScreen < 3 && (
            <button
              type="button"
              onClick={goBack}
              className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-white/40 hover:text-white"
            >
              ← Back
            </button>
          )}

          {/* CTA: Next (0-1) → Get My Career Score (2) → Send My Results (3) */}
          {currentScreen < 2 && (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 rounded-xl bg-blue-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-400 hover:shadow-blue-500/40"
            >
              Next →
            </button>
          )}

          {currentScreen === 2 && (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 rounded-xl bg-blue-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-400 hover:shadow-blue-500/40"
            >
              Get My Career Score →
            </button>
          )}

          {currentScreen === 3 && (
            <div className="flex-1 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full rounded-xl bg-blue-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-400 hover:shadow-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSubmitting ? 'Sending…' : 'Send My Results →'}
              </button>
              <p className="text-xs text-slate-500">No spam. Unsubscribe any time.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Page export — wraps inner component with context provider ────────────────

export default function AssessPage() {
  return (
    <AssessmentProvider>
      <AssessmentInner />
    </AssessmentProvider>
  );
}
