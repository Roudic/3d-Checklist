import type { FollowUp, Kitchen } from '../types'

interface DashboardProps {
  metrics: {
    openAssign: number
    overdue: number
    avgScore: number
    openFollow: number
    dueFollow: number
    highHeat: number
    templates: number
    kitchens: number
    submitted: number
  }
  kitchenStats: (Kitchen & {
    open: number
    follows: number
    avg: number | null
  })[]
  followUps: FollowUp[]
  onOpenFollows: () => void
  onOpenAssignments: () => void
}

function pad(n: number, d = 2) {
  return String(n).padStart(d, '0')
}

export function Dashboard({
  metrics,
  kitchenStats,
  followUps,
  onOpenFollows,
  onOpenAssignments,
}: DashboardProps) {
  const easyFollows = followUps
    .filter((f) => f.status !== 'done')
    .sort((a, b) => a.dueAt - b.dueAt)
    .slice(0, 5)

  return (
    <div className="view">
      <section className="metrics" aria-label="Tracking metrics">
        <div className="metric glass">
          <span className="metric__label">Open Assignments</span>
          <div className="metric__row">
            <span className="metric__value">{pad(metrics.openAssign)}</span>
            <span className="metric__unit">LIVE</span>
          </div>
          <span className="metric__hint">{metrics.overdue} overdue</span>
        </div>
        <div className="metric glass">
          <span className="metric__label">Avg Audit Score</span>
          <div className="metric__row">
            <span className="metric__value">{pad(metrics.avgScore, 3)}</span>
            <span className="metric__unit">%</span>
          </div>
          <div className="metric__bar" role="progressbar" aria-valuenow={metrics.avgScore}>
            <div className="metric__fill" style={{ width: `${metrics.avgScore}%` }} />
          </div>
        </div>
        <div className="metric glass">
          <span className="metric__label">Follow-up Heat</span>
          <div className="metric__row">
            <span className="metric__value metric__value--warn">{pad(metrics.highHeat)}</span>
            <span className="metric__unit">HIGH</span>
          </div>
          <span className="metric__hint">{metrics.openFollow} open · {metrics.dueFollow} due soon</span>
        </div>
        <div className="metric glass">
          <span className="metric__label">Coverage</span>
          <div className="metric__row">
            <span className="metric__value">{pad(metrics.kitchens)}</span>
            <span className="metric__unit">sites</span>
          </div>
          <span className="metric__hint">
            {metrics.templates} templates · {metrics.submitted} submitted
          </span>
        </div>
      </section>

      <div className="dash-grid">
        <section className="panel glass">
          <header className="panel__head">
            <div>
              <span className="panel__eyebrow">Site Tracking</span>
              <h2 className="panel__title">Kitchen Pulse</h2>
            </div>
            <button type="button" className="btn-ghost" onClick={onOpenAssignments}>
              Assignments
            </button>
          </header>
          <ul className="pulse-list">
            {kitchenStats.map((k) => (
              <li key={k.id} className="pulse-row">
                <div>
                  <p className="pulse-row__name">{k.name}</p>
                  <p className="pulse-row__meta">{k.site}</p>
                </div>
                <div className="pulse-row__stats">
                  <span>
                    <strong>{k.open}</strong> open
                  </span>
                  <span>
                    <strong>{k.follows}</strong> follows
                  </span>
                  <span className="pulse-row__score">
                    {k.avg === null ? '—' : `${k.avg}%`}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel glass">
          <header className="panel__head">
            <div>
              <span className="panel__eyebrow">Easy Follows</span>
              <h2 className="panel__title">Next Actions</h2>
            </div>
            <button type="button" className="btn-ghost" onClick={onOpenFollows}>
              All follow-ups
            </button>
          </header>
          <ul className="follow-easy">
            {easyFollows.length === 0 && (
              <li className="empty-row">All clear — no open follow-ups.</li>
            )}
            {easyFollows.map((f) => (
              <li key={f.id} className={`follow-chip follow-chip--${f.severity}`}>
                <div>
                  <p className="follow-chip__title">{f.title}</p>
                  <p className="follow-chip__meta">
                    {f.owner} · due {new Date(f.dueAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="follow-chip__status">{f.status.replace('_', ' ')}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
