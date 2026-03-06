---
name: skillarc-frontend
description: >
  Use this skill whenever building or editing any UI component, page, or layout for SkillArc.
  Covers: multi-step forms, data visualisation, blurred paywalls, expandable cards, streaming
  text, and all shared design tokens. Always read this file before writing any Tailwind/Next.js
  component. Stack: Next.js App Router · Tailwind CSS (utilities only) · No external UI libs.
---

# SkillArc — Frontend Skill File

You are building SkillArc: a career-intelligence platform that helps people understand skill
gaps, risk scores, and learning pathways. The audience ranges from nervous career-changers to
ambitious professionals. The UI must feel premium, trustworthy, and clear — never clinical or
overwhelming.

> **Developer note:** The developer using this skill is a beginner. Every component you generate
> must be self-contained, heavily commented, and use only Tailwind utility classes (no @apply,
> no CSS modules, no external component libraries). Explain non-obvious decisions inline.

---

## 1. Design System — Brand Tokens

These tokens come from the LearnFlow / SkillArc shared design language. Use them exactly.
Never invent new colours or spacing patterns outside this system.

### 1.1 Colour Palette

```
BACKGROUND
  Page:        bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900
  Glass card:  bg-white/10   (default surface)
  Glass hover: bg-white/20   (on hover)
  Selected:    bg-purple-500/20

BORDERS
  Default:     border border-white/20   (or border-2 border-white/20 for cards)
  Hover:       border-white/40
  Focus/Active:border-purple-500

GRADIENTS
  Primary CTA: bg-gradient-to-r from-purple-600 to-blue-600
  CTA hover:   bg-gradient-to-r from-purple-700 to-blue-700
  Text accent: bg-gradient-to-r from-white to-purple-300  (clip to text)

ACCENT COLOURS
  Purple 500:  #a855f7  (focus rings, labels, highlights)
  Purple 600:  #9333ea  (gradient start)
  Blue 600:    #2563eb  (gradient end)
  Success:     text-emerald-400 / bg-emerald-500/15 border-emerald-500/30
  Warning:     text-amber-400  / bg-amber-500/15  border-amber-500/30
  Danger:      text-red-400    / bg-red-500/15    border-red-500/30

TEXT
  Primary:     text-white
  Secondary:   text-white/70
  Muted:       text-white/50
  Disabled:    text-white/30
  Gradient:    bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent
```

### 1.2 Typography

```
FONTS  (add to layout.tsx or globals.css)
  Display/UI:  'Sora', sans-serif        — weights 300 400 600 700 800
  Code/Mono:   'JetBrains Mono', mono   — weights 400 500

GOOGLE FONTS LINK:
  https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800
  &family=JetBrains+Mono:wght@400;500&display=swap

SCALE
  Hero H1:     text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight
  Section H2:  text-2xl font-bold tracking-tight
  Card H3:     text-lg font-semibold
  Body:        text-base font-normal leading-relaxed text-white/80
  Label/caps:  text-xs font-semibold tracking-widest uppercase text-white/50
  Code:        font-mono text-sm text-purple-400
```

### 1.3 Spacing & Layout

```
Page padding:    px-4 sm:px-8 py-20
Section gap:     space-y-12  or  gap-8
Card padding:    p-6  (default)   p-8 (large)
Inline gap:      gap-3 or gap-4
Max widths:
  Assessment flow / forms:  max-w-2xl mx-auto
  Dashboard / wide:         max-w-5xl mx-auto
  Full bleed:               w-full
```

### 1.4 Border Radius

```
Pill badges:   rounded-full
Buttons:       rounded-xl
Cards:         rounded-2xl
Inputs:        rounded-xl
Modals:        rounded-3xl
Small chips:   rounded-lg
```

### 1.5 Shadows & Depth

```
Default card:  shadow-xl
Elevated:      shadow-2xl shadow-purple-900/40
Button:        shadow-lg shadow-purple-600/30
Focus ring:    ring-2 ring-purple-500/50
```

---

## 2. Glass Card — Base Pattern

Every surface in SkillArc uses this glass pattern. Copy it as your starting point.

