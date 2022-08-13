#!/bin/bash
echo " "
echo "ATUALIZANDO PARA A VERSÃO MAIS RECENTE DO PRESS TICKET!"
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
sudo rm -rf dist
npm run build

echo " "
echo "EXECUTANDO O MIGRATE E SEED"
echo " "

sleep 2

npx sequelize db:migrate
npx sequelize db:seed

echo " "
echo "ACESSANDO O FRONTEND"
echo " "

sleep 2

cd ../frontend

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