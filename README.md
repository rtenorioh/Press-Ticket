# Press-Ticket®

<p align="center">
  <a href="https://www.codefactor.io/repository/github/rtenorioh/press-ticket"><img src="https://www.codefactor.io/repository/github/rtenorioh/press-ticket/badge" alt="CodeFactor" /></a>

  <a href="https://github.com/rtenorioh/Press-Ticket/actions/workflows/ci.yml">
    <img alt="CI" src="https://github.com/rtenorioh/Press-Ticket/actions/workflows/ci.yml/badge.svg">
  </a>

  <img alt="Repository size" src="https://img.shields.io/github/repo-size/rtenorioh/Press-Ticket">

  <a href="https://github.com/rtenorioh/Press-Ticket/commits/master">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/rtenorioh/Press-Ticket">
  </a>
      
   <a href="https://github.com/rtenorioh/Press-Ticket/stargazers">
    <img alt="Stargazers" src="https://img.shields.io/github/stars/rtenorioh/Press-Ticket">
  </a>

  <a href="https://github.com/rtenorioh/Press-Ticket/network">
    <img alt="GitHub forks" src="https://img.shields.io/github/forks/rtenorioh/Press-Ticket">
  </a>

  <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/rtenorioh/Press-Ticket">

  <img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/rtenorioh/Press-Ticket">

  <img alt="GitHub Release Date" src="https://img.shields.io/github/release-date/rtenorioh/Press-Ticket">
</p>

## Sobre

### Descrição do Sistema Press Ticket®

O sistema de multicanais "Press-Ticket" foi projetado para oferecer uma solução eficiente e integrada de suporte ao cliente, facilitando a comunicação e a gestão de tickets de atendimento diretamente pelos canais: WhatsApp (wwebjs), Facebook, Instagram, Telegram, e WebChat.

## Principais Funcionalidades

### 1. Gestão de Tickets:

- Criação, acompanhamento e resolução de tickets de suporte.
- Sistema de prioridade para organização de tickets.
- Histórico completo de interações com o cliente.

#### 2. Integração com WhatsApp (wwebjs), Facebook, Instagram, Telegram, e WebChat:

- Recebimento e envio de mensagens diretamente pelo WhatsApp.
- Suporte a mensagens de texto, imagens e documentos.

### 3. Interface de Usuário:

- Painel de controle intuitivo e fácil de usar.
- Visualização de tickets abertos, em andamento e fechados.
- Filtros e buscas para fácil localização de tickets.

### 4. Automação de Processos:

- Respostas rápidas para perguntas frequentes.
- Notificações automáticas para atualizações de tickets.
- Sistema de atribuição automática de tickets para agentes específicos.

### 5. Customização e Configuração:

- Configuração de horários de atendimento.
- Personalização de mensagens automáticas.
- Integração com outros sistemas e APIs.

## Tecnologias Utilizadas

### Backend

- **Runtime:** Node.js 22 com TypeScript
- **Framework:** Express
- **ORM:** Sequelize + MySQL 8
- **Realtime:** Socket.io
- **WhatsApp:** whatsapp-web.js
- **Demais canais:** Notificame Hub (via webhook)
- **Integrações:** OpenAI, n8n, E-mail (SMTP/IMAP)
- **Infraestrutura:** PM2 + Nginx + Ubuntu 22

### Frontend

- **Framework:** React + Vite
- **UI:** Material UI v6
- **Realtime:** Socket.io client
- **Internacionalização:** i18next

## 6. Benefícios

- Melhoria na Eficiência do Atendimento: Com a automação e a organização de tickets, os atendentes podem responder de maneira mais rápida e eficiente.
- Satisfação do Cliente: Respostas rápidas e precisas aumentam a satisfação do cliente.
- Facilidade de Uso: A interface intuitiva e as funcionalidades automáticas tornam o sistema fácil de usar tanto para os atendentes quanto para os clientes.

Este sistema é ideal para empresas que buscam melhorar seu atendimento ao cliente via WhatsApp (wwebjs), Facebook, Instagram, Telegram e WebChat, proporcionando uma experiência mais integrada e eficiente tanto para os clientes quanto para os agentes de suporte.

## Requisitos

