const messages = {
  de: {
    translations: {
      auth: {
        toasts: {
          success: "Anmeldung erfolgreich!",
        },
      },
      chat: {
        noTicketMessage: "Wählen Sie ein Ticket, um das Gespräch zu beginnen.",
      },
      confirmationModal: {
        buttons: {
          confirm: "Ok",
          cancel: "Abbrechen",
        },
      },
      connections: {
        title: "Kanäle",
        toasts: {
          deleted: "Kanal erfolgreich gelöscht!",
        },
        confirmationModal: {
          deleteTitle: "Löschen",
          deleteMessage: "Sind Sie sicher? Diese Aktion kann nicht rückgängig gemacht werden.",
          disconnectTitle: "Trennen",
          disconnectMessage: "Sind Sie sicher? Sie müssen den QR-Code erneut scannen.",
        },
        buttons: {
          add: "Hinzufügen",
          shutdown: "Löschen",
          restart: "Neustart",
          disconnect: "Trennen",
          tryAgain: "Erneut versuchen",
          qrcode: "QR-CODE",
          newQr: "Neuer QR-CODE",
          connecting: "Verbinden",
        },
        toolTips: {
          disconnected: {
            title: "Fehler beim Starten der WhatsApp-Sitzung",
            content: "Stellen Sie sicher, dass Ihr Handy mit dem Internet verbunden ist, und versuchen Sie es erneut, oder fordern Sie einen neuen QR-Code an.",
          },
          qrcode: {
            title: "Warten auf QR-Code-Scan",
            content: "Klicken Sie auf die Schaltfläche 'QR-CODE' und scannen Sie den QR-Code mit Ihrem Handy, um die Sitzung zu starten.",
          },
          connected: {
            title: "Verbindung hergestellt!",
          },
          timeout: {
            title: "Die Verbindung zum Handy wurde unterbrochen",
            content: "Stellen Sie sicher, dass Ihr Handy mit dem Internet verbunden ist und WhatsApp geöffnet ist, oder klicken Sie auf die Schaltfläche 'Trennen', um einen neuen QR-Code zu erhalten.",
          },
        },
        table: {
          id: "ID",
          channel: "Kanal",
          name: "Name",
          color: "Farbe",
          number: "Nummer",
          status: "Status",
          lastUpdate: "Letztes Update",
          default: "Standard",
          actions: "Aktionen",
          session: "Sitzung",
        },
      },
      contactModal: {
        title: {
          add: "Kontakt hinzufügen",
          edit: "Kontakt bearbeiten",
        },
        form: {
          mainInfo: "Kontaktdaten",
          extraInfo: "Zusätzliche Informationen",
          name: "Name",
          number: "WhatsApp-Nummer",
          email: "E-Mail",
          address: "Adresse",
          extraName: "Feldname",
          extraValue: "Wert",
        },
        buttons: {
          addExtraInfo: "Information hinzufügen",
          okAdd: "Hinzufügen",
          okEdit: "Speichern",
          cancel: "Abbrechen",
        },
        success: "Kontakt erfolgreich gespeichert.",
      },
      contacts: {
        title: "Kontakte",
        toasts: {
          deleted: "Kontakt erfolgreich gelöscht!",
          deletedAll: "Alle Kontakte erfolgreich gelöscht!",
        },
        errors: {
          "ticketAlreadyOpen": "Es gibt bereits ein geöffnetes Ticket für diesen Kontakt, zugewiesen an {{atendente}}."
        },
        searchPlaceholder: "Suchen...",
        confirmationModal: {
          deleteTitle: "Löschen",
          deleteAllTitle: "Alle löschen",
          importTitle: "Kontakte importieren",
          deleteMessage: "Möchten Sie diesen Kontakt wirklich löschen? Alle zugehörigen Tickets gehen verloren.",
          deleteAllMessage: "Möchten Sie wirklich alle Kontakte löschen? Alle zugehörigen Tickets gehen verloren.",
          importMessage: "Möchten Sie alle Kontakte vom Telefon importieren?",
        },
        buttons: {
          import: "Kontakte importieren",
          add: "Kontakt hinzufügen",
          export: "Kontakte exportieren",
          delete: "Alle Kontakte löschen",
        },
        table: {
          name: "Name",
          whatsapp: "WhatsApp",
          address: "Adresse",
          channels: "Kanäle",
          actions: "Aktionen",
        },
      },
      contactDrawer: {
        header: "Kontaktdaten",
        buttons: {
          edit: "Kontakt bearbeiten",
        },
        extraInfo: "Weitere Informationen",
      },
      copyToClipboard: {
        copy: "Kopieren",
        copied: "Kopiert",
      },
      dashboard: {
        messages: {
          inAttendance: {
            title: "In Bearbeitung",
          },
          waiting: {
            title: "Wartend",
          },
          closed: {
            title: "Abgeschlossen",
          },
        },
        charts: {
          perDay: {
            title: "Tickets pro Tag: ",
          },
          date: {
            title: "Filtern",
          },
        },
        chartPerUser: {
          title: "Tickets pro Benutzer",
          ticket: "Ticket",
          date: {
            title: "Filtern",
          },
        },
        chartPerConnection: {
          date: {
            title: "Filtern",
          },
          perConnection: {
            title: "Tickets pro Kanal",
          },
        },
        chartPerQueue: {
          date: {
            title: "Filtern",
          },
          perQueue: {
            title: "Tickets pro Abteilung",
          },
        },
        newContacts: {
          contact: "Kontakte",
          date: {
            start: "Startdatum",
            end: "Enddatum",
          },
          title: "Neue Kontakte pro Tag",
        },
        contactsWithTickets: {
          message: "Keine Kontakte für dieses Datum gefunden.",
          unique: "Einzelner Kontakt",
          date: {
            start: "Startdatum",
            end: "Enddatum",
          },
          title: "Kontakte mit Tickets im Zeitraum",
        },
        tags: {
          cloudTitle: "Tags: ",
          noTags: "Keine Tags vorhanden!",
        },
      },
      forgotPassword: {
        title: "Passwort vergessen?",
        form: {
          email: "Geben Sie Ihre E-Mail ein",
        },
        buttons: {
          submit: "Link zum Zurücksetzen senden",
          backToLogin: "Zurück zum Login",
        },
        success: "Wenn eine gültige E-Mail gefunden wurde, wurde ein Link zum Zurücksetzen des Passworts gesendet!",
        error: {
          invalidEmail: "Bitte geben Sie eine gültige E-Mail ein.",
          generic: "Fehler beim Anfordern des Zurücksetzens des Passworts. Bitte versuchen Sie es später erneut.",
        },
      },
      integrations: {
        success: "Integration erfolgreich gespeichert.",
        title: "Integrationen",
        integrations: {
          openai: {
            title: "OpenAI",
            organization: "Organisations-ID",
            apikey: "Schlüssel",
          },
          n8n: {
            title: "N8N",
            urlApiN8N: "N8N API-URL",
          },
          hub: {
            title: "Notificame Hub",
            hubToken: "Token",
          },
          maps: {
            title: "Google Maps API",
            apiMaps: "API-Schlüssel",
          },
        },
      },
      login: {
        title: "Melden Sie sich jetzt an",
        form: {
          email: "E-Mail eingeben",
          password: "Geben Sie Ihr Passwort ein",
        },
        buttons: {
          forgotPassword: "Passwort vergessen?",
          submit: "Einloggen",
          register: "Noch kein Konto? Registrieren Sie sich!",
        },
      },
      mainDrawer: {
        listItems: {
          general: "Allgemein",
          dashboard: "Dashboard",
          connections: "Kanäle",
          tickets: "Tickets",
          contacts: "Kontakte",
          quickAnswers: "Schnellantworten",
          tags: "Tags",
          queues: "Abteilungen",
          administration: "Verwaltung",
          users: "Agenten",
          settings: "Einstellungen",
          api: "API-Nutzung",
          apidocs: "Dokumentation",
          apititle: "API",
          apikey: "API-Schlüssel",
          token: "Token",
        },
        appBar: {
          message: {
            hi: "Hallo",
            text: "Willkommen im System.",
          },
          user: {
            profile: "Profil",
            logout: "Abmelden",
          },
        },
      },
      messageOptionsMenu: {
        edit: "Bearbeiten",
        history: "Verlauf",
        delete: "Löschen",
        reply: "Antworten",
        confirmationModal: {
          title: "Nachricht löschen?",
          message: "Diese Aktion kann nicht rückgängig gemacht werden.",
        },
      },
      messageHistoryModal: {
        close: "Schließen",
        title: "Bearbeitungsverlauf der Nachricht",
      },
      messagesList: {
        header: {
          assignedTo: "Zuständig:",
          buttons: {
            return: "Zurück",
            resolve: "Abschließen",
            reopen: "Wiedereröffnen",
            accept: "Annehmen",
          },
        },
        message: {
          download: "Herunterladen",
          ticketNumber: "#Ticket:",
          voiceVideoLost: "Sprach- oder Videonachricht verloren um",
          deleted: "Nachricht gelöscht",
          edited: "Bearbeitet",
        },
      },
      messagesInput: {
        placeholderOpen: "Geben Sie eine Nachricht ein",
        placeholderClosed: "Öffnen oder akzeptieren Sie dieses Ticket, um eine Nachricht zu senden.",
        signMessage: "Unterschreiben",
      },
      messageVariablesPicker: {
        label: "Verfügbare Variablen",
        vars: {
          contactName: "Name",
          user: "Agent",
          greeting: "Begrüßung",
          protocolNumber: "Protokoll",
          date: "Datum",
          hour: "Uhrzeit",
          ticket_id: "Ticket-ID",
          queue: "Abteilung",
          connection: "Kanal",
        },
      },
      newTicketModal: {
        title: "Ticket erstellen",
        fieldLabel: "Geben Sie ein, um den Kontakt zu suchen",
        add: "Hinzufügen",
        select: {
          none: "Wählen",
          queue: "Abteilung auswählen",
          channel: "Kanal auswählen",
        },
        buttons: {
          ok: "Speichern",
          cancel: "Abbrechen",
        },
      },
      newTicketModalContactPage: {
        title: "Ticket erstellen",
        queue: "Abteilung auswählen",
        fieldLabel: "Geben Sie ein, um den Kontakt zu suchen",
        add: "Hinzufügen",
        buttons: {
          ok: "Speichern",
          cancel: "Abbrechen",
        },
      },
      notifications: {
        allow: "Browser-Benachrichtigungen erlauben?",
        noTickets: "Keine Benachrichtigungen.",
        permissionGranted: "Erlaubnis erteilt.",
        permissionDenied: "Erlaubnis verweigert.",
      },
      qrCode: {
        message: "Scannen Sie den QR-Code, um die Sitzung zu starten",
      },
      queueModal: {
        title: {
          add: "Abteilung hinzufügen",
          edit: "Abteilung bearbeiten",
        },
        notification: {
          title: "Abteilung erfolgreich gespeichert!",
        },
        form: {
          name: "Name",
          color: "Farbe",
          greetingMessage: "Begrüßungsnachricht",
          startWork: "Öffnungszeit",
          endWork: "Schließzeit",
          absenceMessage: "Abwesenheitsnachricht",
        },
        buttons: {
          okAdd: "Hinzufügen",
          okEdit: "Speichern",
          cancel: "Abbrechen",
        },
      },
      queues: {
        title: "Abteilungen",
        notifications: {
          queueDeleted: "Die Abteilung wurde gelöscht.",
        },
        table: {
          id: "ID",
          name: "Name",
          color: "Farbe",
          greeting: "Begrüßungsnachricht",
          actions: "Aktionen",
          startWork: "Öffnungszeit",
          endWork: "Schließzeit",
        },
        buttons: {
          add: "Abteilung hinzufügen",
        },
        confirmationModal: {
          deleteTitle: "Löschen",
          deleteMessage: "Sind Sie sicher? Diese Aktion kann nicht rückgängig gemacht werden! Die Tickets dieser Abteilung bleiben bestehen, werden jedoch keiner Abteilung mehr zugeordnet.",
        },
      },
      queueSelect: {
        inputLabel: "Abteilungen",
      },
      quickAnswers: {
        title: "Schnellantworten",
        table: {
          shortcut: "Abkürzung",
          message: "Schnellantwort",
          actions: "Aktionen",
        },
        buttons: {
          add: "Schnellantwort hinzufügen",
          deleteAll: "Alle Schnellantworten löschen",
        },
        toasts: {
          deleted: "Schnellantwort erfolgreich gelöscht.",
          deletedAll: "Alle Schnellantworten erfolgreich gelöscht.",
        },
        searchPlaceholder: "Suchen...",
        confirmationModal: {
          deleteTitle: "Sind Sie sicher, dass Sie diese Schnellantwort löschen möchten: ",
          deleteAllTitle: "Sind Sie sicher, dass Sie alle Schnellantworten löschen möchten?",
          deleteMessage: "Diese Aktion kann nicht rückgängig gemacht werden.",
          deleteAllMessage: "Diese Aktion kann nicht rückgängig gemacht werden.",
        },
      },
      quickAnswersModal: {
        title: {
          add: "Schnellantwort hinzufügen",
          edit: "Schnellantwort bearbeiten",
        },
        form: {
          shortcut: "Abkürzung",
          message: "Schnellantwort",
        },
        buttons: {
          okAdd: "Hinzufügen",
          okEdit: "Speichern",
          cancel: "Abbrechen",
        },
        success: "Schnellantwort erfolgreich gespeichert.",
      },
      resetPassword: {
        title: "Passwort zurücksetzen",
        form: {
          password: "Neues Passwort",
          confirmPassword: "Neues Passwort bestätigen",
        },
        buttons: {
          submit: "Passwort zurücksetzen",
          backToLogin: "Zurück zum Login",
        },
        success: "Passwort erfolgreich zurückgesetzt!",
        error: {
          passwordMismatch: "Die Passwörter stimmen nicht überein.",
          generic: "Fehler beim Zurücksetzen des Passworts. Bitte versuchen Sie es erneut.",
        },
      },
      settings: {
        success: "Einstellungen erfolgreich gespeichert.",
        tabs: {
          general: "Allgemein",
          personalize: "Personalisieren",
          integrations: "Integrationen",
        },
        general: {
          userCreation: {
            name: "Agentenerstellung",
            note: "Erlauben Sie die Erstellung von Agenten",
            options: {
              enabled: "Aktiviert",
              disabled: "Deaktiviert",
            },
          },
          allTicket: {
            name: "Alle können Tickets ohne Abteilung sehen",
            note: "Aktivieren Sie diese Funktion, damit alle Benutzer Tickets ohne Abteilung sehen können",
            options: {
              enabled: "Aktiviert",
              disabled: "Deaktiviert",
            },
          },
          CheckMsgIsGroup: {
            name: "Gruppennachrichten ignorieren",
            note: "Wenn deaktiviert, werden Gruppennachrichten empfangen.",
            options: {
              enabled: "Aktiviert",
              disabled: "Deaktiviert",
            },
          },
          call: {
            name: "Anrufe akzeptieren",
            note: "Wenn deaktiviert, erhält der Kunde eine Nachricht, dass keine Sprach-/Videoanrufe akzeptiert werden",
            options: {
              enabled: "Aktiviert",
              disabled: "Deaktiviert",
            },
          },
          sideMenu: {
            name: "Start-Seitenmenü",
            note: "Wenn aktiviert, startet das Seitenmenü geschlossen",
            options: {
              enabled: "Geöffnet",
              disabled: "Geschlossen",
            },
          },
          quickAnswer: {
            name: "Schnellantworten",
            note: "Wenn aktiviert, können Sie Schnellantworten bearbeiten",
            options: {
              enabled: "Aktiviert",
              disabled: "Deaktiviert",
            },
          },
          closeTicketApi: {
            name: "Ticket per API schließen",
            note: "Schließt das Ticket automatisch, wenn es per API gesendet wird",
            options: {
              enabled: "Aktiviert",
              disabled: "Deaktiviert",
            },
          },
          darkMode: {
            name: "Dunkelmodus aktivieren",
            note: "Zwischen hellem und dunklem Modus wechseln",
            options: {
              enabled: "Aktiviert",
              disabled: "Deaktiviert",
            },
          },
          ASC: {
            name: "Ticket-Sortierung (ASC oder DESC)",
            note: "Wenn aktiviert, wird aufsteigend (ASC) sortiert, andernfalls absteigend (DESC)",
            options: {
              enabled: "Aktiviert",
              disabled: "Deaktiviert",
            },
          },
          created: {
            name: "Ticket-Sortierung (createdAt oder updateAt)",
            note: "Wenn aktiviert, wird nach Erstellungsdatum (createdAt) sortiert, andernfalls nach Aktualisierungsdatum (updateAt)",
            options: {
              enabled: "Aktiviert",
              disabled: "Deaktiviert",
            },
          },
          openTickets: {
            name: "Mehrere Tickets für denselben Kontakt verhindern",
            note: "Wenn aktiviert, wird das Öffnen von Tickets für Kontakte mit offenen Tickets verhindert",
            options: {
              enabled: "Aktiviert",
              disabled: "Deaktiviert",
            },
          },
          timeCreateNewTicket: {
            name: "Neues Ticket in:",
            note: "Wählen Sie die Zeit, die benötigt wird, um ein neues Ticket zu öffnen, wenn der Kunde erneut Kontakt aufnimmt",
            options: {
              "10": "10 Sekunden",
              "30": "30 Sekunden",
              "60": "1 Minute",
              "300": "5 Minuten",
              "1800": "30 Minuten",
              "3600": "1 Stunde",
              "7200": "2 Stunden",
              "21600": "6 Stunden",
              "43200": "12 Stunden",
              "86400": "24 Stunden",
              "604800": "7 Tage",
              "1296000": "15 Tage",
              "2592000": "30 Tage",
            },
          },
        },
        personalize: {
          success: {
            company: "Firmendaten erfolgreich gespeichert!",
            logos: "Logos erfolgreich gespeichert!",
            colors: "Farben erfolgreich gespeichert!",
          },
          error: {
            invalid: "Fehler beim Abrufen der Personalisierungen.",
            company: "Fehler beim Speichern der Firmendaten.",
            logos: "Fehler beim Speichern des Logos.",
            logs: "Fehler beim Speichern der Personalisierung:",
            colors: "Fehler beim Speichern der Themenfarben:",
          },
          tabs: {
            data: "Daten",
            logos: "Logos",
            colors: "Farben",
          },
          tabpanel: {
            company: "Unternehmen",
            url: "URL",
            light: "Helles Thema",
            dark: "Dunkles Thema",
            input: {
              primary: "Primärfarbe",
              secondary: "Sekundärfarbe",
              default: "Standard-Hintergrund",
              paper: "Papier-Hintergrund",
            },
            button: {
              save: "Speichern",
              saveLight: "Helles Thema speichern",
              saveDark: "Dunkles Thema speichern",
            },
          },
        },
      },
      signup: {
        title: "Registrieren",
        toasts: {
          success: "Agent erfolgreich erstellt! Bitte melden Sie sich an!",
          fail: "Fehler beim Erstellen des Agents. Bitte überprüfen Sie die eingegebenen Daten.",
        },
        form: {
          name: "Name",
          email: "E-Mail",
          password: "Passwort",
        },
        buttons: {
          submit: "Registrieren",
          login: "Haben Sie bereits ein Konto? Einloggen!",
        },
      },
      tags: {
        title: "Tags",
        table: {
          name: "Tags",
          color: "Farbe",
          contacts: "Kontakte",
          actions: "Aktion",
        },
        toasts: {
          deleted: "Tag erfolgreich gelöscht!",
          deletedAll: "Alle Tags erfolgreich gelöscht!",
        },
        buttons: {
          add: "Hinzufügen",
          deleteAll: "Alle löschen",
        },
        confirmationModal: {
          deleteTitle: "Löschen ",
          deleteAllTitle: "Alle löschen",
          deleteMessage: "Möchten Sie dieses Tag wirklich löschen?",
          deleteAllMessage: "Möchten Sie wirklich alle Tags löschen?",
        },
      },
      tagModal: {
        title: {
          add: "Tag hinzufügen",
          edit: "Tag bearbeiten",
        },
        buttons: {
          okAdd: "Speichern",
          okEdit: "Bearbeiten",
          cancel: "Abbrechen",
        },
        form: {
          name: "Tag-Name",
          color: "Tag-Farbe",
        },
        success: "Tag erfolgreich gespeichert!",
      },
      ticketsManager: {
        buttons: {
          newTicket: "Neu",
        },
      },
      ticketsQueueSelect: {
        placeholder: "Abteilungen",
      },
      tickets: {
        toasts: {
          deleted: "Das Ticket, an dem Sie gearbeitet haben, wurde gelöscht.",
        },
        notification: {
          message: "Nachricht von",
        },
        tabs: {
          open: { title: "Posteingang" },
          closed: { title: "Abgeschlossen" },
          search: { title: "Suche" },
        },
        search: {
          placeholder: "Tickets und Nachrichten suchen",
        },
        buttons: {
          showAll: "Alle",
        },
      },
      transferTicketModal: {
        title: "Ticket übertragen",
        fieldLabel: "Geben Sie den Namen eines Agents ein",
        fieldConnectionLabel: "Kanal auswählen",
        fieldQueueLabel: "An Abteilung übertragen",
        fieldConnectionPlaceholder: "Kanal auswählen",
        noOptions: "Kein Agent mit diesem Namen gefunden",
        buttons: {
          ok: "Übertragen",
          cancel: "Abbrechen",
        },
      },
      ticketsList: {
        pendingHeader: "Warten",
        assignedHeader: "In Bearbeitung",
        noTicketsTitle: "Nichts hier!",
        noTicketsMessage: "Kein Ticket mit diesem Status oder Suchbegriff gefunden",
        connectionTitle: "Derzeit verwendeter Kanal.",
        items: {
          queueless: "Ohne Abteilung",
          accept: "Akzeptieren",
          spy: "Spionieren",
          close: "Schließen",
          reopen: "Wieder öffnen",
          return: "Zu Warten verschieben",
          connection: "Kanal",
          user: "Agent",
          queue: "Abteilung",
          tags: "Tags",
        },
        buttons: {
          accept: "Antworten",
          acceptBeforeBot: "Akzeptieren",
          start: "Starten",
          cancel: "Abbrechen",
        },
        acceptModal: {
          title: "Chat akzeptieren",
          queue: "Abteilung auswählen",
        },
        errors: {
          ticketAlreadyOpen: "Für diesen Kontakt ist bereits ein Ticket mit dem Agenten {{atendente}} geöffnet.",
        },
      },
      ticketOptionsMenu: {
        delete: "Löschen",
        transfer: "Übertragen",
        confirmationModal: {
          title: "Ticket löschen",
          titleFrom: "vom Kontakt",
          message: "Achtung! Alle mit diesem Ticket verbundenen Nachrichten gehen verloren.",
        },
        buttons: {
          delete: "Löschen",
          cancel: "Abbrechen",
        },
      },
      uploads: {
        titles: {
          titleUploadMsgDragDrop: "⬇️ DATEIEN HIERHER ZIEHEN UND ABLEGEN ⬇️",
          titleFileList: "Dateiliste",
        },
      },
      users: {
        title: "Agents",
        table: {
          id: "ID",
          name: "Name",
          email: "E-Mail",
          profile: "Profil",
          whatsapp: "Kanal",
          queue: "Abteilung",
          startWork: "Startzeit",
          endWork: "Endzeit",
          actions: "Aktionen",
        },
        buttons: {
          add: "Agent hinzufügen",
        },
        modalTitle: {
          channel: "Kanäle",
          queue: "Abteilungen",
        },
        modalTable: {
          id: "ID",
          name: "Name",
        },
        toasts: {
          deleted: "Agent erfolgreich gelöscht.",
          updated: "Agent erfolgreich aktualisiert.",
        },
        confirmationModal: {
          deleteTitle: "Löschen",
          deleteMessage: "Alle Daten dieses Agents gehen verloren. Offene Tickets dieses Agents werden auf Warten verschoben.",
        },
      },
      userModal: {
        title: {
          add: "Agent hinzufügen",
          edit: "Agent bearbeiten",
        },
        form: {
          name: "Name",
          email: "E-Mail",
          password: "Passwort",
          profile: "Profil",
          admin: "Administrator",
          user: "Agent",
          startWork: "Start",
          endWork: "Ende",
          isTricked: "Kontakte anzeigen",
          enabled: "Aktiviert",
          disabled: "Deaktiviert",
        },
        buttons: {
          okAdd: "Hinzufügen",
          okEdit: "Speichern",
          cancel: "Abbrechen",
        },
        success: "Agent erfolgreich gespeichert.",
      },
      whatsappModal: {
        title: {
          add: "WhatsApp hinzufügen",
          edit: "WhatsApp bearbeiten",
        },
        form: {
          name: "Name",
          default: "Standard",
          display: "Abteilungszeitpläne anzeigen",
          farewellMessage: "Abschiedsnachricht",
        },
        buttons: {
          okAdd: "Hinzufügen",
          okEdit: "Speichern",
          cancel: "Abbrechen",
        },
        success: "WhatsApp erfolgreich gespeichert.",
      },
      whatsappSelect: {
        inputLabel: "Kanäle",
      },
      backendErrors: {
        ERR_CREATING_MESSAGE: "Fehler beim Erstellen der Nachricht in der Datenbank.",
        ERR_CREATING_TICKET: "Fehler beim Erstellen des Tickets in der Datenbank.",
        ERR_CONNECTION_CREATION_COUNT: "Kanallimit erreicht. Bitte wenden Sie sich an den Support, um Änderungen vorzunehmen.",
        ERR_DELETE_WAPP_MSG: "Die WhatsApp-Nachricht konnte nicht gelöscht werden.",
        ERR_DUPLICATED_CONTACT: "Ein Kontakt mit dieser Nummer existiert bereits.",
        ERR_EDITING_WAPP_MSG: "Die WhatsApp-Nachricht konnte nicht bearbeitet werden.",
        ERR_FETCH_WAPP_MSG: "Fehler beim Abrufen der WhatsApp-Nachricht. Möglicherweise ist sie zu alt.",
        ERR_INVALID_CREDENTIALS: "Authentifizierungsfehler. Bitte versuchen Sie es erneut.",
        ERR_NO_CONTACT_FOUND: "Kein Kontakt mit dieser ID gefunden.",
        ERR_NO_DEF_WAPP_FOUND: "Kein Standard-WhatsApp gefunden. Bitte überprüfen Sie die Kanalseite.",
        ERR_NO_INTEGRATION_FOUND: "Integration nicht gefunden.",
        ERR_NO_PERMISSION: "Sie haben keine Berechtigung, auf diese Ressource zuzugreifen.",
        ERR_NO_SETTING_FOUND: "Keine Konfiguration mit dieser ID gefunden.",
        ERR_NO_TAG_FOUND: "Tag nicht gefunden.",
        ERR_NO_TICKET_FOUND: "Kein Ticket mit dieser ID gefunden.",
        ERR_NO_USER_FOUND: "Kein Agent mit dieser ID gefunden.",
        ERR_NO_WAPP_FOUND: "Kein WhatsApp mit dieser ID gefunden.",
        ERR_NO_OTHER_WHATSAPP: "Es muss mindestens ein Standard-WhatsApp geben.",
        ERR_OUT_OF_HOURS: "Außerhalb der Geschäftszeiten!",
        ERR_OPEN_USER_TICKET: "Es gibt bereits ein offenes Ticket für diesen Kontakt mit ",
        ERR_OTHER_OPEN_TICKET: "Es gibt bereits ein offenes Ticket für diesen Kontakt.",
        ERR_SESSION_EXPIRED: "Sitzung abgelaufen. Bitte melden Sie sich erneut an.",
        ERR_SENDING_WAPP_MSG: "Fehler beim Senden der WhatsApp-Nachricht. Bitte überprüfen Sie die Kanalseite.",
        ERR_USER_CREATION_COUNT: "Agentenlimit erreicht. Bitte wenden Sie sich an den Support, um Änderungen vorzunehmen.",
        ERR_USER_CREATION_DISABLED: "Die Erstellung von Agenten wurde vom Administrator deaktiviert.",
        ERR_WAPP_CHECK_CONTACT: "Der WhatsApp-Kontakt konnte nicht überprüft werden. Bitte überprüfen Sie die Kanalseite.",
        ERR_WAPP_DOWNLOAD_MEDIA: "WhatsApp-Medien konnten nicht heruntergeladen werden. Bitte überprüfen Sie die Kanalseite.",
        ERR_WAPP_GREETING_REQUIRED: "Die Begrüßungsnachricht ist erforderlich, wenn es mehr als eine Abteilung gibt.",
        ERR_WAPP_INVALID_CONTACT: "Dies ist keine gültige WhatsApp-Nummer.",
        ERR_WAPP_NOT_INITIALIZED: "Diese WhatsApp-Sitzung wurde nicht initialisiert. Bitte überprüfen Sie die Kanalseite.",
        ERR_WAPP_SESSION_EXPIRED: "Die WhatsApp-Sitzung ist abgelaufen.",
      },
    },
  },
};

export { messages };                        