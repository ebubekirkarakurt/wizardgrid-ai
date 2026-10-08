/**
 * WizardGrid AI - Başlangıç Çalışan ve Vardiya Veritabanı
 */

export const INITIAL_EMPLOYEES = [
  {
    id: 'EMP-01',
    name: 'Mehmet Şahin',
    role: 'Vardiya Amiri',
    department: 'Yönetim',
    hourlyRate: 280,
    avatar: '👨‍💼',
    color: '#3b82f6',
    phone: '+90 532 111 2233',
    maxWeeklyHours: 45,
    skills: ['Kasa Kapanış', 'Vardiya İdaresi', 'Envanter', 'Gıda Güvenliği']
  },
  {
    id: 'EMP-02',
    name: 'Ayşe Yılmaz',
    role: 'Kıdemli Kasiyer',
    department: 'Ön Büro & Kasa',
    hourlyRate: 220,
    avatar: '👩‍💼',
    color: '#ec4899',
    phone: '+90 533 222 3344',
    maxWeeklyHours: 45,
    skills: ['Kasa', 'Müşteri İlişkileri', 'POS Mutabakat']
  },
  {
    id: 'EMP-03',
    name: 'Caner Demir',
    role: 'Baş Barista',
    department: 'Bar & Servis',
    hourlyRate: 230,
    avatar: '☕',
    color: '#f59e0b',
    phone: '+90 535 333 4455',
    maxWeeklyHours: 45,
    skills: ['Espresso Kalibrasyon', 'Latte Art', 'Sipariş Yönetimi']
  },
  {
    id: 'EMP-04',
    name: 'Zeynep Kaya',
    role: 'Mutfak & Hazırlık Şefi',
    department: 'Mutfak',
    hourlyRate: 240,
    avatar: '👩‍🍳',
    color: '#10b981',
    phone: '+90 536 444 5566',
    maxWeeklyHours: 45,
    skills: ['Sıcak Mutfak', 'HACCP', 'Stok Kontrol']
  },
  {
    id: 'EMP-05',
    name: 'Burak Çelik',
    role: 'Lojistik & Depo Sorumlusu',
    department: 'Depo',
    hourlyRate: 210,
    avatar: '📦',
    color: '#8b5cf6',
    phone: '+90 537 555 6677',
    maxWeeklyHours: 45,
    skills: ['Mal Kabul', 'Forklift', 'Depo Sayım']
  },
  {
    id: 'EMP-06',
    name: 'Elif Öztürk',
    role: 'Kasiyer & Servis',
    department: 'Ön Büro & Kasa',
    hourlyRate: 200,
    avatar: '👩',
    color: '#06b6d4',
    phone: '+90 538 666 7788',
    maxWeeklyHours: 45,
    skills: ['Kasa', 'Servis', 'Paketleme']
  },
  {
    id: 'EMP-07',
    name: 'Emre Koç',
    role: 'Barista',
    department: 'Bar & Servis',
    hourlyRate: 205,
    avatar: '🧑‍🍳',
    color: '#f97316',
    phone: '+90 539 777 8899',
    maxWeeklyHours: 45,
    skills: ['İçecek Hazırlık', 'Bulaşık & Temizlik', 'Hızlı Servis']
  },
  {
    id: 'EMP-08',
    name: 'Deniz Arslan',
    role: 'Servis Personeli',
    department: 'Bar & Servis',
    hourlyRate: 195,
    avatar: '🧑',
    color: '#14b8a6',
    phone: '+90 540 888 9900',
    maxWeeklyHours: 45,
    skills: ['Masa Servisi', 'Müşteri Karşılama', 'Hijyen']
  }
];

