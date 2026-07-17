import { useState, type FormEvent } from 'react'
import type { AuditAssignment, AuditTemplate, Kitchen } from '../types'

interface AssignmentsProps {
  assignments: AuditAssignment[]
  templates: AuditTemplate[]
  kitchens: Kitchen[]
  onCreate: (input: {
    templateId: string
    kitchenId: string
    assignee: string
    dueAt: number
  }) => void
  onRun: (id: string) => void
}

export function AssignmentsView({
  assignments,
  templates,
  kitchens,
  onCreate,
  onRun,
}: AssignmentsProps) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? '')
  const [kitchenId, setKitchenId] = useState(kitchens[0]?.id ?? '')
  const [assignee, setAssignee] = useState('')
  const [dueDays, setDueDays] = useState(2)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!templateId || !kitchenId) return
    onCreate({
      templateId,
      kitchenId,
      assignee,
      dueAt: Date.now() + dueDays * 86400000,
    })
    setAssignee('')
  }

  function labelTemplate(id: string) {
    return templates.find((t) => t.id === id)?.name ?? id
  }
  function labelKitchen(id: string) {
    return kitchens.find((k) => k.id === id)?.name ?? id
  }

  return (
    <div className="view">
      <section className="panel glass">
        <header className="panel__head">
          <div>
            <span className="panel__eyebrow">Dispatch</span>
            <h2 className="panel__title">Assignments</h2>
          </div>
        </header>

        <form className="inline-form wrap" onSubmit={submit}>
          <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select value={kitchenId} onChange={(e) => setKitchenId(e.target.value)}>
            {kitchens.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>
          <input
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="Assignee"
            required
          />
          <label className="due-field">
            Due in
            <input
              type="number"
              min={0}
              max={30}
              value={dueDays}
              onChange={(e) => setDueDays(Number(e.target.value))}
            />
            days
          </label>
          <button type="submit" className="btn-primary">
            Assign audit
          </button>
        </form>

        <ul className="assign-list">
          {assignments.map((a) => {
            const overdue =
              (a.status === 'assigned' || a.status === 'in_progress') &&
              a.dueAt < Date.now()
            return (
              <li key={a.id} className="assign-row">
                <div>
                  <p className="assign-row__title">{labelTemplate(a.templateId)}</p>
                  <p className="assign-row__meta">
                    {labelKitchen(a.kitchenId)} · {a.assignee}
                    {overdue
                      ? ' · OVERDUE'
                      : ` · due ${new Date(a.dueAt).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="assign-row__side">
                  <span className={`status-pill status-pill--${a.status}`}>
                    {a.status.replace('_', ' ')}
                  </span>
                  {a.scorePct !== null && (
                    <span className="score-pill">{a.scorePct}%</span>
                  )}
                  <button type="button" className="btn-primary" onClick={() => onRun(a.id)}>
                    {a.status === 'submitted' || a.status === 'closed' ? 'Review' : 'Run'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