```tsx
// GlassCard.tsx
// A reusable glass-effect container. Wrap any content in this.

export default function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`
        bg-white/10           /* semi-transparent white — creates the glass look */
        backdrop-blur-md      /* blurs whatever is behind the card */
        border-2 border-white/20  /* subtle white border */
        rounded-2xl           /* soft corners */
        shadow-xl             /* depth */
        transition-all duration-200  /* smooth hover transitions */
        hover:bg-white/[0.15] hover:border-white/30  /* subtle hover lift */
        ${className}
      `}
    >
      {children}
    </div>
  )
}
```

---

## 3. Multi-Step Form with Progress Bar

**Context:** 3 screens, 13 questions total. Users fill in career details before seeing their
risk score. Keep each screen focused — max 4–5 questions visible at once.

### 3.1 Progress Bar Component

```tsx
// MultiStepProgress.tsx
// Shows which step the user is on (1 of 3, 2 of 3, etc.)
// Props: currentStep (1-based), totalSteps, stepLabels

'use client'  // needed because this reads state

export default function MultiStepProgress({
  currentStep,
  totalSteps,
  stepLabels,
}: {
  currentStep: number
  totalSteps: number
  stepLabels: string[]
}) {
  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100

  return (
    <div className="w-full space-y-3" role="progressbar" aria-valuenow={currentStep} aria-valuemax={totalSteps}>

      {/* Step labels row */}
      <div className="flex justify-between">
        {stepLabels.map((label, i) => (
          <span
            key={i}
            className={`text-xs font-semibold tracking-wide uppercase transition-colors duration-200 ${
              i + 1 === currentStep
                ? 'text-purple-400'          // active step: purple
                : i + 1 < currentStep
                ? 'text-white/60'            // completed step: dimmed white
                : 'text-white/25'            // future step: very dim
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Track */}
      <div className="relative h-2 w-full rounded-full bg-white/10">
        {/* Filled portion — animates as progress changes */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
        {/* Step dots */}
        {stepLabels.map((_, i) => {
          const position = (i / (totalSteps - 1)) * 100
          const done = i + 1 <= currentStep
          return (
            <span
              key={i}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                done
                  ? 'bg-purple-500 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]'
                  : 'bg-gray-800 border-white/20'
              }`}
              style={{ left: `${position}%` }}
              aria-label={`Step ${i + 1}: ${stepLabels[i]}`}
            />
          )
        })}
      </div>

      {/* Current step text */}
      <p className="text-xs text-white/40 text-right font-mono">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  )
}
```

### 3.2 Form Container with Step Switching

```tsx
// AssessmentForm.tsx
// Manages which step is visible. Each step is a separate component.
// Uses simple useState — no external form libraries needed.

'use client'

import { useState } from 'react'
import MultiStepProgress from './MultiStepProgress'
import StepOne from './StepOne'
import StepTwo from './StepTwo'
import StepThree from './StepThree'

const STEPS = ['Your Role', 'Your Skills', 'Your Goals']

export default function AssessmentForm() {
  const [step, setStep] = useState(1)
  // formData holds all answers — passed down to each step
  const [formData, setFormData] = useState({})

  // Called by each step to save its answers and move forward
  function handleNext(stepData: Record<string, string>) {
    setFormData(prev => ({ ...prev, ...stepData }))
    setStep(s => s + 1)
  }

  function handleBack() {
    setStep(s => s - 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 px-4 sm:px-8 py-20">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Page heading */}
        <div className="text-center space-y-2">
          <p className="text-xs font-semibold tracking-widest uppercase text-purple-400">
            Career Assessment
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Understand Your Position
          </h1>
        </div>

        {/* Progress bar */}
        <MultiStepProgress
          currentStep={step}
          totalSteps={3}
          stepLabels={STEPS}
        />

        {/* Step content — only the active step renders */}
        <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl p-8 shadow-xl">
          {step === 1 && <StepOne onNext={handleNext} />}
          {step === 2 && <StepTwo onNext={handleNext} onBack={handleBack} />}
          {step === 3 && <StepThree data={formData} onBack={handleBack} />}
        </div>

      </div>
    </div>
  )
}
```

### 3.3 Form Input Patterns

```tsx
// Reusable input styles — copy these class strings for any input/select/textarea

// Text input
<input
  type="text"
  className="
    w-full
    bg-white/10 backdrop-blur-sm
    border-2 border-white/30
    focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30
    rounded-xl px-4 py-3
    text-white placeholder-white/30
    text-base font-normal
    outline-none
    transition-all duration-200
  "
  placeholder="e.g. Product Manager"
  aria-label="Current job title"
/>

// Select / dropdown
<select className="
  w-full
  bg-gray-900/80 backdrop-blur-sm
  border-2 border-white/30
  focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30
  rounded-xl px-4 py-3
  text-white
  outline-none
  transition-all duration-200
  appearance-none          /* removes default arrow — add a custom one if needed */
">
  <option value="">Select industry...</option>
</select>

// Field label (always add for accessibility)
<label className="block text-sm font-semibold text-white/70 mb-2" htmlFor="job-title">
  Current Job Title
</label>
```

### 3.4 Navigation Buttons

```tsx
// Always placed at the bottom of each step
<div className="flex justify-between items-center pt-4">

  {/* Back button — ghost style */}
  <button
    onClick={onBack}
    className="
      px-6 py-3 rounded-xl
      bg-white/10 border border-white/20
      text-white/70 font-semibold text-sm
      hover:bg-white/20 hover:text-white
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-white/30
    "
    aria-label="Go back to previous step"
  >
    ← Back
  </button>

  {/* Next / Submit button — primary gradient */}
  <button
    type="submit"
    className="
      px-8 py-3 rounded-xl
      bg-gradient-to-r from-purple-600 to-blue-600
      hover:from-purple-700 hover:to-blue-700
      text-white font-bold text-sm
      shadow-lg shadow-purple-600/30
      hover:shadow-purple-600/50 hover:-translate-y-px
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-purple-500/50
    "
    aria-label="Continue to next step"
  >
    Continue →
  </button>

</div>
```

---

## 4. Data Visualisation Components

All charts are built with pure CSS/SVG. No Chart.js, Recharts, or D3 needed.

### 4.1 Risk Score Gauge (0–100)

```tsx
// RiskGauge.tsx
// Semi-circular gauge showing automation risk score.
// score: 0 = safe (green), 50 = moderate (amber), 80+ = high (red)

export default function RiskGauge({ score }: { score: number }) {
  // SVG arc maths — the gauge is a 180° arc (half circle)
  const radius = 80
  const circumference = Math.PI * radius   // half circle = π × r
  const offset = circumference - (score / 100) * circumference

  // Pick colour based on score
  const colour =
    score >= 70 ? '#f87171'   // red-400
    : score >= 40 ? '#fbbf24' // amber-400
    : '#34d399'               // emerald-400

  return (
    <div className="flex flex-col items-center gap-4" role="img" aria-label={`Risk score: ${score} out of 100`}>

      {/* SVG gauge */}
      <svg width="200" height="110" viewBox="0 0 200 110" className="overflow-visible">

        {/* Background track (grey arc) */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Filled arc — length controlled by stroke-dashoffset */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={colour}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${colour}80)` }}
        />

        {/* Score number in the centre */}
        <text x="100" y="95" textAnchor="middle" className="font-extrabold" style={{ fill: 'white', fontSize: '28px', fontFamily: 'Sora, sans-serif', fontWeight: 800 }}>
          {score}
        </text>
        <text x="100" y="112" textAnchor="middle" style={{ fill: 'rgba(255,255,255,0.5)', fontSize: '11px', fontFamily: 'Sora, sans-serif' }}>
          RISK SCORE
        </text>

      </svg>

      {/* Labels below gauge */}
      <div className="flex w-48 justify-between text-xs text-white/40 font-mono">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>

    </div>
  )
}
```

### 4.2 Skill Bar with Percentile

```tsx
// SkillBar.tsx
// Horizontal bar showing a skill score with percentile label.
// skill: skill name, score: 0–100, percentile: e.g. "Top 15%"

