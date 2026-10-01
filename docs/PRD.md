# Product Requirement Document (PRD)

## Project Information
| Field | Value |
| :--- | :--- |
| **Project Name** | Personal Portfolio |
| **Concept** | The Spatial Editorial / High-End Interactive Magazine |
| **Architecture** | Single-Repo Static Export (GitHub Pages) + Firestore NoSQL (Headless CMS) |
| **Document Version** | 1.1.0 |
| **Status** | Active / In Development |
| **Target Audience** | Tech Recruiters, Engineering Managers, Design Technologists, Collaborators |

---

## 1. Executive Summary & Vision

### 1.1 Overview
Website portofolio profesional interaktif bergaya majalah editorial (*The Spatial Editorial / Magazine*). Proyek ini memadukan ketelitian tata letak tipografi editorial yang scannable dan ramah bagi recruiter dengan estetika spasial modern berbasis Three.js (mesh distorsi kain/kristal dinamis serta proyeksi hologram interaktif saat elemen aktif atau di-hover).

### 1.2 Core Objectives
- **Recruiter-Friendly UX:** Informasi kunci (keahlian, pengalaman kerja, kontak, dan resume PDF) dapat dipindai dalam hitungan detik tanpa terhalang elemen grafis 3D.
- **Distinctive Visual Identity:** Menampilkan diferensiasi visual tingkat tinggi melalui interaktivitas 3D dan motion physics tanpa mengorbankan performa web standar.
- **Zero-Cost Maintenance & Headless Operations:** Seluruh sistem berjalan dengan pemeliharaan nol biaya melalui hosting statis GitHub Pages dan integrasi Google Firebase Firestore sebagai CMS data dinamis.
- **High Resiliency (Graceful Degradation):** Memiliki sistem fallback data lokal statis otomatis (`src/data/fallbackCv.json`) saat kuota atau koneksi database offline/terkendala.

---

## 2. Design System & Visual Guidelines

### 2.1 Color Palette
Palet warna mengusung tema majalah editorial klasik (*warm linen & organic tones*) berpadu dengan aksen earthy modern:

| Token Name | Hex Code | Visual Swatch Role | Penggunaan & Penerapan |
| :--- | :--- | :--- | :--- |
| **Paper** | `#F8FAE5` | Warm Cream / Linen | Background canvas utama & kontainer editorial |
| **Forest** | `#43766C` | Deep Forest Jade | Teks heading/body utama, garis batas editorial, ikon primer |
| **Bronze** | `#B19470` | Earth Bronze / Khaki | Border kartu proyek, divider halus, status badge muted |
| **Terracotta** | `#76453B` | Warm Terracotta / Burgundy | Highlight badges, link hover, call-to-action (CTA), aksen hologram |

### 2.2 Typography
Tipografi menggunakan kombinasi kontras tinggi antara serif klasik dan sans-serif geometris modern:

| Role | Font Family | Karakteristik | Target Penerapan |
| :--- | :--- | :--- | :--- |
| **Editorial & Headings** | *Playfair Display* / *Cormorant Garamond* | Serif kontras tinggi, elegan, kesan cetak majalah | Headline Hero, Judul Seksi, Nama Proyek, Cover Title |
| **Body, Metrik & CV** | *Plus Jakarta Sans* / *Inter* | Sans-serif geometris bersih, tracking seimbang, highly legible | Deskripsi pengalaman kerja, skill badges, metadata proyek, label teknis |

---

## 3. Technology Stack & Dependencies

| Layer / Kategori | Teknologi | Versi / Library | Fungsi Utama |
| :--- | :--- | :--- | :--- |
| **Core Framework** | React + TypeScript | React 19 / TypeScript 5+ | Fondasi UI reaktif berbasis komponen dan type-safety |
| **Build Tool** | Vite | Vite 6+ | Bundler modern berkecepatan tinggi dengan Hot Module Replacement (HMR) |
| **Styling & Motion** | Tailwind CSS + Framer Motion | Tailwind 3.4+ / Framer Motion 13+ | Utility styling sistematis, layout transitions, dan scroll triggers |
| **Smooth Scrolling** | Lenis | `@studio-freight/lenis` | Inertia smooth scrolling tersinkronisasi dengan Three.js |
| **3D Rendering** | Three.js Ecosystem | `three`, `@react-three/fiber`, `@react-three/drei` | Background mesh dinamis, shaders, dan proyeksi model 3D hologram |
| **Headless CMS & Auth** | Google Firebase | Firebase SDK v12+ (Firestore & Auth) | Penyimpanan NoSQL cloud, autentikasi admin via Google Provider |
| **Icons** | Lucide React | `lucide-react` | Set ikon antarmuka editorial konsisten dan ringan |
| **Deployment & CI/CD** | GitHub Actions + GitHub Pages | Static Export Workflow | Build otomatis dan hosting tanpa biaya operasional |

