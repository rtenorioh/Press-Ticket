# Manual de Instalação do Press Ticket® com Docker

## Pré-requisitos

- **Docker Desktop** instalado e em execução no Windows 10/11
- **Git** instalado

> ⚠️ Certifique-se de que o Docker Desktop está **rodando** antes de executar qualquer comando.

---

## Estrutura dos Arquivos Docker

```
Press-Ticket/
├── docker-compose.yml          # Orquestra todos os serviços
├── backend/
│   ├── Dockerfile              # Imagem do backend (Node 18 + Chrome)
│   ├── docker-entrypoint.sh    # Script de inicialização (migrations + seeds)
│   ├── .dockerignore           # Arquivos ignorados no build
│   └── .env.docker             # Variáveis de ambiente para Docker
└── frontend/
    ├── Dockerfile              # Imagem do frontend (Node 22, multi-stage)
    ├── .dockerignore           # Arquivos ignorados no build
    └── .env.docker             # Variáveis de ambiente para Docker
```

---

## Serviços Docker

| Serviço    | Imagem / Base         | Porta  | Descrição                          |
|------------|-----------------------|--------|------------------------------------|
| `db`       | `mariadb:10.11`       | 3306   | Banco de dados MariaDB             |
| `backend`  | `node:18` + Chrome    | 8000   | API + WhatsApp Web.js              |
| `frontend` | `node:22` (multi-stage)| 3000  | React + servidor Express           |

---

## Instalação Passo a Passo

### 1. Clonar o repositório

```powershell
git clone https://github.com/rtenorioh/Press-Ticket.git Press-Ticket
cd Press-Ticket
```

### 2. Configurar o Backend

Edite o arquivo `backend/.env.docker` com suas informações:

```powershell
notepad backend\.env.docker
```

**Campos obrigatórios para alterar:**

| Campo               | Valor Padrão           | Descrição                              |
|---------------------|------------------------|----------------------------------------|
| `DB_PASS`           | `pressticket`          | Senha do banco de dados                |
| `JWT_SECRET`        | `TROQUE_ESTA_CHAVE...` | Chave secreta JWT (**trocar sempre!**) |
| `JWT_REFRESH_SECRET`| `TROQUE_ESTA_CHAVE...` | Chave refresh JWT (**trocar sempre!**) |

> 💡 Para gerar chaves JWT seguras, use o comando:
> ```powershell
> # No PowerShell (Windows)
> [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
> ```

**Para acesso na rede local** (outro computador ou celular na mesma rede):
Substitua `localhost` pelo IP do seu PC (ex: `192.168.1.100`):
```
BACKEND_URL=http://192.168.1.100:8000
FRONTEND_URL=http://192.168.1.100:3000
WEBHOOK=http://192.168.1.100:8000
```

### 3. Configurar o Frontend

O arquivo `frontend/.env.docker` já vem configurado para desenvolvimento local.
Normalmente não precisa de alteração para uso em localhost.

### 4. Configurar a URL do Backend no React (build)

Se precisar alterar a URL do backend, edite a variável no `docker-compose.yml`:

```yaml
args:
  REACT_APP_BACKEND_URL: http://localhost:8000  # altere aqui
```

> ⚠️ A variável `REACT_APP_BACKEND_URL` é **embutida no build do React**.
> Qualquer alteração exige reconstruir a imagem com `docker compose build frontend`.

---

## Comandos Principais

### Iniciar pela primeira vez (build + start)

```powershell
docker compose up --build -d
```

> O primeiro build demora mais pois instala o Google Chrome no container backend.
> Tempo estimado: **5 a 15 minutos** dependendo da conexão de internet.

### Verificar se está rodando

```powershell
docker compose ps
```

**Resultado esperado:**
```
NAME                    STATUS          PORTS
press_ticket_db         Up (healthy)    0.0.0.0:3306->3306/tcp
press_ticket_backend    Up              0.0.0.0:8000->8000/tcp
press_ticket_frontend   Up              0.0.0.0:3000->3000/tcp
```

### Ver logs em tempo real

