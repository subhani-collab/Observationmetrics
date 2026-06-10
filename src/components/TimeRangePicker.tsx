import { TimeRange } from '../data/mockMetrics';

const ranges: { label: string; value: TimeRange }[] = [
  { label: '1h', value: '1h' },
  { label: '6h', value: '6h' },
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
];

interface Props {
  value: TimeRange;
  onChange: (r: TimeRange) => void;
}

export function TimeRangePicker({ value, onChange }: Props) {
  return (
    <div className="time-range-picker">
      {ranges.map((r) => (
        <button
          key={r.value}
          className={`range-btn ${value === r.value ? 'active' : ''}`}
          onClick={() => onChange(r.value)}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
