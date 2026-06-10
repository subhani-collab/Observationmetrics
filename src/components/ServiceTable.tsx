import { Service, ServiceStatus } from '../data/mockMetrics';

const statusColor: Record<ServiceStatus, string> = {
  healthy: '#4ade80',
  degraded: '#facc15',
  down: '#f87171',
};

const statusDot: Record<ServiceStatus, string> = {
  healthy: 'dot-green',
  degraded: 'dot-yellow',
  down: 'dot-red',
};

interface Props {
  services: Service[];
}

export function ServiceTable({ services }: Props) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">Services</h3>
      <table className="service-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Status</th>
            <th>p50</th>
            <th>p95</th>
            <th>Errors</th>
            <th>RPS</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.name}>
              <td className="service-name">{s.name}</td>
              <td>
                <span className={`status-badge ${statusDot[s.status]}`} style={{ color: statusColor[s.status] }}>
                  ● {s.status}
                </span>
              </td>
              <td>{s.p50 ? `${s.p50}ms` : '—'}</td>
              <td>{s.p95 ? `${s.p95}ms` : '—'}</td>
              <td className={s.errorRate > 1 ? 'cell-red' : ''}>{s.errorRate.toFixed(1)}%</td>
              <td>{s.rps.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
