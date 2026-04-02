# 📚 Dokumentasi Nusa Belajar - Panduan Lengkap

## Overview Dokumentasi

Dokumentasi Nusa Belajar dibagi menjadi **6 Phase** untuk memudahkan pembelajaran dan pengembangan:

### 📋 Daftar Phase

| Phase       | Judul                                               | Isi Utama                                                                        | Durasi Baca |
| ----------- | --------------------------------------------------- | -------------------------------------------------------------------------------- | ----------- |
| **Phase 1** | [Pengaturan & Setup Awal](PHASE-1-SETUP.md)         | Overview project, tech stack, instalasi, konfigurasi environment, database setup | 15-20 menit |
| **Phase 2** | [Arsitektur & Konsep Inti](PHASE-2-ARCHITECTURE.md) | Database schema, auth flow, RBAC, folder structure, code organization            | 20-25 menit |
| **Phase 3** | [API Reference](PHASE-3-API-REFERENCE.md)           | Lengkap semua endpoint API, request/response, authentication                     | 30-40 menit |
| **Phase 4** | [Dokumentasi Fitur](PHASE-4-FEATURES.md)            | Auth, courses, schedules, chat, knowledge base, admin panel                      | 25-35 menit |
| **Phase 5** | [Development Guide](PHASE-5-DEVELOPMENT.md)         | Workflow dev, migrations, menambah fitur, testing, deployment                    | 20-30 menit |
| **Phase 6** | [Troubleshooting & Reference](PHASE-6-REFERENCE.md) | Common issues, env variables, error codes, security, glossary                    | 15-20 menit |

---

## 🚀 Quick Start untuk Developer Baru

Jika Anda ingin mulai cepat, ikuti urutan ini:

1. **Pertama:** Baca [Phase 1 - Setup](PHASE-1-SETUP.md) untuk instalasi awal
2. **Kedua:** Skim [Phase 2 - Architecture](PHASE-2-ARCHITECTURE.md) untuk pahami struktur
3. **Ketiga:** Buka [Phase 3 - API](PHASE-3-API-REFERENCE.md) saat develop fitur API
4. **Keempat:** Lihat [Phase 4 - Features](PHASE-4-FEATURES.md) untuk detail fitur spesifik
5. **Referensi:** Gunakan [Phase 6 - Reference](PHASE-6-REFERENCE.md) saat bertemu masalah

---

## 📊 Informasi Project

**Project Name:** Nusa Belajar  
**Type:** Learning Management System (LMS) dengan AI  
**Framework:** Next.js 16  
**Database:** CockroachDB (via Prisma ORM)  
**Auth:** OAuth 2.0 (Google Workspace & Microsoft Entra ID)  
**Status:** Active Development

---

## 🎯 Fitur Utama

✅ **Authentication & Authorization**

- Login/Register dengan email-password
- OAuth Google Workspace
- SSO Microsoft (Azure Entra ID)
- Role-based access (Admin, Dosen, Mahasiswa)

✅ **Manajemen Kursus & Mata Pelajaran**

- Katalog kursus
- Manajemen mata pelajaran
- Enrollment & enrollment keys

✅ **Jadwal Mengajar**

- Manajemen schedule dosen
- Integrasi dengan class management

✅ **Chat & Chatbot**

- Real-time chat antar user
- AI-powered chatbot untuk support akademik
- Knowledge Base integration

✅ **Knowledge Base & FAQ**

- Knowledge base untuk FAQ handling
- Document chunking untuk RAG
- Search functionality

✅ **Admin Panel**

- User management & RBAC
- System logs dengan live refresh
- Academic year management

---

## 📁 Struktur Folder Project

```
docs/
├── DOKUMENTASI_RINGKASAN.md          ← Anda di sini
├── PHASE-1-SETUP.md                  ← Setup awal & instalasi
├── PHASE-2-ARCHITECTURE.md           ← Arsitektur & konsep
├── PHASE-3-API-REFERENCE.md          ← Lengkap API docs
├── PHASE-4-FEATURES.md               ← Fitur details
├── PHASE-5-DEVELOPMENT.md            ← Development workflow
├── PHASE-6-REFERENCE.md              ← Troubleshooting & reference
└── folder-structure.md               ← Konvensi naming folder
```

---

## 🔗 Quick Link ke Topik Populer

### Setup & Installation

- [Initial Setup](PHASE-1-SETUP.md#instalasi-dependencies)
- [Environment Variables](PHASE-6-REFERENCE.md#environment-variables)
- [Database Setup](PHASE-1-SETUP.md#database-configuration)

### Architecture & Development

- [Database Schema](PHASE-2-ARCHITECTURE.md#database-schema)
- [Authentication Flow](PHASE-2-ARCHITECTURE.md#authentication-flow)
- [Folder Structure](PHASE-2-ARCHITECTURE.md#folder-structure)

### API Development

- [Auth API](PHASE-3-API-REFERENCE.md#auth-endpoints)
- [Courses API](PHASE-3-API-REFERENCE.md#courses-endpoints)
- [Chat API](PHASE-3-API-REFERENCE.md#chat-endpoints)

### Frontend Features

- [Course Browsing](PHASE-4-FEATURES.md#course-browsing)
- [Chat System](PHASE-4-FEATURES.md#chat-system)
- [Admin Panel](PHASE-4-FEATURES.md#admin-panel)

### Troubleshooting

- [Common Issues](PHASE-6-REFERENCE.md#troubleshooting)
- [Debugging](PHASE-1-SETUP.md#debugging-oauth)

---

## 🛠️ Maintenance

**Dokumentasi ini diperbarui sesuai dengan:**

- Perubahan struktur folder
- API endpoint baru/perubahan
- Fitur baru / deprecation
- Config atau environment variables baru

**Terakhir diupdate:** 31 Maret 2026

---

## 💡 Tips Menggunakan Dokumentasi

1. **Gunakan Ctrl+F** untuk search di dalam setiap file Phase
2. **Setiap Phase** adalah standalone - bisa dibaca berurutan atau langsung ke topic yang dibutuhkan
3. **Kode Example** tersebar di setiap Phase - gunakan sebagai referensi
4. **Lihat folder-structure.md** untuk detail struktur project yang lebih dalam

---

## ❓ FAQ tentang Dokumentasi

**Q: Saya ingin mulai develop fitur baru, mulai dari mana?**  
A: Mulai dari Phase 2 (Architecture) untuk pahami struktur, lalu Phase 5 (Development Guide).

**Q: Saya dapat error, mau cari solusinya?**  
A: Langsung lihat Phase 6 (Troubleshooting & Reference).

**Q: Saya mau build API baru, berguna?**  
A: Baca Phase 3 (API Reference) untuk pattern dan convention.

---

**Selamat membaca! Happy coding! 🎉**
