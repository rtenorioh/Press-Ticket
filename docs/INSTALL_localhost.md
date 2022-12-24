# Manual de Instação do Press Ticket em Localhost

OBS: Ter instalado o Banco de Dados, podendo usar o Xamp, o Wamp ou qualquer um de sua preferência.

================================================

1. Criar Banco de dados

```bash
CREATE DATABASE pressticket CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

2. Clonar o repositório

```bash
git clone https://github.com/rtenorioh/Press-Ticket.git Press-Ticket
```

3. Entrar no diretório backend do Press-Ticket

```bash
cd Press-Ticket/backend
```

4. Criar o arquivo .env e inserir as informações do item 5

5. Editar os dados que serão inseridos no arquivo .env

```bash
NODE_ENV=  
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
DB_NAME=pressticket 

USER_LIMIT=3  
CONNECTIONS_LIMIT=1

JWT_SECRET=5g1yk7pD9q3YL0iBEuUlPwOiWLj3I5tK+/rhHm+jgdE=  
JWT_REFRESH_SECRET=F2c8gag5nvqQkBOmOu5dWkK+gqZnjPUzHmx7S2tWkvs=
```

6. Instalar as dependências

```bash
npm install
```

7. Buildar o projeto

```bash
npm run build
```

8. Criar as tabelas no banco de dados

```bash
npx sequelize db:migrate
```

9. Popular o banco de dados

```bash 
npx sequelize db:seed:all
```

10. Rodar o servidor

```bash
npm start
```

11. Entrar no diretório frontend do Press-Ticket

```bash
cd Press-Ticket/frontend
``` 

12. Criar o arquivo .env e inserir as informações do item 13

13. Editar os dados que serão inseridos no arquivo .env

```bash
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=
PORT=3333
```  

14. Instalar as dependências

```bash
npm install
```

15. Rodar o servidor

```bash
npm start
```

OBS: Caso ao rodar o frontend der erro de ssl, usar o comando abaixo no terminal.
```bash
set NODE_OPTIONS=--openssl-legancy-provider
```

==============================================================

### Usuário padrão para acesso

* User: 
```bash
admin@pressticket.com.br  
```
* Password: 
```bash
admin
```