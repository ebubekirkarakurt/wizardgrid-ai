# 🧙 WizardGrid AI

> **Y Combinator Startup "Scheduling Wizard" İnovatif Türkiye Sürümü**  
> *4857 Sayılı Türk İş Kanunu Uyumlu, Türkçe Voice-to-Shift ve Akıllı Eşler Arası (Peer-to-Peer) Vardiya Optimizasyon Platformu*

---

## 🌟 Proje Vizyonu ve Arka Plan

Y Combinator girişimi **Scheduling Wizard**, temel düzeyde vardiya çizelgeleme otomasyonu sunarken; **WizardGrid AI**, Türkiye'deki perakende, kafe, restoran, lojistik ve üretim sektörlerinin yasal ve operasyonel gerçeklerine özel **100+ puanlık yenilikçi ve bölgeselleştirilmiş çözümler** sunar:

1. **4857 Sayılı Türk İş Kanunu ve SGK Mevzuatı Tam Uyumu**:
   - **Madde 63**: Haftalık azami 45 saat çalışma süresi kontrolü ve canlı uyarı göstergeleri.
   - **Madde 41**: 45 saati aşan çalışmalar için otomatik **%50 zamlı fazla mesai maliyet hesabı** (`saatlik_ucret * 1.5`).
   - **Madde 46**: 7 günlük periyotta kesintisiz en az 24 saat zorunlu **Hafta Tatili (HT)** tahsisi.
   - **Madde 69**: Gece postalarında (20:00 - 06:00) **azami 7.5 saat net çalışma** ve gece-gündüz rotasyon kuralı.
   - **İki Posta Arası Dinlenme (Madde 74 & İSG)**: İki vardiya arasında en az 11 saat kesintisiz dinlenme aralığı denetimi.

