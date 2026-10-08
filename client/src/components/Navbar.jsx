import React from 'react';
import { 
  Sparkles, 
  Calendar, 
  Mic, 
  ArrowLeftRight, 
  ShieldCheck, 
  FileDown, 
  Settings, 
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Zap
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  metrics, 
  onGenerateAI, 
  onExportPDF, 
  onResetDemo, 
  onOpenSettings,
  isOptimizing,
  pendingConflictsCount = 0
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0a0f1d]/90 backdrop-blur-md">
      {/* Top Banner: YC & Legal Notice */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 px-4 py-1.5 border-b border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            4857 Sayılı Türk İş Kanunu Uyumlu
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-300">
            YC Scheduling Wizard Yerelleştirilmiş İnovasyon Modeli • 45 Saat Kuralı & Gece Postası Denetimi
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-300 font-medium">
            <span className="text-slate-400">Yasal Risk Skoru:</span>
            <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-xs ${
              (metrics?.legalRiskScore || 0) === 0 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              %{metrics?.legalRiskScore || 0} Risk
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-300 font-medium">
            <span className="text-slate-400">Fazla Mesai Tasarrufu:</span>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-mono font-bold text-xs flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-indigo-400" />
              %{metrics?.overtimeSavingsPct || 18} (₺{metrics?.savingsTL?.toLocaleString('tr-TR') || '14.250'})
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-2xl select-none">🧙</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                WizardGrid <span className="text-emerald-400">AI</span>
              </span>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                YC TR
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none mt-0.5 hidden sm:block">
              Akıllı Vardiya Çizelgeleme & Sesli Mazeret Motoru
            </p>
          </div>
        </div>

        {/* View Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('grid')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'grid'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Vardiya Tablosu</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'voice'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Sesli Mazeret Asistanı</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>

          <button
            onClick={() => setActiveTab('conflicts')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
              activeTab === 'conflicts'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Takas & Çakışma</span>
            {pendingConflictsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-black">
                {pendingConflictsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'compliance'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">4857 Kanun Denetimi</span>
            <span className="md:hidden">Mevzuat</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* AI Schedule Generator */}
          <button
            onClick={onGenerateAI}
            disabled={isOptimizing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-sans shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {isOptimizing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Optimizasyon Sürüyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
                <span className="hidden sm:inline">AI ile Vardiya Optimize Et</span>
                <span className="sm:hidden">Optimize Et</span>
              </>
            )}
          </button>

          {/* Export PDF */}
          <button
            onClick={onExportPDF}
            title="4857 Sayılı Kanun Uyumlu Resmi Puantaj PDF İndir"
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Ayarlar & Gemini API Anahtarı"
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
          </button>

          {/* Reset Demo */}
          <button
            onClick={onResetDemo}
            title="Demo Verilerini Sıfırla"
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
