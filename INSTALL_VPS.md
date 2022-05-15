# Manual de Instação do Press Ticket na VPS 

### Observação:
- Antes de começar a instalação é necessário ter criado antecipadamente os subdomínios e já estarem apontados para o IP da VPS.

================================================

1. ```sudo su root```

2. ```cd ~```

3. ```apt install mysql-server```

4. ```mysql --version```

5. ```sudo systemctl status mysql```

6. ```sudo mysql -u root```

7. mysql> ```CREATE DATABASE pressticket CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;```

8. mysql> ```USE mysql;```

9. mysql> ```UPDATE user SET plugin='mysql_native_password' WHERE User='root';```

10. mysql> ```FLUSH PRIVILEGES;```

11. mysql> ```exit;```

12. ```service mysql restart```

13. ```sudo su root```

14. ```adduser deploy```

15. ```usermod -aG sudo deploy```

16. ```su deploy```

17. ```sudo apt update && sudo apt upgrade```

18. ```curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -```

19. ```sudo apt-get install -y nodejs```

20. ```sudo apt install apt-transport-https ca-certificates curl software-properties-common```

21. ```sudo apt update```

22. ```sudo usermod -aG mysql ${USER}```

23. ```su - ${USER}```

24. ```cd ~```

25. ```git clone https://github.com/rtenorioh/Press-Ticket.git Press-Ticket```

26. ```cp Press-Ticket/backend/.env.example Press-Ticket/backend/.env```

27. Rodar o comando abaixo 2x para gerar JWT_SECRET e JWT_REFRESH_SECRET

```openssl rand -base64 32```

28. Editar os dados abaixo e colar os valores gerados no item 27.

NODE_ENV=  
BACKEND_URL=https://back.pypress.com.br  
FRONTEND_URL=https://ticket.pypress.com.br  
PORT=8080  
PROXY_PORT=443  
CHROME_BIN=/usr/bin/google-chrome-stable  
DB_DIALECT=mysql  
DB_HOST=localhost  
DB_USER=root  
DB_PASS=  
DB_NAME=pressticket  
USER_LIMIT=3  
CONNECTIONS_LIMIT=1   
JWT_SECRET=  
JWT_REFRESH_SECRET=  

29. Abrir para edição o arquivo .env com o comando abaixo e prencher com os dados acima.

```nano Press-Ticket/backend/.env```

30. ```sudo apt-get install -y libgbm-dev wget unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils```

31. ```wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb```

32. ```sudo apt install ./google-chrome-stable_current_amd64.deb```

33. ```cd Press-Ticket/backend```

34. ```npm install```

35. ```npm run build```

36. ```npx sequelize db:migrate```

37. ```npx sequelize db:seed:all```

38. ```sudo npm install -g pm2```

39. ```pm2 start dist/server.js --name Press-Ticket-backend```

40. ```pm2 startup ubuntu -u deploy```

41. ```sudo env PATH=$PATH:/usr/bin pm2 startup ubuntu -u deploy --hp /home/deploy```

42. ```cd ../frontend```

43. ```npm install```

44. ```nano .env```

45. ```REACT_APP_BACKEND_URL=https://back.pypress.com.br```

46. ```npm run build```

47. ```pm2 start server.js --name Press-Ticket-frontend```

48. ```pm2 save```

49. ```pm2 list```

50. ```sudo apt install nginx```

51. ```sudo rm /etc/nginx/sites-enabled/default```

52. ```sudo nano /etc/nginx/sites-available/Press-Ticket-frontend```

53. 
server {  
  server_name ticket.pypress.com.br;  
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

54. ```sudo cp /etc/nginx/sites-available/Press-Ticket-frontend /etc/nginx/sites-available/Press-Ticket-backend```

55. ```sudo nano /etc/nginx/sites-available/Press-Ticket-backend```

56.
server {  
  server_name back.pypress.com.br;  
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
  
57. ```cd /etc/nginx/sites-available/```

58. ```ls```

59. ```sudo ln -s /etc/nginx/sites-available/Press-Ticket-frontend /etc/nginx/sites-enabled```

60. ```sudo ln -s /etc/nginx/sites-available/Press-Ticket-backend /etc/nginx/sites-enabled```

61. ```sudo nginx -t```

62. ```sudo service nginx restart```

63. ```sudo nano /etc/nginx/nginx.conf```

64. ```client_max_body_size 20M; # HANDLE BIGGER UPLOADS```
 
65. ```sudo nginx -t```

66. ```sudo service nginx restart```

67. ```sudo apt-get install snapd```

68. ```sudo snap install notes```

69. ```sudo snap install --classic certbot```

70. ```sudo certbot --nginx```

==============================================================

### Usuário padrão para acesso

* User: admin@pypress.com.br  
* Password: admin