---

## 4. System Architecture & Layering Model

Untuk menjamin performa tinggi, aksesibilitas screen reader, dan kemudahan seleksi teks oleh recruiter, arsitektur visual dibagi menjadi dua lapisan (*two-layer separation*):

```
┌────────────────────────────────────────────────────────────────────────┐
│ Foreground Layer: DOM / Tailwind CSS / React                           │
│  - Resume / CV Text (Fully Selectable, Accessible, Screen-Reader Safe) │
│  - Editorial Grid Layout & Project Cards                               │
│  - Pointer events aktif, memicu interaksi hover & routing              │
└────────────────────────────────────────────────────────────────────────┘
                                    │ (Triggers event / state)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Background Layer: Fixed Three.js WebGL Canvas (Pointer-events: none)   │
│  - Fluid / Distorted Mesh bereaksi terhadap scroll velocity Lenis      │
│  - 3D Floating Crystal / Hologram projection renderer                  │
│  - Zero interference terhadap interaksi teks pengguna                  │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Data Layer: Headless CMS & Graceful Fallback                           │
│  - Primary: Firebase Firestore (real-time/cached NoSQL data)           │
│  - Secondary: `src/data/fallbackCv.json` (auto-switch on error/offline)│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Database Schema & NoSQL Data Models (Firestore)

Struktur Firestore dirancang secara terpisah (*decoupled collections*) untuk mendukung skalabilitas modul admin CMS `/admin` dan performa kueri yang cepat:

### 5.1 Collection: `metadata`
Dokumen singleton untuk profil personal, headline editorial, bio, kontak, dan tautan file resume.
- **Document ID:** `profile`

```json
{
  "fullName": "Aditia Dika Putra Laksamana",
  "preferredName": "Aditia Dika",
  "editorialRole": "Data Scientist & AI Specialist",
  "editorialTitle": "Transforming Complex Datasets into Actionable Intelligence.",
  "bio": "Information Systems graduate targeting advanced roles in Data Science and Artificial Intelligence. Experienced in predictive modeling, computer vision (CNN), multispectral image analytics, and full-stack web development with a strong focus on high-impact business decision making.",
  "location": "Banjarbaru, South Kalimantan, Indonesia",
  "email": "aditiadika256@gmail.com",
  "phone": "+6282218870626",
  "availabilityStatus": "Available for Data Science & AI Roles",
  "pdfResumeUrl": "https://...",
  "githubUrl": "https://github.com/...",
  "linkedinUrl": "https://linkedin.com/in/...",
  "metrics": {
    "gpaBachelor": 3.77,
    "gpaAssociate": 3.83,
    "yearsExperience": 2,
    "certificationsCount": 4
  }
}
```

---

### 5.2 Collection: `projects`
Katalog proyek studi kasus (Data Science, Computer Vision, Smart Agriculture, dan Full-Stack Systems).
- **Document ID:** Auto-generated (`UUID` / Firestore Doc ID)

```json
{
  "title": "Chili Plant Health Classification via Multispectral Camera",
  "slug": "smart-farming-plant-health-cnn",
  "category": "Artificial Intelligence & Computer Vision",
  "organization": "BRIN (Badan Riset dan Inovasi Nasional)",
  "period": "Sep 2023 – Nov 2024",
  "summary": "Klasifikasi tingkat kesehatan tanaman cabai berbasis citra Normalized Difference Vegetation Index (NDVI) dan format RGN menggunakan arsitektur deep learning CNN-EfficientNetB3.",
  "highlights": [
    "Ekstraksi dan pemrosesan citra indeks vegetasi multi-kanal format RGN",
    "Pembangunan dataset citra pertanian presisi dari drone/kamera multispektral",
    "Implementasi CNN transfer learning EfficientNetB3 dengan akurasi teruji",
    "Kolaborasi integrasi modul inferensi model AI dengan platform IoT lapangan"
  ],
  "tags": ["Python", "TensorFlow/Keras", "Computer Vision", "CNN-EfficientNetB3", "NDVI", "IoT"],
  "liveUrl": "https://...",
  "githubUrl": "https://...",
  "hologramType": "crystal",
  "order": 1,
  "isFeatured": true
}
```

---

### 5.3 Collection: `experiences`
Riwayat riset kolaborasi, asisten praktikum, dan rekayasa perangkat lunak.
- **Document ID:** Auto-generated (`UUID` / Firestore Doc ID)

```json
{
  "role": "Data Scientist",
  "institution": "BRIN (Badan Riset dan Inovasi Nasional)",
  "department": "Smart Farming & Precision Agriculture Research Collaboration",
  "location": "Bandung, Indonesia",
  "period": "September 2023 – November 2024",
  "isCurrent": false,
  "description": "Riset dan implementasi model deep learning untuk klasifikasi kesehatan tanaman cabai menggunakan citra multispektral berbasis NDVI.",
  "achievements": [
    "Gathering requirement and collecting raw multispectral agricultural data.",
    "Analyze and process image data with RGN format.",
    "Create and curate custom dataset from processed field data.",
    "Analyze and modeling using CNN-based deep learning architecture.",
    "Collaborate with IoT team to integrate AI inference modules."
  ],
  "technologies": ["Python", "CNN", "NDVI", "Multispectral Analytics", "IoT"],
  "order": 1
}
```

---

### 5.4 Collection: `educations`
Riwayat pendidikan tinggi dan judul tugas akhir / capstone project.
- **Document ID:** Auto-generated (`UUID` / Firestore Doc ID)

```json
{
  "degree": "Bachelor of Information System (S1)",
  "institution": "Telkom University",
  "location": "Bandung, Indonesia",
  "period": "2022 – 2024",
  "gpa": "3.77",
  "finalProject": {
    "title": "Implementation Of CNN-EfficientNetB3 For Chili Plant Health Classification Based On Vegetation Index Images Using Multispectral Camera",
    "domain": "Intelligence System Development / Precision Agriculture"
  },
  "order": 1
}
```

---

### 5.5 Collection: `certifications`
Sertifikasi kompetensi resmi (BNSP, Industri, dan Kursus Global).
- **Document ID:** Auto-generated (`UUID` / Firestore Doc ID)

```json
{
  "name": "Associate Data Science",
  "issuer": "BNSP (Badan Nasional Sertifikasi Profesi)",
  "issueYear": 2023,
  "credentialUrl": "https://...",
  "category": "Data Science",
  "order": 1
}
```

---

### 5.6 Collection: `skills`
Matriks keahlian teknis (Hard Skills) dan kapabilitas kerja (Soft Skills).
- **Document ID:** `matrix`

```json
{
  "hardSkills": [
    {
      "category": "Intelligence System & AI",
      "items": ["Machine Learning", "Deep Learning", "Computer Vision", "CNN (EfficientNet)", "Predictive Modeling"]
    },
    {
      "category": "Data Analytics & Processing",
      "items": ["Data Mining", "Statistical Analysis", "Data Visualization", "NDVI Image Analytics"]
    },
    {
      "category": "Programming & Databases",
      "items": ["Python", "Java", "PHP", "JavaScript", "MySQL", "Firestore NoSQL"]
    },
    {
      "category": "System & Business Analysis",
      "items": ["BPMN", "Business Intelligence", "UML (Use Case, Activity, Class, Sequence)", "ERD", "Balsamiq", "Figma"]
    }
  ],
  "softSkills": [
    "Problem Solving",
    "Critical Thinking",
    "Communication",
    "Team Coordination & Collaboration",
    "Adaptability",
    "Learner's Mindset"
  ]
}
```

---

## 6. Web Portfolio Structure & Navigation Menu

Navigasi dan susunan menu diselaraskan dengan kebutuhan profil **Data Scientist & AI Specialist** agar memberikan kesan kredibilitas tinggi, terstruktur rapi untuk recruiter, dan menyajikan interaktivitas editorial 3D:

### 6.1 Site Navigation Map (Single-Page Editorial Layout)

| Menu / Section | Anchor ID | Konten & Fokus Khusus | Karakteristik Editorial & Interaktivitas |
| :--- | :--- | :--- | :--- |
| **1. Header Nav** | `#header` | • Logo Editorial: *ADITIA DIKA*<br>• Edition Tag: *VOL. 01 — DATA & AI EDITION*<br>• Availability: *Open for Work Badge*<br>• Menu Links (`Overview`, `Works`, `Research`, `Credentials`, `Skills`, `Contact`)<br>• Primary Action: **Download ATS CV (PDF)** | Sticky glassmorphism nav bar dengan border bronze tipis |
| **2. Editorial Hero (Cover)** | `#cover` | • Headline Besar: *“Transforming Complex Datasets into Actionable Intelligence”*<br>• Ringkasan Profesional: Profil lulusan Sistem Informasi dengan spesialisasi Data Science & AI.<br>• Metrik Kunci: S1 GPA 3.77 / D3 GPA 3.83, 2+ Tahun Riset/Asisten, BNSP Certified Data Scientist. | Tipografi serif Playfair Display kontras tinggi dengan background mesh 3D interaktif |
| **3. Featured Works (Projects)** | `#projects` | • Filter Kategori: `All`, `AI & Computer Vision`, `Data Science`, `Web & Systems`<br>• Studi Kasus Unggulan 1: *BRIN Smart Farming NDVI CNN-EfficientNetB3*<br>• Studi Kasus Unggulan 2: *KPKNL Bandung DAMS & Landing Page*<br>• Tautan *GitHub Repo*, *Live Demo*, dan tech stack badges | Kartu grid majalah editorial, memicu proyeksi hologram 3D saat di-hover |
| **4. Research & Experience** | `#experience` | • Timeline pengalaman kerja & riset:<br>  1. *Data Scientist (BRIN Smart Farming)*<br>  2. *Practicum Assistant (Telkom University)*<br>  3. *Full-Stack Web Developer (KPKNL Bandung)*<br>• Rincian tanggung jawab dan deliverables terukur. | Format scannable timeline dengan tipografi geometris Inter/Jakarta Sans |
| **5. Credentials & Education** | `#credentials` | • **Sertifikasi Profesi:** BNSP Associate Data Science (2023), BNSP Junior Web Dev (2021), Coursera ML Foundations (2021), Oracle Academy AI in Java (2024).<br>• **Pendidikan:** S1 & D3 Sistem Informasi Telkom University lengkap dengan judul Capstone Project & IPK. | Kartu diploma/editorial badge minimalis beraksen Terracotta |
| **6. Technical Matrix (Skills)** | `#skills` | • Matriks keahlian terklasifikasi:<br>  - *Intelligence Systems*<br>  - *Data Analytics*<br>  - *Programming & Databases*<br>  - *Business & System Analysis*<br>• Soft skills pills badge | Layout tabel editorial modern dengan visual progress bar / pill badges |
| **7. Contact & Editorial Footer** | `#contact` | • Informasi kontak langsung: Email (`aditiadika256@gmail.com`), WhatsApp/Telepon, Lokasi (Banjarbaru / Remote).<br>• Tautan sosial: LinkedIn, GitHub.<br>• Tombol cepat *Get In Touch / Hire Me*. | Footer editorial bergaya *colophon* majalah cetak |

