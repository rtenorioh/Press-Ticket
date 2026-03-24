const messages = {
  pt: {
    translations: {
      all: "Todos",
      none: "Nenhum",
      apiKey: {
        title: "Gerenciador de Tokens",
        button: {
          new: "Novo Token",
          copy: "Copiar Token",
          delete: "Deletar Token"
        },
        categories: {
          contacts: "Contatos",
          messages: "Mensagens",
          queues: "Setores",
          tags: "Tags",
          tickets: "Tickets",
          whatsapp: "WhatsApp",
          whatsappSession: "Sessões de WhatsApp",
          activityLogs: "Logs de Atividade",
          backups: "Backups",
          errorLogs: "Logs de Erro",
          networkStatus: "Monitoramento de Rede",
          queueMonitor: "Monitoramento de Setores",
          systemUpdate: "Atualização do Sistema",
          versionWhatsapp: "Versão e Biblioteca WhatsApp",
          systemResources: "Sistema e Recursos",
          videos: "Vídeos",
          users: "Usuários",
          quickAnswers: "Respostas Rápidas",
          clientStatus: "Status de Clientes",
          whatsappGroups: "Grupos do WhatsApp",
          presence: "Presença (Indicadores)",
          authentication: "Autenticação"
        },
        permissions: {
          createContacts: "Criar Contatos",
          readContacts: "Visualizar Contatos",
          updateContacts: "Editar Contatos",
          deleteContacts: "Deletar Contatos",
          createMessages: "Enviar Mensagens",
          readMessages: "Visualizar Mensagens",
          updateMessages: "Editar Mensagens",
          deleteMessages: "Excluir Mensagens",
          createQueue: "Criar Setores",
          readQueue: "Visualizar Setores",
          updateQueue: "Editar Setores",
          deleteQueue: "Deletar Setores",
          createTags: "Criar Tags",
          readTags: "Visualizar Tags",
          updateTags: "Editar Tags",
          deleteTags: "Deletar Tags",
          createTickets: "Criar Tickets",
          readTickets: "Visualizar Tickets",
          updateTickets: "Editar Tickets",
          deleteTickets: "Deletar Tickets",
          createWhatsapp: "Criar Conexões",
          readWhatsapp: "Visualizar Conexões",
          updateWhatsapp: "Editar Conexões",
          deleteWhatsapp: "Deletar Conexões",
          createWhatsappSession: "Criar Sessões",
          updateWhatsappSession: "Editar Sessões",
          deleteWhatsappSession: "Deletar Sessões",
          readActivityLogs: "Visualizar Logs de Atividade",
          createBackups: "Criar Backups",
          readBackups: "Visualizar Backups",
          updateBackups: "Restaurar Backups",
          deleteBackups: "Deletar Backups",
          createErrorLogs: "Registrar Logs de Erro",
          readErrorLogs: "Visualizar Logs de Erro",
          deleteErrorLogs: "Limpar Logs de Erro",
          readNetworkStatus: "Visualizar Status da Rede",
          readQueueMonitor: "Visualizar Monitoramento de Setores",
          readSystemUpdate: "Verificar Atualizações do Sistema",
          writeSystemUpdate: "Instalar Atualizações do Sistema",
          readVersion: "Consultar Versão do Sistema",
          writeWhatsappLib: "Atualizar Biblioteca do WhatsApp",
          writeSystem: "Reiniciar Serviços do Sistema",
          readSystemResources: "Monitorar Recursos do Sistema",
          readVideos: "Visualizar Vídeos",
          writeVideos: "Gerenciar Vídeos",
          createUsers: "Criar Usuários",
          readUsers: "Visualizar Usuários",
          updateUsers: "Editar Usuários",
          deleteUsers: "Deletar Usuários",
          createQuickAnswers: "Criar Respostas Rápidas",
          readQuickAnswers: "Visualizar Respostas Rápidas",
          updateQuickAnswers: "Editar Respostas Rápidas",
          deleteQuickAnswers: "Deletar Respostas Rápidas",
          createClientStatus: "Criar Status de Clientes",
          readClientStatus: "Visualizar Status de Clientes",
          updateClientStatus: "Editar Status de Clientes",
          deleteClientStatus: "Deletar Status de Clientes",
          readGroups: "Visualizar Grupos do WhatsApp",
          writeGroups: "Gerenciar Grupos do WhatsApp",
          writePresence: "Enviar Indicadores de Digitação/Gravação",
          readProfile: "Acessar Perfil (Logout)"
        },
        messages: {
          success: {
            copy: "Token copiado com sucesso",
            created: "Token criado com sucesso",
            deleted: "Token deletado com sucesso"
          },
          error: {
            create: "Erro ao criar token",
            delete: "Erro ao deletar token",
            nameExists: "Já existe um token com este nome"
          },
          noTokens: "Nenhum token encontrado"
        },
        modal: {
          title: "Criar novo token",
          name: "Nome",
          permissions: "Permissões",
          permissionsRequired: "Selecione ao menos uma permissão",
          buttons: {
            cancel: "Cancelar",
            save: "Salvar",
            selectAll: "Selecionar Todas",
            unselectAll: "Desmarcar Todas"
          }
        },
        confirmationModal: {
          message: "Tem certeza que deseja excluir este token?",
        },
        table: {
          name: "Nome",
          token: "Token",
          permissions: "Permissões",
          created_at: "Criado em:",
          actions: "Ação"
        }
      },
      auth: {
        toasts: {
          success: "Login efetuado com sucesso!",
          session_expired: "Sua sessão expirou pois foi iniciada em outro dispositivo.",
          user_inactive: "Usuário desativado. Por favor, contate o administrador."
        },
      },
      backup:{
        title: "Backup e Restauração DB",
        refresh: "Atualizar",
        nameLabel: "Nome do Backup",
        namePlaceholder: "Digite um nome para o backup",
        create: "Criar Backup",
        creating: "Criando...",
        import: "Importar Backup",
        importing: "Importando...",
        filename: "Nome do Arquivo",
        size: "Tamanho",
        createdAt: "Criado em",
        actions: "Ações",
        noBackups: "Nenhum backup encontrado",
        download: "Download",
        restore: "Restaurar",
        delete: "Excluir",
        loadError: "Erro ao carregar backups",
        createSuccess: "Backup criado com sucesso!",
        createError: "Erro ao criar backup",
        importSuccess: "Backup importado com sucesso!",
        importError: "Erro ao importar backup",
        downloadError: "Erro ao baixar o arquivo de backup",
        deleteSuccess: "Backup excluído com sucesso!",
        deleteError: "Erro ao excluir backup",
        restoreSuccess: "Backup restaurado com sucesso!",
        restoreError: "Erro ao restaurar backup",
        confirmDeleteTitle: "Confirmar exclusão",
        confirmDeleteMessage: "Tem certeza que deseja excluir o backup {{name}}?",
        confirmRestoreTitle: "Confirmar restauração",
        confirmRestoreMessage: "Tem certeza que deseja restaurar o backup {{name}}? Isso substituirá todos os dados atuais!",
        cancelButton: "Cancelar",
        confirmButton: "Confirmar"
      },
      chat: {
        noTicketMessage: "Selecione um ticket para começar a conversar.",
      },
      confirmationModal: {
        buttons: {
          confirm: "Ok",
          cancel: "Cancelar",
        },
      },
      channels: {
        title: "Canais",
        toasts: {
          deleted: "Canal excluído com sucesso!",
        },
        confirmationModal: {
          deleteTitle: "Deletar",
          deleteMessage: "Você tem certeza? Essa ação não pode ser revertida.",
          disconnectTitle: "Desconectar",
          disconnectMessage: "Tem certeza? Você precisará ler o QR Code novamente.",
        },
        buttons: {
          wwebjs: "Adicionar",
          hub: "Hub",
          shutdown: "Excluir Sessão",
          restart: "Restart",
          disconnect: "Desconectar",
          tryAgain: "Tentar novamente",
          qrcode: "QR CODE",
          newQr: "Novo QR CODE",
          connecting: "Conectando",
          edit: "Editar Canal",
          delete: "Excluir Canal",
          start: "Iniciar Sessão",
        },
        toolTips: {
          disconnected: {
            title: "Falha ao iniciar sessão do WhatsApp",
            content: "Certifique-se de que seu celular esteja conectado à internet e tente novamente, ou solicite um novo QR Code",
          },
          qrcode: {
            title: "Esperando leitura do QR Code",
            content: "Clique no botão 'QR CODE' e leia o QR Code com o seu celular para iniciar a sessão",
          },
          connected: {
            title: "Conexão estabelecida!",
          },
          timeout: {
            title: "A conexão com o celular foi perdida",
            content: "Certifique-se de que seu celular esteja conectado à internet e o WhatsApp esteja aberto, ou clique no botão 'Desconectar' para obter um novo QR Code",
          },
        },
        table: {
          id: "ID",
          channel: "Canal",
          name: "Nome",
          color: "Cor",
          number: "Número",
          status: "Status",
          lastUpdate: "Última atualização",
          default: "Padrão",
          actions: "Ações",
          session: "Sessão",
        },
      },
      contactModal: {
        title: {
          add: "Adicionar contato",
          edit: "Editar contato",
        },
        form: {
          mainInfo: "Dados do contato",
          extraInfo: "Informações adicionais",
          name: "Nome",
          number: "Número do Whatsapp",
          email: "Email",
          address: "Endereço",
          extraName: "Nome do campo",
          extraValue: "Valor",
        },
        buttons: {
          addExtraInfo: "Adicionar informação",
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "Contato salvo com sucesso.",
        numberError: "Número de WhatsApp inválido. Por favor, verifique e tente novamente.",
      },
      contacts: {
        title: "Contatos",
        toasts: {
          deleted: "Contato excluído com sucesso!",
          deletedAll: "Todos contatos excluídos com sucesso!",
          redirectTicket: "Você já possui um ticket aberto para este contato. Redirecionando...",
          exportSuccess: "Contatos exportados com sucesso!",
          noContactsToExport: "Não há contatos para exportar.",
          blocked: "Contato bloqueado no WhatsApp",
          unblocked: "Contato desbloqueado no WhatsApp"
        },
        errors: {
          ticketAlreadyOpen: "Já existe um ticket aberto para este contato, atribuído ao Atendente: *{{userName}}* no Canal: *{{userChannel}}* criado em: *{{ticketCreatedAt}}*.",
          exportError: "Erro ao exportar contatos."
        },
        searchPlaceholder: "Pesquisar...",
        confirmationModal: {
          deleteTitle: "Deletar ",
          deleteAllTitle: "Deletar Todos",
          importTitle: "Importar contatos",
          deleteMessage: "Tem certeza que deseja deletar este contato? Todos os tickets relacionados serão perdidos.",
          deleteAllMessage: "Tem certeza que deseja deletar todos os contatos? Todos os tickets relacionados serão perdidos.",
          importMessage: "Deseja importar todos os contatos do telefone?",
        },
        buttons: {
          import: "Importar Contatos",
          add: "Adicionar Contato",
          export: "Exportar Contatos",
          delete: "Excluir Todos Contatos",
          block: "Bloquear",
          unblock: "Desbloquear"
        },
        table: {
          name: "Nome",
          whatsapp: "WhatsApp",
          type: "Tipo",
          address: "Endereço",
          channels: "Canais",
          actions: "Ações",
        },
        filters: {
          status: "Filtrar por Status",
          allStatus: "Todos os Status"
        },
        exportModal: {
          title: "Selecionar Campos para Exportação",
          selectAll: "Selecionar Todos",
          deselectAll: "Desmarcar Todos",
          selectedCount: "{{count}} de {{total}} campos selecionados",
          groups: {
            basic: "Informações Básicas",
            personal: "Dados Pessoais",
            address: "Endereço",
            custom: "Campos Customizados",
            dates: "Datas"
          },
          fields: {
            id: "ID",
            name: "Nome",
            number: "Número",
            email: "Email",
            cpf: "CPF",
            birthdate: "Data Nascimento",
            gender: "Gênero",
            status: "Status",
            address: "Endereço",
            addressNumber: "Número",
            addressComplement: "Complemento",
            neighborhood: "Bairro",
            city: "Cidade",
            state: "Estado",
            zip: "CEP",
            country: "País",
            isGroup: "É Grupo",
            profilePicUrl: "Foto Perfil",
            extraInfo: "Informações Extras",
            tags: "Tags",
            createdAt: "Data Criação",
            updatedAt: "Data Atualização",
            lastContactAt: "Último Contato"
          },
          buttons: {
            cancel: "Cancelar",
            export: "Exportar ({{count}} campos)"
          }
        },
        exportProgress: {
          title: "Exportando Contatos",
          preparing: "Preparando exportação...",
          fetching: "Buscando contatos...",
          processing: "Processando dados...",
          finishing: "Finalizando..."
        },
      },
      contactDrawer: {
        header: "Dados do contato",
        buttons: {
          edit: "Editar contato",
        },
        extraInfo: "Outras informações",
      },
      common: {
        search: "Buscar",
        selected: "selecionados",
        cancel: "Cancelar",
        confirm: "Confirmar",
        refresh: "Atualizar",
      },
      groupActions: {
        selectContacts: "Selecionar contatos",
        title: "Ações do Grupo",
        buttons: {
          add: "Adicionar participantes",
          remove: "Remover participantes",
          promote: "Promover admins",
          demote: "Rebaixar admins",
          getInvite: "Copiar link de convite",
          revokeInvite: "Revogar link",
          subject: "Alterar título",
          description: "Alterar descrição",
          setPicture: "Alterar foto",
          deletePicture: "Remover foto",
          leave: "Sair do grupo",
          listRequests: "Listar solicitações",
          approveRequests: "Aprovar solicitações",
          rejectRequests: "Rejeitar solicitações"
        },
        switches: {
          memberAddMode: "Somente admins podem adicionar",
          announcement: "Somente admins podem enviar mensagens",
          restrict: "Somente admins podem editar informações"
        },
        prompts: {
          participantsPlaceholder: "Informe IDs separados por vírgula (ex.: 5511999999999@c.us)",
          requestersPlaceholder: "Informe IDs dos solicitantes (opcional, vírgula)",
          subject: "Novo assunto do grupo:",
          description: "Nova descrição do grupo:",
          pictureUrl: "URL da imagem (será baixada e enviada como foto do grupo)"
        },
        messages: {
          addOk: "Participantes adicionados (ou convite enviado).",
          addErr: "Erro ao adicionar participantes.",
          removeOk: "Participantes removidos.",
          removeErr: "Erro ao remover participantes.",
          promoteOk: "Participantes promovidos a admin.",
          promoteErr: "Erro ao promover participantes.",
          demoteOk: "Participantes rebaixados.",
          demoteErr: "Erro ao rebaixar participantes.",
          inviteCopied: "Link de convite copiado para a área de transferência.",
          inviteErr: "Erro ao obter link de convite.",
          inviteNone: "Não foi possível obter o código de convite.",
          inviteRevoked: "Novo link gerado e copiado.",
          inviteRevokeErr: "Erro ao revogar link de convite.",
          settingsOk: "Configurações atualizadas.",
          settingsErr: "Erro ao atualizar configurações.",
          subjectOk: "Assunto atualizado.",
          subjectErr: "Erro ao atualizar assunto.",
          descriptionOk: "Descrição atualizada.",
          descriptionErr: "Erro ao atualizar descrição.",
          pictureOk: "Foto do grupo atualizada.",
          pictureErr: "Erro ao atualizar foto do grupo.",
          pictureDelOk: "Foto do grupo removida.",
          pictureDelErr: "Erro ao remover foto do grupo.",
          leaveOk: "Saída do grupo realizada.",
          leaveErr: "Erro ao sair do grupo.",
          noRequests: "Sem solicitações pendentes.",
          requestsErr: "Erro ao listar solicitações.",
          requestsApproveOk: "Solicitações aprovadas.",
          requestsApproveErr: "Erro ao aprovar solicitações.",
          requestsRejectOk: "Solicitações rejeitadas.",
          requestsRejectErr: "Erro ao rejeitar solicitações."
        },
        modals: {
          subjectTitle: "Alterar Nome do Grupo",
          subjectLabel: "Nome do grupo",
          descriptionTitle: "Alterar Descrição do Grupo",
          descriptionLabel: "Descrição do grupo",
          removeTitle: "Remover Participantes",
          promoteTitle: "Promover a Admin",
          demoteTitle: "Rebaixar Admin",
          owner: "Dono",
          admin: "Admin",
          noMembers: "Nenhum membro encontrado",
          save: "Salvar",
          cancel: "Cancelar",
        }
      },
      copyToClipboard: {
        copy: "Copiar",
        copied: "Copiado"
      },
      cpuUsage: {
        title: "Uso de CPU",
        infoIcon: "CPU do Sistema",
        modelCPU: "Modelo",
        cores: "Núcleos",
        threads: "Threads",
        frequency: "Frequência",
        uptime: "Uptime",
        topProcesses: "Processos com Maior Consumo de CPU",
        pid: "PID",
        process: "Processo",
        user: "Usuário",
        cpuUsage: "Uso de CPU",
        cpuTime: "Tempo de CPU",
        noProcessesFound: "Nenhum processo encontrado",
      },
      dashboard: {
        messages: {
          inAttendance: {
            title: "Em Atendimento"
          },
          waiting: {
            title: "Aguardando"
          },
          closed: {
            title: "Finalizados"
          },
          sent: {
            title: "Mensagens Enviadas",
            titleAdmin: "Mensagens Totais Enviadas"
          },
          received: {
            title: "Mensagens Recebidas",
            titleAdmin: "Mensagens Totais Recebidas"
          }
        },
        charts: {
          perDay: {
            title: "Tickets por período: ",
          },
          date: {
            start: "Data inicial",
            end: "Data final"
          },
          perConnection: {
            date: {
              start: "Data inicial",
              end: "Data final"
            },
            perConnection: {
              title: "Tickets por Canais"
            }
          },
          perQueue: {
            title: "Tickets por Setor",
            date: {
              start: "Data inicial",
              end: "Data final"
            },
          },
        },
        chartPerUser: {
          title: "Tickets por usuário",
          ticket: "Ticket",
          date: {
            start: "Data inicial",
            end: "Data final"
          },
        },
        chartPerConnection: {
          date: {
            start: "Data inicial",
            end: "Data final"
          },
          perConnection: {
            title: "Tickets por Canais"
          }
        },
        chartPerQueue: {
          date: {
            start: "Data inicial",
            end: "Data final"
          },
          perQueue: {
            title: "Tickets por Setor"
          }
        },
        ChartMessages: {
          title: "Mensagens por Usuário",
          noUser: "Sem Usuário",
          messages: {
            sent: "Enviadas",
            received: "Recebidas"
          },
          date: {
            start: "Data inicial",
            end: "Data final"
          }
        },
        newContacts: {
          contact: "Contatos",
          date: {
            start: "Data inicial",
            end: "Data final"
          },
          title: "Contatos novos por dia"
        },
        contactsWithTickets: {
          message: "Nenhum contato encontrado para esta data.",
          unique: "Contato único",
          date: {
            start: "Data inicial",
            end: "Data final"
          },
          title: "Contatos que abriram tickets no período"
        },
        tags: {
          cloudTitle: "Tags: ",
          noTags: "Sem tags no momento!"
        },
        users: {
          title: "Usuários Online"
        },
        clientStatus: {
          pieChart: {
            title: "Distribuição de Contatos por Status"
          },
          barChart: {
            title: "Quantidade de Contatos por Status"
          },
          withoutStatus: "Sem Status",
          totalContacts: "Total de Contatos",
          withStatusLabel: "Com Status",
          withoutStatusLabel: "Sem Status",
          contactsCount: "Quantidade de Contatos",
          loading: "Carregando estatísticas...",
          noData: "Nenhum dado disponível"
        },
      },
      diskSpace: {
        title: "Espaço em Disco",
        systemFolder: "Pasta do Sistema",
        used: "utilizado",
        healthy: "Saudável",
        warning: "Atenção",
        critical: "Crítico",
        folderSize: "Tamanho da Pasta",
        freeSpace: "Espaço Livre",
        totalSpace: "Espaço Total",
        criticalWarning: "Atenção: O espaço em disco está em estado crítico. Recomendamos liberar espaço imediatamente para evitar problemas no sistema.",
        warningMessage: "Atenção: O espaço em disco está ficando limitado. Considere liberar espaço para evitar problemas futuros.",
        folders: "Pastas",
        folderName: "Nome",
        size: "Tamanho",
        percentage: "Percentual",
        noFoldersFound: "Nenhuma pasta encontrada",
      },
      memoryUsage: {
        title: "Uso de Memória RAM",
        systemMemory: "Memória do Sistema",
        used: "utilizado",
        healthy: "Saudável",
        warning: "Atenção",
        critical: "Crítico",
        totalMemory: "Memória Total",
        usedMemory: "Memória Utilizada",
        freeMemory: "Memória Livre",
        cachedMemory: "Memória em Cache",
        availableMemory: "Memória Disponível",
        criticalWarning: "Atenção: O uso de memória RAM está em estado crítico. Recomendamos reiniciar alguns serviços ou o sistema para evitar problemas.",
        warningMessage: "Atenção: O uso de memória RAM está alto. Monitore o sistema para evitar problemas de desempenho.",
        topProcesses: "Processos com Maior Consumo",
        pid: "PID",
        process: "Processo",
        memoryUsage: "Uso de Memória",
        percentage: "Porcentagem",
        noProcesses: "Nenhum processo encontrado."
      },
      errorLogs: {
        title: "Log de Erros",
        searchPlaceholder: "Buscar por mensagem de erro...",
        loading: "Carregando logs...",
        noRecords: "Nenhum log encontrado.",
        table: {
          id: "ID",
          date: "Data",
          source: "Origem",
          severity: "Severidade",
          message: "Mensagem",
          actions: "Ações"
        },
        logDetails: {
          title: "Detalhes do Log",
          date: "Data",
          source: "Origem",
          severity: "Severidade",
          component: "Componente",
          userId: "ID do Usuário",
          user: "Nome do Usuário",
          url: "URL",
          message: "Mensagem",
          stack: "Stack Trace",
          userAgent: "Navegador"
        },
        filter: {
          title: "Filtros",
          source: "Origem",
          severity: "Severidade",
          startDate: "Data Inicial",
          endDate: "Data Final",
          all: "Todos"
        },
        deleteDialog: {
          title: "Remover Logs Antigos",
          message: "Esta ação removerá todos os logs com mais de 30 dias. Esta ação não pode ser desfeita. Deseja continuar?"
        },
        pagination: {
          rowsPerPage: "Linhas por página",
          of: "de"
        },
        buttons: {
          search: "Buscar",
          filter: "Filtrar",
          refresh: "Atualizar",
          download: "Download",
          deleteOld: "Remover Antigos",
          close: "Fechar",
          clearFilters: "Limpar Filtros",
          cancel: "Cancelar",
          applyFilters: "Aplicar Filtros",
          confirm: "Confirmar"
        }
      },
      forgotPassword: {
        title: "Esqueceu a Senha?",
        form: {
          email: "Digite seu e-mail"
        },
        buttons: {
          submit: "Enviar Link de Redefinição",
          backToLogin: "Voltar ao Login"
        },
        success: "Se um e-mail válido foi encontrado, um link para redefinição de senha foi enviado!",
        error: "Erro ao solicitar redefinição de senha. Tente novamente mais tarde."
      },
      integrations: {
        success: "Integração salva com sucesso.",
        title: "Integrações",
        integrations: {
          openai: {
            title: "OpenAI",
            organization: "Organization ID",
            apikey: "KEY"
          },
          n8n: {
            title: "N8N",
            urlApiN8N: "URL API N8N"
          },
          hub: {
            title: "Notificame Hub",
            hubToken: "Token"
          },
          maps: {
            title: "Api Google Maps",
            apiMaps: "Api Key"
          }
        },
      },
      languageSelector: {
        title: "Selecione o idioma"
      },
      locationPreview: {
        title: "Localização recebida",
        alt: "Localização",
        latitude: "Latitude",
        longitude: "Longitude",
        buttons: {
          view: "VISUALIZAR"
        },
        noCoordinates: "Coordenadas não disponíveis"
      },
      multiVcardPreview: {
        title: "Contatos recebidos",
        viewAll: "Ver todos os {{count}} contatos"
      },
      vcardPreview: {
        chat: "CONVERSAR",
        mobile: "Celular",
        number: "Número",
        contactName: "Nome do Contato",
        numberNotAvailable: "Número não disponível",
        selectNumberTitle: "Selecione um número para conversar",
        whatsappNumber: "Número com WhatsApp",
        phoneNumber: "Número de telefone",
        cancel: "Cancelar"
      },
      login: {
        title: "Faça o seu login agora",
        form: {
          email: "Insira o e-mail",
          password: "Coloque a sua senha",
        },
        buttons: {
          forgotPassword: "Esqueceu a Senha?",
          submit: "Fazer login",
          register: "Não tem uma conta? Cadastre-se!",
        },
      },
      mainDrawer: {
        listItems: {
          general: "Geral",
          administration: "Administração",
          apititle: "API",
          videos: "Vídeos informativos",
          api: "Uso da API",
          apidocs: "Documentação da API",
          apikey: "Gerenciador da API",
          tickets: "Tickets",
          contacts: "Contatos",
          blockedContacts: "Contatos Bloqueados",
          dashboard: "Dashboard",
          quickAnswers: "Respostas Rápidas",
          tags: "Tags",
          clientStatus: "Status de Clientes",
          channels: "Canais",
          queues: "Setores",
          users: "Atendentes",
          groups: "Grupos",
          settings: "Configurações",
          system: "Monitoramento do Sistema",
          errorLogs: "Log de Erros",
          diskSpace: "Espaço em Disco",
          maintenance: "Manutenção do Sistema",
          memoryUsage: "Uso de Memória RAM",
          cpuUsage: "Uso de CPU",
          databaseStatus: "Banco de Dados",
          backup: "Backup e Restauração DB",
          activityLogs: "Logs de Atividade",
          networkStatus: "Status da Rede",
          queueMonitor: "Monitoramento de Setores",
          userMonitor: "Monitoramento de Usuários",
          systemHealth: "Monitoramento de Canais",
          systemUpdate: "Atualizações do Sistema",
          versionCheck: "Verificação da Lib",
          logout: "Sair",
        },
        appBar: {
          message: {
            hi: "Olá",
            text: "Seja bem-vindo ao Sistema"
          },
          user: {
            profile: "Perfil",
            logout: "Sair",
          },
          fullscreen: {
            enter: "Tela cheia",
            exit: "Sair da tela cheia"
          },
        },
      },
      messageOptionsMenu: {
        react: "Reagir (beta)",
        edit: "Editar",
        history: "Histórico",
        delete: "Deletar",
        reply: "Responder",
        copy: "Copiar",
        forward: "Encaminhar (beta)",
        copied: "Mensagem copiada!",
        copyError: "Erro ao copiar mensagem",
        confirmationModal: {
          title: "Apagar mensagem?",
          message: "Esta ação não pode ser revertida.",
        },
      },
      forwardMessages: {
        title: "Encaminhar mensagens para",
        searchPlaceholder: "Pesquisar nome ou número",
        selectedCount: "selecionada",
        selectedCountPlural: "selecionadas",
        forwardButton: "Encaminhar",
        cancel: "Cancelar",
        selectMode: "Selecionar mensagens",
        exitSelectMode: "Sair",
        noMessagesSelected: "Nenhuma mensagem selecionada",
        forwarded: "Encaminhada",
        forwardedSuccess: "Mensagens encaminhadas com sucesso!",
        forwardedError: "Erro ao encaminhar mensagens",
      },
      healthCheck: {
        title: "Monitoramento de Canais",
        tooltips: {
          refresh: "Atualizar"
        },
        noChannels: "Nenhum canal encontrado",
        number: "Número",
        pushname: "Usuário",
        platform: "Plataforma",
        wwebVersion: "Versão",
        uptime: "Uptime",
        messages: "Mensagens",
        latency: "Latência",
        errors: "Erros",
        lastActivity: "Última atividade",
        connectionStatus: "Status da Conexão"
      },
      messageHistoryModal: {
        close: "Fechar",
        title: "Histórico de edição da mensagem"
      },
      messagesList: {
        header: {
          assignedTo: "Responsável",
          queue: "Setor",
          channel: "Canal",
          noAssignedUser: "Nenhum",
          noChannel: "Nenhum",
          noQueue: "Nenhum",
          buttons: {
            return: "Retornar",
            resolve: "Finalizar",
            reopen: "Reabrir",
            accept: "Aceitar",
            options: "Opções"
          },
        },
        message: {
          notCompatibleWithSystem: "Você recebeu uma mensagem que atualmente não é compatível com o sistema.",
          viewOnMobile: "Para visualizar o conteúdo completo, acesse o aplicativo no celular.",
          type: "Tipo de mensagem",
          download: "Baixar",
          ticketNumber: "#ticket:",
          voiceVideoLost: "Mensagem de voz ou video perdida às",
          deleted: "Mensagem apagada",
          edited: "Editada",
          today: "Hoje",
          yesterday: "Ontem"
        }
      },
      messagesInput: {
        placeholderOpen: "Digite uma mensagem",
        placeholderClosed: "Esse ticket está fechado!",
        placeholderBlocked: "O contato está bloqueado. Desbloqueie para enviar mensagens.",
        signMessage: "Assinar",
        btnSend: "Enviar",
        btnUploadFile: "Enviar mídia",
        btnRecord: "Gravar áudio",
        tooManyFiles: "Número máximo de arquivos excedido. Max: ",
        dropFilesHere: "Arraste arquivos aqui",
        buttons: {
          emoji: "Adicionar emoji",
          attach: "Anexar arquivo",
          record: "Gravar áudio",
          send: "Enviar mensagem"
        },  
        clearReply: "Limpar resposta"
      },
      attachmentMenu: {
        document: "Documento",
        documentDesc: "PDF, DOC, TXT e outros",
        photoVideo: "Fotos e vídeos",
        photoVideoDesc: "Imagens e vídeos da galeria",
        camera: "Câmera (beta)",
        cameraDesc: "Tirar foto ou gravar vídeo",
        audio: "Áudio",
        audioDesc: "Arquivos de áudio MP3, WAV e outros",
        contact: "Contato (beta)",
        contactDesc: "Compartilhar contato"
      },
      messageVariablesPicker: {
        label: "Variavéis disponíveis",
        vars: {
          contactName: "Nome",
          user: "Atendente",
          greeting: "Saudação",
          protocolNumber: "Protocolo",
          date: "Data",
          hour: "Hora",
          ticket_id: "Ticked ID",
          queue: "Setor",
          connection: "Canal"
        }
      },
      modalImageContact: {
        alt: "Imagem do contato",
        toolBar: {
          rotateLeft: "Girar para esquerda",
          rotateRight: "Girar para direita",
          zoomIn: "Zoom in",
          zoomOut: "Zoom out",
          resetZoom: "Reset zoom",
          fullscreen: "Tela cheia",
          fullscreenExit: "Sair da tela cheia",
          copyLink: "Copiar link",
          download: "Baixar imagem"
        },
        snackbar: {
          copyLinkSuccess: "Link copiado com sucesso!",
          copyLinkError: "Erro ao copiar link. Tente novamente.",
        }
      },
      modalImageCors: {
        alt: "Imagem do contato",
        error: {
          loadImage: "Erro ao carregar imagem"
        },
        navigation: {
          previous: "Imagem anterior",
          next: "Próxima imagem"
        },
        button: {
          applyCrop: "Aplicar",
          cancelCrop: "Cancelar"
        },
        dragToCrop: "Arraste para selecionar a área de recorte",
        toolBar: {
          rotateLeft: "Girar para esquerda",
          rotateRight: "Girar para direita",
          zoomIn: "Zoom in",
          zoomOut: "Zoom out",
          resetZoom: "Reset zoom",
          fullscreen: "Tela cheia",
          exitFullscreen: "Sair da tela cheia",
          copyLink: "Copiar link",
          download: "Baixar imagem",
          cancelCrop: "Cancelar recorte",
          cropImage: "Recortar imagem",
          disableCompare: "Desativar comparação",
          compareImages: "Comparar imagens",
          downloadImage: "Baixar imagem"
        },
        snackbar: {
          copyLinkSuccess: "Link copiado com sucesso!",
          copyLinkError: "Erro ao copiar link. Tente novamente.",
          cropSuccess: "Imagem recortada com sucesso!",
          cropError: "Erro ao recortar imagem. Tente novamente."
        }
      },
      newTicketModal: {
        title: "Criar Ticket",
        fieldLabel: "Digite para pesquisar o contato",
        add: "Adicionar",
        select: {
          none: "Selecione",
          queue: "Selecionar Setor",
          channel: "Selecionar Canal"
        },
        buttons: {
          ok: "Salvar",
          cancel: "Cancelar",
        },
      },
      newTicketModalContactPage: {
        title: "Criar Ticket",
        queue: "Selecione um Setor",
        fieldLabel: "Digite para pesquisar o contato",
        add: "Adicionar",
        buttons: {
          ok: "Salvar",
          cancel: "Cancelar",
        },
      },
      notifications: {
        allow: "Permitir as notificações no navegador?",
        noTickets: "Nenhuma notificação.",
        permissionGranted: "Permissão concedida.",
        permissionDenied: "Permissão negada.",
      },
      qrCode: {
        message: "Leia o QrCode para iniciar a sessão",
      },
      queueModal: {
        title: {
          add: "Adicionar Setor",
          edit: "Editar Setor",
        },
        notification: {
          title: "Setor salvo com sucesso!",
        },
        validation: {
          tooShort: "Muito curto",
          tooLong: "Muito longo",
          requiredName: "O nome do setor é obrigatório",
          requiredColor: "A cor do setor é obrigatória",
        },
        form: {
          name: "Nome",
          namePlaceholder: "Digite o nome do setor",
          color: "Cor",
          colorTooltip: "Cor atual do setor",
          selectColor: "Selecionar cor",
          greetingMessage: "Mensagem de saudação",
          greetingMessagePlaceholder: "Digite a mensagem que será enviada quando o cliente for atendido neste setor",
          startWork: "Abertura",
          endWork: "Fechamento",
          absenceMessage: "Mensagem de ausência",
          absenceMessagePlaceholder: "Digite a mensagem que será enviada quando o setor estiver fechado",
          breakTitle: "Horário de Intervalo",
          startBreak: "Início do intervalo",
          endBreak: "Fim do intervalo",
          breakMessage: "Mensagem de intervalo",
          breakMessagePlaceholder: "Digite a mensagem que será enviada quando o setor estiver em intervalo",
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
      },
      queues: {
        title: "Setores",
        notifications: {
          queueDeleted: "O setor foi deletado.",
        },
        table: {
          id: "ID",
          name: "Nome",
          color: "Cor",
          greeting: "Ver mensagens",
          workHours: "Horários",
          actions: "Ações",
          startWork: "Abertura",
          endWork: "Fechamento",
          edit: "Editar",
          delete: "Excluir",
        },
        buttons: {
          add: "Adicionar setor",
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage: "Você tem certeza? Essa ação não pode ser revertida! Os tickets desse setor continuarão existindo, mas não terão mais nenhuma setor atribuído.",
        },
        messagesModal: {
          title: "Mensagens",
          greetingMessage: "Mensagem de Saudação",
          absenceMessage: "Mensagem de Ausência",
          none: "Nenhuma mensagem",
          btnClose: "Fechar",
        },
        timeModal: {
          title: "Horários de Trabalho",
          notSet: "Não definido",
          btnClose: "Fechar",
        }
      },
      queueSelect: {
        inputLabel: "Setores",
      },
      quickAnswers: {
        title: "Respostas Rápidas",
        table: {
          shortcut: "Atalho",
          message: "Resposta Rápida",
          actions: "Ações",
        },
        buttons: {
          add: "Adicionar Resposta Rápida",
          deleteAll: "Excluir Todas Respostas Rápidas",
        },
        toasts: {
          deleted: "Resposta Rápida excluída com sucesso.",
          deletedAll: "Todas as Respostas Rápidas excluídas.",
        },
        searchPlaceholder: "Pesquisar...",
        confirmationModal: {
          deleteTitle: "Você tem certeza que quer excluir esta Resposta Rápida: ",
          deleteAllTitle: "Você tem certeza que quer excluir todas Respostas Rápidas?",
          deleteMessage: "Esta ação não pode ser revertida.",
          deleteAllMessage: "Esta ação não pode ser revertida.",
        },
      },
      quickAnswersModal: {
        title: {
          add: "Adicionar Resposta Rápida",
          edit: "Editar Resposta Rápida",
        },
        form: {
          shortcut: "Atalho",
          message: "Resposta Rápida",
        },
        variables: "Variáveis disponíveis",
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "Resposta Rápida salva com sucesso.",
      },
      resetPassword: {
        title: "Redefinir Senha",
        form: {
          password: "Nova Senha",
          confirmPassword: "Confirme a Nova Senha"
        },
        buttons: {
          submit: "Redefinir Senha",
          backToLogin: "Voltar ao Login"
        },
        success: "Senha redefinida com sucesso!",
        error: {
          passwordMismatch: "As senhas não coincidem.",
          generic: "Erro ao redefinir senha. Tente novamente."
        }
      },
      settings: {
        title: "Configurações",
        success: "Configurações salvas com sucesso.",
        tabs: {
          general: "Gerais",
          personalize: "Personalizar",
          integrations: "Integrações",
          company: "Empresa"
        },
        general: {
          ticketManagement: "Gerenciamento de Tickets",
          userInterface: "Interface do Usuário",
          systemBehavior: "Comportamento do Sistema",
          timeSettings: "Configurações de Tempo",
          userCreation: {
            name: "Criação de atendente",
            note: "Permitir a criação de atendente",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          allTicket: {
            name: "Todos podem ver o chamado sem setor",
            note: "Ative essa função para deixar todos os usuários verem os chamados sem setor",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          CheckMsgIsGroup: {
            name: "Ignorar Mensagens de Grupos",
            note: "Se desabilitar, irá receber mensagem dos grupos.",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          call: {
            name: "Não aceitar chamadas",
            note: "Se habilitado, o cliente receberá uma mensagem informando que não aceita chamadas de voz/vídeo",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          autoRejectCalls: {
            name: "Rejeitar Chamadas Automaticamente (beta)",
            note: "Rejeita automaticamente todas as chamadas recebidas (voz e vídeo) e envia uma mensagem configurável",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          autoRejectCallsMessage: {
            name: "Mensagem de Rejeição de Chamadas",
            note: "Mensagem enviada automaticamente após rejeitar uma chamada",
            placeholder: "Digite a mensagem que será enviada quando uma chamada for rejeitada...",
          },
          callSettings: "Configurações de Chamadas",
          sideMenu: {
            name: "Menu Lateral Inicial",
            note: "Se habilitado, o menu lateral irá iniciar fechado",
            options: {
              enabled: "Aberto",
              disabled: "Fechado",
            },
          },
          quickAnswer: {
            name: "Respostas Rápidas",
            note: "Se habilitado, poderá editar as respostas rápidas",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          closeTicketApi: {
            name: "Encerrar Ticket enviado API",
            note: "Fecha automaticamente o ticket quando enviado por API",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          darkMode: {
            name: "Ativa Modo Escuro",
            note: "Alternar entre o modo claro e o modo escuro",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          ASC: {
            name: "Ordenação dos Tickets (ASC ou DESC)",
            note: "Ao ativar irá ordenar ascendente (ASC), desativando ordenará decrescente (DESC)",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          created: {
            name: "Ordenação dos Tickets (createdAt ou updateAt)",
            note: "Ao ativar irá ordenar pela data de criação (createdAt), desativando ordenará pela data de atualização (updateAt)",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          openTickets: {
            name: "Impedir multi-tickets para mesmo contato",
            note: "Ao ativar irá impedir de abrir tickets de contatos que já tenham ticket aberto",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          signOption: {
            name: "Assinar Mensagem",
            note: "Ative essa função para permitir que o usuário possa desativar a assinatura de mensagens",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          tabsPending: {
            name: "Mostrar tabs de pendentes",
            note: "Se desabilitar não irá exibir a tab pendentes",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          tabsClosed: {
            name: "Mostrar tabs de finalizados",
            note: "Se desabilitar não irá exibir a tab finalizados",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          listItemSpy: {
            name: "Mostrar botão Espiar",
            note: "Se habilitado, irá mostrar o botão Espiar na lista de tickets",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          queueLength: {
            name: "Permitir enviar saudação do canal com 1 Setor",
            note: "Se habilitado, irá permitir enviar a mensagem de saudação do canal apenas com 1 setor",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            }
          },
          timeCreateNewTicket: {
            name: "Novo Ticket em:",
            note: "Selecione o tempo que será necessário para abrir um novo ticket, caso o cliente entre em contatos novamente",
            options: {
              "10": "10 Segundos",
              "30": "30 Segundos",
              "60": "1 minuto",
              "300": "5 minutos",
              "1800": "30 minutos",
              "3600": "1 hora",
              "7200": "2 horas",
              "21600": "6 horas",
              "43200": "12 horas",
              "86400": "24 horas",
              "604800": "7 dias",
              "1296000": "15 dias",
              "2592000": "30 dias",
            },
          },
        },
        personalize: {
          success: {
            company: "Dados da empresa salvos com sucesso!",
            logos: "Logos salvos com sucesso!",
            colors: "Cores salvos com sucesso!",
          },
          error: {
            invalid: "Erro ao buscar personalizações.",
            company: "Erro ao salvar dados da empresa.",
            logos: "Erro ao salvar a logo.",
            logs: "Erro ao salvar a persoanalização:",
            colors: "Erro ao salvar cores do tema: "
          },
          tabs: {
            company: "Empresa",
            logos: "Logos",
            colors: "Cores",
          },
          tabpanel: {
            companyInfo: "Informações da Empresa",
            company: "Nome da Empresa",
            url: "URL",
            light: "Tema Claro",
            dark: "Tema Escuro",
            input: {
              primary: "Cor Primária",
              secondary: "Cor Secundária",
              default: "Background Default",
              paper: "Background Paper",
            },
            button: {
              save: "Salvar",
              saveLight: "Salvar tema claro",
              saveDark: "Salvar tema escuro",
            }
          },
        }
      },
      signup: {
        title: "Cadastre-se",
        toasts: {
          success: "Atendente criado com sucesso! Faça seu login!!!.",
          fail: "Erro ao criar atendente. Verifique os dados informados.",
        },
        form: {
          name: "Nome",
          email: "E-mail",
          password: "Senha",
        },
        buttons: {
          submit: "Cadastrar",
          login: "Já tem uma conta? Entre!",
        },
      },
      tags: {
        title: "Tags",
        table: {
          id: "ID",
          name: "Tags",
          color: "Cor",
          contacts: "Contatos",
          actions: "Ação"
        },
        toasts: {
          deleted: "Tag excluída com sucesso!",
          deletedAll: "Todas Tags excluídas com sucesso!",
        },
        buttons: {
          add: "Adicionar",
          deleteAll: "Deletar Todos",
          viewContacts: "Ver contatos com esta tag"
        },
        confirmationModal: {
          deleteTitle: "Deletar ",
          deleteAllTitle: "Deletar Todos",
          deleteMessage: "Tem certeza que deseja deletar esta Tag?",
          deleteAllMessage: "Tem certeza que deseja deletar todas as Tags?",
        },
      },
      tagModal: {
        title: {
          add: "Adicionar Tag",
          edit: "Editar Tag",
        },
        buttons: {
          okAdd: "Salvar",
          okEdit: "Editar",
          cancel: "Cancelar",
        },
        form: {
          name: "Nome da Tag",
          color: "Cor da Tag"
        },
        success: "Tag salva com sucesso!",
      },
      clientStatus: {
        title: "Status de Clientes",
        table: {
          id: "ID",
          name: "Status",
          color: "Cor",
          contacts: "Contatos",
          actions: "Ação"
        },
        toasts: {
          deleted: "Status excluído com sucesso!",
          deletedAll: "Todos os Status excluídos com sucesso!",
        },
        buttons: {
          add: "Adicionar",
          deleteAll: "Deletar Todos",
          viewContacts: "Ver contatos com este status"
        },
        confirmationModal: {
          deleteTitle: "Deletar ",
          deleteAllTitle: "Deletar Todos",
          deleteMessage: "Tem certeza que deseja deletar este Status?",
          deleteAllMessage: "Tem certeza que deseja deletar todos os Status?",
        },
      },
      clientStatusModal: {
        title: {
          add: "Adicionar Status",
          edit: "Editar Status",
        },
        buttons: {
          okAdd: "Salvar",
          okEdit: "Editar",
          cancel: "Cancelar",
        },
        form: {
          name: "Nome do Status",
          color: "Cor do Status"
        },
        success: "Status salvo com sucesso!",
      },
      ticketsManager: {
        buttons: {
          newTicket: "Novo Ticket",
          closed: "Finalizar",
          refresh: "Atualizar"
        },
        menu: {
          all: "Todos os Tickets",
          open: "Todos Em Atendimento",
          pending: "Todos no Aguardando",
          groups: "Todos os Grupos"
        },
        confirmationModal: {
          closeAllTitle: "Finalizar Todos os Tickets",
          closeOpenTitle: "Finalizar Tickets Em Atendimento",
          closePendingTitle: "Finalizar Tickets no Aguardando",
          closeGroupsTitle: "Finalizar Todos os Grupos",
          closeAllMessage: "Tem certeza que deseja finalizar todos os Tickets?",
          closeOpenMessage: "Tem certeza que deseja finalizar todos os Tickets Em Atendimento (individuais)?",
          closePendingMessage: "Tem certeza que deseja finalizar todos os Tickets no Aguardando?",
          closeGroupsMessage: "Tem certeza que deseja finalizar todos os Grupos em Atendimento?"
        }
      },
      ticketsQueueSelect: {
        placeholder: "Setores",
      },
      tickets: {
        toasts: {
          deleted: "O ticket que você estava foi deletado.",
        },
        notification: {
          message: "Mensagem de",
        },
        notifications: {
          closed: {
            success: "Tickets finalizados com sucesso!",
            error: "Erro ao finalizar tickets. Tente novamente.",
            tickets: "tickets finalizados"
          }
        },
        tabs: {
          open: { title: "Em Atendimento" },
          groups: { title: "Grupos" },
          pending: { title: "Aguardando" },
          closed: { title: "Finalizados" },
          search: { title: "Busca" },
        },
        search: {
          placeholder: "Buscar tickets e mensagens",
        },
        buttons: {
          showAll: "Todos",
          queues: "Setores"
        },
        confirmationModal: {
          closeTicket: {
            title: "Finalizar Ticket ",
            message: "Tem certeza que deseja finalizar este ticket?",
          },
        },
      },
      transferTicketModal: {
        title: "Transferir Ticket",
        fieldLabel: "Digite para buscar um atendente",
        fieldConnectionLabel: "Selecionar Canal",
        fieldQueueLabel: "Transferir para o Setor",
        fieldConnectionPlaceholder: "Selecione um Canal",
        noOptions: "Nenhum atendente encontrado com esse nome",
        buttons: {
          ok: "Transferir",
          cancel: "Cancelar",
        },
      },
      ticketsList: {
        pendingHeader: "Aguardando",
        assignedHeader: "Atendendo",
        noTicketsTitle: "Nada aqui!",
        noTicketsMessage: "Nenhum ticket encontrado com esse status ou termo pesquisado",
        connectionTitle: "Canal que está sendo utilizada atualmente.",
        items: {
          queueless: "Sem Setor",
          accept: "Aceitar",
          spy: "Espiar",
          close: "Finalizar",
          reopen: "Reabrir",
          return: "Mover para aguardando",
          connection: "Canal",
          user: "Atendente",
          queue: "Setor",
          tags: "Tags",
          ticket: "Ticket ID"
        },
        buttons: {
          accept: "Responder",
          acceptBeforeBot: "Aceitar",
          start: "iniciar",
          cancel: "Cancelar"
        },
        acceptModal: {
          title: "Aceitar Ticket",
          queue: "Setores",
          selectQueue: "Selecione um setor"
        },
        errors: {
          ticketAlreadyOpen: "Já existe um ticket aberto para este contato, atribuído ao Atendente: *{{userName}}* no Canal: *{{userChannel}}* criado em: *{{ticketCreatedAt}}*."
        }
      },
      ticketOptionsMenu: {
        delete: "Deletar",
        transfer: "Transferir",
        confirmationModal: {
          title: "Deletar o ticket ",
          titleFrom: "do contato ",
          message: "Atenção! Todas as mensagens relacionadas ao ticket serão perdidas.",
        },
        buttons: {
          delete: "Excluir",
          cancel: "Cancelar",
        },
      },
      uploads: {
        titles: {
          titleUploadMsgDragDrop: "ARRASTE E SOLTE ARQUIVOS AQUI",
          titleFileList: "Lista de arquivos"
        }
      },
      uploadModal: {
        title: "Enviar arquivos",
        caption: "Legenda",
        captionPlaceholder: "Adicione uma legenda (opcional)",
        send: "Enviar",
        cancel: "Cancelar",
        remove: "Remover arquivo",
        pdfError: "Não foi possível carregar o PDF. Por favor, faça o download do arquivo."
      },
      users: {
        title: "Atendentes",
        searchPlaceholder: "Pesquisar...",
        status: {
          online: "Online",
          offline: "Offline"
        },
        table: {
          id: "ID",
          name: "Nome",
          status: "Status",
          email: "Email",
          profile: "Perfil",
          whatsapp: "Canal",
          queue: "Setor",
          startWork: "Horário Inicial",
          endWork: "Horário Final",
          schedule: "Horários",
          actions: "Ações",
          viewChannels: "Ver Canais",
          viewQueues: "Ver Setores",
          viewSchedule: "Ver Horários"
        },
        schedule: {
          title: "Horários de Trabalho",
          opening: "Abertura",
          closing: "Fechamento",
        },
        buttons: {
          add: "Adicionar atendente",
          close: "Fechar"
        },
        modalTitle: {
          channel: "Canais",
          queue: "Setores"
        },
        modalTable: {
          id: "ID",
          name: "Nome",
          type: "Tipo",
        },
        toasts: {
          deleted: "Atendente excluído com sucesso.",
          updated: "Atendente atualizado com sucesso."
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage: "Todos os dados do atendente serão perdidos. Os tickets abertos deste atendente serão movidos para a espera.",
        },
        actions: {
          activate: "Ativar usuário",
          deactivate: "Desativar usuário",
          edit: "Editar",
          delete: "Excluir",
        }
      },
      userModal: {
        title: {
          add: "Adicionar atendente",
          edit: "Editar atendente",
        },
        form: {
          name: "Nome",
          namePlaceholder: "Digite o nome do atendente",
          email: "E-mail",
          emailPlaceholder: "Digite o e-mail do atendente",
          password: "Senha",
          passwordPlaceholder: "Digite a senha do atendente",
          toggleVisibility: "Mostrar/ocultar senha",
          profile: "Perfil",
          admin: "Administrador",
          user: "Atendente",
          startWork: "Inicio",
          endWork: "Termino",
          isTricked: "Ver Contatos",
          enabled: "Habilitado",
          disabled: "Desabilitado"
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "Atendente salvo com sucesso.",
      },
      notificameHubModal: {
        title: "Ativar Canais NotificameHub",
        form: {
          name: "Nome",
          namePlaceholder: "Digite o nome da conexão",
          channelSelection: "Seleção de Canal",
          selectChannel: "Selecionar Canal",
          selectChannelPlaceholder: "Selecione um canal",
          mainInfo: "Informações Principais"
        },
        integration: {
          title: "Integração de Canais",
          description: "Para ativar <strong>Facebook</strong>, <strong>Instagram</strong>, <strong>Telegram</strong> e <strong>WebChat</strong>, cadastre-se pelo botão abaixo, depois de adquirir os canais desejados usando o cupom abaixo. Insira o token da sua <strong>Account</strong> na página de Integrações para finalizar a integração.",
          discount: "Use o cupom abaixo para ter cada canal por <strong>R$ 50,00</strong>!",
          copied: "Copiado!",
          copy: "Copiar cupom",
          register: "REALIZE O CADASTRO AQUI"
        },
        buttons: {
          add: "Adicionar",
          cancel: "Cancelar"
        },
        success: "Canal ativado com sucesso."
      },
      whatsappModal: {
        title: {
          add: "Adicionar WhatsApp",
          edit: "Editar WhatsApp",
        },
        form: {
          name: "Nome",
          namePlaceholder: "Digite o nome da conexão",
          default: "Padrão",
          display: "Exibir horário dos setores",
          farewellMessage: "Mensagem de despedida",
          farewellMessagePlaceholder: "Esta mensagem será enviada antes de fechar o atendimento",
          greetingMessagePlaceholder: "Esta mensagem será enviada quando o cliente iniciar a conversa",
          color: "Cor",
          channels: "Ativar Canais",
          mainInfo: "Informações Principais",
          messagesTitle: "Mensagens",
          appearanceTitle: "Aparência",
          queuesTitle: "Setores",
          channelSelection: "Seleção de Canal",
          selectChannel: "Selecionar Canal",
          selectChannelPlaceholder: "Selecione um canal"
        },
        integration: {
          title: "Integração de Canais",
          description: "Para ativar <strong>Facebook</strong>, <strong>Instagram</strong>, <strong>Telegram</strong> e <strong>WebChat</strong>, cadastre-se pelo botão abaixo, depois adquirir os canais desejados usando o cupom abaixo. Insira o token da sua <strong>Account</strong> na página de Integrações para finalizar a integração.",
          discount: "Use o cupom abaixo para <strong>50% de desconto</strong> na compra dos canais!",
          copied: "Copiado!",
          copy: "Copiar cupom",
          register: "REALIZE O CADASTRO AQUI"
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "WhatsApp salvo com sucesso.",
      },
      whatsappSelect: {
        inputLabel: "Canais",
      },
      databaseStatus: {
        title: "Monitoramento do Banco de Dados",
        refresh: "Atualizar",
        fetchError: "Erro ao carregar dados do banco de dados",
        generalInfo: "Informações Gerais",
        dbName: "Nome do Banco",
        status: "Status",
        online: "Online",
        offline: "Offline",
        host: "Host",
        port: "Porta",
        dialect: "Dialeto",
        totalSize: "Tamanho Total",
        performance: "Desempenho",
        uptime: "Tempo de Atividade",
        activeConnections: "Conexões Ativas",
        totalConnections: "Total de Conexões",
        totalQueries: "Total de Consultas",
        slowQueries: "Consultas Lentas",
        dbTables: "Tabelas do Banco de Dados",
        tableName: "Nome da Tabela",
        rows: "Linhas",
        dataSize: "Tamanho de Dados",
        indexSize: "Tamanho de Índices",
        totalSize: "Tamanho Total",
        noTables: "Nenhuma tabela encontrada",
        slowQueriesTitle: "Consultas Lentas (últimas 24h)",
        startTime: "Hora de Início",
        database: "Banco",
        queryTime: "Tempo de Consulta",
        rowsExamined: "Linhas Examinadas",
        sql: "SQL",
        noSlowQueries: "Nenhuma consulta lenta encontrada",
        activeProcesses: "Processos Ativos",
        id: "ID",
        user: "Usuário",
        command: "Comando",
        time: "Tempo (s)",
        state: "Estado",
        query: "Consulta",
        noQuery: "Nenhuma consulta",
        noActiveProcesses: "Nenhum processo ativo encontrado"
      },
      videos: {
        title: "Vídeos Informativos",
        searchPlaceholder: "Buscar por título...",
        loading: "Carregando vídeos...",
        noRecords: "Nenhum vídeo encontrado.",
        table: {
          title: "Título",
          status: "Status",
          visibility: "Visibilidade",
          actions: "Ações"
        },
        active: "Ativo",
        inactive: "Inativo",
        allUsers: "Todos os usuários",
        buttons: {
          add: "Adicionar Vídeo",
          edit: "Editar",
          delete: "Excluir",
          cards: "Ver Cards",
          table: "Ver Tabela",
          save: "Salvar",
          cancel: "Cancelar"
        },
        dialog: {
          add: "Adicionar Vídeo",
          edit: "Editar Vídeo",
          title: "Título",
          url: "URL do YouTube",
          urlHelp: "Insira a URL completa do vídeo do YouTube",
          active: "Ativo",
          users: "Usuários que podem ver",
          usersHelp: "Se nenhum usuário for selecionado, todos poderão ver o vídeo",
          preview: "Pré-visualização"
        },
        toasts: {
          added: "Vídeo adicionado com sucesso!",
          updated: "Vídeo atualizado com sucesso!",
          deleted: "Vídeo excluído com sucesso!",
          required: "Por favor, preencha todos os campos obrigatórios.",
          invalidUrl: "URL de vídeo inválida!",
        },
        confirmationModal: {
          deleteTitle: "Excluir Vídeo",
          deleteMessage: "Tem certeza que deseja excluir este vídeo? Esta ação não pode ser desfeita."
        }
      },
      systemHealth: {
        title: "Painel de Saúde do Sistema",
        refresh: "Atualizar",
        refreshSuccess: "Dados atualizados com sucesso!",
        overallStatus: "Status Geral do Sistema",
        statusHealthy: "Saudável",
        statusWarning: "Atenção",
        statusCritical: "Crítico",
        statusLoading: "Carregando...",
        uptime: "Tempo Ativo",
        activeUsers: "Usuários Ativos",
        openTickets: "Tickets Abertos",
        messagesLast24h: "Mensagens (24h)",
        alerts: "Alertas",
        cpu: "CPU",
        memory: "Memória",
        disk: "Disco",
        database: "Banco de Dados",
        whatsapp: "WhatsApp",
        application: "Aplicação",
        usage: "Uso",
        cores: "Núcleos",
        model: "Modelo",
        loadAvg: "Carga Média",
        total: "Total",
        used: "Usado",
        free: "Livre",
        status: "Status",
        connected: "Conectado",
        error: "Erro",
        responseTime: "Tempo de Resposta",
        activeConnections: "Conexões Ativas",
        version: "Versão",
        totalConnections: "Total de Conexões",
        connectedWhatsapps: "WhatsApps Conectados",
        disconnectedWhatsapps: "WhatsApps Desconectados",
        pendingMessages: "Mensagens Pendentes",
        nodeVersion: "Versão do Node.js",
        pendingTickets: "Tickets Pendentes",
        errors: "Erros",
        checkConnections: "Verificar Conexões",
        databaseStatus: "Status do Banco de Dados",
        databaseResponseTime: "Tempo de Resposta do Banco",
        databaseConnections: "Conexões ao Banco de Dados",
        whatsappStatus: "Status das Conexões WhatsApp",
        applicationStatus: "Status da Aplicação",
        systemStatus: "Status do Sistema",
        healthySystem: "Sistema Saudável",
        warningSystem: "Sistema com Alertas",
        criticalSystem: "Sistema em Estado Crítico"
      },
      queueMonitor: {
        title: "Monitoramento de Setor",
        refresh: "Atualizar",
        refreshSuccess: "Dados atualizados com sucesso!",
        summary: "Resumo",
        totalTickets: "Total de Tickets",
        waitingTickets: "Tickets em Espera",
        avgWaitTime: "Tempo Médio de Espera",
        messagesLast24Hours: "Mensagens (24h)",
        whatsappConnections: "Canais",
        name: "Nome",
        type: "Tipo",
        status: "Status",
        queues: "Setores",
        pendingMessages: "Mensagens Pendentes",
        users: "Usuários",
        pendingTickets: "Tickets Pendentes",
        activeTickets: "Tickets Ativos",
        avgHandleTime: "Tempo Médio de Atendimento",
        oldestTicket: "Ticket Mais Antigo",
        totalMessages: "Total de Mensagens",
        last24Hours: "Últimas 24 Horas",
        last7Days: "Últimos 7 Dias",
        today: "Hoje",
        connected: "Conectado",
        disconnected: "Desconectado",
        loading: "Carregando...",
        justNow: "Agora mesmo",
        minutesAgo: "{{minutes}} minuto(s) atrás",
        hoursAgo: "{{hours}} hora(s) atrás",
        daysAgo: "{{days}} dia(s) atrás"
      },
      userMonitor: {
        title: "Monitoramento de Usuários",
        refresh: "Atualizar",
        refreshSuccess: "Dados atualizados com sucesso!",
        selectUser: "Selecionar Usuário",
        allUsers: "Todos os Usuários",
        summary: "Resumo Geral",
        totalUsers: "Total de Usuários",
        usersOnline: "Usuários Online",
        usersOffline: "Usuários Offline",
        totalTickets: "Total de Tickets",
        totalMessages: "Total de Mensagens",
        avgResponseTime: "Tempo Médio de Resposta",
        avgResolutionRate: "Taxa Média de Resolução",
        user: "Usuário",
        profile: "Perfil",
        status: "Status",
        online: "Online",
        offline: "Offline",
        queues: "Setores",
        tickets: "Tickets",
        messages: "Mensagens",
        resolutionRate: "Taxa de Resolução",
        lastActivity: "Última Atividade",
        detailedStats: "Estatísticas Detalhadas",
        ticketsByUser: "Tickets por Usuário",
        messagesByUser: "Mensagens por Usuário",
        performanceMetrics: "Métricas de Performance",
        userStatus: "Status dos Usuários",
        open: "Abertos",
        pending: "Pendentes",
        closed: "Fechados",
        total: "Total",
        today: "Hoje",
        last7Days: "Últimos 7 Dias",
        responseTime: "Tempo de Resposta",
        handleTime: "Tempo de Atendimento",
        justNow: "Agora mesmo",
        minutesAgo: "{{minutes}} minuto(s) atrás",
        hoursAgo: "{{hours}} hora(s) atrás",
        daysAgo: "{{days}} dia(s) atrás",
        profiles: {
          admin: "Administrador",
          user: "Usuário"
        }
      },
      networkStatus: {
        title: "Status da Rede",
        refresh: "Atualizar",
        fetchError: "Erro ao obter dados da rede",
        internetConnection: "Conexão com a Internet",
        online: "Online",
        offline: "Offline",
        latency: "Latência",
        host: "Host",
        status: "Status",
        avgLatency: "Latência Média",
        minLatency: "Latência Mínima",
        maxLatency: "Latência Máxima",
        dnsStatus: "Status do DNS",
        dnsWorking: "Funcionando",
        dnsFailed: "Falha",
        resolveTime: "Tempo de Resolução",
        activeConnections: "Conexões Ativas",
        total: "Total",
        established: "Estabelecidas",
        listening: "Escutando",
        timeWait: "Tempo de Espera",
        closeWait: "Fechamento Pendente",
        networkInterfaces: "Interfaces de Rede",
        noInterfaces: "Nenhuma interface de rede encontrada",
        up: "Ativa",
        down: "Inativa",
        mac: "Endereço MAC",
        speed: "Velocidade",
        received: "Recebidos",
        sent: "Enviados",
        errors: "Erros",
        dropped: "Descartados",
        lastUpdated: "Última atualização"
      },
      activityLogs: {
        title: "Logs de Atividade",
        filter: "Filtrar",
        refresh: "Atualizar",
        user: "Usuário",
        action: "Ação",
        description: "Descrição",
        entity: "Entidade",
        timestamp: "Data/Hora",
        details: "Detalhes",
        viewDetails: "Ver detalhes",
        noLogs: "Nenhum log de atividade encontrado",
        entityDetails: "Detalhes da Entidade",
        filterTitle: "Filtrar Logs",
        startDate: "Data Inicial",
        endDate: "Data Final",
        selectUser: "Selecionar Usuário",
        selectAction: "Selecionar Ação",
        apply: "Aplicar",
        clear: "Limpar",
        cancel: "Cancelar",
        logDetails: "Detalhes do Log",
        basicInfo: "Informações Básicas",
        ip: "IP",
        close: "Fechar"
      },
      systemUpdate: {
        title: "Atualizações do Sistema",
        checkUpdates: "Verificar Atualizações",
        checkSuccess: "Verificação de atualizações concluída com sucesso!",
        updateStatus: "Status da Atualização",
        versionInfo: "Informações da Versão",
        currentVersion: "Versão Atual",
        latestVersion: "Versão Mais Recente",
        updateAvailable: "Atualização Disponível",
        systemUpdated: "Sistema Atualizado",
        upToDate: "Atualizado",
        lastChecked: "Última verificação",
        releaseNotes: "Notas da Versão",
        installUpdate: "Instalar Atualização",
        backups: "Backups",
        restore: "Restaurar",
        noBackups: "Nenhum backup disponível",
        refreshBackups: "Atualizar Lista de Backups",
        confirmRestore: "Confirmar Restauração",
        restoreWarning: "Tem certeza que deseja restaurar este backup? Esta ação irá substituir todos os dados atuais do sistema e não pode ser desfeita.",
        confirmUpdate: "Confirmar Atualização",
        updateWarning: "Tem certeza que deseja atualizar o sistema? É recomendado fazer um backup antes de continuar.",
        cancel: "Cancelar",
        confirm: "Confirmar",
        checking: "Verificando atualizações...",
        downloading: "Baixando atualização...",
        installing: "Instalando atualização...",
        completed: "Atualização concluída com sucesso!",
        error: "Erro na atualização",
        updateStarted: "Processo de atualização iniciado!",
        restoreStarted: "Processo de restauração iniciado!",
        updateCompleted: "Atualização concluída com sucesso!",
        updateError: "Ocorreu um erro durante a atualização."
      },
      versionCheck: {
        title: "Verificação de Versão",
        checkUpdates: "Verificar Atualizações",
        statusTitle: "Status da Versão do Sistema",
        currentVersion: "Sua Versão",
        latestVersion: "Última Versão",
        upToDate: "Sua versão está atualizada",
        upToDateTitle: "Parabéns! Sistema Atualizado",
        upToDateMessage: "Seu sistema está com a versão mais recente disponível. Você está aproveitando todos os recursos e correções de segurança mais recentes.",
        outdated: "Sua versão está desatualizada",
        latestAvailable: "Versão mais recente disponível",
        updateAvailable: "Atualização Disponível",
        updateMessage: "Uma nova versão do sistema está disponível. Entre em contato com o administrador do sistema para solicitar a atualização.",
        repositoryLink: "Repositório do projeto",
        repository: "GitHub",
        updateLink: "Atualizador Automático",
        update: "Manual de Atualização",
        success: "Informações de versão atualizadas com sucesso!",
        whatsappLibTitle: "Versão da Biblioteca WhatsApp Web JS",
        whatsappLibCurrentVersion: "Versão Atual da Biblioteca",
        whatsappLibLatestVersion: "Última Versão Disponível",
        whatsappLibUpToDate: "Biblioteca atualizada",
        whatsappLibOutdated: "Biblioteca desatualizada",
        whatsappLibLatestAvailable: "Versão mais recente disponível",
        whatsappLibRepository: "Ver no GitHub",
        whatsappLibUpToDateTitle: "Biblioteca WhatsApp Web JS Atualizada",
        whatsappLibUpToDateMessage: "Sua biblioteca WhatsApp Web JS está com a versão mais recente disponível. Você está aproveitando todos os recursos e correções de segurança mais recentes.",
        whatsappLibUpdateAvailable: "Atualização da Biblioteca Disponível",
        whatsappLibUpdateMessage: "Uma nova versão da biblioteca WhatsApp Web JS está disponível."
      },
      backendErrors: {
        ERR_CREATING_MESSAGE: "Erro ao criar mensagem no banco de dados.",
        ERR_CREATING_TICKET: "Erro ao criar ticket no banco de dados.",
        ERR_CONNECTION_CREATION_COUNT: "Limite de canais atingido, para alterar entre em contato com o suporte.",
        ERR_DELETE_WAPP_MSG: "Não foi possível excluir a mensagem do WhatsApp.",
        ERR_DUPLICATED_CONTACT: "Já existe um contato com este número.",
        ERR_EDITING_WAPP_MSG: "Não foi possível editar a mensagem do WhatsApp.",
        ERR_FETCH_WAPP_MSG: "Erro ao buscar a mensagem no WhatsApp, talvez ela seja muito antiga.",
        ERR_INVALID_CREDENTIALS: "Erro de autenticação. Por favor, tente novamente.",
        ERR_NO_CONTACT_FOUND: "Nenhum contato encontrado com este ID.",
        ERR_NO_DEF_WAPP_FOUND: "Nenhum WhatsApp padrão encontrado. Verifique a página de canais.",
        ERR_NO_INTEGRATION_FOUND: "Integração não encontrada.",
        ERR_NO_PERMISSION: "Você não tem permissão para acessar este recurso.",
        ERR_NO_SETTING_FOUND: "Nenhuma configuração encontrada com este ID.",
        ERR_NO_TAG_FOUND: "Tag não encontrada.",
        ERR_NO_TICKET_FOUND: "Nenhum ticket encontrado com este ID.",
        ERR_NO_USER_FOUND: "Nenhum atendente encontrado com este ID.",
        ERR_NO_WAPP_FOUND: "Nenhum WhatsApp encontrado com este ID.",
        ERR_NO_OTHER_WHATSAPP: "Deve haver pelo menos um WhatsApp padrão.",
        ERR_OUT_OF_HOURS: "Fora do Horário de Expediente!",
        ERR_OPEN_USER_TICKET: "Já existe um ticket aberto para este contato com o atendente: ",
        ERR_OTHER_OPEN_TICKET: "Já existe um ticket aberto para este contato.",
        ERR_NONE_USER_TICKET: "Já existe um ticket aberto para este contato sem atendente.",
        ERR_SESSION_EXPIRED: "Sessão expirada. Por favor entre.",
        ERR_SENDING_WAPP_MSG: "Erro ao enviar mensagem do WhatsApp. Verifique a página de canais.",
        ERR_SYNC_TAGS: "Erro ao sincronizar tags.",
        ERR_USER_INACTIVE: "Este atendente está desativado!",
        ERR_USER_TICKET_LIMIT: "Limite de tickets atingido para este atendente.",
        ERR_USER_CREATION_COUNT: "Limite de atendentes atingido, para alterar entre em contato com o suporte.",
        ERR_USER_CREATION_DISABLED: "A criação do atendente foi desabilitada pelo administrador.",
        ERR_WAPP_CHECK_CONTACT: "Não foi possível verificar o contato do WhatsApp. Verifique a página de canais",
        ERR_WAPP_DOWNLOAD_MEDIA: "Não foi possível baixar mídia do WhatsApp. Verifique a página de canais.",
        ERR_WAPP_GREETING_REQUIRED: "A mensagem de saudação é obrigatório quando há mais de um Setor.",
        ERR_WAPP_INVALID_CONTACT: "Este não é um número de Whatsapp válido.",
        ERR_WAPP_NOT_INITIALIZED: "Esta sessão do WhatsApp não foi inicializada. Verifique a página de canais.",
        ERR_WAPP_SESSION_EXPIRED: "Sessão do WhatsApp expirada.",
      },
    },
  },
};

export { messages };
