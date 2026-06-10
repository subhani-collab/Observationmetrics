import { useState, useEffect } from 'react';
import { Activity, Zap, AlertTriangle, TrendingUp } from 'lucide-react';
import { TimeRangePicker } from './components/TimeRangePicker';
import { StatCard } from './components/StatCard';
import { LatencyChart } from './components/LatencyChart';
import { ThroughputChart } from './components/ThroughputChart';
import { ErrorRateChart } from './components/ErrorRateChart';
import { ServiceTable } from './components/ServiceTable';
import { ErrorList } from './components/ErrorList';
import { getMetricsForRange, services, TimeRange } from './data/mockMetrics';

export default function App() {
  const [range, setRange] = useState<TimeRange>('1h');
  const [metrics, setMetrics] = useState(() => getMetricsForRange('1h'));
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    setMetrics(getMetricsForRange(range));
  }, [range]);

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics(getMetricsForRange(range));
      setLastUpdated(new Date());
    }, 30_000);
    return () => clearInterval(id);
  }, [range]);

  const latest = {
    responseTime: metrics.responseTime.at(-1)?.value ?? 0,
    throughput: metrics.throughput.at(-1)?.value ?? 0,
    errorRate: metrics.errorRate.at(-1)?.value ?? 0,
    apdex: metrics.apdex.at(-1)?.value ?? 0,
  };

  const degradedCount = services.filter((s) => s.status === 'degraded').length;
  const downCount = services.filter((s) => s.status === 'down').length;

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <Activity size={22} className="logo-icon" />
          <h1 className="app-title">ObservationMetrics</h1>
          <span className="header-subtitle">APM Dashboard</span>
        </div>
        <div className="header-right">
          <TimeRangePicker value={range} onChange={setRange} />
          <span className="last-updated">
            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </header>

      {(degradedCount > 0 || downCount > 0) && (
        <div className="alert-banner">
          <AlertTriangle size={16} />
          {downCount > 0 && <span>{downCount} service{downCount > 1 ? 's' : ''} down</span>}
          {degradedCount > 0 && <span>{degradedCount} service{degradedCount > 1 ? 's' : ''} degraded</span>}
        </div>
      )}

      <main className="main">
        <div className="stat-grid">
          <StatCard
            label="Avg Response Time"
            value={Math.round(latest.responseTime).toString()}
            unit="ms"
            delta={-3.2}
            icon={Zap}
            color="icon-blue"
          />
          <StatCard
            label="Throughput"
            value={Math.round(latest.throughput).toString()}
            unit=" rps"
            delta={-5.8}
            icon={TrendingUp}
            color="icon-purple"
          />
          <StatCard
            label="Error Rate"
            value={latest.errorRate.toFixed(2)}
            unit="%"
            delta={+0.4}
            icon={AlertTriangle}
            color="icon-red"
          />
          <StatCard
            label="Apdex Score"
            value={latest.apdex.toFixed(2)}
            delta={-0.2}
            icon={Activity}
            color="icon-green"
          />
        </div>

        <div className="chart-grid-2">
          <LatencyChart
            p50={metrics.responseTime}
            p95={metrics.p95Latency}
            p99={metrics.p99Latency}
          />
          <ThroughputChart data={metrics.throughput} />
        </div>

        <div className="chart-grid-1">
          <ErrorRateChart data={metrics.errorRate} />
        </div>

        <div className="chart-grid-2">
          <ServiceTable services={services} />
          <ErrorList />
        </div>
      </main>
    </div>
  );
}
