# Sinov — O'zbekistonning eng katta test va viktorina platformasi

Bu loyiha Pikuco.ru platformasidan ilhomlangan, to'liq o'zbek tilida (lotin alifbosida) ishlovchi testlar va viktorinalar platformasi.

## Xususiyatlar

- **4 xil test turi**: Quiz (viktorina), Identification (shaxsiyat), Tournament (turnir), Tree (daraxt/quest).
- **Postlar**: Blog maqolalari yozish va ulashish (Tiptap boy matn muharriri).
- **Reyting tizimi**: Test yaratganlik, o'tganlik va post yozganlik uchun ballar beriladi.
- **Top Reyting**: Eng yaxshi foydalanuvchilar, testlar va postlar reytingi.
- **Skvadlar (Squad)**: Jamoalarga birlashish va raqobatlashish.
- **Zamonaviy UI**: Tailwind v4, shadcn/ui ilhomlangan interfeys, dark mode, silliq animatsiyalar.

## Texnologiyalar

**Frontend (Client)**:
- React 18, Vite, TypeScript
- Tailwind CSS v4, Lucide React (ikonkalar)
- Zustand (Global State)
- React Router DOM
- Axios, Tiptap

**Backend (Server)**:
- Node.js, Express, TypeScript
- MongoDB, Mongoose
- Cloudinary (rasm/video yuklash)
- Brevo (email tasdiqlash uchun)
- Zod (validatsiya), JWT (Autentifikatsiya)

## Ishga tushirish

1. Repozitoriyni klon qiling.
2. MongoDB va Cloudinary xizmatlaridan kalitlarni oling. Brevo dan ham API kalit kerak.
3. `/server` va `/client` papkalariga o'tib, `.env` fayllarini yarating (`.env.example` ga qarab).
4. Bog'liqliklarni o'rnating: `npm install`.
5. Serverni ishga tushiring: `npm run dev` (server papkasida).
6. Frontendni ishga tushiring: `npm run dev` (client papkasida).
