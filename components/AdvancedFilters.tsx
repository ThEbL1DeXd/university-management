'use client';

import { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'date';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

interface AdvancedFiltersProps {
  filters: FilterOption[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onReset: () => void;
  onApply?: () => void;
}

export default function AdvancedFilters({
  filters,
  values,
  onChange,
  onReset,
  onApply,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    const count = Object.values(values).filter(
      (v) => v !== '' && v !== null && v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
    ).length;
    setActiveFiltersCount(count);
  }, [values]);

  const renderFilter = (filter: FilterOption) => {
    switch (filter.type) {
      case 'select':
        return (
          <select
            value={values[filter.key] || ''}
            onChange={(e) => onChange(filter.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="">Tous</option>
            {filter.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {filter.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(values[filter.key] || []).includes(opt.value)}
                  onChange={(e) => {
                    const current = values[filter.key] || [];
                    if (e.target.checked) {
                      onChange(filter.key, [...current, opt.value]);
                    } else {
                      onChange(filter.key, current.filter((v: string) => v !== opt.value));
                    }
                  }}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'range':
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              min={filter.min}
              max={filter.max}
              value={values[`${filter.key}Min`] || ''}
              onChange={(e) => onChange(`${filter.key}Min`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              min={filter.min}
              max={filter.max}
              value={values[`${filter.key}Max`] || ''}
              onChange={(e) => onChange(`${filter.key}Max`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
        );

      case 'date':
        return (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={values[`${filter.key}From`] || ''}
              onChange={(e) => onChange(`${filter.key}From`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
            />
            <span className="text-gray-500">→</span>
            <input
              type="date"
              value={values[`${filter.key}To`] || ''}
              onChange={(e) => onChange(`${filter.key}To`, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
          activeFiltersCount > 0
            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <Filter size={18} />
        <span className="font-medium">Filtres avancés</span>
        {activeFiltersCount > 0 && (
          <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
            {activeFiltersCount}
          </span>
        )}
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Filters Panel */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Filter size={16} />
              Filtres avancés
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {filter.label}
                </label>
                {renderFilter(filter)}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onReset();
              }}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Réinitialiser
            </button>
            <button
              onClick={() => {
                onApply?.();
                setIsOpen(false);
              }}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
