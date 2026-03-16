'use client';

// Shows 3 unlabelled stage dots + filled bar — no text labels per design spec
interface ProgressBarProps {
  currentScreen: 0 | 1 | 2 | 3;
}

export default function ProgressBar({ currentScreen }: ProgressBarProps) {
  const stages = [0, 1, 2] as const; // always 3 visual dots regardless of screen count
  // Screen 3 (email capture) shows bar as fully complete
  const fillPercent = currentScreen >= 3 ? 100 : ((currentScreen + 1) / 3) * 100;

  return (
    <div className="mb-10 w-full max-w-lg mx-auto px-1">
      {/* Track */}
      <div className="relative h-1 w-full rounded-full bg-[#1E293B]">
        {/* Filled portion */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${fillPercent}%` }}
        />
        {/* Stage dots positioned at 1/6, 3/6, 5/6 of the bar width */}
        {stages.map((stage) => {
          // On screen 3 (email) all dots show as completed
          const isCompleted = currentScreen >= 3 ? true : stage < currentScreen;
          const isActive = currentScreen < 3 && stage === currentScreen;
          return (
            <span
              key={stage}
              className={[
                'absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 transition-all duration-500',
                isCompleted || isActive
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-[#334155] bg-[#020617]',
              ].join(' ')}
              style={{ left: `calc(${((stage + 1) / (stages.length + 1)) * 100}% - 6px)` }}
            />
          );
        })}
      </div>
    </div>
  );
}
