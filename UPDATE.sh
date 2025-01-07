#!/bin/bash
# Obter a versão automaticamente
VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "unknown")

# Registro do início da execução
START_TIME=$(date +%s)

# Função para finalizar o script exibindo o tempo total
finalizar() {
    local END_TIME=$(date +%s)
    local ELAPSED_TIME=$((END_TIME - START_TIME))
    local MINUTES=$((ELAPSED_TIME / 60))
    local SECONDS=$((ELAPSED_TIME % 60))

    local RED="\e[31m"
    local GREEN="\e[32m"
    local RESET="\e[0m"
    local BOLD="\e[1m"

    if [ -n "$1" ]; then
        echo -e "${RED}Erro:${RESET} $1" | tee -a "$LOG_FILE"
    fi

    echo -e "${GREEN}Tempo total de execução do script:${RESET} ${BOLD}${MINUTES} minutos e ${SECONDS} segundos${RESET}" | tee -a "$LOG_FILE"
    exit "${2:-1}"
}

# Define o diretório base absoluto
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

# Define diretórios de logs usando caminhos absolutos
LOG_DIR="$SCRIPT_DIR/log"
CURRENT_LOG_DIR="$LOG_DIR/atual"
ARCHIVED_LOG_DIR="$LOG_DIR/arquivos"

# Cria os diretórios de log
if ! mkdir -p "$CURRENT_LOG_DIR" "$ARCHIVED_LOG_DIR"; then
    echo "Erro: Não foi possível criar os diretórios de log. Verifique as permissões."
    finalizar "Erro: Não foi possível criar os diretórios de log. Verifique as permissões." 1
fi

COLOR="\e[38;5;92m"
GREEN="\e[32m"
RESET="\e[0m"
BOLD="\e[1m"

