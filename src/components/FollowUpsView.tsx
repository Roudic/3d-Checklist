import { useMemo, useState, type FormEvent } from 'react'
import type {
  AuditAssignment,
  FollowUp,
  FollowUpStatus,
  Kitchen,
  Severity,
} from '../types'

interface FollowUpsProps {
  followUps: FollowUp[]
  kitchens: Kitchen[]
  assignments: AuditAssignment[]
  onStatus: (id: string, status: FollowUpStatus) => void
  onAdd: (input: {
    auditId: string
    kitchenId: string
    title: string
    severity: Severity
    owner: string
    dueAt: number
  }) => void
}

const STATUSES: FollowUpStatus[] = ['open', 'in_progress', 'done']

export function FollowUpsView({
  followUps,
  kitchens,
  assignments,
  onStatus,
  onAdd,
}: FollowUpsProps) {
  const [filter, setFilter] = useState<'open' | 'all'>('open')
  const [title, setTitle] = useState('')
  const [owner, setOwner] = useState('')
  const [severity, setSeverity] = useState<Severity>('mid')
  const [kitchenId, setKitchenId] = useState(kitchens[0]?.id ?? '')

  const list = useMemo(() => {
    const rows =
      filter === 'open' ? followUps.filter((f) => f.status !== 'done') : followUps
    return [...rows].sort((a, b) => a.dueAt - b.dueAt)
  }, [followUps, filter])

  function submit(e: FormEvent) {
    e.preventDefault()
    const auditId = assignments.find((a) => a.kitchenId === kitchenId)?.id ?? ''
    onAdd({
      auditId,
      kitchenId,
      title,
      severity,
      owner,
      dueAt: Date.now() + 2 * 86400000,
    })
    setTitle('')
    setOwner('')
  }

  function kitchenName(id: string) {
    return kitchens.find((k) => k.id === id)?.name ?? id
  }

  return (
    <div className="view">
      <section className="panel glass">
        <header className="panel__head">
          <div>
            <span className="panel__eyebrow">Corrective Actions</span>
            <h2 className="panel__title">Follow-ups</h2>
          </div>
          <div className="filter-group compact">
            <button
              type="button"
              className={`filter-btn${filter === 'open' ? ' is-active' : ''}`}
              onClick={() => setFilter('open')}
            >
              OPEN
            </button>
            <button
              type="button"
              className={`filter-btn${filter === 'all' ? ' is-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              ALL
            </button>
          </div>
        </header>

        <form className="inline-form" onSubmit={submit}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quick follow-up title"
            required
          />
          <select value={kitchenId} onChange={(e) => setKitchenId(e.target.value)}>
            {kitchens.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>
          <input
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Owner"
          />
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity)}
          >
            <option value="low">Low</option>
            <option value="mid">Mid</option>
            <option value="high">High</option>
          </select>
          <button type="submit" className="btn-primary" disabled={!title.trim()}>
            Add follow
          </button>
        </form>

        <ul className="follow-list">
          {list.length === 0 && <li className="empty-row">No follow-ups in this filter.</li>}
          {list.map((f) => {
            const overdue = f.status !== 'done' && f.dueAt < Date.now()
            return (
              <li key={f.id} className={`follow-item severity-${f.severity}`}>
                <div className="follow-item__main">
                  <p className="follow-item__title">{f.title}</p>
                  <p className="follow-item__meta">
                    {kitchenName(f.kitchenId)} · {f.owner}
                    {overdue ? ' · OVERDUE' : ` · due ${new Date(f.dueAt).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="follow-item__actions">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`chip-btn${f.status === s ? ' is-active' : ''}`}
                      onClick={() => onStatus(f.id, s)}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
