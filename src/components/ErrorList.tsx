import { topErrors } from '../data/mockMetrics';

export function ErrorList() {
  return (
    <div className="chart-card">
      <h3 className="chart-title">Top Errors</h3>
      <ul className="error-list">
        {topErrors.map((e, i) => (
          <li key={i} className="error-item">
            <span className="error-code">{e.code}</span>
            <div className="error-info">
              <span className="error-message">{e.message}</span>
              <span className="error-service">{e.service}</span>
            </div>
            <span className="error-count">{e.count.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