| ---         | Mínimo | Recomendado | Testado |
| ----------- | ------ | ----------- | ------- |
| Node JS     | 22.x   | 22.x        | 22.x    |
| Ubuntu      | 20.x   | 22.x        | 22.x    |
| Memória RAM | 4Gb    | 6Gb         | 8Gb     |

## Referência

- O Sistema Press Ticket® foi desenvolvido em 13 de março de 2022, com base no [Sistema Whaticket Community](https://github.com/canove/whaticket-community), desenvolvido por [Cassio Santos](https://github.com/canove).

## Grupo no Telegram

<a href="https://t.me/+akuzB2BzXitlMDkx">
    <img alt="Telegram" src="https://img.shields.io/badge/telegram-online-blue.svg?style=for-the-badge&logo=telegram">
</a>

## Instalação

### Localhost

- [Local - Instalação Manual](https://github.com/rtenorioh/Press-Ticket/blob/main/docs/INSTALL_localhost.md); e
- [Local - Instalação com Docker](https://github.com/rtenorioh/Press-Ticket/blob/main/docs/INSTALL_localhost_docker.md).

### VPS

- [VPS - Instalação Manual](https://github.com/rtenorioh/Press-Ticket/blob/main/docs/INSTALL_MANUAL_VPS.md);
- [VPS - Instalação com Docker](https://github.com/rtenorioh/Press-Ticket/blob/main/docs/INSTALL_VPS_docker.md);
- [VPS - Instalador Automático](https://github.com/rtenorioh/Press-Ticket/blob/main/docs/INSTALL_AUTOMATICO_VPS.md); e
- [VPS - Atualizador Automático](https://github.com/rtenorioh/Press-Ticket/blob/main/docs/UPDATE_VPS.md).

### Extras

- [phpmyadmin](https://github.com/rtenorioh/Press-Ticket/blob/main/docs/INSTALL_phpmyadmin.md); e
- [Fuso Horário](https://github.com/rtenorioh/Press-Ticket/blob/main/docs/INSTALL_horarioVPS.md).

## Canais disponíveis:

- WhatsApp (wwebjs);
- Telegram;
- Facebook;
- Instagram;
- WebChat; e
- E-mail.

Para ativar **Facebook**, **Instagram**, **Telegram**, **WebChat** e **E-mail**:

1. [Realize seu cadastro aqui](https://hub.notificame.com.br/signup/registrar?from=@pressticket);
2. Adquira a quantidade desejada de canais usando o cupom de desconto: **PRESS40**;
3. Conecte aos canais que deseja ativar, seguindo as instruções ao conectar; e
4. Insira o token da sua Account na página de Configurações para finalizar a integração.

> Use o cupom de desconto oferece para 50% de desconto na compra dos canais!

## Telemetria Anônima

O Press Ticket® inclui um serviço opcional de telemetria que envia, a cada 12 horas, métricas básicas e anônimas da instalação para o servidor central do projeto. Os dados coletados são:

- Total de mensagens, tickets e usuários cadastrados.
- Quantidade de canais ativos por tipo (WhatsApp, WebChat, Facebook, Instagram, Telegram e E-mail).
- Versão do sistema instalada.

**Nenhum dado pessoal, conteúdo de mensagens ou informações de clientes é coletado.** O único identificador enviado é um token único gerado automaticamente na instalação, sem vínculo com dados pessoais.

O objetivo dessa coleta é gerar estatísticas agregadas de uso e prova social para a landing page do projeto.

### Como desativar

Para desabilitar a telemetria, edite o arquivo `backend/.env` e altere:

```
ALLOW_TELEMETRY=false
```

Se a variável não existir ou estiver definida como qualquer valor diferente de `true`, a telemetria **não será executada**.

---

## Como Contribuir

Contribuições são bem-vindas! Para contribuir:

1. Faça um **fork** do repositório
2. Crie uma branch para sua feature: `git checkout -b feature/minha-feature`
3. Faça commit das alterações: `git commit -m "feat: minha feature"`
4. Envie para o seu fork: `git push origin feature/minha-feature`
5. Abra um **Pull Request** descrevendo o que foi feito

Consulte os templates de [Bug Report e Feature Request](https://github.com/rtenorioh/Press-Ticket/issues/new/choose) para reportar problemas ou sugerir melhorias.

---

## Caso queira ajudar a manter o projeto, pode contribuir com uma das opções abaixo:

- Mensais:
  - Brasil:
    - Chave PIX:
    - ![49.700.429/0001.80](img/image.png)
    - CNPJ: 49.700.429/0001.80
  - Demais Países:
    - [Contribuir via Paypal](https://www.paypal.com/donate/?hosted_button_id=TY7GF22DBYZSA)

## Registro de todas as alterações:

- [Changelog](https://github.com/rtenorioh/Press-Ticket/blob/main/docs/CHANGELOG.md)

## Demo:

```bash
https://demo.pressticket.com.br
```

| User Type   | User                           | Password    |
| ----------- | ------------------------------ | ----------- |
| Admin       | admin@pressticket.com.br       | admin       |
| MasterAdmin | masteradmin@pressticket.com.br | masteradmin |

## Atividades Recentes [![Time period](https://images.repography.com/26937047/rtenorioh/Press-Ticket/recent-activity/21bd728a8e3625b547c91617b3f0fc2a_badge.svg)](https://github.com/rtenorioh/Press-Ticket)

[![Timeline graph](https://images.repography.com/26937047/rtenorioh/Press-Ticket/recent-activity/21bd728a8e3625b547c91617b3f0fc2a_timeline.svg)](https://github.com/rtenorioh/Press-Ticket/commits)
[![Pull request status graph](https://images.repography.com/26937047/rtenorioh/Press-Ticket/recent-activity/21bd728a8e3625b547c91617b3f0fc2a_prs.svg)](https://github.com/rtenorioh/Press-Ticket/pulls)

## Top contribuidores

[![Top contributors](https://images.repography.com/26937047/rtenorioh/Press-Ticket/top-contributors/21bd728a8e3625b547c91617b3f0fc2a_table.svg)](https://github.com/rtenorioh/Press-Ticket/graphs/contributors)

## Hospedagem Recomendada

<p align="center">
  <a href="https://painelcliente.com.br/aff.php?aff=55">
    <img src="img/hosteg1280x480.png" alt="Hosteg Hospedagem e Servidores" />
  </a>
</p>

A **[Hosteg](https://painelcliente.com.br/aff.php?aff=55)** (Hosteg Hospedagem e Servidores LTDA) é um provedor brasileiro focado em infraestrutura de alta performance, operando com rede própria e hardware de última geração.

### 📊 Informações Corporativas

- **Razão Social:** Hosteg Hospedagem e Servidores LTDA.
- **CNPJ:** 15.527.432/0001-22.
- **Sedes:** Bom Jesus do Itabapoana (RJ) e Içara (SC).
- **Infraestrutura de Rede:** Possui Sistema Autônomo próprio sob o ASN AS213738.

### 🚀 Diferenciais Técnicos

- **Armazenamento:** Tecnologia 100% NVMe em todos os planos, garantindo velocidades de I/O superiores.
- **Disponibilidade:** Uptime garantido de 99,99% em infraestrutura Tier 3.
- **Processamento:** Servidores equipados com processadores Intel Xeon, AMD Ryzen e AMD EPYC.
- **Software:** Utiliza LiteSpeed PRO (servidor web de alta eficiência) e painel de controle DirectAdmin.
- **Latência:** Média de 1ms no Brasil, com datacenters em São Paulo (SP), Rio de Janeiro (RJ) e Paraíba (PB).

### 🛠 Principais Serviços

| Serviço                  | Características                                                                   |
| :----------------------- | :-------------------------------------------------------------------------------- |
| **Hospedagem WordPress** | Otimizada com LiteSpeed e inclui Elementor PRO Original gratuito.                 |
| **Cloud VPS NVMe**       | Opções com vCPU dedicada ou compartilhada e snapshots inclusos.                   |
| **Cloud N8N**            | Ambiente pré-configurado para automações de workflow.                             |
| **Servidores Dedicados** | Soluções Baremetal e servidores focados em Inteligência Artificial (IA) com GPUs. |

### 🛡 Segurança e Suporte

- **Certificados:** SSL Gratuito para todos os domínios hospedados.
- **Proteção:** Anti-DDoS de alto nível e Antispam profissional inclusos.
- **Suporte:** Atendimento humanizado 24/7 com suporte via Anydesk para auxílio remoto em configurações críticas.
- **Migração:** Serviço de migração gratuita e assistida para novos clientes.