```powershell
# Todos os serviços
docker compose logs -f

# Apenas backend
docker compose logs -f backend

# Apenas frontend
docker compose logs -f frontend

# Apenas banco de dados
docker compose logs -f db
```

### Parar os serviços

```powershell
docker compose stop
```

### Iniciar novamente (sem rebuild)

```powershell
docker compose start
```

### Parar e remover os containers

```powershell

```

### Parar e remover **tudo** (incluindo volumes - APAGA OS DADOS!)

```powershell
docker compose down -v
```

> ⚠️ **CUIDADO**: O comando acima apaga todos os dados do banco, uploads e sessões do WhatsApp!

---

## Reconstruir após alterações

### Reconstruir todos os serviços

```powershell
docker compose up --build -d
```

### Reconstruir apenas o backend

```powershell
docker compose up --build -d backend
```

### Reconstruir apenas o frontend

```powershell
docker compose up --build -d frontend
```

---

## Acesso ao Sistema

Após todos os containers estarem em execução (`Up`):

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000

### Usuário Padrão Admin

| Campo  | Valor                       |
|--------|-----------------------------|
| Usuário| `admin@pressticket.com.br`  |
| Senha  | `admin`                     |

### Usuário MasterAdmin

| Campo  | Valor                             |
|--------|-----------------------------------|
| Usuário| `masteradmin@pressticket.com.br`  |
| Senha  | `masteradmin`                     |

---

## Volumes (Dados Persistentes)

Os dados são preservados nos volumes Docker mesmo após `docker compose down`:

| Volume            | Conteúdo                              |
|-------------------|---------------------------------------|
| `db_data`         | Dados do banco de dados MariaDB       |
| `backend_public`  | Uploads de arquivos e mídias          |
| `wwebjs_auth`     | Sessões autenticadas do WhatsApp      |
| `wwebjs_cache`    | Cache do WhatsApp Web.js              |

### Listar volumes

```powershell
docker volume ls | Select-String "press_ticket"
```

---

## Solução de Problemas

### Backend não conecta ao banco de dados

Verifique se o `DB_HOST` no `backend/.env.docker` está como `db` (nome do serviço):
```
DB_HOST=db
```

### Erro ao iniciar: "database not ready"

O backend aguarda o banco ficar saudável antes de iniciar.
Se demorar muito, verifique os logs do banco:
```powershell
docker compose logs db
```

### WhatsApp não conecta (QR Code não aparece)

Verifique os logs do backend:
```powershell
docker compose logs -f backend
```

Se houver erro de Chrome/Puppeteer, confirme que o container foi buildado corretamente:
```powershell
docker compose exec backend google-chrome-stable --version
```

### Porta já em uso

Se as portas 3000, 8000 ou 3306 já estiverem sendo usadas no seu PC:
Altere o mapeamento de portas no `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # muda a porta externa para 4001
```

### Resetar banco de dados (dados perdidos!)

```powershell
docker compose down
docker volume rm press-ticket_db_data
docker compose up --build -d
```

### Acessar o banco de dados via terminal

```powershell
docker compose exec db mariadb -u root -p press_ticket
```

---

## Security Headers

No ambiente Docker local (`NODE_ENV=development` no `frontend/.env.docker`), os Security Headers são gerenciados pelo **Helmet** no `server.js`, assim como no localhost sem Docker.

Para verificar os headers:
```powershell
curl -I http://localhost:3000/ | Select-String "x-frame|content-security|permissions"
```

---

## Diferenças: Docker Local vs VPS

| Aspecto             | Docker Local              | VPS (Manual)              |
|---------------------|---------------------------|---------------------------|
| **Banco de dados**  | Container MariaDB         | MariaDB instalado na VPS  |
| **Chrome**          | Instalado no container    | Instalado na VPS          |
| **PM2**             | Não utilizado             | Gerencia processos        |
| **Nginx**           | Não utilizado             | Proxy reverso + SSL       |
| **Security Headers**| Helmet (server.js)        | Nginx                     |
| **SSL/HTTPS**       | Não (apenas HTTP local)   | Certbot (Let's Encrypt)   |
