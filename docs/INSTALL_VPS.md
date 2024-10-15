# Manual de Instalação do Press Ticket na VPS

### Observação:

- Antes de começar a instalação é necessário ter criado antecipadamente os subdomínios e já estarem apontados para o IP da VPS.

================================================

1. Alterando para root

```bash
sudo su root
```

2. Acessando diretório raiz

```bash
cd ~
```

3. Realizar atualização e upgrade da VPS

```bash
sudo apt update && sudo apt upgrade
```

4. Instalando mysql server

```bash
apt install mysql-server
```

5. Verificando a versão do mysql server (opcional)

```bash
mysql --version
```

6. Verificando o status do mysql server

```bash
sudo systemctl status mysql
```

7. Para sair da visualização de status do mysql tecle

```bash
CTRL + C
```

8. Acessando o mysql server

```bash
sudo mysql -u root
```

9. Criando o BD

```bash
CREATE DATABASE press_ticket CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

10. Acessar o BD do mysql

```bash
USE mysql;
```

11. Trocar plugin de autenticação no mysql

```bash
UPDATE user SET plugin='mysql_native_password' WHERE User='root';
```

12. Para garantir as mudanças, execute

```bash
FLUSH PRIVILEGES;
```

13. Sair do mysql

```bash
exit;
```

14. Reiniciar o mysql

```bash
service mysql restart
```

15. Criar o usuário deploy

```bash
adduser deploy
```

```bash
usermod -aG sudo deploy
```

16. Alterar para o novo usuário

```bash
su deploy
```

17. Realizar o download do node 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```

18. Instalar o node

```bash
sudo apt-get install -y nodejs
```

19. Instalação de libs

```bash
sudo apt install apt-transport-https ca-certificates curl software-properties-common git ffmpeg
```

20. Atualizando

```bash
sudo apt update
```

21.

```bash
sudo usermod -aG mysql ${USER}
```

22. Inserir a senha do deploy

```bash
su - ${USER}
```

23. Acessar o diretório raiz

```bash
cd ~
```

24. baixar o repositório do Press Ticket

```bash
git clone https://github.com/rtenorioh/Press-Ticket.git Press-Ticket
```

25. Rodar o comando abaixo 2x para gerar JWT_SECRET e JWT_REFRESH_SECRET

```bash
openssl rand -base64 32
```

26. Editar os dados abaixo e colar os valores gerados no item 27.

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

27. Abrir para edição o arquivo .env com o comando abaixo e preencher com os dados acima.

```bash
nano Press-Ticket/backend/.env
```

28. Instalação de libs

```bash
sudo apt-get install -y libgbm-dev wget unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils
```

29. Baixar o Chrome

```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
```

30. Instalar o Chrome

```bash
sudo apt install ./google-chrome-stable_current_amd64.deb
```

31. Acessando o backend

```bash
cd Press-Ticket/backend
```

32. Instalando as dependências

```bash
npm install
```

33. Buildando o backend

```bash
npm run build
```

34. Criando as tabelas no BD

```bash
npx sequelize db:migrate
```

35. Inserindo dados em algumas tabelas do BD

```bash
npx sequelize db:seed:all
```

36. Instalando o PM2

```bash
sudo npm install -g pm2
```

37 Iniciando o backend com PM2

```bash
pm2 start dist/server.js --name Press-Ticket-backend
```

```bash
pm2 startup ubuntu -u deploy
```

```bash
sudo env PATH=$PATH:/usr/bin pm2 startup ubuntu -u deploy --hp /home/deploy
```

38. Acessando o frontend

```bash
cd ../frontend
```

39. Instalando as dependências

```bash
npm install
```

40. Editando o arquivo .env com o comando abaixo e preencher com os dados do item 45.

```bash
nano .env
```

41. Editar os dados abaixo e colar os valores gerados no item 41.

```bash
#URL BACKEND
REACT_APP_BACKEND_URL=https://back.pressticket.com.br

#Tempo de encerramento automático dos tickets
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=

#Nome da Guia do navegador
REACT_APP_PAGE_TITLE=PressTicket

#PORTA do frontend
PORT=3333
```

42. Criar o arquivo config.json com base no config.json.example

```bash
cp src/config.json.example src/config.json
```

43. Buildando o frontend

```bash
npm run build
```

44. Iniciando o frontend com PM2

```bash
pm2 start server.js --name Press-Ticket-frontend
```

45. Salvando os serviços iniciados pelo PM2

```bash
pm2 save
```

46. Listar os serviços iniciados pelo PM2

```bash
pm2 list
```

47. Instalar o nginx

```bash
sudo apt install nginx
```

48. Editar os dados abaixo com a URL que será usada para acessar o frontend.

```bash
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

49. Criar e editar o arquivo Press-Ticket-frontend com o comando abaixo e preencher com os dados do item 49.

```bash
sudo nano /etc/nginx/sites-available/Press-Ticket-frontend
```

50. Editar os dados abaixo com a URL que será usada para acessar o backend.

```bash
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

51. editar o arquivo Press-Ticket-backend com o comando abaixo e preencher com os dados do item 51.

```bash
sudo nano /etc/nginx/sites-available/Press-Ticket-backend
```

52. Acessar a pasta onde os arquivos foram criados

```bash
cd /etc/nginx/sites-available/
```

53. Listar para conferir se foram criados os arquivos

```bash
ls
```

54. Criar link simbólico para o arquivo Press-Ticket-frontend

```bash
sudo ln -s /etc/nginx/sites-available/Press-Ticket-frontend /etc/nginx/sites-enabled
```

55. Criar link simbólico para o arquivo Press-Ticket-backend

```bash
sudo ln -s /etc/nginx/sites-available/Press-Ticket-backend /etc/nginx/sites-enabled
```

56. Acessar a pasta onde os links foram criados

```bash
cd /etc/nginx/sites-available/
```

57. Listar para conferir se foram criados os links

```bash
ls
```

58. Testar as configurações do nginx

```bash
sudo nginx -t
```

59. Restartar o nginx

```bash
sudo service nginx restart
```

60. Editar o arquivo de configuração do nginx com o comando abaixo e preencher com os dados do item 64.

```bash
sudo nano /etc/nginx/nginx.conf
```

61. Incluir no arquivo do item 64

```bash
client_max_body_size 20M; # HANDLE BIGGER UPLOADS
```

62. Testar as configurações do nginx

```bash
sudo nginx -t
```

63. Restartar o nginx

```bash
sudo service nginx restart
```

64. Instalar o suporte a pacotes Snap

```bash
sudo apt-get install snapd
```

65. Instalar o pacote do notes

```bash
sudo snap install notes
```

66. Instalar o pacote do certbot(SSL)

```bash
sudo snap install --classic certbot
```

67. Rodar esse comando 2 vezes para gerar o certificado do backend e frontend

```bash
sudo certbot --nginx
```

==============================================================

### Usuário padrão para acesso

- User:

```bash
admin@pressticket.com.br
```

- Password:

```bash
admin
```
