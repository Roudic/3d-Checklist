import { useMemo, useState } from 'react'
import { Atmosphere } from './components/Atmosphere'
import { AppShell } from './components/AppShell'
import { AssignmentsView } from './components/AssignmentsView'
import { AuditRunner } from './components/AuditRunner'
import { Dashboard } from './components/Dashboard'
import { FollowUpsView } from './components/FollowUpsView'
import { LoginScreen } from './components/LoginScreen'
import { TemplateBuilder } from './components/TemplateBuilder'
import { useAuth } from './hooks/useAuth'
import { useKitchenStore } from './hooks/useKitchenStore'
import type { AppView } from './types'
import './App.css'

export default function App() {
  const { authed, error, login, logout } = useAuth()
  const store = useKitchenStore()
  const [view, setView] = useState<AppView>('dashboard')
  const [runId, setRunId] = useState<string | null>(null)

  const running = useMemo(() => {
    if (!runId) return null
    const audit = store.assignments.find((a) => a.id === runId)
    if (!audit) return null
    const template = store.templates.find((t) => t.id === audit.templateId)
    const kitchen = store.kitchens.find((k) => k.id === audit.kitchenId)
    if (!template || !kitchen) return null
    return { audit, template, kitchen }
  }, [runId, store.assignments, store.templates, store.kitchens])

  if (!authed) {
    return (
      <div className="app app--login">
        <Atmosphere />
        <LoginScreen error={error} onLogin={login} />
      </div>
    )
  }

  function openRun(id: string) {
    setRunId(id)
    setView('run')
  }

  return (
    <>
      <Atmosphere />
      <AppShell
        view={view}
        onView={(v) => {
          setView(v)
          if (v !== 'run') setRunId(null)
        }}
        onLogout={logout}
      >
        {view === 'dashboard' && (
          <Dashboard
            metrics={store.metrics}
            kitchenStats={store.kitchenStats}
            followUps={store.followUps}
            onOpenFollows={() => setView('followups')}
            onOpenAssignments={() => setView('assignments')}
          />
        )}
        {view === 'assignments' && (
          <AssignmentsView
            assignments={store.assignments}
            templates={store.templates}
            kitchens={store.kitchens}
            onCreate={store.createAssignment}
            onRun={openRun}
          />
        )}
        {view === 'followups' && (
          <FollowUpsView
            followUps={store.followUps}
            kitchens={store.kitchens}
            assignments={store.assignments}
            onStatus={store.setFollowStatus}
            onAdd={store.addFollowUp}
          />
        )}
        {view === 'templates' && (
          <TemplateBuilder
            templates={store.templates}
            onAddTemplate={store.addTemplate}
            onUpdateMeta={store.updateTemplateMeta}
            onDeleteTemplate={store.deleteTemplate}
            onAddQuestion={store.addQuestion}
            onUpdateQuestion={store.updateQuestion}
            onRemoveQuestion={store.removeQuestion}
            onChangeType={store.changeQuestionType}
          />
        )}
        {view === 'run' && running && (
          <AuditRunner
            audit={running.audit}
            template={running.template}
            kitchen={running.kitchen}
            onSave={(answers) => store.saveAnswers(running.audit.id, answers)}
            onSubmit={(answers) => {
              store.submitAudit(running.audit.id, answers)
              setView('followups')
              setRunId(null)
            }}
            onBack={() => {
              setView('assignments')
              setRunId(null)
            }}
          />
        )}
      </AppShell>
    </>
  )
}
