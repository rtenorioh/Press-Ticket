#!/bin/bash
VERSION="1.7.3"
echo ""
echo "██████╗ ██████╗ ███████╗███████╗███████╗    ████████╗██╗ ██████╗██╗  ██╗███████╗████████╗"
echo "██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝    ╚══██╔══╝██║██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝"
echo "██████╔╝██████╔╝█████╗  ███████╗███████╗       ██║   ██║██║     █████╔╝ █████╗     ██║   "
echo "██╔═══╝ ██╔══██╗██╔══╝  ╚════██║╚════██║       ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   "
echo "██║     ██║  ██║███████╗███████║███████║       ██║   ██║╚██████╗██║  ██╗███████╗   ██║   "
echo "╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝       ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   "
echo " "
echo -e "\e[92mATUALIZANDO PARA A VERSÃO:\e[0m \e[1m$VERSION\e[0m"
echo " "

sleep 2

echo " "
echo "VERIFICANDO A VERSÃO DO UPDATE"
echo " "

sleep 2

extract_version() {
  local script="$1"
  grep -oP 'VERSION="([^"]+)"' "$script" | cut -d'"' -f2
}

TEMP_FILE=$(mktemp)
curl -s https://raw.githubusercontent.com/rtenorioh/Press-Ticket/main/UPDATE.sh >$TEMP_FILE

if [ $? -ne 0 ]; then
  echo "$(date +"%Y-%m-%d %H:%M:%S") - Erro ao baixar o arquivo do GitHub: $TEMP_FILE" >>update.log
  echo "Verifique sua conexão com a internet e as credenciais do GitHub."
  exit 1 # Encerra o script com código de erro
fi

REMOTE_VERSION=$(extract_version "$TEMP_FILE")

if [[ -z "$REMOTE_VERSION" || "$REMOTE_VERSION" > "$VERSION" ]]; then
  echo "Versão remota é mais recente ou não foi encontrada. Atualizando..."
  cp "$TEMP_FILE" "$0"
  "$TEMP_FILE"
  echo "$(date +"%Y-%m-%d %H:%M:%S") - Script atualizado para a versão $REMOTE_VERSION" >>update.log
else
  echo "O script local está atualizado."
  rm "$TEMP_FILE"
fi

rm "$TEMP_FILE"

sleep 2

echo " "
echo "VERIFICANDO A VERSÃO DO NODE JS"
echo " "

sleep 2

CURRENT_NODE_VERSION=$(node -v | cut -d'v' -f2)

if [ "$CURRENT_NODE_VERSION" -lt 18 ]; then
  echo "Versão do Node.js atual é inferior a 18. Atualizando para a 20.x..."
  sudo apt-get remove nodejs
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  sudo npm install -g npm
else
  echo "Versão do Node.js é 18 ou superior. Prosseguindo com a atualização..."
fi

sleep 2

echo " "
echo "BAIXANDO AS ATUALIZAÇÕES"
echo " "

sleep 2

git reset --hard
git pull

echo " "
echo "ACESSANDO O BACKEND"
echo " "

sleep 2

cd backend

echo " "
echo "ATUALIZANDO OS ARQUIVOS DO BACKEND"
echo " "

sleep 2

sudo rm -rf node_modules
npm install
sudo rm -rf dist
npm run build

echo " "
echo "EXECUTANDO O DB:MIGRATE"
echo " "

sleep 2

npx sequelize db:migrate

echo " "
echo "EXECUTANDO O DB:SEED:ALL"
echo " "

sleep 2

npx sequelize db:seed:all

echo " "
echo "ACESSANDO O FRONTEND"
echo " "

sleep 2

cd ../frontend

sleep 2

echo " "
echo "VERIFICANDO O CONFIG.JSON"
echo " "

sleep 2

if [ ! -e src/config.json ]; then
  echo "Criando o arquivo config.json"
  cp src/config.json.example src/config.json
else
  echo "O arquivo config.json já existe"
fi

sleep 2

echo " "
echo "ATUALIZANDO OS ARQUIVOS DO FRONTEND"
echo " "

sleep 2

sudo rm -rf node_modules
npm install
rm -rf build
npm run build

echo " "
echo "RESTART PM2"
echo " "

sleep 2

pm2 restart all

echo " "
echo "PRESS TICKET ATUALIZADO COM SUCESSO!!!"
echo " "
