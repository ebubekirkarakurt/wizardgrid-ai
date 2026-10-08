import React, { useState } from 'react';
import { 
  Clock, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle, 
  Sparkles, 
  User, 
  Sun, 
  Sunset, 
  Moon, 
  Palmtree, 
  FileText,
  HelpCircle,
  TrendingUp,
  Info
} from 'lucide-react';

export default function ShiftGrid({ 
  employees, 
  schedule, 
  shiftTypes, 
  daysOfWeek, 
  metrics,
  onCellClick,
  onOpenVoiceModal,
  constraints = []
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Departman listesi
  const departments = ['ALL', ...new Set(employees.map(e => e.department))];

  // Filtreleme
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Vardiya rengi ve ikonu
  const getShiftBadge = (shiftKey) => {
    const s = shiftTypes[shiftKey] || shiftTypes.TATIL;
    switch (shiftKey) {
      case 'SABAH':
        return {
          icon: <Sun className="w-3.5 h-3.5 text-sky-400" />,
          label: 'SB',
          name: 'Sabah',
          time: '08:00 - 16:30',
          bg: 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border-sky-500/30'
        };
      case 'AKSAM':
        return {
          icon: <Sunset className="w-3.5 h-3.5 text-amber-400" />,
          label: 'AK',
          name: 'Akşam',
          time: '16:00 - 00:30',
          bg: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
        };
      case 'GECE':
        return {
          icon: <Moon className="w-3.5 h-3.5 text-purple-400" />,
          label: 'GC',
          name: 'Gece',
          time: '00:00 - 08:00',
          bg: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/30'
        };
      case 'IZIN':
        return {
          icon: <FileText className="w-3.5 h-3.5 text-rose-400" />,
          label: 'İZ',
          name: 'İzinli (Mazeret)',
          time: 'Mazeret İzni',
          bg: 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/30'
        };
      case 'TATIL':
      default:
        return {
          icon: <Palmtree className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'HT',
          name: 'Hafta Tatili',
          time: '24s Dinlenme (Md. 46)',
          bg: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/20'
        };
    }
  };

  // Gün bazında toplam kadro sayıları hesapla
  const dailyCoverage = (daysOfWeek || []).map(day => {
    let sabah = 0, aksam = 0, gece = 0, tatil = 0, izin = 0;
    employees.forEach(emp => {
      const s = schedule[emp.id]?.[day.id] || 'TATIL';
      if (s === 'SABAH') sabah++;
      else if (s === 'AKSAM') aksam++;
      else if (s === 'GECE') gece++;
      else if (s === 'IZIN') izin++;
      else tatil++;
    });
    return { day: day.id, sabah, aksam, gece, tatil, izin, totalOnDuty: sabah + aksam + gece };
  });

  return (
    <div className="space-y-4">
      {/* Filters & Search Toolbar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Personel veya görev ara (örn: Ayşe, Barista)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Department Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedDept === dept
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {dept === 'ALL' ? 'Tüm Departmanlar' : dept}
            </button>
          ))}
        </div>

        {/* Quick Shift Legend */}
        <div className="hidden lg:flex items-center gap-2 border-l border-slate-800 pl-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-sky-400 inline-block" /> SB: 08-16:30</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" /> AK: 16-00:30</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-purple-400 inline-block" /> GC: 00-08</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block" /> HT: Hafta Tatili</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-400 inline-block" /> İZ: İzinli</span>
        </div>
      </div>

      {/* Main Shift Grid Card */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-72">Personel & Rol</th>
                <th className="py-3.5 px-3 w-40 text-center">
                  Haftalık Süre (4857 Md. 63)
                </th>
                {(daysOfWeek || []).map((day, idx) => (
                  <th key={day.id} className="py-3.5 px-2 text-center min-w-[110px]">
                    <div className="font-bold text-slate-200">{day.name}</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                      {idx === 0 ? 'Pazartesi' : idx === 6 ? 'Hafta Sonu' : `${day.short}`}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredEmployees.map((emp) => {
                const empShifts = schedule[emp.id] || {};
                
                // Toplam saat hesabı
                let totalNetHours = 0;
                let restDays = 0;
                (daysOfWeek || []).forEach(d => {
                  const s = empShifts[d.id] || 'TATIL';
                  if (s === 'SABAH' || s === 'AKSAM' || s === 'GECE') {
                    totalNetHours += 7.5;
                  } else {
                    restDays++;
                  }
                });

                const isOvertime = totalNetHours > 45;
                const hoursPercent = Math.min(100, Math.round((totalNetHours / 45) * 100));

                return (
                  <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Employee Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-lg flex-shrink-0 shadow-sm">
                          {emp.avatar}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-100 truncate flex items-center gap-1.5">
                            {emp.name}
                            {isOvertime && (
                              <span title="4857 SK Madde 63: 45 saat aşımı!" className="inline-flex text-rose-400">
                                <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="truncate">{emp.role}</span>
                            <span>•</span>
                            <span className="text-emerald-400/90 font-mono">₺{emp.hourlyRate}/s</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Weekly Hours & 45h Meter */}
                    <td className="py-3 px-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={`font-mono font-bold ${
                            isOvertime ? 'text-rose-400' : totalNetHours >= 40 ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {totalNetHours} / 45 saat
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {isOvertime ? `+${totalNetHours - 45}s Mesai` : `${45 - totalNetHours}s Kalan`}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isOvertime 
                                ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                                : totalNetHours >= 40 
                                ? 'bg-amber-400' 
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${hoursPercent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>{restDays} Gün Dinlenme</span>
                          {isOvertime ? (
                            <span className="text-rose-400 font-medium">%50 Zamlı Fazla Mesai</span>
                          ) : (
                            <span className="text-emerald-400/90 flex items-center gap-0.5">
                              <CheckCircle className="w-2.5 h-2.5 text-emerald-400" /> 4857 Uyumlu
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Daily Shift Cells */}
                    {(daysOfWeek || []).map((day) => {
                      const shiftKey = empShifts[day.id] || 'TATIL';
                      const badge = getShiftBadge(shiftKey);
                      
                      // Bu personele ve bu güne ait aktif mazeret var mı?
                      const hasConstraint = constraints.some(
                        c => c.employeeId === emp.id && c.day === day.id && c.status !== 'REJECTED'
                      );

                      return (
                        <td key={day.id} className="py-2.5 px-1.5 text-center">
                          <button
                            onClick={() => onCellClick(emp, day.id, shiftKey)}
                            title={`Tıkla ve değiştir: ${emp.name} - ${day.name} (${badge.name})`}
                            className={`w-full py-2 px-1.5 rounded-xl border text-center transition-all duration-150 transform hover:scale-[1.03] active:scale-[0.98] relative group ${badge.bg}`}
                          >
                            <div className="flex items-center justify-center gap-1 font-bold tracking-wider">
                              {badge.icon}
                              <span>{badge.label}</span>
                            </div>
                            <div className="text-[10px] opacity-80 font-mono mt-0.5 truncate">
                              {badge.time}
                            </div>

                            {/* Mazeret İzni / Çakışma Rozeti */}
                            {hasConstraint && (
                              <span 
                                title="Bu gün için sesli/yazılı mazeret kısıtı girildi" 
                                className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-ping"
                              />
                            )}

                            {/* Quick edit hint on hover */}
                            <span className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer: Daily Coverage & Staffing Health */}
            <tfoot>
              <tr className="bg-slate-900/95 border-t border-slate-800 text-xs">
                <td className="py-3.5 px-4 font-semibold text-slate-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Günlük Kadro Dağılımı</span>
                  </div>
                </td>
                <td className="py-3.5 px-3 text-center text-[11px] text-slate-400 font-medium">
                  Gün Başı Vardiya Özeti
                </td>
                {dailyCoverage.map((cov) => (
                  <td key={cov.day} className="py-3 px-1.5 text-center">
                    <div className="inline-flex flex-col gap-0.5 bg-slate-950/60 border border-slate-800/80 rounded-lg py-1 px-2 text-[10px]">
                      <div className="flex items-center justify-between gap-1 text-slate-300 font-bold">
                        <span>Görevde:</span>
                        <span className="text-emerald-400 font-mono">{cov.totalOnDuty}</span>
                      </div>
                      <div className="flex items-center justify-between gap-1 text-slate-500 text-[9px]">
                        <span>SB: {cov.sabah}</span>
                        <span>AK: {cov.aksam}</span>
                        <span>GC: {cov.gece}</span>
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
