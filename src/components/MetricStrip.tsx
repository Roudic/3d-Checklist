import type { FilterMode } from '../types'

interface MetricStripProps {
  metrics: {
    total: number
    done: number
    activeCount: number
    pct: number
    highOpen: number
    lists: number
  }
  filter: FilterMode
  onFilter: (mode: FilterMode) => void
}

function pad(n: number, digits = 2): string {
  return String(n).padStart(digits, '0')
}

export function MetricStrip({ metrics, filter, onFilter }: MetricStripProps) {
  const filters: { id: FilterMode; label: string }[] = [
    { id: 'all', label: 'ALL' },
    { id: 'active', label: 'OPEN' },
    { id: 'done', label: 'CLEAR' },
  ]

  return (
    <section className="metrics" aria-label="System metrics">
      <div className="metric glass">
        <span className="metric__label">Completion</span>
        <div className="metric__row">
          <span className="metric__value">{pad(metrics.pct, 3)}</span>
          <span className="metric__unit">%</span>
        </div>
        <div className="metric__bar" role="progressbar" aria-valuenow={metrics.pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="metric__fill" style={{ width: `${metrics.pct}%` }} />
        </div>
      </div>

      <div className="metric glass">
        <span className="metric__label">Signal Load</span>
        <div className="metric__row">
          <span className="metric__value">{pad(metrics.activeCount)}</span>
          <span className="metric__unit">/ {pad(metrics.total)}</span>
        </div>
        <span className="metric__hint">open / total nodes</span>
      </div>

      <div className="metric glass">
        <span className="metric__label">Priority Heat</span>
        <div className="metric__row">
          <span className="metric__value metric__value--warn">{pad(metrics.highOpen)}</span>
          <span className="metric__unit">HIGH</span>
        </div>
        <span className="metric__hint">{metrics.lists} active rigs</span>
      </div>

      <div className="metric glass metric--filters">
        <span className="metric__label">Viewport Filter</span>
        <div className="filter-group" role="tablist" aria-label="Task filter">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={`filter-btn${filter === f.id ? ' is-active' : ''}`}
              onClick={() => onFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
