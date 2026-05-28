import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Check, 
  ArrowRight, 
  ArrowLeft as ArrowLeftIcon, 
  User, 
  FolderGit, 
  Clock, 
  Briefcase,
  Play,
  Zap,
  Info
} from 'lucide-react';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Drawer } from '../../../components/common/Drawer';
import { apiService } from '../../../services/api';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { useTimerStore } from '../../../store/timerStore';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const { currency } = usePreferencesStore();
  const { startTimer, isRunning } = useTimerStore();

  const loadProject = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await apiService.getProjectById(id);
      setProject(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  // Transition task card status
  const handleMoveTask = async (taskId: string, nextStatus: 'todo' | 'in-progress' | 'completed') => {
    if (!project) return;
    
    const updatedTasks = project.tasks.map((t: any) => 
      t.id === taskId ? { ...t, status: nextStatus } : t
    );

    try {
      const updatedProj = await apiService.updateProjectTasks(project.id, updatedTasks);
      setProject(updatedProj);
    } catch (e) {
      console.error(e);
    }
  };

  // Add Task card to board
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !project) return;

    const newTask = {
      id: `t-${Date.now()}`,
      title: newTaskTitle.trim(),
      status: 'todo' as const,
      assignee: newTaskAssignee.trim() || "Unassigned"
    };

    const updatedTasks = [...project.tasks, newTask];

    try {
      const updatedProj = await apiService.updateProjectTasks(project.id, updatedTasks);
      setProject(updatedProj);
      setNewTaskTitle("");
      setNewTaskAssignee("");
      setTaskDrawerOpen(false);
      alert("New task added to To-Do column!");
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartTracker = () => {
    if (!project) return;
    if (isRunning) {
      alert("A timer is already running in the background! Stop it first in the top navigation bar.");
      return;
    }
    // Start background timer
    startTimer(project.id, project.name, "General sprint tasks");
    alert(`Active timer started mapped to: ${project.name}. Check Navbar!`);
  };

  if (loading || !project) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-3 gap-6">
          <div className="h-[400px] bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-[400px] bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-[400px] bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  // Group tasks by status
  const todoTasks = project.tasks.filter((t: any) => t.status === 'todo');
  const inProgressTasks = project.tasks.filter((t: any) => t.status === 'in-progress');
  const completedTasks = project.tasks.filter((t: any) => t.status === 'completed');

  return (
    <div className="space-y-6 select-none animate-fade-in pb-12">
      
      {/* Back button */}
      <Link 
        to="/dashboard/projects" 
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors select-none active:scale-95 shrink-0"
      >
        <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
        Back to Projects
      </Link>

      {/* Project KPI & Progress Summary Card */}
      <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-premium flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative select-none">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 select-none">
            <h2 className="text-xl font-extrabold text-foreground tracking-tight leading-tight">{project.name}</h2>
            <StatusBadge status={project.status} />
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-semibold">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {project.clientName}
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 max-w-md select-none">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-bold mb-1.5">
              <span>Task Milestones</span>
              <span className="text-foreground">{project.progress}% completed</span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Start tracker & Quick action */}
        <div className="flex items-center gap-3 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6 select-none border-border shrink-0">
          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Project Budget</span>
            <span className="block text-base font-extrabold text-foreground font-mono mt-0.5">{formatCurrency(project.budget, currency)}</span>
            <span className="block text-[9px] text-muted-foreground font-semibold mt-1">Due: {formatDate(project.dueDate)}</span>
          </div>
          
          <button
            onClick={handleStartTracker}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-xs font-extrabold hover:bg-primary/95 transition-all select-none shadow-md shadow-indigo-500/5 active:scale-95 ml-4 shrink-0"
          >
            <Play className="w-3.5 h-3.5 shrink-0 fill-white" />
            Track Time
          </button>
        </div>
      </div>

      {/* INTERACTIVE KANBAN BOARD */}
      <div className="space-y-3.5 select-none">
        
        <div className="flex items-center justify-between border-b pb-3 shrink-0">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Milestone Kanban Board</span>
          <button
            onClick={() => setTaskDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 border rounded bg-slate-50 dark:bg-slate-800 text-[10px] font-bold hover:bg-muted text-primary select-none active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            Add Task
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none items-start">
          
          {/* COLUMN 1: TO DO */}
          <div className="border rounded-xl bg-slate-50/50 dark:bg-[#0b101c]/30 p-4 space-y-4 select-none min-h-[380px]">
            <div className="flex items-center justify-between border-b pb-2 shrink-0">
              <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">To Do ({todoTasks.length})</span>
              <span className="w-2 h-2 rounded-full bg-slate-400" />
            </div>
            
            <div className="space-y-3 select-none">
              {todoTasks.map((t: any) => (
                <div key={t.id} className="p-3.5 border rounded-lg bg-card text-card-foreground shadow-sm flex flex-col justify-between gap-3 group relative select-none hover:-translate-y-0.5 transition-transform duration-200">
                  <span className="text-xs font-semibold text-foreground/90">{t.title}</span>
                  <div className="flex items-center justify-between mt-1 select-none">
                    <span className="text-[9px] text-muted-foreground font-semibold flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      {t.assignee}
                    </span>
                    <button 
                      onClick={() => handleMoveTask(t.id, 'in-progress')}
                      className="p-1 rounded border hover:bg-muted text-indigo-500 active:scale-75 transition-all select-none"
                      title="Move to In Progress"
                    >
                      <ArrowRight className="w-3 h-3 shrink-0" />
                    </button>
                  </div>
                </div>
              ))}
              
              {todoTasks.length === 0 && (
                <div className="py-12 text-center text-xs text-muted-foreground select-none">To-Do list cleared!</div>
              )}
            </div>
          </div>

          {/* COLUMN 2: IN PROGRESS */}
          <div className="border rounded-xl bg-slate-50/50 dark:bg-[#0b101c]/30 p-4 space-y-4 select-none min-h-[380px]">
            <div className="flex items-center justify-between border-b pb-2 shrink-0">
              <span className="text-[11px] font-extrabold text-indigo-500 uppercase tracking-wider">In Progress ({inProgressTasks.length})</span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            </div>

            <div className="space-y-3 select-none">
              {inProgressTasks.map((t: any) => (
                <div key={t.id} className="p-3.5 border rounded-lg bg-card text-card-foreground shadow-sm flex flex-col justify-between gap-3 group relative select-none hover:-translate-y-0.5 transition-transform duration-200">
                  <span className="text-xs font-semibold text-foreground/90">{t.title}</span>
                  <div className="flex items-center justify-between mt-1 select-none">
                    <button 
                      onClick={() => handleMoveTask(t.id, 'todo')}
                      className="p-1 rounded border hover:bg-muted text-slate-400 active:scale-75 transition-all select-none"
                      title="Move back to To Do"
                    >
                      <ArrowLeftIcon className="w-3 h-3 shrink-0" />
                    </button>
                    <span className="text-[9px] text-muted-foreground font-semibold flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      {t.assignee}
                    </span>
                    <button 
                      onClick={() => handleMoveTask(t.id, 'completed')}
                      className="p-1 rounded border hover:bg-muted text-emerald-500 active:scale-75 transition-all select-none"
                      title="Move to Completed"
                    >
                      <Check className="w-3 h-3 shrink-0" />
                    </button>
                  </div>
                </div>
              ))}

              {inProgressTasks.length === 0 && (
                <div className="py-12 text-center text-xs text-muted-foreground select-none">No active task items.</div>
              )}
            </div>
          </div>

          {/* COLUMN 3: COMPLETED */}
          <div className="border rounded-xl bg-slate-50/50 dark:bg-[#0b101c]/30 p-4 space-y-4 select-none min-h-[380px]">
            <div className="flex items-center justify-between border-b pb-2 shrink-0">
              <span className="text-[11px] font-extrabold text-emerald-500 uppercase tracking-wider">Completed ({completedTasks.length})</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            <div className="space-y-3 select-none">
              {completedTasks.map((t: any) => (
                <div key={t.id} className="p-3.5 border rounded-lg bg-card text-card-foreground shadow-sm flex flex-col justify-between gap-3 group relative select-none opacity-80 hover:opacity-100 transition-opacity">
                  <span className="text-xs font-semibold text-foreground/90 line-through text-slate-400">{t.title}</span>
                  <div className="flex items-center justify-between mt-1 select-none">
                    <button 
                      onClick={() => handleMoveTask(t.id, 'in-progress')}
                      className="p-1 rounded border hover:bg-muted text-slate-400 active:scale-75 transition-all select-none"
                      title="Move back to In Progress"
                    >
                      <ArrowLeftIcon className="w-3 h-3 shrink-0" />
                    </button>
                    <span className="text-[9px] text-muted-foreground font-semibold flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      {t.assignee}
                    </span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-extrabold select-none uppercase tracking-wider">Done</span>
                  </div>
                </div>
              ))}

              {completedTasks.length === 0 && (
                <div className="py-12 text-center text-xs text-muted-foreground select-none">Start settling tasks!</div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 4. MOCK TIMELOGS AUDIT GRID (Active timer logs show up here!) */}
      <div className="border rounded-xl bg-card p-5 shadow-premium space-y-4 select-none">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 select-none">
            <Clock className="w-4 h-4 text-indigo-500" />
            Project Time Entry Settlements
          </h3>
          <p className="text-xs text-muted-foreground">Detailed logs of billable and non-billable tracking sessions. Starts background timers to populate.</p>
        </div>

        <div className="divide-y divide-border select-none text-xs font-semibold">
          {project.timeLogs.map((log: any, idx: number) => (
            <div key={idx} className="py-3.5 flex items-center justify-between gap-4 select-none hover:bg-slate-50/20 dark:hover:bg-slate-800/10 px-2 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 animate-pulse" />
                <div>
                  <span className="block text-xs font-bold text-foreground">{log.taskName}</span>
                  <span className="block text-[9px] text-slate-400 font-semibold">{formatDate(log.date)}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="block text-xs font-bold text-foreground font-mono">{log.hours} Hours</span>
                <span className="block text-[9px] text-slate-500 uppercase tracking-wide font-extrabold mt-0.5">
                  Billed: {formatCurrency(log.hours * log.billingRate, currency)} (@{log.billingRate}/hr)
                </span>
              </div>
            </div>
          ))}

          {project.timeLogs.length === 0 && (
            <div className="py-8 text-center text-muted-foreground select-none font-medium">No hours logged yet. Try starting the tracker above!</div>
          )}
        </div>
      </div>

      {/* 5. ADD TASK DRAWER */}
      <Drawer
        isOpen={taskDrawerOpen}
        onClose={() => setTaskDrawerOpen(false)}
        title="Add Task to Board"
        size="sm"
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs font-semibold select-none pb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-muted-foreground font-bold tracking-wide uppercase">Task Description Title</label>
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g. Implement stripe webhook checkout..."
              className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-muted-foreground font-bold tracking-wide uppercase">Task Assignee</label>
            <input
              type="text"
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value)}
              placeholder="e.g. Alex Rivera..."
              className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70"
            />
          </div>

          <div className="flex items-center gap-3 justify-end pt-4 border-t select-none shrink-0 mt-4">
            <button
              type="button"
              onClick={() => setTaskDrawerOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-muted text-foreground transition-all select-none active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/95 transition-all select-none active:scale-95"
            >
              Add Task
            </button>
          </div>
        </form>
      </Drawer>

    </div>
  );
};
