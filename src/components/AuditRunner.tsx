import { useMemo, useState } from 'react'
import type {
  AuditAnswer,
  AuditAssignment,
  AuditTemplate,
  Kitchen,
  Question,
  QuestionType,
} from '../types'

interface AuditRunnerProps {
  audit: AuditAssignment
  template: AuditTemplate
  kitchen: Kitchen
  onSave: (answers: AuditAnswer[]) => void
  onSubmit: (answers: AuditAnswer[]) => void
  onBack: () => void
}

function AnswerControl({
  question,
  value,
  disabled,
  onChange,
}: {
  question: Question
  value: AuditAnswer['value']
  disabled: boolean
  onChange: (v: AuditAnswer['value']) => void
}) {
  const type: QuestionType = question.type

  if (type === 'yes_no') {
    return (
      <div className="answer-group">
        {[
          { v: true, label: 'Yes' },
          { v: false, label: 'No' },
        ].map((opt) => (
          <button
            key={String(opt.v)}
            type="button"
            disabled={disabled}
            className={`chip-btn${value === opt.v ? ' is-active' : ''}`}
            onClick={() => onChange(opt.v)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    )
  }

  if (type === 'pass_fail') {
    return (
      <div className="answer-group">
        {['pass', 'fail', 'na'].map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            className={`chip-btn${value === opt ? ' is-active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt.toUpperCase()}
          </button>
        ))}
      </div>
    )
  }

  if (type === 'score') {
    return (
      <div className="answer-group">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            className={`chip-btn${value === n ? ' is-active' : ''}`}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </div>
    )
  }

  if (type === 'temp') {
    return (
      <label className="temp-field">
        <input
          type="number"
          step="0.1"
          disabled={disabled}
          value={typeof value === 'number' ? value : ''}
          onChange={(e) =>
            onChange(e.target.value === '' ? null : Number(e.target.value))
          }
          placeholder="°C"
        />
        <span>°C</span>
      </label>
    )
  }

  if (type === 'checkbox') {
    return (
      <label className="check-field">
        <input
          type="checkbox"
          disabled={disabled}
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
        />
        Confirmed
      </label>
    )
  }

  return (
    <textarea
      disabled={disabled}
      rows={2}
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter notes…"
    />
  )
}

export function AuditRunner({
  audit,
  template,
  kitchen,
  onSave,
  onSubmit,
  onBack,
}: AuditRunnerProps) {
  const locked = audit.status === 'submitted' || audit.status === 'closed'
  const [answers, setAnswers] = useState<AuditAnswer[]>(() => {
    return template.questions.map((q) => {
      const existing = audit.answers.find((a) => a.questionId === q.id)
      return existing ?? { questionId: q.id, value: null }
    })
  })

  const progress = useMemo(() => {
    const required = template.questions.filter((q) => q.required)
    const filled = required.filter((q) => {
      const a = answers.find((x) => x.questionId === q.id)
      return a && a.value !== null && a.value !== ''
    }).length
    return { filled, total: required.length }
  }, [answers, template.questions])

  function setValue(questionId: string, value: AuditAnswer['value']) {
    setAnswers((prev) =>
      prev.map((a) => (a.questionId === questionId ? { ...a, value } : a)),
    )
  }

  return (
    <div className="view">
      <section className="panel glass">
        <header className="panel__head">
          <div>
            <span className="panel__eyebrow">Audit Run · {kitchen.name}</span>
            <h2 className="panel__title">{template.name}</h2>
            <p className="panel__sub">
              {audit.assignee} · {progress.filled}/{progress.total} required filled
              {audit.scorePct !== null ? ` · score ${audit.scorePct}%` : ''}
            </p>
          </div>
          <button type="button" className="btn-ghost" onClick={onBack}>
            Back
          </button>
        </header>

        <ul className="run-list">
          {template.questions.map((q, i) => {
            const ans = answers.find((a) => a.questionId === q.id)
            return (
              <li key={q.id} className="run-q">
                <div className="run-q__head">
                  <span className="q-card__idx">Q{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="run-q__prompt">
                      {q.prompt}
                      {q.required && <span className="req-star"> *</span>}
                    </p>
                    {q.help && <p className="run-q__help">{q.help}</p>}
                  </div>
                  <span className="type-tag">{q.type.replace('_', ' ')}</span>
                </div>
                <AnswerControl
                  question={q}
                  value={ans?.value ?? null}
                  disabled={locked}
                  onChange={(v) => setValue(q.id, v)}
                />
              </li>
            )
          })}
        </ul>

        {!locked && (
          <div className="run-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => onSave(answers)}
            >
              Save progress
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={progress.filled < progress.total}
              onClick={() => onSubmit(answers)}
            >
              Submit audit
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
