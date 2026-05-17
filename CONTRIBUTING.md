# Guia de Contribuição

Obrigado pelo interesse em contribuir com o Press Ticket®! 🎉

Este guia explica como configurar o ambiente local, os padrões do projeto e
o fluxo esperado para enviar contribuições.

---

## Índice

- [Código de Conduta](#código-de-conduta)
- [Como posso contribuir?](#como-posso-contribuir)
- [Configurando o ambiente local](#configurando-o-ambiente-local)
- [Padrão de branches](#padrão-de-branches)
- [Padrão de commits](#padrão-de-commits)
- [Abrindo um Pull Request](#abrindo-um-pull-request)
- [Dúvidas e suporte](#dúvidas-e-suporte)

---

## Código de Conduta

Ao contribuir, você concorda em manter um ambiente respeitoso e colaborativo.
Comentários ofensivos, discriminatórios ou hostis não serão tolerados.

---

## Como posso contribuir?

### 🐛 Reportar bugs

Use o template de **Bug Report** ao abrir uma issue:

🔗 [Abrir Bug Report](https://github.com/rtenorioh/Press-Ticket/issues/new?template=bug_report.yml)

Inclua sempre:

- Versão do Press Ticket® instalada
- Sistema operacional e versão do Node.js
- Passos para reproduzir o problema
- Comportamento esperado vs. comportamento atual
- Logs relevantes

### 💡 Sugerir melhorias

Use o template de **Feature Request**:

🔗 [Abrir Feature Request](https://github.com/rtenorioh/Press-Ticket/issues/new?template=feature_request.yml)

### 🔒 Reportar vulnerabilidades

**Não abra issues públicas para vulnerabilidades.** Consulte a
[Política de Segurança](./SECURITY.md).

### 💻 Enviar código

Leia as seções abaixo antes de abrir um Pull Request.

---

## Configurando o ambiente local

### Pré-requisitos

| Ferramenta | Versão mínima |
| ---------- | ------------- |
| Node.js    | 22.x          |
| npm        | 10.x          |
| MySQL      | 8.x           |
| Git        | 2.x           |

### Passo a passo

```bash
# 1. Faça um fork do repositório pelo GitHub

# 2. Clone o seu fork
git clone https://github.com/SEU_USUARIO/Press-Ticket.git
cd Press-Ticket

# 3. Adicione o repositório original como remote upstream
git remote add upstream https://github.com/rtenorioh/Press-Ticket.git

# 4. Configure e inicie o backend
cd backend
cp .env.example .env
# Edite o .env com suas configurações locais (banco, portas, etc.)
npm install
npm run dev

# 5. Configure e inicie o frontend (em outro terminal)
cd frontend
cp .env.example .env
# Edite o .env com a URL do backend
npm install
npm run dev
```

Consulte o guia completo de instalação local:
🔗 [Instalação em Localhost](./docs/INSTALL_localhost.md)

---

## Padrão de branches

Crie sempre uma branch a partir da `main` atualizada:

```bash
# Atualize seu fork antes de criar a branch
git checkout main
git pull upstream main

# Crie a branch com o padrão abaixo
git checkout -b tipo/descricao-curta
```

| Tipo        | Quando usar                  | Exemplo                       |
| ----------- | ---------------------------- | ----------------------------- |
| `feat/`     | Nova funcionalidade          | `feat/filtro-por-tags`        |
| `fix/`      | Correção de bug              | `fix/erro-conexao-whatsapp`   |
| `chore/`    | Manutenção, deps, configs    | `chore/atualiza-dependencias` |
| `docs/`     | Documentação                 | `docs/atualiza-readme`        |
| `refactor/` | Refatoração sem nova feature | `refactor/service-tickets`    |
| `style/`    | Formatação, lint             | `style/corrige-prettier`      |

---

## Padrão de commits

O projeto segue o padrão **Conventional Commits**:

```
tipo(escopo): descrição curta em português

[corpo opcional com mais detalhes]

[rodapé opcional — ex: Closes #123]
```

### Tipos permitidos

| Tipo       | Uso                       |
| ---------- | ------------------------- |
| `feat`     | Nova funcionalidade       |
| `fix`      | Correção de bug           |
| `chore`    | Tarefa de manutenção      |
| `docs`     | Documentação              |
| `refactor` | Refatoração               |
| `style`    | Formatação/lint           |
| `perf`     | Melhoria de performance   |
| `test`     | Adição/correção de testes |

### Exemplos

```bash
# ✅ Corretos
git commit -m "feat(tickets): adiciona filtro por período"
git commit -m "fix(whatsapp): corrige reconexão após queda"
git commit -m "docs(readme): atualiza lista de canais"
git commit -m "chore(deps): atualiza whatsapp-web.js para 1.26"

# ❌ Incorretos
git commit -m "ajustes"
git commit -m "fix bug"
git commit -m "WIP"
```

---

## Abrindo um Pull Request

Antes de abrir o PR, verifique:

```bash
# No diretório backend/
npx tsc --noEmit        # Zero erros de TypeScript
npm run lint            # Zero erros de ESLint
npm run build           # Build completo sem erros
```

### Checklist do PR

- [ ] Branch criada a partir da `main` atualizada
- [ ] Commits seguem o padrão Conventional Commits
- [ ] `tsc --noEmit` passou sem erros
- [ ] `npm run lint` passou sem erros
- [ ] `npm run build` (backend e frontend) passou sem erros
- [ ] Descrição do PR explica **o quê** e **por quê** foi alterado
- [ ] Issues relacionadas referenciadas (ex: `Closes #123`)

### Fluxo de review

1. Abra o PR com o template preenchido
2. O CI roda automaticamente — aguarde todos os checks passarem ✅
3. Aguarde o review — PRs sem atividade por 20 dias são fechados automaticamente
4. Aplique os ajustes solicitados se houver
5. Após aprovação, o merge é feito pelo mantenedor

---

## Dúvidas e suporte

Para dúvidas sobre o projeto ou sobre como contribuir, use o grupo oficial:

[![Telegram](https://img.shields.io/badge/telegram-online-blue.svg?style=for-the-badge&logo=telegram)](https://t.me/+akuzB2BzXitlMDkx)

---

_Toda contribuição, por menor que seja, é muito bem-vinda. Obrigado!_ 🙏
