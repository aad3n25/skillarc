'use client';

import { z } from 'zod';
import { useAssessment } from './AssessmentContext';

// ─── Validation schema for screen 2 ──────────────────────────────────────────

export const screen2Schema = z.object({
  aiConcernLevel: z.number().min(1, 'Please rate your concern level'),
  consideredCareerChange: z.enum(['Yes', 'No', 'Not sure'], {
    error: 'Please select an option',
  }),
  biggestConcern: z.string().min(1, 'Please select your biggest concern'),
  skillsToDevelop: z.array(z.string()).min(1, 'Please select at least one skill'),
  learningHoursPerWeek: z.string().min(1, 'Please select your available hours'),
  preferredLearningFormat: z.string().min(1, 'Please select a learning format'),
});

// ─── Options ──────────────────────────────────────────────────────────────────

const CONCERN_LABELS: Record<number, string> = {
  1: 'Not at all',
  2: 'Slightly',
  3: 'Moderately',
  4: 'Very concerned',
  5: 'Extremely concerned',
};

const BIGGEST_CONCERNS = [
  'Skill obsolescence',
  'Salary stagnation',
  'Lack of growth opportunities',
  'Job security',
  'Wanting something new',
];

const SKILLS_TO_DEVELOP = [
  'Leadership',
  'Data & Analytics',
  'Technical/Coding',
  'Communication',
  'Project Management',
  'AI & Automation',
  'Creative',
  'Sales & Business Development',
];

const LEARNING_HOURS = [
  'Less than 2 hours',
  '2-5 hours',
  '5-10 hours',
  '10+ hours',
];

const LEARNING_FORMATS = [
  'Self-paced online courses',
  'Live online classes',
  'In-person workshops',
  'Reading/books',
  'Mentorship/coaching',
  'Hands-on projects',
];

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all';

const labelClass = 'block mb-2 text-sm font-medium text-slate-300';

// ─── Component ────────────────────────────────────────────────────────────────

