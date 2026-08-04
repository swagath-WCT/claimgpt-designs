'use client';

import { DESIGNS, useDesign, type DesignId } from './design-context';
import { cn } from '@/lib/utils';

export function DesignSwitcher() {
  const { design, setDesign } = useDesign();

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 animate-slide-up sm:bottom-6">
      <div className="flex items-center gap-1 rounded-2xl border border-white/20 bg-slate-900/90 p-1.5 shadow-elevation backdrop-blur-xl">
        <span className="hidden px-2 text-xs font-semibold uppercase tracking-wide text-white/50 sm:inline">
          Design
        </span>
        {DESIGNS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setDesign(d.id as DesignId)}
            className={cn(
              'relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all tap-highlight-none sm:px-4',
              design === d.id
                ? 'bg-teal-gradient text-white shadow-elevation-sm'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            )}
          >
            <span>{d.label}</span>
            <span className="hidden text-[10px] font-medium uppercase tracking-wide opacity-70 sm:inline">
              {d.subtitle}
            </span>
            {design === d.id && (
              <span className="absolute -top-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-teal-300 animate-pulse-glow" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
