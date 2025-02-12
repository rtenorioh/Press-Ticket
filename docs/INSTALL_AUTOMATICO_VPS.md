# Manual de Instalação Automática do Press Ticket na VPS

Este manual descreve os passos necessários para realizar a Instalação automática do sistema **Press Ticket** em sua VPS.

## Passos para Instalação

### 1. Acessar a VPS

Conecte-se à VPS onde o **Press Ticket** será instalado. Utilize o usuário `root`:

```bash
ssh root@ip-da-vps
```

### 2. Executar o comando para atualização

#### 2.1 Modelo do comando

Abaixo tem o modelo do comando com as explicações de cada argumento.

`curl -sSL https://install.pressticket.com.br | sudo bash -s <SENHA_DEPLOY> <NOME_EMPRESA> <URL_BACKEND> <URL_FRONTEND> <PORT_BACKEND> <PORT_FRONTEND> <DB_PASS> <USER_LIMIT> <CONNECTION_LIMIT> <EMAIL>`

`<SENHA_DEPLOY>` => Senha do usuário Deploy  
`<NOME_EMPRESA>` => Nome para a instalação e pm2  
`<URL_BACKEND>` => URL do backend (api)  
`<URL_FRONTEND>` => URL do frontend (área de acesso do cliente)  
`<PORT_BACKEND>` => Porta do backend  
`<PORT_FRONTEND>` => Porta do frontend  
`<DB_PASS>` => Senha de acesso ao banco de dados  
`<USER_LIMIT>` => Quantidade limite de usuários  
`<CONNECTION_LIMIT>` => Quantidade limite de Canais  
`<EMAIL>` => Email para configurar o MasterAdmin e Certificado SSL  

> Observação: Todos os argumentos acima são obrigatórios.

#### 2.2 Modelo a ser usado para instalação

Estando logado no diretório do `root`, execute o comando abaixo, com suas informações para realizar a instalação:

```bash
curl -sSL https://install.pressticket.com.br | sudo bash -s "senha123" "empresa" "back.pressticket.com.br" "front.pressticket.com.br" 4000 3000 "senha123" 3 10 "email@pressticket.com.br"
```

> Nota: O script será responsável por realizar o processo de instalação automaticamente.

### 4. Finalização

Após a execução do comando, verifique se a instalação foi concluída com sucesso e sem erros. Caso ocorra algum problema, revise os logs ou entre em contato para suporte.