import { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  unit?: string;
  delta?: number;
  icon: LucideIcon;
  color: string;
}

export function StatCard({ label, value, unit, delta, icon: Icon, color }: Props) {
  const positive = delta !== undefined && delta >= 0;
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        <div className={`stat-icon ${color}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="stat-value">
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      {delta !== undefined && (
        <div className={`stat-delta ${positive ? 'up' : 'down'}`}>
          {positive ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}% vs last period
        </div>
      )}
    </div>
  );
}
