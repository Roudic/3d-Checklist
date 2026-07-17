import type { ReactNode } from 'react'
import type { AppView } from '../types'

interface ShellProps {
  view: AppView
  onView: (v: AppView) => void
  onLogout: () => void
  children: ReactNode
}

const NAV: { id: AppView; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'followups', label: 'Follow-ups' },
  { id: 'templates', label: 'Templates' },
]

export function AppShell({ view, onView, onLogout, children }: ShellProps) {
  return (
    <div className="app">
      <header className="masthead">
        <div className="masthead__brand">
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="brand-copy">
            <p className="brand-name">RIG</p>
            <p className="brand-tag">Kitchen Audit Systems</p>
          </div>
        </div>
        <nav className="nav" aria-label="Primary">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav__btn${view === item.id || (view === 'run' && item.id === 'assignments') ? ' is-active' : ''}`}
              onClick={() => onView(item.id)}
            >
              {item.label}
            </button>
          ))}
          <button type="button" className="nav__btn nav__btn--ghost" onClick={onLogout}>
            Log out
          </button>
        </nav>
      </header>
      {children}
      <footer className="foot">
        <span>RIG // KITCHEN AUDIT</span>
        <span>SESSION ACTIVE</span>
      </footer>
    </div>
  )
}