---

### 6.2 CMS Admin Dashboard (`/admin`) (Module 2)

#### User Story 2.1 — Secure Authentication
> **Sebagai** pemilik portofolio,  
> **Saya ingin** masuk ke area admin menggunakan akun Google saya,  
> **Agar** hanya saya yang memiliki wewenang untuk mengubah data portofolio.
- **Acceptance Criteria:**
  - Login menggunakan Firebase Auth dengan Google Provider.
  - Email non-otoritas ditolak dengan notifikasi akses ditolak dan dialihkan dari rute `/admin`.

#### User Story 2.2 — Content Management (CRUD)
> **Sebagai** pemilik portofolio,  
> **Saya ingin** memperbarui data bio, mengunggah link CV, dan mengelola daftar proyek tanpa perlu rebuild & redeploy kode,  
> **Agar** pembaruan portofolio berlangsung instan.
- **Acceptance Criteria:**
  - Antarmuka formulir intuitif untuk update metadata profil, resume URL, dan skill matrix.
  - Manajemen proyek mencakup Create, Read, Update, Delete, dan penyusunan urutan tampilan (*order indexing*).
  - Validasi form mencegah penyimpanan data kosong pada field wajib (*title*, *category*, *summary*).

---

## 7. Security Rules & Data Protection

Akses database Firestore dikonfigurasi dengan aturan keamanan granular: publik memiliki izin baca penuh (*read-only*), sementara izin tulis (*write*) dibatasi ketat hanya untuk akun Google pemilik portofolio.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == "YOUR_EMAIL@gmail.com";
    }
  }
}
```

---

## 8. Non-Functional Requirements (NFR)

| Kategori | Spesifikasi & Target Metrik |
| :--- | :--- |
| **Performance** | Skor Google Lighthouse Performance ≥ 90 di desktop. Target rendering Three.js stabil di 60 FPS pada perangkat standar. Lazy-loading untuk komponen 3D berat. |
| **Accessibility (a11y)** | Kepatuhan terhadap pedoman WCAG 2.1 Level AA. Kontras warna teks memenuhi standar minimal 4.5:1. Semantic HTML5 (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`). |
| **Responsiveness** | Responsive dari mobile (360px), tablet (768px), hingga desktop ultra-wide (1440px+). Pada perangkat mobile, efek 3D disesuaikan/disederhanakan untuk menghemat daya baterai. |
| **Browser Support** | Kompatibel dengan browser modern berbasis Chromium (Chrome, Edge), Firefox, dan Safari (versi 2 tahun terakhir). |
| **SEO & OpenGraph** | Meta title, meta description, favicon kustom, dan OpenGraph preview card untuk kemudahan sharing di LinkedIn, Twitter/X, dan WhatsApp. |

