'use client';

import { z } from 'zod';
import { useAssessment } from './AssessmentContext';

// ─── Validation schema for screen 1 ──────────────────────────────────────────

export const screen1Schema = z.object({
  jobTitle: z.string().min(1, 'Please enter your current job title'),
  industry: z.string().min(1, 'Please select your industry'),
  yearsInRole: z.string().min(1, 'Please select years in current role'),
  dailyTools: z.array(z.string()).min(1, 'Please select at least one tool'),
});

// ─── Options ──────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Retail',
  'Manufacturing', 'Marketing', 'Legal', 'Construction', 'Hospitality',
  'Government', 'Media', 'Consulting', 'Non-profit', 'Other',
];

const YEARS_OPTIONS = [
  'Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years',
];

const TOOL_OPTIONS = [
  'Microsoft Office',
  'Google Workspace',
  'CRM software',
  'Data/Analytics tools',
  'Design tools',
  'Development tools',
  'Project management tools',
  'Customer support tools',
  'Other',
];

// ─── Shared input/label styles (matching design system) ───────────────────────

const inputClass =
  'w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all';

const labelClass = 'block mb-2 text-sm font-medium text-slate-300';

// ─── Component ────────────────────────────────────────────────────────────────

export default function RoleScreen() {
  const { state, dispatch } = useAssessment();
  const { answers, errors } = state;

  function setField<K extends 'jobTitle' | 'industry' | 'yearsInRole' | 'dailyTools' | 'dailyToolsOther'>(
    field: K,
    value: typeof answers[K],
  ) {
    dispatch({ type: 'SET_FIELD', field, value });
  }

  function toggleTool(tool: string) {
    const current = answers.dailyTools;
    const next = current.includes(tool)
      ? current.filter((t) => t !== tool)
      : [...current, tool];
    setField('dailyTools', next);
  }

  const showOther = answers.dailyTools.includes('Other');

  return (
    <div className="space-y-8">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-white">About Your Role</h2>
        <p className="mt-1 text-slate-400 text-sm">Tell us where you are right now</p>
      </div>

      {/* Q1: Job title */}
      <div>
        <label htmlFor="jobTitle" className={labelClass}>
          What is your current job title?
        </label>
        <input
          id="jobTitle"
          type="text"
          placeholder="e.g. Marketing Manager"
          value={answers.jobTitle}
          onChange={(e) => setField('jobTitle', e.target.value)}
          className={inputClass}
        />
        {errors.jobTitle && (
          <p className="mt-1.5 text-sm text-red-400">{errors.jobTitle}</p>
        )}
      </div>

      {/* Q2: Industry */}
      <div>
        <label htmlFor="industry" className={labelClass}>
          Which industry do you work in?
        </label>
        <select
          id="industry"
          value={answers.industry}
          onChange={(e) => setField('industry', e.target.value)}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="" disabled className="bg-[#0F172A]">
            Select your industry
          </option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind} className="bg-[#0F172A]">
              {ind}
            </option>
          ))}
        </select>
        {errors.industry && (
          <p className="mt-1.5 text-sm text-red-400">{errors.industry}</p>
        )}
      </div>

      {/* Q3: Years in role */}
      <div>
        <label htmlFor="yearsInRole" className={labelClass}>
          How long have you been in your current role?
        </label>
        <select
          id="yearsInRole"
          value={answers.yearsInRole}
          onChange={(e) => setField('yearsInRole', e.target.value)}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="" disabled className="bg-[#0F172A]">
            Select years in role
          </option>
          {YEARS_OPTIONS.map((opt) => (
            <option key={opt} value={opt} className="bg-[#0F172A]">
              {opt}
            </option>
          ))}
        </select>
        {errors.yearsInRole && (
          <p className="mt-1.5 text-sm text-red-400">{errors.yearsInRole}</p>
        )}
      </div>

      {/* Q4: Daily tools — multi-select checkboxes */}
      <div>
        <span className={labelClass}>Which tools or technologies do you use daily?</span>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TOOL_OPTIONS.map((tool) => {
            const checked = answers.dailyTools.includes(tool);
            return (
              <label
                key={tool}
                className={[
                  'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-150',
                  checked
                    ? 'border-blue-500 bg-blue-500/15'
                    : 'border-white/15 bg-white/5 hover:border-white/30',
                ].join(' ')}
              >
                {/* Custom checkbox */}
                <span
                  className={[
                    'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-all',
                    checked ? 'border-blue-500 bg-blue-500' : 'border-slate-500',
                  ].join(' ')}
                >
                  {checked && (
                    <svg
                      className="h-2.5 w-2.5 text-white"
                      fill="none"
                      viewBox="0 0 12 12"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="1.5,6 4.5,9.5 10.5,2.5" />
                    </svg>
                  )}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggleTool(tool)}
                />
                <span className="text-sm text-slate-200">{tool}</span>
              </label>
            );
          })}
        </div>

        {/* "Other" free text — only visible when Other is checked */}
        {showOther && (
          <input
            type="text"
            placeholder="Please specify other tools…"
            value={answers.dailyToolsOther}
            onChange={(e) => setField('dailyToolsOther', e.target.value)}
            className={`${inputClass} mt-3`}
          />
        )}

        {errors.dailyTools && (
          <p className="mt-1.5 text-sm text-red-400">{errors.dailyTools}</p>
        )}
      </div>
    </div>
  );
}
