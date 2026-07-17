import { useState, type FormEvent, type KeyboardEvent } from 'react'
import type { Checklist } from '../types'

interface ChecklistRailProps {
  checklists: Checklist[]
  activeId: string
  onSelect: (id: string) => void
  onAdd: (name: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
}

export function ChecklistRail({
  checklists,
  activeId,
  onSelect,
  onAdd,
  onDelete,
  onRename,
}: ChecklistRailProps) {
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    onAdd(draft)
    setDraft('')
  }

  function startEdit(list: Checklist) {
    setEditingId(list.id)
    setEditName(list.name)
  }

  function commitEdit() {
    if (editingId) {
      onRename(editingId, editName)
      setEditingId(null)
    }
  }

  function onEditKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditingId(null)
  }

  return (
    <aside className="rail glass">
      <div className="rail__head">
        <span className="rail__eyebrow">Rig Library</span>
        <h2 className="rail__title">Checklists</h2>
      </div>

      <ul className="rail__list">
        {checklists.map((list, index) => {
          const done = list.tasks.filter((t) => t.done).length
          const total = list.tasks.length
          const active = list.id === activeId
          return (
            <li key={list.id}>
              <button
                type="button"
                className={`rail__item${active ? ' is-active' : ''}`}
                onClick={() => onSelect(list.id)}
                onDoubleClick={() => startEdit(list)}
              >
                <span className="rail__index">{String(index + 1).padStart(2, '0')}</span>
                <span className="rail__body">
                  {editingId === list.id ? (
                    <input
                      className="rail__edit"
                      value={editName}
                      autoFocus
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={onEditKey}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="rail__name">{list.name}</span>
                  )}
                  <span className="rail__meta">
                    {done}/{total} cleared
                  </span>
                </span>
                <span
                  className="rail__pulse"
                  style={{
                    opacity: total === 0 ? 0.2 : 0.35 + (done / Math.max(total, 1)) * 0.65,
                  }}
                />
              </button>
              {checklists.length > 1 && (
                <button
                  type="button"
                  className="rail__delete"
                  aria-label={`Delete ${list.name}`}
                  onClick={() => onDelete(list.id)}
                >
                  ×
                </button>
              )}
            </li>
          )
        })}
      </ul>

      <form className="rail__composer" onSubmit={submit}>
        <label className="sr-only" htmlFor="new-list">
          New checklist
        </label>
        <input
          id="new-list"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="New checklist name"
          maxLength={48}
        />
        <button type="submit" disabled={!draft.trim()}>
          Add
        </button>
      </form>
    </aside>
  )
}
