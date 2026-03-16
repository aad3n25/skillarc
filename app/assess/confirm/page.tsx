import Link from 'next/link';

// Static server component — no interactivity needed
export default function ConfirmPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">

        {/* Checkmark icon */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/15">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-400"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-white">
          Your results are on their way ✓
        </h1>

        <p className="mt-4 text-slate-400 leading-relaxed">
          Check your inbox — your career risk score will arrive within 2 minutes.
          Check your spam folder if you don&apos;t see it.
        </p>

        <Link
          href="/"
          className="mt-10 inline-block rounded-xl border border-white/20 bg-white/5 px-8 py-3 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-white/40 hover:text-white"
        >
          Back to home
        </Link>

      </div>
    </div>
  );
}
