const messages = {
  pt: {
    translations: {
      auth: {
        toasts: {
          success: "Login efetuado com sucesso!",
        },
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
      connections: {
        title: "Conexões",
        toasts: {
          deleted: "Conexão com o WhatsApp excluída com sucesso!",
        },
        confirmationModal: {
          deleteTitle: "Deletar",
          deleteMessage: "Você tem certeza? Essa ação não pode ser revertida.",
          disconnectTitle: "Desconectar",
          disconnectMessage: "Tem certeza? Você precisará ler o QR Code novamente.",
        },
        buttons: {
          add: "Adicionar WhatsApp",
          shutdown: "Excluir",
          restart: "Restart",
          disconnect: "Desconectar",
          tryAgain: "Tentar novamente",
          qrcode: "QR CODE",
          newQr: "Novo QR CODE",
          connecting: "Conectando",
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
          address: "Endereço",
          email: "Email",
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
      },
      contacts: {
        title: "Contatos",
        toasts: {
          deleted: "Contato excluído com sucesso!",
          deletedAll: "Todos contatos excluídos com sucesso!",
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
          delete: "Excluir Todos Contatos"
        },
        table: {
          name: "Nome",
          whatsapp: "WhatsApp",
          address: "Endereço",
          channels: "Canais",
          actions: "Ações",
        },
      },
      contactDrawer: {
        header: "Dados do contato",
        buttons: {
          edit: "Editar contato",
        },
        extraInfo: "Outras informações",
      },
      copyToClipboard: {
        copy: "Copiar",
        copied: "Copiado"
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
            title: "Resolvido"
          }
        },
        charts: {
          perDay: {
            title: "Tickets por dia: ",
          },
          date: {
            title: "Filtrar"
          }
        },
        chartPerUser: {
          title: "Tickets por usuário",
          ticket: "Ticket",
          date: {
            title: "Filtrar"
          }
        },
        chartPerConnection: {
          date: {
            title: "Filtrar"
          },
          perConnection: {
            title: "Tickets por conexão"
          }
        },
        chartPerQueue: {
          date: {
            title: "Filtrar"
          },
          perQueue: {
            title: "Tickets por Setor"
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
        }
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
      login: {
        title: "Faça o seu login agora",
        form: {
          email: "Insira o e-mail",
          password: "Coloque a sua senha",
        },
        buttons: {
          submit: "Fazer login",
          register: "Não tem um conta? Cadastre-se!",
        },
      },
      mainDrawer: {
        listItems: {
          general: "Geral",
          dashboard: "Dashboard",
          connections: "Conexões",
          tickets: "Tickets",
          contacts: "Contatos",
          quickAnswers: "Respostas Rápidas",
          tags: "Tags",
          queues: "Setores",
          administration: "Administração",
          users: "Atendentes",
          company: "Empresa",
          integrations: "Integrações",
          settings: "Configurações",
          sendMsg: "Envio de Mensagens",
          sendMedia: "Envio de Mídia",
          api: "Uso da API",
          apidocs: "Documentação",
          apititle: "API",
          apikey: "API Key",
          token: "Token"
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
        },
      },
      messageOptionsMenu: {
        edit: "Editar",
        history: "Histórico",
        delete: "Deletar",
        reply: "Responder",
        confirmationModal: {
          title: "Apagar mensagem?",
          message: "Esta ação não pode ser revertida.",
        },
      },
      messageHistoryModal: {
        close: "Fechar",
        title: "Histórico de edição da mensagem"
      },
      messagesList: {
        header: {
          assignedTo: "Responsável:",
          buttons: {
            return: "Retornar",
            resolve: "Resolver",
            reopen: "Reabrir",
            accept: "Aceitar",
          },
        },
      },
      messagesInput: {
        placeholderOpen: "Digite uma mensagem",
        placeholderClosed: "Reabra ou aceite esse ticket para enviar uma mensagem.",
        signMessage: "Assinar",
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
          connection: "Conexão"
        }
      },
      newTicketModal: {
        title: "Criar Ticket",
        fieldLabel: "Digite para pesquisar o contato",
        add: "Adicionar",
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
        form: {
          name: "Nome",
          color: "Cor",
          greetingMessage: "Mensagem de saudação",
          startWork: "Abertura",
          endWork: "Fechamento",
          absenceMessage: "Mensagem de ausência",
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
          greeting: "Mensagem de saudação",
          actions: "Ações",
          startWork: "Abertura",
          endWork: "Fechamento",
        },
        buttons: {
          add: "Adicionar setor",
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage: "Você tem certeza? Essa ação não pode ser revertida! Os tickets desse setor continuarão existindo, mas não terão mais nenhuma setor atribuído.",
        },
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
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "Resposta Rápida salva com sucesso.",
      },
      settings: {
        success: "Configurações salvas com sucesso.",
        tabs: {
          general: "Gerais",
          personalize: "Personalizar",
          integrations: "Integrações"
        },
        general: {
          userCreation: {
            name: "Criação de atendente",
            note: "Permitir a criação de atendente",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          allTicket: {
            name: "Todos podem ver o chamado sem departamento",
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
            name: "Aceitar chamadas",
            note: "Se desabilitado, o cliente receberá uma mensagem informando que não aceita chamadas de voz/vídeo",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
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
            data: "Dados",
            logos: "Logos",
            colors: "Cores",
          },
          tabpanel: {
            company: "Empresa",
            url: "URL",
            light: "Theme Light",
            dark: "Theme Dark",
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
      ticketsManager: {
        buttons: {
          newTicket: "Novo",
        },
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
        tabs: {
          open: { title: "Inbox" },
          closed: { title: "Resolvidos" },
          search: { title: "Busca" },
        },
        search: {
          placeholder: "Buscar tickets e mensagens",
        },
        buttons: {
          showAll: "Todos",
        },
      },
      transferTicketModal: {
        title: "Transferir Ticket",
        fieldLabel: "Digite para buscar um atendente",
        fieldConnectionLabel: "Transferir para conexão",
        fieldQueueLabel: "Transferir para o Setor",
        fieldConnectionPlaceholder: "Selecione uma conexão",
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
        connectionTitle: "Conexão que está sendo utilizada atualmente.",
        items: {
          queueless: "Sem Setor",
          accept: "Aceitar",
          spy: "Espiar",
          close: "Encerrar",
          reopen: "Reabrir",
          return: "Mover para aguardando",
          connection: "Conexão",
          user: "Atendente",
          queue: "Setor",
          tags: "Tags"
        },
        buttons: {
          accept: "Responder",
          acceptBeforeBot: "Aceitar",
          start: "iniciar",
          cancel: "Cancelar"
        },
        acceptModal: {
          title: "Aceitar Chat",
          queue: "Selecionar setor"
        },
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
          titleUploadMsgDragDrop: "⬇️ ARRASTE E SOLTE ARQUIVOS NO CAMPO ABAIXO ⬇️",
          titleFileList: "Lista de arquivo(s)"
        },
      },
      users: {
        title: "Atendentes",
        table: {
          id: "ID",
          name: "Nome",
          email: "E-mail",
          profile: "Perfil",
          whatsapp: "Conexão Padrão",
          startWork: "Horário inicial",
          endWork: "Horário final",
          actions: "Ações",
        },
        buttons: {
          add: "Adicionar atendente",
        },
        toasts: {
          deleted: "Atendente excluído com sucesso.",
          updated: "Atendente atualizado com sucesso."
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage: "Todos os dados do atendente serão perdidos. Os tickets abertos deste atendente serão movidos para a espera.",
        },
      },
      userModal: {
        title: {
          add: "Adicionar atendente",
          edit: "Editar atendente",
        },
        form: {
          name: "Nome",
          email: "E-mail",
          password: "Senha",
          profile: "Perfil",
          admin: "Administrador",
          whatsapp: "Conexão Padrão",
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
      whatsappModal: {
        title: {
          add: "Adicionar WhatsApp",
          edit: "Editar WhatsApp",
        },
        form: {
          name: "Nome",
          default: "Padrão",
          display: "Exibir horário dos setores",
          farewellMessage: "Mensagem de despedida"
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "WhatsApp salvo com sucesso.",
      },
      backendErrors: {
        ERR_CREATING_MESSAGE: "Erro ao criar mensagem no banco de dados.",
        ERR_CREATING_TICKET: "Erro ao criar ticket no banco de dados.",
        ERR_CONNECTION_CREATION_COUNT: "Limite de conexões atingido, para alterar entre em contato com o suporte.",
        ERR_DELETE_WAPP_MSG: "Não foi possível excluir a mensagem do WhatsApp.",
        ERR_DUPLICATED_CONTACT: "Já existe um contato com este número.",
        ERR_EDITING_WAPP_MSG: "Não foi possível editar a mensagem do WhatsApp.",
        ERR_FETCH_WAPP_MSG: "Erro ao buscar a mensagem no WhatsApp, talvez ela seja muito antiga.",
        ERR_INVALID_CREDENTIALS: "Erro de autenticação. Por favor, tente novamente.",
        ERR_NO_CONTACT_FOUND: "Nenhum contato encontrado com este ID.",
        ERR_NO_DEF_WAPP_FOUND: "Nenhum WhatsApp padrão encontrado. Verifique a página de conexões.",
        ERR_NO_INTEGRATION_FOUND: "Integração não encontrada.",
        ERR_NO_PERMISSION: "Você não tem permissão para acessar este recurso.",
        ERR_NO_SETTING_FOUND: "Nenhuma configuração encontrada com este ID.",
        ERR_NO_TAG_FOUND: "Tag não encontrada.",
        ERR_NO_TICKET_FOUND: "Nenhum ticket encontrado com este ID.",
        ERR_NO_USER_FOUND: "Nenhum atendente encontrado com este ID.",
        ERR_NO_WAPP_FOUND: "Nenhum WhatsApp encontrado com este ID.",
        ERR_NO_OTHER_WHATSAPP: "Deve haver pelo menos um WhatsApp padrão.",
        ERR_OUT_OF_HOURS: "Fora do Horário de Expediente!",
        ERR_OPEN_USER_TICKET: "Já existe um ticket aberto para este contato com ",
        ERR_OTHER_OPEN_TICKET: "Já existe um ticket aberto para este contato.",
        ERR_SESSION_EXPIRED: "Sessão expirada. Por favor entre.",
        ERR_SENDING_WAPP_MSG: "Erro ao enviar mensagem do WhatsApp. Verifique a página de conexões.",
        ERR_USER_CREATION_COUNT: "Limite de atendentes atingido, para alterar entre em contato com o suporte.",
        ERR_USER_CREATION_DISABLED: "A criação do atendente foi desabilitada pelo administrador.",
        ERR_WAPP_CHECK_CONTACT: "Não foi possível verificar o contato do WhatsApp. Verifique a página de conexões",
        ERR_WAPP_DOWNLOAD_MEDIA: "Não foi possível baixar mídia do WhatsApp. Verifique a página de conexões.",
        ERR_WAPP_GREETING_REQUIRED: "A mensagem de saudação é obrigatório quando há mais de um Setor.",
        ERR_WAPP_INVALID_CONTACT: "Este não é um número de Whatsapp válido.",
        ERR_WAPP_NOT_INITIALIZED: "Esta sessão do WhatsApp não foi inicializada. Verifique a página de conexões.",
        ERR_WAPP_SESSION_EXPIRED: "Sessão do WhatsApp expirada.",
      },
    },
  },
};

export { messages };

