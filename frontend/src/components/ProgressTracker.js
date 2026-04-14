import { Check, Clock } from 'lucide-react';

export default function ProgressTracker({ sessions = [], compact = false }) {
  const completed = sessions.filter(s => s.status === 'completed').length;
  const percent = sessions.length > 0 ? Math.round((completed / sessions.length) * 100) : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2.5">
        <div className="flex gap-[3px]">
          {sessions.map((s, i) => (
            <div
              key={i}
              className={`w-5 h-[5px] rounded-full transition-colors ${
                s.status === 'completed' ? 'bg-[#0F2B3C]' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] text-slate-500 font-medium tabular-nums">{percent}%</span>
      </div>
    );
  }

  return (
    <div data-testid="progress-tracker" className="space-y-8">
      {/* Progress header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">
            Program Progress
          </p>
          <p className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight leading-none">
            {completed}<span className="text-xl text-slate-300 font-normal ml-1">/ {sessions.length}</span>
          </p>
          <p className="text-sm text-slate-500 mt-1.5">sessions completed</p>
        </div>
        <div className="text-right">
          <p className="text-4xl sm:text-5xl font-semibold text-[#0F2B3C] tracking-tight leading-none">{percent}<span className="text-xl">%</span></p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#0F2B3C] to-[#2A5080] rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percent}%` }}
          data-testid="progress-bar"
        />
      </div>

      {/* Session steps - centered grid */}
      <div className="flex justify-between gap-1 sm:gap-2 px-0.5">
        {sessions.map((session, i) => {
          const isCompleted = session.status === 'completed';
          const isCurrent = !isCompleted && i === completed;
          
          return (
            <div
              key={session.id || i}
              className="flex flex-col items-center gap-2"
              data-testid={`session-step-${i + 1}`}
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCompleted
                    ? 'bg-[#0F2B3C] text-white shadow-sm shadow-[#0F2B3C]/20'
                    : isCurrent
                      ? 'bg-white border-2 border-[#0F2B3C] text-[#0F2B3C] shadow-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-400'
                  }
                `}
              >
                {isCompleted ? (
                  <Check size={15} strokeWidth={2.5} />
                ) : isCurrent ? (
                  <Clock size={14} strokeWidth={2} />
                ) : (
                  <span className="text-xs font-medium">{i + 1}</span>
                )}
              </div>
              <span className={`text-[10px] font-medium leading-none ${
                isCompleted ? 'text-[#0F2B3C]' : isCurrent ? 'text-[#0F2B3C]' : 'text-slate-300'
              }`}>
                {i + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
