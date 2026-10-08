/**
 * WizardGrid AI - Peer-to-Peer Shift Swapping & AI Çakışma Çözüm Motoru
 */
import { SHIFT_TYPES, DAYS_OF_WEEK, analyzeEmployeeCompliance } from './laborLawEngine.js';

export function findSwapCandidates({ employees, schedule, absentEmployeeId, day, targetShift = 'AKSAM' }) {
  const absentEmp = employees.find(e => e.id === absentEmployeeId);
  if (!absentEmp) return [];

  const candidates = [];

  for (const candidate of employees) {
    if (candidate.id === absentEmployeeId) continue;

    const candidateShifts = schedule[candidate.id] || {};
    const candidateDayShift = candidateShifts[day] || 'TATIL';

    let score = 50; // Başlangıç skoru
    let reasons = [];
    let badges = [];
    let canCoverDirectly = false;
    let canTwoWaySwap = false;
    let proposedDayForTwoWay = null;

    // 1. Yetkinlik ve Departman Uyumu (Maks 35 puan)
    if (candidate.department === absentEmp.department) {
      score += 25;
      badges.push('Aynı Departman');
      reasons.push(`${absentEmp.department} birimi ile birebir uyumlu.`);
    } else {
      // Ortak beceri kontrolü
      const sharedSkills = candidate.skills.filter(s => absentEmp.skills.includes(s));
      if (sharedSkills.length > 0) {
        score += 15;
        badges.push('Yedek Yetkinlik');
        reasons.push(`Ortak beceriler: ${sharedSkills.join(', ')}.`);
      }
    }

    // 2. Gün Durumu & Kanuni Uygunluk Kontrolü
    if (candidateDayShift === 'TATIL') {
      // Aday o gün boşta (Hafta Tatili / Dinlenmede)
      canCoverDirectly = true;
      score += 20;
      badges.push('Günü Boş (Doğrudan Devralabilir)');
      reasons.push(`${DAYS_OF_WEEK.find(d => d.id === day)?.name || day} günü planlı mesaisi yok.`);
    } else if (candidateDayShift !== targetShift) {
      // Farklı vardiyada, karşılıklı gün takası (2-Way Swap) incelenir
      canTwoWaySwap = true;
      score += 10;
      badges.push('Karşılıklı Vardiya Takası');
      reasons.push(`O gün ${candidateDayShift} postasında, gün değişimi yapılabilir.`);
    } else {
      // Zaten aynı vardiyada çalışıyor, yerine geçemez
      continue;
    }

    // 3. 4857 Sayılı Kanun: 45 Saat Aşımı Simülasyonu
    const simulatedShifts = { ...candidateShifts, [day]: targetShift };
    const simulatedMetrics = analyzeEmployeeCompliance(candidate, simulatedShifts);

    if (simulatedMetrics.totalHours > 45) {
      score -= 25;
      badges.push('45 Saat Riski');
      reasons.push(`Bu vardiya eklenirse haftalık ${simulatedMetrics.totalHours} saate çıkarak 45 saatlik kanuni sınırı aşar.`);
    } else {
      score += 15;
      badges.push('4857 Uyumlu (≤45 Saat)');
      reasons.push(`Haftalık çalışma süresi yasal sınırda kalıyor (${simulatedMetrics.totalHours} saat).`);
    }

    // 4. Maliyet Etkisi
    const costDiff = (simulatedMetrics.totalCost - candidate.hourlyRate * 37.5);
    let costImpactText = '₺0 Ek Maliyet';
    if (simulatedMetrics.overtimeHours > 0) {
      const extraOvertimeCost = simulatedMetrics.overtimeCost;
      costImpactText = `+₺${extraOvertimeCost.toLocaleString('tr-TR')} Mesai Farkı`;
      reasons.push(`Fazla mesai kaynaklı ${costImpactText} maliyet artışı öngörülüyor.`);
    } else {
      badges.push('Ek Masrafsız (0₺)');
      reasons.push('Herhangi bir fazla mesai zammı doğurmaz.');
    }

    // Skor sınırlandırma
    const finalScore = Math.min(99, Math.max(30, score));

    candidates.push({
      candidateId: candidate.id,
      candidateName: candidate.name,
      role: candidate.role,
      department: candidate.department,
      avatar: candidate.avatar,
      color: candidate.color,
      phone: candidate.phone,
      matchScore: finalScore,
      canCoverDirectly,
      canTwoWaySwap,
      badges,
      reasons,
      costImpactText,
      weeklyHoursAfterSwap: simulatedMetrics.totalHours,
      legalCompliant: simulatedMetrics.isCompliant
    });
  }

  // En yüksek skora göre sırala
  return candidates.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Takas İşlemini Gerçekleştirir ve Çizelgeyi Günceller
 */
export function executeShiftSwap({ schedule, absentEmployeeId, candidateId, day, targetShift }) {
  const updatedSchedule = JSON.parse(JSON.stringify(schedule));

  // Mazeretli çalışanın gününü İZİN yap
  if (!updatedSchedule[absentEmployeeId]) {
    updatedSchedule[absentEmployeeId] = {};
  }
  updatedSchedule[absentEmployeeId][day] = 'IZIN';

  // Yedek adayın gününe vardiyayı ata
  if (!updatedSchedule[candidateId]) {
    updatedSchedule[candidateId] = {};
  }
  updatedSchedule[candidateId][day] = targetShift;

  return updatedSchedule;
}
