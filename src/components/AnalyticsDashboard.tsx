'use client';

import React from 'react';
import { BarChart2, Heart, Image as ImageIcon, Award } from 'lucide-react';

interface AnalyticsDashboardProps {
  totalNotes?: number;
  totalStamps?: number;
  totalPolaroids?: number;
}

export function AnalyticsDashboard({ totalNotes = 0, totalStamps = 0, totalPolaroids = 0 }: AnalyticsDashboardProps) {
  return (
    <div className="glass-card rounded-[40px] p-8 text-slate-800 shadow-xl border border-rose-100 bg-white/70 backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-6 text-rose-500 font-bold border-b border-rose-100 pb-3">
        <BarChart2 className="w-6 h-6" />
        <span className="text-xl tracking-tight">Wall Insights & Metrics</span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4">
          <Heart className="w-6 h-6 mx-auto mb-1 text-rose-500" />
          <div className="text-2xl font-black text-gray-900">{totalNotes}</div>
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Notes</div>
        </div>
        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4">
          <Award className="w-6 h-6 mx-auto mb-1 text-amber-500" />
          <div className="text-2xl font-black text-gray-900">{totalStamps}</div>
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Wax Seals</div>
        </div>
        <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4">
          <ImageIcon className="w-6 h-6 mx-auto mb-1 text-sky-500" />
          <div className="text-2xl font-black text-gray-900">{totalPolaroids}</div>
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Polaroids</div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;