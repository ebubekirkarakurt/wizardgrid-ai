import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  Sliders, 
  HelpCircle,
  Save
} from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [apiKey, setApiKey] = useState('');
  const [maxWeeklyHours, setMaxWeeklyHours] = useState(45);
  const [overtimeRate, setOvertimeRate] = useState(1.5);
  const [nightShiftMax, setNightShiftMax] = useState(7.5);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('wizardgrid_gemini_api_key') || '';
    setApiKey(savedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('wizardgrid_gemini_api_key', apiKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-[#0d1322] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Key className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Sistem Ayarları & Gemini API</h3>
              <p className="text-xs text-slate-400">Yapay Zeka ve 4857 Sayılı İş Kanunu Parametreleri</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Gemini API Key Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Google Gemini API Anahtarı</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Ücretsiz API Key Al</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-slate-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300">Sıfır Kurulum Engeli:</strong> API anahtarı girmeseniz dahi, 
                WizardGrid AI dahili Türkçe NLP ve kural tabanlı motoruyla %100 çalışır. Canlı Gemini 1.5 Flash modeli için dilediğinizde anahtar ekleyebilirsiniz.
              </div>
            </div>
          </div>

          {/* 4857 Labor Law Parameters Section */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>4857 Sayılı Kanun Mevzuat Parametreleri</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <div className="font-semibold text-slate-200">Haftalık Azami Çalışma Süresi (Madde 63)</div>
                  <div className="text-[11px] text-slate-400">Aşıldığında otomatik fazla mesaiye geçer.</div>
                </div>
                <span className="font-mono font-bold text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {maxWeeklyHours} Saat / Hafta
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <div className="font-semibold text-slate-200">Fazla Mesai Zam Oranı (Madde 41)</div>
                  <div className="text-[11px] text-slate-400">Normal saatlik ücretin katı olarak hesaplanır.</div>
                </div>
                <span className="font-mono font-bold text-indigo-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  %50 Zamlı (1.5x)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <div className="font-semibold text-slate-200">Gece Postası Azami Çalışma (Madde 69)</div>
                  <div className="text-[11px] text-slate-400">20:00 - 06:00 arası gece postası tavanı.</div>
                </div>
                <span className="font-mono font-bold text-purple-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {nightShiftMax} Saat (Net)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <div className="font-semibold text-slate-200">Zorunlu Hafta Tatili (Madde 46)</div>
                  <div className="text-[11px] text-slate-400">7 günlük dönemde kesintisiz dinlenme hakkı.</div>
                </div>
                <span className="font-mono font-bold text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  24 Saat Kesintisiz
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end gap-3">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold mr-auto">
              <CheckCircle2 className="w-4 h-4" /> Ayarlar Başarıyla Kaydedildi!
            </span>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Kapat
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Ayarları Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
