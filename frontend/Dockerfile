# ═══════════════════════════════════════════════════════════════
# Frontend Dockerfile - Norte MT Sistemas
# Vue.js 3 + Tailwind CSS + Vite
# ═══════════════════════════════════════════════════════════════

# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm ci

# Copia código fonte
COPY . .

# Build de produção
RUN npm run build

# ═══════════════════════════════════════════════════════════════
# Production Image - Nginx
# ═══════════════════════════════════════════════════════════════

FROM nginx:alpine

# Copia arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia configuração do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Permissões
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]