import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Send, 
  User, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  Volume2, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Code2
} from 'lucide-react';

const SAMPLE_PROMPTS = [
  {
    title: 'Adana Düğün Mazereti',
    employeeId: 'EMP-02',
    employeeName: 'Ayşe Yılmaz',
    text: "Abi perşembe kuzenimin düğünü var Adana'ya gideceğim gelemiyorum, cuma akşam yerine geceye de yazabilirsin."
  },
  {
    title: 'AÖF Vize Sınavı',
    employeeId: 'EMP-07',
    employeeName: 'Emre Koç',
    text: "Hocam cumartesi ve pazar günü AÖF vize sınavım var, beni hafta içi gündüz vardiyalarına kaydırabilir misiniz?"
  },
  {
    title: 'Acil Hastane Randevusu',
    employeeId: 'EMP-03',
    employeeName: 'Caner Demir',
    text: "Pazartesi sabah annemi Cerrahpaşa Tıp Fakültesi'ne kontrole götüreceğim, saat 15:00'e kadar gelemem. Mümkünse pazartesi akşama yaz beni."
  },
  {
    title: 'Üniversite Final Haftası',
    employeeId: 'EMP-06',
    employeeName: 'Elif Öztürk',
    text: "Şefim bu hafta vizeler başlıyor, Çarşamba ve Perşembe izin rica ediyorum, pazar günü telafi nöbeti tutabilirim."
  }
];

