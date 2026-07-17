import { useState, type FormEvent } from 'react'

interface LoginScreenProps {
  error: string
  onLogin: (user: string, pass: string) => boolean
}

export function LoginScreen({ error, onLogin }: LoginScreenProps) {
  const [user, setUser] = useState('admin')
  const [pass, setPass] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    onLogin(user, pass)
  }

  return (
    <div className="login">
      <div className="login__panel glass">
        <div className="login__brand">
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p className="brand-name">RIG</p>
          <p className="brand-tag">Kitchen Audit Systems</p>
        </div>
        <p className="login__copy">
          Sign in to track kitchen audits, assignments, follow-ups, and templates.
        </p>
        <form className="login__form" onSubmit={submit}>
          <label>
            <span>User</span>
            <input
              autoComplete="username"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </label>
          <label>
            <span>Passcode</span>
            <input
              type="password"
              autoComplete="current-password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••"
            />
          </label>
          {error && <p className="login__error">{error}</p>}
          <button type="submit" className="btn-primary">
            Enter Rig
          </button>
        </form>
        <p className="login__hint">Demo access · admin / 1234</p>
      </div>
    </div>
  )
}
