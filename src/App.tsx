import { Atmosphere } from './components/Atmosphere'
import { ChecklistRail } from './components/ChecklistRail'
import { MetricStrip } from './components/MetricStrip'
import { TaskBoard } from './components/TaskBoard'
import { useChecklists } from './hooks/useChecklists'
import './App.css'

export default function App() {
  const {
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
  } = useChecklists()

  return (
    <div className="app">
      <Atmosphere />

      <header className="masthead">
        <div className="masthead__brand">
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="brand-copy">
            <p className="brand-name">RIG</p>
            <p className="brand-tag">Task &amp; Checklist Systems</p>
          </div>
        </div>
        <p className="masthead__line">
          Glass metric control for production passes — track nodes, clear heat, ship the frame.
        </p>
      </header>

      <MetricStrip metrics={metrics} filter={filter} onFilter={setFilter} />

      <main className="stage">
        <ChecklistRail
          checklists={checklists}
          activeId={activeId}
          onSelect={setActiveId}
          onAdd={addChecklist}
          onDelete={deleteChecklist}
          onRename={renameChecklist}
        />
        {active && (
          <TaskBoard
            listName={active.name}
            tasks={filteredTasks}
            onAdd={addTask}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onPriority={setPriority}
          />
        )}
      </main>

      <footer className="foot">
        <span>RIG // LOCAL PERSISTENCE</span>
        <span>VIEWPORT STABLE</span>
      </footer>
    </div>
  )
}
