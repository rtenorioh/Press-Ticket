# 📐 Architecture Overview — Press Ticket®

> **Versão do sistema:** v1.16.1  
> **Última atualização:** Maio/2026  
> **Autor:** Robson Tenório  
> **Repositório:** https://github.com/rtenorioh/Press-Ticket

---

## 1. Visão Geral

O **Press Ticket®** é uma plataforma de atendimento multicanal desenvolvida para centralizar a comunicação com clientes via WhatsApp, Facebook, Instagram, Telegram e WebChat em uma única interface. O sistema organiza atendimentos em tickets, filas (setores) e oferece automações via integrações externas.

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESS TICKET®                            │
│                                                                 │
│   Clientes ──► Canais ──► Backend ──► Atendentes/Automação     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Diagrama de Contexto (C4 — Nível 1)

```
                    ┌──────────────────────┐
                    │   Usuário Final /    │
                    │      Cliente         │
                    └──────────┬───────────┘
                               │ Mensagem via canal
          ┌────────────────────┼────────────────────┐
          │                   │                    │
    ┌─────▼──────┐    ┌───────▼───────┐   ┌───────▼───────┐
    │ WhatsApp   │    │  Notificame   │   │   WebChat     │
    │ (wwebjs)   │    │     Hub       │   │  (embutido)   │
    │            │    │ FB/IG/Telegram│   │               │
    └─────┬──────┘    └───────┬───────┘   └───────┬───────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │ Webhook / Sessão WS
                    ┌─────────▼──────────┐
                    │   PRESS TICKET®    │
                    │   (Sistema Core)   │
                    └─────────┬──────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
   ┌──────▼──────┐   ┌────────▼───────┐  ┌───────▼───────┐
   │  Atendente  │   │     Admin      │  │  MasterAdmin  │
   │  (user)     │   │   (admin)      │  │               │
   └─────────────┘   └────────────────┘  └───────────────┘
```

---

## 3. Diagrama de Containers (C4 — Nível 2)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          VPS Ubuntu (Nginx + PM2)                       │
│                                                                         │
│  ┌──────────────────────┐        ┌──────────────────────────────────┐  │
│  │     FRONTEND         │        │           BACKEND                │  │
│  │  React + Vite        │◄──────►│  Node 22 + Express + TypeScript  │  │
│  │  MUI v6              │  HTTP  │  Sequelize ORM                   │  │
│  │  Socket.io-client    │◄──────►│  Socket.io (realtime)            │  │
│  │  react-i18next       │   WS   │  Bull (filas de jobs)            │  │
│  │  Port: 3333          │        │  Port: 8080                      │  │
│  └──────────────────────┘        └──────────┬───────────────────────┘  │
│                                             │                           │
│                                  ┌──────────▼───────────────────────┐  │
│                                  │          MySQL Database           │  │
│                                  │  (Sequelize Migrations/Seeds)     │  │
│                                  └──────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
           │ Webhook                         │ Integrações
           ▼                                 ▼
  ┌─────────────────┐            ┌────────────────────────┐
  │  Notificame Hub │            │  n8n (por setor)       │
  │  (FB/IG/TG)     │            │  OpenAI API            │
  └─────────────────┘            │  SMTP (Email)          │
                                 └────────────────────────┘
