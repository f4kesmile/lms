# Folder Structure Guide (Next.js 16)

Dokumen ini adalah standar penamaan dan grouping untuk menjaga struktur tetap rapi, konsisten, dan mudah di-debug.

## Prinsip Utama

1. Pisahkan UI, data access, dan business logic.
2. Gunakan penamaan lowercase kebab-case untuk folder umum.
3. Gunakan folder `_components` dan `_lib` untuk kode lokal per route/fitur.
4. Simpan library lintas fitur di `lib/*`.
5. Hindari duplikasi entrypoint fitur.

## Struktur yang Dipakai

- `app/`: routing, layouts, route handlers
- `components/`: UI reusable lintas fitur
- `features/`: modul fitur domain
- `lib/`: logic lintas fitur (actions, auth, ai, core, utils)
- `prisma/`: schema dan seed
- `scripts/`: utility script dev/maintenance
- `docs/`: dokumentasi engineering

## Konvensi per Area

### app

- Route-level component: `page.tsx`
- Route-level loading state: `loading.tsx`
- Route-local UI parts: `_components/*`
- Route-local service/data mapper: `_lib/*`

Contoh:

- `app/(public)/courses/[classId]/_components/*`
- `app/(public)/courses/[classId]/_lib/*`

### features

- Satu domain satu folder.
- Gunakan file entrypoint yang jelas dan hindari dua implementasi aktif untuk fungsi yang sama.

Contoh konsolidasi:

- Canonical chatbot entrypoint: `features/chatbot/FloatingChatbot.tsx`
- Implementasi tetap dapat diambil dari `features/chat/Chat.tsx` selama masa transisi.

### lib

- `lib/actions/*`: server actions
- `lib/core/*`: infra app (db, http, limiter, logs)
- `lib/auth/*`: auth/session helpers
- `lib/ai/*`: AI and RAG pipeline
- `lib/utils/*`: pure helpers

## Batas Ukuran File (Target)

- `page.tsx`: ideal <= 200 LOC
- Component besar: ideal <= 250 LOC
- Jika melewati batas:
  1. Ekstrak sub-UI ke `_components`
  2. Ekstrak data/query/mapping ke `_lib`
  3. Ekstrak types ke file `types.ts`

## Status Refactor Saat Ini

1. Dashboard admin+dosen sudah satu route `app/(admin)/admin/dashboard/page.tsx`.
2. Chatbot canonical import sudah diarahkan ke `features/chatbot/FloatingChatbot.tsx`.
3. `features/chatbot/FloatingChatbot.tsx` dipakai sebagai compatibility entrypoint selama transisi.

## Checklist sebelum merge

1. `npm run lint` tanpa error.
2. `npm run build` sukses.
3. Tidak ada import path ganda untuk komponen inti fitur.
4. Tidak ada file dead/duplikat yang masih dipakai diam-diam.
