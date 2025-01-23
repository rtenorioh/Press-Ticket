#!/bin/bash

# Verificar se o script está sendo executado como root
if [ "$EUID" -ne 0 ]; then
    echo "Erro: Este script precisa ser executado como root."
    exit 1
fi

COLOR="\e[38;5;92m"
GREEN="\e[32m"
RED="\e[31m"
RESET="\e[0m"
BOLD="\e[1m"

# Obter a versão automaticamente
VERSION=$(git ls-remote --tags https://github.com/rtenorioh/Press-Ticket.git | awk -F/ '{print $NF}' | sort -V | tail -n1 || echo "unknown")

# Registro do início da execução
START_TIME=$(date +%s)

# Exibir uso correto do comando
show_usage() {
    echo -e "\n\033[1;33m=== USO DO SCRIPT ===\033[0m"
    echo -e "\033[1mComando:\033[0m"
    echo -e "  \033[1;32mcurl -sSL https://install.pressticket.com.br | sudo bash -s <SENHA_DEPLOY> <NOME_EMPRESA> <URL_BACKEND> <URL_FRONTEND> <PORT_BACKEND> <PORT_FRONTEND> <USER_LIMIT> <CONNECTION_LIMIT> <EMAIL>\033[0m"
    echo -e "\n\033[1mExemplo:\033[0m"
    echo -e "  \033[1;32mcurl -sSL https://install.pressticket.com.br | sudo bash -s 'senha123' 'empresa' 'back.pressticket.com.br' 'front.pressticket.com.br' 8080 3333 3 10 'admin@pressticket.com.br'\033[0m"
    echo -e "\n\033[1;33m======================\033[0m"
    exit 1
}

# Função para validar uma URL
validate_url() {
    local url=$1
    url=$(echo "$url" | sed -E 's|^https?://||')
    if [[ ! "$url" =~ ^[a-zA-Z0-9.-]+$ ]]; then
        echo "Erro: URL inválida - $url"
        return 1
    fi
    if ! host "$url" &>/dev/null; then
        echo "Erro: DNS da URL $url ainda não foi propagado."
        return 1
    fi
    echo "$url"
    return 0
}

# Validar parâmetros
if [ $# -lt 9 ] || [ $# -gt 10 ]; then
    echo "Erro: Número incorreto de argumentos fornecido."
    usage
fi

SENHA_DEPLOY=$1
NOME_EMPRESA=$(echo "$2" | tr '[:upper:]' '[:lower:]' | tr -d ' ')
URL_BACKEND=$(validate_url "$3") || exit 1
URL_FRONTEND=$(validate_url "$4") || exit 1
PORT_BACKEND=$5
PORT_FRONTEND=$6
USER_LIMIT=$7
CONNECTION_LIMIT=$8
EMAIL=$9
BRANCH=${10:-main}

# Validar campos obrigatórios
errors=()

[[ -z "$SENHA_DEPLOY" ]] && errors+=("SENHA_DEPLOY é obrigatório.")
[[ -z "$NOME_EMPRESA" ]] && errors+=("NOME_EMPRESA é obrigatório.")
[[ ! "$PORT_BACKEND" =~ ^[0-9]+$ ]] && errors+=("PORT_BACKEND deve ser numérico.")
[[ ! "$PORT_FRONTEND" =~ ^[0-9]+$ ]] && errors+=("PORT_FRONTEND deve ser numérico.")
[[ ! "$USER_LIMIT" =~ ^[0-9]+$ ]] && errors+=("USER_LIMIT deve ser numérico.")
[[ ! "$CONNECTION_LIMIT" =~ ^[0-9]+$ ]] && errors+=("CONNECTION_LIMIT deve ser numérico.")
[[ ! "$EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]] && errors+=("EMAIL inválido.")

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
        echo "*                 PRESS TICKET - INSTALAÇÃO                *"
        echo "**************************************************************"
        echo " Versão Instalada: $VERSION                           "
        echo " Fuso Horário: $SELECTED_TZ                                 "
        echo " Hora Local: $(TZ=$SELECTED_TZ date +"%d-%m-%Y %H:%M:%S")   "
        echo " Local do log: $LOG_FILE                                    "
        echo " Tempo Total: ${MINUTES} minutos e ${SECONDS} segundos.       "
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
SELECTED_TZ=${11:-America/Sao_Paulo}

# Configuração do arquivo de log (ajustado para usar o fuso horário)
LOG_FILE="$CURRENT_LOG_DIR/install_${NOME_EMPRESA}_$(TZ=$SELECTED_TZ date +"%d-%m-%Y_%H-%M-%S").log"

# Verifica se o arquivo de log pode ser criado
if ! touch "$LOG_FILE"; then
    echo "Erro: Não foi possível criar o arquivo de log $LOG_FILE. Verifique as permissões."
    finalizar "Erro: Não foi possível criar o arquivo de log $LOG_FILE. Verifique as permissões." 1
fi

{
    if [ ${#errors[@]} -gt 0 ]; then
    echo "\nForam encontrados os seguintes erros:"
    for error in "${errors[@]}"; do
        echo "- $error"
    done
    usage
    fi
} | tee -a "$LOG_FILE"

# Função para verificar e instalar um pacote
verificar_e_instalar() {
    local pacote="$1"
    echo -e "${COLOR}Verificando se $pacote está instalado...${RESET}" | tee -a "$LOG_FILE"
    if ! dpkg -s "$pacote" &>/dev/null; then # Verifica se o pacote está instalado
        echo -e "${COLOR}$pacote não encontrado. Tentando instalar...${RESET}" | tee -a "$LOG_FILE"
        sudo apt-get update &>/dev/null | tee -a "$LOG_FILE" # Redireciona a saída de update para o log também
        sudo apt-get install -y "$pacote" &>/dev/null | tee -a "$LOG_FILE"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}$pacote instalado com sucesso.${RESET}" | tee -a "$LOG_FILE"
        else
            echo -e "${RED}Erro ao instalar $pacote.${RESET}" | tee -a "$LOG_FILE"
            exit 1
        fi
    else
        echo -e "${GREEN}$pacote já está instalado.${RESET}" | tee -a "$LOG_FILE"
    fi
}

# Verifica e instala o iproute2 (que contém o ss)
verificar_e_instalar iproute2

# Verificar se as portas já estão em uso (usando ss)
echo -e "${COLOR}Verificando portas ${PORT_BACKEND} e ${PORT_FRONTEND}...${RESET}" | tee -a "$LOG_FILE"

if ss -tuln | grep -q ":$PORT_BACKEND\b"; then
    echo -e "${RED}Erro: A porta $PORT_BACKEND já está em uso.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

if ss -tuln | grep -q ":$PORT_FRONTEND\b"; then
    echo -e "${RED}Erro: A porta $PORT_FRONTEND já está em uso.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

echo -e "${GREEN}Portas ${PORT_BACKEND} e ${PORT_FRONTEND} disponíveis.${RESET}" | tee -a "$LOG_FILE"

# Exibir as variáveis validadas
echo -e " "
cat <<EOM
*** Parâmetros recebidos e validados com sucesso: ***
* SENHA_DEPLOY: NÃO ESQUECER!
* NOME_EMPRESA: $NOME_EMPRESA
* URL_BACKEND: $URL_BACKEND
* URL_FRONTEND: $URL_FRONTEND
* PORT_BACKEND: $PORT_BACKEND
* PORT_FRONTEND: $PORT_FRONTEND
* USER_LIMIT: $USER_LIMIT
* CONNECTION_LIMIT: $CONNECTION_LIMIT
* EMAIL: $EMAIL
* BRANCH: $BRANCH
*****************************************************
EOM
echo -e " "

echo -e " "
echo -e "${COLOR}Iniciando a instalação...${RESET}" | tee -a "$LOG_FILE"
echo -e " "

echo -e " "
echo -e "${COLOR}██████╗ ██████╗ ███████╗███████╗███████╗    ████████╗██╗ ██████╗██╗  ██╗███████╗████████╗${RESET}"
echo -e "${COLOR}██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝    ╚══██╔══╝██║██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝${RESET}"
echo -e "${COLOR}██████╔╝██████╔╝█████╗  ███████╗███████╗       ██║   ██║██║     █████╔╝ █████╗     ██║   ${RESET}"
echo -e "${COLOR}██╔═══╝ ██╔══██╗██╔══╝  ╚════██║╚════██║       ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   ${RESET}"
echo -e "${COLOR}██║     ██║  ██║███████╗███████║███████║       ██║   ██║╚██████╗██║  ██╗███████╗   ██║   ${RESET}"
echo -e "${COLOR}╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝       ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ${RESET}"
echo -e "${GREEN}INSTALANDO A VERSÃO:${RESET} ${BOLD}$VERSION${RESET}"
echo -e " "

sleep 3

# Exibir mensagem com a lista de fusos horários
echo "O fuso horário padrão está definido como 'America/Sao_Paulo'."

# Pausa para o usuário ler a mensagem
sleep 3

# sleep 5

# sudo rm -f /var/lib/dpkg/updates/* | tee -a "$LOG_FILE"
# sudo dpkg --configure -a | tee -a "$LOG_FILE"

# Adicionar informações iniciais ao log
{
    echo " "
    echo "**************************************************************"
    echo "*               PRESS TICKET - LOG DE INSTALAÇÃO           *"
    echo "**************************************************************"
    echo " Versão Instalada: $VERSION                           "
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

sleep 2

# Seção 1: Preparação Inicial
echo -e "${COLOR}Preparação Inicial...${RESET}" | tee -a "$LOG_FILE"
{
    cd ~
    echo "Atualizando pacotes do sistema..."
    sudo apt-get update && sudo apt-get upgrade -y
    echo -e "${GREEN}Atualização de pacotes concluída com sucesso.${RESET}" | tee -a "$LOG_FILE"
} | tee -a "$LOG_FILE"

# Seção 2: Instalação do MySQL
echo -e "${COLOR}Instalando MySQL...${RESET}" | tee -a "$LOG_FILE"
sudo apt-get install -y mysql-server | tee -a "$LOG_FILE"

# Verificar a versão do MySQL
echo -e "${COLOR}Verificar a versão do MySQL...${RESET}" | tee -a "$LOG_FILE"
mysql --version | tee -a "$LOG_FILE"

# Verificar o status do serviço MySQL
echo -e "${COLOR}Verificar o status do serviço MySQL...${RESET}" | tee -a "$LOG_FILE"
if systemctl is-active --quiet mysql; then
    echo -e "${GREEN}O serviço MySQL está ativo.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro: O serviço MySQL não está ativo.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Criar banco de dados e configurar MySQL
echo -e "${COLOR}Criar banco de dados e configurar MySQL...${RESET}" | tee -a "$LOG_FILE"

# Verificar se o banco de dados já existe
echo -e "${COLOR}Verificando se o banco de dados $NOME_EMPRESA já existe...${RESET}" | tee -a "$LOG_FILE"
DB_EXISTS=$(sudo mysql -u root -e "SHOW DATABASES LIKE '$NOME_EMPRESA';" | grep "$NOME_EMPRESA")
if [ "$DB_EXISTS" ]; then
    echo -e "${RED}Erro: O banco de dados $NOME_EMPRESA já existe. Instalação interrompida.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Criar o banco de dados
echo -e "${COLOR}Criando o banco de dados $NOME_EMPRESA...${RESET}" | tee -a "$LOG_FILE"
{
    sudo mysql -u root <<EOF
CREATE DATABASE $NOME_EMPRESA CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE mysql;
UPDATE user SET plugin='mysql_native_password' WHERE User='root';
FLUSH PRIVILEGES;
EOF
    echo -e "${GREEN}Banco de dados criado e configuração do MySQL concluída com sucesso.${RESET}"
} | tee -a "$LOG_FILE"

# Reiniciar o MySQL
{
    echo -e "${COLOR}Reiniciando o MySQL...${RESET}"
    sudo service mysql restart
    echo -e "${GREEN}MySQL reiniciado com sucesso.${RESET}" | tee -a "$LOG_FILE"
} | tee -a "$LOG_FILE"

# Seção 3: Configuração do Usuário
echo -e "${COLOR}Configurando o usuário deploy...${RESET}" | tee -a "$LOG_FILE"

# Verificar se o usuário já existe
if id "deploy" &>/dev/null; then
    echo -e "${GREEN}Usuário deploy já existe. Alternando para o usuário deploy...${RESET}" | tee -a "$LOG_FILE"
else
    # Criar usuário caso não exista
    echo -e "${COLOR}Criando usuário deploy...${RESET}" | tee -a "$LOG_FILE"
    adduser --disabled-password --gecos "" deploy
    echo "deploy:$SENHA_DEPLOY" | chpasswd
    echo -e "${GREEN}Usuário deploy criado com sucesso.${RESET}" | tee -a "$LOG_FILE"

    # Conceder privilégios de superusuário ao usuário deploy
    echo -e "${COLOR}Concedendo privilégios de superusuário ao usuário deploy...${RESET}" | tee -a "$LOG_FILE"
    usermod -aG sudo deploy
    echo -e "${GREEN}Privilégios de superusuário concedidos ao usuário deploy.${RESET}" | tee -a "$LOG_FILE"
fi

# Alternar para o usuário deploy
echo -e "${COLOR}Alternando para o usuário deploy...${RESET}" | tee -a "$LOG_FILE"
sudo -u deploy -H bash -c "echo 'Usuário deploy configurado e pronto para uso.'"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Alternância para o usuário deploy bem-sucedida.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao alternar para o usuário deploy.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Seção 4: Instalação do Node.js e Dependências

# Baixando Node.js 20.x
echo -e "${COLOR}Baixando Node.js 20.x...${RESET}" | tee -a "$LOG_FILE"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Node.js 20.x baixado com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao baixar Node.js 20.x. Verifique sua conexão com a internet.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Instalando Node.js
echo -e "${COLOR}Instalando Node.js e NPM...${RESET}" | tee -a "$LOG_FILE"
sudo apt-get install -y nodejs | tee -a "$LOG_FILE"
sudo npm install -g npm@latest | tee -a "$LOG_FILE"

if [ $? -eq 0 ]; then
    NODE_VERSION=$(node -v)
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}Node.js (${NODE_VERSION}) e NPM (${NPM_VERSION}) instalados com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao instalar Node.js ou NPM.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Instalando bibliotecas adicionais
echo -e "${COLOR}Instalando bibliotecas adicionais...${RESET}" | tee -a "$LOG_FILE"
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common git ffmpeg | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Bibliotecas adicionais instaladas com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao instalar bibliotecas adicionais.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Atualizando pacotes
echo -e "${COLOR}Atualizando pacotes...${RESET}" | tee -a "$LOG_FILE"
sudo apt-get update | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Pacotes atualizados com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao atualizar pacotes.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Adicionando o usuário atual ao grupo MySQL
echo -e "\e[32mAdicionando o usuário atual ao grupo mysql...${RESET}" | tee -a "$LOG_FILE"
sudo usermod -aG mysql ${USER} | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Usuário adicionado ao grupo mysql com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao adicionar o usuário ao grupo mysql.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Realizando a troca de login para carregar as variáveis de ambiente
echo -e "${GREEN}Realizando a troca de login para o usuário atual sem interação...${RESET}" | tee -a "$LOG_FILE"

{
    echo "$SENHA_DEPLOY" | sudo -S -u deploy bash -c "source ~/.bashrc"
} | tee -a "$LOG_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Troca de login realizada com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao realizar a troca de login.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

## Seção 5: Instalação do Chrome e Dependências

# Instalando bibliotecas necessárias para o Chrome
echo -e "${COLOR}Instalando bibliotecas necessárias para o Chrome...${RESET}" | tee -a "$LOG_FILE"
sudo apt-get install -y libgbm-dev wget unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Bibliotecas necessárias instaladas com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao instalar bibliotecas necessárias para o Chrome.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Baixando o Google Chrome
echo -e "${COLOR}Baixando o Google Chrome...${RESET}" | tee -a "$LOG_FILE"
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Google Chrome baixado com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao baixar o Google Chrome.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Instalando o Google Chrome
echo -e "${COLOR}Instalando o Google Chrome...${RESET}" | tee -a "$LOG_FILE"
sudo apt-get install -y ./google-chrome-stable_current_amd64.deb | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Google Chrome instalado com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao instalar o Google Chrome.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Excluindo o pacote de instalação do Google Chrome
echo -e "${COLOR}Excluindo o pacote de instalação do Google Chrome...${RESET}" | tee -a "$LOG_FILE"
sudo rm -f google-chrome-stable_current_amd64.deb | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Pacote de instalação excluído com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao excluir o pacote de instalação.${RESET}" | tee -a "$LOG_FILE"
fi

## Seção 6: Instalação do Press Ticket

# Garantir que o diretório home do usuário deploy seja usado
DEPLOY_HOME=$(eval echo ~deploy)

# Trocar para o usuário deploy e clonar o repositório
echo -e "${COLOR}Clonando o repositório como o usuário deploy...${RESET}" | tee -a "$LOG_FILE"
sudo -u deploy bash -c "cd $DEPLOY_HOME && git clone --branch $BRANCH https://github.com/rtenorioh/Press-Ticket.git $NOME_EMPRESA" | tee -a "$LOG_FILE"
sudo chown -R deploy:deploy "$DEPLOY_HOME/$NOME_EMPRESA" | tee -a "$LOG_FILE"

# Verificar se o repositório foi clonado com sucesso
if [ -d "$DEPLOY_HOME/$NOME_EMPRESA" ]; then
    echo -e "${GREEN}Repositório clonado com sucesso no diretório do usuário deploy.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao clonar o repositório no diretório do usuário deploy.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

## Seção 7: Configuração do Backend

# Gerando as chaves JWT_SECRET e JWT_REFRESH_SECRET
echo -e "${COLOR}Gerando as chaves JWT_SECRET e JWT_REFRESH_SECRET...${RESET}" | tee -a "$LOG_FILE"
JWT_SECRET=$(openssl rand -base64 32)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}JWT_SECRET gerado com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao gerar JWT_SECRET.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

JWT_REFRESH_SECRET=$(openssl rand -base64 32)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}JWT_REFRESH_SECRET gerado com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao gerar JWT_REFRESH_SECRET.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Editando o arquivo .env
echo -e "${COLOR}Criando o arquivo .env com as configurações...${RESET}" | tee -a "$LOG_FILE"
cat <<EOF >"$DEPLOY_HOME/$NOME_EMPRESA/backend/.env"
NODE_ENV=production

# URLs e Portas
BACKEND_URL=$URL_BACKEND
FRONTEND_URL=$URL_FRONTEND
WEBHOOK=$URL_BACKEND
PORT=$PORT_BACKEND
PROXY_PORT=443

# Caminho do Chrome
CHROME_BIN=/usr/bin/google-chrome-stable

# Dados de acesso ao Banco de dados
DB_DIALECT=mysql
DB_HOST=localhost
DB_TIMEZONE=-03:00
DB_USER=root
DB_PASS=
DB_NAME=$NOME_EMPRESA

# Limitar Usuários e Conexões
USER_LIMIT=$USER_LIMIT
CONNECTIONS_LIMIT=$CONNECTION_LIMIT

# ID do PM2 do Frontend e Backend para poder ser restartado na tela de Conexões
PM2_FRONTEND=1
PM2_BACKEND=0

# Modo DEMO que evita alterar algumas funções, para ativar: ON
DEMO=OFF

# Permitir a rotação de tokens
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Arquivo .env criado com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao criar o arquivo .env.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Acessando o diretório do backend
echo -e "${COLOR}Acessando o diretório do backend...${RESET}" | tee -a "$LOG_FILE"
cd "$DEPLOY_HOME/$NOME_EMPRESA/backend" | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Diretório do backend acessado com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao acessar o diretório do backend.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Instalando as dependências
echo -e "${COLOR}Instalando dependências do backend...${RESET}" | tee -a "$LOG_FILE"
npm install | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Dependências instaladas com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao instalar dependências.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Compilando o backend
echo -e "${COLOR}Compilando o backend...${RESET}" | tee -a "$LOG_FILE"
npm run build | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Backend compilado com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao compilar o backend.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Criando as tabelas no banco de dados
echo -e "${COLOR}Criando tabelas no banco de dados...${RESET}" | tee -a "$LOG_FILE"
npx sequelize db:migrate | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Tabelas criadas com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao criar tabelas no banco de dados.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Inserindo dados nas tabelas
echo -e "${COLOR}Inserindo dados nas tabelas...${RESET}" | tee -a "$LOG_FILE"
npx sequelize db:seed:all | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Dados inseridos com sucesso nas tabelas.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao inserir dados nas tabelas.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Instalando o PM2
echo -e "${COLOR}Instalando o PM2...${RESET}" | tee -a "$LOG_FILE"
sudo npm install -g pm2 | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}PM2 instalado com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao instalar o PM2.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Iniciando o backend com PM2
echo -e "${COLOR}Iniciando o backend usando PM2...${RESET}" | tee -a "$LOG_FILE"
pm2 start dist/server.js --name $NOME_EMPRESA-back | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Backend iniciado com sucesso pelo PM2.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao iniciar o backend pelo PM2.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Configurando o PM2 para inicialização automática
echo -e "${COLOR}Configurando o PM2 para inicialização automática...${RESET}" | tee -a "$LOG_FILE"
sudo env PATH=$PATH:/usr/bin pm2 startup ubuntu -u deploy --hp /home/deploy | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}PM2 configurado para inicialização automática com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao configurar o PM2 para inicialização automática.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

## Seção 8: Configuração do Frontend

# Acessando o diretório do frontend
echo -e "${COLOR}Acessando o diretório do frontend...${RESET}" | tee -a "$LOG_FILE"
cd ../frontend | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Diretório do frontend acessado com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao acessar o diretório do frontend.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Instalando as dependências
echo -e "${COLOR}Instalando dependências do frontend...${RESET}" | tee -a "$LOG_FILE"
npm install | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Dependências do frontend instaladas com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao instalar dependências do frontend.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Criando o arquivo .env para o frontend
echo -e "${COLOR}Criando o arquivo .env para o frontend...${RESET}" | tee -a "$LOG_FILE"
cat <<EOF >.env
# URL BACKEND
REACT_APP_BACKEND_URL=$URL_BACKEND

# Tempo de encerramento automático dos tickets em horas
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=

# Porta do frontend
PORT=$PORT_FRONTEND

# Para permitir acesso apenas do MasterAdmin (sempre ON)
REACT_APP_MASTERADMIN=ON
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Arquivo .env do frontend criado com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao criar o arquivo .env do frontend.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Compilando o frontend
echo -e "${COLOR}Compilando o frontend...${RESET}" | tee -a "$LOG_FILE"
npm run build | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Frontend compilado com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao compilar o frontend.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Iniciando o frontend com PM2
echo -e "${COLOR}Iniciando o frontend com PM2...${RESET}" | tee -a "$LOG_FILE"
pm2 start server.js --name ${NOME_EMPRESA}-front | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Frontend iniciado com sucesso pelo PM2.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao iniciar o frontend pelo PM2.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Salvando os serviços iniciados pelo PM2
echo -e "${COLOR}Salvando os serviços iniciados pelo PM2...${RESET}" | tee -a "$LOG_FILE"
pm2 save | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Serviços do PM2 salvos com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao salvar os serviços do PM2.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Listando os serviços iniciados pelo PM2
echo -e "${COLOR}Listando os serviços iniciados pelo PM2...${RESET}" | tee -a "$LOG_FILE"
pm2 list | tee -a "$LOG_FILE"

# Capturando os IDs do PM2 para frontend e backend
echo -e "${COLOR}Capturando os IDs dos serviços do PM2...${RESET}" | tee -a "$LOG_FILE"
PM2_FRONTEND_ID=$(pm2 list | grep ${NOME_EMPRESA}-front | awk '{print $2}')
PM2_BACKEND_ID=$(pm2 list | grep Press-Ticket-backend | awk '{print $2}')

if [ -z "$PM2_FRONTEND_ID" ] || [ -z "$PM2_BACKEND_ID" ]; then
    echo -e "${RED}Erro ao capturar os IDs do PM2.${RESET}" | tee -a "$LOG_FILE"
    exit 1
else
    echo -e "${GREEN}IDs do PM2 capturados com sucesso: Frontend: $PM2_FRONTEND_ID, Backend: $PM2_BACKEND_ID.${RESET}" | tee -a "$LOG_FILE"
fi

# Atualizando o arquivo .env do backend com os IDs do PM2
echo -e "${COLOR}Atualizando o arquivo .env do backend com os IDs do PM2...${RESET}" | tee -a "$LOG_FILE"
sed -i "s/^PM2_FRONTEND=.*/PM2_FRONTEND=$PM2_FRONTEND_ID/" "$NOME_EMPRESA/backend/.env"
sed -i "s/^PM2_BACKEND=.*/PM2_BACKEND=$PM2_BACKEND_ID/" "$NOME_EMPRESA/backend/.env"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Arquivo .env do backend atualizado com os IDs do PM2 com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao atualizar o arquivo .env do backend com os IDs do PM2.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

## Seção 9: Configuração do Nginx

# Instalando o Nginx
echo -e "${COLOR}Instalando o Nginx...${RESET}" | tee -a "$LOG_FILE"
sudo apt install -y nginx | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Nginx instalado com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao instalar o Nginx.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Criando e configurando o arquivo do frontend
echo -e "${COLOR}Configurando o arquivo do frontend no Nginx...${RESET}" | tee -a "$LOG_FILE"
cat <<EOF | sudo tee /etc/nginx/sites-available/$NOME_EMPRESA-front
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

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Arquivo de configuração do frontend criado com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao criar o arquivo de configuração do frontend.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Criando e configurando o arquivo do backend
echo -e "${COLOR}Configurando o arquivo do backend no Nginx...${RESET}" | tee -a "$LOG_FILE"
cat <<EOF | sudo tee /etc/nginx/sites-available/$NOME_EMPRESA-back
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

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Arquivo de configuração do backend criado com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao criar o arquivo de configuração do backend.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Criando links simbólicos para os arquivos de configuração
echo -e "${COLOR}Criando links simbólicos para o Nginx...${RESET}" | tee -a "$LOG_FILE"
sudo ln -s /etc/nginx/sites-available/$NOME_EMPRESA-front /etc/nginx/sites-enabled | tee -a "$LOG_FILE"
sudo ln -s /etc/nginx/sites-available/$NOME_EMPRESA-back /etc/nginx/sites-enabled | tee -a "$LOG_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Links simbólicos criados com sucesso.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao criar links simbólicos.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Adicionando configuração ao nginx.conf
echo -e "${COLOR}Adicionando configuração ao nginx.conf...${RESET}" | tee -a "$LOG_FILE"

# Verificar se client_max_body_size já existe
if grep -q "client_max_body_size" /etc/nginx/nginx.conf; then
    echo -e "${COLOR}client_max_body_size já existe. Atualizando para 50M...${RESET}" | tee -a "$LOG_FILE"
    sudo sed -i 's/client_max_body_size [0-9]*M;/client_max_body_size 50M;/' /etc/nginx/nginx.conf | tee -a "$LOG_FILE"
    echo -e "${GREEN}Configuração de client_max_body_size atualizada para 50M.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${COLOR}client_max_body_size não encontrado. Adicionando configuração para 50M...${RESET}" | tee -a "$LOG_FILE"
    sudo sed -i '/http {/a \    client_max_body_size 50M;' /etc/nginx/nginx.conf | tee -a "$LOG_FILE"
    echo -e "${GREEN}Configuração de client_max_body_size adicionada com sucesso.${RESET}" | tee -a "$LOG_FILE"
fi

# Testando e reiniciando o Nginx
echo -e "${COLOR}Testando e reiniciando o Nginx...${RESET}" | tee -a "$LOG_FILE"
sudo nginx -t | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    sudo service nginx restart | tee -a "$LOG_FILE"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Nginx reiniciado com sucesso.${RESET}" | tee -a "$LOG_FILE"
    else
        echo -e "${RED}Erro ao reiniciar o Nginx.${RESET}" | tee -a "$LOG_FILE"
        exit 1
    fi
else
    echo -e "${RED}Erro na configuração do Nginx.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

## Seção 10: Instalação de Certificado SSL

# Instalando suporte a Snap e Certbot
echo -e "${COLOR}Verificando se Certbot já está instalado...${RESET}" | tee -a "$LOG_FILE"
if certbot --version &>/dev/null; then
    echo -e "${GREEN}Certbot já está instalado. Prosseguindo...${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${COLOR}Certbot não encontrado. Instalando Snap e Certbot...${RESET}" | tee -a "$LOG_FILE"
    sudo apt-get install -y snapd | tee -a "$LOG_FILE"
    sudo snap install --classic certbot | tee -a "$LOG_FILE"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Certbot instalado com sucesso.${RESET}" | tee -a "$LOG_FILE"
    else
        echo -e "${RED}Erro ao instalar Certbot.${RESET}" | tee -a "$LOG_FILE"
        exit 1
    fi
fi

if ! host "$URL_BACKEND" &>/dev/null || ! host "$URL_FRONTEND" &>/dev/null; then
    echo "Erro: Domínios $URL_BACKEND ou $URL_FRONTEND não possuem entradas DNS propagadas."
    exit 1
fi

# Gerando certificado SSL para backend e frontend
echo -e "${COLOR}Gerando certificado SSL para o backend...${RESET}" | tee -a "$LOG_FILE"
sudo certbot --nginx -d $URL_BACKEND -m $EMAIL --agree-tos --non-interactive | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Certificado SSL gerado com sucesso para o backend.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao gerar o certificado SSL para o backend.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Gerando certificado SSL para frontend
echo -e "${COLOR}Gerando certificado SSL para o frontend...${RESET}" | tee -a "$LOG_FILE"
sudo certbot --nginx -d $URL_FRONTEND -m $EMAIL --agree-tos --non-interactive | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Certificado SSL gerado com sucesso para o frontend.${RESET}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Erro ao gerar o certificado SSL para o frontend.${RESET}" | tee -a "$LOG_FILE"
    exit 1
fi

# Finalizando instalação
{
    echo " "
    echo -e "${COLOR}Instalação finalizada com sucesso para a empresa: $NOME_EMPRESA!${RESET}"
    echo " "
} | tee -a "$LOG_FILE"

# Registrar fim da instalação
END_TIME=$(date +%s)

# Calcular o tempo total de execução
TOTAL_TIME=$((END_TIME - START_TIME))
TOTAL_MINUTES=$((TOTAL_TIME / 60))
TOTAL_SECONDS=$((TOTAL_TIME % 60))

# Exibir o tempo de execução
{
    echo -e "${BOLD}======== Tempo de Instalação: ========${RESET}" | tee -a "$LOG_FILE"
    echo -e "${BOLD}Total:${RESET} ${TOTAL_MINUTES} minuto(s) e ${TOTAL_SECONDS} segundo(s)." | tee -a "$LOG_FILE"
    echo -e "${GREEN}-----------------------------------${RESET}" | tee -a "$LOG_FILE"
} | tee -a "$LOG_FILE"

# Exibindo resumo da instalação
echo -e "${BOLD}======== Resumo da Instalação: ========${RESET}" | tee -a "$LOG_FILE"
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
echo " " | tee -a "$LOG_FILE"
echo -e "${COLOR}Acesse o sistema e configure conforme necessário.${RESET}" | tee -a "$LOG_FILE"
echo " " | tee -a "$LOG_FILE"
echo -e "${COLOR}Obrigado por utilizar o Sistema Press Ticket!${RESET}" | tee -a "$LOG_FILE"
echo -e "${COLOR}************** Desde de 2022 ****************${RESET}" | tee -a "$LOG_FILE"
echo " " | tee -a "$LOG_FILE"

# Certifique-se de que a última linha termina corretamente:
exit 0
