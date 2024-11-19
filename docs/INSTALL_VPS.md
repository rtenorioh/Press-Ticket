# Manual de Instalação do Press Ticket na VPS

### Observação:

- Antes de começar a instalação, é necessário ter criado os subdomínios e garantir que estejam apontados para o IP da VPS.

---

## Seção 1: Preparação Inicial

### 1.1 Alterando para root

```bash
sudo su root
```

### 1.2 Acessando o diretório raiz

```
cd ~
```

### 1.3 Atualizando e fazendo upgrade da VPS

```
sudo apt update && sudo apt upgrade
```

## Seção 2: Instalação do MySQL

### 2.1 Instalando MySQL Server

```
apt install mysql-server
```

### 2.2 Verificando a versão do MySQL Server (opcional)

```
mysql --version
```

### 2.3 Verificando o status do MySQL Server

```
sudo systemctl status mysql
```

### 2.4 Saindo da visualização de status do MySQL

Pressione `CTRL + C` para sair.

### 2.5 Acessando o MySQL Server

```
sudo mysql -u root
```

### 2.6 Criando o banco de dados

```
CREATE DATABASE press_ticket CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

### 2.7 Acessar o banco de dados do MySQL

```
USE mysql;
```

### 2.8 Alterando o plugin de autenticação do MySQL

```
UPDATE user SET plugin='mysql_native_password' WHERE User='root';
```

### 2.9 Aplicando as mudanças

```
FLUSH PRIVILEGES;
```

### 2.10 Saindo do MySQL

```
exit;
```

### 2.11 Reiniciando o MySQL

```
service mysql restart
```

## Seção 3: Configuração do Usuário

### 3.1 Criando o usuário deploy

```
adduser deploy
```

### 3.2 Dar privilégios de superusuário ao usuário deploy

```
usermod -aG sudo deploy
```

### 3.3 Alterando para o novo usuário deploy

```
su deploy
```

## Seção 4: Instalação do Node.js e Dependências

### 4.1 Baixando Node.js 20.x

```
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```

### 4.2 Instalando Node.js

```
sudo apt-get install -y nodejs
```

### 4.3 Instalando bibliotecas adicionais

```
sudo apt install apt-transport-https ca-certificates curl software-properties-common git ffmpeg
```

### 4.4 Atualizando

```
sudo apt update
```

### 4.5 Adicionar o usuário atual ao grupo mysql, permitindo que ele tenha permissões adicionais para acessar os recursos do MySQL

```
sudo usermod -aG mysql ${USER}
```

### 4.6 Realizar a "troca de login" para o usuário atual, carregando as variáveis de ambiente e configurações de login como se o usuário tivesse feito um novo login.

```bash
su - ${USER}
```

## Seção 5: Instalação do Chrome e Dependências

### 5.1 Instalando bibliotecas necessárias para o Chrome

```
sudo apt-get install -y libgbm-dev wget unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils
```

### 5.2 Baixando o Google Chrome

```
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
```

### 5.3 Instalando o Google Chrome

```
sudo apt install ./google-chrome-stable_current_amd64.deb
```

## Seção 5: Instalação do Press Ticket

### 6.1 Baixando o repositório do Press Ticket

```
git clone https://github.com/rtenorioh/Press-Ticket.git Press-Ticket
```

## Seção 7: Configuração do Backend

### 7.2 Gerando as chaves JWT_SECRET e JWT_REFRESH_SECRET (rodar o comando duas vezes)

```
openssl rand -base64 32
```

### 7.3 Editar os dados abaixo usando suas informações e os valores gerados pelo comando anterior.

```bash
NODE_ENV=

#URLs e Portas
BACKEND_URL=https://back.pressticket.com.br
FRONTEND_URL=https://ticket.pressticket.com.br
WEBHOOK=https://back.pressticket.com.br
PORT=8080
PROXY_PORT=443

#Caminho do Chrome
CHROME_BIN=/usr/bin/google-chrome-stable

#Dados de acesso ao Banco de dados
DB_DIALECT=mysql
DB_HOST=localhost
DB_TIMEZONE=-03:00
DB_USER=root
DB_PASS=
DB_NAME=press_ticket

#Limitar Usuários e Conexões
USER_LIMIT=3
CONNECTIONS_LIMIT=1

#ID do PM2 do Frontend e Backend para poder ser restartado na tela de Conexões
PM2_FRONTEND=0
PM2_BACKEND=1

#Modo DEMO que evita alterar algumas funções, para ativar: ON
DEMO=OFF

