# Manual de Atualização do Press Ticket na VPS

Este manual descreve os passos necessários para realizar a atualização do sistema **Press Ticket** em sua VPS.

## Passos para Atualização

### 1. Acessar a VPS

Conecte-se à VPS onde o **Press Ticket** está instalado. Utilize o usuário apropriado (`root` ou `deploy`), dependendo de sua configuração:

```bash
ssh usuario@ip-da-vps
```

### 2. Navegar até a pasta do sistema

Uma vez conectado à VPS, vá até o diretório onde o sistema está instalado:

```bash
cd Press-Ticket/
```

### 3. Executar o comando para atualização

Com o diretório correto acessado, execute o comando para atualização abaixo:

```bash
curl -sSL https://update.pressticket.com.br | sudo bash -s
```

> Nota: O script `UPDATE.sh` será responsável por realizar o processo de atualização automaticamente.

### 4. Finalização

Após a execução do comando, verifique se a atualização foi concluída com sucesso e sem erros. Caso ocorra algum problema, revise os logs ou entre em contato para suporte.
