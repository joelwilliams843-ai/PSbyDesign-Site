import { Check, Clock, Circle } from 'lucide-react';

export default function ProgressTracker({ sessions = [], compact = false }) {
  const completed = sessions.filter(s => s.status === 'completed').length;
  const percent = sessions.length > 0 ? Math.round((completed / sessions.length) * 100) : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {sessions.map((s, i) => (
            <div
              key={i}
              className={`w-6 h-1.5 rounded-full transition-colors ${
                s.status === 'completed' ? 'bg-[#1E3A5F]' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-slate-500 font-medium">{percent}%</span>
      </div>
    );
  }

  return (
    <div data-testid="progress-tracker" className="space-y-6">
      {/* Progress header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-1">
            Program Progress
          </p>
          <p className="text-3xl font-semibold text-slate-900 tracking-tight">
            {completed}<span className="text-lg text-slate-400 font-normal"> / {sessions.length} sessions</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-semibold text-[#1E3A5F] tracking-tight">{percent}%</p>
          <p className="text-xs text-slate-400">complete</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-[#1E3A5F] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
          data-testid="progress-bar"
        />
      </div>

      {/* Session steps */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
        {sessions.map((session, i) => {
          const isCompleted = session.status === 'completed';
          const isCurrent = !isCompleted && i === completed;
          
          return (
            <div
              key={session.id || i}
              className="flex flex-col items-center gap-1.5"
              data-testid={`session-step-${i + 1}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                  ${isCompleted
                    ? 'bg-[#1E3A5F] text-white shadow-sm'
                    : isCurrent
                      ? 'bg-white border-2 border-[#1E3A5F] text-[#1E3A5F]'
                      : 'bg-slate-50 border border-slate-200 text-slate-400'
                  }
                `}
              >
                {isCompleted ? (
                  <Check size={16} strokeWidth={2.5} />
                ) : isCurrent ? (
                  <Clock size={14} strokeWidth={2} />
                ) : (
                  <span className="text-xs font-medium">{i + 1}</span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${
                isCompleted ? 'text-[#1E3A5F]' : isCurrent ? 'text-[#1E3A5F]' : 'text-slate-400'
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
