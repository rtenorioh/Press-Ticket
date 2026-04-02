# Manual de Instalação do Press Ticket® em VPS com Docker

> Guia para instalação em produção com subdomínios e HTTPS via Let's Encrypt.

---

## Pré-requisitos

### Na VPS (Ubuntu 22.04 / Debian 12 recomendado)

- Mínimo **2 vCPU / 4 GB RAM / 40 GB disco**
- **Docker** e **Docker Compose** instalados
- Portas **80** e **443** abertas no firewall

### No DNS do seu domínio

Crie dois registros **A** apontando para o IP da VPS:

| Tipo | Nome              | Valor            |
|------|-------------------|------------------|
| A    | `app`             | `IP_DA_SUA_VPS`  |
| A    | `api`             | `IP_DA_SUA_VPS`  |

> Resultado: `app.seudominio.com` → frontend · `api.seudominio.com` → backend API

> ⚠️ Aguarde a propagação do DNS (geralmente 5–30 min) antes de prosseguir.

---

## Estrutura dos Arquivos VPS

```
Press-Ticket/
├── docker-compose.vps.yml       # Compose para VPS (nginx + certbot)
├── nginx/
│   ├── nginx.vps-init.conf      # Config HTTP-only para obter certificados
│   └── nginx.vps.conf           # Config HTTPS definitiva (após certificados)
├── backend/
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   └── .env.vps                 # Variáveis de produção do backend
└── frontend/
    ├── Dockerfile
    └── .env.vps                 # Variáveis de produção do frontend
```

---

## Passo a Passo

### 1. Instalar Docker na VPS

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

Verificar:
```bash
docker --version
docker compose version
```

---

### 2. Clonar o Repositório

```bash
git clone https://github.com/rtenorioh/Press-Ticket.git Press-Ticket
cd Press-Ticket
```

---

### 3. Configurar o Backend

Edite `backend/.env.vps` com seus dados reais:

```bash
nano backend/.env.vps
```

**Campos obrigatórios para alterar:**

| Campo                | Exemplo                          | Descrição                          |
|----------------------|----------------------------------|------------------------------------|
| `BACKEND_URL`        | `https://api.seudominio.com`     | URL pública da API                 |
| `FRONTEND_URL`       | `https://app.seudominio.com`     | URL pública do frontend            |
| `WEBHOOK`            | `https://api.seudominio.com`     | URL para webhooks                  |
| `DB_PASS`            | senha forte                      | Senha do banco de dados            |
| `JWT_SECRET`         | string aleatória longa           | Chave secreta JWT                  |
| `JWT_REFRESH_SECRET` | string aleatória diferente       | Chave refresh JWT                  |

Gerar chaves JWT seguras:
```bash
openssl rand -base64 32
```

> Execute o comando **duas vezes** — uma para `JWT_SECRET` e outra para `JWT_REFRESH_SECRET`.

---

### 4. Configurar o Frontend

O arquivo `frontend/.env.vps` não precisa de alteração (define `NODE_ENV=production`).

---

### 5. Substituir o Domínio nos Arquivos de Configuração

Substitua `seudominio.com` pelo seu domínio real em **todos os arquivos**:

```bash
# Substitui em todos os arquivos de configuração de uma vez
sed -i 's/seudominio.com/meudominio.com.br/g' \
    docker-compose.vps.yml \
    backend/.env.vps \
    nginx/nginx.vps-init.conf \
    nginx/nginx.vps.conf
```

> **Atenção:** se seu domínio tiver ponto (ex: `meudominio.com.br`), o `sed` acima funciona normalmente.

---

### 6. Configurar o Nginx Inicial (HTTP-only)

Copie a config de inicialização para o lugar da config definitiva:

```bash
cp nginx/nginx.vps-init.conf nginx/nginx.vps.conf.bak
```

No `docker-compose.vps.yml`, troque temporariamente o volume do nginx para usar a config de inicialização:

```bash
# Troca temporária para config HTTP-only
sed -i 's|nginx.vps.conf|nginx.vps-init.conf|g' docker-compose.vps.yml
```

---

### 7. Subir Apenas o Nginx (para obter certificados)

```bash
docker compose -f docker-compose.vps.yml up -d nginx certbot
```

Verifique se o nginx está respondendo:
```bash
curl -I http://app.seudominio.com
# Esperado: HTTP/1.1 200 OK
```

---

### 8. Obter Certificados SSL (Let's Encrypt)

```bash
# Certificado para o frontend
docker compose -f docker-compose.vps.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email seu@email.com \
    --agree-tos \
    --no-eff-email \
    -d app.seudominio.com

# Certificado para o backend
docker compose -f docker-compose.vps.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email seu@email.com \
    --agree-tos \
    --no-eff-email \
    -d api.seudominio.com
```

> ✅ Esperado: `Successfully received certificate` para cada domínio.

---

### 9. Ativar Configuração HTTPS Definitiva

Restaure a config HTTPS no `docker-compose.vps.yml`:

```bash
sed -i 's|nginx.vps-init.conf|nginx.vps.conf|g' docker-compose.vps.yml
```

---

### 10. Build e Start Completo

```bash
docker compose -f docker-compose.vps.yml up --build -d
```

> O primeiro build demora mais pois instala o Google Chrome no container backend.
> Tempo estimado: **5 a 20 minutos** dependendo da VPS.

---

### 11. Verificar se Está Rodando

```bash
docker compose -f docker-compose.vps.yml ps
```

**Resultado esperado:**
```
NAME                      STATUS          PORTS
press_ticket_db           Up (healthy)
press_ticket_backend      Up
press_ticket_frontend     Up
press_ticket_nginx        Up              0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
press_ticket_certbot      Up
```

