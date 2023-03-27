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
  echo "Atualizando o arquivo config.json"
  rm src/config.json
  cp src/config.json.example src/config.json
fi


sleep 2

echo " "
echo "ATUALIZANDO OS ARQUIVOS DO FRONTEND"
echo " "

sleep 2

sudo rm -rf node_modules
npm install
npm run build

echo " "
echo "RESTART PM2"
echo " "

sleep 2

pm2 restart all

echo " "
echo "SERVIDOR ATUALIZADO!!!"
echo " "