import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-800',
        className
      )}
    />
  );
}

export function SkeletonTable({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-5 py-3">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton
              key={j}
              className={cn(
                'h-4 rounded',
                j === 0 ? 'w-32' : j === cols - 1 ? 'w-16' : 'flex-1'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
