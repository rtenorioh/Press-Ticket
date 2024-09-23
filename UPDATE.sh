#!/bin/bash
VERSION="v1.7.4"
LOG_FILE="update_$(date +"%Y-%m-%d_%H-%M-%S").log"

COLOR="\e[38;5;92m"
RESET="\e[0m"

echo -e "${COLOR}██████╗ ██████╗ ███████╗███████╗███████╗    ████████╗██╗ ██████╗██╗  ██╗███████╗████████╗${RESET}"
echo -e "${COLOR}██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝    ╚══██╔══╝██║██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝${RESET}"
echo -e "${COLOR}██████╔╝██████╔╝█████╗  ███████╗███████╗       ██║   ██║██║     █████╔╝ █████╗     ██║   ${RESET}"
echo -e "${COLOR}██╔═══╝ ██╔══██╗██╔══╝  ╚════██║╚════██║       ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   ${RESET}"
echo -e "${COLOR}██║     ██║  ██║███████╗███████║███████║       ██║   ██║╚██████╗██║  ██╗███████╗   ██║   ${RESET}"
echo -e "${COLOR}╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝       ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ${RESET}"
echo -e "\e[92mATUALIZANDO PARA A VERSÃO:\e[0m \e[1m$VERSION\e[0m" | tee -a "$LOG_FILE"
echo " "

sleep 2

echo " " | tee -a "$LOG_FILE"
echo "VERIFICANDO A VERSÃO DO UPDATE" | tee -a "$LOG_FILE"
echo " " | tee -a "$LOG_FILE"

sleep 2

extract_version() {
  local script="$1"
  grep -oP 'VERSION="([^"]+)"' "$script" | cut -d'"' -f2
}

TEMP_FILE=$(mktemp)
curl -s https://raw.githubusercontent.com/rtenorioh/Press-Ticket/main/UPDATE.sh >$TEMP_FILE

if [ $? -ne 0 ]; then
  echo "$(date +"%Y-%m-%d %H:%M:%S") - Erro ao baixar o arquivo do GitHub: $TEMP_FILE" | tee -a "$LOG_FILE"
  echo "Verifique sua conexão com a internet e as credenciais do GitHub." | tee -a "$LOG_FILE"
  exit 1
fi

REMOTE_VERSION=$(extract_version "$TEMP_FILE")

if [ -z "$REMOTE_VERSION" ] || [ "$REMOTE_VERSION" ] >"$VERSION"; then
  echo "Versão remota é mais recente ou não foi encontrada. Atualizando..." | tee -a "$LOG_FILE"
  cp "$TEMP_FILE" "$0"
  "$TEMP_FILE"
  echo "$(date +"%Y-%m-%d %H:%M:%S") - Script atualizado para a versão $REMOTE_VERSION" | tee -a "$LOG_FILE"
else
  echo "O script local está atualizado." | tee -a "$LOG_FILE"
  sudo rm -rf "$TEMP_FILE"
fi

sudo rm -rf "$TEMP_FILE"

sleep 2

echo " " | tee -a "$LOG_FILE"
echo "VERIFICANDO A VERSÃO DO NODE JS" | tee -a "$LOG_FILE"
echo " " | tee -a "$LOG_FILE"

sleep 2

CURRENT_NODE_VERSION=$(node -v | cut -d'v' -f2)

compare_versions() {
  local version1="$1"
  local version2="$2"
  IFS=. read -ra v1 <<<"$version1"
  IFS=. read -ra v2 <<<"$version2"
  for ((i = 0; i < ${#v1[@]}; i++)); do
    if [[ ${v1[$i]} -gt ${v2[$i]} ]]; then
      return 1
    elif [[ ${v1[$i]} -lt ${v2[$i]} ]]; then
      return -1
    fi
  done
  return 0
}

if compare_versions "$CURRENT_NODE_VERSION" "18"; then
  echo "Versão do Node.js atual é inferior a 18. Atualizando para a 20.x..." | tee -a "$LOG_FILE"
  sudo apt-get remove nodejs | tee -a "$LOG_FILE"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - | tee -a "$LOG_FILE"
  sudo apt-get install -y nodejs | tee -a "$LOG_FILE"
  sudo npm install -g npm | tee -a "$LOG_FILE"
else
  echo "Versão do Node.js é 18 ou superior. Prosseguindo com a atualização..." | tee -a "$LOG_FILE"
fi

sleep 2

echo " " | tee -a "$LOG_FILE"
echo "BAIXANDO AS ATUALIZAÇÕES" | tee -a "$LOG_FILE"
echo " " | tee -a "$LOG_FILE"

sleep 2

git reset --hard | tee -a "$LOG_FILE"
git pull | tee -a "$LOG_FILE"

echo " " | tee -a "$LOG_FILE"
echo "ACESSANDO O BACKEND" | tee -a "$LOG_FILE"
echo " " | tee -a "$LOG_FILE"

sleep 2

cd backend

echo " " | tee -a "$LOG_FILE"
echo "ATUALIZANDO OS ARQUIVOS DO BACKEND" | tee -a "$LOG_FILE"
echo " " | tee -a "$LOG_FILE"

sleep 2

sudo rm -rf node_modules | tee -a "$LOG_FILE"
npm install | tee -a "$LOG_FILE"
sudo rm -rf dist | tee -a "$LOG_FILE"
npm run build | tee -a "$LOG_FILE"

echo " " | tee -a "$LOG_FILE"
echo "EXECUTANDO O DB:MIGRATE" | tee -a "$LOG_FILE"
echo " " | tee -a "$LOG_FILE"

sleep 2

npx sequelize db:migrate | tee -a "$LOG_FILE"

echo " " | tee -a "$LOG_FILE"
echo "EXECUTANDO O DB:SEED:ALL" | tee -a "$LOG_FILE"

sleep 2

npx sequelize db:seed:all | tee -a "$LOG_FILE"

echo " " | tee -a "$LOG_FILE"
echo "ACESSANDO O FRONTEND" | tee -a "$LOG_FILE"
echo " " | tee -a "$LOG_FILE"

sleep 2

cd ../frontend

sleep 2

echo " " | tee -a "$LOG_FILE"
echo "VERIFICANDO O CONFIG.JSON" | tee -a "$LOG_FILE"
echo " " | tee -a "$LOG_FILE"

sleep 2

if [ ! -e src/config.json ]; then
  echo "Criando o arquivo config.json" | tee -a "$LOG_FILE"
  cp src/config.json.example src/config.json | tee -a "$LOG_FILE"
else
  echo "O arquivo config.json já existe" | tee -a "$LOG_FILE"
fi

sleep 2

echo " " | tee -a "$LOG_FILE"
echo "ATUALIZANDO OS ARQUIVOS DO FRONTEND" | tee -a "$LOG_FILE"
echo " " | tee -a "$LOG_FILE"

sleep 2

sudo rm -rf node_modules | tee -a "$LOG_FILE"
npm install | tee -a "$LOG_FILE"
sudo rm -rf build | tee -a "$LOG_FILE"
npm run build | tee -a "$LOG_FILE"

echo " " | tee -a "$LOG_FILE"
echo "RESTART PM2" | tee -a "$LOG_FILE"
echo " " | tee -a "$LOG_FILE"

sleep 2

pm2 restart all | tee -a "$LOG_FILE"

echo " " | tee -a "$LOG_FILE"
echo "PRESS TICKET ATUALIZADO COM SUCESSO!!!" | tee -a "$LOG_FILE"
echo "Log de atualização salvo em: $LOG_FILE"
