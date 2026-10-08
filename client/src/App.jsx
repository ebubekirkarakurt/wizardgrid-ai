import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar.jsx';
import ShiftGrid from './components/ShiftGrid.jsx';
import VoiceToShiftSimulator from './components/VoiceToShiftSimulator.jsx';
import ConflictResolutionPanel from './components/ConflictResolutionPanel.jsx';
import ComplianceScoreWidget from './components/ComplianceScoreWidget.jsx';
import CellEditModal from './components/CellEditModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import { exportPuantajPDF } from './utils/exportPuantajPdf.js';
import { CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'voice' | 'conflicts' | 'compliance'
  const [employees, setEmployees] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [shiftTypes, setShiftTypes] = useState({});
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [constraints, setConstraints] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Cell Edit Modal State
  const [cellModal, setCellModal] = useState({
    isOpen: false,
    employee: null,
    dayId: null,
    dayName: null,
    currentShift: null
  });

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Verileri Çekme
  const fetchAllData = async () => {
    try {
      const [schedRes, empRes, constRes] = await Promise.all([
        fetch('/api/schedule'),
        fetch('/api/employees'),
        fetch('/api/constraints')
      ]);

      const schedData = await schedRes.json();
      const empData = await empRes.json();
      const constData = await constRes.json();

      setEmployees(empData.employees || []);
      setSchedule(schedData.schedule || {});
      setShiftTypes(schedData.shiftTypes || {});
      setDaysOfWeek(schedData.daysOfWeek || []);
      setMetrics(schedData.metrics || null);
      setConstraints(constData.constraints || []);
    } catch (err) {
      console.error('Veri yükleme hatası:', err);
      showToast('Sunucu bağlantısı sağlanamadı. Lütfen backend servisini kontrol edin.', 'error');
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // AI ile Vardiya Optimizasyonu
  const handleGenerateAI = async () => {
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/schedule/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetHours: 37.5 })
      });

      const data = await res.json();
      if (data.success) {
        setSchedule(data.schedule);
        setMetrics(data.metrics);
        
        // Confetti kutlaması!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        showToast('Vardiya tablosu 4857 Sayılı İş Kanunu ve mazeret kısıtlarına göre optimize edildi! %0 Yasal Risk.');
      }
    } catch (err) {
      console.error('AI optimizasyon hatası:', err);
      showToast('Optimizasyon sırasında hata oluştu.', 'error');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Hücre Düzenleme Modalını Aç
  const handleCellClick = (employee, dayId, currentShift) => {
    const dayObj = daysOfWeek.find(d => d.id === dayId);
    setCellModal({
      isOpen: true,
      employee,
      dayId,
      dayName: dayObj ? dayObj.name : dayId,
      currentShift
    });
  };

  // Hücreyi Kaydet
  const handleSaveShift = async (employeeId, day, shiftType) => {
    try {
      const res = await fetch('/api/schedule/update-cell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, day, shiftType })
      });

      const data = await res.json();
      if (data.success) {
        setSchedule(data.schedule);
        setMetrics(data.metrics);
        showToast('Vardiya başarıyla güncellendi.');
      }
    } catch (err) {
      console.error('Hücre kaydetme hatası:', err);
    }
  };

  // Sesli / Yazılı Mazeret Kısıtını Çizelgeye Ekle
  const handleApplyConstraint = async (constraintData) => {
    try {
      const res = await fetch('/api/constraints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(constraintData)
      });

      const data = await res.json();
      if (data.success) {
        setConstraints(prev => [data.constraint, ...prev]);
        setSchedule(data.schedule);
        setMetrics(data.metrics);

        showToast(`${constraintData.employeeName} için ${constraintData.dayName} mazereti işlendi. Takas & Çakışma merkezinde yedek personel önerildi!`);
      }
    } catch (err) {
      console.error('Kısıt ekleme hatası:', err);
    }
  };

  // Takas Onaylama Sonrası Güncelleme
  const handleExecuteSwap = (newSchedule, newMetrics) => {
    setSchedule(newSchedule);
    setMetrics(newMetrics);
    fetchAllData();
    showToast('Vardiya takası onaylandı ve çizelgeye yansıtıldı.');
  };

  // Resmi Puantaj PDF İndir
  const handleExportPDF = () => {
    exportPuantajPDF({ employees, schedule, metrics });
    showToast('Resmi 4857 Sayılı Kanun Uyumlu Vardiya Puantaj PDF indirildi.');
  };

  // Demo Sıfırlama
  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/reset-demo', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSchedule(data.schedule);
        setEmployees(data.employees);
        setConstraints(data.constraints);
        setMetrics(data.metrics);
        showToast('Demo verileri varsayılan duruma sıfırlandı.');
      }
    } catch (err) {
      console.error('Sıfırlama hatası:', err);
    }
  };

  const pendingConflictsCount = constraints.filter(c => c.status === 'PENDING_SWAP').length;

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-semibold ${
            toast.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/50'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={metrics}
        onGenerateAI={handleGenerateAI}
        onExportPDF={handleExportPDF}
        onResetDemo={handleResetDemo}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOptimizing={isOptimizing}
        pendingConflictsCount={pendingConflictsCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'grid' && (
          <ShiftGrid
            employees={employees}
            schedule={schedule}
            shiftTypes={shiftTypes}
            daysOfWeek={daysOfWeek}
            metrics={metrics}
            onCellClick={handleCellClick}
            constraints={constraints}
          />
        )}

        {activeTab === 'voice' && (
          <VoiceToShiftSimulator
            employees={employees}
            onApplyConstraint={handleApplyConstraint}
          />
        )}

        {activeTab === 'conflicts' && (
          <ConflictResolutionPanel
            constraints={constraints}
            employees={employees}
            schedule={schedule}
            onExecuteSwap={handleExecuteSwap}
            onRefresh={fetchAllData}
          />
        )}

        {activeTab === 'compliance' && (
          <ComplianceScoreWidget metrics={metrics} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#060910] py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">WizardGrid AI</span>
            <span>•</span>
            <span>YC Scheduling Wizard Turkish Localization</span>
          </div>
          <div className="text-[11px] text-slate-600">
            4857 Sayılı İş Kanunu (Madde 63, 41, 46, 69) Uyumlu • Voice-to-Shift & Peer Swapping AI
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CellEditModal
        isOpen={cellModal.isOpen}
        onClose={() => setCellModal(prev => ({ ...prev, isOpen: false }))}
        employee={cellModal.employee}
        dayId={cellModal.dayId}
        dayName={cellModal.dayName}
        currentShift={cellModal.currentShift}
        onSaveShift={handleSaveShift}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
