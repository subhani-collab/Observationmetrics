'use client';

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import type { Employee } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export function PerformanceChart({ emp }: { emp: Employee }) {
  const data = [
    { metric: 'Product & Role', value: emp.product_role_understanding ?? 0, fullMark: 5 },
    { metric: 'Communication', value: emp.communication_skills ?? 0, fullMark: 5 },
    { metric: 'Performance', value: emp.overall_performance_score ?? 0, fullMark: 5 },
  ];

  const hasData = data.some(d => d.value > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader><CardTitle>Performance Radar</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 text-center py-8">No rating data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Performance Radar</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 5]}
              tick={{ fill: '#475569', fontSize: 10 }}
              tickCount={6}
            />
            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#818cf8' }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
