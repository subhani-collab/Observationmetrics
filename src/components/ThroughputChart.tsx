import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatTime } from '../utils/format';

interface DataPoint { time: string; value: number }

interface Props {
  data: DataPoint[];
}

export function ThroughputChart({ data }: Props) {
  const chartData = data.map((d) => ({ time: d.time, rps: Math.round(d.value) }));

  return (
    <div className="chart-card">
      <h3 className="chart-title">Throughput</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rpsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
          <XAxis dataKey="time" tickFormatter={formatTime} tick={{ fill: '#888', fontSize: 11 }} />
          <YAxis unit=" rps" tick={{ fill: '#888', fontSize: 11 }} width={60} />
          <Tooltip
            contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8 }}
            labelFormatter={(v) => new Date(v).toLocaleString()}
            formatter={(v) => [`${v} req/s`]}
          />
          <Area type="monotone" dataKey="rps" stroke="#818cf8" fill="url(#rpsGrad)" strokeWidth={2} name="Throughput" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
