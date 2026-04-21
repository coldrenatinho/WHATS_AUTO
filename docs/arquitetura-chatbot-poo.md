# Arquitetura Chatbot POO (Refatoracao Incremental)

Este documento descreve a nova base arquitetural aplicada no backend para o fluxo de chatbot.

## Objetivos

- Reduzir acoplamento entre controllers e integracoes externas.
- Melhorar testabilidade com injecao de dependencias.
- Padronizar pontos de extensao para novos canais/provedores.

## Padroes aplicados

- Application Service: coordena casos de uso.
- Strategy: escolhe o dispatcher por tipo de fluxo (Typebot, N8N).
- Port/Adapter: desacopla envio de mensagens do provider especifico.
- Repository: encapsula consultas e comandos de persistencia.
- Unit of Work: garante consistencia transacional em escritas relacionadas.
- Controller fino: valida entrada e delega regras de negocio.

## Estrutura

- `backend/src/application/chatbot/inbound-message.parser.ts`
  - Parser de payload inbound da Evolution.
- `backend/src/application/chatbot/chatbot-orchestrator.service.ts`
  - Orquestra ciclo inbound: ticket, mensagem, roteamento e fallback.
- `backend/src/application/chatbot/strategies/typebot-dispatcher.strategy.ts`
  - Strategy para fluxos Typebot.
- `backend/src/application/chatbot/strategies/n8n-dispatcher.strategy.ts`
  - Strategy de fallback para N8N.
- `backend/src/application/chatbot/providers/message-provider.port.ts`
  - Contrato de provider de envio outbound.
- `backend/src/application/chatbot/providers/revolution-message.provider.ts`
  - Adapter para Revolution API.
- `backend/src/application/chatbot/conversation-message.application.ts`
  - Caso de uso de mensagens de conversa (listar/enviar).
- `backend/src/application/chatbot/persistence/repositories.ts`
  - Contratos de persistencia para fluxos, tickets, mensagens e instancias.
- `backend/src/application/chatbot/persistence/unit-of-work.ts`
  - Contrato transacional para operacoes atomicas.
- `backend/src/infrastructure/persistence/sequelize/sequelize-chatbot.repositories.ts`
  - Implementacao Sequelize dos repositorios.
- `backend/src/infrastructure/persistence/sequelize/sequelize-unit-of-work.ts`
  - Implementacao Sequelize do Unit of Work.
- `backend/src/migrations/20260421001000-add-chatbot-persistence-indexes.ts`
  - Indices compostos para lookup inbound, roteamento e timeline de mensagens.

## Como evoluir sem quebrar

1. Criar novos providers (ex.: WhatsApp oficial, Telegram) implementando `MessageProviderPort`.
2. Adicionar novas strategies de roteamento sem alterar controller.
3. Reaplicar o mesmo padrao em `management.service.ts` e `auth.service.ts` para unificar persistencia.
4. Cobrir parser, orchestrator, repositories e unit of work com testes unitarios por componente.