---

## 9. Implementation Roadmap & Development Milestones

- [x] **Phase 1: Environment & Editorial Styling Setup**
  - [x] Konfigurasi Tailwind CSS dengan token palet editorial (`paper`, `forest`, `bronze`, `terracotta`).
  - [x] Setup font Google Typography (*Playfair Display* & *Plus Jakarta Sans* / *Inter*).
  - [x] Pembuatan utilitas kelas desain editorial dan reset layout.

- [x] **Phase 2: Data Client & Graceful Fallback Layer**
  - [x] Inisialisasi Firebase SDK (`src/lib/firebase.ts`).
  - [x] Penyusunan file mock data lokal komprehensif (`src/data/fallbackCv.json`).
  - [x] Implementasi custom hook data `usePortfolioData()` dengan deteksi error dan auto-fallback.

- [x] **Phase 3: 3D Canvas, Shaders & Smooth Scroll Integration**
  - [x] Integrasi Lenis Smooth Scroll dan sinkronisasi event wheel/touch (`SmoothScroll.tsx`).
  - [x] Implementasi komponen Three.js `DistortionBackground.tsx` dengan mesh fluid pointer-events-none.
  - [x] Implementasi komponen `HologramModel.tsx` dengan rotasi dan efek 3D saat kartu di-hover.

