# Arquiteto Digital - Instalação personalizada PressTicket 

Na Instalação personalizada foram realizadas customizações específicas, conforme descrito abaixo, atendendo necessidades dos nossos clientes.
Mantendo o fork original do https://github.com/rtenorioh/Press-Ticket podemos atualizar o projeto sem perder personalizações.


## Modificações realizadas

- Retirada da função buscar na tela de tickets
- Retirada da opção de desmarcar a assinatura ao responder mensagens
- Personalização do logo e texto da tela inicial


## Referência e Contribuição 

Contribuições são sempre bem-vindas e devem ser realizadas ao desenvolvedor do projeto!

- [PressTicket](https://github.com/rtenorioh/Press-Ticket)
 - [Contribua com o Projeto PressTicket](https://github.com/rtenorioh/Press-Ticket#caso-queira-ajudar-a-manter-o-projeto-pode-contribuir-com-uma-das-op%C3%A7%C3%B5es-abaixo) 

## Instalação Servidor - Executar apenas uma vez

Atualizando servidor e instalando pacotes básicos. 
Os passos abaixo devem ser executados apenas em um novo servidor
```shell
    sudo apt update
    sudo apt upgrade
    sudo apt install mysql-server
    curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
    sudo apt-get install -y nodejs
    sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
    sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
    sudo apt-get install -y libxshmfence-dev libgbm-dev wget unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils google-chrome-stable
    sudo npm install -g pm2
    sudo apt install nginx
    sudo rm /etc/nginx/sites-enabled/default
    sudo snap install --classic certbot
    sudo apt update
    sudo apt upgrade
    adduser deploy
    usermod -aG sudo deploy
```
Configurar senha segura para o usuário root do MySQL e criando um usuário para o PressTicket
```shell
mysql -u root -p   
```
No prompt do MySQL executar os comandos abaixo
```mysql
mysql> ALTER USER 'root'@'localhost' IDENTIFIED BY 'SENHA_UNICA_ROOT';
mysql> CREATE USER 'USUARIO_DB_PRESSTICKET'@'%' IDENTIFIED BY 'SENHA_UNICA_USER_PRESSTICKET';
mysql> FLUSH PRIVILEGES;
mysql> exit;
```
Aumentando as configurações de memória do MySQL
```shell
nano /etc/mysql/my.cnf
```
Adicionar as linhas abaixo ao arquivo my.cfn

```shell
[mysqld]
max_heap_table_size=128M
tmp_table_size=128M
innodb_buffer_pool_size=1024M
```

Referência para as variáveis acima
| Variável | Valor |
| -------- | ----- | 
| max_heap_table_size | 64M para cada 1Gb de RAM |
| tmp_table_size | 64M para cada 1Gb de RAM |
| tmp_table_size | Máximo de 80% do total de RAM da máquina. Mas limitar a 50% para dividir a RAM com demais aplicações |

Aumentando o limite de upload do nginx
```shell
sudo nano /etc/nginx/nginx.conf
```
Adicionar o parâmetro client_max_body_size dentro da seção http
```Nginx configuration file
http {
    ...
    client_max_body_size 50M;
}
```
Criando usuário deploy e parametrizando seu ambiente
```shell
su deploy
su - ${USER}
cd ~
sudo env PATH=\$PATH:/usr/bin pm2 startup ubuntu -u deploy --hp /home/deploy
```

## Instalação da instância do PressTicket

### Comandos devem ser executados a cada Instância.
Observações Importantes
- Incrementar o número das portas 8080 e 3333 em 1 para cada instalação
    - Ex.: Primeira instalação portas 8080 e 3333, segunda instalação porta 8081 e 3334
- Atenção a substituição dos parâmetros em maiúsculo nos comandos por nomes correspondentes. 
    - Ex.: `PASTA_DA_INSTALACAO`, substituir por `clienteabc`
    - Ex.: `BACKEND_URL`, substituir por `api.arquitetodigital.com.br`
- O comando para criar a chave JWT é executado 2 vezes, pois a chave é utilizada nas variáveis `JWT_REFRESH_SECRET` e `JWT_SECRET`
- Usar HTTPS nas URLs de backend e frontend

Criar banco MySQL
```shell
mysql -u root -p   
```
No prompt do MySQL executar os comandos abaixo
```mysql
mysql> CREATE DATABASE NOME_DO_DB_CLIENTE;
mysql> GRANT ALL ON  NOME_DO_DB_CLIENTE.* TO 'USUARIO_DB_PRESSTICKET'@'%';
mysql> FLUSH PRIVILEGES;
mysql> exit;
```

Baixando os arquivos de instalação e executando a instalação. 
Copiar as chaves JWT
```shell
su deploy
cd ~
git clone https://github.com/LCarneiroAD/Press-Ticket PASTA_DA_INSTALACAO
cd PASTA_DA_INSTALACAO
cd backend
```
Criando as variáveis JWT_SECRET e JWT_REFRESH_SECRET

Copie a resposta dos 2 comandos abaixo e adicione ao arquivo .env conforme orientação na tabela
```shell 
node -e "console.log(require('crypto').randomBytes(32).toString('base64'));"
node -e "console.log(require('crypto').randomBytes(32).toString('base64'));"
```
Criando e editando o arquivo .env para ajustes
```shell
cp .env.example .env
nano .env
```
Alterar o arquivo .env, substituindo as variáveis indicadas na tabela pelo valor apropriado
| Variável | Valor |
| -------- | ----- | 
| BACKEND_URL | https://BACKEND_URL |
| FRONTEND_URL | https://FRONTEND_URL |
| PORT | 8080 |
| PROXY_PORT | 443 |
| CHROME_BIN | /usr/bin/google-chrome-stable |
| DB_HOST | localhost |
| DB_TIMEZONE | -03:00 |
| DB_USER | USUARIO_DB_PRESSTICKET |
| DB_PASS | SENHA_UNICA_USER_PRESSTICKET |
| DB_NAME | NOME_DO_DB_CLIENTE |
| USER_LIMIT | 10 |
| CONNECTIONS_LIMIT | 2 |
| JWT_SECRET | CHAVE_JWT_1 |
| JWT_REFRESH_SECRET | CHAVE_JWT_2 |

Executar a instalação do PressTicket
Obs.: Após o comando `npx sequelize db:seed:all` o bash fica em modo console, após a mensagem de servidor iniciado é preciso digitar CRLT + C para voltar ao bash
```shell
npm install
npm run build
npx sequelize db:migrate
npx sequelize db:seed:all
npm start
pm2 start dist/server.js --name PASTA_DA_INSTALACAO-backend
cd ../frontend
cp .env.example .env
nano .env
```

Alterar o arquivo .env, substituindo as variáveis indicadas na tabela pelo valor apropriado
| Variável | Valor |
| -------- | ----- | 
| REACT_APP_BACKEND_URL | https://BACKEND_URL |
| REACT_APP_HOURS_CLOSE_TICKETS_AUTO |  |
| SERVER_PORT | 3333 |

Continuando a instalação
```shell
npm install
npm run build
pm2 start server.js --name PASTA_DA_INSTALACAO-frontend
pm2 save
pm2 list

sudo nano /etc/nginx/sites-available/FRONTEND_URL
```
Colocar o conteúdo abaixo no arquivo /etc/nginx/sites-available/FRONTEND_URL
```Nginx configuration file
server {
  server_name FRONTEND_URL;

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
Criando o arquivo de configuração do backend no nginx
```shell
sudo nano /etc/nginx/sites-available/BACKEND_URL
```
Colocar o conteúdo abaixo no arquivo /etc/nginx/sites-available/BACKEND_URL
```Nginx configuration file
server {
  server_name BACKEND_URL;

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
Criando links simbólicos para os sites disponíveis em habilitados
Obs.: Atenção ao comando `nginx -t`. Se der erro revise o conteúdo dos arquivos em sites-available
```shell
sudo ln -s /etc/nginx/sites-available/FRONTEND_URL /etc/nginx/sites-enabled
sudo ln -s /etc/nginx/sites-available/BACKEND_URL /etc/nginx/sites-enabled
sudo nginx -t
sudo service nginx restart
sudo apt update
sudo certbot --nginx
```

