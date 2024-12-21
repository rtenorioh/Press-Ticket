# Manual de Instalação do Press Ticket na VPS

Este manual descreve os passos necessários para realizar a atualização do sistema **Press Ticket** em sua VPS.

## Passos para Atualização

### 1. Acessar a VPS

Conecte-se à VPS onde o **Press Ticket** será instalado. Utilize o usuário `root`:

```bash
ssh root@ip-da-vps
```

### 2. Executar o script de Instalação

Execute o script de instalação utilizando o comando abaixo com os argumentos:

> Observação: não esqueça de alterar os argumentos para suas informações.

```bash
curl -sSL https://install.pressticket.com.br | sudo bash -s 'senha123' 'empresa' 'back.pressticket.com.br' 'front.pressticket.com.br' 8080 3333 3 10 'admin@pressticket.com.br'
```

> Nota: O script `INSTALL.sh` será responsável por realizar o processo de instalação automaticamente.

### 4. Finalização

Após a execução do script, verifique se a instalação foi concluída sem erros. Caso ocorra algum problema, revise os logs ou entre em contato para suporte.
