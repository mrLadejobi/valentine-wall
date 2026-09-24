'use client';

import React from 'react';
import { Download, FileText, Database } from 'lucide-react';
import { exportWallToJSON, exportWallToCSV } from '@/lib/exportUtils';

interface MemoryBookExporterProps {
  wallTitle?: string;
  notes?: Array<{ sender_name?: string; message?: string; created_at?: string }>;
}

export function MemoryBookExporter({ wallTitle = 'LoveWall', notes = [] }: MemoryBookExporterProps) {
  return (
    <div className="glass-card rounded-[40px] p-8 text-slate-800 shadow-xl border border-rose-100 bg-white/70 backdrop-blur-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-3 text-rose-500 font-bold border-b border-rose-100 pb-3">
          <Download className="w-6 h-6" />
          <span className="text-xl tracking-tight">Export Wall Data</span>
        </div>
        <p className="text-gray-500 text-xs font-medium mb-6">
          Download digital backups of your celebration wall messages as CSV spreadsheets or JSON data files.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => exportWallToCSV(wallTitle, notes)}
          className="flex-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-2xl p-3.5 text-xs font-bold flex items-center justify-center gap-2 text-rose-700 transition-all shadow-sm"
        >
          <FileText className="w-4 h-4 text-rose-500" />
          <span>Export CSV</span>
        </button>
        <button
          onClick={() => exportWallToJSON(wallTitle, notes)}
          className="flex-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-2xl p-3.5 text-xs font-bold flex items-center justify-center gap-2 text-purple-700 transition-all shadow-sm"
        >
          <Database className="w-4 h-4 text-purple-500" />
          <span>Export JSON</span>
        </button>
      </div>
    </div>
  );
}

export default MemoryBookExporter;