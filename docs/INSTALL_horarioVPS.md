# Alterar o horário da VPS pelo terminal

OBS: O Tutorial abaixo deve ser usado em casos onde alguma implementação que dependa de horário não esteja funcionando corretamente devido ao fuso horário da VPS.

================================================

1. Verificar a hora atual da VPS pelo terminal

```bash
date
```

2. Comando para alterar o fuso horário da VPS

```bash
sudo dpkg-reconfigure tzdata
```

3. Iniciará uma tela de configuração do fuso horário onde deverá escolher ```America``` e selecionar ok

4. Nesta tela deverá a cidade correspondente ao seu fuso horário, no meu caso usarei ```Sao_Paulo```

5. Agora será exibido um log similar a este informando que o fuso horário foi alterado com sucesso

```Current default time zone: 'America/Sao_Paulo'```  
```Local time is now:      Tue Mar 20 08:21:57 -03 2018.```  
```Universal Time is now:  Tue Mar 20 11:21:57 UTC 2018.```