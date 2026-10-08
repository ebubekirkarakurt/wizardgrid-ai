/**
 * WizardGrid AI - Node.js Express Backend Server
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { INITIAL_EMPLOYEES, INITIAL_SCHEDULE, INITIAL_CONSTRAINTS } from './data/initialData.js';
import { calculateOverallScheduleMetrics, SHIFT_TYPES, DAYS_OF_WEEK } from './laborLawEngine.js';
import { parseMazeretMessage } from './geminiService.js';
import { generateOptimizedSchedule } from './schedulerEngine.js';
import { findSwapCandidates, executeShiftSwap } from './swapEngine.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Database (Demo için çalışır durumda saklanır)
let employees = JSON.parse(JSON.stringify(INITIAL_EMPLOYEES));
let schedule = JSON.parse(JSON.stringify(INITIAL_SCHEDULE));
let constraints = JSON.parse(JSON.stringify(INITIAL_CONSTRAINTS));

// ==================== API ENDPOINTS ====================

// 1. Health check & Konfigürasyon
app.get('/api/status', (req, res) => {
  res.json({
    app: 'WizardGrid AI Backend',
    version: '1.0.0',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    status: 'ONLINE',
    laborLawRulesActive: ['4857 Md. 63 (45 Saat)', 'Md. 41 (Fazla Mesai)', 'Md. 46 (Hafta Tatili)', 'Md. 69 (Gece 7.5s)']
  });
});

// 2. Çalışanlar Listesi
app.get('/api/employees', (req, res) => {
  res.json({ employees });
});

// 3. Vardiya Çizelgesi ve Canlı 4857 Kanun Metrikleri
app.get('/api/schedule', (req, res) => {
  const metrics = calculateOverallScheduleMetrics(employees, schedule);
  res.json({
    schedule,
    shiftTypes: SHIFT_TYPES,
    daysOfWeek: DAYS_OF_WEEK,
    metrics
  });
});

// 4. Tek Bir Hücreyi Güncelleme (El ile düzenleme)
app.post('/api/schedule/update-cell', (req, res) => {
  const { employeeId, day, shiftType } = req.body;
  if (!employeeId || !day || !shiftType) {
    return res.status(400).json({ error: 'employeeId, day ve shiftType gereklidir.' });
  }

  if (!schedule[employeeId]) {
    schedule[employeeId] = {};
  }
  schedule[employeeId][day] = shiftType;

  const metrics = calculateOverallScheduleMetrics(employees, schedule);
  res.json({ success: true, schedule, metrics });
});

// 5. AI ile Akıllı Vardiya Optimizasyonu (4857 Sayılı Kanun Uyumlu)
app.post('/api/schedule/generate-ai', (req, res) => {
  const { targetHours = 37.5 } = req.body;
  const result = generateOptimizedSchedule(employees, constraints, { targetHours });
  schedule = result.schedule;

  res.json({
    success: true,
    message: 'Haftalık vardiya çizelgesi 4857 Sayılı Kanun ve çalışan mazeretlerine göre optimize edildi.',
    ...result
  });
});

// 6. Voice-to-Shift / Mazeret Mesajı NLP Ayrıştırma
app.post('/api/ai/parse-mazeret', async (req, res) => {
  const { text, employeeName, employeeId, customApiKey } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Metin mesajı gereklidir.' });
  }

  try {
    const parsed = await parseMazeretMessage({ text, employeeName, customApiKey });
    res.json({ success: true, parsed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Mazeret Kısıtları Listesi
app.get('/api/constraints', (req, res) => {
  res.json({ constraints });
});

// 8. Yeni Kısıt Ekleme (Mazeret simülasyonundan grid'e aktarma)
app.post('/api/constraints', (req, res) => {
  const { employeeId, employeeName, day, dayName, constraintType, preferredShift, reason, rawMessage } = req.body;
  
  const newConstraint = {
    id: `CST-${Date.now().toString().slice(-4)}`,
    employeeId,
    employeeName,
    day,
    dayName,
    constraintType: constraintType || 'UNAVAILABLE',
    preferredShift: preferredShift || 'NONE',
    reason: reason || 'Mazeret Bildirimi',
    rawMessage: rawMessage || '',
    legalNotice: true,
    status: 'PENDING_SWAP',
    createdAt: new Date().toISOString()
  };

  constraints.unshift(newConstraint);

  // Eğer kısıt tipi UNAVAILABLE ise doğrudan çizelgede o günü İZİN (İZ) yap
  if (constraintType === 'UNAVAILABLE' && schedule[employeeId]) {
    schedule[employeeId][day] = 'IZIN';
  }

  const metrics = calculateOverallScheduleMetrics(employees, schedule);

  res.json({ success: true, constraint: newConstraint, schedule, metrics });
});

// 9. Peer-to-Peer Swap Adayı Önerileri (AI Conflict Resolution)
app.post('/api/swaps/suggest', (req, res) => {
  const { absentEmployeeId, day, targetShift = 'AKSAM' } = req.body;

  if (!absentEmployeeId || !day) {
    return res.status(400).json({ error: 'absentEmployeeId ve day zorunludur.' });
  }

  const candidates = findSwapCandidates({
    employees,
    schedule,
    absentEmployeeId,
    day,
    targetShift
  });

  res.json({
    absentEmployee: employees.find(e => e.id === absentEmployeeId),
    day,
    targetShift,
    candidates
  });
});

// 10. 1-Tıkla Takas Onaylama ve Uygulama
app.post('/api/swaps/execute', (req, res) => {
  const { constraintId, absentEmployeeId, candidateId, day, targetShift = 'AKSAM' } = req.body;

  schedule = executeShiftSwap({
    schedule,
    absentEmployeeId,
    candidateId,
    day,
    targetShift
  });

  // Kısıt durumunu 'RESOLVED' yap
  if (constraintId) {
    const c = constraints.find(item => item.id === constraintId);
    if (c) {
      c.status = 'RESOLVED';
      c.resolvedByCandidateId = candidateId;
    }
  }

  const metrics = calculateOverallScheduleMetrics(employees, schedule);

  res.json({
    success: true,
    message: 'Vardiya takası başarıyla onaylandı ve çizelge güncellendi.',
    schedule,
    metrics
  });
});

// 11. Demo Sıfırlama
app.post('/api/reset-demo', (req, res) => {
  employees = JSON.parse(JSON.stringify(INITIAL_EMPLOYEES));
  schedule = JSON.parse(JSON.stringify(INITIAL_SCHEDULE));
  constraints = JSON.parse(JSON.stringify(INITIAL_CONSTRAINTS));
  const metrics = calculateOverallScheduleMetrics(employees, schedule);

  res.json({ success: true, message: 'Veriler varsayılan duruma sıfırlandı.', schedule, employees, constraints, metrics });
});

// Statik Frontend Dosyalarını Sunma (Production / Standalone mod)
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

app.listen(PORT, () => {
  console.log(`🧙 WizardGrid AI Backend Server çalışıyor: http://localhost:${PORT}`);
  console.log(`⚖️  4857 Sayılı İş Kanunu Motoru: Aktif (Madde 63, 41, 46, 69)`);
});
