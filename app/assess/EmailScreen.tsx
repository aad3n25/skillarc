'use client';

import { z } from 'zod';
import { useAssessment } from './AssessmentContext';

// ─── Validation schema for screen 4 ──────────────────────────────────────────

export const screen4Schema = z.object({
  // Regex covers standard email format without relying on Zod v4 format methods
  email: z
    .string()
    .min(1, 'Please enter your email address')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'),
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmailScreen() {
  const { state, dispatch } = useAssessment();
  const { answers, errors } = state;

  return (
    <div className="space-y-6 text-center">
      {/* Envelope icon */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/15">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-400"
          aria-hidden="true"
        >
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white">
          Where should we send your results?
        </h2>
        <p className="mt-2 text-slate-400 text-sm leading-relaxed">
          Your career risk score and skills snapshot will be in your inbox within 2 minutes.
        </p>
      </div>

      {/* Email input */}
      <div className="text-left">
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={answers.email}
          onChange={(e) =>
            dispatch({ type: 'SET_FIELD', field: 'email', value: e.target.value })
          }
          className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-center text-base"
        />
        {errors.email && (
          <p className="mt-1.5 text-sm text-red-400 text-center">{errors.email}</p>
        )}
      </div>
    </div>
  );
}
