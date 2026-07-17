import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Checklist, FilterMode, Priority, Task } from '../types'

const STORAGE_KEY = 'rig-checklists-v1'

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function seedData(): Checklist[] {
  return [
    {
      id: uid(),
      name: 'Launch Sequence',
      createdAt: Date.now(),
      tasks: [
        {
          id: uid(),
          title: 'Lock lighting volume',
          done: true,
          priority: 'high',
          createdAt: Date.now() - 40000,
        },
        {
          id: uid(),
          title: 'Bake navmesh for sector B',
          done: false,
          priority: 'high',
          createdAt: Date.now() - 30000,
        },
        {
          id: uid(),
          title: 'Validate glass material LOD',
          done: false,
          priority: 'mid',
          createdAt: Date.now() - 20000,
        },
        {
          id: uid(),
          title: 'Capture viewport metrics',
          done: false,
          priority: 'low',
          createdAt: Date.now() - 10000,
        },
      ],
    },
    {
      id: uid(),
      name: 'Art Pass',
      createdAt: Date.now() - 1000,
      tasks: [
        {
          id: uid(),
          title: 'Retopology check on prop kit',
          done: true,
          priority: 'mid',
          createdAt: Date.now() - 50000,
        },
        {
          id: uid(),
          title: 'Wire specular response maps',
          done: true,
          priority: 'low',
          createdAt: Date.now() - 45000,
        },
      ],
    },
  ]
}

function load(): Checklist[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedData()
    const parsed = JSON.parse(raw) as Checklist[]
    if (!Array.isArray(parsed) || parsed.length === 0) return seedData()
    return parsed
  } catch {
    return seedData()
  }
}

export function useChecklists() {
  const [checklists, setChecklists] = useState<Checklist[]>(() => load())
  const [activeId, setActiveId] = useState<string>('')
  const [filter, setFilter] = useState<FilterMode>('all')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checklists))
  }, [checklists])

  useEffect(() => {
    if (!checklists.some((c) => c.id === activeId) && checklists[0]) {
      setActiveId(checklists[0].id)
    }
  }, [checklists, activeId])

  const active = useMemo(
    () => checklists.find((c) => c.id === activeId) ?? checklists[0],
    [checklists, activeId],
  )

  const metrics = useMemo(() => {
    const allTasks = checklists.flatMap((c) => c.tasks)
    const total = allTasks.length
    const done = allTasks.filter((t) => t.done).length
    const activeCount = total - done
    const pct = total === 0 ? 0 : Math.round((done / total) * 100)
    const highOpen = allTasks.filter((t) => !t.done && t.priority === 'high').length
    return { total, done, activeCount, pct, highOpen, lists: checklists.length }
  }, [checklists])

  const filteredTasks = useMemo(() => {
    const tasks = active?.tasks ?? []
    if (filter === 'active') return tasks.filter((t) => !t.done)
    if (filter === 'done') return tasks.filter((t) => t.done)
    return tasks
  }, [active, filter])

  const addChecklist = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const next: Checklist = {
      id: uid(),
      name: trimmed,
      tasks: [],
      createdAt: Date.now(),
    }
    setChecklists((prev) => [...prev, next])
    setActiveId(next.id)
  }, [])

  const renameChecklist = useCallback((id: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setChecklists((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: trimmed } : c)),
    )
  }, [])

  const deleteChecklist = useCallback((id: string) => {
    setChecklists((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((c) => c.id !== id)
    })
  }, [])

  const addTask = useCallback(
    (title: string, priority: Priority = 'mid') => {
      if (!active) return
      const trimmed = title.trim()
      if (!trimmed) return
      const task: Task = {
        id: uid(),
        title: trimmed,
        done: false,
        priority,
        createdAt: Date.now(),
      }
      setChecklists((prev) =>
        prev.map((c) =>
          c.id === active.id ? { ...c, tasks: [task, ...c.tasks] } : c,
        ),
      )
    },
    [active],
  )

  const toggleTask = useCallback(
    (taskId: string) => {
      if (!active) return
      setChecklists((prev) =>
        prev.map((c) =>
          c.id === active.id
            ? {
                ...c,
                tasks: c.tasks.map((t) =>
                  t.id === taskId ? { ...t, done: !t.done } : t,
                ),
              }
            : c,
        ),
      )
    },
    [active],
  )

  const deleteTask = useCallback(
    (taskId: string) => {
      if (!active) return
      setChecklists((prev) =>
        prev.map((c) =>
          c.id === active.id
            ? { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) }
            : c,
        ),
      )
    },
    [active],
  )

  const setPriority = useCallback(
    (taskId: string, priority: Priority) => {
      if (!active) return
      setChecklists((prev) =>
        prev.map((c) =>
          c.id === active.id
            ? {
                ...c,
                tasks: c.tasks.map((t) =>
                  t.id === taskId ? { ...t, priority } : t,
                ),
              }
            : c,
        ),
      )
    },
    [active],
  )

  return {
    checklists,
    active,
    activeId,
    setActiveId,
    filter,
    setFilter,
    filteredTasks,
    metrics,
    addChecklist,
    renameChecklist,
    deleteChecklist,
    addTask,
    toggleTask,
    deleteTask,
    setPriority,
  }
}
