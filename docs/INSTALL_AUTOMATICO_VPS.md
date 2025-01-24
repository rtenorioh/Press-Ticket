# Manual de Instalação Automática do Press Ticket na VPS

Este manual descreve os passos necessários para realizar a Instalação automática do sistema **Press Ticket** em sua VPS.

## Passos para Instalação

### 1. Acessar a VPS

Conecte-se à VPS onde o **Press Ticket** será instalado. Utilize o usuário `root`:

```bash
ssh root@ip-da-vps
```

### 2. Executar o comando para atualização

Estando no diretório do `root`, execute o comando para instalação abaixo:

```bash
curl -sSL https://install.pressticket.com.br | sudo bash -s 'senha123' 'empresa' 'back.pressticket.com.br' 'front.pressticket.com.br' 4000 3000 3 10 'admin@pressticket.com.br'
```

> Nota: O script será responsável por realizar o processo de instalação automaticamente.

### 4. Finalização

Após a execução do comando, verifique se a instalação foi concluída com sucesso e sem erros. Caso ocorra algum problema, revise os logs ou entre em contato para suporte.
