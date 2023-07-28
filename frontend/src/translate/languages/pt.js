const messages = {
  pt: {
    translations: {
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
      auth: {
        toasts: {
          success: "Login efetuado com sucesso!",
        },
      },
      messageVariablesPicker: {
        label: "Variavéis disponíveis",
        vars: {
          contactFirstName: "Primeiro Nome",
          contactName: "Nome",
          user: "Atendente",
          greeting: "Saudação",
          protocolNumber: "Protocolo",
          date: "Data",
          hour: "Hora",
          ticket_id: "Nº do Chamado",
          queue: "Setor",
          connection: "Conexão"
        }
      },
      dashboard: {
        charts: {
          perDay: {
            title: "Chamados de hoje: ",
            titleAll: "Todos os Chamados: ",
          },
        },
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
        }
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
          disconnect: "desconectar",
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
          id: "ID da Instância",
          name: "Nome",
          number: "Número",
          status: "Status",
          lastUpdate: "Última atualização",
          default: "Padrão",
          actions: "Ações",
          session: "Sessão",
        },
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
          group: "Permitir mensagens de grupos",
          farewellMessage: "Mensagem de despedida",
          ratingMessage: "Mensagem de avaliação",
          sendInactiveMessage: "Encerramento automático",
          timeInactiveMessage: "Tempo para encerrar atendimento automático",
          inactiveMessage: "Mensagem de encerramento automático",
          instructionRatingMessage: "Para habilitar as avaliações, basta preencher este campo",
          outOfWorkMessage: "Personalize a mensagem quando estiver fora do horário de expediente",
          startWorkHour: "Abertura",
          endWorkHour: "Fechamento",
          startWorkHourLunch: "Início Almoço",
          endWorkHourLunch: "Fechamento Almoço",
          monday: "Segunda",
          tuesday: "Terça",
          wednesday: "Quarta",
          thursday: "Quinta",
          friday: "Sexta",
          saturday: "Sábado",
          sunday: "Domingo",
          holiday: "Feriado",
          defineHourExpedient: "Definir horário de expediente",
          longText: "Marque esta opção para definir um horário de expediente para os atendimentos.",
          token: "Token",
          checkHourExpedient: "Checar Horário de Expediente"
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "WhatsApp salvo com sucesso.",
      },
      qrCode: {
        message: "Leia o QrCode para iniciar a sessão",
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
          deleteMessage: "Tem certeza que deseja deletar este contato? Todos os chamados relacionados serão perdidos.",
          deleteAllMessage: "Tem certeza que deseja deletar todos os contatos? Todos os chamados relacionados serão perdidos.",
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
          email: "E-mail",
          actions: "Ações",
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
      tags: {
        title: "Tags",
        table: {
          id:"ID",
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
          download: "Download",
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
          allHistoric: "Ver históricos",
          allHistoricEnabled: "Habilitado",
          allHistoricDesabled: "Desabilitado",

          isRemoveTags: "Remover tags",
          isRemoveTagsEnabled: "Habilitado",
          isRemoveTagsDesabled: "Desabilitado",

          viewConection: "Ver conexões",
          viewConectionEnabled: "Habilitado",
          viewConectionDesabled: "Desabilitado",

          viewSector: "Ver setores",
          viewSectorEnabled: "Habilitado",
          viewSectorDesabled: "Desabilitado",

          viewName: "Ver nome",
          viewNameEnabled: "Habilitado",
          viewNameDesabled: "Desabilitado",

          viewTags: "Ver tags",
          viewTagsEnabled: "Habilitado",
          viewTagsDesabled: "Desabilitado",

          allTicket: "Ver chamados sem setor",
          allTicketEnabled: "Habilitado",
          allTicketDesabled: "Desabilitado",
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "Atendente salvo com sucesso.",
      },
      chat: {
        noTicketMessage: "Selecione um chamado para começar a conversar.",
      },
      uploads: {
        titles: {
          titleUploadMsgDragDrop: "⬇️ ARRASTE E SOLTE ARQUIVOS NO CAMPO ABAIXO ⬇️",
          titleFileList: "Lista de arquivo(s)"
        },
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
          deleted: "O chamado que você estava foi deletado.",
        },
        notification: {
          message: "Mensagem de",
        },
        tabs: {
          open: { title: "Atendendo" },
          closed: { title: "Resolvidos" },
          search: { title: "Busca" },
          group: { title: "Grupos" },
        },
        search: {
          placeholder: "Buscar chamados e mensagens",
        },
        buttons: {
          showAll: "Todos",
        },
      },
      transferTicketModal: {
        title: "Transferir chamado",
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
        pendingHeader: "Pendente",
        assignedHeader: "Atendendo",
        noTicketsTitle: "Nada aqui!",
        noTicketsMessage: "Nenhum chamado encontrado com esse status ou termo pesquisado",
        connectionTitle: "Conexão que está sendo utilizada atualmente.",
        items: {
          queueless: "Sem Setor",
          accept: "Aceitar",
          spy: "Espiar",
          close: "Encerrar",
          reopen: "Reabrir",
          return: "Mover para pendente"
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
      newTicketModal: {
        title: "Criar chamado",
        fieldLabel: "Digite para pesquisar o contato",
        add: "Adicionar",
        buttons: {
          ok: "Salvar",
          cancel: "Cancelar",
        },
      },
      mainDrawer: {
        listItems: {
          dashboard: "Dashboard",
          connections: "Conexões",
          tickets: "Chamados",
          contacts: "Contatos",
          quickAnswers: "Respostas Rápidas",
          tags: "Tags",
          queues: "Setores",
          administration: "Administração",
          users: "Atendentes",
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
            text: "seja bem vindo ao sistema"
          },
          user: {
            profile: "Perfil",
            logout: "Sair",
          },
        },
      },
      api: {
        title: "Documentação para envio de mensagens",
        shippingMethods: {
          title: "Métodos de Envio",
          text: "Mensagem de texto",
          file: "Mensagem de mídia",
        },
        instructions: {
          title: "Instruções",
          observations: "Observações Importantes",
          token: "Para pegar o token da API, vá em configurações que seu token estará la, sem ele não será possivel enviar mensagens.",
          helpNumber: {
            title: "O número para envio não deve ter mascara ou caracteres especiais e deve ser composto por:",
            DDI: "DDI Código do pais - Ex: 55 (Brasil)",
            DDD: "DDD",
            number: "Número",
            queueId: "ID do Setor",
            tagsId: "ID da Tag",
            userId: "ID do atendente",
            whatsappId: "ID do WhatsApp",
            body: "Aqui vai seu texto",
            medias : "Aqui vai sua midia",
            fullNumber: "5599999999999"
          },
          exempleText:"Segue abaixo lista de informações necessárias para envio das mensagens de texto:",
          exempleFile:"Segue abaixo lista de informações necessárias para envio de midias:"
        },

      },
      notifications: {
        noTickets: "Nenhuma notificação.",
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
          deleteMessage: "Você tem certeza? Essa ação não pode ser revertida! Os chamados desse setor continuarão existindo, mas não terão mais nenhuma setor atribuído.",
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
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage: "Todos os dados do atendente serão perdidos. Os chamados abertos deste atendente serão movidos para a espera.",
        },
      },
      settings: {
        success: "Configurações salvas com sucesso.",
        title: "Configurações",
        settings: {
          userCreation: {
            name: "Criação de atendente",
            note: "Permitir a criação de atendente",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          CheckMsgIsGroup: {
            name: "Ignorar Mensagens de Grupos",
            note: "Se desabilitar, irá receber mensage dos grupos.",
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
          closeTicketApi: {
            name: "Encerrar chamado enviado API",
            note: "Fecha automaticamente o chamado quando enviado por API",
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
            name: "Ordenação dos chamados (Crescente ou Decrescente)",
            note: "Ao ativar irá ordenar de forma crescente, desativando ordenará de forma decrescente",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          created: {
            name: "Ordenação dos chamados (Criação ou Atualização)",
            note: "Ao ativar irá ordenar pela data de criação, desativando ordenará pela data de atualização",

            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
          timeCreateNewTicket: {
            name: "Cria novo chamado após",
            note: "Selecione o tempo que será necessário para abrir um novo chamado, caso o cliente entre em contatos novamente",
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


          timeDirectNewTicket: {
            name: "Direcionar chamado sem setor após",
            note: "Selecione o tempo que será necessário para abrir um novo chamado, caso o cliente entre em contatos novamente",
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
      },
      messagesList: {
        header: {
          assignedTo: "Responsável:",
          buttons: {
            return: "Mover para pendente",
            resolve: "Encerrar",
            reopen: "Reabrir",
            accept: "Aceitar",
            finish: "Finalizar",
          },
        },
      },
      messagesInput: {
        placeholderOpen: "Digite uma mensagem",
        placeholderClosed: "Reabra ou aceite esse chamado para enviar uma mensagem.",
        signMessage: "Assinar",
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
      ticketOptionsMenu: {
        delete: "Deletar",
        transfer: "Transferir",
        confirmationModal: {
          title: "Deletar o chamado ",
          titleFrom: "do contato ",
          message: "Atenção! Todas as mensagens relacionadas ao chamado serão perdidas.",
        },
        buttons: {
          delete: "Excluir",
          cancel: "Cancelar",
        },
      },
      confirmationModal: {
        buttons: {
          confirm: "Ok",
          cancel: "Cancelar",
        },
      },
      messageOptionsMenu: {
        delete: "Deletar",
        reply: "Responder",
        confirmationModal: {
          title: "Apagar mensagem?",
          message: "Esta ação não pode ser revertida.",
        },
      },
      backendErrors: {
        ERR_NO_OTHER_WHATSAPP: "Deve haver pelo menos um WhatsApp padrão.",
        ERR_NO_DEF_WAPP_FOUND: "Nenhum WhatsApp padrão encontrado. Verifique a página de conexões.",
        ERR_WAPP_NOT_INITIALIZED: "Esta sessão do WhatsApp não foi inicializada. Verifique a página de conexões.",
        ERR_WAPP_CHECK_CONTACT: "Não foi possível verificar o contato do WhatsApp. Verifique a página de conexões",
        ERR_WAPP_INVALID_CONTACT: "Este não é um número de Whatsapp válido.",
        ERR_WAPP_DOWNLOAD_MEDIA: "Não foi possível baixar mídia do WhatsApp. Verifique a página de conexões.",
        ERR_INVALID_CREDENTIALS: "Erro de autenticação. Por favor, tente novamente.",
        ERR_SENDING_WAPP_MSG: "Erro ao enviar mensagem do WhatsApp. Verifique a página de conexões.",
        ERR_DELETE_WAPP_MSG: "Não foi possível excluir a mensagem do WhatsApp.",
        ERR_OTHER_OPEN_TICKET: "Já existe um chamado aberto para este contato.",
        ERR_SESSION_EXPIRED: "Sessão expirada. Por favor entre.",
        ERR_USER_CREATION_DISABLED: "A criação do atendente foi desabilitada pelo administrador.",
        ERR_NO_PERMISSION: "Você não tem permissão para acessar este recurso.",
        ERR_DUPLICATED_CONTACT: "Já existe um contato com este número.",
        ERR_NO_SETTING_FOUND: "Nenhuma configuração encontrada com este ID.",
        ERR_NO_CONTACT_FOUND: "Nenhum contato encontrado com este ID.",
        ERR_NO_TICKET_FOUND: "Nenhum chamado encontrado com este ID.",
        ERR_NO_USER_FOUND: "Nenhum atendente encontrado com este ID.",
        ERR_NO_WAPP_FOUND: "Nenhum WhatsApp encontrado com este ID.",
        ERR_CREATING_MESSAGE: "Erro ao criar mensagem no banco de dados.",
        ERR_CREATING_TICKET: "Erro ao criar chamado no banco de dados.",
        ERR_FETCH_WAPP_MSG: "Erro ao buscar a mensagem no WhatsApp, talvez ela seja muito antiga.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS: "Esta cor já está em uso, escolha outra.",
        ERR_WAPP_GREETING_REQUIRED: "A mensagem de saudação é obrigatório quando há mais de um Setor.",
        ERR_USER_CREATION_COUNT: "Limite de atendentes atingido, para alterar entre em contato com o suporte.",
        ERR_CONNECTION_CREATION_COUNT: "Limite de conexões atingido, para alterar entre em contato com o suporte.",
        ERR_NO_TAG_FOUND: "Tag não encontrada.",
        ERR_OUT_OF_HOURS: "Fora do Horário de Expediente!",
      },
    },
  },
};

export { messages };
