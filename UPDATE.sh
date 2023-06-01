#!/bin/bash
echo ""
echo '
███╗   ███╗██╗  ██╗████████╗██╗  ██╗██╗   ██╗██████╗ 
████╗ ████║██║ ██╔╝╚══██╔══╝██║  ██║██║   ██║██╔══██╗
██╔████╔██║█████╔╝    ██║   ███████║██║   ██║██████╔╝
██║╚██╔╝██║██╔═██╗    ██║   ██╔══██║██║   ██║██╔══██╗
██║ ╚═╝ ██║██║  ██╗   ██║   ██║  ██║╚██████╔╝██████╔╝
╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ 
'
echo " "
echo "ATUALIZANDO PARA A VERSÃO MAIS RECENTE..."
echo " "

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
  echo "Aruivo config.json já criado"
fi

sleep 2

 echo " "
  echo "ATUALIZANDO MARIADB"
  echo " "
# Verificar a versão do MariaDB
mariadb_version=$(mysql -V | awk '{print $5}')
version=$(echo "$mariadb_version" | tr -d '.' | grep -o '[0-9]*')

# Converter a versão para um número inteiro
version_int=$((version))

if [ "$version_int" -ge 10520 ]; then
  echo "Versão do MariaDB é igual ou superior a 10.5.20"
else
  echo " "
  echo "ATUALIZANDO MARIADB"
  echo " "
  sleep 2
  sudo apt-key adv --fetch-keys 'https://mariadb.org/mariadb_release_signing_key.asc'
  sleep 2
  sudo add-apt-repository 'deb [arch=amd64,arm64,ppc64el] http://mirror.23media.de/mariadb/repo/10.5/ubuntu focal main'
  sleep 2
  sudo apt update
  sleep 2
  sudo apt install mariadb-server
  sleep 2
  sudo systemctl restart mariadb
  sleep 2
fi

sleep 2

echo " "
echo "ATUALIZANDO OS ARQUIVOS DO FRONTEND"
echo " "

sleep 2

sudo rm -rf node_modules
npm install --force
npm run build

echo " "
echo "RESTART PM2"
echo " "

sleep 2

pm2 restart all

echo " "
echo "SERVIDOR ATUALIZADO!!!"
echo " "