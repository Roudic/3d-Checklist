export type QuestionType =
  | 'yes_no'
  | 'pass_fail'
  | 'score'
  | 'text'
  | 'temp'
  | 'checkbox'

export type AuditStatus = 'assigned' | 'in_progress' | 'submitted' | 'closed'
export type FollowUpStatus = 'open' | 'in_progress' | 'done'
export type Severity = 'low' | 'mid' | 'high'

export interface Question {
  id: string
  prompt: string
  type: QuestionType
  required: boolean
  help?: string
}

export interface AuditTemplate {
  id: string
  name: string
  category: string
  questions: Question[]
  updatedAt: number
}

export interface Kitchen {
  id: string
  name: string
  site: string
}

export interface AuditAnswer {
  questionId: string
  value: string | number | boolean | null
  note?: string
}

export interface AuditAssignment {
  id: string
  templateId: string
  kitchenId: string
  assignee: string
  dueAt: number
  status: AuditStatus
  answers: AuditAnswer[]
  scorePct: number | null
  createdAt: number
  submittedAt: number | null
}

export interface FollowUp {
  id: string
  auditId: string
  kitchenId: string
  questionId: string
  title: string
  severity: Severity
  status: FollowUpStatus
  owner: string
  dueAt: number
  createdAt: number
}

export type AppView =
  | 'dashboard'
  | 'assignments'
  | 'templates'
  | 'followups'
  | 'run'

export const QUESTION_TYPES: { id: QuestionType; label: string; hint: string }[] = [
  { id: 'yes_no', label: 'Yes / No', hint: 'Binary compliance' },
  { id: 'pass_fail', label: 'Pass / Fail / N/A', hint: 'Standard kitchen check' },
  { id: 'score', label: 'Score 1–5', hint: 'Graded observation' },
  { id: 'temp', label: 'Temperature', hint: 'Cold / hot holding °C' },
  { id: 'checkbox', label: 'Checkbox', hint: 'Confirm done' },
  { id: 'text', label: 'Text note', hint: 'Freeform finding' },
]
