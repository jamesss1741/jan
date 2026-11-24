import React from 'react';
import { InteractionAlert } from '../../types';
import { AlertTriangle, AlertOctagon, Info, ShieldAlert } from 'lucide-react';

interface Props {
  alerts: InteractionAlert[];
}

export const InteractionAlerts: React.FC<Props> = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
        <ShieldAlert className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <div>
          <span className="font-bold">Drug Interaction Guard: 0 Conflicts Detected.</span>
          <span className="text-slate-600 dark:text-slate-400 block mt-0.5">
            Your current prescription basket does not contain duplicate active salts or high-risk contraindications.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
        <AlertTriangle className="w-4 h-4" />
        <span>Clinical Safety Guard ({alerts.length} Warnings)</span>
      </div>

      {alerts.map((alert, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-2xl border flex items-start gap-3.5 text-xs ${
            alert.severity === 'high'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {alert.severity === 'high' ? (
              <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            )}
          </div>

          <div className="flex-1 space-y-1">
            <div className="font-bold text-sm leading-tight">
              {alert.title}
            </div>
            <p className="text-xs opacity-90 leading-relaxed">
              {alert.description}
            </p>
            <div className="pt-1 flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] font-semibold opacity-80">Medicines Involved:</span>
              {alert.medicinesInvolved.map((med, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-900/60 font-mono text-[11px] font-semibold"
                >
                  {med}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
