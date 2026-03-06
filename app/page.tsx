import Link from 'next/link';

// No interactivity needed on this page — pure Server Component, no 'use client'

export default function HomePage() {
  return (
    // Outermost wrapper: brand dark background (#020617 = slate-950)
    <div className="min-h-screen bg-[#020617] text-white">

      {/* ─── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center px-4 pt-24 pb-20 text-center sm:px-8">

        {/* Small badge above headline — signals what the product is at a glance */}
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#334155] bg-[#0F172A] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-400">
          AI-Powered Career Intelligence
        </span>

        {/* Primary headline — the hook */}
        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Your skills are depreciating{' '}
          <span className="text-blue-500">faster than you think.</span>
        </h1>

        {/* Supporting subhead — what the product does and the value proposition */}
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
          Find out where you stand — and what to do about it. Free career risk
          assessment. Under 4 minutes.
        </p>

        {/* CTA group: primary button + text link as secondary option */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          {/* Primary CTA — blue, prominent, slight lift on hover */}
          <Link
            href="/assess"
            className="rounded-xl bg-blue-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-400 hover:shadow-blue-500/40"
          >
            Take the Career Assessment →
          </Link>

          {/* Secondary path — CV upload, styled as a subtle text link */}
          <Link
            href="/assess/upload"
            className="text-sm font-medium text-slate-400 underline underline-offset-4 transition-colors duration-200 hover:text-white"
          >
            Or upload your CV for instant analysis
          </Link>
        </div>
      </section>

      {/* ─── HOW IT WORKS SECTION ──────────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-5xl">

          {/* Section eyebrow label */}
          <p className="mb-12 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
            How It Works
          </p>

          {/* 3-card grid: single column on mobile, 3 columns on sm+ */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">

            {/* Card 1: Take the Assessment */}
            <div className="rounded-2xl border border-[#334155] bg-[#0F172A] p-8 transition-all duration-200 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5">
              {/* Clipboard icon — inline SVG, no external dependency */}
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <path d="M12 11h4" />
                  <path d="M12 16h4" />
                  <path d="M8 11h.01" />
                  <path d="M8 16h.01" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">Take the Assessment</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                13 questions across 3 screens. Under 4 minutes.
              </p>
            </div>

            {/* Card 2: Get Your Risk Score */}
            <div className="rounded-2xl border border-[#334155] bg-[#0F172A] p-8 transition-all duration-200 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5">
              {/* Gauge icon */}
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m12 14 4-4" />
                  <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">Get Your Risk Score</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                AI analyses your skills against market trends. Free.
              </p>
            </div>

            {/* Card 3: Get Your Roadmap */}
            <div className="rounded-2xl border border-[#334155] bg-[#0F172A] p-8 transition-all duration-200 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5">
              {/* Route/pathway icon */}
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="6" cy="19" r="3" />
                  <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
                  <circle cx="18" cy="5" r="3" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">Get Your Roadmap</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                3 personalised transition pathways with gap analysis. £19.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF SECTION ──────────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[#334155] bg-[#0F172A] p-10 text-center">
          {/* Eyebrow — establishes credibility context before the quote */}
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Built by someone making the same transition
          </p>
          <p className="text-lg font-medium leading-relaxed text-slate-300">
            Ahmed Aden went from{' '}
            <span className="font-semibold text-white">CRO Strategist</span> to{' '}
            <span className="font-semibold text-white">AI Product Builder</span>{' '}
            — and built this tool along the way.
          </p>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#334155] px-4 py-8 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <span>© 2026 Knowledge Flow Ltd. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="transition-colors duration-200 hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors duration-200 hover:text-white">
              Terms
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
