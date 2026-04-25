# ═══════════════════════════════════════════════════════════════
# Backend Dockerfile - Norte MT Sistemas
# Node.js + Express + TypeScript
# ═══════════════════════════════════════════════════════════════

FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia código fonte
COPY . .

# Compila TypeScript
RUN npm run build

# Mantém apenas dependências de produção para reduzir a imagem final
RUN npm prune --omit=dev && npm cache clean --force

# ═══════════════════════════════════════════════════════════════
# Production Image
# ═══════════════════════════════════════════════════════════════

FROM node:20-alpine

WORKDIR /app

# Usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copia dependências e build já com o dono correto, evitando chown recursivo lento
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --chown=nodejs:nodejs package*.json ./

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "dist/index.js"]