export default function SkillBar({
  skill,
  score,
  percentile,
}: {
  skill: string
  score: number
  percentile: string
}) {
  return (
    <div className="space-y-2">

      {/* Top row: skill name + percentile badge */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/80">{skill}</span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300">
          {percentile}
        </span>
      </div>

      {/* Track */}
      <div className="relative h-2.5 w-full rounded-full bg-white/10" role="progressbar" aria-valuenow={score} aria-valuemax={100} aria-label={`${skill}: ${score}%`}>
        {/* Fill — animates on mount if you wrap in useEffect + state */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-700 ease-out"
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Score number */}
      <p className="text-right text-xs text-white/30 font-mono">{score}/100</p>

    </div>
  )
}

// Usage — render a list:
// skills.map(s => <SkillBar key={s.name} skill={s.name} score={s.score} percentile={s.percentile} />)
```

### 4.3 Circular Progress Ring (Adjacency Score)

```tsx
// CircularRing.tsx
// Small circular progress indicator. Used for pathway adjacency scores.
// size: diameter in px (default 80), score: 0–100, label: text below ring

export default function CircularRing({
  score,
  label,
  size = 80,
}: {
  score: number
  label: string
  size?: number
}) {
  const radius = (size - 12) / 2   // 12 = strokeWidth * 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">

      <svg width={size} height={size} className="-rotate-90">  {/* rotate so arc starts at top */}

        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="6"
        />

        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#a855f7"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
          style={{ filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.5))' }}
        />

      </svg>

      {/* Score overlaid on ring using negative margin trick */}
      <span className="font-bold text-white text-sm -mt-12 rotate-90 select-none">
        {score}%
      </span>

      {/* Label */}
      <span className="text-xs text-white/50 text-center leading-tight mt-8">{label}</span>

    </div>
  )
}