// Başlangıç Haftalık Vardiya Tablosu (4857 Sayılı Kanun Uyumlu)
export const INITIAL_SCHEDULE = {
  'EMP-01': { mon: 'SABAH', tue: 'SABAH', wed: 'SABAH', thu: 'SABAH', fri: 'SABAH', sat: 'TATIL', sun: 'TATIL' }, // 37.5 saat
  'EMP-02': { mon: 'AKSAM', tue: 'AKSAM', wed: 'TATIL', thu: 'AKSAM', fri: 'AKSAM', sat: 'AKSAM', sun: 'TATIL' }, // 37.5 saat
  'EMP-03': { mon: 'SABAH', tue: 'SABAH', wed: 'SABAH', thu: 'TATIL', fri: 'SABAH', sat: 'SABAH', sun: 'TATIL' }, // 37.5 saat
  'EMP-04': { mon: 'SABAH', tue: 'SABAH', wed: 'SABAH', thu: 'SABAH', fri: 'TATIL', sat: 'SABAH', sun: 'TATIL' }, // 37.5 saat
  'EMP-05': { mon: 'GECE', tue: 'GECE', wed: 'GECE', thu: 'GECE', fri: 'GECE', sat: 'TATIL', sun: 'TATIL' },      // 37.5 saat
  'EMP-06': { mon: 'AKSAM', tue: 'TATIL', wed: 'AKSAM', thu: 'AKSAM', fri: 'AKSAM', sat: 'AKSAM', sun: 'TATIL' }, // 37.5 saat
  'EMP-07': { mon: 'TATIL', tue: 'AKSAM', wed: 'AKSAM', thu: 'AKSAM', fri: 'AKSAM', sat: 'SABAH', sun: 'TATIL' }, // 37.5 saat
  'EMP-08': { mon: 'SABAH', tue: 'TATIL', wed: 'SABAH', thu: 'SABAH', fri: 'SABAH', sat: 'AKSAM', sun: 'TATIL' }  // 37.5 saat
};

// Başlangıç Aktif Mazeret Bildirimleri ve Çakışmalar
export const INITIAL_CONSTRAINTS = [
  {
    id: 'CST-101',
    employeeId: 'EMP-02',
    employeeName: 'Ayşe Yılmaz',
    rawMessage: 'Abi perşembe kuzenimin düğünü var Adana\'ya gideceğim gelemiyorum, cuma akşam yerine geceye de yazabilirsin.',
    day: 'thu',
    dayName: 'Perşembe',
    constraintType: 'UNAVAILABLE',
    preferredShift: 'GECE',
    reason: 'Kuzen Düğünü (Şehir Dışı Mazeret)',
    legalNotice: true,
    status: 'PENDING_SWAP', // Takas bekliyor
    createdAt: new Date().toISOString()
  },
  {
    id: 'CST-102',
    employeeId: 'EMP-07',
    employeeName: 'Emre Koç',
    rawMessage: 'Hocam cumartesi sabah Anadolu Üniversitesi AÖF vize sınavım var, cumartesi sabaha yazmayın lütfen akşam gelebilirim.',
    day: 'sat',
    dayName: 'Cumartesi',
    constraintType: 'SHIFT_PREFERENCE',
    preferredShift: 'AKSAM',
    reason: 'AÖF Üniversite Vize Sınavı',
    legalNotice: true,
    status: 'RESOLVED',
    createdAt: new Date().toISOString()
  }
];

// Örnek Hızlı Sesli / Yazılı Mazeret Cümleleri (Simülasyon için)
export const SAMPLE_AUDIO_PROMPTS = [
  {
    title: 'Adana Düğün Mazereti',
    employeeId: 'EMP-02',
    text: 'Abi perşembe kuzenimin düğünü var Adana\'ya gideceğim gelemiyorum, cuma geceye yaz beni lütfen.'
  },
  {
    title: 'AÖF Vize Sınavı',
    employeeId: 'EMP-07',
    text: 'Hocam cumartesi ve pazar günü AÖF vize sınavım var, beni hafta içi gündüz vardiyalarına kaydırabilir misiniz?'
  },
  {
    title: 'Acil Hastane & Refakat',
    employeeId: 'EMP-03',
    text: 'Pazartesi sabah annemi Cerrahpaşa Tıp Fakültesi\'ne kontrole götüreceğim, saat 15:00\'e kadar gelemem. Mümkünse pazartesi akşama yaz beni.'
  },
  {
    title: 'Final Haftası Kısıtı',
    employeeId: 'EMP-06',
    text: 'Şefim bu hafta vizeler başlıyor, Çarşamba ve Perşembe izin rica ediyorum, pazar günü telafi nöbeti tutabilirim.'
  },
  {
    title: 'Nöbet Değişimi Talebi',
    employeeId: 'EMP-08',
    text: 'Salı günü sabah vardiyamı Burak ile değiştirmek istiyoruz, kendisi o gün yerine gelebileceğini söyledi.'
  }
];
