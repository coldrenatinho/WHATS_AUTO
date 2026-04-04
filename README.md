# WHATS_AUTO

Plataforma multi-tenant de atendimento WhatsApp da Norte MT Sistemas, com backend em Node.js + Express + TypeScript, frontend em Vue 3 e persistência em MariaDB. O projeto também integra n8n para automações e expõe a documentação da API via Swagger.

## Visão Geral

- O backend concentra autenticação, gestão da operação, tickets, fluxos e a integração simulada com a Evolution API.
- O frontend entrega o painel operacional, telas de login e cadastro, administração de usuários, instâncias WhatsApp, tickets e construtor visual de automações.
- O repositório foi organizado para execução local com Docker Compose e para deploy em ambiente com subdomínios separados.

## Stack

- Frontend: Vue 3, Vite, Vue Router, Pinia, Tailwind CSS, Axios.
- Backend: Node.js, Express, TypeScript, Sequelize, JWT, Zod, Swagger UI.
- Banco: MariaDB.
- Automação: n8n.
- WhatsApp: Evolution API, atualmente com modo mock no backend.
- Infra: Docker, Docker Compose e pipelines de CI/CD.

## Estrutura do Repositório

- [Documentação detalhada](docs/guia-da-aplicacao-e-do-codigo.md)
- `backend/`: API, modelos, middlewares, controllers, serviços, testes e OpenAPI.
- `frontend/`: SPA em Vue 3 com layout, rotas, stores e builder de workflow.
- `infrastructure/`: scripts SQL e apoio de banco.
- `prompts/`: prompts de sistema usados pela solução.
- `bot_data/`: dados auxiliares gerados em ambiente local ou de operação.

## Como Rodar Localmente

1. Copie o arquivo de variáveis de ambiente apropriado para `.env` e ajuste os valores do banco, JWT, URLs e integrações.
2. Suba a stack com `docker compose -f docker-compose.local.yml up -d --build`.
3. Acesse o frontend na porta configurada pelo compose local e a API em `/api/health`.
4. O Swagger fica disponível em `/api/docs` e o JSON OpenAPI em `/api/docs.json`.

## Testes e Qualidade

- O backend possui testes unitários e de integração com Jest e Supertest.
- O frontend possui lint e build com Vite, além de validação de tipos com Vue TSC.
- No ambiente atual, a validação mais confiável para o frontend é `npm run build` e `npm run lint` dentro de `frontend/`.

## Integrações e Observações

- A integração com a Evolution API está em modo mock no serviço de revolução, útil para desenvolvimento e testes locais.
- O construtor visual de workflows salva o modelo no próprio fluxo, dentro de `trigger_config.workspaceModel`.
- O frontend usa token JWT em `localStorage` e injeta automaticamente o cabeçalho `Authorization` nas requisições.

## Documentação da API

- Swagger UI: `/api/docs`
- OpenAPI JSON: `/api/docs.json`

## Próximos Passos Recomendados

- Consolidar as integrações reais com Evolution API e n8n.
- Persistir o workflow visual em uma entidade própria, caso o modelo cresça.
- Expandir a cobertura de testes do frontend e padronizar scripts entre raiz, backend e frontend.