// NOTE: The rotate-90/-rotate-90 trick makes the SVG arc start from the top (12 o'clock).
// Without it, SVG arcs start from the right (3 o'clock).
```

---

## 5. Blurred Content Preview with Payment CTA Overlay

```tsx
// PaywallPreview.tsx
// Shows a blurred preview of the report with a CTA card on top.
// children: the actual report content (will be blurred)
// price: e.g. "£9.99"

'use client'

export default function PaywallPreview({
  children,
  price = '£9.99',
  onUnlock,
}: {
  children: React.ReactNode
  price?: string
  onUnlock?: () => void
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden">

      {/* Blurred content underneath */}
      <div
        className="blur-sm pointer-events-none select-none"
        aria-hidden="true"  /* hidden from screen readers — they see the CTA instead */
      >
        {children}
      </div>

      {/* Dark gradient fade at the top of the blur — creates natural mask */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/60 to-gray-900/90" />

      {/* CTA card — centred over blurred content */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="
          bg-gray-900/80 backdrop-blur-xl
          border-2 border-white/20
          rounded-2xl p-8 shadow-2xl shadow-purple-900/40
          text-center space-y-5
          max-w-sm w-full
        ">

          {/* Lock icon — inline SVG, no library needed */}
          <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-6V7a4 4 0 00-8 0v4" />
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth={2} />
            </svg>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Your Full Report is Ready</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Unlock your risk breakdown, skill gap analysis, and personalised pathway map.
            </p>
          </div>

          {/* Price callout */}
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-extrabold text-white">{price}</span>
            <span className="text-sm text-white/40">one-time</span>
          </div>

          {/* CTA button */}
          <button
            onClick={onUnlock}
            className="
              w-full py-3 rounded-xl
              bg-gradient-to-r from-purple-600 to-blue-600
              hover:from-purple-700 hover:to-blue-700
              text-white font-bold text-sm
              shadow-lg shadow-purple-600/30
              hover:-translate-y-px hover:shadow-purple-600/50
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-purple-500/50
            "
            aria-label={`Unlock full report for ${price}`}
          >
            Unlock Full Report →
          </button>

          <p className="text-xs text-white/30">Secure payment · Instant access · No subscription</p>

        </div>
      </div>

    </div>
  )
}
```

---

## 6. Expandable Pathway Card

```tsx
// PathwayCard.tsx
// Collapsed: shows role title, adjacency ring, brief headline.
// Expanded: shows detailed analysis, skill gaps, timeline.

'use client'

import { useState } from 'react'
import CircularRing from './CircularRing'

type PathwayCardProps = {
  role: string
  adjacencyScore: number   // 0–100
  headline: string
  timeToTransition: string
  skills: string[]         // skills to develop
  analysis: string         // longer paragraph
}

export default function PathwayCard({
  role,
  adjacencyScore,
  headline,
  timeToTransition,
  skills,
  analysis,
}: PathwayCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className={`
        bg-white/10 backdrop-blur-md
        border-2 rounded-2xl shadow-xl
        transition-all duration-300
        ${isOpen
          ? 'border-purple-500/60 bg-purple-500/10'   // expanded: purple tint
          : 'border-white/20 hover:border-white/35 hover:bg-white/[0.13]'
        }
      `}
    >

      {/* Always-visible header row — clicking toggles expansion */}
      <button
        className="w-full text-left p-6 flex items-center gap-5"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`pathway-${role}`}
      >

        {/* Adjacency ring */}
        <div className="flex-shrink-0">
          <CircularRing score={adjacencyScore} label="match" size={72} />
        </div>

        {/* Text */}
        <div className="flex-1 space-y-1 min-w-0">
          <h3 className="text-base font-bold text-white truncate">{role}</h3>
          <p className="text-sm text-white/60 line-clamp-2">{headline}</p>
          <span className="inline-block text-xs font-mono text-purple-400">
            ~{timeToTransition} to transition
          </span>
        </div>

        {/* Chevron indicator */}
        <svg
          className={`w-5 h-5 text-white/40 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>

      </button>

      {/* Expanded content — hidden when closed */}
      {/* Using max-height transition for smooth open/close animation */}
      <div
        id={`pathway-${role}`}
        className={`overflow-hidden transition-all duration-400 ease-in-out ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-6 pb-6 space-y-5 border-t border-white/10 pt-5">

          {/* Analysis paragraph */}
          <p className="text-sm text-white/70 leading-relaxed">{analysis}</p>

          {/* Skills to develop */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-3">
              Skills to Develop
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Explore CTA */}
          <button className="
            w-full py-3 rounded-xl text-sm font-bold
            bg-gradient-to-r from-purple-600 to-blue-600
            hover:from-purple-700 hover:to-blue-700
            text-white shadow-lg shadow-purple-600/20
            hover:-translate-y-px transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-purple-500/50
          ">
            Explore This Pathway →
          </button>

        </div>
      </div>

    </div>
  )
}
```

---

## 7. Streaming Text Display (AI Tutor — Phase 2)

```tsx
// StreamingText.tsx
// Displays text that arrives word-by-word from an AI stream.
// Reads from a ReadableStream via the Vercel AI SDK or native fetch.

'use client'

import { useEffect, useRef, useState } from 'react'

export default function StreamingText({ prompt }: { prompt: string }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!prompt) return

    async function fetchStream() {
      setLoading(true)
      setText('')

      // Call your Next.js API route that streams from Claude/OpenAI
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!res.body) return

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      // Read chunks as they arrive and append to text
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setText(prev => prev + chunk)

        // Auto-scroll to bottom as text arrives
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
      }

      setLoading(false)
    }

    fetchStream()
  }, [prompt])

  return (
    <div
      ref={containerRef}
      className="
        bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl
        p-6 min-h-[120px] max-h-[400px] overflow-y-auto
        text-sm text-white/80 leading-relaxed
        font-light
      "
      role="log"
      aria-live="polite"    /* screen readers announce new text as it arrives */
      aria-label="AI tutor response"
    >
      {loading && !text && (
        /* Pulsing dots loading indicator */
        <div className="flex gap-1.5 items-center text-white/40">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms]" />
        </div>
      )}

      {/* Render text — preserve whitespace for paragraphs */}
      <p className="whitespace-pre-wrap">{text}</p>

      {/* Blinking cursor shown while streaming */}
      {loading && text && (
        <span className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 animate-pulse" aria-hidden="true" />
      )}
    </div>
  )
}
```

---

## 8. Page Background Pattern

Every page in SkillArc uses this same background. Add it to your root layout or each page wrapper.

```tsx
// Add this as the outermost wrapper on any page

