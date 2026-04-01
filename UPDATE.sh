#!/bin/bash

# Verificar se há pelo menos 3GB de memória RAM livre
FREE_MEM=$(free -m | awk '/^Mem:/ {print $7}')
MIN_MEM=3000 # 3GB em MB

if [ "$FREE_MEM" -lt "$MIN_MEM" ]; then
    echo "Erro: É necessário ter pelo menos 3GB de memória RAM livre para continuar."
    echo "Memória livre atual: ${FREE_MEM}MB"
    echo "Libere mais memória e tente novamente."
    exit 1
fi

echo "Verificação de memória: OK (${FREE_MEM}MB livre)"

# Obter a versão automaticamente
VERSION=$(git ls-remote --tags https://github.com/rtenorioh/Press-Ticket.git | awk -F/ '{print $NF}' | sort -V | tail -n1 || echo "unknown")

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

    if [ "$2" -ne 0 ]; then
        # Exibir mensagem de erro, se o código de saída for diferente de 0
        echo -e "${RED}Erro:${RESET} $1" | tee -a "$LOG_FILE"
    else
        # Exibir mensagem de sucesso
        echo -e "${GREEN}$1${RESET}" | tee -a "$LOG_FILE"
    fi

    # Resumo Final com Tempo Formatado
    {
        echo " "
        echo "**************************************************************"
        echo "*                 PRESS TICKET® - ATUALIZAÇÃO                 *"
        echo "**************************************************************"
        echo " Versão Atual do Sistema: $SYSTEM_VERSION                   "
        echo " Nova Versão Atualizada: $VERSION                           "
        echo " Fuso Horário: $SELECTED_TZ                                 "
        echo " Hora Local: $(TZ=$SELECTED_TZ date +"%d-%m-%Y %H:%M:%S")   "
        echo " Local do log: $LOG_FILE                                    "
        echo " Tempo Total: ${MINUTES} minutos e ${SECONDS} segundos       "
        echo "**************************************************************"
        echo " "
    } | tee -a "$LOG_FILE"

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
YELLOW="\e[33m"
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

{
    echo " "
    echo "VERIFICANDO VERSÃO ATUAL DO SISTEMA"
    echo " "
} | tee -a "$LOG_FILE"

# Obtém a versão atual do sistema do arquivo backend/dist/config/version.js (compilado)
VERSION_JS_PATH="$SCRIPT_DIR/backend/dist/config/version.js"

if [ -f "$VERSION_JS_PATH" ]; then
    echo "Arquivo encontrado: $VERSION_JS_PATH" | tee -a "$LOG_FILE"
    # Extrai a versão do arquivo version.js compilado
    # Procura por: exports.systemVersion = "v1.13.2";
    SYSTEM_VERSION=$(grep -oP 'systemVersion\s*=\s*"\K[^"]+' "$VERSION_JS_PATH" 2>/dev/null | tail -n1)
    if [ -z "$SYSTEM_VERSION" ]; then
        SYSTEM_VERSION="Não encontrado"
        echo "Erro: Não foi possível extrair a versão do arquivo." | tee -a "$LOG_FILE"
    else
        echo "Versão atual detectada: $SYSTEM_VERSION" | tee -a "$LOG_FILE"
    fi
else
    echo "Arquivo compilado não encontrado: $VERSION_JS_PATH" | tee -a "$LOG_FILE"
    # Fallback: tenta pegar do arquivo TypeScript original se o compilado não existir
    VERSION_TS_PATH="$SCRIPT_DIR/backend/src/config/version.ts"
    if [ -f "$VERSION_TS_PATH" ]; then
        echo "Usando arquivo fonte: $VERSION_TS_PATH" | tee -a "$LOG_FILE"
        # Procura por: export const systemVersion = "v1.13.2";
        SYSTEM_VERSION=$(grep -oP 'systemVersion\s*=\s*"\K[^"]+' "$VERSION_TS_PATH" 2>/dev/null | tail -n1)
        if [ -z "$SYSTEM_VERSION" ]; then
            SYSTEM_VERSION="Não encontrado"
            echo "Erro: Não foi possível extrair a versão do arquivo." | tee -a "$LOG_FILE"
        else
            echo "Versão atual detectada: $SYSTEM_VERSION" | tee -a "$LOG_FILE"
        fi
    else
        SYSTEM_VERSION="Arquivo version não encontrado"
        echo "Erro: Nenhum arquivo de versão encontrado." | tee -a "$LOG_FILE"
    fi
fi

echo " " | tee -a "$LOG_FILE"
sleep 2

# Função para comparar versões (retorna 0 se v1 < v2, 1 se v1 >= v2)
version_compare() {
    local v1=$1
    local v2=$2
    
    # Remove o 'v' do início das versões
    v1=${v1#v}
    v2=${v2#v}
    
    # Compara as versões usando sort -V
    if [ "$(printf '%s\n' "$v1" "$v2" | sort -V | head -n1)" = "$v1" ] && [ "$v1" != "$v2" ]; then
        return 0  # v1 < v2
    else
        return 1  # v1 >= v2
    fi
}

# Verifica se precisa limpar diretórios antigos do WhatsApp Web.js
if [ "$SYSTEM_VERSION" != "Não encontrado" ] && [ "$SYSTEM_VERSION" != "Arquivo version não encontrado" ]; then
    if version_compare "$SYSTEM_VERSION" "1.14.0"; then
        {
            echo " "
            echo "**************************************************************"
            echo "*           LIMPEZA DE ARQUIVOS ANTIGOS NECESSÁRIA           *"
            echo "**************************************************************"
            echo " Versão atual detectada: $SYSTEM_VERSION"
            echo " Versões inferiores a v1.14.0 requerem limpeza de cache"
            echo "**************************************************************"
            echo " "
        } | tee -a "$LOG_FILE"
        
        echo "Removendo diretórios antigos do WhatsApp Web.js..." | tee -a "$LOG_FILE"
        
        # Remove .wwebjs_auth
        if [ -d "$SCRIPT_DIR/backend/.wwebjs_auth" ]; then
            echo "Removendo $SCRIPT_DIR/backend/.wwebjs_auth..." | tee -a "$LOG_FILE"
            sudo rm -rf "$SCRIPT_DIR/backend/.wwebjs_auth"
            if [ $? -eq 0 ]; then
                echo "✓ Diretório .wwebjs_auth removido com sucesso." | tee -a "$LOG_FILE"
            else
                echo "✗ Erro ao remover .wwebjs_auth" | tee -a "$LOG_FILE"
            fi
        else
            echo "Diretório .wwebjs_auth não encontrado (já foi removido ou não existe)." | tee -a "$LOG_FILE"
        fi
        
        # Remove .wwebjs_cache
        if [ -d "$SCRIPT_DIR/backend/.wwebjs_cache" ]; then
            echo "Removendo $SCRIPT_DIR/backend/.wwebjs_cache..." | tee -a "$LOG_FILE"
            sudo rm -rf "$SCRIPT_DIR/backend/.wwebjs_cache"
            if [ $? -eq 0 ]; then
                echo "✓ Diretório .wwebjs_cache removido com sucesso." | tee -a "$LOG_FILE"
            else
                echo "✗ Erro ao remover .wwebjs_cache" | tee -a "$LOG_FILE"
            fi
        else
            echo "Diretório .wwebjs_cache não encontrado (já foi removido ou não existe)." | tee -a "$LOG_FILE"
        fi
        
        {
            echo " "
            echo "✓ Limpeza concluída. Após a atualização, será necessário"
            echo "  reconectar todas as sessões do WhatsApp."
            echo " "
        } | tee -a "$LOG_FILE"
        
        sleep 5
    else
        echo "Versão $SYSTEM_VERSION >= v1.14.0 - Limpeza de cache não necessária." | tee -a "$LOG_FILE"
    fi
fi

{
    echo " "
    echo "VERIFICANDO O FFmpeg"
    echo " "
} | tee -a "$LOG_FILE"

sleep 2

# Verifica se o FFmpeg está instalado
if command -v ffmpeg &>/dev/null; then
    echo -e "${GREEN}FFmpeg já está instalado.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${YELLOW}FFmpeg não encontrado. Iniciando a instalação...${RESET}" | tee -a "$LOG_FILE"
    
    # Atualiza a lista de pacotes
    echo -e "${COLOR}Atualizando a lista de pacotes...${RESET}" | tee -a "$LOG_FILE"
    sudo apt-get update -y | tee -a "$LOG_FILE"

    # Instala o FFmpeg
    echo -e "${COLOR}Instalando o FFmpeg...${RESET}" | tee -a "$LOG_FILE"
    sudo apt-get install -y ffmpeg | tee -a "$LOG_FILE"

    # Verifica se a instalação foi bem-sucedida
    if command -v ffmpeg &>/dev/null; then
        echo -e "${GREEN}FFmpeg instalado com sucesso!${RESET}" | tee -a "$LOG_FILE"
    else
        echo -e "${RED}Erro ao instalar o FFmpeg. Verifique sua conexão e tente novamente.${RESET}"
        finalizar "Erro ao instalar o FFmpeg." 1
    fi
fi

# Adicionar informações iniciais ao log
{
    echo " "
    echo "**************************************************************"
    echo "*               PRESS TICKET® - LOG DE ATUALIZAÇÃO            *"
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
    UPDATE_SYSTEM=${UPDATE_SYSTEM:-n} # Define 'n' como padrão se vazio
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

    # Removendo pacotes órfãos
    echo -e "${COLOR}Removendo pacotes órfãos...${RESET}" | tee -a "$LOG_FILE"
    if sudo apt-get autoremove -y | tee -a "$LOG_FILE"; then
        echo -e "${GREEN}Pacotes órfãos removidos com sucesso.${RESET}" | tee -a "$LOG_FILE"
    else
        echo -e "${YELLOW}Aviso: Não foi possível remover todos os pacotes órfãos.${RESET}" | tee -a "$LOG_FILE"
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
        curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
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
if version_less_than "$CURRENT_NODE_VERSION" "22.0.0"; then
    {
        echo "Versão do Node.js atual ($CURRENT_NODE_VERSION) é inferior a 22."

        if [ -t 0 ]; then
            echo -e "${BOLD}${GREEN}Deseja atualizar o Node.js para a versão 22.x? (s/n)${RESET}"
            read -r UPDATE_NODE
        else
            UPDATE_NODE=$(bash -c 'read -p "Deseja atualizar o Node.js para a versão 22.x? (s/n): " REPLY; echo $REPLY' </dev/tty)
        fi

        UPDATE_NODE=${UPDATE_NODE:-n} # Define 'n' como padrão se vazio

        if [[ "$UPDATE_NODE" =~ ^[sS]$ ]]; then
            echo "Atualizando Node.js para a versão 22.x..."
            curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
            sudo apt-get install -y nodejs
            sudo npm install -g npm
            if [ $? -ne 0 ]; then
                echo "Erro ao atualizar o Node.js ou o npm. Saindo..."
                finalizar "Erro ao atualizar o Node.js ou o npm. Saindo..." 1
            fi
            echo "Node.js atualizado com sucesso para a versão 22.x."
        else
            echo "Atualização do Node.js ignorada pelo usuário." | tee -a "$LOG_FILE"
        fi
    } | tee -a "$LOG_FILE"
else
    echo "A versão do Node.js instalada ($CURRENT_NODE_VERSION) é igual ou superior a 22. Prosseguindo..." | tee -a "$LOG_FILE"
fi

sleep 2

# Verificação e atualização do Google Chrome
{
    echo " "
    echo "VERIFICANDO A VERSÃO DO GOOGLE CHROME"
    echo " "
} | tee -a "$LOG_FILE"

sleep 2

# Verifica se o Google Chrome está instalado
if command -v google-chrome &>/dev/null; then
    CURRENT_CHROME_VERSION=$(google-chrome --version 2>/dev/null | grep -oP '\d+\.\d+\.\d+\.\d+' | head -n1)
    
    if [ -n "$CURRENT_CHROME_VERSION" ]; then
        echo "Google Chrome instalado. Versão atual: $CURRENT_CHROME_VERSION" | tee -a "$LOG_FILE"
        
        # Busca a versão mais recente disponível
        echo "Verificando se há atualizações disponíveis..." | tee -a "$LOG_FILE"
        
        if [ -t 0 ]; then
            echo -e "${BOLD}${GREEN}Deseja atualizar o Google Chrome para a versão mais recente? (s/n)${RESET}"
            read -r UPDATE_CHROME
        else
            UPDATE_CHROME=$(bash -c 'read -p "Deseja atualizar o Google Chrome para a versão mais recente? (s/n): " REPLY; echo $REPLY' </dev/tty)
        fi
        
        UPDATE_CHROME=${UPDATE_CHROME:-n} # Define 'n' como padrão se vazio
        
        if [[ "$UPDATE_CHROME" =~ ^[sS]$ ]]; then
            echo "Atualizando Google Chrome..." | tee -a "$LOG_FILE"
            
            # Baixa e instala a versão mais recente
            cd /tmp || exit
            wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
            
            if [ -f "google-chrome-stable_current_amd64.deb" ]; then
                sudo dpkg -i google-chrome-stable_current_amd64.deb 2>&1 | tee -a "$LOG_FILE"
                sudo apt-get install -f -y 2>&1 | tee -a "$LOG_FILE"
                rm google-chrome-stable_current_amd64.deb
                
                # Verifica a nova versão instalada
                NEW_CHROME_VERSION=$(google-chrome --version 2>/dev/null | grep -oP '\d+\.\d+\.\d+\.\d+' | head -n1)
                if [ -n "$NEW_CHROME_VERSION" ]; then
                    echo "Google Chrome atualizado com sucesso para a versão: $NEW_CHROME_VERSION" | tee -a "$LOG_FILE"
                else
                    echo "Erro ao verificar a nova versão do Chrome." | tee -a "$LOG_FILE"
                fi
            else
                echo "Erro ao baixar o Google Chrome." | tee -a "$LOG_FILE"
            fi
            
            cd "$SCRIPT_DIR" || exit
        else
            echo "Atualização do Google Chrome ignorada pelo usuário." | tee -a "$LOG_FILE"
        fi
    else
        echo "Erro ao detectar a versão do Google Chrome." | tee -a "$LOG_FILE"
    fi
else
    echo "Google Chrome não está instalado." | tee -a "$LOG_FILE"
    
    if [ -t 0 ]; then
        echo -e "${BOLD}${GREEN}Deseja instalar o Google Chrome? (s/n)${RESET}"
        read -r INSTALL_CHROME
    else
        INSTALL_CHROME=$(bash -c 'read -p "Deseja instalar o Google Chrome? (s/n): " REPLY; echo $REPLY' </dev/tty)
    fi
    
    INSTALL_CHROME=${INSTALL_CHROME:-n} # Define 'n' como padrão se vazio
    
    if [[ "$INSTALL_CHROME" =~ ^[sS]$ ]]; then
        echo "Instalando Google Chrome..." | tee -a "$LOG_FILE"
        
        cd /tmp || exit
        wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
        
        if [ -f "google-chrome-stable_current_amd64.deb" ]; then
            sudo dpkg -i google-chrome-stable_current_amd64.deb 2>&1 | tee -a "$LOG_FILE"
            sudo apt-get install -f -y 2>&1 | tee -a "$LOG_FILE"
            rm google-chrome-stable_current_amd64.deb
            
            # Verifica se a instalação foi bem-sucedida
            if command -v google-chrome &>/dev/null; then
                INSTALLED_CHROME_VERSION=$(google-chrome --version 2>/dev/null | grep -oP '\d+\.\d+\.\d+\.\d+' | head -n1)
                echo "Google Chrome instalado com sucesso. Versão: $INSTALLED_CHROME_VERSION" | tee -a "$LOG_FILE"
            else
                echo "Erro ao instalar o Google Chrome." | tee -a "$LOG_FILE"
            fi
        else
            echo "Erro ao baixar o Google Chrome." | tee -a "$LOG_FILE"
        fi
        
        cd "$SCRIPT_DIR" || exit
    else
        echo "Instalação do Google Chrome ignorada pelo usuário." | tee -a "$LOG_FILE"
    fi
fi

sleep 2

{
    echo " "
    echo "BAIXANDO AS ATUALIZAÇÕES"
    echo " "
} | tee -a "$LOG_FILE"

sleep 2

# Garantir que está na branch main
echo -e "${COLOR}Mudando para a branch main...${RESET}" | tee -a "$LOG_FILE"
if git checkout main 2>&1 | tee -a "$LOG_FILE"; then
    echo -e "${GREEN}Branch main selecionada com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${YELLOW}Aviso: Não foi possível mudar para a branch main.${RESET}" | tee -a "$LOG_FILE"
fi

git reset --hard 2>&1 | tee -a "$LOG_FILE"
git pull 2>&1 | tee -a "$LOG_FILE"

{
    echo " "
    echo "ACESSANDO O BACKEND"
    echo " "
} | tee -a "$LOG_FILE"

sleep 2

echo -e "${COLOR}Alterando proprietário e permissões dos arquivos...${RESET}" | tee -a "$LOG_FILE"

# Validação de segurança: garantir que o caminho alvo é válido e não é a raiz do sistema
if [ -z "$SCRIPT_DIR" ] || [ "$SCRIPT_DIR" = "/" ] || [ "$SCRIPT_DIR" = "/." ]; then
    echo -e "${RED}Erro: Caminho inválido ou perigoso detectado: '$SCRIPT_DIR'. Abortando chown/chmod.${RESET}" | tee -a "$LOG_FILE"
    finalizar "Erro: Caminho inválido detectado. Operação abortada por segurança." 1
fi

# Alterar o proprietário dos arquivos
sudo chown -R deploy:deploy "$SCRIPT_DIR" | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Proprietário dos arquivos alterado com sucesso para o usuário 'deploy'.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro: Falha ao alterar o proprietário dos arquivos. Verifique as permissões.${RESET}"
    finalizar "Erro: Falha ao alterar o proprietário dos arquivos. Verifique as permissões." 1
fi

sleep 2

# Alterar as permissões dos arquivos
sudo chmod -R u+rwX "$SCRIPT_DIR" | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Permissões dos arquivos ajustadas com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro: Falha ao ajustar as permissões dos arquivos. Verifique as permissões.${RESET}"
    finalizar "Erro: Falha ao ajustar as permissões dos arquivos. Verifique as permissões." 1
fi

echo -e "${GREEN}Proprietário e permissões configurados corretamente para o diretório: $SCRIPT_DIR.${RESET}" | tee -a "$LOG_FILE"

cd backend || {
    echo "Erro ao acessar o diretório do backend."
    finalizar "Erro ao acessar o diretório do backend." 1
}

sleep 2 

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

# Verificação do arquivo .env no backend
ENV_FILE=".env"

{
    echo " "
    echo "VERIFICANDO O ARQUIVO .env DO BACKEND"
    echo " "
} | tee -a "$LOG_FILE"

# Verifica se o arquivo .env existe
if [ -f "$ENV_FILE" ]; then
    # Verifica se NODE_ENV=production existe no arquivo .env
    if grep -q "^NODE_ENV=production" "$ENV_FILE"; then
        echo "A variável NODE_ENV já está configurada como production no arquivo .env." | tee -a "$LOG_FILE"
    else
        if grep -q "^NODE_ENV=" "$ENV_FILE"; then
            sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' "$ENV_FILE"
            echo "A variável NODE_ENV foi atualizada para production no arquivo .env." | tee -a "$LOG_FILE"
        else
            sed -i '1iNODE_ENV=production' "$ENV_FILE"
            echo "A variável NODE_ENV=production foi adicionada no início do arquivo .env." | tee -a "$LOG_FILE"
        fi
    fi
    
    # Verifica se a variável COMPANY_NAME existe no arquivo .env
    if grep -q "^COMPANY_NAME=" "$ENV_FILE"; then
        echo "A variável COMPANY_NAME já existe no arquivo .env. Nenhuma alteração necessária." | tee -a "$LOG_FILE"
    else
        # Obter o nome da empresa a partir do diretório atual
        NOME_EMPRESA=$(basename "$(dirname "$ENV_FILE")")
        echo "# Nome da Empresa" >> "$ENV_FILE"
        echo "COMPANY_NAME=$NOME_EMPRESA" >> "$ENV_FILE"
        echo "A variável COMPANY_NAME=$NOME_EMPRESA foi adicionada ao arquivo .env com sucesso." | tee -a "$LOG_FILE"
    fi

    # Verifica se a variável DEVICE_NAME existe no arquivo .env
    if grep -q "^DEVICE_NAME=" "$ENV_FILE"; then
        echo "A variável DEVICE_NAME já existe no arquivo .env. Nenhuma alteração necessária." | tee -a "$LOG_FILE"
    else
        # Obter o nome da empresa a partir do diretório atual
        NOME_EMPRESA=$(basename "$(dirname "$ENV_FILE")")
        echo "# Nome da Empresa" >> "$ENV_FILE"
        echo "DEVICE_NAME=$NOME_EMPRESA" >> "$ENV_FILE"
        echo "A variável DEVICE_NAME=$NOME_EMPRESA foi adicionada ao arquivo .env com sucesso." | tee -a "$LOG_FILE"
    fi

    # Verifica se a variável WEBHOOK existe no arquivo .env
    if grep -q "^WEBHOOK=" "$ENV_FILE"; then
        echo "A variável WEBHOOK já existe no arquivo .env. Nenhuma alteração necessária." | tee -a "$LOG_FILE"
    else
        BACKEND_URL=$(grep "^BACKEND_URL=" "$ENV_FILE" | cut -d '=' -f2- | tr -d '[:space:]')
        if [ -n "$BACKEND_URL" ]; then
            echo "WEBHOOK=$BACKEND_URL" >>"$ENV_FILE"
            echo "A variável WEBHOOK foi adicionada ao arquivo .env com sucesso." | tee -a "$LOG_FILE"
        else
            echo "Erro: Não foi possível encontrar a variável BACKEND_URL no arquivo .env." | tee -a "$LOG_FILE"
            finalizar "Erro ao configurar a variável WEBHOOK devido à ausência de BACKEND_URL." 1
        fi
    fi

    # Verifica se PM2_FRONTEND existe no arquivo .env
    if grep -q "^PM2_FRONTEND=" "$ENV_FILE"; then
        echo "A variável PM2_FRONTEND já existe no arquivo .env." | tee -a "$LOG_FILE"
    else
        # Obter o nome da empresa a partir do diretório atual
        NOME_EMPRESA=$(basename "$(dirname "$ENV_FILE")")
        echo "# Nome do PM2 do Frontend e Backend para poder ser restartado na tela de Conexões" >> "$ENV_FILE"
        echo "PM2_FRONTEND=${NOME_EMPRESA}-front" >>"$ENV_FILE"
        echo "A variável PM2_FRONTEND=${NOME_EMPRESA}-front foi adicionada ao arquivo .env." | tee -a "$LOG_FILE"
    fi

    # Verifica se PM2_BACKEND existe no arquivo .env
    if grep -q "^PM2_BACKEND=" "$ENV_FILE"; then
        echo "A variável PM2_BACKEND já existe no arquivo .env." | tee -a "$LOG_FILE"
    else
        # Obter o nome da empresa a partir do diretório atual (se não foi definido acima)
        NOME_EMPRESA=${NOME_EMPRESA:-$(basename "$(dirname "$ENV_FILE")")}
        echo "PM2_BACKEND=${NOME_EMPRESA}-back" >>"$ENV_FILE"
        echo "A variável PM2_BACKEND=${NOME_EMPRESA}-back foi adicionada ao arquivo .env." | tee -a "$LOG_FILE"
    fi

else
    echo "Erro: O arquivo .env não foi encontrado no diretório backend."
    finalizar "Erro ao localizar o arquivo .env no backend." 1
fi

{
    echo " "
    echo "ATUALIZANDO OS ARQUIVOS DO BACKEND"
    echo " "
} | tee -a "$LOG_FILE"

sleep 2

sudo rm -rf node_modules 2>&1 | tee -a "$LOG_FILE"
npm install 2>&1 | tee -a "$LOG_FILE"

sudo rm -rf dist 2>&1 | tee -a "$LOG_FILE"
npm run build 2>&1 | tee -a "$LOG_FILE"

{
    echo " "
    echo "EXECUTANDO O DB:MIGRATE"
    echo " "
} | tee -a "$LOG_FILE"

sleep 2

npx sequelize db:migrate 2>&1 | tee -a "$LOG_FILE"

{
    echo " "
    echo "EXECUTANDO O DB:SEED:ALL"
    echo " "
} | tee -a "$LOG_FILE"

sleep 2

npx sequelize db:seed:all 2>&1 | tee -a "$LOG_FILE"

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
# Verifica se NODE_ENV=production existe no arquivo .env
    if grep -q "^NODE_ENV=production" "$ENV_FILE"; then
        echo "A variável NODE_ENV já está configurada como production no arquivo .env." | tee -a "$LOG_FILE"
    else
        # Verifica se existe NODE_ENV vazio ou se não existe
        if grep -q "^NODE_ENV=" "$ENV_FILE"; then
            # Substitui a linha existente
            sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' "$ENV_FILE"
            echo "A variável NODE_ENV foi atualizada para production no arquivo .env." | tee -a "$LOG_FILE"
        else
            # Adiciona NODE_ENV=production no início do arquivo
            sed -i '1iNODE_ENV=production' "$ENV_FILE"
            echo "A variável NODE_ENV=production foi adicionada no início do arquivo .env." | tee -a "$LOG_FILE"
        fi
    fi
    
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

sudo rm -rf node_modules 2>&1 | tee -a "$LOG_FILE"
npm install 2>&1 | tee -a "$LOG_FILE"

sudo rm -rf build 2>&1 | tee -a "$LOG_FILE"
npm run build 2>&1 | tee -a "$LOG_FILE"

{
    echo " "
    echo "VERIFICANDO SECURITY HEADERS NO NGINX"
    echo " "
} | tee -a "$LOG_FILE"

sleep 2

# Obtém o nome da empresa do diretório atual
NOME_EMPRESA=$(basename "$SCRIPT_DIR")
NGINX_FRONT_CONFIG="/etc/nginx/sites-available/${NOME_EMPRESA}-front"

# Verifica se o arquivo de configuração do Nginx existe
if [ -f "$NGINX_FRONT_CONFIG" ]; then
    echo "Arquivo de configuração do Nginx encontrado: $NGINX_FRONT_CONFIG" | tee -a "$LOG_FILE"
    
    # Verifica se os security headers já existão
    if grep -q "Permissions-Policy" "$NGINX_FRONT_CONFIG"; then
        echo "Security headers já estão configurados no Nginx. Nenhuma ação necessária." | tee -a "$LOG_FILE"
    else
        echo "Security headers não encontrados. Adicionando ao Nginx..." | tee -a "$LOG_FILE"
        
        # Faz backup do arquivo original
        sudo cp "$NGINX_FRONT_CONFIG" "${NGINX_FRONT_CONFIG}.backup-$(date +%Y%m%d-%H%M%S)"
        echo "Backup criado: ${NGINX_FRONT_CONFIG}.backup-$(date +%Y%m%d-%H%M%S)" | tee -a "$LOG_FILE"
        
        # Obtém a URL do backend do .env
        BACKEND_URL=$(grep "^BACKEND_URL=" "$SCRIPT_DIR/backend/.env" | cut -d '=' -f2- | tr -d '[:space:]' | sed 's|https://||' | sed 's|http://||')
        
        if [ -z "$BACKEND_URL" ]; then
            echo "Aviso: Não foi possível obter BACKEND_URL do .env. Usando valor padrão." | tee -a "$LOG_FILE"
            BACKEND_URL="api.exemplo.com.br"
        fi
        
        # Cria arquivo temporário com os headers
        TEMP_HEADERS=$(mktemp)
        cat > "$TEMP_HEADERS" << 'EOF'
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(self), microphone=(self), camera=(self), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' https: blob:; connect-src 'self' https://BACKEND_URL_PLACEHOLDER wss://BACKEND_URL_PLACEHOLDER; frame-src 'self' https://BACKEND_URL_PLACEHOLDER https://www.youtube.com https://www.youtube-nocookie.com; object-src 'none'; base-uri 'self'; form-action 'self';" always;
EOF
        
        # Substitui o placeholder pela URL real do backend
        sed -i "s|BACKEND_URL_PLACEHOLDER|$BACKEND_URL|g" "$TEMP_HEADERS"
        
        # Adiciona os headers após a linha server_name
        sudo sed -i "/server_name/r $TEMP_HEADERS" "$NGINX_FRONT_CONFIG"
        
        # Remove arquivo temporário
        rm "$TEMP_HEADERS"
        
        echo "Security headers adicionados com sucesso ao Nginx." | tee -a "$LOG_FILE"
        
        # Testa a configuração do Nginx
        echo "Testando configuração do Nginx..." | tee -a "$LOG_FILE"
        if sudo nginx -t 2>&1 | tee -a "$LOG_FILE"; then
            echo "Configuração do Nginx válida. Recarregando..." | tee -a "$LOG_FILE"
            sudo nginx -s reload | tee -a "$LOG_FILE"
            echo "Nginx recarregado com sucesso." | tee -a "$LOG_FILE"
        else
            echo "Erro na configuração do Nginx. Restaurando backup..." | tee -a "$LOG_FILE"
            sudo cp "${NGINX_FRONT_CONFIG}.backup-$(date +%Y%m%d-%H%M%S)" "$NGINX_FRONT_CONFIG"
            sudo nginx -s reload
            echo "Backup restaurado. Continuando atualização..." | tee -a "$LOG_FILE"
        fi
    fi
    
    # Verifica e desabilita headers duplicados no server.js do frontend
    FRONTEND_SERVER_JS="$SCRIPT_DIR/frontend/server.js"
    if [ -f "$FRONTEND_SERVER_JS" ]; then
        if grep -q "frameguard: false" "$FRONTEND_SERVER_JS"; then
            echo "Headers já desabilitados no server.js do frontend." | tee -a "$LOG_FILE"
        else
            echo "Desabilitando headers duplicados no server.js..." | tee -a "$LOG_FILE"
            
            # Faz backup
            cp "$FRONTEND_SERVER_JS" "${FRONTEND_SERVER_JS}.backup-$(date +%Y%m%d-%H%M%S)"
            
            # Substitui a configuração do helmet
            sed -i '/helmet({/,/})/c\
\thelmet({\
\t\tcontentSecurityPolicy: false,\
\t\tcrossOriginEmbedderPolicy: false,\
\t\tframeguard: false,\
\t\txContentTypeOptions: false,\
\t\txXssProtection: false,\
\t\treferrerPolicy: false,\
\t\tpermissionsPolicy: false,\
\t})' "$FRONTEND_SERVER_JS"
            
            echo "Headers desabilitados no server.js com sucesso." | tee -a "$LOG_FILE"
        fi
    fi
else
    echo "Aviso: Arquivo de configuração do Nginx não encontrado: $NGINX_FRONT_CONFIG" | tee -a "$LOG_FILE"
    echo "Security headers não foram adicionados automaticamente." | tee -a "$LOG_FILE"
fi

sleep 2

{
    echo " "
    echo "RESTART PM2"
    echo " "
} | tee -a "$LOG_FILE"

SCRIPT_DIR=$(cd "$(dirname "$0")/.." && pwd)
ENV_FILE="$SCRIPT_DIR/backend/.env"

# Verifica se o arquivo .env existe e extrai os nomes dos processos PM2
if [ -f "$ENV_FILE" ]; then
    PM2_FRONTEND_NAME=$(grep "^PM2_FRONTEND=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '[:space:]')
    PM2_BACKEND_NAME=$(grep "^PM2_BACKEND=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '[:space:]')

    # Finaliza se os nomes não forem definidos
    [ -z "$PM2_FRONTEND_NAME" ] && finalizar "PM2_FRONTEND não definido no .env." 1
    [ -z "$PM2_BACKEND_NAME" ] && finalizar "PM2_BACKEND não definido no .env." 1

    echo "Caminho calculado para o arquivo .env: $ENV_FILE" | tee -a "$LOG_FILE"
    echo "PM2_FRONTEND_NAME: $PM2_FRONTEND_NAME" | tee -a "$LOG_FILE"
    echo "PM2_BACKEND_NAME: $PM2_BACKEND_NAME" | tee -a "$LOG_FILE"

    # Reinicia os processos especificados usando os nomes
    sudo -u deploy pm2 restart "$PM2_FRONTEND_NAME" --update-env | tee -a "$LOG_FILE" || finalizar "Erro ao reiniciar PM2_FRONTEND com nome $PM2_FRONTEND_NAME." 1
    sudo -u deploy pm2 restart "$PM2_BACKEND_NAME" --update-env | tee -a "$LOG_FILE" || finalizar "Erro ao reiniciar PM2_BACKEND com nome $PM2_BACKEND_NAME." 1

else
    finalizar "Erro: Arquivo .env não encontrado no backend." 1
fi

# Caso o script finalize corretamente
finalizar "Atualização concluída com sucesso!" 0