```

---

## 4. Stack Tecnológica

### Backend

| Camada         | Tecnologia                   | Versão |
| -------------- | ---------------------------- | ------ |
| Runtime        | Node.js                      | 22.x   |
| Linguagem      | TypeScript                   | ~5.x   |
| Framework      | Express                      | ^4.x   |
| ORM            | Sequelize                    | ^6.x   |
| Banco de dados | MySQL                        | 8.x    |
| Realtime       | Socket.io                    | ^4.x   |
| Filas de jobs  | Bull                         | ^4.x   |
| WhatsApp       | whatsapp-web.js              | ^1.27+ |
| Autenticação   | JWT (access + refresh token) | —      |
| Processo       | PM2                          | —      |

### Frontend

| Camada     | Tecnologia        | Versão |
| ---------- | ----------------- | ------ |
| Framework  | React             | ^18.x  |
| Build tool | Vite              | ^5.x   |
| UI Library | MUI (Material UI) | v6     |
| Realtime   | Socket.io-client  | ^4.x   |
| i18n       | react-i18next     | —      |
| HTTP       | Axios             | —      |

### Infraestrutura

| Componente                   | Tecnologia              |
| ---------------------------- | ----------------------- |
| Servidor web / Proxy reverso | Nginx                   |
| Gerenciador de processos     | PM2                     |
| SO                           | Ubuntu 22.04 LTS        |
| Containerização (opcional)   | Docker + Docker Compose |
| SSL                          | Let's Encrypt / Certbot |

---

## 5. Módulos do Backend

```
backend/
├── src/
│   ├── config/          # Configurações (database, auth, upload)
│   ├── controllers/     # Handlers HTTP — recebem req, retornam res
│   ├── middleware/      # isAuth, isAdmin, isMasterAdmin, multer
│   ├── models/          # Entidades Sequelize (ORM)
│   ├── routes/          # Definição das rotas Express
│   ├── services/        # Lógica de negócio (por domínio)
│   ├── helpers/         # Utilitários e funções reutilizáveis
│   ├── libs/            # Integrações externas (socket, wbot, etc.)
│   ├── database/
│   │   ├── migrations/  # Versionamento do schema
│   │   └── seeds/       # Dados iniciais
│   └── app.ts           # Bootstrap da aplicação
```

### Principais domínios de serviço

- **Auth** — login, refresh token, logout
- **Users** — CRUD, perfis, limites
- **Contacts** — gestão de contatos, importação
- **Tickets** — criação, transferência, fechamento, histórico
- **Messages** — envio/recebimento por canal, mídia
- **Queues** — filas/setores, horários, mensagens de saudação
- **Whatsapp** — gestão de sessões wwebjs
- **Settings** — configurações globais do sistema
- **ApiTokens** — geração e validação de tokens externos

---

## 6. Módulos do Frontend

```
frontend/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── pages/           # Telas principais (uma por rota)
│   ├── context/         # React Context (Auth, Socket, Theme)
│   ├── hooks/           # Custom hooks
│   ├── services/        # Chamadas de API (axios)
│   ├── rules/           # Permissões por perfil
│   ├── translate/       # Arquivos i18n (pt-BR, en)
│   └── App.jsx          # Rotas e providers
```

---

## 7. Canais de Atendimento

| Canal              | Integração          | Mecanismo                  |
| ------------------ | ------------------- | -------------------------- |
| WhatsApp           | whatsapp-web.js     | Sessão browser (Puppeteer) |
| Facebook Messenger | Notificame Hub      | Webhook HTTP               |
| Instagram Direct   | Notificame Hub      | Webhook HTTP               |
| Telegram           | Notificame Hub      | Webhook HTTP               |
| WebChat            | Embutido no sistema | Socket.io                  |
| Email              | SMTP configurável   | Nodemailer                 |

> **Nota:** Cada conexão WhatsApp roda como uma sessão independente vinculada a um número. O limite de conexões simultâneas é controlado via `CONNECTIONS_LIMIT` no `.env`.

---

## 8. Fluxo de uma Mensagem (WhatsApp)

```
Cliente envia mensagem
        │
        ▼
whatsapp-web.js captura o evento
        │
        ▼
Backend processa: identifica contato / cria ou busca ticket
        │
        ├──► Ticket novo? ──► Envia saudação do setor
        │
        ├──► Setor tem integração n8n? ──► Dispara webhook n8n
        │
        ├──► Setor tem OpenAI? ──► Resposta automática por IA
        │
        ▼
Mensagem salva no MySQL
        │
        ▼
Socket.io emite evento para o frontend em tempo real
        │
        ▼
Atendente visualiza e responde pelo painel
```

---

## 9. Autenticação e Permissões

### Autenticação de usuários (frontend)

- Login via `POST /auth/login` → retorna `token` (JWT) + `refreshToken`
- Token enviado no header `Authorization: Bearer <token>`
- Refresh automático via `POST /auth/refresh_token`

### Autenticação de API externa

- Token gerado pelo sistema em **Configurações > API Tokens**
- Enviado no header `x-api-token: <token>`
- Permissões granulares por recurso (contacts, messages, tickets)

### Perfis de usuário

| Perfil        | Capacidades                            |
| ------------- | -------------------------------------- |
| `user`        | Atende tickets do próprio setor        |
| `admin`       | Gerencia filas, usuários, conexões     |
| `masteradmin` | Acesso total, configurações do sistema |

---

## 10. Integrações Externas

### n8n

- Configurável **por setor/fila**
- Recebe webhook com payload do ticket/mensagem ao receber uma nova mensagem
- Permite criar fluxos customizados de automação (CRM, ERP, notificações)

### OpenAI

- Integração via API Key configurada no painel
- Usado para respostas automáticas inteligentes por setor
- Modelo configurável

### Notificame Hub

- Middleware externo que unifica canais (FB, IG, Telegram)
- Comunicação via Webhook bidirecional
- Press Ticket registra URL de webhook para receber mensagens

### Email (SMTP)

- Configuração via variáveis de ambiente ou painel
- Usado para notificações do sistema e atendimentos por email

---

## 11. Variáveis de Ambiente Principais

```env
# Ambiente
NODE_ENV=production