export default function VoiceToShiftSimulator({ 
  employees, 
  onApplyConstraint,
  onConstraintParsed 
}) {
  const [selectedEmpId, setSelectedEmpId] = useState('EMP-02');
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const recognitionRef = useRef(null);

  const selectedEmployee = employees.find(e => e.id === selectedEmpId) || employees[0];

  // Web Speech API başlatma
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'tr-TR';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        // Otomatik ayrıştır
        handleParse(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Tarayıcınız Web Speech API ses tanımayı desteklemiyor. Aşağıdaki örnek ses butonlarını veya metin kutusunu kullanabilirsiniz.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInputText('');
      recognitionRef.current.start();
    }
  };

  const handleSelectSamplePrompt = (sample) => {
    setSelectedEmpId(sample.employeeId);
    setInputText(sample.text);
    handleParse(sample.text, sample.employeeName);
  };

  const handleParse = async (textToParse = inputText, empName = selectedEmployee?.name) => {
    const text = textToParse || inputText;
    if (!text.trim()) return;

    setIsProcessing(true);
    setActiveStep(2);

    try {
      const res = await fetch('/api/ai/parse-mazeret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          employeeName: empName || selectedEmployee?.name,
          employeeId: selectedEmpId,
          customApiKey: localStorage.getItem('wizardgrid_gemini_api_key') || ''
        })
      });

      const data = await res.json();
      if (data.success && data.parsed) {
        setParsedResult(data.parsed);
        setActiveStep(3);
        if (onConstraintParsed) {
          onConstraintParsed(data.parsed);
        }
      }
    } catch (err) {
      console.error('Mazeret ayrıştırma hatası:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyToSchedule = () => {
    if (!parsedResult) return;

    onApplyConstraint({
      employeeId: selectedEmpId,
      employeeName: selectedEmployee.name,
      day: parsedResult.day,
      dayName: parsedResult.dayName,
      constraintType: parsedResult.constraintType,
      preferredShift: parsedResult.preferredShift,
      reason: parsedResult.reason,
      rawMessage: inputText
    });

    setActiveStep(4);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel rounded-2xl p-6 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Mic className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Voice-to-Shift: Türkçe Sesli Mazeret Asistanı
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Çalışanların WhatsApp ses kaydı veya Türkçe mesajla gönderdiği mazeretleri Gemini AI ile anlar, 
              4857 Sayılı Kanun kapsamındaki izin türünü tespit eder ve vardiya tablosuna otomatik kısıt olarak işler.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Doğal Dil Motoru:</span>
            <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold text-emerald-400">
              Gemini 1.5 Flash + TR NLP
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Voice & Text Input Simulator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
            <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
              <span>1. Ses / Metin Simülasyonu</span>
              <span className="text-[11px] font-normal text-slate-400">Türkçe tr-TR</span>
            </h3>

            {/* Employee Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Mazeret Bildiren Çalışan
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.avatar} {emp.name} ({emp.role}) - {emp.department}
                  </option>
                ))}
              </select>
            </div>

            {/* Audio Recording Button & Waveform Visualizer */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center gap-3 text-center">
              <button
                onClick={toggleListening}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-xl ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/30'
                    : 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 ring-4 ring-emerald-500/20'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-7 h-7" />
                ) : (
                  <Mic className="w-7 h-7" />
                )}
              </button>

              <div>
                <p className="text-xs font-semibold text-slate-200">
                  {isListening ? 'Türkçe Ses Kaydediliyor... Konuşun' : 'Mikrofona Bas ve Konuş'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Web Speech API ile tarayıcıdan doğrudan Türkçe ses algılanır.
                </p>
              </div>

              {/* Pulsating Waveform bars */}
              {isListening && (
                <div className="flex items-center gap-1.5 h-8">
                  {[...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-400 rounded-full audio-bar"
                      style={{ animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Manual Text Input Area */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Veya WhatsApp / SMS Mazeret Metnini Yapıştırın
              </label>
              <textarea
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Örn: Abi perşembe kuzenimin düğünü var Adana'ya gideceğim gelemiyorum, cuma geceye yaz beni lütfen..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Submit parse button */}
            <button
              onClick={() => handleParse()}
              disabled={isProcessing || !inputText.trim()}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI Çözümlüyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Gemini AI ile Ayrıştır (Parse)</span>
                </>
              )}
            </button>

            {/* One-Click Sample Prompts */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Hızlı Test İçin Hazır Türkçe Ses Kalıpları
              </label>
              <div className="space-y-1.5">
                {SAMPLE_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSamplePrompt(sample)}
                    className="w-full text-left p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-emerald-500/30 text-xs transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                        {sample.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                        "{sample.text}"
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Live Parsing Pipeline & Constraint Card */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-5 shadow-lg">
            <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
              <span>2. Canlı AI Çıkarım Hattı (NLP Pipeline)</span>
              <span className="text-[11px] font-mono text-emerald-400">
                {parsedResult ? `Güven Skoru: %${Math.round((parsedResult.confidenceScore || 0.95) * 100)}` : 'Girdi Bekleniyor'}
              </span>
            </h3>

            {/* Pipeline Step Indicators */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className={`p-2 rounded-xl border ${activeStep >= 1 ? 'bg-slate-900 border-emerald-500/40 text-emerald-300' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
                <div className="font-bold text-[10px] uppercase">1. Adım</div>
                <div className="text-[11px] truncate mt-0.5">Ham Ses/Metin</div>
              </div>

              <div className={`p-2 rounded-xl border ${activeStep >= 2 ? 'bg-slate-900 border-emerald-500/40 text-emerald-300' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
                <div className="font-bold text-[10px] uppercase">2. Adım</div>
                <div className="text-[11px] truncate mt-0.5">Gemini NLP</div>
              </div>

              <div className={`p-2 rounded-xl border ${activeStep >= 3 ? 'bg-slate-900 border-emerald-500/40 text-emerald-300' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
                <div className="font-bold text-[10px] uppercase">3. Adım</div>
                <div className="text-[11px] truncate mt-0.5">JSON Kısıtı</div>
              </div>

              <div className={`p-2 rounded-xl border ${activeStep >= 4 ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
                <div className="font-bold text-[10px] uppercase">4. Adım</div>
                <div className="text-[11px] truncate mt-0.5">Çizelgeye Uygula</div>
              </div>
            </div>

            {/* Parsed Result Display */}
            {parsedResult ? (
              <div className="space-y-4">
                {/* Visual Extracted Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Tespit Edilen Personel & Gün</div>
                    <div className="text-sm font-bold text-white mt-1 flex items-center gap-2">
                      <span>{parsedResult.employeeName}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-emerald-400 font-semibold">{parsedResult.dayName}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Kısıt Türü / Aksiyon</div>
                    <div className="text-sm font-bold text-rose-400 mt-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      {parsedResult.constraintType === 'UNAVAILABLE' 
                        ? 'İzinli / Gelemiyor' 
                        : parsedResult.constraintType === 'SHIFT_PREFERENCE' 
                        ? 'Vardiya Tercihi' 
                        : 'Takas Talebi'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Mazeret Nedeni (Gerekçe)</div>
                    <div className="text-xs font-semibold text-amber-300 mt-1">
                      {parsedResult.reason}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Talep Edilen / Alternatif Vardiya</div>
                    <div className="text-xs font-semibold text-sky-300 mt-1">
                      {parsedResult.preferredShift !== 'NONE' ? parsedResult.preferredShift : 'Müsait Değil'}
                    </div>
                  </div>
                </div>

                {/* AI Manager Recommendation */}
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
                  <div className="font-semibold text-indigo-300 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Yönetici İçin AI Aksiyon Tavsiyesi</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {parsedResult.suggestedAction}
                  </p>
                </div>

                {/* Structured JSON Output */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
                    <span className="flex items-center gap-1">
                      <Code2 className="w-3.5 h-3.5 text-slate-400" />
                      Yapılandırılmış JSON Kısıt Şeması
                    </span>
                    <span className="text-[10px] text-emerald-400">
                      {parsedResult.parsedBy || 'Gemini 1.5'}
                    </span>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300/90 overflow-x-auto leading-relaxed">
                    {JSON.stringify(parsedResult, null, 2)}
                  </pre>
                </div>

                {/* Apply Button */}
                <div className="pt-2">
                  <button
                    onClick={handleApplyToSchedule}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>Vardiya Tablosuna Uygula (İzinli Olarak İşle)</span>
                  </button>
                </div>

                {activeStep === 4 && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Kısıt başarıyla vardiya tablosuna işlendi! Çalışanın o günkü vardiyası "İZ" olarak işaretlendi.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-xl space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-300">Henüz Bir Mazeret Çözümlenmedi</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Sol taraftan mikrofona basarak konuşun veya hazır test butonlarından birini seçerek Gemini AI ayrıştırmasını başlatın.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
