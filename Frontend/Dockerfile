# ---------- Builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

# ส่งค่าที่ Next ใช้ตอน build 
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_URL
ARG BACKEND_ORIGIN

# เผื่อกรณีคุณอยาก ENV ซ้ำเพื่อให้ next.config.mjs อ่านได้แน่ๆ
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV BACKEND_ORIGIN=${BACKEND_ORIGIN}

# ติดตั้ง deps แบบรวดเร็ว
COPY package.json package-lock.json* ./
RUN npm ci

# คัดลอกซอร์สโค้ด
COPY . .

# Build แบบ standalone เพื่อลดขนาด runtime image
RUN npx next build

# ---------- Runner (เล็กและเร็ว) ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# next start ใช้พอร์ต 3000 โดยดีฟอลต์
ENV PORT=3000
EXPOSE 3000

# คัดลอกไฟล์ผลลัพธ์แบบ standalone
# .next/standalone มีไฟล์ server + node_modules ที่จำเป็นแล้ว
COPY --from=builder /app/.next/standalone ./ 
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# รัน Next (ไฟล์ server.js ถูกเตรียมไว้ในโฟลเดอร์ standalone)
CMD ["node", "server.js"]