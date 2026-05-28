import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsUpDown, Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { EmptyState } from './EmptyState';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: keyof T | string;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  actions?: React.ReactNode;
  loading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = "Search records...",
  searchKey,
  emptyTitle = "No records found",
  emptyDescription = "There are no entries recorded in this list.",
  pageSize = 8,
  actions,
  loading = false
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Filter Data
  const filteredData = useMemo(() => {
    if (!search || !searchKey) return data;
    
    return data.filter(item => {
      const val = item[searchKey as string];
      if (val === undefined || val === null) return false;
      return String(val).toLowerCase().includes(search.toLowerCase());
    });
  }, [data, search, searchKey]);

  // Sort Data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal === undefined || bVal === undefined) return 0;
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Reset page when filtering
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronsUpDown className="w-3.5 h-3.5 opacity-40 shrink-0" />;
    }
    return (
      <span className="text-primary font-bold shrink-0 text-xs">
        {sortConfig.direction === 'asc' ? "▲" : "▼"}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-4 select-none">
      {/* Table Toolbar */}
      {(searchKey || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
          {searchKey && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground w-4 h-4 mt-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 text-sm border bg-card/60 rounded-lg outline-none focus:bg-card focus:border-indigo-500/70 dark:focus:border-indigo-500/50 transition-all duration-300 placeholder:text-muted-foreground"
              />
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-2 sm:mt-0 ml-auto sm:ml-0 shrink-0">
            {actions}
          </div>
        </div>
      )}

      {/* Table Body Card */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-premium">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 dark:bg-[#0b101c]/80 border-b select-none">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={cn(
                      "p-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider",
                      col.sortable && col.accessorKey ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 select-none" : "",
                      col.className
                    )}
                    onClick={() => col.sortable && col.accessorKey && requestSort(col.accessorKey as string)}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.header}
                      {col.sortable && col.accessorKey && getSortIcon(col.accessorKey as string)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-border">
              {loading ? (
                // Skeletons
                Array.from({ length: pageSize }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="p-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row, rIdx) => (
                  <tr 
                    key={rIdx} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition-colors duration-200"
                  >
                    {columns.map((col, cIdx) => {
                      const cellContent = col.cell 
                        ? col.cell(row) 
                        : col.accessorKey 
                          ? row[col.accessorKey as string] 
                          : null;
                      
                      return (
                        <td key={cIdx} className={cn("p-4 align-middle text-foreground/90 font-medium", col.className)}>
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-0">
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      className="border-none rounded-none py-12"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {!loading && sortedData.length > pageSize && (
          <div className="flex items-center justify-between p-4 border-t shrink-0 bg-slate-50/50 dark:bg-[#0b101c]/30 text-xs font-semibold text-muted-foreground select-none">
            <span>
              Showing <span className="text-foreground">{(currentPage - 1) * pageSize + 1}</span> to <span className="text-foreground">{Math.min(currentPage * pageSize, sortedData.length)}</span> of <span className="text-foreground">{sortedData.length}</span> entries
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1 rounded border bg-card hover:bg-muted text-foreground transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-foreground font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1 rounded border bg-card hover:bg-muted text-foreground transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
