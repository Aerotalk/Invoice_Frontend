import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { Drawer } from '../../../components/common/Drawer';
import { apiService } from '../../../services/api';
import { useTimerStore } from '../../../store/timerStore';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Plus, 
  FolderGit, 
  CheckCircle,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

export const TimeTrackingDashboard: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { currency } = usePreferencesStore();

  // Active Timer Zustand binds
  const { 
    isRunning, seconds, startTimer, pauseTimer, resumeTimer, stopAndLogTimer, 
    taskName, projectId, updateDescription, description, resetTimer, projectName
  } = useTimerStore();

  // Manual Form States
  const [manualProjId, setManualProjId] = useState("");
  const [manualTask, setManualTask] = useState("");
  const [manualHours, setManualHours] = useState("");
  const [manualRate, setManualRate] = useState("100");
  const [manualDesc, setManualDesc] = useState("");
  const [manualSubmitting, setManualSubmitting] = useState(false);

  const loadTimeData = async () => {
    setLoading(true);
    try {
      const [entryList, projList] = await Promise.all([
        apiService.getTimeEntries().catch(() => []),
        apiService.getProjects().catch(() => [])
      ]);
      setEntries(entryList);
      setProjects(projList);
      if (projList.length > 0) {
        setManualProjId(projList[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeData();
  }, []);

  const handleStartTimer = (projId: string, task: string) => {
    if (!projId) {
      toast.error("Please select a project mapping first!");
      return;
    }
    const projName = projects.find(p => p.id === projId)?.name || "";
    startTimer(projId, projName, task || "General contract sprints", 120);
  };

  const handleStopAndLog = async () => {
    const success = await stopAndLogTimer();
    if (success) {
      toast.success("Ticking timer session logged successfully!");
      loadTimeData();
    } else {
      toast.error("Timer session too short (under 5 seconds) to create a record.");
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualProjId || !manualTask.trim() || !manualHours) {
      toast.error("Please complete the required manual entries fields!");
      return;
    }

    const selectedProjName = projects.find(p => p.id === manualProjId)?.name || "";
    const hours = parseFloat(manualHours) || 0;
    const billingRate = parseFloat(manualRate) || 0;

    setManualSubmitting(true);
    try {
      await apiService.createTimeEntry({
        projectId: manualProjId,
        projectName: selectedProjName,
        taskName: manualTask.trim(),
        hours,
        date: new Date().toISOString().split('T')[0],
        isBillable: billingRate > 0,
        billingRate,
        description: manualDesc || "Manually logged spreadsheet entry."
      });
      toast.success("Manual time entry logged!");
      setDrawerOpen(false);
      setManualTask("");
      setManualHours("");
      setManualDesc("");
      loadTimeData();
    } catch (err) {
      console.error(err);
    } finally {
      setManualSubmitting(false);
    }
  };

  // Recharts Monthly Stats
  const weeklyData = [
    { name: 'Mon', billable: 6.5, nonBillable: 1.5 },
    { name: 'Tue', billable: 7.2, nonBillable: 1.0 },
    { name: 'Wed', billable: 8.0, nonBillable: 0.5 },
    { name: 'Thu', billable: 5.5, nonBillable: 2.0 },
    { name: 'Fri', billable: 6.8, nonBillable: 1.2 },
    { name: 'Sat', billable: 2.0, nonBillable: 0.0 },
    { name: 'Sun', billable: 0.0, nonBillable: 0.0 }
  ];

  const columns: ColumnDef<any>[] = [
    {
      header: "Task & Project Mappings",
      accessorKey: "taskName",
      cell: (row) => (
        <div className="flex items-center gap-2.5 select-none">
          <div className="p-2 rounded bg-indigo-500/10 text-indigo-500 shrink-0">
            <Clock className="w-3.5 h-3.5 shrink-0" />
          </div>
          <div>
            <span className="block text-xs font-bold text-foreground">{row.taskName}</span>
            <span className="block text-[9px] text-slate-400 font-semibold uppercase tracking-wider">{row.projectName}</span>
          </div>
        </div>
      )
    },
    {
      header: "Settled Date",
      accessorKey: "date",
      cell: (row) => <span>{formatDate(row.date)}</span>
    },
    {
      header: "Tracked Hours",
      accessorKey: "hours",
      cell: (row) => <span className="font-bold">{row.hours} Hours</span>
    },
    {
      header: "Billable Scope",
      accessorKey: "isBillable",
      cell: (row) => (
        <span className={cn(
          "inline-flex items-center gap-1 text-[10px] font-bold select-none px-2 py-0.5 border rounded-full",
          row.isBillable 
            ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/15" 
            : "text-slate-400 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700/60"
        )}>
          {row.isBillable ? `Yes (@${row.billingRate}/hr)` : "No"}
        </span>
      )
    },
    {
      header: "Subtotal Value",
      cell: (row) => (
        <span className="font-bold text-foreground select-none">
          {formatCurrency(row.hours * row.billingRate, currency)}
        </span>
      )
    }
  ];

  // Helper formatting for digital ticker clock
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalBillableHours = React.useMemo(() => {
    return entries.filter(e => e.isBillable).reduce((sum, e) => sum + e.hours, 0);
  }, [entries]);

  return (
    <div className="space-y-6 select-none animate-fade-in">
      <PageHeader
        title="Time Tracking"
        description="Monitor billable client timelines, run high-resolution ticking timers, or log spreadsheet schedules."
        actions={
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/95 transition-all select-none active:scale-95 shadow-md shadow-indigo-500/5"
          >
            <Plus className="w-4 h-4" />
            Manual Log
          </button>
        }
      />

      {/* Ticking Timer Interface Component */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
        
        {/* Ticker Box */}
        <div className="border rounded-xl bg-card p-5 shadow-premium lg:col-span-2 flex flex-col justify-between h-[300px]">
          <div>
            <h3 className="text-sm font-bold text-foreground">Active Tracked Sprint</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Run ticking session clocks mapped directly to projects pipelines.</p>
          </div>

          {/* Core active parameters inputs */}
          {!isRunning && seconds === 0 ? (
            // Idle Settings
            <div className="grid grid-cols-2 gap-4 select-none mt-4">
              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1 select-none">
                <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">Map Project</label>
                <select
                  id="timer-project-id"
                  className="px-3 py-2 border rounded-lg bg-slate-50/50 dark:bg-[#0b101c]/40 outline-none text-xs font-semibold"
                >
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1 select-none">
                <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">Sprint Task</label>
                <input
                  id="timer-task-name"
                  type="text"
                  placeholder="e.g. Design wireframes..."
                  className="px-3 py-2 border rounded-lg bg-slate-50/50 dark:bg-[#0b101c]/40 outline-none text-xs font-semibold focus:border-indigo-500/70"
                />
              </div>
            </div>
          ) : (
            // Running / Paused Display
            <div className="flex flex-col gap-2 border bg-slate-50/50 dark:bg-[#0b101c]/15 p-4 rounded-xl text-center select-none animate-fade-in mt-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">{projectName}</span>
              <span className="text-xs font-semibold text-foreground/80 block italic">"{taskName || "Sprint Sprints"}"</span>
            </div>
          )}

          {/* Controls bar */}
          <div className="flex items-center justify-between border-t pt-4 mt-4 select-none shrink-0">
            {/* Clock display */}
            <div className="flex items-center gap-2">
              <Clock className={cn("w-5 h-5 shrink-0", isRunning ? "text-rose-500 animate-spin-slow" : "text-slate-400")} />
              <span className="text-xl font-bold tracking-wider text-foreground">{formatTime(seconds)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 select-none">
              {!isRunning && seconds === 0 ? (
                <button
                  onClick={() => {
                    const selectEl = document.getElementById("timer-project-id") as HTMLSelectElement;
                    const inputEl = document.getElementById("timer-task-name") as HTMLInputElement;
                    handleStartTimer(selectEl?.value, inputEl?.value);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-extrabold hover:bg-primary/95 transition-all shadow-md active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Start Timer
                </button>
              ) : (
                <>
                  {isRunning ? (
                    <button
                      onClick={pauseTimer}
                      className="p-2 border rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground active:scale-90 transition-all shrink-0"
                      title="Pause clock"
                    >
                      <Pause className="w-4 h-4 fill-slate-400 text-slate-400" />
                    </button>
                  ) : (
                    <button
                      onClick={resumeTimer}
                      className="p-2 border rounded-lg hover:bg-muted text-indigo-500 active:scale-90 transition-all shrink-0"
                      title="Resume ticking"
                    >
                      <Play className="w-4 h-4 fill-indigo-500 text-indigo-500" />
                    </button>
                  )}
                  
                  <button
                    onClick={handleStopAndLog}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-500 text-white text-xs font-extrabold hover:bg-rose-600 transition-all active:scale-95 shadow-md shadow-rose-500/10"
                  >
                    <Square className="w-4 h-4 fill-white text-white shrink-0" />
                    Stop & Log hours
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recharts Analytics chart */}
        <div className="border rounded-xl bg-card p-5 shadow-premium flex flex-col justify-between h-[300px]">
          <div>
            <h3 className="text-sm font-bold text-foreground">Weekly Overview</h3>
            <p className="text-xs text-muted-foreground">Billable timelines metrics</p>
          </div>
          
          <div className="h-[120px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--border)', 
                    borderRadius: '8px',
                    fontSize: '9px'
                  }} 
                />
                <Area type="monotone" dataKey="billable" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorBill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t pt-3 mt-1 flex items-center justify-between text-[11px] font-semibold text-muted-foreground select-none shrink-0">
            <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" />{totalBillableHours} Hours logged</span>
            <span>Est Value: {formatCurrency(totalBillableHours * 100, currency)}</span>
          </div>
        </div>

      </div>

      {/* Log list Data Table */}
      <DataTable
        columns={columns}
        data={entries}
        searchKey="taskName"
        searchPlaceholder="Filter time records by task description..."
        emptyTitle="No time logs captured"
        emptyDescription="Start the background ticking clock or log hours manually above."
        loading={loading}
      />

      {/* MANUAL LOG DRAWER FORM */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Log Time manually"
        size="sm"
      >
        <form onSubmit={handleManualSubmit} className="space-y-4 text-xs font-semibold select-none pb-6">
          {/* Project Mappings */}
          <div className="flex flex-col gap-1.5 select-none">
            <label className="text-muted-foreground font-bold tracking-wide uppercase">Select Project Mapping</label>
            <select
              value={manualProjId}
              onChange={(e) => setManualProjId(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70"
            >
              {projects.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Task */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted-foreground font-bold tracking-wide uppercase">Task / Sprint Description</label>
            <input
              type="text"
              required
              value={manualTask}
              onChange={(e) => setManualTask(e.target.value)}
              placeholder="e.g. Auditing stripe checkout webhook logs..."
              className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 select-none">
            {/* Hours */}
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1 select-none">
              <label className="text-muted-foreground font-bold tracking-wide uppercase">Hours Spent</label>
              <input
                type="number"
                required
                min={0.1}
                step={0.1}
                value={manualHours}
                onChange={(e) => setManualHours(e.target.value)}
                placeholder="e.g. 4.5"
                className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70 text-center"
              />
            </div>
            
            {/* Billing Rate */}
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1 select-none">
              <label className="text-muted-foreground font-bold tracking-wide uppercase">Billing Rate (/hr)</label>
              <input
                type="number"
                min={0}
                value={manualRate}
                onChange={(e) => setManualRate(e.target.value)}
                placeholder="100"
                className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70 text-center"
              />
            </div>
          </div>

          {/* Optional notes description */}
          <div className="flex flex-col gap-1.5 select-none">
            <label className="text-muted-foreground font-bold tracking-wide uppercase">Session Notes (Optional)</label>
            <textarea
              placeholder="Write detailed summaries of sprint deliverables logged..."
              rows={3}
              value={manualDesc}
              onChange={(e) => setManualDesc(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-card outline-none text-xs font-medium focus:border-indigo-500/70 resize-none leading-relaxed"
            />
          </div>

          {/* Drawer Actions */}
          <div className="flex items-center gap-3 justify-end pt-4 border-t mt-4 shrink-0 select-none">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-muted text-foreground transition-all select-none active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={manualSubmitting}
              className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/95 transition-all select-none active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
            >
              {manualSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  Submitting...
                </>
              ) : (
                "Submit entry"
              )}
            </button>
          </div>

        </form>
      </Drawer>

    </div>
  );
};
