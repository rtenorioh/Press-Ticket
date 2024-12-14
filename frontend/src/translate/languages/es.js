const messages = {
  es: {
    translations: {
      auth: {
        toasts: {
          success: "¡Inicio de sesión exitoso!",
        },
      },
      chat: {
        noTicketMessage: "Seleccione un ticket para comenzar a conversar.",
      },
      confirmationModal: {
        buttons: {
          confirm: "Aceptar",
          cancel: "Cancelar",
        },
      },
      connections: {
        title: "Conexiones",
        toasts: {
          deleted: "¡Conexión con WhatsApp eliminada con éxito!",
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage: "¿Estás seguro? Esta acción no se puede deshacer.",
          disconnectTitle: "Desconectar",
          disconnectMessage: "¿Estás seguro? Necesitarás escanear el código QR nuevamente.",
        },
        buttons: {
          add: "Agregar WhatsApp",
          shutdown: "Eliminar",
          restart: "Reiniciar",
          disconnect: "Desconectar",
          tryAgain: "Intentar nuevamente",
          qrcode: "CÓDIGO QR",
          newQr: "Nuevo CÓDIGO QR",
          connecting: "Conectando",
        },
        toolTips: {
          disconnected: {
            title: "Error al iniciar sesión en WhatsApp",
            content: "Asegúrate de que tu teléfono esté conectado a internet y vuelve a intentarlo, o solicita un nuevo código QR.",
          },
          qrcode: {
            title: "Esperando escaneo del código QR",
            content: "Haz clic en el botón 'CÓDIGO QR' y escanea el código QR con tu teléfono para iniciar la sesión.",
          },
          connected: {
            title: "¡Conexión establecida!",
          },
          timeout: {
            title: "Se perdió la conexión con el teléfono",
            content: "Asegúrate de que tu teléfono esté conectado a internet y que WhatsApp esté abierto, o haz clic en el botón 'Desconectar' para obtener un nuevo código QR.",
          },
        },
        table: {
          id: "ID",
          channel: "Canal",
          name: "Nombre",
          color: "Color",
          number: "Número",
          status: "Estado",
          lastUpdate: "Última actualización",
          default: "Predeterminado",
          actions: "Acciones",
          session: "Sesión",
        },
      },
      contactModal: {
        title: {
          add: "Agregar contacto",
          edit: "Editar contacto",
        },
        form: {
          mainInfo: "Datos del contacto",
          extraInfo: "Información adicional",
          name: "Nombre",
          number: "Número de WhatsApp",
          email: "Correo electrónico",
          extraName: "Nombre del campo",
          extraValue: "Valor",
        },
        buttons: {
          addExtraInfo: "Agregar información",
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Contacto guardado con éxito.",
      },
      contacts: {
        title: "Contactos",
        toasts: {
          deleted: "¡Contacto eliminado con éxito!",
          deletedAll: "¡Todos los contactos fueron eliminados con éxito!",
        },
        searchPlaceholder: "Buscar...",
        confirmationModal: {
          deleteTitle: "Eliminar ",
          deleteAllTitle: "Eliminar Todos",
          importTitle: "Importar contactos",
          deleteMessage: "¿Está seguro de que desea eliminar este contacto? Todos los tickets relacionados se perderán.",
          deleteAllMessage: "¿Está seguro de que desea eliminar todos los contactos? Todos los tickets relacionados se perderán.",
          importMessage: "¿Desea importar todos los contactos del teléfono?",
        },
        buttons: {
          import: "Importar Contactos",
          add: "Agregar Contacto",
          export: "Exportar Contactos",
          delete: "Eliminar Todos los Contactos"
        },
        table: {
          name: "Nombre",
          whatsapp: "WhatsApp",
          channels: "Canales",
          actions: "Acciones",
        },
      },
      contactDrawer: {
        header: "Datos del contacto",
        buttons: {
          edit: "Editar contacto",
        },
        extraInfo: "Otra información",
      },
      copyToClipboard: {
        copy: "Copiar",
        copied: "Copiado",
      },
      dashboard: {
        messages: {
          inAttendance: {
            title: "En Atención"
          },
          waiting: {
            title: "En Espera"
          },
          closed: {
            title: "Resuelto"
          }
        },
        charts: {
          perDay: {
            title: "Tickets por día: ",
          },
          date: {
            title: "Filtrar"
          }
        },
        chartPerUser: {
          title: "Tickets por usuario",
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
            title: "Tickets por conexión"
          }
        },
        chartPerQueue: {
          date: {
            title: "Filtrar"
          },
          perQueue: {
            title: "Tickets por Sector"
          }
        },
        newContacts: {
          contact: "Contactos",
          date: {
            start: "Fecha inicial",
            end: "Fecha final"
          },
          title: "Contactos nuevos por día"
        },
        contactsWithTickets: {
          message: "No se encontraron contactos para esta fecha.",
          unique: "Contacto único",
          date: {
            start: "Fecha inicial",
            end: "Fecha final"
          },
          title: "Contactos que abrieron tickets en el período"
        },
        tags: {
          cloudTitle: "Etiquetas: ",
          noTags: "Sin etiquetas en este momento."
        }
      },
      integrations: {
        success: "Integración guardada con éxito.",
        title: "Integraciones",
        integrations: {
          openai: {
            title: "OpenAI",
            organization: "ID de Organización",
            apikey: "Clave"
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
            title: "API Google Maps",
            apiMaps: "Clave API"
          }
        },
      },
      login: {
        title: "Inicia sesión ahora",
        form: {
          email: "Introduce tu correo electrónico",
          password: "Introduce tu contraseña",
        },
        buttons: {
          submit: "Iniciar sesión",
          register: "¿No tienes una cuenta? ¡Regístrate!",
        },
      },
      mainDrawer: {
        listItems: {
          general: "General",
          dashboard: "Panel de control",
          connections: "Conexiones",
          tickets: "Tickets",
          contacts: "Contactos",
          quickAnswers: "Respuestas Rápidas",
          tags: "Etiquetas",
          queues: "Sectores",
          administration: "Administración",
          users: "Usuarios",
          company: "Empresa",
          integrations: "Integraciones",
          settings: "Configuraciones",
          sendMsg: "Envío de Mensajes",
          sendMedia: "Envío de Medios",
          api: "Uso de la API",
          apidocs: "Documentación",
          apititle: "API",
          apikey: "Clave API",
          token: "Token"
        },
        appBar: {
          message: {
            hi: "Hola",
            text: "Bienvenido al sistema"
          },
          user: {
            profile: "Perfil",
            logout: "Salir",
          },
        },
      },
      messageOptionsMenu: {
        edit: "Editar",
        history: "Historial",
        delete: "Eliminar",
        reply: "Responder",
        confirmationModal: {
          title: "¿Eliminar mensaje?",
          message: "Esta acción no se puede deshacer.",
        },
      },
      messageHistoryModal: {
        close: "Cerrar",
        title: "Historial de edición del mensaje"
      },
      messageVariablesPicker: {
        label: "Variables disponibles",
        vars: {
          contactName: "Nombre",
          user: "Usuario",
          greeting: "Saludo",
          protocolNumber: "Protocolo",
          date: "Fecha",
          hour: "Hora",
          ticket_id: "ID del Ticket",
          queue: "Sector",
          connection: "Conexión"
        }
      },
      newTicketModal: {
        title: "Crear Ticket",
        fieldLabel: "Escribe para buscar el contacto",
        add: "Agregar",
        buttons: {
          ok: "Guardar",
          cancel: "Cancelar",
        },
      },
      newTicketModalContactPage: {
        title: "Crear Ticket",
        queue: "Seleccione un Sector",
        fieldLabel: "Escribe para buscar el contacto",
        add: "Agregar",
        buttons: {
          ok: "Guardar",
          cancel: "Cancelar",
        },
      },
      notifications: {
        allow: "¿Permitir las notificaciones en el navegador?",
        noTickets: "No hay notificaciones.",
        permissionGranted: "Permiso concedido.",
        permissionDenied: "Permiso denegado.",
      },
      qrCode: {
        message: "Escanee el QR Code para iniciar la sesión",
      },
      queueModal: {
        title: {
          add: "Agregar Sector",
          edit: "Editar Sector",
        },
        notification: {
          title: "¡Sector guardado con éxito!",
        },
        form: {
          name: "Nombre",
          color: "Color",
          greetingMessage: "Mensaje de saludo",
          startWork: "Apertura",
          endWork: "Cierre",
          absenceMessage: "Mensaje de ausencia",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
      },
      queues: {
        title: "Sectores",
        notifications: {
          queueDeleted: "El sector fue eliminado.",
        },
        table: {
          id: "ID",
          name: "Nombre",
          color: "Color",
          greeting: "Mensaje de saludo",
          actions: "Acciones",
          startWork: "Apertura",
          endWork: "Cierre",
        },
        buttons: {
          add: "Agregar sector",
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage: "¿Estás seguro? ¡Esta acción no se puede deshacer! Los tickets de este sector seguirán existiendo, pero no tendrán más ningún sector asignado.",
        },
      },
      queueSelect: {
        inputLabel: "Sectores",
      },
      quickAnswers: {
        title: "Respuestas Rápidas",
        table: {
          shortcut: "Atajo",
          message: "Respuesta Rápida",
          actions: "Acciones",
        },
        buttons: {
          add: "Agregar Respuesta Rápida",
          deleteAll: "Eliminar Todas las Respuestas Rápidas",
        },
        toasts: {
          deleted: "Respuesta Rápida eliminada con éxito.",
          deletedAll: "Todas las Respuestas Rápidas han sido eliminadas.",
        },
        searchPlaceholder: "Buscar...",
        confirmationModal: {
          deleteTitle: "¿Estás seguro de que deseas eliminar esta Respuesta Rápida: ",
          deleteAllTitle: "¿Estás seguro de que deseas eliminar todas las Respuestas Rápidas?",
          deleteMessage: "Esta acción no se puede deshacer.",
          deleteAllMessage: "Esta acción no se puede deshacer.",
        },
      },
      quickAnswersModal: {
        title: {
          add: "Agregar Respuesta Rápida",
          edit: "Editar Respuesta Rápida",
        },
        form: {
          shortcut: "Atajo",
          message: "Respuesta Rápida",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Respuesta Rápida guardada con éxito.",
      },
      settings: {
        success: "Configuraciones guardadas con éxito.",
        tabs: {
          general: "Generales",
          personalize: "Personalizar",
          integrations: "Integraciones"
        },
        general: {
          userCreation: {
            name: "Creación de agentes",
            note: "Permitir la creación de agentes",
            options: {
              enabled: "Activado",
              disabled: "Desactivado",
            },
          },
          allTicket: {
            name: "Todos pueden ver los tickets sin departamento",
            note: "Active esta función para permitir que todos los usuarios vean los tickets sin sector",
            options: {
              enabled: "Activado",
              disabled: "Desactivado",
            },
          },
          CheckMsgIsGroup: {
            name: "Ignorar Mensajes de Grupos",
            note: "Si está deshabilitado, recibirá mensajes de los grupos.",
            options: {
              enabled: "Activado",
              disabled: "Desactivado",
            },
          },
          call: {
            name: "Aceptar llamadas",
            note: "Si está deshabilitado, el cliente recibirá un mensaje indicando que no acepta llamadas de voz/vídeo",
            options: {
              enabled: "Activado",
              disabled: "Desactivado",
            },
          },
          sideMenu: {
            name: "Menú Lateral Inicial",
            note: "Si está habilitado, el menú lateral se iniciará cerrado",
            options: {
              enabled: "Abierto",
              disabled: "Cerrado",
            },
          },
          quickAnswer: {
            name: "Respuestas Rápidas",
            note: "Si está habilitado, podrá editar las respuestas rápidas",
            options: {
              enabled: "Activado",
              disabled: "Desactivado",
            },
          },
          closeTicketApi: {
            name: "Cerrar Ticket enviado por API",
            note: "Cierra automáticamente el ticket cuando es enviado por API",
            options: {
              enabled: "Activado",
              disabled: "Desactivado",
            },
          },
          darkMode: {
            name: "Activar Modo Oscuro",
            note: "Alternar entre el modo claro y el modo oscuro",
            options: {
              enabled: "Activado",
              disabled: "Desactivado",
            },
          },
          ASC: {
            name: "Ordenación de Tickets (ASC o DESC)",
            note: "Al activarlo, ordenará de forma ascendente (ASC); al desactivarlo, ordenará de forma descendente (DESC)",
            options: {
              enabled: "Activado",
              disabled: "Desactivado",
            },
          },
          created: {
            name: "Ordenación de Tickets (createdAt o updateAt)",
            note: "Al activarlo, ordenará por fecha de creación (createdAt); al desactivarlo, ordenará por fecha de actualización (updateAt)",
            options: {
              enabled: "Activado",
              disabled: "Desactivado",
            },
          },
          timeCreateNewTicket: {
            name: "Nuevo Ticket en:",
            note: "Seleccione el tiempo necesario para abrir un nuevo ticket si el cliente vuelve a contactar",
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
              "604800": "7 días",
              "1296000": "15 días",
              "2592000": "30 días",
            },
          },
        },
        personalize: {
          success: {
            company: "¡Datos de la empresa guardados con éxito!",
            logos: "¡Logos guardados con éxito!",
            colors: "¡Colores guardados con éxito!",
          },
          error: {
            invalid: "Error al buscar personalizaciones.",
            company: "Error al guardar los datos de la empresa.",
            logos: "Error al guardar el logo.",
            logs: "Error al guardar la personalización:",
            colors: "Error al guardar los colores del tema:"
          },
          tabs: {
            data: "Datos",
            logos: "Logos",
            colors: "Colores",
          },
          tabpanel: {
            company: "Empresa",
            url: "URL",
            light: "Tema Claro",
            dark: "Tema Oscuro",
            input: {
              primary: "Color Primario",
              secondary: "Color Secundario",
              default: "Fondo Predeterminado",
              paper: "Fondo Papel",
            },
            button: {
              save: "Guardar",
              saveLight: "Guardar tema claro",
              saveDark: "Guardar tema oscuro",
            }
          },
        }
      },
      signup: {
        title: "Regístrate",
        toasts: {
          success: "¡Atendente creado con éxito! Inicia sesión.",
          fail: "Error al crear el atendente. Verifica los datos proporcionados.",
        },
        form: {
          name: "Nombre",
          email: "Correo electrónico",
          password: "Contraseña",
        },
        buttons: {
          submit: "Registrar",
          login: "¿Ya tienes una cuenta? ¡Inicia sesión!",
        },
      },
      tags: {
        title: "Etiquetas",
        table: {
          name: "Etiquetas",
          color: "Color",
          contacts: "Contactos",
          actions: "Acción"
        },
        toasts: {
          deleted: "Etiqueta eliminada con éxito.",
          deletedAll: "Todas las etiquetas fueron eliminadas con éxito.",
        },
        buttons: {
          add: "Agregar",
          deleteAll: "Eliminar Todas",
        },
        confirmationModal: {
          deleteTitle: "Eliminar ",
          deleteAllTitle: "Eliminar Todas",
          deleteMessage: "¿Estás seguro de que deseas eliminar esta etiqueta?",
          deleteAllMessage: "¿Estás seguro de que deseas eliminar todas las etiquetas?",
        },
      },
      tagModal: {
        title: {
          add: "Agregar Etiqueta",
          edit: "Editar Etiqueta",
        },
        buttons: {
          okAdd: "Guardar",
          okEdit: "Editar",
          cancel: "Cancelar",
        },
        form: {
          name: "Nombre de la Etiqueta",
          color: "Color de la Etiqueta"
        },
        success: "Etiqueta guardada con éxito.",
      },
      ticketsManager: {
        buttons: {
          newTicket: "Nuevo",
        },
      },
      ticketsQueueSelect: {
        placeholder: "Sectores",
      },
      tickets: {
        toasts: {
          deleted: "El ticket que estabas manejando fue eliminado.",
        },
        notification: {
          message: "Mensaje de",
        },
        tabs: {
          open: { title: "Bandeja de entrada" },
          closed: { title: "Resueltos" },
          search: { title: "Buscar" },
        },
        search: {
          placeholder: "Buscar tickets y mensajes",
        },
        buttons: {
          showAll: "Todos",
        },
      },
      transferTicketModal: {
        title: "Transferir Ticket",
        fieldLabel: "Escribe para buscar un atendente",
        fieldConnectionLabel: "Transferir a la conexión",
        fieldQueueLabel: "Transferir al Sector",
        fieldConnectionPlaceholder: "Selecciona una conexión",
        noOptions: "No se encontró ningún atendente con ese nombre",
        buttons: {
          ok: "Transferir",
          cancel: "Cancelar",
        },
      },
      ticketsList: {
        pendingHeader: "En espera",
        assignedHeader: "En atención",
        noTicketsTitle: "¡Nada aquí!",
        noTicketsMessage: "No se encontró ningún ticket con este estado o término buscado",
        connectionTitle: "Conexión que se está utilizando actualmente.",
        items: {
          queueless: "Sin Sector",
          accept: "Aceptar",
          spy: "Espiar",
          close: "Cerrar",
          reopen: "Reabrir",
          return: "Mover a en espera",
          connection: "Conexión",
          user: "Atendente",
          queue: "Sector",
          tags: "Etiquetas"
        },
        buttons: {
          accept: "Responder",
          acceptBeforeBot: "Aceptar",
          start: "Iniciar",
          cancel: "Cancelar"
        },
        acceptModal: {
          title: "Aceptar Chat",
          queue: "Seleccionar sector"
        },
      },
      ticketOptionsMenu: {
        delete: "Eliminar",
        transfer: "Transferir",
        confirmationModal: {
          title: "Eliminar el ticket ",
          titleFrom: "del contacto ",
          message: "¡Atención! Todos los mensajes relacionados con el ticket se perderán.",
        },
        buttons: {
          delete: "Eliminar",
          cancel: "Cancelar",
        },
      },
      uploads: {
        titles: {
          titleUploadMsgDragDrop: "⬇️ ARRASTRA Y SUELTA ARCHIVOS EN EL CAMPO A CONTINUACIÓN ⬇️",
          titleFileList: "Lista de archivo(s)"
        },
      },
      users: {
        title: "Atendentes",
        table: {
          id: "ID",
          name: "Nombre",
          email: "Correo electrónico",
          profile: "Perfil",
          whatsapp: "Conexión Predeterminada",
          startWork: "Horario inicial",
          endWork: "Horario final",
          actions: "Acciones",
        },
        buttons: {
          add: "Agregar atendente",
        },
        toasts: {
          deleted: "Atendente eliminado con éxito.",
          updated: "Atendente actualizado con éxito."
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage: "Todos los datos del atendente se perderán. Los tickets abiertos de este atendente se moverán a la espera.",
        },
      },
      userModal: {
        title: {
          add: "Agregar atendente",
          edit: "Editar atendente",
        },
        form: {
          name: "Nombre",
          email: "Correo electrónico",
          password: "Contraseña",
          profile: "Perfil",
          admin: "Administrador",
          whatsapp: "Conexión Predeterminada",
          user: "Atendente",
          startWork: "Inicio",
          endWork: "Fin",
          isTricked: "Ver Contactos",
          enabled: "Habilitado",
          disabled: "Deshabilitado"
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Atendente guardado con éxito.",
      },
      whatsappModal: {
        title: {
          add: "Agregar WhatsApp",
          edit: "Editar WhatsApp",
        },
        form: {
          name: "Nombre",
          default: "Predeterminado",
          display: "Mostrar horario de los sectores",
          farewellMessage: "Mensaje de despedida"
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "WhatsApp guardado con éxito.",
      },
      backendErrors: {
        ERR_CONNECTION_CREATION_COUNT: "Límite de conexiones alcanzado, contacta con soporte para modificarlo.",
        ERR_CREATING_MESSAGE: "Error al crear mensaje en la base de datos.",
        ERR_CREATING_TICKET: "Error al crear ticket en la base de datos.",
        ERR_DELETE_WAPP_MSG: "No se pudo eliminar el mensaje de WhatsApp.",
        ERR_DUPLICATED_CONTACT: "Ya existe un contacto con este número.",
        ERR_EDITING_WAPP_MSG: "No se pudo editar el mensaje de WhatsApp.",
        ERR_FETCH_WAPP_MSG: "Error al recuperar el mensaje de WhatsApp, puede que sea muy antiguo.",
        ERR_INVALID_CREDENTIALS: "Error de autenticación. Por favor, inténtalo de nuevo.",
        ERR_NO_CONTACT_FOUND: "No se encontró contacto con este ID.",
        ERR_NO_DEF_WAPP_FOUND: "No se encontró WhatsApp predeterminado. Revisa la página de conexiones.",
        ERR_NO_INTEGRATION_FOUND: "Integración no encontrada.",
        ERR_NO_OTHER_WHATSAPP: "Debe haber al menos un WhatsApp predeterminado.",
        ERR_NO_PERMISSION: "No tienes permiso para acceder a este recurso.",
        ERR_NO_SETTING_FOUND: "No se encontró configuración con este ID.",
        ERR_NO_TAG_FOUND: "Etiqueta no encontrada.",
        ERR_NO_TICKET_FOUND: "No se encontró ticket con este ID.",
        ERR_NO_USER_FOUND: "No se encontró usuario con este ID.",
        ERR_NO_WAPP_FOUND: "No se encontró WhatsApp con este ID.",
        ERR_OPEN_USER_TICKET: "Ya existe un ticket abierto para este contacto con ",
        ERR_OTHER_OPEN_TICKET: "Ya existe un ticket abierto para este contacto.",
        ERR_OUT_OF_HOURS: "¡Fuera del horario laboral!",
        ERR_QUEUE_COLOR_ALREADY_EXISTS: "Este color ya está en uso, elige otro.",
        ERR_SENDING_WAPP_MSG: "Error al enviar mensaje de WhatsApp. Revisa la página de conexiones.",
        ERR_SESSION_EXPIRED: "Sesión expirada. Por favor, inicia sesión.",
        ERR_USER_CREATION_COUNT: "Límite de usuarios alcanzado, contacta con soporte para modificarlo.",
        ERR_USER_CREATION_DISABLED: "La creación de usuarios ha sido deshabilitada por el administrador.",
        ERR_WAPP_CHECK_CONTACT: "No se pudo verificar el contacto de WhatsApp. Revisa la página de conexiones.",
        ERR_WAPP_DOWNLOAD_MEDIA: "No se pudo descargar medios de WhatsApp. Revisa la página de conexiones.",
        ERR_WAPP_GREETING_REQUIRED: "El mensaje de saludo es obligatorio cuando hay más de un sector.",
        ERR_WAPP_INVALID_CONTACT: "Este no es un número de WhatsApp válido.",
        ERR_WAPP_NOT_INITIALIZED: "Esta sesión de WhatsApp no se inició. Revisa la página de conexiones.",
      },
    },
  },
};

export { messages };

