# Manual de Instalação do phpMyAdmin na VPS

> **Observação:** Se o MySQL já estiver instalado, não há problema. Ele será atualizado durante o processo.

---

## Passos para Instalação

### 1. Atualizar e fazer upgrade da VPS

Antes de qualquer instalação, atualize a lista de pacotes e aplique upgrades no sistema:

```bash
sudo apt update && sudo apt upgrade
```

### 2. Instalar o MySQL Server

Se o MySQL Server ainda não estiver instalado, utilize o comando abaixo:

```bash
sudo apt install mysql-server
```

### 3. Verificar a versão do MySQL

Para confirmar a instalação e verificar a versão do MySQL, execute:

```bash
mysql --version
```

### 4. Verificar se o MySQL está rodando

Confirme se o serviço MySQL está em execução:

```bash
sudo systemctl status mysql
```

### 5. Instalar o phpMyAdmin

Agora, instale o phpMyAdmin e outras dependências necessárias:

```bash
sudo apt install phpmyadmin php-mbstring
```

Durante a instalação:

- Selecione 'apache2' como o servidor web.
- Escolha 'Yes' para configurar o banco de dados com dbconfig-common.
- Defina a senha para o usuário phpmyadmin.

### 6. Acessar a pasta de configuração do Apache

Vá até o diretório de configuração do Apache:

```bash
cd /etc/apache2/
```

### 7. Modificar a porta padrão do Apache

Abra o arquivo ports.conf e altere a linha Listen 80 para Listen 81, se necessário:

```bash
sudo nano ports.conf
```

> Nota: Essa alteração é necessária caso a porta 80 já esteja em uso por outro serviço.

### 8. Reiniciar o Apache

Após a modificação, reinicie o Apache para aplicar as mudanças:

```bash
sudo systemctl restart apache2
```

### 8.1. Verificar se o Apache está rodando

Confirme se o serviço do Apache está funcionando corretamente:

```bash
sudo systemctl status apache2
```

### 9. Criar um link simbólico para o phpMyAdmin

Crie um link simbólico para que o phpMyAdmin seja acessível via navegador:

```bash
sudo ln -s /usr/share/phpmyadmin /var/www/html
```

### 10. Criar um novo usuário MySQL para o phpMyAdmin

Para adicionar um novo usuário ao MySQL, siga os passos abaixo:

#### 10.1. Acesse o MySQL como root:

```bash
mysql -u root
```

#### 10.2. Crie um novo usuário com uma senha:

```bash
CREATE USER 'novoUsuario'@'localhost' IDENTIFIED BY 'senha';
```

#### 10.3. Conceda todos os privilégios ao novo usuário:

```bash
GRANT ALL PRIVILEGES ON *.* TO 'novoUsuario'@'localhost' WITH GRANT OPTION;
```

#### 10.4. Execute o comando abaixo para garantir que as mudanças sejam aplicadas:

```bash
FLUSH PRIVILEGES;
```

#### 10.5. Saia do MySQL:

```bash
exit;
```

### 11. Acessar o phpMyAdmin

Abra o navegador e acesse o phpMyAdmin através do endereço abaixo:

```bash
http://IPdaVPS:81/phpmyadmin
```

### 12. Login no phpMyAdmin

Use o nome de usuário e senha criados na etapa 10 para fazer login no phpMyAdmin.

> Agora está completamente formatado e pronto para uso.