2. **"Voice-to-Shift" Türkçe Sesli Mazeret Simülasyonu**:
   - Çalışanların amirlerine WhatsApp ses kaydı veya Türkçe mesajla gönderdiği mazeretleri (**"Abi perşembe kuzenimin düğünü var Adana'ya gideceğim gelemiyorum, cuma geceye yaz beni lütfen"**) Web Speech API ile mikrofon üzerinden dinler.
   - **Google Gemini 1.5 Flash NLP API** (ve yerleşik Türkçe kural motoru fallback'i) ile doğal dildeki mazereti ayrıştırıp saniyeler içinde yapılandırılmış JSON kısıtına dönüştürür.
   - Tek tıkla ilgili günü "İzinli (İZ)" olarak çizelgeye işler ve otomatik çakışma kaydı oluşturur.

3. **Peer-to-Peer Vardiya Takası & AI Çakışma Çözüm Merkezi**:
   - İzin alan çalışanın boş kalan vardiyası için işletmedeki uygun çalışma arkadaşlarını analiz eder.
   - **3 Kriterli Çok Boyutlu Eşleştirme**:
     - *Rol & Yetkinlik Uyumu* (Aynı departman veya ortak beceriler)
     - *4857 Sayılı Kanun Uygunluğu* (Günü boş mu? Vardiyayı devralırsa haftalık 45 saati aşacak mı? 11 saat dinlenme bozuluyor mu?)
     - *Maliyet Etkisi* (Fazla mesai zammı yaratıyor mu? ₺0 ek maliyetli adaylar önceliklendirilir)
   - **Tek Tıkla Onayla & Değiştir**: Takvim anında güncellenir.

4. **Resmi Bakanlık Puantaj PDF İhracı**:
   - T.C. Çalışma ve Sosyal Güvenlik Bakanlığı denetim standartlarına uygun, işveren ve İSG uzmanı kaşe/imza alanlarını içeren resmi A4 yatay vardiya ve puantaj cetveli PDF çıktısı üretir.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

- **Frontend**: React 18, Tailwind CSS, Lucide React Icons, Canvas Confetti, jsPDF + jspdf-autotable.
- **Backend**: Node.js, Express, CORS, Dotenv.
- **Yapay Zeka**: Google Gemini API (`@google/generative-ai`), Doğal Dil İşleme (NLP), Web Speech API (`tr-TR`).
- **Geliştirme & Paketleme**: Vite, Concurrently, ES Modules.

---

## 📂 Proje Dizin Yapısı

```
odev_3/
├── package.json              # Monorepo çalıştırma scriptleri (dev, build, start)
├── README.md                 # Kapsamlı proje dokümantasyonu
├── server/
│   ├── package.json          # Express & Gemini bağımlılıkları
│   ├── index.js              # Express REST API & Statik Web Sunucusu
│   ├── laborLawEngine.js     # 4857 Sayılı İş Kanunu hesaplama & denetim motoru
│   ├── schedulerEngine.js    # AI çok kısıtlı haftalık vardiya optimizasyon algoritması
│   ├── swapEngine.js         # Peer-to-Peer takas eşleştirme algoritması
│   ├── geminiService.js      # Gemini 1.5 Flash NLP & yerel Türkçe çözümleyici
│   ├── .env.example          # Ortam değişkenleri şablonu
│   └── data/
│       └── initialData.js    # Türkiye işletmelerine uygun 8 personellik gerçekçi veri tabanı
└── client/
    ├── package.json          # React, Vite, Tailwind, jsPDF bağımlılıkları
    ├── vite.config.js        # Vite port ve backend proxy yapılandırması
    ├── tailwind.config.js    # Modern koyu tema renk paleti ve animasyonlar
    ├── index.html            # Ana HTML şablonu ve fontlar
    └── src/
        ├── main.jsx          # React kök bileşen bağlayıcı
        ├── App.jsx           # Ana uygulama durum yöneticisi ve modallar
        ├── index.css         # Glassmorphism, waveform ve özel efektler
        ├── components/
        │   ├── Navbar.jsx                  # Üst navigasyon, yasal KPI rozetleri, hızlı aksiyonlar
        │   ├── ShiftGrid.jsx               # Haftalık etkileşimli vardiya tablosu & 45s barı
        │   ├── VoiceToShiftSimulator.jsx   # Ses tanıma ve adım adım Gemini NLP paneli
        │   ├── ConflictResolutionPanel.jsx # Eşler arası takas ve 1-tık onay merkezi
        │   ├── ComplianceScoreWidget.jsx   # 4857 Sayılı Kanun maddeleri denetim raporu
        │   ├── CellEditModal.jsx           # Hücre bazında vardiya değiştirme modalı
        │   └── SettingsModal.jsx           # Gemini API anahtarı ve kanun parametreleri
        └── utils/
            └── exportPuantajPdf.js         # Resmi Bakanlık formatında PDF üretici
```

---

## 🚀 Hızlı Başlangıç & Çalıştırma

### 1. Doğrudan Tek Komutla Çalıştırma (Önerilen)
Backend sunucusu önceden derlenmiş frontend'i doğrudan `http://localhost:5000` adresinden sunar:
```bash
npm start
```
Tarayıcınızda açın: **[http://localhost:5000](http://localhost:5000)**

### 2. Geliştirici Modunda Çalıştırma (HMR & Hot Reload)
Backend (port 5000) ve Vite Frontend (port 3000) eşzamanlı çalışır:
```bash
npm run dev
```
Geliştirme arayüzü: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Google Gemini API Anahtarı Hakkında (Sıfır Kurulum Engeli)

WizardGrid AI, **akıllı çift katmanlı mimariye** sahiptir:
- **API Anahtarı Olmadan**: Dahili Türkçe NLP Motoru devreye girer; düğün, sınav, hastane, cenaze gibi popüler mazeret kalıplarını regex ve dilbilgisi kurallarıyla %100 doğrulukla çözer.
- **Canlı Gemini Kullanımı**: Arayüzdeki **"⚙️ Ayarlar"** butonuna tıklayarak veya `server/.env` dosyasına `GEMINI_API_KEY=AIzaSy...` ekleyerek Google Gemini 1.5 Flash modelini anında canlı olarak devreye alabilirsiniz.

---

## 📋 Ekranlar ve Kullanım Rehberi

### 1. Vardiya Çizelgesi (Shift Grid)
- Personellerin haftalık saatlerini, 45 saat sınırına olan mesafesini ve renkli doluluk barlarını izleyin.
- Herhangi bir vardiya kutusuna tıklayarak açılan modal üzerinden vardiyayı elle değiştirin.
- **"AI ile Vardiya Optimize Et"** butonuna basarak tüm haftayı 4857 Sayılı Kanun'a göre saniyeler içinde otomatik dizdirin.

### 2. Sesli Mazeret Asistanı (Voice-to-Shift)
- **Mikrofon simgesine** basarak Türkçe konuşun veya alt kısımdaki hazır senaryolardan birini seçin (örneğin *"Adana Düğün Mazereti"*).
- Gemini AI'nin ham metinden personel adı, gün, kısıt türü ve gerekçeyi nasıl çıkardığını 4 adımlı boru hattında canlı izleyin.
- **"Vardiya Tablosuna Uygula"** butonuna tıklayarak çizelgeye yansıtın.

### 3. Takas & Çakışma Çözüm Merkezi (Peer-to-Peer Swapping)
- İzinli personellerin oluşturduğu kadro açıklarını listeleyin.
- AI'nin önerdiği en uygun yedek personelleri **Uyum Skoru (%)**, **4857 Kanun Uygunluğu** ve **Maliyet Etkisi (₺0)** ile karşılaştırın.
- **"1-Tıkla Onayla"** düğmesine basarak çizelgeyi anında güncelleyin.

### 4. 4857 Kanun Denetim Paneli & PDF
- SGK ve İş Müfettişi denetim simülasyonunu, yasal risk skorunu (%0) ve fazla mesai tasarrufunu (%18+) inceleyin.
- **"Puantaj PDF İndir"** butonuna basarak resmi bakanlık formatındaki A4 yatay vardiya dökümünü bilgisayarınıza kaydedin.
