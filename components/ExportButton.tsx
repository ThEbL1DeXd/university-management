'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

interface ExportButtonProps {
  type: 'students' | 'grades' | 'courses' | 'teachers';
  filters?: Record<string, string>;
  className?: string;
}

export default function ExportButton({ type, filters = {}, className = '' }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const labels = {
    students: 'Étudiants',
    grades: 'Notes',
    courses: 'Cours',
    teachers: 'Enseignants',
  };

  const handleExport = async (format: 'json' | 'csv') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type, format, ...filters });
      const res = await fetch(`/api/export?${params}`);
      
      if (format === 'csv') {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const data = await res.json();
        if (data.success) {
          const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${type}_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Erreur lors de l\'export');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleExport('csv')}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
          title="Exporter en CSV"
        >
          <FileSpreadsheet size={16} />
          {loading ? 'Export...' : 'CSV'}
        </button>
        <button
          onClick={() => handleExport('json')}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
          title="Exporter en JSON"
        >
          <FileText size={16} />
          {loading ? 'Export...' : 'JSON'}
        </button>
      </div>
    </div>
  );
}
