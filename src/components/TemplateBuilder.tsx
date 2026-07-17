import { useMemo, useState, type FormEvent } from 'react'
import type { AuditTemplate, QuestionType } from '../types'
import { QUESTION_TYPES } from '../types'

interface TemplateBuilderProps {
  templates: AuditTemplate[]
  onAddTemplate: (name: string, category: string) => string | undefined
  onUpdateMeta: (
    id: string,
    patch: Partial<Pick<AuditTemplate, 'name' | 'category'>>,
  ) => void
  onDeleteTemplate: (id: string) => void
  onAddQuestion: (templateId: string) => void
  onUpdateQuestion: (
    templateId: string,
    questionId: string,
    patch: Partial<AuditTemplate['questions'][number]>,
  ) => void
  onRemoveQuestion: (templateId: string, questionId: string) => void
  onChangeType: (templateId: string, questionId: string, type: QuestionType) => void
}

export function TemplateBuilder({
  templates,
  onAddTemplate,
  onUpdateMeta,
  onDeleteTemplate,
  onAddQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
  onChangeType,
}: TemplateBuilderProps) {
  const [activeId, setActiveId] = useState(templates[0]?.id ?? '')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Safety')

  const active = useMemo(
    () => templates.find((t) => t.id === activeId) ?? templates[0],
    [templates, activeId],
  )

  function create(e: FormEvent) {
    e.preventDefault()
    const id = onAddTemplate(name, category)
    if (id) {
      setActiveId(id)
      setName('')
    }
  }

  return (
    <div className="view stage-2">
      <aside className="rail glass">
        <div className="rail__head">
          <span className="rail__eyebrow">Template Library</span>
          <h2 className="rail__title">Audit Forms</h2>
        </div>
        <ul className="rail__list">
          {templates.map((t, i) => (
            <li key={t.id}>
              <button
                type="button"
                className={`rail__item${active?.id === t.id ? ' is-active' : ''}`}
                onClick={() => setActiveId(t.id)}
              >
                <span className="rail__index">{String(i + 1).padStart(2, '0')}</span>
                <span className="rail__body">
                  <span className="rail__name">{t.name}</span>
                  <span className="rail__meta">
                    {t.category} · {t.questions.length} questions
                  </span>
                </span>
                <span className="rail__pulse" />
              </button>
              {templates.length > 1 && (
                <button
                  type="button"
                  className="rail__delete"
                  aria-label={`Delete ${t.name}`}
                  onClick={() => onDeleteTemplate(t.id)}
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
        <form className="rail__composer stacked" onSubmit={create}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New template name"
            maxLength={48}
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            maxLength={24}
          />
          <button type="submit" disabled={!name.trim()}>
            Build template
          </button>
        </form>
      </aside>

      {active && (
        <section className="board glass">
          <header className="board__head">
            <div className="builder-meta">
              <span className="board__eyebrow">Template Builder</span>
              <input
                className="builder-title"
                value={active.name}
                onChange={(e) => onUpdateMeta(active.id, { name: e.target.value })}
              />
              <input
                className="builder-cat"
                value={active.category}
                onChange={(e) => onUpdateMeta(active.id, { category: e.target.value })}
              />
            </div>
            <button type="button" className="btn-primary" onClick={() => onAddQuestion(active.id)}>
              Add question
            </button>
          </header>

          <ul className="q-list">
            {active.questions.map((q, index) => (
              <li key={q.id} className="q-card">
                <div className="q-card__top">
                  <span className="q-card__idx">Q{String(index + 1).padStart(2, '0')}</span>
                  <label className="q-card__req">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) =>
                        onUpdateQuestion(active.id, q.id, { required: e.target.checked })
                      }
                    />
                    Required
                  </label>
                  <button
                    type="button"
                    className="btn-ghost danger"
                    onClick={() => onRemoveQuestion(active.id, q.id)}
                  >
                    Remove
                  </button>
                </div>
                <input
                  className="q-card__prompt"
                  value={q.prompt}
                  onChange={(e) =>
                    onUpdateQuestion(active.id, q.id, { prompt: e.target.value })
                  }
                  placeholder="Question prompt"
                />
                <div className="type-switch" role="group" aria-label="Question type">
                  {QUESTION_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      title={t.hint}
                      className={`type-btn${q.type === t.id ? ' is-active' : ''}`}
                      onClick={() => onChangeType(active.id, q.id, t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <input
                  className="q-card__help"
                  value={q.help ?? ''}
                  onChange={(e) =>
                    onUpdateQuestion(active.id, q.id, { help: e.target.value })
                  }
                  placeholder="Helper text (optional)"
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
