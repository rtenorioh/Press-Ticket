const documentationMessages = {
  documentation: {
    title: "Guia do Sistema",
    subtitle: "Guia completo das funcionalidades do Sistema",
    menuItem: "Guia do Sistema",
    visitPage: "Acessar página",
    general: {
      title: "Geral",
      dashboard: "O Dashboard é seu painel de controle central que apresenta estatísticas e visão geral do sistema. Aqui você pode visualizar rapidamente quantos tickets estão abertos, em atendimento ou já foram resolvidos, além de gráficos de desempenho.",
      tickets: "Na área de Tickets você gerencia todas as conversas com seus clientes. É possível atender, transferir para outros atendentes ou setores, e finalizar atendimentos quando resolvidos.",
      contacts: "A seção de Contatos permite cadastrar e gerenciar informações de seus clientes. Você pode organizar os contatos com tags personalizadas.",
      blockedContacts: "A seção de Contatos Bloqueados permite gerenciar todos os contatos bloqueados no WhatsApp. Visualize todos os contatos bloqueados por canal, consulte informações detalhadas e desbloqueie contatos quando necessário.",
      quickAnswers: "As Respostas Rápidas são mensagens pré-definidas que agilizam seu atendimento. Crie atalhos de texto para respostas frequentes e economize tempo durante as conversas.",
      tags: "Com as Tags você organiza e categoriza contatos de forma eficiente. Crie etiquetas coloridas personalizadas que facilitam a busca e filtragem de seus contatos.",
      clientStatus: "A seção de Status de Clientes permite criar e gerenciar diferentes status personalizados para classificar seus contatos. Organize seus clientes por categorias como 'Ativo', 'Inativo', 'Potencial', 'VIP', entre outros, facilitando o acompanhamento e segmentação do seu público.",
      videos: "A seção de Vídeos permite gerenciar e compartilhar conteúdo em vídeo com sua equipe. Adicione vídeos do YouTube, controle quais usuários podem visualizá-los, organize-os em formato de galeria ou lista, e reproduza-os diretamente na plataforma sem precisar sair do sistema."
    },
    administration: {
      title: "Administração",
      users: "Na área de Usuários você cadastra e gerencia todos os operadores do sistema. Defina perfis de acesso (administrador e atendente) e permissões específicas para cada usuário.",
      queues: "Em Setores você configura os diferentes setores ou departamentos da sua empresa. Organize a distribuição de atendimentos e defina regras de encaminhamento para cada setor.",
      channels: "A seção de Canais permite gerenciar todos os seus canais. Conecte novos números, desconecte sessões inativas e monitore o status de cada conexão em tempo real.",
      groups: "Gerenciamento completo de grupos WhatsApp. Crie novos grupos, configure permissões, adicione ou remova participantes, promova administradores, gerencie links de convite e atualize informações do grupo.",
      queueMonitor: "O Monitor de Setores oferece visualização em tempo real do desempenho de cada setor. Acompanhe estatísticas de tickets, tempo médio de espera, volume de atendimentos e distribuição de carga entre atendentes para otimizar seu fluxo de trabalho.",
      settings: "Em Configurações você personaliza diversos aspectos do sistema. Ajuste a aparência e outras opções para adaptar o Sistema às necessidades da sua empresa."
    },
    api: {
      title: "API",
      apidocs: "A Documentação da API oferece um guia interativo completo para desenvolvedores. Explore exemplos práticos de requisições e respostas para facilitar a integração com seus sistemas.",
      apikey: "Na seção de API Keys você gerencia os tokens de acesso à API. Crie, revogue e controle as permissões de cada chave para garantir segurança nas integrações.",
      api: "A área de API fornece informações gerais sobre como utilizar a API REST do Sistema para integração com outros sistemas e aplicações da sua empresa."
    }, 
    system: {
      title: "Monitoramento do Sistema",
      monitoring: "Monitoramento do Sistema",
      memoryUsage: "O monitor de Uso de Memória permite acompanhar em tempo real quanto de memória RAM seu sistema está consumindo. Visualize gráficos históricos de uso, identifique picos de consumo e otimize o desempenho do seu servidor para evitar lentidão.",
      cpuUsage: "Na área de Uso de CPU você pode analisar o desempenho do processador do seu servidor. Acompanhe gráficos de utilização por núcleo, identifique quais processos estão consumindo mais recursos e previna gargalos de desempenho.",
      diskSpace: "O monitor de Espaço em Disco apresenta informações detalhadas sobre armazenamento. Visualize quanto espaço está disponível, quais diretórios ocupam mais espaço e receba alertas antes que problemas de armazenamento se tornem críticos.",
      databaseStatus: "O Status do Banco de Dados oferece uma visão completa da saúde do seu banco de dados. Monitore conexões ativas, tamanho das tabelas, tempo de resposta das consultas e otimize a performance do seu sistema.",
      systemHealth: "Monitore seus canais, acompanhando o uptime, latência, status da conexão e erros.",
      networkStatus: "O monitor de Rede permite diagnosticar a conectividade do seu servidor. Acompanhe a latência, perda de pacotes e disponibilidade de serviços essenciais para garantir que seu sistema esteja sempre acessível e responsivo."
    },
    maintenance: {
      title: "Manutenção do Sistema",
      backup: "A Central de Backup permite proteger os dados do seu negócio. Configure backups automáticos, escolha entre cópias completas ou incrementais, visualize o histórico de backups realizados e restaure seus dados quando necessário com apenas alguns cliques.",
      errorLogs: "Os Logs de Erro ajudam a identificar e solucionar problemas técnicos no sistema. Consulte mensagens detalhadas de erro com data, hora e contexto para facilitar a resolução de problemas e manter seu sistema funcionando perfeitamente.",
      activityLogs: "O Registro de Atividades mantém um histórico completo de todas as ações realizadas no sistema. Acompanhe logins, alterações de dados e operações importantes para fins de auditoria, segurança e conformidade com políticas internas.",
      systemUpdate: "O Atualizador do Sistema permite que você atualize seu sistema para a versão mais recente disponível. Compare sua versão atual com a mais recente disponível, veja as novidades e atualize o Sistema diretamente pela interface para aproveitar novas funcionalidades e correções.",
      versionCheck: "O Verificador de Versão permite manter seu sistema sempre atualizado. Compare sua versão atual com a mais recente disponível, veja as novidades e atualize o Sistema diretamente pela interface para aproveitar novas funcionalidades e correções."
    }
  }
};

export default documentationMessages;
