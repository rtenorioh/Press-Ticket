const messages = {
  es: {
    translations: {
      auth: {
        toasts: {
          success: "¡Inicio de sesión exitoso!",
          session_expired: "Tu sesión ha expirado porque se inició en otro dispositivo." 
        },
      },
      chat: {
        noTicketMessage: "Seleccione un ticket para comenzar a conversar.",
      },
      confirmationModal: {
        buttons: {
          confirm: "Ok",
          cancel: "Cancelar",
        },
      },
      connections: {
        title: "Canales",
        toasts: {
          deleted: "¡Canal eliminado con éxito!",
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage: "¿Está seguro? Esta acción no se puede deshacer.",
          disconnectTitle: "Desconectar",
          disconnectMessage: "¿Está seguro? Necesitará escanear el código QR nuevamente.",
        },
        buttons: {
          add: "Agregar",
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
            content: "Asegúrese de que su teléfono esté conectado a Internet e intente nuevamente, o solicite un nuevo código QR",
          },
          qrcode: {
            title: "Esperando la lectura del código QR",
            content: "Haga clic en el botón 'CÓDIGO QR' y escanee el código QR con su teléfono para iniciar la sesión",
          },
          connected: {
            title: "¡Conexión establecida!",
          },
          timeout: {
            title: "Se perdió la conexión con el teléfono",
            content: "Asegúrese de que su teléfono esté conectado a Internet y que WhatsApp esté abierto, o haga clic en el botón 'Desconectar' para obtener un nuevo código QR",
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
          address: "Dirección",
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
          deletedAll: "¡Todos los contactos eliminados con éxito!",
        },
        errors: {
          "ticketAlreadyOpen": "Ya existe un ticket abierto para este contacto, asignado a {{atendente}}."
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
          address: "Dirección",
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
          copied: "Copiado"
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
              title: "Finalizado"
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
              title: "Tickets por Canales"
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
              start: "Fecha de inicio",
              end: "Fecha de finalización"
            },
            title: "Contactos nuevos por día"
          },
          contactsWithTickets: {
            message: "No se encontraron contactos para esta fecha.",
            unique: "Contacto único",
            date: {
              start: "Fecha de inicio",
              end: "Fecha de finalización"
            },
            title: "Contactos que abrieron tickets en el período"
          },
          tags: {
            cloudTitle: "Etiquetas: ",
            noTags: "¡Sin etiquetas por el momento!"
          }
        },
        forgotPassword: {
          title: "¿Olvidaste tu contraseña?",
          form: {
            email: "Ingresa tu correo electrónico"
          },
          buttons: {
            submit: "Enviar enlace de restablecimiento",
            backToLogin: "Volver al inicio de sesión"
          },
          success: "Si se encontró un correo electrónico válido, se envió un enlace para restablecer la contraseña!",
          error: {
            invalidEmail: "Por favor, ingresa un correo electrónico válido.",
            generic: "Error al solicitar el restablecimiento de contraseña. Inténtalo de nuevo más tarde."
          }
        },
        integrations: {
          success: "Integración guardada con éxito.",
          title: "Integraciones",
          integrations: {
            openai: {
              title: "OpenAI",
              organization: "ID de Organización",
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
          title: "Inicia sesión ahora",
          form: {
            email: "Ingresa el correo electrónico",
            password: "Ingresa tu contraseña",
          },
          buttons: {
            forgotPassword: "¿Olvidaste tu contraseña?",
            submit: "Iniciar sesión",
            register: "¿No tienes cuenta? ¡Regístrate!",
          },
        },
        mainDrawer: {
          listItems: {
            general: "General",
            dashboard: "Dashboard",
            connections: "Canales",
            tickets: "Tickets",
            contacts: "Contactos",
            quickAnswers: "Respuestas Rápidas",
            tags: "Etiquetas",
            queues: "Sectores",
            administration: "Administración",
            users: "Agentes",
            settings: "Configuraciones",
            api: "Uso de la API",
            apidocs: "Documentación",
            apititle: "API",
            apikey: "Clave API",
            token: "Token"
          },
          appBar: {
            message: {
              hi: "Hola",
              text: "Bienvenido al sistema."
            },
            user: {
              profile: "Perfil",
              logout: "Cerrar sesión",
            },
          },
        },
        messageOptionsMenu: {
          edit: "Editar",
          history: "Historial",
          delete: "Eliminar",
          reply: "Responder",
          confirmationModal: {
            title: "¿Borrar mensaje?",
            message: "Esta acción no se puede deshacer.",
          },
        },
        messageHistoryModal: {
          close: "Cerrar",
          title: "Historial de edición del mensaje"
        },
        messagesList: {
          header: {
            assignedTo: "Responsable:",
            buttons: {
              return: "Regresar",
              resolve: "Finalizar",
              reopen: "Reabrir",
              accept: "Aceptar"
            },
          },
          message: {
            download: "Descargar",
            ticketNumber: "#ticket:",
            voiceVideoLost: "Mensaje de voz o video perdido a las",
            deleted: "Mensaje eliminado",
            edited: "Editado",
          }
        },
        messagesInput: {
          placeholderOpen: "Escribe un mensaje",
          placeholderClosed: "Reabre o acepta este ticket para enviar un mensaje.",
          signMessage: "Firmar",
        },
        messageVariablesPicker: {
          label: "Variables disponibles",
          vars: {
            contactName: "Nombre",
            user: "Agente",
            greeting: "Saludo",
            protocolNumber: "Protocolo",
            date: "Fecha",
            hour: "Hora",
            ticket_id: "ID del Ticket",
            queue: "Sector",
            connection: "Canal"
          }
        },
        newTicketModal: {
          title: "Crear Ticket",
          fieldLabel: "Escribe para buscar el contacto",
          add: "Agregar",
          select: {
            none: "Seleccionar",
            queue: "Seleccionar Sector",
            channel: "Seleccionar Canal"
          },
          buttons: {
            ok: "Guardar",
            cancel: "Cancelar",
          },
        },
        newTicketModalContactPage: {
          title: "Crear Ticket",
          queue: "Seleccionar un Sector",
          fieldLabel: "Escribe para buscar el contacto",
          add: "Agregar",
          buttons: {
            ok: "Guardar",
            cancel: "Cancelar",
          },
        },
        notifications: {
          allow: "¿Permitir notificaciones en el navegador?",
          noTickets: "Sin notificaciones.",
          permissionGranted: "Permiso concedido.",
          permissionDenied: "Permiso denegado.",
        },
        qrCode: {
          message: "Escanea el código QR para iniciar sesión",
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
            deleteMessage: "¿Estás seguro? ¡Esta acción no se puede deshacer! Los tickets de este sector seguirán existiendo, pero no tendrán ningún sector asignado.",
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
            deletedAll: "Todas las Respuestas Rápidas eliminadas.",
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
        resetPassword: {
          title: "Restablecer Contraseña",
          form: {
            password: "Nueva Contraseña",
            confirmPassword: "Confirmar Nueva Contraseña"
          },
          buttons: {
            submit: "Restablecer Contraseña",
            backToLogin: "Volver al Inicio de Sesión"
          },
          success: "¡Contraseña restablecida con éxito!",
          error: {
            passwordMismatch: "Las contraseñas no coinciden.",
            generic: "Error al restablecer la contraseña. Inténtalo de nuevo."
          }
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
              name: "Creación de agente",
              note: "Permitir la creación de agente",
              options: {
                enabled: "Activado",
                disabled: "Desactivado",
              },
            },
            allTicket: {
              name: "Todos pueden ver el ticket sin sector",
              note: "Activa esta función para que todos los usuarios puedan ver los tickets sin sector",
              options: {
                enabled: "Activado",
                disabled: "Desactivado",
              },
            },
            CheckMsgIsGroup: {
              name: "Ignorar Mensajes de Grupos",
              note: "Si se desactiva, recibirás mensajes de los grupos.",
              options: {
                enabled: "Activado",
                disabled: "Desactivado",
              },
            },
            call: {
              name: "Aceptar llamadas",
              note: "Si se desactiva, el cliente recibirá un mensaje informando que no se aceptan llamadas de voz/vídeo",
              options: {
                enabled: "Activado",
                disabled: "Desactivado",
              },
            },
            sideMenu: {
              name: "Menú Lateral Inicial",
              note: "Si está habilitado, el menú lateral comenzará cerrado",
              options: {
                enabled: "Abierto",
                disabled: "Cerrado",
              },
            },
            quickAnswer: {
              name: "Respuestas Rápidas",
              note: "Si está habilitado, podrás editar las respuestas rápidas",
              options: {
                enabled: "Activado",
                disabled: "Desactivado",
              },
            },
            closeTicketApi: {
              name: "Cerrar Ticket enviado por API",
              note: "Cierra automáticamente el ticket cuando se envía por API",
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
              name: "Ordenación de los Tickets (ASC o DESC)",
              note: "Al activar, ordenará ascendente (ASC); al desactivar, ordenará descendente (DESC)",
              options: {
                enabled: "Activado",
                disabled: "Desactivado",
              },
            },
            created: {
              name: "Ordenación de los Tickets (createdAt o updateAt)",
              note: "Al activar, ordenará por la fecha de creación (createdAt); al desactivar, ordenará por la fecha de actualización (updateAt)",
              options: {
                enabled: "Activado",
                disabled: "Desactivado",
              },
            },
            openTickets: {
              name: "Impedir múltiples tickets para el mismo contacto",
              note: "Al activar, se impedirá abrir tickets para contactos que ya tengan un ticket abierto",
              options: {
                enabled: "Activado",
                disabled: "Desactivado",
              },
            },
            timeCreateNewTicket: {
              name: "Nuevo Ticket en:",
              note: "Selecciona el tiempo necesario para abrir un nuevo ticket si el cliente se pone en contacto nuevamente",
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
              company: "Error al guardar datos de la empresa.",
              logos: "Error al guardar el logo.",
              logs: "Error al guardar la personalización:",
              colors: "Error al guardar colores del tema: "
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
                paper: "Fondo de Papel",
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
            success: "Agente creado con éxito! Inicia sesión ahora!",
            fail: "Error al crear el agente. Verifique los datos ingresados.",
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
            deleted: "Etiqueta eliminada con éxito!",
            deletedAll: "Todas las etiquetas eliminadas con éxito!",
          },
          buttons: {
            add: "Agregar",
            deleteAll: "Eliminar todas",
          },
          confirmationModal: {
            deleteTitle: "Eliminar ",
            deleteAllTitle: "Eliminar todas",
            deleteMessage: "¿Estás seguro de que deseas eliminar esta etiqueta?",
            deleteAllMessage: "¿Estás seguro de que deseas eliminar todas las etiquetas?",
          },
        },
        tagModal: {
          title: {
            add: "Agregar etiqueta",
            edit: "Editar etiqueta",
          },
          buttons: {
            okAdd: "Guardar",
            okEdit: "Editar",
            cancel: "Cancelar",
          },
          form: {
            name: "Nombre de la etiqueta",
            color: "Color de la etiqueta"
          },
          success: "Etiqueta guardada con éxito!",
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
            deleted: "El ticket en el que estabas fue eliminado.",
          },
          notification: {
            message: "Mensaje de",
          },
          tabs: {
            open: { title: "Bandeja de entrada" },
            closed: { title: "Finalizados" },
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
          title: "Transferir ticket",
          fieldLabel: "Escribe para buscar un agente",
          fieldConnectionLabel: "Seleccionar canal",
          fieldQueueLabel: "Transferir al sector",
          fieldConnectionPlaceholder: "Selecciona un canal",
          noOptions: "No se encontró ningún agente con ese nombre",
          buttons: {
            ok: "Transferir",
            cancel: "Cancelar",
          },
        },
        ticketsList: {
          pendingHeader: "En espera",
          assignedHeader: "Atendiendo",
          noTicketsTitle: "¡Nada aquí!",
          noTicketsMessage: "No se encontraron tickets con este estado o término buscado",
          connectionTitle: "Canal que está siendo utilizado actualmente.",
          items: {
            queueless: "Sin sector",
            accept: "Aceptar",
            spy: "Espiar",
            close: "Cerrar",
            reopen: "Reabrir",
            return: "Mover a en espera",
            connection: "Canal",
            user: "Agente",
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
            title: "Aceptar chat",
            queue: "Seleccionar sector"
          },
          errors: {
            ticketAlreadyOpen: "Ya existe un ticket abierto para este contacto con el agente {{atendente}}."
          }
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
            titleUploadMsgDragDrop: "⬇️ ARRASTRA Y SUELTA ARCHIVOS AQUÍ ⬇️",
            titleFileList: "Lista de archivo(s)"
          },
        },
        users: {
          title: "Agentes",
          table: {
            id: "ID",
            name: "Nombre",
            email: "Correo electrónico",
            profile: "Perfil",
            whatsapp: "Canal",
            queue: "Sector",
            startWork: "Hora de inicio",
            endWork: "Hora de fin",
            actions: "Acciones",
          },
          buttons: {
            add: "Agregar agente",
          },
          modalTitle: {
            channel: "Canales",
            queue: "Sectores"
          },
          modalTable: {
            id: "ID",
            name: "Nombre"
          },
          toasts: {
            deleted: "Agente eliminado con éxito.",
            updated: "Agente actualizado con éxito."
          },
          confirmationModal: {
            deleteTitle: "Eliminar",
            deleteMessage: "Todos los datos de este agente se perderán. Los tickets abiertos por este agente se moverán a pendientes.",
          },
        },
        userModal: {
          title: {
            add: "Agregar agente",
            edit: "Editar agente",
          },
          form: {
            name: "Nombre",
            email: "Correo electrónico",
            password: "Contraseña",
            profile: "Perfil",
            admin: "Administrador",
            user: "Agente",
            startWork: "Inicio",
            endWork: "Fin",
            isTricked: "Ver contactos",
            enabled: "Habilitado",
            disabled: "Deshabilitado"
          },
          buttons: {
            okAdd: "Agregar",
            okEdit: "Guardar",
            cancel: "Cancelar",
          },
          success: "Agente guardado con éxito.",
        },
        whatsappModal: {
          title: {
            add: "Agregar WhatsApp",
            edit: "Editar WhatsApp",
          },
          form: {
            name: "Nombre",
            default: "Predeterminado",
            display: "Mostrar horarios de sectores",
            farewellMessage: "Mensaje de despedida"
          },
          buttons: {
            okAdd: "Agregar",
            okEdit: "Guardar",
            cancel: "Cancelar",
          },
          success: "WhatsApp guardado con éxito.",
        },
        whatsappSelect: {
          inputLabel: "Canales",
        },
        backendErrors: {
          ERR_CREATING_MESSAGE: "Error al crear el mensaje en la base de datos.",
          ERR_CREATING_TICKET: "Error al crear el ticket en la base de datos.",
          ERR_CONNECTION_CREATION_COUNT: "Límite de canales alcanzado, para cambiar contacte con soporte.",
          ERR_DELETE_WAPP_MSG: "No se pudo eliminar el mensaje de WhatsApp.",
          ERR_DUPLICATED_CONTACT: "Ya existe un contacto con este número.",
          ERR_EDITING_WAPP_MSG: "No se pudo editar el mensaje de WhatsApp.",
          ERR_FETCH_WAPP_MSG: "Error al obtener el mensaje en WhatsApp, puede que sea muy antiguo.",
          ERR_INVALID_CREDENTIALS: "Error de autenticación. Por favor, inténtelo nuevamente.",
          ERR_NO_CONTACT_FOUND: "No se encontró ningún contacto con este ID.",
          ERR_NO_DEF_WAPP_FOUND: "No se encontró un WhatsApp predeterminado. Verifique la página de canales.",
          ERR_NO_INTEGRATION_FOUND: "Integración no encontrada.",
          ERR_NO_PERMISSION: "No tiene permiso para acceder a este recurso.",
          ERR_NO_SETTING_FOUND: "No se encontró ninguna configuración con este ID.",
          ERR_NO_TAG_FOUND: "Etiqueta no encontrada.",
          ERR_NO_TICKET_FOUND: "No se encontró ningún ticket con este ID.",
          ERR_NO_USER_FOUND: "No se encontró ningún agente con este ID.",
          ERR_NO_WAPP_FOUND: "No se encontró ningún WhatsApp con este ID.",
          ERR_NO_OTHER_WHATSAPP: "Debe haber al menos un WhatsApp predeterminado.",
          ERR_OUT_OF_HOURS: "Fuera del horario laboral!",
          ERR_OPEN_USER_TICKET: "Ya existe un ticket abierto para este contacto con ",
          ERR_OTHER_OPEN_TICKET: "Ya existe un ticket abierto para este contacto.",
          ERR_SESSION_EXPIRED: "Sesión expirada. Por favor inicie sesión nuevamente.",
          ERR_SENDING_WAPP_MSG: "Error al enviar el mensaje de WhatsApp. Verifique la página de canales.",
          ERR_USER_CREATION_COUNT: "Límite de agentes alcanzado, para cambiar contacte con soporte.",
          ERR_USER_CREATION_DISABLED: "La creación de agentes ha sido deshabilitada por el administrador.",
          ERR_WAPP_CHECK_CONTACT: "No se pudo verificar el contacto de WhatsApp. Verifique la página de canales.",
          ERR_WAPP_DOWNLOAD_MEDIA: "No se pudo descargar el medio de WhatsApp. Verifique la página de canales.",
          ERR_WAPP_GREETING_REQUIRED: "El mensaje de saludo es obligatorio cuando hay más de un sector.",
          ERR_WAPP_INVALID_CONTACT: "Este no es un número de WhatsApp válido.",
          ERR_WAPP_NOT_INITIALIZED: "Esta sesión de WhatsApp no ha sido inicializada. Verifique la página de canales.",
          ERR_WAPP_SESSION_EXPIRED: "Sesión de WhatsApp expirada.",
        },
      },
    },
  };
  
  export { messages };  