echo -e " "
echo -e "${COLOR}██████╗ ██████╗ ███████╗███████╗███████╗    ████████╗██╗ ██████╗██╗  ██╗███████╗████████╗${RESET}"
echo -e "${COLOR}██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝    ╚══██╔══╝██║██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝${RESET}"
echo -e "${COLOR}██████╔╝██████╔╝█████╗  ███████╗███████╗       ██║   ██║██║     █████╔╝ █████╗     ██║   ${RESET}"
echo -e "${COLOR}██╔═══╝ ██╔══██╗██╔══╝  ╚════██║╚════██║       ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   ${RESET}"
echo -e "${COLOR}██║     ██║  ██║███████╗███████║███████║       ██║   ██║╚██████╗██║  ██╗███████╗   ██║   ${RESET}"
echo -e "${COLOR}╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝       ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ${RESET}"
echo -e "${GREEN}ATUALIZANDO PARA A VERSÃO:${RESET} ${BOLD}$VERSION${RESET}"
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
    zip -j "$ARCHIVED_LOG_DIR/logs_$(date +'%Y-%m-%d').zip" "$CURRENT_LOG_DIR"/* -x "*.zip"
    if [ $? -eq 0 ]; then
        echo "Logs antigos compactados com sucesso em $ARCHIVED_LOG_DIR/logs_$(date +'%Y-%m-%d').zip"
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
LOG_FILE="$CURRENT_LOG_DIR/update_${VERSION}_$(TZ=$SELECTED_TZ date +"%d-%m-%Y_%H-%M-%S").log"

# Verifica se o jq está instalado; se não, instala automaticamente
if ! command -v jq &>/dev/null; then
    echo "A ferramenta jq não está instalada. Instalando agora..."
    if sudo apt-get install -y jq; then
        echo "jq instalado com sucesso."
    else
        echo "Erro: Não foi possível instalar jq. Verifique as permissões ou instale manualmente."
        finalizar "Erro: Não foi possível instalar jq. Verifique as permissões ou instale manualmente." 1
    fi
fi

# Obtém a versão atual do sistema do arquivo frontend/package.json
PACKAGE_JSON_PATH="$SCRIPT_DIR/frontend/package.json"

if [ -f "$PACKAGE_JSON_PATH" ]; then
    SYSTEM_VERSION=$(jq -r '.systemVersion' "$PACKAGE_JSON_PATH" 2>/dev/null)
    if [ -z "$SYSTEM_VERSION" ] || [ "$SYSTEM_VERSION" == "null" ]; then
        SYSTEM_VERSION="Não encontrado"
    fi
else
    SYSTEM_VERSION="Arquivo package.json não encontrado"
fi

# Adicionar informações iniciais ao log
{
    echo " "
    echo "**************************************************************"
    echo "*               PRESS TICKET - LOG DE ATUALIZAÇÃO           *"
    echo "**************************************************************"
    echo " Versão Atual do Sistema: $SYSTEM_VERSION                   "
    echo " Nova Versão Atualizada: $VERSION                           "
    echo " Fuso Horário: $SELECTED_TZ                                 "
    echo " Hora Local: $(TZ=$SELECTED_TZ date +"%d-%m-%Y %H:%M:%S")   "
    echo " Local do log: $LOG_FILE                                    "
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
    finalizar "Erro: Não foi possível criar o arquivo de log $LOG_FILE. Verifique as permissões." 1
fi

sleep 2

# Solicita confirmação do usuário para atualização do sistema operacional
if [ -t 0 ]; then
    echo -e "${BOLD}${GREEN}Deseja atualizar os pacotes do sistema operacional antes de continuar? (s/n)${RESET}"
    read -r UPDATE_SYSTEM
    UPDATE_SYSTEM=${UPDATE_SYSTEM:-n} # Define 'n' como valor padrão se vazio
else
    # Abre um subshell para capturar entrada interativa
    UPDATE_SYSTEM=$(bash -c 'read -p "Deseja atualizar os pacotes do sistema operacional antes de continuar? (s/n): " REPLY; echo $REPLY' </dev/tty)
    UPDATE_SYSTEM=${UPDATE_SYSTEM:-n} # Define 'n' como valor padrão se vazio
fi

if [[ "$UPDATE_SYSTEM" == "s" || "$UPDATE_SYSTEM" == "S" ]]; then
    # Comandos de atualização
    if sudo apt-get update -y | tee -a "$LOG_FILE"; then
        echo "Lista de pacotes atualizada com sucesso." | tee -a "$LOG_FILE"
    else
        echo "Erro ao atualizar a lista de pacotes."
        finalizar "Erro ao atualizar a lista de pacotes." 1
    fi

    if sudo apt-get upgrade -y | tee -a "$LOG_FILE"; then
        echo "Pacotes atualizados com sucesso." | tee -a "$LOG_FILE"
    else
        echo "Erro ao atualizar os pacotes."
        finalizar "Erro ao atualizar os pacotes." 1
    fi
else
    echo "Atualização do sistema operacional ignorada." | tee -a "$LOG_FILE"
fi

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
            finalizar "Erro ao instalar o Node.js ou o npm. Saindo..." 1
        fi
        echo "Node.js instalado com sucesso."
        finalizar "Node.js instalado com sucesso." 0
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
        echo "Versão do Node.js atual ($CURRENT_NODE_VERSION) é inferior a 18."
        echo -e "${BOLD}${GREEN}Deseja atualizar o Node.js para a versão 20.x? (s/n)${RESET}"
        read -r UPDATE_NODE

        if [[ "$UPDATE_NODE" =~ ^[sS]$ ]]; then
            echo "Atualizando Node.js para a versão 20.x..."
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
            sudo npm install -g npm
            if [ $? -ne 0 ]; then
                echo "Erro ao atualizar o Node.js ou o npm. Saindo..."
                finalizar "Erro ao atualizar o Node.js ou o npm. Saindo..." 1
            fi
            echo "Node.js atualizado com sucesso para a versão 20.x."
        else
            echo "Atualização do Node.js ignorada pelo usuário." | tee -a "$LOG_FILE"
        fi
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
    echo "Erro ao acessar o diretório do backend."
    finalizar "Erro ao acessar o diretório do backend." 1
}

# Caminho do arquivo sequelizeData.json
SEQUELIZE_DATA_FILE="sequelizeData.json"

{
    echo " "
    echo "VERIFICANDO O ARQUIVO sequelizeData.json"
    echo " "
} | tee -a "$LOG_FILE"

# Verifica se o arquivo existe
if [ ! -f "$SEQUELIZE_DATA_FILE" ]; then
    echo "O arquivo $SEQUELIZE_DATA_FILE não foi encontrado. Criando o arquivo com dados padrão..." | tee -a "$LOG_FILE"

    # Dados padrão para o arquivo
    DEFAULT_DATA='[
  "20200904070004-create-default-settings.js",
  "20200904070004-create-default-users.js",
  "20200904070006-create-apiToken-settings.js"
]'

    # Cria o arquivo com os dados padrão
    echo "$DEFAULT_DATA" >"$SEQUELIZE_DATA_FILE"

    if [ $? -eq 0 ]; then
        echo "Arquivo $SEQUELIZE_DATA_FILE criado com sucesso." | tee -a "$LOG_FILE"
    else
        echo "Erro ao criar o arquivo $SEQUELIZE_DATA_FILE."
        finalizar "Erro ao criar o arquivo $SEQUELIZE_DATA_FILE." 1
    fi
else
    echo "O arquivo $SEQUELIZE_DATA_FILE já existe. Nenhuma ação necessária." | tee -a "$LOG_FILE"
fi

{
    echo " "
    echo "ATUALIZANDO OS ARQUIVOS DO BACKEND"
    echo " "
} | tee -a "$LOG_FILE"

sleep 2

# sudo rm -rf node_modules | tee -a "$LOG_FILE"
# npm install | tee -a "$LOG_FILE"

# sudo rm -rf dist | tee -a "$LOG_FILE"
# npm run build | tee -a "$LOG_FILE"

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
    echo "Erro ao acessar o diretório do frontend."
    finalizar "Erro ao acessar o diretório do frontend." 1
}

{
    echo " "
    echo "VERIFICANDO O ARQUIVO .ENV DO FRONTEND"
    echo " "
} | tee -a "$LOG_FILE"

sleep 2

ENV_FILE=".env"

# Verifica se o arquivo .env existe
if [ -f "$ENV_FILE" ]; then
    # Verifica e altera SERVER_PORT para PORT, se necessário
    if grep -q "^SERVER_PORT=" "$ENV_FILE"; then
        echo "A variável SERVER_PORT foi encontrada no arquivo .env. Alterando para PORT..." | tee -a "$LOG_FILE"

        # Substitui SERVER_PORT por PORT
        sed -i 's/^SERVER_PORT=/PORT=/' "$ENV_FILE"

        echo "Alteração concluída. A variável SERVER_PORT foi renomeada para PORT no arquivo .env." | tee -a "$LOG_FILE"
    else
        echo "A variável SERVER_PORT não foi encontrada no arquivo .env. Nenhuma alteração necessária." | tee -a "$LOG_FILE"
    fi

    # Verifica e adiciona REACT_APP_MASTERADMIN, se necessário
    if grep -q "^REACT_APP_MASTERADMIN=" "$ENV_FILE"; then
        echo "A variável REACT_APP_MASTERADMIN já está presente no arquivo .env." | tee -a "$LOG_FILE"
    else
        echo "Adicionando a variável REACT_APP_MASTERADMIN ao final do arquivo .env." | tee -a "$LOG_FILE"
        echo "" >>"$ENV_FILE"
        echo "# Para permitir acesso apenas do MasterAdmin (sempre ON)" >>"$ENV_FILE"
        echo "REACT_APP_MASTERADMIN=ON" >>"$ENV_FILE"
        echo "A variável REACT_APP_MASTERADMIN foi adicionada ao final do arquivo .env." | tee -a "$LOG_FILE"
    fi
else
    echo "O arquivo .env do frontend não foi encontrado. Certifique-se de que a instalação foi concluída."
    finalizar "O arquivo .env do frontend não foi encontrado. Certifique-se de que a instalação foi concluída." 1
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

# sudo rm -rf node_modules | tee -a "$LOG_FILE"
# npm install | tee -a "$LOG_FILE"

# sudo rm -rf build | tee -a "$LOG_FILE"
# npm run build | tee -a "$LOG_FILE"

{
    echo " "
    echo "RESTART PM2"
    echo " "
} | tee -a "$LOG_FILE"

SCRIPT_DIR=$(cd "$(dirname "$0")/.." && pwd)
ENV_FILE="$SCRIPT_DIR/backend/.env"

# Verifica se o arquivo .env existe e extrai os valores necessários
if [ -f "$ENV_FILE" ]; then
    PM2_FRONTEND=$(grep "^PM2_FRONTEND=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '[:space:]')
    PM2_BACKEND=$(grep "^PM2_BACKEND=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '[:space:]')

    # Finaliza se as variáveis não forem definidas
    [ -z "$PM2_FRONTEND" ] && finalizar "PM2_FRONTEND não definido no .env." 1
    [ -z "$PM2_BACKEND" ] && finalizar "PM2_BACKEND não definido no .env." 1

    echo "Caminho calculado para o arquivo .env: $ENV_FILE" | tee -a "$LOG_FILE"
    echo "PM2_FRONTEND: $PM2_FRONTEND" | tee -a "$LOG_FILE"
    echo "PM2_BACKEND: $PM2_BACKEND" | tee -a "$LOG_FILE"

    # Verifica e restaura os processos do PM2
    sudo -u deploy pm2 resurrect | tee -a "$LOG_FILE"
    sudo -u deploy pm2 list | tee -a "$LOG_FILE"

    # Reinicia os processos especificados no .env
    sudo -u deploy pm2 restart "$PM2_FRONTEND" --update-env | tee -a "$LOG_FILE" || finalizar "Erro ao reiniciar $PM2_FRONTEND." 1
    sudo -u deploy pm2 restart "$PM2_BACKEND" --update-env | tee -a "$LOG_FILE" || finalizar "Erro ao reiniciar $PM2_BACKEND." 1

else
    finalizar "Erro: Arquivo .env não encontrado no backend." 1
fi

{
    echo " "
    echo "PRESS TICKET ATUALIZADO COM SUCESSO!!!"
    echo "Log de atualização salvo em: $LOG_FILE"
} | tee -a "$LOG_FILE"

# Caso o script finalize corretamente
finalizar "Atualização concluída com sucesso!" 0
