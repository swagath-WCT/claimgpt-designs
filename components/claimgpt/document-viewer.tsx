'use client';

import { LINE_ITEMS, formatINR } from '@/lib/claimgpt-data';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentViewerProps {
  zoom: number;
  setZoom: (z: number) => void;
  hoveredField: string | null;
  filename?: string;
  className?: string;
  dark?: boolean;
}

export function DocumentViewer({
  zoom,
  setZoom,
  hoveredField,
  filename,
  className,
  dark = false,
}: DocumentViewerProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <div
        className={cn(
          'flex items-center justify-between border-b px-4 py-2.5',
          dark ? 'border-white/10 bg-white/5' : 'border-border bg-background/60'
        )}
      >
        <span className={cn('text-xs font-medium truncate max-w-[200px] sm:max-w-xs', dark ? 'text-slate-400' : 'text-muted-foreground')}>
          {filename || 'hospital_bill_main.pdf'}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom(Math.max(0.6, zoom - 0.1))}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md',
              dark ? 'text-slate-400 hover:bg-white/10' : 'text-muted-foreground hover:bg-muted'
            )}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className={cn('w-12 text-center text-xs font-medium', dark ? 'text-slate-300' : 'text-foreground')}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md',
              dark ? 'text-slate-400 hover:bg-white/10' : 'text-muted-foreground hover:bg-muted'
            )}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          'flex justify-center overflow-auto p-6 scrollbar-thin',
          dark ? 'bg-slate-950/40' : 'bg-slate-50'
        )}
        style={{ maxHeight: '640px' }}
      >
        <div
          className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-elevation-sm transition-transform duration-300"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
        >
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <p className="font-display text-sm font-bold text-slate-800">Apollo Hospital</p>
              <p className="text-[10px] text-slate-500">Greams Road, Chennai — 600006</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-slate-500">TAX INVOICE</p>
              <p className="text-[10px] text-slate-500">No. AP-2026-08842</p>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2 text-[10px] text-slate-600">
            <p>Patient: John Doe</p>
            <p>IP No: 8842</p>
            <p>Admission: 12/06/2026</p>
            <p>Discharge: 15/06/2026</p>
          </div>

          <div className="space-y-1 text-[10px]">
            {LINE_ITEMS.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'relative rounded transition-all duration-200',
                  hoveredField === item.id
                    ? 'bg-yellow-200/70 ring-2 ring-yellow-400'
                    : 'bg-yellow-100/40'
                )}
              >
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-slate-700">{item.category}</span>
                  <span className="font-medium text-slate-800">{formatINR(item.amount)}</span>
                </div>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-[11px] font-bold text-slate-800">
              <span>Total</span>
              <span>{formatINR(LINE_ITEMS.reduce((s, i) => s + i.amount, 0))}</span>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-6">
            {LINE_ITEMS.map((item) => (
              <div
                key={`box-${item.id}`}
                className={cn(
                  'absolute rounded-sm border-2 transition-all duration-200',
                  hoveredField === item.id
                    ? 'border-yellow-400 bg-yellow-300/30'
                    : 'border-yellow-400/70 bg-yellow-200/20'
                )}
                style={{
                  left: `${item.box.x}%`,
                  top: `${item.box.y}%`,
                  width: `${item.box.w}%`,
                  height: `${item.box.h}%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
