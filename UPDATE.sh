#!/bin/bash
VERSION="v1.10.0"

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
RESET="\e[0m"
BOLD="\e[1m"

echo -e " "
echo -e "${COLOR}██████╗ ██████╗ ███████╗███████╗███████╗    ████████╗██╗ ██████╗██╗  ██╗███████╗████████╗${RESET}"
echo -e "${COLOR}██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝    ╚══██╔══╝██║██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝${RESET}"
echo -e "${COLOR}██████╔╝██████╔╝█████╗  ███████╗███████╗       ██║   ██║██║     █████╔╝ █████╗     ██║   ${RESET}"
echo -e "${COLOR}██╔═══╝ ██╔══██╗██╔══╝  ╚════██║╚════██║       ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   ${RESET}"
echo -e "${COLOR}██║     ██║  ██║███████╗███████║███████║       ██║   ██║╚██████╗██║  ██╗███████╗   ██║   ${RESET}"
echo -e "${COLOR}╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝       ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ${RESET}"
echo -e "${COLOR}ATUALIZANDO PARA A VERSÃO:${RESET} ${BOLD}$VERSION${RESET}"
echo -e " "

sleep 2
# Lista de fusos horários
declare -a TIMEZONES=(
    "UTC"
    "America/Sao_Paulo"
    "America/New_York"
    "Europe/London"
    "Europe/Paris"
    "Asia/Tokyo"
    "Asia/Shanghai"
    "Australia/Sydney"
)

# Exibir a lista de fusos horários para o usuário
echo " "
echo "Por favor, escolha seu fuso horário:"
echo " "
for i in "${!TIMEZONES[@]}"; do
    echo "[$i] ${TIMEZONES[$i]}"
done

# Capturar a escolha do usuário
echo " "
read -p "Digite o número correspondente ao fuso horário: " TZ_INDEX
echo " "

# Validar entrada
if [[ ! "$TZ_INDEX" =~ ^[0-9]+$ ]] || [[ "$TZ_INDEX" -ge "${#TIMEZONES[@]}" ]]; then
    echo " "
    echo "Escolha inválida. Usando o fuso horário padrão: UTC."
    echo " "
    SELECTED_TZ="UTC"
else
    SELECTED_TZ="${TIMEZONES[$TZ_INDEX]}"
    echo " "
    echo "Fuso horário escolhido: $SELECTED_TZ"
    echo " "
fi

# Configuração do arquivo de log (ajustado para usar o fuso horário)
LOG_FILE="$CURRENT_LOG_DIR/update_${VERSION}_$(TZ=$SELECTED_TZ date +"%Y-%m-%d_%H-%M-%S").log"

# Adicionar informações iniciais ao log
{
    echo " "
    echo "**************************************************************"
    echo "*               PRESS TICKET - LOG DE ATUALIZAÇÃO           *"
    echo "**************************************************************"
    echo " Versão Atualizada: $VERSION                                "
    echo " Fuso Horário: $SELECTED_TZ                                 "
    echo " Hora Local: $(TZ=$SELECTED_TZ date)                       "
    echo "**************************************************************"
    echo " "
} | tee -a "$LOG_FILE"

echo " "
echo "Arquivo de de log criado com sucesso: $LOG_FILE"
echo " "
# Exibir a hora ajustada e salvar no log
echo "Fuso horário ajustado para: $SELECTED_TZ" | tee -a "$LOG_FILE"
echo "Hora ajustada para o log: $(TZ=$SELECTED_TZ date)" | tee -a "$LOG_FILE"

# Verifica se o arquivo de log pode ser criado
if ! touch "$LOG_FILE"; then
    echo "Erro: Não foi possível criar o arquivo de log $LOG_FILE. Verifique as permissões."
    exit 1
fi

# Compactação de logs antigos
find "$CURRENT_LOG_DIR" -type f -mtime +30 -exec gzip {} \; -exec mv {}.gz "$ARCHIVED_LOG_DIR" \;

# Verificação de versão do Node.js
{
    echo " "
    echo "VERIFICANDO A VERSÃO DO NODE.JS"
    echo " "
} | tee -a "$LOG_FILE"

sleep 2

NODE_PATH="/usr/bin/node"

# Verifica se o Node.js está instalado
if [ ! -x "$NODE_PATH" ]; then
    {
        echo "Node.js não está instalado corretamente ou não foi encontrado. Instalando a versão 20.x..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
        sudo npm install -g npm
        if [ $? -ne 0 ]; then
            echo "Erro ao instalar o Node.js ou o npm. Saindo..."
            exit 1
        fi
        echo "Node.js instalado com sucesso."
        exit 0
    } | tee -a "$LOG_FILE"
fi

CURRENT_NODE_VERSION=$($NODE_PATH -v | cut -d'v' -f2)

# Função para comparação de versões
version_less_than() {
    [ "$(printf '%s\n' "$1" "$2" | sort -V | head -n1)" = "$1" ]
}

# Atualização do Node.js, se necessário
if version_less_than "$CURRENT_NODE_VERSION" "18.0.0"; then
    {
        echo "Versão do Node.js atual ($CURRENT_NODE_VERSION) é inferior a 18. Atualizando para a versão 20.x..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
        sudo npm install -g npm
        if [ $? -ne 0 ]; then
            echo "Erro ao atualizar o Node.js ou o npm. Saindo..."
            exit 1
        fi
        echo "Node.js atualizado com sucesso para a versão 20.x."
    } | tee -a "$LOG_FILE"
