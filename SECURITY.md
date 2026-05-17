# Política de Segurança

## Versões Suportadas

Apenas a versão mais recente do Press Ticket® recebe correções de segurança.

| Versão  | Suportada |
| ------- | --------- |
| Latest  | ✅ Sim    |
| Antigas | ❌ Não    |

## Reportando uma Vulnerabilidade

> ⚠️ **Não abra uma issue pública para reportar vulnerabilidades de segurança.**
> Issues públicas expõem o problema para todos antes que uma correção esteja disponível.

### Como reportar

O Press Ticket® utiliza o **GitHub Private Vulnerability Reporting** para receber reportes de segurança de forma confidencial.

Para reportar uma vulnerabilidade:

1. Acesse a aba **Security** do repositório
2. Clique em **"Report a vulnerability"**
3. Preencha o formulário descrevendo o problema

🔗 [Reportar vulnerabilidade de forma privada](https://github.com/rtenorioh/Press-Ticket/security/advisories/new)

---

### O que incluir no reporte

Para agilizar a análise, inclua o máximo de informações possível:

- **Descrição** do problema e do impacto potencial
- **Passos para reproduzir** o comportamento
- **Versão** do Press Ticket® afetada
- **Ambiente** (VPS, Docker, localhost)
- **Evidências** (logs, capturas de tela, PoC se houver)

---

## O que esperar após o reporte

| Prazo                | Ação                                                              |
| -------------------- | ----------------------------------------------------------------- |
| Até **3 dias úteis** | Confirmação de recebimento                                        |
| Até **7 dias úteis** | Avaliação inicial e classificação da severidade                   |
| Até **30 dias**      | Correção e publicação de nova versão (dependendo da complexidade) |

Você será notificado em cada etapa do processo.

---

## Divulgação coordenada

Pedimos que aguarde a publicação da correção antes de divulgar publicamente
a vulnerabilidade. Após a correção ser lançada, você será creditado no
**Security Advisory** do repositório, caso deseje.

---

## Escopo

### Dentro do escopo

- Vulnerabilidades no código do backend (`backend/src/`)
- Vulnerabilidades no código do frontend (`frontend/src/`)
- Falhas de autenticação ou autorização na API
- Exposição indevida de dados de usuários ou mensagens
- Injeção de código (SQL, command injection, XSS)

### Fora do escopo

- Vulnerabilidades em dependências de terceiros (reporte diretamente ao mantenedor da lib)
- Problemas de configuração do ambiente do usuário (Nginx, PM2, MySQL mal configurados)
- Issues já conhecidas e listadas publicamente
- Ataques que exigem acesso físico ao servidor

---

## Contato alternativo

Se tiver dificuldades com o GitHub Private Vulnerability Reporting, entre em
contato pelo grupo oficial no Telegram:

[![Telegram](https://img.shields.io/badge/telegram-online-blue.svg?style=for-the-badge&logo=telegram)](https://t.me/+akuzB2BzXitlMDkx)

---

_Obrigado por ajudar a manter o Press Ticket® seguro para todos os usuários._ 🔒
