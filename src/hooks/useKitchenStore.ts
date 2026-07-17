import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  AuditAnswer,
  AuditAssignment,
  AuditStatus,
  AuditTemplate,
  FollowUp,
  FollowUpStatus,
  Kitchen,
  Question,
  QuestionType,
  Severity,
} from '../types'

const STORAGE_KEY = 'rig-kitchen-store-v1'

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function daysFromNow(days: number): number {
  return Date.now() + days * 86400000
}

function seed(): {
  kitchens: Kitchen[]
  templates: AuditTemplate[]
  assignments: AuditAssignment[]
  followUps: FollowUp[]
} {
  const kitchens: Kitchen[] = [
    { id: 'k1', name: 'Line A — Hot', site: 'Downtown Hub' },
    { id: 'k2', name: 'Prep Cold Room', site: 'Downtown Hub' },
    { id: 'k3', name: 'Pastry Bay', site: 'West Kitchen' },
    { id: 'k4', name: 'Dish Pit', site: 'West Kitchen' },
  ]

  const foodSafetyQs: Question[] = [
    {
      id: 'q1',
      prompt: 'Hand wash station stocked and accessible?',
      type: 'pass_fail',
      required: true,
    },
    {
      id: 'q2',
      prompt: 'Cold holding temperature (°C)',
      type: 'temp',
      required: true,
      help: 'Target ≤ 5°C',
    },
    {
      id: 'q3',
      prompt: 'Hot holding temperature (°C)',
      type: 'temp',
      required: true,
      help: 'Target ≥ 63°C',
    },
    {
      id: 'q4',
      prompt: 'Allergen board matches current menu?',
      type: 'yes_no',
      required: true,
    },
    {
      id: 'q5',
      prompt: 'Sanitation of cutting boards',
      type: 'score',
      required: true,
    },
    {
      id: 'q6',
      prompt: 'Notes / observations',
      type: 'text',
      required: false,
    },
  ]

  const openingQs: Question[] = [
    {
      id: 'o1',
      prompt: 'Fridges sealed and running?',
      type: 'checkbox',
      required: true,
    },
    {
      id: 'o2',
      prompt: 'Floor dry and clear of hazards?',
      type: 'pass_fail',
      required: true,
    },
    {
      id: 'o3',
      prompt: 'First-aid kit complete?',
      type: 'yes_no',
      required: true,
    },
    {
      id: 'o4',
      prompt: 'Opening notes',
      type: 'text',
      required: false,
    },
  ]

  const templates: AuditTemplate[] = [
    {
      id: 't1',
      name: 'Food Safety Sweep',
      category: 'Safety',
      questions: foodSafetyQs,
      updatedAt: Date.now() - 86400000,
    },
    {
      id: 't2',
      name: 'Opening Checklist',
      category: 'Ops',
      questions: openingQs,
      updatedAt: Date.now() - 172800000,
    },
  ]

  const assignments: AuditAssignment[] = [
    {
      id: 'a1',
      templateId: 't1',
      kitchenId: 'k1',
      assignee: 'Jordan Lee',
      dueAt: daysFromNow(1),
      status: 'assigned',
      answers: [],
      scorePct: null,
      createdAt: Date.now() - 3600000,
      submittedAt: null,
    },
    {
      id: 'a2',
      templateId: 't1',
      kitchenId: 'k2',
      assignee: 'Sam Ortiz',
      dueAt: daysFromNow(-1),
      status: 'in_progress',
      answers: [
        { questionId: 'q1', value: 'fail' },
        { questionId: 'q2', value: 7 },
      ],
      scorePct: null,
      createdAt: Date.now() - 86400000 * 2,
      submittedAt: null,
    },
    {
      id: 'a3',
      templateId: 't2',
      kitchenId: 'k3',
      assignee: 'Alex Kim',
      dueAt: daysFromNow(-2),
      status: 'submitted',
      answers: [
        { questionId: 'o1', value: true },
        { questionId: 'o2', value: 'pass' },
        { questionId: 'o3', value: true },
        { questionId: 'o4', value: 'Minor spill cleaned before service.' },
      ],
      scorePct: 100,
      createdAt: Date.now() - 86400000 * 3,
      submittedAt: Date.now() - 86400000,
    },
    {
      id: 'a4',
      templateId: 't1',
      kitchenId: 'k4',
      assignee: 'Morgan Blake',
      dueAt: daysFromNow(3),
      status: 'assigned',
      answers: [],
      scorePct: null,
      createdAt: Date.now() - 7200000,
      submittedAt: null,
    },
  ]

  const followUps: FollowUp[] = [
    {
      id: 'f1',
      auditId: 'a2',
      kitchenId: 'k2',
      questionId: 'q1',
      title: 'Restock hand wash soap & towels',
      severity: 'high',
      status: 'open',
      owner: 'Sam Ortiz',
      dueAt: daysFromNow(0),
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'f2',
      auditId: 'a2',
      kitchenId: 'k2',
      questionId: 'q2',
      title: 'Cold room reading above 5°C — service fridge',
      severity: 'high',
      status: 'in_progress',
      owner: 'Facilities',
      dueAt: daysFromNow(1),
      createdAt: Date.now() - 80000000,
    },
    {
      id: 'f3',
      auditId: 'a3',
      kitchenId: 'k3',
      questionId: 'o2',
      title: 'Add non-slip mats near pastry sink',
      severity: 'mid',
      status: 'done',
      owner: 'Alex Kim',
      dueAt: daysFromNow(-1),
      createdAt: Date.now() - 86400000 * 2,
    },
  ]

  return { kitchens, templates, assignments, followUps }
}