# URLs
BACKEND_URL=https://api.seudominio.com.br
FRONTEND_URL=https://app.seudominio.com.br
WEBHOOK=https://api.seudominio.com.br

# Banco de dados
DB_DIALECT=mysql
DB_HOST=localhost
DB_USER=press_user
DB_PASS=senha_segura
DB_NAME=press_ticket
DB_TIMEZONE=-03:00

# Autenticação JWT
JWT_SECRET=<chave_segura>
JWT_REFRESH_SECRET=<chave_segura>

# Limites
USER_LIMIT=10
CONNECTIONS_LIMIT=5

# Chrome (whatsapp-web.js)
CHROME_BIN=/usr/bin/google-chrome
```

---

## 12. Infraestrutura de Deploy

```
Internet
   │
   ▼
Nginx (porta 80/443 — SSL via Let's Encrypt)
   │
   ├──► /          ──► Frontend (porta 3333 — PM2: press-frontend)
   └──► /api       ──► Backend  (porta 8080 — PM2: press-backend)
                              │
                              ▼
                         MySQL 8.x
                     (porta 3306 — local)
```

### Processos PM2

| Nome             | Diretório   | Comando          |
| ---------------- | ----------- | ---------------- |
| `press-backend`  | `/backend`  | `npm start`      |
| `press-frontend` | `/frontend` | `node server.js` |

---

## 13. Modelo de Dados — Entidades Principais

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│   User   │────►│  Ticket  │◄────│ Contact  │
└──────────┘     └────┬─────┘     └──────────┘
                      │
            ┌─────────┼─────────┐
            │         │         │
      ┌─────▼──┐ ┌────▼───┐ ┌──▼──────┐
      │Message │ │ Queue  │ │  Tag    │
      └────────┘ └────────┘ └─────────┘
                      │
              ┌───────▼───────┐
              │  Whatsapp     │
              │  (conexão)    │
              └───────────────┘
```

---

## 14. Decisões de Arquitetura (ADRs resumidos)

| #       | Decisão                                           | Motivo                                                              |
| ------- | ------------------------------------------------- | ------------------------------------------------------------------- |
| ADR-001 | whatsapp-web.js em vez de API Oficial (Cloud API) | Custo zero, maior flexibilidade para múltiplas sessões              |
| ADR-002 | Notificame Hub para demais canais                 | Abstrai complexidade de cada API de canal                           |
| ADR-003 | MySQL como banco principal                        | Suporte Sequelize, familiaridade da equipe, hosting simples         |
| ADR-004 | Socket.io para realtime                           | Compatibilidade nativa com Node/Express, suporte a rooms por ticket |
| ADR-005 | PM2 como gerenciador de processos                 | Zero-downtime reload, logs integrados, cluster mode                 |
| ADR-006 | JWT com refresh token                             | Segurança sem perda de UX (sessões longas controladas)              |
| ADR-007 | react-i18next para traduções                      | Padrão de mercado, suporte a namespaces e lazy loading              |

---

## 15. Pontos de Atenção e Melhorias Futuras

| Item                 | Prioridade | Descrição                                           |
| -------------------- | ---------- | --------------------------------------------------- |
| Testes automatizados | 🔴 Alta    | Ausência de testes unitários e E2E                  |
| CI/CD pipeline       | 🔴 Alta    | Deploy ainda manual via SSH                         |
| Observabilidade      | 🟡 Média   | Sem rastreamento de erros centralizado (ex: Sentry) |
| Rate limiting de API | 🟡 Média   | Endpoints externos sem throttle configurado         |
| Healthcheck endpoint | 🟡 Média   | Sem rota de status para monitoramento externo       |
| Documentação Swagger | 🟢 Baixa   | Parcialmente implementado, necessita expansão       |

---

_Documento gerado como parte da iniciativa de documentação técnica do Press Ticket® — v1.16.1_
