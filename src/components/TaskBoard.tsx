import { useState, type FormEvent } from 'react'
import type { Priority, Task } from '../types'

interface TaskBoardProps {
  listName: string
  tasks: Task[]
  onAdd: (title: string, priority: Priority) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onPriority: (id: string, priority: Priority) => void
}

const PRIORITIES: Priority[] = ['low', 'mid', 'high']

export function TaskBoard({
  listName,
  tasks,
  onAdd,
  onToggle,
  onDelete,
  onPriority,
}: TaskBoardProps) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('mid')

  function submit(e: FormEvent) {
    e.preventDefault()
    onAdd(title, priority)
    setTitle('')
  }

  const open = tasks.filter((t) => !t.done).length

  return (
    <section className="board glass">
      <header className="board__head">
        <div>
          <span className="board__eyebrow">Active Viewport</span>
          <h2 className="board__title">{listName}</h2>
        </div>
        <div className="board__stat">
          <span className="board__stat-value">{String(open).padStart(2, '0')}</span>
          <span className="board__stat-label">open nodes</span>
        </div>
      </header>

      <form className="composer" onSubmit={submit}>
        <label className="sr-only" htmlFor="task-title">
          Task title
        </label>
        <input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Queue a task…"
          maxLength={120}
        />
        <div className="composer__priority" role="group" aria-label="Priority">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              className={`prio-chip prio-chip--${p}${priority === p ? ' is-active' : ''}`}
              onClick={() => setPriority(p)}
              aria-pressed={priority === p}
            >
              {p}
            </button>
          ))}
        </div>
        <button type="submit" className="composer__submit" disabled={!title.trim()}>
          Commit
        </button>
      </form>

      <ul className="task-list">
        {tasks.length === 0 && (
          <li className="task-empty">
            <span>No nodes in this filter.</span>
            <span>Commit a task to begin the pass.</span>
          </li>
        )}
        {tasks.map((task, index) => (
          <li
            key={task.id}
            className={`task${task.done ? ' is-done' : ''}`}
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
          >
            <button
              type="button"
              className="task__check"
              aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
              aria-pressed={task.done}
              onClick={() => onToggle(task.id)}
            >
              <span className="task__check-inner" />
            </button>
            <div className="task__content">
              <span className="task__title">{task.title}</span>
              <div className="task__meta">
                <select
                  className={`task__prio task__prio--${task.priority}`}
                  value={task.priority}
                  aria-label="Change priority"
                  onChange={(e) => onPriority(task.id, e.target.value as Priority)}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p.toUpperCase()}
                    </option>
                  ))}
                </select>
                <span className="task__id">{task.id.slice(-6).toUpperCase()}</span>
              </div>
            </div>
            <button
              type="button"
              className="task__delete"
              aria-label={`Delete ${task.title}`}
              onClick={() => onDelete(task.id)}
            >
              Purge
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
