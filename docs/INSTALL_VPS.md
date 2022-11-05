# Manual de Instação do Press Ticket na VPS 

### Observação:
- Antes de começar a instalação é necessário ter criado antecipadamente os subdomínios e já estarem apontados para o IP da VPS.

================================================

1. Alterando para root

```sudo su root```

2. Acessando diretório raiz

```cd ~```

3. Instalando mysql server

```apt install mysql-server```

4. Verificando a versão do mysql server

```mysql --version```

5. Verificando o status do mysql server

```sudo systemctl status mysql```

6. Acessando o mysql server

```sudo mysql -u root```

7. Criando o BD

```CREATE DATABASE pressticket CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;```

8. Acessar o BD do mysql

```USE mysql;```

9. Trocar plugin de autenticação no mysql

```UPDATE user SET plugin='mysql_native_password' WHERE User='root';```

10. Para garantir as mudanças, execute

```FLUSH PRIVILEGES;```

11. Sair do mysql

```exit;```

12. Reiniciar o mysql

```service mysql restart```

13. Alterando para root

```sudo su root```

14. Criar o usário deploy

```adduser deploy```

15. ```usermod -aG sudo deploy```

16. Alterar para o novo usuário

```su deploy```

17. Realizar atualização e upgrade da VPS

```sudo apt update && sudo apt upgrade```

18. Realizar o download do node 16.x

```curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -```

19. Instalar o node

```sudo apt-get install -y nodejs```

20. Instalação de libs

```sudo apt install apt-transport-https ca-certificates curl software-properties-common git```

21. Atualizando

```sudo apt update```

22. ```sudo usermod -aG mysql ${USER}```

23. Inserir a senha do deploy

```su - ${USER}```

24. Acessar o diretório raiz

```cd ~```

25. baixar o repositório do Press Ticket

```git clone https://github.com/rtenorioh/Press-Ticket.git Press-Ticket```

26. Copiar o env de exemplo para o backend

```cp Press-Ticket/backend/.env.example Press-Ticket/backend/.env```

27. Rodar o comando abaixo 2x para gerar JWT_SECRET e JWT_REFRESH_SECRET

```openssl rand -base64 32```

28. Editar os dados abaixo e colar os valores gerados no item 27.

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

29. Abrir para edição o arquivo .env com o comando abaixo e prencher com os dados acima.

```nano Press-Ticket/backend/.env```

30. Instação de libs

```sudo apt-get install -y libgbm-dev wget unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils```

31. Baixar o Chrome

```wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb```

32. Instalar o Chrome

```sudo apt install ./google-chrome-stable_current_amd64.deb```

33. Acessando o backend

```cd Press-Ticket/backend```

34. Instalando as dependências

```npm install```

35. Buildando o backend

```npm run build```

36. Criando as tabelas no BD

```npx sequelize db:migrate```

37. Inserindo dados em algumas tabelas do BD

```npx sequelize db:seed:all```

38. Instalando o PM2

```sudo npm install -g pm2```

39. Iniciando o backend com PM2

```pm2 start dist/server.js --name Press-Ticket-backend```

40. ```pm2 startup ubuntu -u deploy```

41. ```sudo env PATH=$PATH:/usr/bin pm2 startup ubuntu -u deploy --hp /home/deploy```

42. Acessando o frontend

```cd ../frontend```

43. Instalando as dependências

```npm install```

44. Enditando o arquivo .env com o comando abaixo e prencher com os dados do item 45.

```nano .env```

45. 
```REACT_APP_BACKEND_URL=https://back.pressticket.com.br```  
```REACT_APP_HOURS_CLOSE_TICKETS_AUTO=```  
```SERVER_PORT=3333```  

46. Buildando o frontend

```npm run build```

47. Iniciando o frontend com PM2

```pm2 start server.js --name Press-Ticket-frontend```

48. Salvando os serviços iniciados pelo PM2

```pm2 save```

49. Listar os serviços iniciados pelo PM2

```pm2 list```

50. Instalar o nginx

```sudo apt install nginx```

51. Excluir o arquivo default do nginx

```sudo rm -rf /etc/nginx/sites-enabled/default```

52. Editar os dados abaixo com a URL que será usada para acessar o frontend.

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

53. Criar e editar o arquivo Press-Ticket-frontend com o comando abaixo e prencher com os dados do item 52.

```sudo nano /etc/nginx/sites-available/Press-Ticket-frontend```

54. Criar uma cópia do arquivo Press-Ticket-frontend com o comando abaixo para criar o arquivo para o backend.

```sudo cp /etc/nginx/sites-available/Press-Ticket-frontend /etc/nginx/sites-available/Press-Ticket-backend```

55. Editar os dados abaixo com a URL que será usada para acessar o backend.

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

56. editar o arquivo Press-Ticket-backend com o comando abaixo e prencher com os dados do item 55.

```sudo nano /etc/nginx/sites-available/Press-Ticket-backend```
  
57. Acessar a pasta onde os arquivos foram criados

```cd /etc/nginx/sites-available/```

58. Listar para conferir se foram criados os arquivos

```ls```

59. Criar link simbólico para o arquivo Press-Ticket-frontend

```sudo ln -s /etc/nginx/sites-available/Press-Ticket-frontend /etc/nginx/sites-enabled```

60. Criar link simbólico para o arquivo Press-Ticket-backend

```sudo ln -s /etc/nginx/sites-available/Press-Ticket-backend /etc/nginx/sites-enabled```

61. Testar as configurações do nginx

```sudo nginx -t```

62. Restartar o nginx

```sudo service nginx restart```

63. Editar o arquivo de configuração do nginx com o comando abaixo e prencher com os dados do item 64.

```sudo nano /etc/nginx/nginx.conf```

64. ```client_max_body_size 20M; # HANDLE BIGGER UPLOADS```
 
65. Testar as configurações do nginx

```sudo nginx -t```

66. Restartar o nginx

```sudo service nginx restart```

67. Instalar o suporte a pacotes Snap

```sudo apt-get install snapd```

68. Instalar o pacote do notes

```sudo snap install notes```

69. Instalar o pacote do certbot(SSL)

```sudo snap install --classic certbot```

70. Rodar esse comando 2 vezes para gerar o certificado do backend e frontend

```sudo certbot --nginx```

71. Acessando diretório raiz

```cd ~```

72. Acessando a pasta do sistema

```cd Press-Ticket/```

73. Dentro da pasta do sistema rode o comando abaixo para executar a atualização

```sh UPDATE.sh```

==============================================================

### Usuário padrão para acesso

* User: admin@pressticket.com.br  
* Password: admin