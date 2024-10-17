#!/bin/bash
VERSION="v1.8.1"

SCRIPT_DIR=$(dirname "$0")

LOG_DIR="$SCRIPT_DIR/log"
CURRENT_LOG_DIR="$LOG_DIR/atual"
ARCHIVED_LOG_DIR="$LOG_DIR/arquivos"

mkdir -p "$CURRENT_LOG_DIR"
mkdir -p "$ARCHIVED_LOG_DIR"

LOG_FILE="$CURRENT_LOG_DIR/update_$(date +"%Y-%m-%d_%H-%M-%S").log"

COLOR="\e[38;5;92m"
RESET="\e[0m"

echo " "
echo "${COLOR}██████╗ ██████╗ ███████╗███████╗███████╗    ████████╗██╗ ██████╗██╗  ██╗███████╗████████╗${RESET}"
echo "${COLOR}██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝    ╚══██╔══╝██║██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝${RESET}"
echo "${COLOR}██████╔╝██████╔╝█████╗  ███████╗███████╗       ██║   ██║██║     █████╔╝ █████╗     ██║   ${RESET}"
echo "${COLOR}██╔═══╝ ██╔══██╗██╔══╝  ╚════██║╚════██║       ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   ${RESET}"
echo "${COLOR}██║     ██║  ██║███████╗███████║███████║       ██║   ██║╚██████╗██║  ██╗███████╗   ██║   ${RESET}"
echo "${COLOR}╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝       ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ${RESET}"
echo "\e[92mATUALIZANDO PARA A VERSÃO:\e[0m \e[1m$VERSION\e[0m" | tee -a "$LOG_FILE"
echo " "

# sleep 2

# echo "PATH: $PATH" | tee -a "$LOG_FILE"

# # Função para verificar se comandos necessários estão instalados
# check_dependency() {
#   if ! command -v "$1" &>/dev/null; then
#     echo "$1 não está instalado. Saindo..." | tee -a "$LOG_FILE"
#     exit 1
#   fi
# }

# # Verificar se as dependências estão instaladas
# check_dependency node
# check_dependency npm
# check_dependency pm2

# # Gerenciar logs antigos: compactar e mover para a pasta de arquivos (logs mais antigos que 30 dias)
# find "$CURRENT_LOG_DIR" -type f -mtime +30 -exec gzip {} \; -exec mv {}.gz "$ARCHIVED_LOG_DIR" \;

# sleep 2

# echo " " | tee -a "$LOG_FILE"
# echo "VERIFICANDO A VERSÃO DO NODE JS" | tee -a "$LOG_FILE"
# echo " " | tee -a "$LOG_FILE"

# sleep 2

# NODE_PATH="/usr/bin/node"

# if [ ! -x "$NODE_PATH" ]; then
#   echo "Node.js não está instalado corretamente ou não foi encontrado. Saindo..." | tee -a "$LOG_FILE"
#   exit 1
# fi

# CURRENT_NODE_VERSION=$($NODE_PATH -v | cut -d'v' -f2)

# # Função para comparar versões utilizando dpkg
# compare_versions() {
#   dpkg --compare-versions "$1" "lt" "$2"
# }

# # Comparação de versões do Node.js
# if compare_versions "$CURRENT_NODE_VERSION" "18"; then
#   echo "Versão do Node.js atual é inferior a 18. Atualizando para a 20.x..." | tee -a "$LOG_FILE"
#   sudo apt-get remove -y nodejs | tee -a "$LOG_FILE"
#   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - | tee -a "$LOG_FILE"
#   sudo apt-get install -y nodejs | tee -a "$LOG_FILE"
#   sudo npm install -g npm | tee -a "$LOG_FILE"
#   if [ $? -ne 0 ]; then
#     echo "Erro ao atualizar o Node.js ou o npm. Saindo..." | tee -a "$LOG_FILE"
#     exit 1
#   fi
# else
#   echo "Versão do Node.js é 18 ou superior. Prosseguindo com a atualização..." | tee -a "$LOG_FILE"
# fi

sleep 2

echo " " | tee -a "$LOG_FILE"
echo "BAIXANDO AS ATUALIZAÇÕES" | tee -a "$LOG_FILE"
echo " " | tee -a "$LOG_FILE"

sleep 2

git reset --hard | tee -a "$LOG_FILE"
git pull | tee -a "$LOG_FILE"
# if [ $? -ne 0 ]; then
#   echo "Erro ao realizar o git pull. Saindo..." | tee -a "$LOG_FILE"
#   exit 1
# fi

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
# if [ $? -ne 0 ]; then
#   echo "Erro ao instalar dependências do backend. Saindo..." | tee -a "$LOG_FILE"
#   exit 1
# fi
sudo rm -rf dist | tee -a "$LOG_FILE"
npm run build | tee -a "$LOG_FILE"

echo " " | tee -a "$LOG_FILE"
echo "EXECUTANDO O DB:MIGRATE" | tee -a "$LOG_FILE"
echo " " | tee -a "$LOG_FILE"

sleep 2

npx sequelize db:migrate | tee -a "$LOG_FILE"
# if [ $? -ne 0 ]; then
#   echo "Erro ao executar as migrações do banco de dados. Saindo..." | tee -a "$LOG_FILE"
#   exit 1
# fi

echo " " | tee -a "$LOG_FILE"
echo "EXECUTANDO O DB:SEED:ALL" | tee -a "$LOG_FILE"

sleep 2

npx sequelize db:seed:all | tee -a "$LOG_FILE"
# if [ $? -ne 0 ]; then
#   echo "Erro ao rodar seeds no banco de dados. Saindo..." | tee -a "$LOG_FILE"
#   exit 1
# fi

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
# if [ $? -ne 0 ]; then
#   echo "Erro ao instalar dependências do frontend. Saindo..." | tee -a "$LOG_FILE"
#   exit 1
# fi
sudo rm -rf build | tee -a "$LOG_FILE"
npm run build | tee -a "$LOG_FILE"

echo " " | tee -a "$LOG_FILE"
echo "RESTART PM2" | tee -a "$LOG_FILE"
echo " " | tee -a "$LOG_FILE"

sleep 2

pm2 restart all | tee -a "$LOG_FILE"
# if [ $? -ne 0 ]; then
#   echo "Erro ao reiniciar o PM2. Saindo..." | tee -a "$LOG_FILE"
#   exit 1
# fi

echo " " | tee -a "$LOG_FILE"
echo "PRESS TICKET ATUALIZADO COM SUCESSO!!!" | tee -a "$LOG_FILE"
echo "Log de atualização salvo em: $LOG_FILE"
