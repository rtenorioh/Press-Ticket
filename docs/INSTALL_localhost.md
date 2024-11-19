# Manual de Instalação do Press Ticket em Localhost

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
CREATE DATABASE press-ticket CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

#### 1.2. Se estiver usando XAMPP ou WAMPP, poderá criar o banco de dados via phpMyAdmin:

Acesse o phpMyAdmin através da URL:

```bash
http://localhost/phpmyadmin
```

E crie o banco de dados manualmente.

---

### 2. Clonar o repositório:

Para clonar o repositório do Press Ticket, use o seguinte comando no terminal:

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
WEBHOOK=https://true-melons-travel.loca.lt
BACKEND_URL=http://localhost
FRONTEND_URL=http://localhost:3333
PORT=8080
PROXY_PORT=8080
CHROME_BIN=C:\Program Files\Google\Chrome\Application\chrome.exe

DB_DIALECT=mysql
DB_HOST=localhost
DB_TIMEZONE=-03:00
DB_USER=root
DB_PASS=
DB_NAME=press-ticket

USER_LIMIT=3
CONNECTIONS_LIMIT=1

JWT_SECRET=5g1yk7pD9q3YL0iBEuUlPwOiWLj3I5tK+/rhHm+jgdE=
JWT_REFRESH_SECRET=F2c8gag5nvqQkBOmOu5dWkK+gqZnjPUzHmx7S2tWkvs=
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

```bash
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=
PORT=3333
```

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
