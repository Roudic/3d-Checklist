import { useCallback, useEffect, useState } from 'react'

const AUTH_KEY = 'rig-kitchen-auth'

export function useAuth() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1')
  const [error, setError] = useState('')

  const login = useCallback((user: string, pass: string) => {
    if (user.trim().toLowerCase() === 'admin' && pass === '1234') {
      sessionStorage.setItem(AUTH_KEY, '1')
      setAuthed(true)
      setError('')
      return true
    }
    setError('Invalid credentials. Use admin / 1234')
    return false
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY)
    setAuthed(false)
  }, [])

  useEffect(() => {
    setAuthed(sessionStorage.getItem(AUTH_KEY) === '1')
  }, [])

  return { authed, error, login, logout, setError }
}