else
    echo "A versão do Node.js instalada ($CURRENT_NODE_VERSION) é igual ou superior a 18. Prosseguindo..." | tee -a "$LOG_FILE"
fi

sleep 2

{
    echo " "
    echo "BAIXANDO AS ATUALIZAÇÕES"
    echo " "
} | tee -a "$LOG_FILE"

sleep 2

git reset --hard | tee -a "$LOG_FILE"
git pull | tee -a "$LOG_FILE"

{
    echo " "
    echo "ACESSANDO O BACKEND"
    echo " "
} | tee -a "$LOG_FILE"

sleep 2

cd backend || {
    echo "Erro ao acessar o diretório do backend." | tee -a "$LOG_FILE"
    exit 1
}

{
    echo " "
    echo "ATUALIZANDO OS ARQUIVOS DO BACKEND"
    echo " "
} | tee -a "$LOG_FILE"

sleep 2

sudo rm -rf node_modules | tee -a "$LOG_FILE"
npm install | tee -a "$LOG_FILE"

sudo rm -rf dist | tee -a "$LOG_FILE"
npm run build | tee -a "$LOG_FILE"

{
    echo " "
    echo "EXECUTANDO O DB:MIGRATE"
    echo " "
} | tee -a "$LOG_FILE"

sleep 2

npx sequelize db:migrate | tee -a "$LOG_FILE"

{
    echo " "
    echo "EXECUTANDO O DB:SEED:ALL"
    echo " "
} | tee -a "$LOG_FILE"

sleep 2

npx sequelize db:seed:all | tee -a "$LOG_FILE"

{
    echo " "
    echo "ACESSANDO O FRONTEND"
    echo " "
} | tee -a "$LOG_FILE"

sleep 2

cd ../frontend || {
    echo "Erro ao acessar o diretório do frontend." | tee -a "$LOG_FILE"
    exit 1
}

# Verifica o arquivo .env e adiciona REACT_APP_MASTERADMIN se necessário
if [ -f .env ]; then
    if grep -q "^REACT_APP_MASTERADMIN=" .env; then
        echo "A variável REACT_APP_MASTERADMIN já está presente no arquivo .env." | tee -a "$LOG_FILE"
    else
        echo "Adicionando a variável REACT_APP_MASTERADMIN ao final do arquivo .env." | tee -a "$LOG_FILE"
        echo "" >>.env
        echo "# Para permitir acesso apenas do MasterAdmin (sempre ON)" >>.env
        echo "REACT_APP_MASTERADMIN=ON" >>.env
        echo "A variável REACT_APP_MASTERADMIN foi adicionada ao final do arquivo .env." | tee -a "$LOG_FILE"
    fi
else
    echo "O arquivo .env não foi encontrado. O processo de instalação precisa ser finalizado antes de prosseguir." | tee -a "$LOG_FILE"
    exit 1
fi

{
    echo " "
    echo "VERIFICANDO O CONFIG.JSON"
    echo " "
} | tee -a "$LOG_FILE"

sleep 2

if [ -e src/config.json ]; then
    echo "O arquivo config.json existe. Excluindo o arquivo..." | tee -a "$LOG_FILE"
    rm src/config.json
    echo "Arquivo config.json excluído com sucesso." | tee -a "$LOG_FILE"
else
    echo "O arquivo config.json não existe. Tudo certo, prosseguindo com a atualização." | tee -a "$LOG_FILE"
fi

sleep 2

{
    echo " "
    echo "ATUALIZANDO OS ARQUIVOS DO FRONTEND"
    echo " "
} | tee -a "$LOG_FILE"

sleep 2

sudo rm -rf node_modules | tee -a "$LOG_FILE"
npm install | tee -a "$LOG_FILE"

sudo rm -rf build | tee -a "$LOG_FILE"
npm run build | tee -a "$LOG_FILE"

{
    echo " "
    echo "RESTART PM2"
    echo " "
} | tee -a "$LOG_FILE"

sleep 2

ENV_FILE="../backend/.env"

if [ -f "$ENV_FILE" ]; then
    PM2_FRONTEND=$(grep "^PM2_FRONTEND=" "$ENV_FILE" | cut -d '=' -f2)
    PM2_BACKEND=$(grep "^PM2_BACKEND=" "$ENV_FILE" | cut -d '=' -f2)

    if [ -n "$PM2_FRONTEND" ] && [ -n "$PM2_BACKEND" ]; then
        echo "Reiniciando PM2 com os IDs especificados..." | tee -a "$LOG_FILE"
        pm2 restart "$PM2_FRONTEND" | tee -a "$LOG_FILE"
        pm2 restart "$PM2_BACKEND" | tee -a "$LOG_FILE"
    else
        echo "Erro: IDs PM2_FRONTEND ou PM2_BACKEND não encontrados." | tee -a "$LOG_FILE"
        exit 1
    fi
else
    echo "Erro: Arquivo .env não encontrado no backend." | tee -a "$LOG_FILE"
    exit 1
fi

{
    echo " "
    echo "PRESS TICKET ATUALIZADO COM SUCESSO!!!"
    echo "Log de atualização salvo em: $LOG_FILE"
} | tee -a "$LOG_FILE"