Acesse no navegador:
- **Frontend**: https://app.seudominio.com
- **Backend API**: https://api.seudominio.com/health

---

## Usuários Padrão

| Tipo        | E-mail                            | Senha         |
|-------------|-----------------------------------|---------------|
| Admin       | `admin@pressticket.com.br`        | `admin`       |
| MasterAdmin | `masteradmin@pressticket.com.br`  | `masteradmin` |

> ⚠️ **Altere as senhas imediatamente após o primeiro login!**

---

## Comandos de Manutenção

### Ver logs em tempo real

```bash
# Todos os serviços
docker compose -f docker-compose.vps.yml logs -f

# Apenas backend
docker compose -f docker-compose.vps.yml logs -f backend

# Apenas nginx
docker compose -f docker-compose.vps.yml logs -f nginx
```

### Parar os serviços

```bash
docker compose -f docker-compose.vps.yml stop
```

### Reiniciar os serviços

```bash
docker compose -f docker-compose.vps.yml restart
```

### Parar e remover containers (dados preservados nos volumes)

```bash
docker compose -f docker-compose.vps.yml down
```

### Parar e remover **tudo** (APAGA OS DADOS!)

```bash
docker compose -f docker-compose.vps.yml down -v
```

> ⚠️ **CUIDADO**: apaga banco de dados, uploads e sessões do WhatsApp!

---

## Reconstruir após Alterações

### Reconstruir apenas o backend

```bash
docker compose -f docker-compose.vps.yml up --build -d backend
```

> ⚠️ Após rebuild do backend, aguarde o WhatsApp reconectar via QR Code nos logs.

### Reconstruir apenas o frontend

```bash
docker compose -f docker-compose.vps.yml up --build -d frontend
```

> ⚠️ O `REACT_APP_BACKEND_URL` está embutido no build. Se alterar o domínio, reconstruir obrigatoriamente.

### Reconstruir tudo

```bash
docker compose -f docker-compose.vps.yml up --build -d
```

---

## Renovação de Certificados SSL

Os certificados são renovados automaticamente pelo container `certbot` a cada 12 horas.

Para renovar manualmente:
```bash
docker compose -f docker-compose.vps.yml run --rm certbot renew
docker compose -f docker-compose.vps.yml exec nginx nginx -s reload
```

---

## Volumes (Dados Persistentes)

Os dados são preservados nos volumes Docker mesmo após `docker compose down`:

| Volume           | Conteúdo                            |
|------------------|-------------------------------------|
| `db_data`        | Dados do banco de dados MariaDB     |
| `backend_public` | Uploads de arquivos e mídias        |
| `wwebjs_auth`    | Sessões autenticadas do WhatsApp    |
| `wwebjs_cache`   | Cache do WhatsApp Web.js            |
| `certbot_conf`   | Certificados SSL Let's Encrypt      |
| `certbot_www`    | Desafios ACME do Certbot            |

### Backup dos volumes

```bash
# Backup do banco de dados
docker compose -f docker-compose.vps.yml exec db \
    mariadb-dump -u root -p press_ticket > backup_$(date +%Y%m%d).sql

# Backup dos uploads
docker run --rm -v press-ticket_backend_public:/data -v $(pwd):/backup \
    alpine tar czf /backup/uploads_$(date +%Y%m%d).tar.gz /data
```

---

## Solução de Problemas

### Certificado SSL não gerado

Verifique se o DNS está propagado:
```bash
nslookup app.seudominio.com
nslookup api.seudominio.com
# Ambos devem retornar o IP da sua VPS
```

Verifique se o nginx está respondendo na porta 80:
```bash
curl -I http://app.seudominio.com/.well-known/acme-challenge/test
```

### Backend não conecta ao banco

Verifique se o `DB_HOST` no `backend/.env.vps` está como `db`:
```bash
grep DB_HOST backend/.env.vps
# Deve retornar: DB_HOST=db
```

### WhatsApp não conecta (QR Code não aparece)

```bash
docker compose -f docker-compose.vps.yml logs -f backend
```

Se houver erro de Chrome/Puppeteer:
```bash
docker compose -f docker-compose.vps.yml exec backend google-chrome-stable --version
```

### Erro 502 Bad Gateway no Nginx

O backend ou frontend ainda está iniciando. Aguarde ~30s e recarregue:
```bash
docker compose -f docker-compose.vps.yml ps
docker compose -f docker-compose.vps.yml logs backend
```

### Erro de CORS

Confirme que `BACKEND_URL` e `FRONTEND_URL` no `backend/.env.vps` usam `https://` e correspondem exatamente aos subdomínios configurados no DNS e no nginx.

### Acessar o banco de dados via terminal

```bash
docker compose -f docker-compose.vps.yml exec db mariadb -u root -p press_ticket
```

---

## Comparativo: Local vs VPS Docker

| Aspecto              | Docker Local              | VPS Docker                        |
|----------------------|---------------------------|-----------------------------------|
| **Compose file**     | `docker-compose.yml`      | `docker-compose.vps.yml`          |
| **Env backend**      | `.env.docker`             | `.env.vps`                        |
| **Env frontend**     | `.env.docker`             | `.env.vps`                        |
| **Nginx**            | Não utilizado             | Container nginx reverse proxy     |
| **SSL/HTTPS**        | Não (HTTP local)          | Let's Encrypt (Certbot)           |
| **Portas expostas**  | 3000, 8000, 3306          | Apenas 80 e 443 (DB não exposto)  |
| **NODE_ENV**         | `development`             | `production`                      |
| **PROXY_PORT**       | `8000`                    | `443`                             |
| **Security Headers** | Helmet (server.js)        | Nginx                             |
