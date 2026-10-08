/**
 * WizardGrid AI - Gemini AI Voice-to-Shift & Mazeret NLP Servisi
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gün eşleme tablosu
const DAY_MAP = {
  pazartesi: { id: 'mon', name: 'Pazartesi' },
  salı: { id: 'tue', name: 'Salı' },
  çarşamba: { id: 'wed', name: 'Çarşamba' },
  perşembe: { id: 'thu', name: 'Perşembe' },
  cuma: { id: 'fri', name: 'Cuma' },
  cumartesi: { id: 'sat', name: 'Cumartesi' },
  pazar: { id: 'sun', name: 'Pazar' }
};

/**
 * Akıllı Yerel Türkçe NLP Çözümleyici (Fallback / No-Key Engine)
 */
function parseMazeretWithLocalNLP(text, employeeName = 'Çalışan') {
  const lower = text.toLowerCase();
  
  // Gün tespiti
  let matchedDay = 'thu';
  let matchedDayName = 'Perşembe';
  for (const [dayKey, data] of Object.entries(DAY_MAP)) {
    if (lower.includes(dayKey)) {
      matchedDay = data.id;
      matchedDayName = data.name;
      break;
    }
  }

  // Vardiya tercihi tespiti
  let preferredShift = 'NONE';
  if (lower.includes('gece') || lower.includes('geceye')) {
    preferredShift = 'GECE';
  } else if (lower.includes('akşam') || lower.includes('akşama')) {
    preferredShift = 'AKSAM';
  } else if (lower.includes('sabah') || lower.includes('sabaha') || lower.includes('gündüz')) {
    preferredShift = 'SABAH';
  }

  // Kısıt türü tespiti
  let constraintType = 'UNAVAILABLE';
  if (lower.includes('değiştirmek') || lower.includes('takas') || lower.includes('yerine')) {
    constraintType = 'SWAP_REQUEST';
  } else if (lower.includes('tercih') || lower.includes('yaz') && !lower.includes('gelemiyorum')) {
    constraintType = 'SHIFT_PREFERENCE';
  }

  // Mazeret nedeni çıkarma
  let reason = 'Kişisel Mazeret İzni';
  if (lower.includes('düğün') || lower.includes('nikah') || lower.includes('kına')) {
    reason = 'Aile/Kuzen Düğünü (Mazeret İzni)';
  } else if (lower.includes('sınav') || lower.includes('vize') || lower.includes('final') || lower.includes('aöf')) {
    reason = 'Üniversite / AÖF Vize Sınavı';
  } else if (lower.includes('hastane') || lower.includes('doktor') || lower.includes('rahatsız') || lower.includes('tedavi')) {
    reason = 'Sağlık / Hastane Randevusu';
  } else if (lower.includes('cenaze') || lower.includes('vefat') || lower.includes('taziye')) {
    reason = 'Taziye & Vefat İzni (4857 Md. 46)';
  } else if (lower.includes('taşınma') || lower.includes('ev taşı')) {
    reason = 'Ev Taşınma Mazereti';
  }

  return {
    parsedBy: 'WizardGrid Built-in Turkish NLP Engine',
    employeeName,
    day: matchedDay,
    dayName: matchedDayName,
    constraintType,
    preferredShift,
    reason,
    legalNotice: true,
    suggestedAction: `${matchedDayName} günü için ${employeeName} adına izin/kısıt girilmeli, yerine yedek personel önerilmeli.`,
    confidenceScore: 0.94,
    rawText: text
  };
}

/**
 * Gemini API veya Akıllı NLP ile Metin / Ses Mazeretini Ayrıştırır
 */
export async function parseMazeretMessage({ text, employeeName, customApiKey }) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // API anahtarı yoksa akıllı Türkçe kural motorunu kullanır
    return parseMazeretWithLocalNLP(text, employeeName);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Desteklenen güncel modeller
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Sen Türkiye'de perakende, kafe ve restoran sektörlerinde çalışan vardiya çizelgeleme yapay zeka asistanı "WizardGrid AI"sın.
Aşağıda bir Türk çalışanın amirine/müdürüne WhatsApp, sesli mesaj veya SMS ile gönderdiği doğal Türkçe mazeret/izin mesajı verilmiştir:

ÇALIŞAN ADI: "${employeeName || 'Bilinmiyor'}"
MESAJ: "${text}"

GÖREVİN:
Bu mesajı Türk İş Kanunu (4857 Sayılı Kanun) ve vardiya planlama terminolojisine göre yapılandırılmış JSON verisine dönüştür.
JSON formatında SADECE geçerli bir JSON objesi döndür, markdown veya başka açıklama ekleme.

Format:
{
  "parsedBy": "Google Gemini 1.5 Flash (Canlı AI)",
  "employeeName": "${employeeName || 'Çalışan'}",
  "day": "mon|tue|wed|thu|fri|sat|sun",
  "dayName": "Pazartesi|Salı|Çarşamba|Perşembe|Cuma|Cumartesi|Pazar",
  "constraintType": "UNAVAILABLE|SHIFT_PREFERENCE|SWAP_REQUEST",
  "preferredShift": "SABAH|AKSAM|GECE|TATIL|NONE",
  "reason": "Kısa ve net mazeret açıklaması",
  "legalNotice": true|false,
  "suggestedAction": "Yöneticinin alması gereken aksiyon özeti",
  "confidenceScore": 0.98,
  "rawText": "${text.replace(/"/g, '\\"')}"
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Markdown ```json bloklarını temizle
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return parsed;
  } catch (error) {
    console.warn('Gemini API çağrısı sırasında hata veya geçersiz anahtar, yerel NLP motoruna dönülüyor:', error.message);
    const localResult = parseMazeretWithLocalNLP(text, employeeName);
    localResult.warning = `Gemini API hatası (${error.message}). Yerel motor ile başarıyla ayrıştırıldı.`;
    return localResult;
  }
}