interface Store {
  kitchens: Kitchen[]
  templates: AuditTemplate[]
  assignments: AuditAssignment[]
  followUps: FollowUp[]
}

function load(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seed()
    const parsed = JSON.parse(raw) as Store
    if (!parsed.templates?.length) return seed()
    return parsed
  } catch {
    return seed()
  }
}

function isFailingAnswer(type: QuestionType, value: AuditAnswer['value']): boolean {
  if (value === null || value === undefined || value === '') return false
  if (type === 'pass_fail') return value === 'fail'
  if (type === 'yes_no') return value === false || value === 'no'
  if (type === 'checkbox') return value === false
  if (type === 'score') return typeof value === 'number' && value <= 2
  if (type === 'temp') {
    // Heuristic: treat mid-band (5–63) as fail for holding checks when clearly wrong
    // Callers should also create follow-ups manually; we flag obvious cold>5 as fail in seed context
    return typeof value === 'number' && value > 5 && value < 60
  }
  return false
}

function computeScore(
  template: AuditTemplate,
  answers: AuditAnswer[],
): number {
  const scored = template.questions.filter((q) => q.type !== 'text')
  if (scored.length === 0) return 100
  let ok = 0
  for (const q of scored) {
    const ans = answers.find((a) => a.questionId === q.id)
    if (!ans || ans.value === null || ans.value === '') continue
    if (!isFailingAnswer(q.type, ans.value)) ok += 1
  }
  return Math.round((ok / scored.length) * 100)
}

