# Alterar o Horário da VPS pelo Terminal

> **Observação:** Este tutorial deve ser seguido quando houver problemas relacionados a horário, como falhas em implementações que dependem do fuso horário correto da VPS.

---

## Passos para Alterar o Fuso Horário

### 1. Verificar a hora atual da VPS

Para verificar o horário atual configurado na sua VPS, execute o seguinte comando no terminal:

```bash
date
```

### 2. Alterar o fuso horário da VPS

Para alterar o fuso horário, utilize o seguinte comando:

```bash
sudo dpkg-reconfigure tzdata
```

### 3. Escolher o continente

Após rodar o comando acima, será exibida uma tela de configuração. Na primeira etapa, selecione o continente correspondente ao seu fuso horário. No caso de fuso horário de América, escolha:

```bash
America
```

### 4. Selecionar a cidade

Na próxima tela, selecione a cidade que corresponde ao seu fuso horário. Por exemplo, para o horário de São Paulo, escolha:

```bash
Sao_Paulo
```

### 5. Verificar a alteração

Após concluir a seleção, o sistema exibirá uma mensagem confirmando que o fuso horário foi alterado com sucesso. A saída será algo similar a:

```bash
Current default time zone: 'America/Sao_Paulo'
Local time is now:      Tue Mar 20 08:21:57 -03 2018.
Universal Time is now:  Tue Mar 20 11:21:57 UTC 2018.
```

---

Agora o fuso horário da sua VPS estará configurado corretamente de acordo com sua localização.
