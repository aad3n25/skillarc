'use client';

import { z } from 'zod';
import { useRef } from 'react';
import { useAssessment } from './AssessmentContext';

// ─── Validation schema for screen 3 ──────────────────────────────────────────

export const screen3Schema = z.object({
  // salaryRange is optional — no validation needed
  nextRolePriorities: z.array(z.string()).length(5),
  holdingBack: z.array(z.string()).min(1, 'Please select at least one option'),
});

// ─── Options ──────────────────────────────────────────────────────────────────

const SALARY_RANGES = [
  'Under £20k', '£20k-£30k', '£30k-£40k', '£40k-£50k',
  '£50k-£60k', '£60k-£80k', '£80k-£100k', 'Over £100k', 'Prefer not to say',
];

const HOLDING_BACK_OPTIONS = [
  'Not enough time',
  'Can\'t afford retraining',
  'Don\'t know which direction to go',
  'Lack of confidence',
  'Nothing — I\'m ready to move',
];

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all';

const labelClass = 'block mb-2 text-sm font-medium text-slate-300';

// ─── Drag-and-drop rank order component ──────────────────────────────────────

function RankList({
  items,
  onChange,
}: {
  items: string[];
  onChange: (next: string[]) => void;
}) {
  // Track which item is being dragged and which is the drop target
  const dragIndex = useRef<number | null>(null);

  function handleDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault(); // required to allow drop
    if (dragIndex.current === null || dragIndex.current === index) return;

    // Reorder: remove dragged item and insert at new position
    const next = [...items];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(index, 0, moved);
    dragIndex.current = index; // update ref so we don't flicker
    onChange(next);
  }

  function handleDragEnd() {
    dragIndex.current = null;
  }

  return (
    <ol className="mt-2 space-y-2">
      {items.map((item, index) => (
        <li
          key={item}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className="flex cursor-grab items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-200 transition-all duration-150 hover:border-blue-500/40 active:cursor-grabbing active:opacity-60 active:ring-2 active:ring-blue-500/40 select-none"
        >
          {/* Rank number */}
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
            {index + 1}
          </span>
          {/* Item label */}
          <span className="flex-1">{item}</span>
          {/* Drag handle icon */}
          <svg
            className="h-4 w-4 flex-shrink-0 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
          </svg>
        </li>
      ))}
    </ol>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SituationScreen() {
  const { state, dispatch } = useAssessment();
  const { answers, errors } = state;

  function setField<K extends 'salaryRange' | 'nextRolePriorities' | 'holdingBack'>(
    field: K,
    value: typeof answers[K],
  ) {
    dispatch({ type: 'SET_FIELD', field, value });
  }

  function toggleHoldingBack(option: string) {
    const current = answers.holdingBack;
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    setField('holdingBack', next);
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-white">About Your Situation</h2>
        <p className="mt-1 text-slate-400 text-sm">Almost there — final few questions</p>
      </div>

      {/* Q11: Salary range — optional */}
      <div>
        <label htmlFor="salaryRange" className={labelClass}>
          What is your current salary range?{' '}
          <span className="text-slate-500 font-normal">(optional)</span>
        </label>
        <select
          id="salaryRange"
          value={answers.salaryRange}
          onChange={(e) => setField('salaryRange', e.target.value)}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="" className="bg-[#0F172A]">
            Prefer not to say
          </option>
          {SALARY_RANGES.map((r) => (
            <option key={r} value={r} className="bg-[#0F172A]">
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Q12: Rank order priorities */}
      <div>
        <span className={labelClass}>
          Drag to rank what matters most in your next role
        </span>
        <p className="mb-2 text-xs text-slate-500">Most important at the top</p>
        <RankList
          items={answers.nextRolePriorities}
          onChange={(next) => setField('nextRolePriorities', next)}
        />
        {errors.nextRolePriorities && (
          <p className="mt-1.5 text-sm text-red-400">{errors.nextRolePriorities}</p>
        )}
      </div>

      {/* Q13: Holding back — multi-select */}
      <div>
        <span className={labelClass}>
          What&apos;s holding you back from making a change?
        </span>
        <div className="mt-2 space-y-2">
          {HOLDING_BACK_OPTIONS.map((option) => {
            const checked = answers.holdingBack.includes(option);
            return (
              <label
                key={option}
                className={[
                  'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all duration-150',
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
                <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleHoldingBack(option)} />
                {option}
              </label>
            );
          })}
        </div>
        {errors.holdingBack && (
          <p className="mt-1.5 text-sm text-red-400">{errors.holdingBack}</p>
        )}
      </div>
    </div>
  );
}
