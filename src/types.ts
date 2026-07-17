export type Priority = 'low' | 'mid' | 'high'

export interface Task {
  id: string
  title: string
  done: boolean
  priority: Priority
  createdAt: number
}

export interface Checklist {
  id: string
  name: string
  tasks: Task[]
  createdAt: number
}

export type FilterMode = 'all' | 'active' | 'done'