export function useKitchenStore() {
  const [store, setStore] = useState<Store>(() => load())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  }, [store])

  const metrics = useMemo(() => {
    const openAssign = store.assignments.filter(
      (a) => a.status === 'assigned' || a.status === 'in_progress',
    ).length
    const overdue = store.assignments.filter(
      (a) =>
        (a.status === 'assigned' || a.status === 'in_progress') &&
        a.dueAt < Date.now(),
    ).length
    const submitted = store.assignments.filter((a) => a.status === 'submitted' || a.status === 'closed')
    const avgScore =
      submitted.length === 0
        ? 0
        : Math.round(
            submitted.reduce((s, a) => s + (a.scorePct ?? 0), 0) / submitted.length,
          )
    const openFollow = store.followUps.filter((f) => f.status !== 'done').length
    const dueFollow = store.followUps.filter(
      (f) => f.status !== 'done' && f.dueAt < Date.now() + 86400000,
    ).length
    const highHeat = store.followUps.filter(
      (f) => f.status !== 'done' && f.severity === 'high',
    ).length
    return {
      openAssign,
      overdue,
      avgScore,
      openFollow,
      dueFollow,
      highHeat,
      templates: store.templates.length,
      kitchens: store.kitchens.length,
      submitted: submitted.length,
    }
  }, [store])

  const kitchenStats = useMemo(() => {
    return store.kitchens.map((k) => {
      const assigns = store.assignments.filter((a) => a.kitchenId === k.id)
      const open = assigns.filter(
        (a) => a.status === 'assigned' || a.status === 'in_progress',
      ).length
      const follows = store.followUps.filter(
        (f) => f.kitchenId === k.id && f.status !== 'done',
      ).length
      const done = assigns.filter((a) => a.scorePct !== null)
      const avg =
        done.length === 0
          ? null
          : Math.round(done.reduce((s, a) => s + (a.scorePct ?? 0), 0) / done.length)
      return { ...k, open, follows, avg }
    })
  }, [store])

  // —— Templates ——
  const addTemplate = useCallback((name: string, category: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const t: AuditTemplate = {
      id: uid(),
      name: trimmed,
      category: category.trim() || 'General',
      questions: [
        {
          id: uid(),
          prompt: 'New check item',
          type: 'pass_fail',
          required: true,
        },
      ],
      updatedAt: Date.now(),
    }
    setStore((s) => ({ ...s, templates: [...s.templates, t] }))
    return t.id
  }, [])

  const updateTemplateMeta = useCallback(
    (id: string, patch: Partial<Pick<AuditTemplate, 'name' | 'category'>>) => {
      setStore((s) => ({
        ...s,
        templates: s.templates.map((t) =>
          t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t,
        ),
      }))
    },
    [],
  )

  const deleteTemplate = useCallback((id: string) => {
    setStore((s) => ({
      ...s,
      templates: s.templates.filter((t) => t.id !== id),
    }))
  }, [])

  const addQuestion = useCallback((templateId: string) => {
    setStore((s) => ({
      ...s,
      templates: s.templates.map((t) =>
        t.id === templateId
          ? {
              ...t,
              updatedAt: Date.now(),
              questions: [
                ...t.questions,
                {
                  id: uid(),
                  prompt: 'New question',
                  type: 'pass_fail' as QuestionType,
                  required: true,
                },
              ],
            }
          : t,
      ),
    }))
  }, [])

  const updateQuestion = useCallback(
    (templateId: string, questionId: string, patch: Partial<Question>) => {
      setStore((s) => ({
        ...s,
        templates: s.templates.map((t) =>
          t.id === templateId
            ? {
                ...t,
                updatedAt: Date.now(),
                questions: t.questions.map((q) =>
                  q.id === questionId ? { ...q, ...patch } : q,
                ),
              }
            : t,
        ),
      }))
    },
    [],
  )

  const removeQuestion = useCallback((templateId: string, questionId: string) => {
    setStore((s) => ({
      ...s,
      templates: s.templates.map((t) =>
        t.id === templateId
          ? {
              ...t,
              updatedAt: Date.now(),
              questions: t.questions.filter((q) => q.id !== questionId),
            }
          : t,
      ),
    }))
  }, [])

  const changeQuestionType = useCallback(
    (templateId: string, questionId: string, type: QuestionType) => {
      updateQuestion(templateId, questionId, { type })
    },
    [updateQuestion],
  )

  // —— Assignments ——
  const createAssignment = useCallback(
    (input: {
      templateId: string
      kitchenId: string
      assignee: string
      dueAt: number
    }) => {
      const next: AuditAssignment = {
        id: uid(),
        templateId: input.templateId,
        kitchenId: input.kitchenId,
        assignee: input.assignee.trim() || 'Unassigned',
        dueAt: input.dueAt,
        status: 'assigned',
        answers: [],
        scorePct: null,
        createdAt: Date.now(),
        submittedAt: null,
      }
      setStore((s) => ({ ...s, assignments: [next, ...s.assignments] }))
      return next.id
    },
    [],
  )

  const setAssignmentStatus = useCallback((id: string, status: AuditStatus) => {
    setStore((s) => ({
      ...s,
      assignments: s.assignments.map((a) => (a.id === id ? { ...a, status } : a)),
    }))
  }, [])

  const saveAnswers = useCallback((id: string, answers: AuditAnswer[]) => {
    setStore((s) => ({
      ...s,
      assignments: s.assignments.map((a) =>
        a.id === id
          ? {
              ...a,
              answers,
              status: a.status === 'assigned' ? 'in_progress' : a.status,
            }
          : a,
      ),
    }))
  }, [])

  const submitAudit = useCallback((id: string, answers?: AuditAnswer[]) => {
    setStore((s) => {
      const audit = s.assignments.find((a) => a.id === id)
      const template = s.templates.find((t) => t.id === audit?.templateId)
      if (!audit || !template) return s

      const finalAnswers = answers ?? audit.answers
      const scorePct = computeScore(template, finalAnswers)
      const newFollows: FollowUp[] = []

      for (const q of template.questions) {
        const ans = finalAnswers.find((a) => a.questionId === q.id)
        if (!ans) continue
        if (isFailingAnswer(q.type, ans.value)) {
          const exists = s.followUps.some(
            (f) => f.auditId === id && f.questionId === q.id && f.status !== 'done',
          )
          if (!exists) {
            newFollows.push({
              id: uid(),
              auditId: id,
              kitchenId: audit.kitchenId,
              questionId: q.id,
              title: q.prompt,
              severity: q.type === 'temp' || q.type === 'pass_fail' ? 'high' : 'mid',
              status: 'open',
              owner: audit.assignee,
              dueAt: daysFromNow(2),
              createdAt: Date.now(),
            })
          }
        }
      }

      return {
        ...s,
        assignments: s.assignments.map((a) =>
          a.id === id
            ? {
                ...a,
                answers: finalAnswers,
                status: 'submitted' as AuditStatus,
                scorePct,
                submittedAt: Date.now(),
              }
            : a,
        ),
        followUps: [...newFollows, ...s.followUps],
      }
    })
  }, [])

  // —— Follow-ups ——
  const addFollowUp = useCallback(
    (input: {
      auditId: string
      kitchenId: string
      title: string
      severity: Severity
      owner: string
      dueAt: number
    }) => {
      const f: FollowUp = {
        id: uid(),
        auditId: input.auditId,
        kitchenId: input.kitchenId,
        questionId: '',
        title: input.title.trim(),
        severity: input.severity,
        status: 'open',
        owner: input.owner.trim() || 'Ops',
        dueAt: input.dueAt,
        createdAt: Date.now(),
      }
      if (!f.title) return
      setStore((s) => ({ ...s, followUps: [f, ...s.followUps] }))
    },
    [],
  )

  const setFollowStatus = useCallback((id: string, status: FollowUpStatus) => {
    setStore((s) => ({
      ...s,
      followUps: s.followUps.map((f) => (f.id === id ? { ...f, status } : f)),
    }))
  }, [])

  const resetDemo = useCallback(() => {
    const next = seed()
    setStore(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [])

  return {
    ...store,
    metrics,
    kitchenStats,
    addTemplate,
    updateTemplateMeta,
    deleteTemplate,
    addQuestion,
    updateQuestion,
    removeQuestion,
    changeQuestionType,
    createAssignment,
    setAssignmentStatus,
    saveAnswers,
    submitAudit,
    addFollowUp,
    setFollowStatus,
    resetDemo,
  }
}
