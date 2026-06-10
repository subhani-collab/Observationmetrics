import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { formatTime } from '../utils/format';

interface DataPoint { time: string; value: number }

interface Props {
  p50: DataPoint[];
  p95: DataPoint[];
  p99: DataPoint[];
}

export function LatencyChart({ p50, p95, p99 }: Props) {
  const data = p50.map((d, i) => ({
    time: d.time,
    p50: Math.round(d.value),
    p95: Math.round(p95[i]?.value ?? 0),
    p99: Math.round(p99[i]?.value ?? 0),
  }));

  return (
    <div className="chart-card">
      <h3 className="chart-title">Latency Percentiles</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
          <XAxis dataKey="time" tickFormatter={formatTime} tick={{ fill: '#888', fontSize: 11 }} />
          <YAxis unit="ms" tick={{ fill: '#888', fontSize: 11 }} width={55} />
          <Tooltip
            contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8 }}
            labelFormatter={(v) => new Date(v).toLocaleString()}
            formatter={(v) => [`${v} ms`]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#aaa' }} />
          <Line type="monotone" dataKey="p50" stroke="#4ade80" dot={false} strokeWidth={2} name="p50" />
          <Line type="monotone" dataKey="p95" stroke="#facc15" dot={false} strokeWidth={2} name="p95" />
          <Line type="monotone" dataKey="p99" stroke="#f87171" dot={false} strokeWidth={2} name="p99" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
