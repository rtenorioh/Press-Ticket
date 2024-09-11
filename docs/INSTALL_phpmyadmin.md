# Manual de Instalação do phpmyadmin na VPS

OBS: Caso já tenha instalado o mysql, não se preocupe, ele será atualizado.

================================================

1. Realizar atualização e upgrade da VPS

```bash
sudo apt update && sudo apt upgrade
```

2. Instalar o mysql server

```bash
sudo apt install mysql-server
```

3. Para verificar a versão do mysql

```bash
mysql --version
```

4. Verificar se o mysql está rodando

```bash
sudo systemctl status mysql
```

5. Instalar o phpmyadmin

```bash
sudo apt install phpmyadmin php-mbstring
```

5.1. Durante a instalação, escolha `'apache2'` como web server

5.2. Escolher `'Yes'` para `'Configure database for phpmyadmin with dbconfig-common?'`

5.3. Definir a senha para o User phpmyadmin

6. Acessar a pasta do apache

```bash
cd /etc/apache2/
```

7. Editar o arquivo 'ports.conf', alterando o 'Listen 80' para 'Listen 81'

```bash
sudo nano ports.conf
```

8. Restart do apache

```bash
sudo systemctl restart apache2
```

8.1. Verificar se o apache está rodando

```bash
sudo systemctl status apache2
```

9. Criar link para acessar o phpmyadmin

```bash
sudo ln -s /usr/share/phpmyadmin /var/www/html
```

10. Criar um novo usuário para o phpmyadmin

    10.1. Ainda no terminal, acesse o mysql:

```bash
mysql -u root
```

10.2. Crie um novo usuário com senha para o phpmyadmin:

```bash
CREATE USER 'novoUsuario'@'localhost' IDENTIFIED BY 'senha';
```

10.3. Para permitir todos os privilegios do BD ao novo usuário:

```bash
GRANT ALL PRIVILEGES ON *.* TO 'novoUsuario'@'localhost' WITH GRANT OPTION;
```

10.4. Para garantir as mudanças, execute:

```bash
FLUSH PRIVILEGES;
```

10.5. Digite:

```bash
exit;
```

11. Acessar o phpmyadmin

```bash
http://IPdaVPS:81/phpmyadmin
```

12. Para logar use o usuário criado no item 11.