<div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">

  {/* Floating ambient blobs — decorative, hidden from screen readers */}
  <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[100px] animate-[float_14s_ease-in-out_infinite]" />
    <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-blue-600/12 blur-[100px] animate-[float_10s_ease-in-out_infinite_4s]" />
    <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] rounded-full bg-purple-800/10 blur-[80px] animate-[float_12s_ease-in-out_infinite_8s]" />
  </div>

  {/* Page content sits above blobs */}
  <div className="relative z-10">
    {children}
  </div>

</div>

/* Add to globals.css or tailwind.config.js keyframes: */
/*
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-24px); }
}
*/
```

---

## 9. Accessibility Checklist

Apply these rules to every component generated for SkillArc.

```
SEMANTIC HTML
  ✓ Use <button> for actions, <a> for navigation — never <div onClick>
  ✓ Use <h1>–<h3> in logical order (one h1 per page)
  ✓ Wrap form fields in <label> pointing to input id
  ✓ Use <nav>, <main>, <section>, <article> appropriately

KEYBOARD NAVIGATION
  ✓ All interactive elements reachable by Tab key
  ✓ Visible focus ring on all buttons/inputs (ring-2 ring-purple-500/50)
  ✓ Expandable cards use aria-expanded + aria-controls
  ✓ Modals trap focus inside when open