export default function FutureScreen() {
  const { state, dispatch } = useAssessment();
  const { answers, errors } = state;

  function setField<K extends 'aiConcernLevel' | 'consideredCareerChange' | 'biggestConcern' | 'skillsToDevelop' | 'learningHoursPerWeek' | 'preferredLearningFormat'>(
    field: K,
    value: typeof answers[K],
  ) {
    dispatch({ type: 'SET_FIELD', field, value });
  }

  function toggleSkill(skill: string) {
    const current = answers.skillsToDevelop;
    const next = current.includes(skill)
      ? current.filter((s) => s !== skill)
      : [...current, skill];
    setField('skillsToDevelop', next);
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-white">About Your Future</h2>
        <p className="mt-1 text-slate-400 text-sm">Help us understand where you want to go</p>
      </div>

      {/* Q5: AI concern level — 1-5 scale */}
      <div>
        <span className={labelClass}>
          How concerned are you about AI affecting your role?
        </span>
        <div className="mt-3 flex gap-2">
          {([1, 2, 3, 4, 5] as const).map((level) => {
            const selected = answers.aiConcernLevel === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setField('aiConcernLevel', level)}
                className={[
                  'flex-1 rounded-xl border-2 py-4 text-center text-lg font-bold transition-all duration-150',
                  selected
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                    : 'border-white/15 bg-white/5 text-slate-300 hover:border-white/30',
                ].join(' ')}
                aria-pressed={selected}
                aria-label={`${level} — ${CONCERN_LABELS[level]}`}
              >
                {level}
              </button>
            );
          })}
        </div>
        {/* Scale labels */}
        <div className="mt-2 flex justify-between px-1 text-xs text-slate-500">
          <span>Not at all</span>
          <span>Extremely concerned</span>
        </div>
        {/* Show selected label */}
        {answers.aiConcernLevel > 0 && (
          <p className="mt-2 text-center text-sm text-blue-400">
            {CONCERN_LABELS[answers.aiConcernLevel]}
          </p>
        )}
        {errors.aiConcernLevel && (
          <p className="mt-1.5 text-sm text-red-400">{errors.aiConcernLevel}</p>
        )}
      </div>

      {/* Q6: Considered career change */}
      <div>
        <span className={labelClass}>
          Have you considered a career change in the last 12 months?
        </span>
        <div className="mt-2 flex gap-3">
          {(['Yes', 'No', 'Not sure'] as const).map((option) => {
            const selected = answers.consideredCareerChange === option;
            return (
              <label
                key={option}
                className={[
                  'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-150',
                  selected
                    ? 'border-blue-500 bg-blue-500/15 text-white'
                    : 'border-white/15 bg-white/5 text-slate-300 hover:border-white/30',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="consideredCareerChange"
                  value={option}
                  checked={selected}
                  onChange={() => setField('consideredCareerChange', option)}
                  className="sr-only"
                />
                {option}
              </label>
            );
          })}
        </div>
        {errors.consideredCareerChange && (
          <p className="mt-1.5 text-sm text-red-400">{errors.consideredCareerChange}</p>
        )}
      </div>

      {/* Q7: Biggest career concern */}
      <div>
        <label htmlFor="biggestConcern" className={labelClass}>
          What is your biggest career concern right now?
        </label>
        <select
          id="biggestConcern"
          value={answers.biggestConcern}
          onChange={(e) => setField('biggestConcern', e.target.value)}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="" disabled className="bg-[#0F172A]">
            Select your biggest concern
          </option>
          {BIGGEST_CONCERNS.map((c) => (
            <option key={c} value={c} className="bg-[#0F172A]">
              {c}
            </option>
          ))}
        </select>
        {errors.biggestConcern && (
          <p className="mt-1.5 text-sm text-red-400">{errors.biggestConcern}</p>
        )}
      </div>

      {/* Q8: Skills to develop — multi-select */}
      <div>
        <span className={labelClass}>Which skills do you most want to develop?</span>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {SKILLS_TO_DEVELOP.map((skill) => {
            const checked = answers.skillsToDevelop.includes(skill);
            return (
              <label
                key={skill}
                className={[
                  'flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all duration-150',
                  checked
                    ? 'border-blue-500 bg-blue-500/15 text-white'
                    : 'border-white/15 bg-white/5 text-slate-300 hover:border-white/30',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-all',
                    checked ? 'border-blue-500 bg-blue-500' : 'border-slate-500',
                  ].join(' ')}
                >
                  {checked && (
                    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="1.5,6 4.5,9.5 10.5,2.5" />
                    </svg>
                  )}
                </span>
                <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleSkill(skill)} />
                {skill}
              </label>
            );
          })}
        </div>
        {errors.skillsToDevelop && (
          <p className="mt-1.5 text-sm text-red-400">{errors.skillsToDevelop}</p>
        )}
      </div>

      {/* Q9: Learning hours per week */}
      <div>
        <label htmlFor="learningHours" className={labelClass}>
          How many hours per week can you dedicate to learning?
        </label>
        <select
          id="learningHours"
          value={answers.learningHoursPerWeek}
          onChange={(e) => setField('learningHoursPerWeek', e.target.value)}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="" disabled className="bg-[#0F172A]">
            Select hours per week
          </option>
          {LEARNING_HOURS.map((h) => (
            <option key={h} value={h} className="bg-[#0F172A]">{h}</option>
          ))}
        </select>
        {errors.learningHoursPerWeek && (
          <p className="mt-1.5 text-sm text-red-400">{errors.learningHoursPerWeek}</p>
        )}
      </div>

      {/* Q10: Preferred learning format */}
      <div>
        <label htmlFor="learningFormat" className={labelClass}>
          What is your preferred learning format?
        </label>
        <select
          id="learningFormat"
          value={answers.preferredLearningFormat}
          onChange={(e) => setField('preferredLearningFormat', e.target.value)}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="" disabled className="bg-[#0F172A]">
            Select a format
          </option>
          {LEARNING_FORMATS.map((f) => (
            <option key={f} value={f} className="bg-[#0F172A]">{f}</option>
          ))}
        </select>
        {errors.preferredLearningFormat && (
          <p className="mt-1.5 text-sm text-red-400">{errors.preferredLearningFormat}</p>
        )}
      </div>
    </div>
  );
}
