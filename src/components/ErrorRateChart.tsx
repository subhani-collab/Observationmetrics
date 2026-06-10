import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { formatTime } from '../utils/format';

interface DataPoint { time: string; value: number }

interface Props {
  data: DataPoint[];
}

export function ErrorRateChart({ data }: Props) {
  const chartData = data.map((d) => ({ time: d.time, rate: +d.value.toFixed(2) }));

  return (
    <div className="chart-card">
      <h3 className="chart-title">Error Rate</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f87171" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
          <XAxis dataKey="time" tickFormatter={formatTime} tick={{ fill: '#888', fontSize: 11 }} />
          <YAxis unit="%" tick={{ fill: '#888', fontSize: 11 }} width={45} />
          <Tooltip
            contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8 }}
            labelFormatter={(v) => new Date(v).toLocaleString()}
            formatter={(v) => [`${v}%`]}
          />
          <ReferenceLine y={1} stroke="#facc15" strokeDasharray="4 4" label={{ value: 'SLO', fill: '#facc15', fontSize: 11 }} />
          <Area type="monotone" dataKey="rate" stroke="#f87171" fill="url(#errGrad)" strokeWidth={2} name="Error %" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
