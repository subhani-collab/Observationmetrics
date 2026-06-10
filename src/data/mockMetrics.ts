export type TimeRange = '1h' | '6h' | '24h' | '7d';

function generateTimeSeries(
  points: number,
  intervalMs: number,
  baseValue: number,
  variance: number,
  trend = 0
) {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => {
    const t = now - (points - 1 - i) * intervalMs;
    const noise = (Math.random() - 0.5) * 2 * variance;
    const trendOffset = (i / points) * trend;
    return {
      time: new Date(t).toISOString(),
      value: Math.max(0, baseValue + noise + trendOffset),
    };
  });
}

export function getMetricsForRange(range: TimeRange) {
  const config: Record<TimeRange, { points: number; intervalMs: number }> = {
    '1h': { points: 60, intervalMs: 60_000 },
    '6h': { points: 72, intervalMs: 5 * 60_000 },
    '24h': { points: 96, intervalMs: 15 * 60_000 },
    '7d': { points: 84, intervalMs: 2 * 60 * 60_000 },
  };
  const { points, intervalMs } = config[range];

  return {
    responseTime: generateTimeSeries(points, intervalMs, 120, 40, 10),
    p95Latency: generateTimeSeries(points, intervalMs, 350, 80, 20),
    p99Latency: generateTimeSeries(points, intervalMs, 600, 120, 30),
    throughput: generateTimeSeries(points, intervalMs, 850, 200, -50),
    errorRate: generateTimeSeries(points, intervalMs, 0.8, 0.6),
    apdex: generateTimeSeries(points, intervalMs, 0.92, 0.05),
  };
}

export type ServiceStatus = 'healthy' | 'degraded' | 'down';

export interface Service {
  name: string;
  status: ServiceStatus;
  p50: number;
  p95: number;
  errorRate: number;
  rps: number;
}

export const services: Service[] = [
  { name: 'api-gateway', status: 'healthy', p50: 45, p95: 210, errorRate: 0.3, rps: 1240 },
  { name: 'auth-service', status: 'healthy', p50: 28, p95: 95, errorRate: 0.1, rps: 320 },
  { name: 'payment-service', status: 'degraded', p50: 380, p95: 1200, errorRate: 2.4, rps: 88 },
  { name: 'notification-svc', status: 'healthy', p50: 55, p95: 180, errorRate: 0.0, rps: 210 },
  { name: 'data-pipeline', status: 'down', p50: 0, p95: 0, errorRate: 100, rps: 0 },
  { name: 'search-service', status: 'healthy', p50: 62, p95: 240, errorRate: 0.5, rps: 560 },
];

export const topErrors = [
  { code: 500, message: 'Internal Server Error', count: 234, service: 'payment-service' },
  { code: 503, message: 'Service Unavailable', count: 189, service: 'data-pipeline' },
  { code: 429, message: 'Too Many Requests', count: 78, service: 'api-gateway' },
  { code: 404, message: 'Not Found', count: 45, service: 'search-service' },
  { code: 401, message: 'Unauthorized', count: 12, service: 'auth-service' },
];
