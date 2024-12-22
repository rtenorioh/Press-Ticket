#!/bin/bash

# Função para exibir uso correto do script
show_usage() {
    echo "Uso: curl -sSL https://install.pressticket.com.br | sudo bash -s <SENHA_DEPLOY> <NOME_EMPRESA> <URL_BACKEND> <URL_FRONTEND> <PORT_BACKEND> <PORT_FRONTEND> <USER_LIMIT> <CONNECTION_LIMIT> <EMAIL>"
    echo "Exemplo: curl -sSL https://install.pressticket.com.br | sudo bash -s 'senha123' 'empresa' 'back.pressticket.com.br' 'front.pressticket.com.br' 8080 3333 3 10 'admin@pressticket.com.br'"
    exit 1
}

# Verifica se todos os parâmetros foram fornecidos
if [ "$#" -ne 9 ]; then
    echo "Erro: Número insuficiente de parâmetros fornecidos."
    echo ""
    show_usage
fi

# Recebe os parâmetros
SENHA_DEPLOY="$1"
NOME_EMPRESA="$2"
URL_BACKEND="$3"
URL_FRONTEND="$4"
PORT_BACKEND="$5"
PORT_FRONTEND="$6"
USER_LIMIT="$7"
CONNECTION_LIMIT="$8"
EMAIL="$9"

# Verifica se o script está sendo executado como root
if [ "$(id -u)" -ne 0 ]; then
    echo -e "\e[31mErro: Este script precisa ser executado como root.\e[0m"
    exit 1
fi

# Define o diretório base absoluto
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

# Define diretórios de logs usando caminhos absolutos
LOG_DIR="$SCRIPT_DIR/log"
CURRENT_LOG_DIR="$LOG_DIR/atual"
ARCHIVED_LOG_DIR="$LOG_DIR/arquivos"

# Cria os diretórios de log
if ! mkdir -p "$CURRENT_LOG_DIR" "$ARCHIVED_LOG_DIR"; then
    echo "Erro: Não foi possível criar os diretórios de log. Verifique as permissões."
    exit 1
fi

COLOR="\e[38;5;92m"
GREEN="\e[32m"
RED="\e[31m"
RESET="\e[0m"
BOLD="\e[1m"

echo -e " "
echo -e "${COLOR}██████╗ ██████╗ ███████╗███████╗███████╗    ████████╗██╗ ██████╗██╗  ██╗███████╗████████╗${RESET}"
echo -e "${COLOR}██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝    ╚══██╔══╝██║██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝${RESET}"
echo -e "${COLOR}██████╔╝██████╔╝█████╗  ███████╗███████╗       ██║   ██║██║     █████╔╝ █████╗     ██║   ${RESET}"
echo -e "${COLOR}██╔═══╝ ██╔══██╗██╔══╝  ╚════██║╚════██║       ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   ${RESET}"
echo -e "${COLOR}██║     ██║  ██║███████╗███████║███████║       ██║   ██║╚██████╗██║  ██╗███████╗   ██║   ${RESET}"
echo -e "${COLOR}╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝       ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ${RESET}"
echo -e "${GREEN}INICIANDO INSTALAÇÃO PARA A EMPRESA:${RESET} ${BOLD}$NOME_EMPRESA${RESET}"
echo -e " "

sleep 3

# Exibir mensagem com a lista de fusos horários
echo "O fuso horário padrão está definido como 'America/Sao_Paulo'."
echo ""
echo "Caso deseje usar outro fuso horário, utilize o comando abaixo para ver a lista completa:"
echo ""
echo "    timedatectl list-timezones"
echo ""
echo "Para parar a execução atual e rodar o comando acima, pressione 'CTRL + C'."
echo "Depois de escolher o fuso horário desejado, execute novamente o script informando o fuso como parâmetro."
echo ""
echo "Por exemplo, para usar o fuso horário 'Asia/Kolkata', execute:"
echo ""
echo "    curl -sSL https://update.pressticket.com.br | sudo bash -s -- Asia/Kolkata"
echo ""