- [x] **Phase 4: Editorial Layout & Public Sections**
  - [x] Komponen `HeaderNav.tsx` (edisi majalah, status, download CV).
  - [x] Komponen `CoverSection.tsx` (hero cover, tipografi editorial, quick metrics).
  - [x] Komponen `ProjectSpread.tsx` (grid kartu proyek editorial, filter kategori DS/AI/Web).
  - [x] Komponen `ExperiencePage.tsx` / Research Timeline (BRIN, Telkom Univ, KPKNL).
  - [x] Komponen `CredentialsSection.tsx` (Sertifikasi BNSP/Oracle/Coursera & Pendidikan/Tugas Akhir).
  - [x] Komponen `SkillsMatrix.tsx` (Intelligence system, Data analytics, Tooling, Soft skills).
  - [x] Komponen `FooterSection.tsx` (kontak, hak cipta editorial, links).

- [ ] **Phase 5: CMS Admin Panel & Security Integration**
  - [x] Setup modal tool migrasi & connection test Firestore (`FirebaseTester.tsx`).
  - [ ] Implementasi login Google Auth eksklusif untuk admin di rute `/admin`.
  - [ ] Pembuatan form edit langsung dokumen profil & proyek dari browser.
  - [x] Panduan penerapan Firestore security rules.

- [x] **Phase 6: Quality Assurance, Build Optimization & CI/CD**
  - [x] Konfigurasi `base` path pada `vite.config.ts` untuk GitHub Pages (`base: './'`).
  - [x] Pembuatan workflow GitHub Actions (`.github/workflows/deploy.yml`) untuk otomatisasi build dan deployment.
  - [ ] Audit performa Google Lighthouse dan multi-device testing.