ARIA LABELS
  ✓ SVG charts: role="img" aria-label="description of chart"
  ✓ Progress bars: role="progressbar" aria-valuenow aria-valuemax
  ✓ Streaming log: role="log" aria-live="polite"
  ✓ Decorative SVGs/blobs: aria-hidden="true"
  ✓ Blurred paywall content: aria-hidden="true" on the blur div

COLOUR CONTRAST
  ✓ Never use text-white/30 or lower for readable content (muted/disabled only)
  ✓ text-white/70 minimum for body text on dark backgrounds
  ✓ Coloured badges (green/amber/red) must not convey meaning by colour alone
    — always add a text label alongside the colour
```

---

## 10. Common Anti-Patterns — Never Do These

```
✗  Do not use @apply in Tailwind — write utility classes inline only
✗  Do not install Shadcn, Radix, MUI, Chakra, or any component library
✗  Do not use inline style={{ color: 'purple' }} — use Tailwind classes
✗  Do not use <div onClick> — use <button> with type attribute
✗  Do not use 'use client' on layout files — only on components needing interactivity
✗  Do not use purple gradients on white/light backgrounds — always on dark
✗  Do not use Inter, Roboto, or Arial — always Sora + JetBrains Mono
✗  Do not skip aria-label on icon-only buttons
✗  Do not use CSS animations that require @keyframes in Tailwind config
    without adding them to tailwind.config.js extend.keyframes first
✗  Do not use localStorage for sensitive assessment data — use server-side state
```

---

## 11. Quick Reference — Copy/Paste Class Strings

```
Glass card:        bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl shadow-xl
Glass hover:       hover:bg-white/20 hover:border-white/40
Selected card:     border-purple-500 bg-purple-500/20
Primary button:    bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl py-3 px-6 shadow-lg shadow-purple-600/30 hover:-translate-y-px transition-all duration-200
Ghost button:      bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 hover:text-white rounded-xl py-3 px-6 font-semibold transition-all duration-200
Text input:        bg-white/10 backdrop-blur-sm border-2 border-white/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none transition-all
Badge purple:      px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 border border-purple-500/30 text-purple-300
Badge success:     px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400
Badge warning:     px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400
Section label:     text-xs font-semibold tracking-widest uppercase text-purple-400
Gradient text:     bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent font-extrabold
Focus ring:        focus:outline-none focus:ring-2 focus:ring-purple-500/50
```

---

*SkillArc Frontend Skill — v1.0. Covers: Design tokens · Glass surfaces · Multi-step form ·
Risk gauge · Skill bars · Circular rings · Paywall · Expandable cards · Streaming text ·
Accessibility · Anti-patterns · Quick-reference class strings.*