#Permitir a rotação de tokens
JWT_SECRET=JYszCWFNE0kmbbb0w/dvMl66zDd1GZozzaC27dKOCDY=
JWT_REFRESH_SECRET=FwJXkGgXv7ARfxPRb7/6RdNmtXJlR4PsQvvw8VIbOho=
```

### 7.4 Editando o arquivo .env

Abra o arquivo .env e preencha com as informações geradas:

```
nano Press-Ticket/backend/.env
```

### 7.5 Acessando o diretório do backend

```
cd Press-Ticket/backend
```

### 7.6 Instalando as dependências

```
npm install
```

### 7.7 Compilando o backend

```
npm run build
```

### 7.8 Criando as tabelas no banco de dados

```
npx sequelize db:migrate
```

### 7.9 Inserindo dados nas tabelas

```
npx sequelize db:seed:all
```

### 7.10 Instalando o PM2

```
sudo npm install -g pm2
```

### 7.11 Inicia o backend usando PM2, atribuindo o nome "Press-Ticket-backend" ao processo

```
pm2 start dist/server.js --name Press-Ticket-backend
```

### 7.12 Configura o PM2 para que todos os processos gerenciados por ele iniciem automaticamente quando o Ubuntu for reiniciado, usando o usuário deploy

```
pm2 startup ubuntu -u deploy
```

### 7.13 Configura o PM2 para iniciar automaticamente no boot do sistema, usando o usuário deploy e garantindo que o PATH esteja configurado corretamente

```
sudo env PATH=$PATH:/usr/bin pm2 startup ubuntu -u deploy --hp /home/deploy
```

## Seção 8: Configuração do Frontend

### 8.1 Acessando o diretório do frontend

```
cd ../frontend
```

### 8.2 Instalando as dependências

```
npm install
```

### 8.3 Editar os dados abaixo usando suas informações

```bash
#URL BACKEND
REACT_APP_BACKEND_URL=https://back.pressticket.com.br

#Tempo de encerramento automático dos tickets em horas
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=

#PORTA do frontend
PORT=3333

#Para permitir acesso apenas do MasterAdmin (sempre ON)
REACT_APP_MASTERADMIN=OFF
```

### 8.4 Editando o arquivo .env do frontend usando os dados do item 8.3

```
nano .env
```

### 8.5 Compilando o frontend

```
npm run build
```

### 8.6 Iniciando o frontend com PM2

```
pm2 start server.js --name Press-Ticket-frontend
```

### 8.7 Salvando os serviços iniciados pelo PM2

```
pm2 save
```

### 8.8 Listar os serviços iniciados pelo PM2

```
pm2 list
```

## Seção 9: Configuração do Nginx

### 9.1 Instalando o Nginx

```
sudo apt install nginx
```

### 9.2 Criando e editando o arquivo de configuração do frontend

```
sudo nano /etc/nginx/sites-available/Press-Ticket-frontend
```

Preencha com as informações abaixo:

```
server {
  server_name front.pressticket.com.br;
  location / {
    proxy_pass http://127.0.0.1:3333;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
  }
}
```

### 9.3 Criando e editando o arquivo de configuração do backend

```
sudo nano /etc/nginx/sites-available/Press-Ticket-backend
```

Preencha com as informações abaixo:

```
server {
  server_name back.pressticket.com.br;
  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
  }
}
```

### 9.4 Acessar a pasta onde os arquivos foram criados

```
cd /etc/nginx/sites-available/
```

### 9.5 Listar para conferir se foram criados corretamente os arquivos

```
ls
```

### 9.6 Criando links simbólicos

Frontend

```
sudo ln -s /etc/nginx/sites-available/Press-Ticket-frontend /etc/nginx/sites-enabled
```

Backend

```
sudo ln -s /etc/nginx/sites-available/Press-Ticket-backend /etc/nginx/sites-enabled
```

### 9.7 Acessar a pasta onde os links foram criados

```
cd /etc/nginx/sites-enabled/
```

### 9.8 Listar para conferir se foram criados corretamente os links

```
ls
```

### 9.9 Testando o Nginx

```
sudo nginx -t
```

### 9.10 Reiniciando o Nginx

```
sudo service nginx restart
```

### 9.11 Editar o arquivo de configuração do nginx com o comando abaixo e preencher com os dados do item 9.12

```
sudo nano /etc/nginx/nginx.conf
```

### 9.12 Incluir no arquivos de configuração do nginx dentro do http no item 9.11

```
client_max_body_size 50M;
```

### 9.13 Testando o Nginx

```
sudo nginx -t
```

### 9.14 Reiniciando o Nginx

```
sudo service nginx restart
```

## Seção 10: Instalação de Certificado SSL

### 10.1 Instalando suporte a Snap e Certbot

```
sudo apt-get install snapd
```

### 10.2 Instalar o pacote do notes

```
sudo snap install notes
```

### 10.3 Instalar o pacote do certbot(SSL)

```
sudo snap install --classic certbot
```

### 10.2 Gerando certificado SSL para backend e frontend

Executar o comando e ativar o certificado SSL separadamente para cada um dos subdomínios.

```
sudo certbot --nginx
```

---

# Seção 11: Usuário padrão para Acesso

Usuário:

```
admin@pressticket.com.br
```

Senha:

```
admin
```

# Seção 12: Usuário Master para Acesso

Usuário:

```
masteradmin@pressticket.com.br
```

Senha:

```
masteradmin
```
