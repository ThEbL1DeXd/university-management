'use client';

import { ReactNode, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  cell?: (value: any, item: T) => ReactNode;
  sortable?: boolean; // Enable sorting for this column
  sortKey?: string; // Custom key for nested object sorting (e.g., 'department.name')
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  itemsPerPage?: number;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  actions?: (item: T) => ReactNode;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  key: string | null;
  direction: SortDirection;
}

export default function DataTable<T extends { _id?: string }>({
  data,
  columns,
  itemsPerPage = 10,
  onEdit,
  onDelete,
  actions,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });

  // Get nested value from object using dot notation (e.g., 'department.name')
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  // Sort data based on current sort configuration
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      let aValue = getNestedValue(a, sortConfig.key!);
      let bValue = getNestedValue(b, sortConfig.key!);

      // Handle null/undefined values
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      // Convert to lowercase for string comparison
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      // Compare values
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  // Handle column sort
  const handleSort = (column: Column<T>, index: number) => {
    if (column.sortable === false) return;
    
    // Determine the sort key
    let sortKey: string;
    if (column.sortKey) {
      sortKey = column.sortKey;
    } else if (typeof column.accessor === 'string') {
      sortKey = column.accessor as string;
    } else {
      return; // Can't sort function accessors without sortKey
    }

    setSortConfig(prev => {
      if (prev.key === sortKey) {
        // Cycle through: asc -> desc -> null
        if (prev.direction === 'asc') return { key: sortKey, direction: 'desc' };
        if (prev.direction === 'desc') return { key: null, direction: null };
      }
      return { key: sortKey, direction: 'asc' };
    });
    
    // Reset to first page when sorting
    setCurrentPage(1);
  };

  // Get sort icon for column
  const getSortIcon = (column: Column<T>) => {
    if (column.sortable === false) return null;
    
    let sortKey: string | null = null;
    if (column.sortKey) {
      sortKey = column.sortKey;
    } else if (typeof column.accessor === 'string') {
      sortKey = column.accessor as string;
    }
    
    if (!sortKey) return null;

    if (sortConfig.key === sortKey) {
      if (sortConfig.direction === 'asc') {
        return <ArrowUp size={14} className="text-blue-500" />;
      }
      if (sortConfig.direction === 'desc') {
        return <ArrowDown size={14} className="text-blue-500" />;
      }
    }
    return <ArrowUpDown size={14} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />;
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getCellValue = (item: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item);
    }
    return item[column.accessor];
  };

  return (
    <div className="space-y-4">
      {/* Modern table container with glassmorphism */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gradient-to-r from-gray-50/80 to-blue-50/30 dark:from-gray-900/80 dark:to-blue-950/30">
              <tr>
                {columns.map((column, index) => {
                  const isSortable = column.sortable !== false && (column.sortKey || typeof column.accessor === 'string');
                  return (
                    <th
                      key={index}
                      className={`px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider ${
                        isSortable ? 'cursor-pointer select-none group hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors' : ''
                      }`}
                      onClick={() => isSortable && handleSort(column, index)}
                    >
                      <div className="flex items-center gap-2">
                        {column.header}
                        {isSortable && getSortIcon(column)}
                      </div>
                    </th>
                  );
                })}
                {(onEdit || onDelete || actions) && (
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {currentData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (onEdit || onDelete || actions ? 1 : 0)}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
                      <Search size={48} className="opacity-50" />
                      <div>
                        <p className="text-lg font-semibold">Aucune donnée disponible</p>
                        <p className="text-sm">Les résultats apparaîtront ici</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentData.map((item, rowIndex) => (
                  <tr
                    key={item._id || rowIndex}
                    className="group hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/20 dark:hover:from-blue-950/20 dark:hover:to-purple-950/10 transition-all duration-200 animate-fade-in-up"
                    style={{ animationDelay: `${rowIndex * 30}ms` }}
                  >
                    {columns.map((column, colIndex) => {
                      const value = getCellValue(item, column);
                      return (
                        <td
                          key={colIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                        >
                          {column.cell ? column.cell(value, item) : value as ReactNode}
                        </td>
                      );
                    })}
                    {(onEdit || onDelete || actions) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {actions ? (
                            actions(item)
                          ) : (
                            <>
                              {onEdit && (
                                <button
                                  onClick={() => onEdit(item)}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  Modifier
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  onClick={() => onDelete(item)}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  Supprimer
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">
              {startIndex + 1} - {Math.min(endIndex, data.length)}
            </span>
            <span className="text-gray-500 dark:text-gray-400">sur</span>
            <span className="font-medium">{data.length}</span>
            <span className="text-gray-500 dark:text-gray-400">résultats</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* First page */}
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:scale-110 disabled:hover:scale-100"
              title="Première page"
            >
              <ChevronsLeft size={18} className="text-gray-700 dark:text-gray-300" />
            </button>
            
            {/* Previous page */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:scale-110 disabled:hover:scale-100"
              title="Page précédente"
            >
              <ChevronLeft size={18} className="text-gray-700 dark:text-gray-300" />
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-2">
              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = index + 1;
                } else if (currentPage <= 3) {
                  pageNum = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + index;
                } else {
                  pageNum = currentPage - 2 + index;
                }

                return (
                  <button
                    key={index}
                    onClick={() => goToPage(pageNum)}
                    className={`
                      min-w-[40px] h-10 px-3 rounded-xl font-semibold text-sm transition-all duration-200
                      ${currentPage === pageNum
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 scale-110'
                        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 hover:border-blue-300 dark:hover:border-blue-600 hover:scale-105'
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            {/* Next page */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:scale-110 disabled:hover:scale-100"
              title="Page suivante"
            >
              <ChevronRight size={18} className="text-gray-700 dark:text-gray-300" />
            </button>
            
            {/* Last page */}
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:scale-110 disabled:hover:scale-100"
              title="Dernière page"
            >
              <ChevronsRight size={18} className="text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
