import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { apiService } from '../../../services/api';
import { usePreferencesStore } from '../../../store/preferencesStore';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Link } from 'react-router-dom';
import { FolderGit, Plus, Briefcase, Calendar, Users } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currency } = usePreferencesStore();

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await apiService.getProjects();
      setProjects(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fade-in">
      <PageHeader
        title="Projects"
        description="Oversee company contracts, check task list milestones, map developer teams, and track timelines."
        actions={
          <button
            onClick={() => alert("Creating a new project plan...")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/95 transition-all select-none active:scale-95 shadow-md shadow-indigo-500/5"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        }
      />

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 select-none">
        {projects.map((proj) => (
          <div 
            key={proj.id} 
            className="p-6 border rounded-2xl bg-card text-card-foreground shadow-premium flex flex-col justify-between gap-5 select-none hover:-translate-y-0.5 transition-transform group relative overflow-hidden"
          >
            {/* Ambient indicator */}
            <div className="absolute top-0 left-0 h-1 bg-indigo-500 w-full opacity-60 shrink-0" />
            
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <Link 
                  to={`/dashboard/projects/${proj.id}`} 
                  className="block text-sm font-bold text-foreground hover:underline hover:text-primary transition-colors"
                >
                  {proj.name}
                </Link>
                <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 mt-1 font-semibold">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {proj.clientName}
                </span>
              </div>
              <StatusBadge status={proj.status} />
            </div>

            {/* Task Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground font-bold mb-1.5">
                <span>Milestone Progress</span>
                <span className="text-foreground">{proj.progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500" 
                  style={{ width: `${proj.progress}%` }}
                />
              </div>
            </div>

            {/* Budget & Team ring */}
            <div className="flex items-center justify-between select-none">
              <div>
                <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Project Scope</span>
                <span className="block text-xs font-bold text-foreground font-mono mt-0.5">
                  {formatCurrency(proj.budget, currency)}
                </span>
              </div>

              {/* Overlapping Avatars Group */}
              <div className="flex items-center -space-x-2 overflow-hidden shrink-0 select-none">
                {proj.teamMembers.map((av: string, aIdx: number) => (
                  <img
                    key={aIdx}
                    src={av}
                    alt="Team Avatar"
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-card object-cover shrink-0 select-none"
                  />
                ))}
              </div>
            </div>

            {/* Footer triggers */}
            <div className="border-t pt-4 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                Due: {formatDate(proj.dueDate)}
              </span>
              <Link 
                to={`/dashboard/projects/${proj.id}`} 
                className="text-primary hover:underline hover:underline-offset-2 flex items-center gap-1 active:scale-95"
              >
                Open Kanban
              </Link>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
