# Wiki do Usuario - Plataforma WhatsApp

## Sumario
- [Visao Geral](./README.md#visao-geral)
- [Perfis e Permissoes](./README.md#perfis-e-permissoes)
- [Mapa de Telas](./README.md#mapa-de-telas)
- [Fluxo Recomendado de Operacao](./README.md#fluxo-recomendado-de-operacao)
- [Como Usar Cada Tela](./README.md#como-usar-cada-tela)
- [Atalhos e Usabilidade](./README.md#atalhos-e-usabilidade)
- [Duvidas Comuns](./README.md#duvidas-comuns)

## Visao Geral
A plataforma centraliza o atendimento WhatsApp da operacao com visao em tempo real, gestao de conversas, instancias conectadas e configuracoes de automacao.

Objetivo principal:
- Organizar a fila de atendimento.
- Melhorar tempo de resposta.
- Manter operacao padronizada entre equipes.

## Perfis e Permissoes
### Admin e Manager
- Acesso completo ao painel administrativo.
- Gerenciam usuarios, conversas, instancias e configuracoes.

### Agent e Viewer
- Acesso operacional focado em fila e atendimento.
- Visualizam e interagem com tickets permitidos.

## Mapa de Telas
| Tela | Rota | Finalidade |
| --- | --- | --- |
| Login | `/login` | Autenticacao de acesso |
| Dashboard | `/` | Indicadores da operacao |
| Conversas | `/tickets` | Fila de tickets, historico e resposta |
| Operacao (fila) | `/operator/tickets` e `/operator/queue` | Atendimento operacional por perfil |
| Instancias | `/instances` | Conexao e pareamento de numeros |
| Configuracoes | `/settings` | Preferencias e automacoes |
| Admin Usuarios | `/admin/users` | Gestao de contas e permissoes |

## Fluxo Recomendado de Operacao
1. Entrar no sistema via tela de Login.
2. Validar status geral no Dashboard.
3. Confirmar conexao das instancias em Instancias.
4. Atender e atualizar status dos tickets em Conversas.
5. Ajustar automacoes e preferencias em Configuracoes.
6. Revisar usuarios e acessos em Admin (quando aplicavel).

## Como Usar Cada Tela
### 1) Dashboard
- Visualize quantidade de conversas abertas, resolvidas e tempo medio.
- Acompanhe status de conexao em tempo real.
- Use os cards para leitura rapida da saude da operacao.

### 2) Conversas
- Filtre tickets por nome, telefone, status e instancia.
- Abra a conversa para ver historico de mensagens.
- Envie respostas diretas para o cliente.
- Altere status do ticket (aberto, pendente, em atendimento, resolvido, fechado).
- Use o botao **Novo chat** para iniciar atendimento manual por modal.

### 3) Instancias
- Cadastre nova instancia WhatsApp para operacao.
- Gere QR Code ou PIN de pareamento.
- Monitore situacao de conexao de cada numero.

### 4) Configuracoes
- Ajuste preferencias de automacao da equipe.
- Salve alteracoes para manter comportamento consistente.
- Consulte metadados de conta e ultimo ajuste salvo.

### 5) Admin Usuarios
- Criacao e gerenciamento de usuarios internos.
- Definicao de perfil de acesso por funcao.
- Controle de seguranca operacional.

## Atalhos e Usabilidade
- Pressione `/` para focar rapidamente na busca de menu.
- Utilize o botao hamburguer para abrir/fechar navegacao lateral.
- Acesse **Ajuda** no topo para guia rapido dentro da propria interface.
- Em dispositivos moveis, o menu abre em formato lateral com overlay para foco da tarefa.

## Duvidas Comuns
### Nao consigo enviar mensagem para um ticket
- Verifique se a instancia vinculada esta conectada.
- Confirme se o numero de destino possui WhatsApp valido.

### A instancia nao conecta
- Tente gerar novo QR Code.
- Use o PIN de pareamento quando disponivel.
- Confira credenciais e estado da Evolution/Revolution API.

### O que fazer quando o tempo real cai
- Recarregue a pagina e valide autenticacao.
- Verifique status de backend e websocket.

## Boas Praticas de Uso
- Sempre encerrar tickets com status correto para melhorar relatorios.
- Evitar mensagens duplicadas usando historico da conversa antes de responder.
- Revisar configuracoes de automacao semanalmente.

## Historico de Atualizacao
- 2026-04-21: wiki inicial criada com estrutura de uso, mapa de telas e fluxo operacional.
