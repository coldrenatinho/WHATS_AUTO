# WHATS_AUTO

Plataforma de chatbot WhatsApp para comercialização da Norte MT Sistemas, preparada para implantação em Docker, integração com n8n, backend em Node.js + Express, frontend em Vue 3 e banco MariaDB.

## Stack

- Frontend: Vue 3 + Vite + Tailwind CSS + Pinia + Vue Router
- Backend: Node.js + Express + TypeScript + Sequelize
- Banco: MariaDB
- Automação: n8n já existente em VPS AWS
- WhatsApp: Evolution API
- Deploy: Docker Compose + CI/CD com GitHub Actions

## Estrutura de Deploy

- `nortemtsistemas.com.br`: frontend principal
- `api.nortemtsistemas.com.br`: backend
- `n8n.nortemtsistemas.com.br`: automações
- `evolution.nortemtsistemas.com.br`: API WhatsApp

## Como rodar localmente

1. Copie `.env.example` para `.env` e ajuste as variáveis.
2. Execute `docker compose up -d --build`.
3. Acesse o frontend e valide a API em `/api/health`.

## CI/CD

- O repositório inclui pipelines de CI para build, lint e validação de Docker.
- O pipeline de CD faz publish de imagens e deploy no servidor de produção via SSH.

## Commits semânticos

- O projeto usa Conventional Commits via `commitlint` e `husky`.
- Exemplos: `feat: add whatsapp dashboard`, `fix: update docker compose`.

## Próximos passos

- Ajustar as variáveis de domínio e SSL no servidor de produção.
- Conectar o frontend às rotas reais do backend.
- Implementar autenticação, tickets e integração completa com Evolution API e n8n.
