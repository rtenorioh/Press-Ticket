# Manual de Instalação do Press Ticket® em Localhost

### Programas Essenciais:

- **Node JS**
- **GIT**
- **XAMPP ou WAMPP**
- **IDE** (ATOM, Sublime Text, VS Code ou outro da sua escolha)

---

## Passos para a Instalação

### 1. Criar o Banco de Dados

#### 1.1. Via Comando SQL:

Execute o seguinte comando no seu terminal para criar o banco de dados:

```bash
CREATE DATABASE press_ticket CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

#### 1.2. Se estiver usando XAMPP ou WAMPP, poderá criar o banco de dados via phpMyAdmin:

Acesse o phpMyAdmin através da URL:

```bash
http://localhost/phpmyadmin
```

E crie o banco de dados manualmente.

---

### 2. Clonar o repositório:

Para clonar o repositório do Press Ticket®, use o seguinte comando no terminal:

```bash
git clone https://github.com/rtenorioh/Press-Ticket.git Press-Ticket
```

---

### 3. Entrar no diretório backend do Press-Ticket:

Após clonar o repositório, entre no diretório `backend` usando o comando:

```bash
cd Press-Ticket/backend
```

---

### 4. Editar as informações no arquivo `.env`:

Crie ou edite o arquivo `.env` no diretório `backend` com as seguintes informações:

```bash
NODE_ENV=

#Nome da Instalação
COMPANY_NAME=press_ticket

#Nome do Dispositivo
DEVICE_NAME=

#URLs e Portas
WEBHOOK=https://ninety-yaks-trade.loca.lt
BACKEND_URL=http://localhost
FRONTEND_URL=http://localhost:3000
PORT=4000
PROXY_PORT=4000

#Caminho do Chrome
CHROME_BIN=C:\Program Files\Google\Chrome\Application\chrome.exe

#Dados de acesso ao Banco de dados
DB_DIALECT=mysql
DB_HOST=localhost
DB_TIMEZONE=-03:00
DB_USER=root
DB_PASS=
DB_NAME=press_ticket

#Limitar Usuários e Conexões
USER_LIMIT=3
CONNECTIONS_LIMIT=5

#Modo DEMO que evita alterar algumas funções, para ativar: ON
DEMO=OFF

#Permitir a rotação de tokens
JWT_SECRET=JYszCWFNE0kmbbb0w/dvMl66zDd1GZozzaC27dKOCDY=
JWT_REFRESH_SECRET=FwJXkGgXv7ARfxPRb7/6RdNmtXJlR4PsQvvw8VIbOho=
```

---

### 5. Criar o arquivo `.env` e inserir as informações do item 4.

Se o arquivo `.env` ainda não existir, crie um novo arquivo e insira as informações listadas no item 4.

---

### 6. Instalar as dependências:

Instale as dependências necessárias do projeto executando o seguinte comando no terminal:

```bash
npm install
```

---

### 7. Buildar o projeto:

Para compilar o projeto, execute o seguinte comando:

```bash
npm run build
```

---

### 8. Criar as tabelas no banco de dados:

Execute as migrações para criar as tabelas no banco de dados:

```bash
npx sequelize db:migrate
```

---

### 9. Popular o banco de dados:

Popule o banco de dados com os dados iniciais executando o comando:

```bash
npx sequelize db:seed:all
```

---

### 10. Rodar o servidor:

Inicie o servidor backend com o seguinte comando:

```bash
npm start
```

---

### 11. Entrar no diretório frontend do Press-Ticket:

Agora, vá para o diretório `frontend` do Press-Ticket com o seguinte comando:

```bash
cd Press-Ticket/frontend
```

---

### 12. Editar as informações no arquivo `.env`:

Crie ou edite o arquivo `.env` no diretório `frontend` com as seguintes informações:

**IMPORTANTE**: Em localhost, defina `NODE_ENV=development` para que o `server.js` ative automaticamente os **Security Headers** via Helmet (já que não há Nginx em desenvolvimento).

```bash
#Ambiente (development para localhost)
NODE_ENV=development

#URL BACKEND
REACT_APP_BACKEND_URL=http://localhost:4000

#Tempo de encerramento automático dos tickets em horas
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=

#PORTA do frontend
PORT=3000

# Para permitir acesso apenas do MasterAdmin (sempre ON)
REACT_APP_MASTERADMIN=ON

```

**Nota sobre Security Headers em Localhost**:
- Com `NODE_ENV=development`, o `server.js` automaticamente habilita os security headers via Helmet
- O Content-Security-Policy permite conexões com `localhost:*` (qualquer porta)
- Isso garante segurança mesmo em ambiente de desenvolvimento
- Em produção (VPS), o Nginx gerencia os headers e o `server.js` os desabilita automaticamente

---

### 13. Criar o arquivo `.env` e inserir as informações do item 12.

Se o arquivo `.env` ainda não existir, crie um novo arquivo e insira as informações listadas no item 12.

---

### 14. Instalar as dependências:

No diretório `frontend`, instale as dependências com o comando:

```bash
npm install
```

---

### 15. Rodar o servidor:

Para iniciar o servidor frontend, execute o seguinte comando:

```bash
npm start
```

---

## Usuário Padrão para Acesso:

Utilize o seguinte usuário e senha para acessar o sistema:

- **Usuário**:

```bash
admin@pressticket.com.br
```

- **Senha**:

```bash
admin
```

---

# Usuário Master para Acesso

Usuário:

```
masteradmin@pressticket.com.br
```

Senha:

```
masteradmin
```

---

## Verificação de Security Headers em Localhost

### Como Funciona em Desenvolvimento

Em ambiente de desenvolvimento (localhost), o `server.js` detecta automaticamente que `NODE_ENV=development` e habilita os security headers via Helmet.

### Testar Headers em Localhost

Após iniciar o frontend, você pode verificar os headers:

```bash
curl -I http://localhost:3000/ | grep -i "x-frame\|content-security\|permissions"
```

**Você deve ver**:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=()...`
- `Content-Security-Policy: default-src 'self'...`

### Diferenças entre Desenvolvimento e Produção

| Aspecto | Localhost (Development) | VPS (Production) |
|---------|------------------------|------------------|
| **Headers gerenciados por** | Helmet (server.js) | Nginx |
| **CSP connect-src** | `localhost:*` (qualquer porta) | URL específica do backend |
| **Configuração** | Automática via NODE_ENV | Nginx + server.js |

### Logs do server.js

Ao iniciar o frontend em localhost, você verá:

```
🔧 Modo Desenvolvimento: Security headers gerenciados pelo Helmet
Server is running on port 3000
```

Isso confirma que os headers estão sendo enviados pelo Helmet.

### Benefícios em Desenvolvimento

- ✅ **Headers automáticos**: Não precisa configurar Nginx local
- ✅ **CSP flexível**: Permite conexões com qualquer porta do localhost
- ✅ **Testes realistas**: Mesmo comportamento de segurança da produção
- ✅ **Sem configuração extra**: Funciona out-of-the-box

**Nota**: Quando você fizer deploy para produção (VPS), basta mudar `NODE_ENV=production` e o sistema automaticamente desabilita os headers no Helmet, deixando o Nginx gerenciar tudo!
