# ═══════════════════════════════════════════════════════════════
# Backend Dockerfile - Norte MT Sistemas
# Node.js + Express + TypeScript
# ═══════════════════════════════════════════════════════════════

FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm ci --only=production

# Copia código fonte
COPY . .

# Compila TypeScript
RUN npm run build

# ═══════════════════════════════════════════════════════════════
# Production Image
# ═══════════════════════════════════════════════════════════════

FROM node:20-alpine

WORKDIR /app

# Copia dependências e build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]