# Pausa para o usuário ler a mensagem
sleep 10

# Compactação de logs antigos usando zip
if find "$CURRENT_LOG_DIR" -type f -mtime +30 | grep -q .; then
    zip -j "$ARCHIVED_LOG_DIR/logs_$(date +'%d-%m-%Y').zip" "$CURRENT_LOG_DIR"/* -x "*.zip"
    if [ $? -eq 0 ]; then
        echo "Logs antigos compactados com sucesso em $ARCHIVED_LOG_DIR/logs_$(date +'%d-%m-%Y').zip"
        # Remove os arquivos compactados após o sucesso
        find "$CURRENT_LOG_DIR" -type f -mtime +30 -exec rm {} \;
    else
        echo "Erro ao compactar os logs antigos."
    fi
else
    echo "Nenhum log antigo encontrado para compactar."
fi

# Captura o fuso horário passado como argumento ou usa America/Sao_Paulo} como padrão
SELECTED_TZ=${1:-America/Sao_Paulo}

# Configuração do arquivo de log (ajustado para usar o fuso horário)
LOG_FILE="$CURRENT_LOG_DIR/install_$NOME_EMPRESA_$(TZ=$SELECTED_TZ date +"%d-%m-%Y_%H-%M-%S").log"

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

sudo rm -f /var/lib/dpkg/updates/* | tee -a "$LOG_FILE"
sudo dpkg --configure -a | tee -a "$LOG_FILE"

# Seção 1: Preparação Inicial
echo -e "${COLOR}Preparação Inicial...${RESET}" | tee -a "$LOG_FILE"

# Atualizando e fazendo upgrade da VPS
echo "Atualizando pacotes do sistema..." | tee -a "$LOG_FILE"
sudo apt-get update && sudo apt-get upgrade -y | tee -a "$LOG_FILE"

# Seção 2: Instalação do MySQL
echo -e "${COLOR}Instalando MySQL...${RESET}" | tee -a "$LOG_FILE"
sudo apt-get install -y mysql-server | tee -a "$LOG_FILE"

# Configurando banco de dados
# Verificando se o MySQL Server está instalado
echo -e "${COLOR}Verificando a instalação do MySQL Server...${RESET}" | tee -a "$LOG_FILE"
if ! command -v mysql &>/dev/null; then
    echo -e "${RED}MySQL Server não encontrado. Instalando...${RESET}" | tee -a "$LOG_FILE"
    sudo apt-get update && sudo apt-get install -y mysql-server | tee -a "$LOG_FILE"
    if [ $? -eq 0 ] && command -v mysql &>/dev/null; then
        echo -e "${GREEN}MySQL Server instalado com sucesso!${RESET}" | tee -a "$LOG_FILE"
    else
        echo -e "${RED}Erro ao instalar o MySQL Server.${RESET}" | tee -a "$LOG_FILE"
        exit 1
    fi
else
    echo -e "${GREEN}MySQL Server já está instalado.${RESET}" | tee -a "$LOG_FILE"
fi

# Verificando se o banco de dados já existe
echo -e "${COLOR}Verificando existência do banco de dados: ${RESET}$NOME_EMPRESA" | tee -a "$LOG_FILE"
DB_EXISTS=$(sudo mysql -u root -e "SHOW DATABASES LIKE '$NOME_EMPRESA';" | grep "$NOME_EMPRESA")

if [ "$DB_EXISTS" ]; then
    echo -e "${YELLOW}O banco de dados '$NOME_EMPRESA' já existe. Nenhuma ação necessária.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${BOLD}Criando banco de dados:${RESET} $NOME_EMPRESA" | tee -a "$LOG_FILE"
    sudo mysql -u root <<MYSQL_SCRIPT
CREATE DATABASE $NOME_EMPRESA CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
MYSQL_SCRIPT
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Banco de dados criado com sucesso!${RESET}" | tee -a "$LOG_FILE"
    else
        echo -e "${RED}Erro ao criar o banco de dados.${RESET}" | tee -a "$LOG_FILE"
        exit 1
    fi
fi

# Alterando configurações do plugin de autenticação do MySQL
echo -e "${BOLD}Alterando configurações do plugin de autenticação do MySQL...${RESET}" | tee -a "$LOG_FILE"
sudo mysql -u root <<MYSQL_SCRIPT
USE mysql;
UPDATE user SET plugin='mysql_native_password' WHERE User='root';
FLUSH PRIVILEGES;
MYSQL_SCRIPT

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Configurações de autenticação atualizadas com sucesso!${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao atualizar as configurações de autenticação.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Reiniciando o serviço MySQL
echo -e "${BOLD}Reiniciando o serviço MySQL...${RESET}" | tee -a "$LOG_FILE"
sudo service mysql restart | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Serviço MySQL reiniciado com sucesso!${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao reiniciar o serviço MySQL.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Seção 3: Configuração do Usuário
echo -e "${GREEN}Verificando a existência do usuário 'deploy'...${RESET}" | tee -a "$LOG_FILE"
if id "deploy" &>/dev/null; then
    echo -e "${GREEN}Usuário 'deploy' já existe. Acessando como 'deploy'...${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${YELLOW}Usuário 'deploy' não encontrado. Criando o usuário 'deploy'...${RESET}" | tee -a "$LOG_FILE"
    sudo adduser deploy --gecos "" --disabled-password | tee -a "$LOG_FILE"
    echo "deploy:$SENHA_DEPLOY" | sudo chpasswd | tee -a "$LOG_FILE"
    sudo usermod -aG sudo deploy | tee -a "$LOG_FILE"
    echo -e "${GREEN}Usuário 'deploy' criado com sucesso.${RESET}" | tee -a "$LOG_FILE"
fi

# Configurações para evitar interação durante o acesso
echo -e "${GREEN}Acessando como 'deploy'...${RESET}" | tee -a "$LOG_FILE"
sudo -u deploy -i <<EOF
# Qualquer comando necessário para ser executado como 'deploy' pode ser inserido aqui
exit
EOF

# Seção 4: Instalação do Node.js e Dependências
echo -e "${COLOR}Instalando Node.js e dependências...${RESET}" | tee -a "$LOG_FILE"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs apt-transport-https ca-certificates curl software-properties-common git ffmpeg | tee -a "$LOG_FILE"

# Instalando a última versão do npm
echo -e "${COLOR}Atualizando para a última versão do npm...${RESET}" | tee -a "$LOG_FILE"
sudo npm install -g npm@latest | tee -a "$LOG_FILE"

# Exibindo as versões instaladas
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)

echo -e "${GREEN}Node.js instalado na versão:${RESET} $NODE_VERSION" | tee -a "$LOG_FILE"
echo -e "${GREEN}npm atualizado para a versão:${RESET} $NPM_VERSION" | tee -a "$LOG_FILE"

# Adicionando o usuário ao grupo mysql
sudo usermod -aG mysql "${USER}"

# Automatizando o comando su com expect
if ! command -v expect &>/dev/null; then
    echo "Instalando a ferramenta 'expect' para automação..." | tee -a "$LOG_FILE"
    sudo apt-get install -y expect | tee -a "$LOG_FILE"
fi

echo -e "${COLOR}Automatizando o login como usuário '${USER}'...${RESET}" | tee -a "$LOG_FILE"

expect <<EOF
spawn su - ${USER}
expect "Password:"
send "${SENHA_DEPLOY}\n"
interact
EOF

# Seção 5: Instalação do Chrome e Dependências
echo -e "${COLOR}Instalando Google Chrome e dependências...${RESET}" | tee -a "$LOG_FILE"
sudo apt-get install -y libgbm-dev wget unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils | tee -a "$LOG_FILE"
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt-get install ./google-chrome-stable_current_amd64.deb | tee -a "$LOG_FILE"

# Deletar o arquivo .deb após a instalação
if [ -f google-chrome-stable_current_amd64.deb ]; then
    rm google-chrome-stable_current_amd64.deb
    echo -e "${GREEN}Arquivo google-chrome-stable_current_amd64.deb removido com sucesso!${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${YELLOW}Arquivo google-chrome-stable_current_amd64.deb não encontrado para remoção.${RESET}" | tee -a "$LOG_FILE"
fi

# Seção 6: Baixando Press Ticket
echo -e "${COLOR}Verificando se o diretório do repositório já existe...${RESET}" | tee -a "$LOG_FILE"

if [ -d "$NOME_EMPRESA" ]; then
    echo -e "${YELLOW}O diretório '$NOME_EMPRESA' já existe. O repositório não será clonado.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${COLOR}Baixando repositório do Press Ticket...${RESET}" | tee -a "$LOG_FILE"
    git clone https://github.com/rtenorioh/Press-Ticket.git "$NOME_EMPRESA" | tee -a "$LOG_FILE"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Repositório clonado com sucesso!${RESET}" | tee -a "$LOG_FILE"
    else
        echo -e "${RED}Erro ao clonar o repositório. Verifique sua conexão ou as permissões.${RESET}" | tee -a "$LOG_FILE"
        exit 1
    fi
fi

# Configurando Backend
echo -e "${COLOR}Configurando Backend...${RESET}" | tee -a "$LOG_FILE"

BACKEND_DIR="$NOME_EMPRESA/backend"

# Verifica se o diretório do backend existe
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}Erro: O diretório '$BACKEND_DIR' não existe.${RESET}" | tee -a "$LOG_FILE"
    exit 1
else
    echo -e "${GREEN}Diretório '$BACKEND_DIR' encontrado. Prosseguindo com a instalação...${RESET}" | tee -a "$LOG_FILE"
fi

# Navega para o diretório do backend
cd $BACKEND_DIR

# Gera os valores de JWT_SECRET e JWT_REFRESH_SECRET
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

if [ -z "$JWT_SECRET" ] || [ -z "$JWT_REFRESH_SECRET" ]; then
    echo "Erro: Não foi possível gerar os valores JWT_SECRET e JWT_REFRESH_SECRET." | tee -a "$LOG_FILE"
    exit 1
fi

# Validando variáveis antes do uso
if [ -z "$JWT_REFRESH_SECRET" ] || [ -z "$URL_BACKEND" ] || [ -z "$JWT_SECRET" ] || [ -z "$PORT_BACKEND" ]; then
    echo "Erro: Uma ou mais variáveis obrigatórias estão vazias." | tee -a "$LOG_FILE"
    exit 1
fi

# Gera o arquivo .env
cat >.env <<EOF
NODE_ENV=production
BACKEND_URL=https://$URL_BACKEND
FRONTEND_URL=https://$URL_FRONTEND
WEBHOOK=https://$URL_BACKEND
PORT=$PORT_BACKEND
PROXY_PORT=443
CHROME_BIN=/usr/bin/google-chrome-stable
DB_DIALECT=mysql
DB_HOST=localhost
DB_TIMEZONE=-03:00
DB_USER=root
DB_PASS=
DB_NAME=$NOME_EMPRESA
USER_LIMIT=$USER_LIMIT
CONNECTIONS_LIMIT=$CONNECTION_LIMIT
PM2_FRONTEND=0
PM2_BACKEND=1
DEMO=OFF
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
EOF

echo -e "${GREEN}Arquivo .env criado com sucesso em: $ENV_FILE${RESET}" | tee -a "$LOG_FILE"

npm install | tee -a "$LOG_FILE"
npm run build | tee -a "$LOG_FILE"
npx sequelize db:migrate | tee -a "$LOG_FILE"
npx sequelize db:seed:all | tee -a "$LOG_FILE"

# Instalação do PM2
echo -e "${COLOR}Verificando se o PM2 está instalado...${RESET}" | tee -a "$LOG_FILE"

if command -v pm2 &>/dev/null; then
    echo -e "${GREEN}PM2 já está instalado. Prosseguindo...${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${YELLOW}PM2 não encontrado. Instalando...${RESET}" | tee -a "$LOG_FILE"
    sudo npm install -g pm2 | tee -a "$LOG_FILE"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}PM2 instalado com sucesso!${RESET}" | tee -a "$LOG_FILE"
    else
        echo -e "${RED}Erro ao instalar o PM2. Verifique os logs acima.${RESET}" | tee -a "$LOG_FILE"
        exit 1
    fi
fi

pm2 start dist/server.js --name $NOME_EMPRESA-back | tee -a "$LOG_FILE"
sudo env PATH=$PATH:/usr/bin pm2 startup ubuntu -u deploy --hp /home/deploy

# Configurando Frontend
echo -e "${COLOR}Configurando Frontend...${RESET}" | tee -a "$LOG_FILE"
cd ../frontend

cat >.env <<EOF
REACT_APP_BACKEND_URL=https://$URL_BACKEND
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=
PORT=$PORT_FRONTEND
REACT_APP_MASTERADMIN=ON
EOF

npm install | tee -a "$LOG_FILE"
npm run build | tee -a "$LOG_FILE"
pm2 start server.js --name $NOME_EMPRESA-front | tee -a "$LOG_FILE"
pm2 save | tee -a "$LOG_FILE"

# Configurando Nginx
echo -e "${COLOR}Configurando Nginx...${RESET}" | tee -a "$LOG_FILE"

# Instalação do Nginx
echo -e "${COLOR}Verificando se o Nginx está instalado...${RESET}" | tee -a "$LOG_FILE"

if command -v nginx &>/dev/null; then
    echo -e "${GREEN}Nginx já está instalado. Prosseguindo...${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${YELLOW}Nginx não encontrado. Instalando...${RESET}" | tee -a "$LOG_FILE"
    sudo apt-get install nginx -y | tee -a "$LOG_FILE"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Nginx instalado com sucesso!${RESET}" | tee -a "$LOG_FILE"
    else
        echo -e "${RED}Erro ao instalar o Nginx. Verifique os logs acima.${RESET}" | tee -a "$LOG_FILE"
        exit 1
    fi
fi

cat >/etc/nginx/sites-available/$NOME_EMPRESA-front <<EOF
server {
  server_name $URL_FRONTEND;
  location / {
    proxy_pass http://127.0.0.1:$PORT_FRONTEND;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_cache_bypass \$http_upgrade;
  }
}
EOF

cat >/etc/nginx/sites-available/$NOME_EMPRESA-back <<EOF
server {
  server_name $URL_BACKEND;
  location / {
    proxy_pass http://127.0.0.1:$PORT_BACKEND;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_cache_bypass \$http_upgrade;
  }
}
EOF

sudo ln -s /etc/nginx/sites-available/$NOME_EMPRESA-front /etc/nginx/sites-enabled
sudo ln -s /etc/nginx/sites-available/$NOME_EMPRESA-back /etc/nginx/sites-enabled
sudo nginx -t | tee -a "$LOG_FILE"
sudo service nginx restart | tee -a "$LOG_FILE"

# Adiciona configuração no nginx.conf
echo -e "${GREEN}Verificando configuração 'client_max_body_size' no Nginx...${RESET}" | tee -a "$LOG_FILE"

# Verifica se a configuração já existe no arquivo nginx.conf
if grep -q "client_max_body_size 50M;" /etc/nginx/nginx.conf; then
    echo -e "${GREEN}A configuração 'client_max_body_size 50M;' já está presente no arquivo nginx.conf.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${YELLOW}A configuração 'client_max_body_size 50M;' não foi encontrada. Aplicando ajuste...${RESET}" | tee -a "$LOG_FILE"
    sudo sed -i '/http {/a \    client_max_body_size 50M;' /etc/nginx/nginx.conf | tee -a "$LOG_FILE"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}A configuração 'client_max_body_size 50M;' foi adicionada com sucesso no arquivo nginx.conf.${RESET}" | tee -a "$LOG_FILE"
    else
        echo -e "${RED}Erro ao adicionar a configuração 'client_max_body_size 50M;' no arquivo nginx.conf.${RESET}" | tee -a "$LOG_FILE"
        exit 1
    fi
fi

# Testa e reinicia o Nginx
sudo nginx -t | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Testes do Nginx bem-sucedidos! Reiniciando...${RESET}" | tee -a "$LOG_FILE"
    sudo service nginx restart | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro na configuração do Nginx. Verifique os logs.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Instalação de Certificado SSL
echo -e "${COLOR}Verificando a instalação do Certbot...${RESET}" | tee -a "$LOG_FILE"

# Verifica se o certbot está instalado
if command -v certbot &>/dev/null; then
    echo -e "${GREEN}Certbot já está instalado no sistema.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${YELLOW}Certbot não encontrado. Instalando dependências e Certbot...${RESET}" | tee -a "$LOG_FILE"
    sudo apt-get install snapd -y | tee -a "$LOG_FILE"
    sudo snap install --classic certbot | tee -a "$LOG_FILE"
    if command -v certbot &>/dev/null; then
        echo -e "${GREEN}Certbot instalado com sucesso!${RESET}" | tee -a "$LOG_FILE"
    else
        echo -e "${RED}Erro ao instalar o Certbot. Verifique os logs para mais informações.${RESET}" | tee -a "$LOG_FILE"
        exit 1
    fi
fi

# Executa o comando para gerar o certificado SSL
echo -e "${COLOR}Gerando o certificado SSL para os domínios: $URL_BACKEND e $URL_FRONTEND...${RESET}" | tee -a "$LOG_FILE"
sudo certbot -m "$EMAIL" \
    --nginx \
    --agree-tos \
    --non-interactive \
    --domains "$URL_BACKEND,$URL_FRONTEND" | tee -a "$LOG_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Certificado SSL gerado e configurado com sucesso!${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao gerar o certificado SSL. Verifique os logs para mais detalhes.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Finalizando instalação
echo -e "${COLOR}Instalação finalizada com sucesso para a empresa: $NOME_EMPRESA!${RESET}" | tee -a "$LOG_FILE"

# Exibindo resumo da instalação
echo -e "${BOLD}Resumo da Instalação:${RESET}" | tee -a "$LOG_FILE"
echo -e "${GREEN}---------------------------------------${RESET}" | tee -a "$LOG_FILE"
echo -e "${BOLD}URL de Acesso:${RESET} https://$URL_FRONTEND" | tee -a "$LOG_FILE"
echo -e "${BOLD}Nome da Instalação:${RESET} $NOME_EMPRESA" | tee -a "$LOG_FILE"
echo -e "${BOLD}Quantidade de Usuários Permitidos:${RESET} $USER_LIMIT" | tee -a "$LOG_FILE"
echo -e "${BOLD}Quantidade de Conexões Permitidas:${RESET} $CONNECTION_LIMIT" | tee -a "$LOG_FILE"
echo -e "${BOLD}---------------------------------------${RESET}" | tee -a "$LOG_FILE"

# Informações de Usuários
echo -e "${BOLD}Usuário Padrão para Acesso${RESET}" | tee -a "$LOG_FILE"
echo -e "${BOLD}Usuário:${RESET} admin@pressticket.com.br" | tee -a "$LOG_FILE"
echo -e "${BOLD}Senha:${RESET} admin" | tee -a "$LOG_FILE"
echo -e "${BOLD}---------------------------------------${RESET}" | tee -a "$LOG_FILE"
echo -e "${BOLD}Usuário Master para Acesso${RESET}" | tee -a "$LOG_FILE"
echo -e "${BOLD}Usuário:${RESET} masteradmin@pressticket.com.br" | tee -a "$LOG_FILE"
echo -e "${BOLD}Senha:${RESET} masteradmin" | tee -a "$LOG_FILE"
echo -e "${GREEN}---------------------------------------${RESET}" | tee -a "$LOG_FILE"

# Mensagem final
echo -e "${COLOR}Acesse o sistema e configure conforme necessário. Obrigado por utilizar o Press Ticket!${RESET}" | tee -a "$LOG_FILE"
