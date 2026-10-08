import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Calendar,
  ThumbsUp,
  RotateCcw,
  BadgeCheck
} from 'lucide-react';

export default function ConflictResolutionPanel({ 
  constraints, 
  employees, 
  schedule, 
  onExecuteSwap,
  onRefresh 
}) {
  const [selectedConstraint, setSelectedConstraint] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [swapSuccessMessage, setSwapSuccessMessage] = useState(null);

  // Bekleyen (çözülmemiş) kısıtlar
  const pendingConstraints = constraints.filter(c => c.status === 'PENDING_SWAP');
  const resolvedConstraints = constraints.filter(c => c.status === 'RESOLVED');

  useEffect(() => {
    if (pendingConstraints.length > 0 && !selectedConstraint) {
      handleSelectConstraint(pendingConstraints[0]);
    }
  }, [constraints]);

  const handleSelectConstraint = async (constraint) => {
    setSelectedConstraint(constraint);
    setLoadingCandidates(true);
    setSwapSuccessMessage(null);

    try {
      const res = await fetch('/api/swaps/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          absentEmployeeId: constraint.employeeId,
          day: constraint.day,
          targetShift: 'AKSAM' // varsayılan ihtiyaç duyulan vardiya
        })
      });

      const data = await res.json();
      setCandidates(data.candidates || []);
    } catch (err) {
      console.error('Takas önerisi alma hatası:', err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleApproveSwap = async (candidate) => {
    if (!selectedConstraint) return;

    try {
      const res = await fetch('/api/swaps/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          constraintId: selectedConstraint.id,
          absentEmployeeId: selectedConstraint.employeeId,
          candidateId: candidate.candidateId,
          day: selectedConstraint.day,
          targetShift: 'AKSAM'
        })
      });

      const data = await res.json();
      if (data.success) {
        setSwapSuccessMessage(`${candidate.candidateName} başarıyla ${selectedConstraint.employeeName} yerine atandı. 4857 Sayılı Kanun sınırları korundu.`);
        onExecuteSwap(data.schedule, data.metrics);
        // Listeyi yenile
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Takas onaylama hatası:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel rounded-2xl p-6 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <ArrowLeftRight className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Peer-to-Peer Vardiya Takası & Çakışma Çözüm Merkezi
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              İzinli veya mazeretli personelin yerine 4857 Sayılı Kanun kısıtlarını (45 saat sınırı, dinlenme aralıkları) 
              ve fazla mesai maliyetini gözeterek en uygun yedek çalışma arkadaşlarını yapay zeka ile eşleştirir.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400">Bekleyen Çakışma:</span>
            <span className="font-bold font-mono text-amber-400">{pendingConstraints.length} Adet</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Conflicts List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3 shadow-lg">
            <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
              <span>Aktif Mazeret & Boş Vardiyalar</span>
              <span className="text-[11px] font-mono text-slate-400">
                {pendingConstraints.length} Çözüm Bekliyor
              </span>
            </h3>

            {pendingConstraints.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-200">Aktif Çakışma Bulunmuyor</p>
                <p className="text-[11px] text-slate-500">Tüm vardiyalar dengeli ve yasal kurallara uygun şekilde dolu.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingConstraints.map(c => {
                  const emp = employees.find(e => e.id === c.employeeId);
                  const isSelected = selectedConstraint?.id === c.id;

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectConstraint(c)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{emp?.avatar || '👤'}</span>
                          <span className="font-bold text-slate-100">{c.employeeName}</span>
                          <span className="text-slate-400 text-[10px]">({emp?.role})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {c.dayName} Açığı
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 mb-2 font-medium">
                        <span className="text-amber-400 font-semibold">Mazeret:</span> {c.reason}
                      </div>

                      {c.rawMessage && (
                        <div className="text-[10px] text-slate-400 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                          "{c.rawMessage}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Resolved History */}
            {resolvedConstraints.length > 0 && (
              <div className="pt-3 border-t border-slate-800">
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Çözümlenmiş Takaslar ({resolvedConstraints.length})
                </h4>
                <div className="space-y-1.5">
                  {resolvedConstraints.map(r => (
                    <div key={r.id} className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[11px] flex items-center justify-between text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{r.employeeName} ({r.dayName})</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">Takaslandı</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Suggested Peer Replacements */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>AI Önerilen Takas Adayları (Peer Matching)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {selectedConstraint 
                    ? `${selectedConstraint.employeeName} (${selectedConstraint.dayName}) yerine en uygun personeller:` 
                    : 'Sol taraftan bir çakışma seçin.'}
                </p>
              </div>

              {selectedConstraint && (
                <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
                  {candidates.length} Uygun Aday
                </div>
              )}
            </div>

            {swapSuccessMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{swapSuccessMessage}</span>
              </div>
            )}

            {loadingCandidates ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">4857 Sayılı Kanun ve maliyet simülasyonu çalıştırılıyor...</p>
              </div>
            ) : !selectedConstraint ? (
              <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-xl space-y-2">
                <ArrowLeftRight className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-300">İncelenecek Bir Çakışma Seçin</p>
                <p className="text-[11px] text-slate-500">Sol listeden izinli personeli seçtiğinizde yapay zeka anında aday önerir.</p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-200">Uygun Personel Bulunamadı</p>
                <p className="text-[11px] text-slate-500">Tüm çalışanlar o gün 45 saatlik kanuni sınırda veya vardiyada.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {candidates.map((cand, idx) => {
                  const isTopMatch = idx === 0;

                  return (
                    <div
                      key={cand.candidateId}
                      className={`p-4 rounded-xl border transition-all text-xs ${
                        isTopMatch
                          ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg ring-1 ring-emerald-500/20'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{cand.avatar}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-100">{cand.candidateName}</span>
                              {isTopMatch && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5" /> En İyi Eşleşme
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {cand.role} • {cand.department}
                            </div>
                          </div>
                        </div>

                        {/* Match Score & Financial Impact */}
                        <div className="flex items-center gap-2 sm:text-right">
                          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                            <div className="text-[10px] text-slate-400 font-medium">Uyum Skoru</div>
                            <div className="text-sm font-extrabold font-mono text-emerald-400">
                              %{cand.matchScore}
                            </div>
                          </div>

                          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                            <div className="text-[10px] text-slate-400 font-medium">Maliyet Etkisi</div>
                            <div className="text-xs font-bold font-mono text-indigo-300">
                              {cand.costImpactText}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {cand.badges.map((b, bIdx) => (
                          <span
                            key={bIdx}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              b.includes('4857') || b.includes('0₺') || b.includes('Doğrudan')
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : b.includes('Riski')
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {b}
                          </span>
                        ))}
                      </div>

                      {/* AI Reasons & Explanation */}
                      <div className="space-y-1 mb-3.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                        {cand.reasons.map((r, rIdx) => (
                          <div key={rIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{r}</span>
                          </div>
                        ))}
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 flex items-center justify-between">
                          <span>Takas Sonrası Haftalık Saat:</span>
                          <span className="font-mono font-bold text-slate-200">
                            {cand.weeklyHoursAfterSwap} saat (Azami 45s)
                          </span>
                        </div>
                      </div>

                      {/* 1-Click Approve Button */}
                      <button
                        onClick={() => handleApproveSwap(cand)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          isTopMatch
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>1-Tıkla Onayla ve Vardiyayı Değiştir</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
