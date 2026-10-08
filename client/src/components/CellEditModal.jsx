import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Clock, 
  User, 
  Sun, 
  Sunset, 
  Moon, 
  Palmtree, 
  FileText,
  AlertTriangle,
  Scale
} from 'lucide-react';

export default function CellEditModal({ 
  isOpen, 
  onClose, 
  employee, 
  dayId, 
  dayName, 
  currentShift, 
  onSaveShift 
}) {
  if (!isOpen || !employee) return null;

  const [selectedShift, setSelectedShift] = useState(currentShift || 'SABAH');

  const SHIFT_OPTIONS = [
    {
      id: 'SABAH',
      label: 'Sabah Postası (Gündüz)',
      code: 'SB',
      time: '08:00 - 16:30 (7.5 Saat Net)',
      desc: 'İş Kanunu Madde 68 uyarınca 1 saat yemek ve ara dinlenmesi dahildir.',
      icon: <Sun className="w-5 h-5 text-sky-400" />,
      color: 'border-sky-500/40 bg-sky-500/10 text-sky-300'
    },
    {
      id: 'AKSAM',
      label: 'Akşam Postası (Ara Vardiya)',
      code: 'AK',
      time: '16:00 - 00:30 (7.5 Saat Net)',
      desc: 'Yoğun servis saatleri ve kasa kapanış operasyonu için standart posta.',
      icon: <Sunset className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-300'
    },
    {
      id: 'GECE',
      label: 'Gece Postası (Gece Vardiyası)',
      code: 'GC',
      time: '00:00 - 08:00 (7.5 Saat Net)',
      desc: '4857 Sayılı Kanun Madde 69 gereğince gece çalışması azami 7.5 saattir.',
      icon: <Moon className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/40 bg-purple-500/10 text-purple-300'
    },
    {
      id: 'TATIL',
      label: 'Hafta Tatili (Zorunlu Dinlenme)',
      code: 'HT',
      time: '24 Saat Kesintisiz (0 Saat)',
      desc: 'Madde 46 gereğince 7 günlük sürede en az 24 saat kesintisiz dinlenme şarttır.',
      icon: <Palmtree className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
    },
    {
      id: 'IZIN',
      label: 'Mazeret / İzinli Gün',
      code: 'İZ',
      time: 'Mazeret İzni (0 Saat)',
      desc: 'Sesli asistan veya çalışan talebiyle onaylanan mazeret izni durumu.',
      icon: <FileText className="w-5 h-5 text-rose-400" />,
      color: 'border-rose-500/40 bg-rose-500/10 text-rose-300'
    }
  ];

  const handleSave = () => {
    onSaveShift(employee.id, dayId, selectedShift);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#0d1322] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{employee.avatar}</span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{employee.name}</span>
                <span className="text-slate-400 text-xs font-normal">• {dayName}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {employee.role} ({employee.department}) - ₺{employee.hourlyRate}/saat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shift Options List */}
        <div className="p-5 space-y-2.5 max-h-[60vh] overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Vardiya Türü Seçin
          </div>

          {SHIFT_OPTIONS.map((opt) => {
            const isSelected = selectedShift === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => setSelectedShift(opt.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  isSelected
                    ? `${opt.color} ring-1 ring-emerald-500/50 shadow-md`
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="mt-0.5">{opt.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{opt.label}</span>
                    <span className="font-mono text-[11px] font-semibold opacity-90">{opt.code}</span>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                    {opt.time}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                    {opt.desc}
                  </div>
                </div>

                {isSelected && (
                  <div className="p-1 rounded-full bg-emerald-500 text-slate-950 flex-shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            İptal
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Vardiyayı Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
