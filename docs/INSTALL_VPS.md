# Manual de Instação do Press Ticket na VPS 

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

3. Instalando mysql server

```bash
apt install mysql-server
```

4. Verificando a versão do mysql server

```bash
mysql --version
```

5. Verificando o status do mysql server

```bash
sudo systemctl status mysql
```

6. Acessando o mysql server

```bash
sudo mysql -u root
```

7. Criando o BD

```bash
CREATE DATABASE pressticket CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

8. Acessar o BD do mysql

```bash
USE mysql;
```

9. Trocar plugin de autenticação no mysql

```bash
UPDATE user SET plugin='mysql_native_password' WHERE User='root';
```

10. Para garantir as mudanças, execute

```bash
FLUSH PRIVILEGES;
```

11. Sair do mysql

```bash
exit;
```

12. Reiniciar o mysql

```bash
service mysql restart
```

13. Alterando para root

```bash
sudo su root
```

14. Criar o usário deploy

```bash
adduser deploy
```

15. 
```bash
usermod -aG sudo deploy
```

16. Alterar para o novo usuário

```bash
su deploy
```

17. Realizar atualização e upgrade da VPS

```bash
sudo apt update && sudo apt upgrade
```

18. Realizar o download do node 16.x

```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
```

19. Instalar o node

```bash
sudo apt-get install -y nodejs
```

20. Instalação de libs

```bash
sudo apt install apt-transport-https ca-certificates curl software-properties-common git
```

21. Atualizando

```bash
sudo apt update
```

22. 
```bash 
sudo usermod -aG mysql ${USER}
```

23. Inserir a senha do deploy

```bash
su - ${USER}
```

24. Acessar o diretório raiz

```bash
cd ~
```

25. baixar o repositório do Press Ticket

```bash
git clone https://github.com/rtenorioh/Press-Ticket.git Press-Ticket
```

26. Copiar o env de exemplo para o backend

```bash
cp Press-Ticket/backend/.env.example Press-Ticket/backend/.env
```

27. Rodar o comando abaixo 2x para gerar JWT_SECRET e JWT_REFRESH_SECRET

```bash
openssl rand -base64 32
```

28. Editar os dados abaixo e colar os valores gerados no item 27.

```bash
NODE_ENV=  
BACKEND_URL=https://back.pressticket.com.br  
FRONTEND_URL=https://ticket.pressticket.com.br  
PORT=8080  
PROXY_PORT=443  
CHROME_BIN=/usr/bin/google-chrome-stable  
DB_DIALECT=mysql  
DB_HOST=localhost  
DB_TIMEZONE=-03:00   
DB_USER=root  
DB_PASS=  
DB_NAME=pressticket  
USER_LIMIT=3  
CONNECTIONS_LIMIT=1
JWT_SECRET=
JWT_REFRESH_SECRET=
```

29. Abrir para edição o arquivo .env com o comando abaixo e prencher com os dados acima.

```bash
nano Press-Ticket/backend/.env
```

30. Instação de libs

```bash
sudo apt-get install -y libgbm-dev wget unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils
```

31. Baixar o Chrome

```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
```

32. Instalar o Chrome

```bash
sudo apt install ./google-chrome-stable_current_amd64.deb
```

33. Acessando o backend

```bash
cd Press-Ticket/backend
```

34. Instalando as dependências

```bash
npm install
```

35. Buildando o backend

```bash
npm run build
```

36. Criando as tabelas no BD

```bash
npx sequelize db:migrate
```

37. Inserindo dados em algumas tabelas do BD

```bash
npx sequelize db:seed:all
```

38. Instalando o PM2

```bash
sudo npm install -g pm2
```

39. Iniciando o backend com PM2

```bash
pm2 start dist/server.js --name Press-Ticket-backend
```

40. 
```bash
pm2 startup ubuntu -u deploy
```

41.
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup ubuntu -u deploy --hp /home/deploy
```

42. Acessando o frontend

```bash
cd ../frontend
```

43. Instalando as dependências

```bash
npm install
```

44. Enditando o arquivo .env com o comando abaixo e prencher com os dados do item 45.

```bash
nano .env
```

45. 
```bash
REACT_APP_BACKEND_URL=https://back.pressticket.com.br 
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=
SERVER_PORT=3333
```

46. Criar o arquivo config.json com base no config.json.example

```bash
cp src/config.json.example src/config.json
```

47. Buildando o frontend

```bash
npm run build
```

48. Iniciando o frontend com PM2

```bash
pm2 start server.js --name Press-Ticket-frontend
```

49. Salvando os serviços iniciados pelo PM2

```bash
pm2 save
```

50. Listar os serviços iniciados pelo PM2

```bash
pm2 list
```

51. Instalar o nginx

```bash
sudo apt install nginx
```

52. Excluir o arquivo default do nginx

```bash
sudo rm -rf /etc/nginx/sites-enabled/default
```

53. Editar os dados abaixo com a URL que será usada para acessar o frontend.

```bash
server {  
  server_name ticket.pressticket.com.br;  
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

54. Criar e editar o arquivo Press-Ticket-frontend com o comando abaixo e prencher com os dados do item 52.

```bash
sudo nano /etc/nginx/sites-available/Press-Ticket-frontend
```

55. Criar uma cópia do arquivo Press-Ticket-frontend com o comando abaixo para criar o arquivo para o backend.

```bash
sudo cp /etc/nginx/sites-available/Press-Ticket-frontend /etc/nginx/sites-available/Press-Ticket-backend
```

56. Editar os dados abaixo com a URL que será usada para acessar o backend.

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

57. editar o arquivo Press-Ticket-backend com o comando abaixo e prencher com os dados do item 55.

```bash
sudo nano /etc/nginx/sites-available/Press-Ticket-backend
```
  
58. Acessar a pasta onde os arquivos foram criados

```bash
cd /etc/nginx/sites-available/
```

59. Listar para conferir se foram criados os arquivos

```bash
ls
```

60. Criar link simbólico para o arquivo Press-Ticket-frontend

```bash
sudo ln -s /etc/nginx/sites-available/Press-Ticket-frontend /etc/nginx/sites-enabled
```

61. Criar link simbólico para o arquivo Press-Ticket-backend

```bash
sudo ln -s /etc/nginx/sites-available/Press-Ticket-backend /etc/nginx/sites-enabled
```

62. Testar as configurações do nginx

```bash
sudo nginx -t
```

63. Restartar o nginx

```bash
sudo service nginx restart
```

64. Editar o arquivo de configuração do nginx com o comando abaixo e prencher com os dados do item 64.

```bash
sudo nano /etc/nginx/nginx.conf
```

65.
```bash
client_max_body_size 20M; # HANDLE BIGGER UPLOADS
```
 
66. Testar as configurações do nginx

```bash
sudo nginx -t
```

67. Restartar o nginx

```bash
sudo service nginx restart
```

68. Instalar o suporte a pacotes Snap

```bash
sudo apt-get install snapd
```

69. Instalar o pacote do notes

```bash
sudo snap install notes
```

70. Instalar o pacote do certbot(SSL)

```bash
sudo snap install --classic certbot
```

71. Rodar esse comando 2 vezes para gerar o certificado do backend e frontend

```bash
sudo certbot --nginx
```

72. Acessando diretório raiz

```bash
cd ~
```

73. Acessando a pasta do sistema

```bash
cd Press-Ticket/
```

73. Dentro da pasta do sistema rode o comando abaixo para executar a atualização

```bash
sh UPDATE.sh
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
