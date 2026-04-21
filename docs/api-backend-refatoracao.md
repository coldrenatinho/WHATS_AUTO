# Refatoracao da API Backend

Este documento resume a padronizacao aplicada na camada HTTP do backend.

## Objetivos

- Padronizar tratamento de erros entre controllers.
- Tornar contratos de entrada/saida mais previsiveis.
- Manter OpenAPI alinhado com os endpoints reais.

## Padrao de Controller

- Validar payload com `zod` quando houver body complexo.
- Encapsular erros de negocio com `DomainError`.
- Responder erros via `sendControllerError`.
- Evitar duplicar bloco de serializacao de erro.

## Endpoints ajustados

- Auth:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `GET /api/auth/me`
- Messages:
  - `GET /api/messages/tickets/:ticketId?limit=200&offset=0`
  - `POST /api/messages/tickets/:ticketId/text`
- Revolution:
  - `GET /api/revolution/instances`
  - `POST /api/revolution/instances`
  - `POST /api/revolution/instances/:instanceName/connect`
  - `POST /api/revolution/instances/:instanceName/disconnect`
  - `GET /api/revolution/instances/:instanceName/status`
  - `GET /api/revolution/instances/:instanceName/qrcode`
  - `POST /api/revolution/messages/text`
- Webhook:
  - `POST /api/webhooks/evolution`

## OpenAPI atualizado

Arquivo fonte:
- `backend/src/docs/openapi.ts`

Ajustes principais:
- Novas tags: `Messages`, `Webhooks`.
- Novos schemas: `MessagePayload`, `SendTextToTicketRequest`, `SendTextToTicketResponse`, `WebhookInboundResponse`.
- Inclusao dos paths de mensagens e webhook inbound.
- Inclusao de parametros de paginacao (`limit`, `offset`) na listagem de mensagens.

## Recomendacoes de continuidade

1. Aplicar o mesmo padrao de tratamento em todos os controllers restantes.
2. Evitar `Error` generico em services; preferir `DomainError` com status semantico.
3. Revisar OpenAPI a cada novo endpoint antes de release.
