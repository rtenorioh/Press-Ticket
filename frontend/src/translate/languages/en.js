const messages = {
  en: {
    translations: {
      auth: {
        toasts: {
          success: "Login successful!",
          session_expired: "Your session has expired because it was started on another device."
        },
      },
      chat: {
        noTicketMessage: "Select a ticket to start chatting.",
      },
      confirmationModal: {
        buttons: {
          confirm: "Ok",
          cancel: "Cancel",
        },
      },
      connections: {
        title: "Channels",
        toasts: {
          deleted: "Channel deleted successfully!",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage: "Are you sure? This action cannot be undone.",
          disconnectTitle: "Disconnect",
          disconnectMessage: "Are you sure? You will need to scan the QR Code again.",
        },
        buttons: {
          add: "Add",
          shutdown: "Delete",
          restart: "Restart",
          disconnect: "Disconnect",
          tryAgain: "Try again",
          qrcode: "QR CODE",
          newQr: "New QR CODE",
          connecting: "Connecting",
        },
        toolTips: {
          disconnected: {
            title: "Failed to start WhatsApp session",
            content: "Make sure your phone is connected to the internet and try again, or request a new QR Code",
          },
          qrcode: {
            title: "Waiting for QR Code scan",
            content: "Click the 'QR CODE' button and scan the QR Code with your phone to start the session",
          },
          connected: {
            title: "Connection established!",
          },
          timeout: {
            title: "The connection to the phone was lost",
            content: "Make sure your phone is connected to the internet and WhatsApp is open, or click the 'Disconnect' button to get a new QR Code",
          },
        },
        table: {
          id: "ID",
          channel: "Channel",
          name: "Name",
          color: "Color",
          number: "Number",
          status: "Status",
          lastUpdate: "Last update",
          default: "Default",
          actions: "Actions",
          session: "Session",
        },
      },
      contactModal: {
        title: {
          add: "Add contact",
          edit: "Edit contact",
        },
        form: {
          mainInfo: "Contact details",
          extraInfo: "Additional information",
          name: "Name",
          number: "WhatsApp Number",
          email: "Email",
          address: "Address",
          extraName: "Field name",
          extraValue: "Value",
        },
        buttons: {
          addExtraInfo: "Add information",
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "Contact saved successfully.",
      },
      contacts: {
        title: "Contacts",
        toasts: {
          deleted: "Contact deleted successfully!",
          deletedAll: "All contacts deleted successfully!",
        },
        errors: {
          "ticketAlreadyOpen": "There is already an open ticket for this contact, assigned to {{atendente}}."
        },
        searchPlaceholder: "Search...",
        confirmationModal: {
          deleteTitle: "Delete",
          deleteAllTitle: "Delete All",
          importTitle: "Import contacts",
          deleteMessage: "Are you sure you want to delete this contact? All related tickets will be lost.",
          deleteAllMessage: "Are you sure you want to delete all contacts? All related tickets will be lost.",
          importMessage: "Do you want to import all contacts from the phone?",
        },
        buttons: {
          import: "Import Contacts",
          add: "Add Contact",
          export: "Export Contacts",
          delete: "Delete All Contacts"
        },
        table: {
          name: "Name",
          whatsapp: "WhatsApp",
          address: "Address",
          channels: "Channels",
          actions: "Actions",
        },
      },
      contactDrawer: {
        header: "Contact details",
        buttons: {
          edit: "Edit contact",
        },
        extraInfo: "Other information",
      },
      copyToClipboard: {
        copy: "Copy",
        copied: "Copied"
      },
      dashboard: {
        messages: {
          inAttendance: {
            title: "In Attendance"
          },
          waiting: {
            title: "Waiting"
          },
          closed: {
            title: "Closed"
          }
        },
        charts: {
          perDay: {
            title: "Tickets per day: ",
          },
          date: {
            title: "Filter"
          }
        },
        chartPerUser: {
          title: "Tickets by user",
          ticket: "Ticket",
          date: {
            title: "Filter"
          }
        },
        chartPerConnection: {
          date: {
            title: "Filter"
          },
          perConnection: {
            title: "Tickets by Channels"
          }
        },
        chartPerQueue: {
          date: {
            title: "Filter"
          },
          perQueue: {
            title: "Tickets by Sector"
          }
        },
        newContacts: {
          contact: "Contacts",
          date: {
            start: "Start date",
            end: "End date"
          },
          title: "New contacts per day"
        },
        contactsWithTickets: {
          message: "No contact found for this date.",
          unique: "Unique contact",
          date: {
            start: "Start date",
            end: "End date"
          },
          title: "Contacts who opened tickets in the period"
        },
        tags: {
          cloudTitle: "Tags: ",
          noTags: "No tags at the moment!"
        }
      },
      forgotPassword: {
        title: "Forgot Password?",
        form: {
          email: "Enter your email"
        },
        buttons: {
          submit: "Send Reset Link",
          backToLogin: "Back to Login"
        },
        success: "If a valid email was found, a password reset link has been sent!",
        error: {
          invalidEmail: "Please enter a valid email.",
          generic: "Error requesting password reset. Try again later."
        }
      },
      integrations: {
        success: "Integration saved successfully.",
        title: "Integrations",
        integrations: {
          openai: {
            title: "OpenAI",
            organization: "Organization ID",
            apikey: "KEY"
          },
          n8n: {
            title: "N8N",
            urlApiN8N: "API URL N8N"
          },
          hub: {
            title: "Notificame Hub",
            hubToken: "Token"
          },
          maps: {
            title: "Google Maps API",
            apiMaps: "API Key"
          }
        },
      },
      login: {
        title: "Login now",
        form: {
          email: "Enter your email",
          password: "Enter your password",
        },
        buttons: {
          forgotPassword: "Forgot Password?",
          submit: "Login",
          register: "Don't have an account? Sign up!",
        },
      },
      mainDrawer: {
        listItems: {
          general: "General",
          dashboard: "Dashboard",
          connections: "Channels",
          tickets: "Tickets",
          contacts: "Contacts",
          quickAnswers: "Quick Answers",
          tags: "Tags",
          queues: "Sectors",
          administration: "Administration",
          users: "Users",
          settings: "Settings",
          api: "API Usage",
          apidocs: "Documentation",
          apititle: "API",
          apikey: "API Key",
          token: "Token"
        },
        appBar: {
          message: {
            hi: "Hello",
            text: "Welcome to the System."
          },
          user: {
            profile: "Profile",
            logout: "Logout",
          },
        },
      },
      messageOptionsMenu: {
        edit: "Edit",
        history: "History",
        delete: "Delete",
        reply: "Reply",
        confirmationModal: {
          title: "Delete message?",
          message: "This action cannot be undone.",
        },
      },
      messageHistoryModal: {
        close: "Close",
        title: "Message edit history"
      },
      messagesList: {
        header: {
          assignedTo: "Responsible:",
          buttons: {
            return: "Return",
            resolve: "Close",
            reopen: "Reopen",
            accept: "Accept"
          },
        },
        message: {
          download: "Download",
          ticketNumber: "#ticket:",
          voiceVideoLost: "Voice or video message lost at",
          deleted: "Message deleted",
          edited: "Edited",
        }
      },
      messagesInput: {
        placeholderOpen: "Type a message",
        placeholderClosed: "Reopen or accept this ticket to send a message.",
        signMessage: "Sign",
      },
      messageVariablesPicker: {
        label: "Available variables",
        vars: {
          contactName: "Name",
          user: "User",
          greeting: "Greeting",
          protocolNumber: "Protocol",
          date: "Date",
          hour: "Hour",
          ticket_id: "Ticket ID",
          queue: "Sector",
          connection: "Channel"
        }
      },
      newTicketModal: {
        title: "Create Ticket",
        fieldLabel: "Type to search for the contact",
        add: "Add",
        select: {
          none: "Select",
          queue: "Select Sector",
          channel: "Select Channel"
        },
        buttons: {
          ok: "Save",
          cancel: "Cancel",
        },
      },
      newTicketModalContactPage: {
        title: "Create Ticket",
        queue: "Select a Sector",
        fieldLabel: "Type to search for the contact",
        add: "Add",
        buttons: {
          ok: "Save",
          cancel: "Cancel",
        },
      },
      notifications: {
        allow: "Allow browser notifications?",
        noTickets: "No notifications.",
        permissionGranted: "Permission granted.",
        permissionDenied: "Permission denied.",
      },
      qrCode: {
        message: "Scan the QR Code to start the session",
      },
      queueModal: {
        title: {
          add: "Add Sector",
          edit: "Edit Sector",
        },
        notification: {
          title: "Sector saved successfully!",
        },
        form: {
          name: "Name",
          color: "Color",
          greetingMessage: "Greeting message",
          startWork: "Start",
          endWork: "End",
          absenceMessage: "Absence message",
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
      },
      queues: {
        title: "Sectors",
        notifications: {
          queueDeleted: "The sector has been deleted.",
        },
        table: {
          id: "ID",
          name: "Name",
          color: "Color",
          greeting: "Greeting message",
          actions: "Actions",
          startWork: "Start",
          endWork: "End",
        },
        buttons: {
          add: "Add sector",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage: "Are you sure? This action cannot be undone! Tickets in this sector will remain but will not have a sector assigned anymore.",
        },
      },
      queueSelect: {
        inputLabel: "Sectors",
      },
      quickAnswers: {
        title: "Quick Answers",
        table: {
          shortcut: "Shortcut",
          message: "Quick Answer",
          actions: "Actions",
        },
        buttons: {
          add: "Add Quick Answer",
          deleteAll: "Delete All Quick Answers",
        },
        toasts: {
          deleted: "Quick Answer deleted successfully.",
          deletedAll: "All Quick Answers deleted.",
        },
        searchPlaceholder: "Search...",
        confirmationModal: {
          deleteTitle: "Are you sure you want to delete this Quick Answer: ",
          deleteAllTitle: "Are you sure you want to delete all Quick Answers?",
          deleteMessage: "This action cannot be undone.",
          deleteAllMessage: "This action cannot be undone.",
        },
      },
      quickAnswersModal: {
        title: {
          add: "Add Quick Answer",
          edit: "Edit Quick Answer",
        },
        form: {
          shortcut: "Shortcut",
          message: "Quick Answer",
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "Quick Answer saved successfully.",
      },
      resetPassword: {
        title: "Reset Password",
        form: {
          password: "New Password",
          confirmPassword: "Confirm New Password"
        },
        buttons: {
          submit: "Reset Password",
          backToLogin: "Back to Login"
        },
        success: "Password reset successfully!",
        error: {
          passwordMismatch: "Passwords do not match.",
          generic: "Error resetting password. Try again."
        }
      },
      settings: {
        success: "Settings saved successfully.",
        tabs: {
          general: "General",
          personalize: "Personalize",
          integrations: "Integrations"
        },
        general: {
          userCreation: {
            name: "User creation",
            note: "Allow user creation",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          allTicket: {
            name: "Everyone can see tickets without sectors",
            note: "Enable this feature to let all users see tickets without sectors",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          CheckMsgIsGroup: {
            name: "Ignore Group Messages",
            note: "If disabled, you will receive messages from groups.",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          call: {
            name: "Accept calls",
            note: "If disabled, the customer will receive a message stating that calls are not accepted",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          sideMenu: {
            name: "Initial Side Menu",
            note: "If enabled, the side menu will start closed",
            options: {
              enabled: "Open",
              disabled: "Closed",
            },
          },
          quickAnswer: {
            name: "Quick Answers",
            note: "If enabled, quick answers can be edited",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          closeTicketApi: {
            name: "Close Ticket sent via API",
            note: "Automatically closes the ticket when sent via API",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          darkMode: {
            name: "Enable Dark Mode",
            note: "Switch between light and dark mode",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          ASC: {
            name: "Ticket Sorting (ASC or DESC)",
            note: "When enabled, it will sort ascending (ASC), disabling will sort descending (DESC)",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          created: {
            name: "Ticket Sorting (createdAt or updateAt)",
            note: "When enabled, it will sort by creation date (createdAt), disabling will sort by update date (updateAt)",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          openTickets: {
            name: "Prevent multi-tickets for the same contact",
            note: "When enabled, it will prevent opening tickets for contacts who already have an open ticket",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          timeCreateNewTicket: {
            name: "New Ticket in:",
            note: "Select the time required to open a new ticket if the customer contacts again",
            options: {
              "10": "10 Seconds",
              "30": "30 Seconds",
              "60": "1 minute",
              "300": "5 minutes",
              "1800": "30 minutes",
              "3600": "1 hour",
              "7200": "2 hours",
              "21600": "6 hours",
              "43200": "12 hours",
              "86400": "24 hours",
              "604800": "7 days",
              "1296000": "15 days",
              "2592000": "30 days",
            },
          },
        },
        personalize: {
          success: {
            company: "Company data saved successfully!",
            logos: "Logos saved successfully!",
            colors: "Colors saved successfully!",
          },
          error: {
            invalid: "Error fetching customizations.",
            company: "Error saving company data.",
            logos: "Error saving the logo.",
            logs: "Error saving customization:",
            colors: "Error saving theme colors: "
          },
          tabs: {
            data: "Data",
            logos: "Logos",
            colors: "Colors",
          },
          tabpanel: {
            company: "Company",
            url: "URL",
            light: "Theme Light",
            dark: "Theme Dark",
            input: {
              primary: "Primary Color",
              secondary: "Secondary Color",
              default: "Background Default",
              paper: "Background Paper",
            },
            button: {
              save: "Save",
              saveLight: "Save light theme",
              saveDark: "Save dark theme",
            }
          },
        }
      },
      signup: {
        title: "Sign up",
        toasts: {
          success: "User created successfully! Log in now!",
          fail: "Error creating user. Check the entered data.",
        },
        form: {
          name: "Name",
          email: "Email",
          password: "Password",
        },
        buttons: {
          submit: "Sign up",
          login: "Already have an account? Log in!",
        },
      },
      tags: {
        title: "Tags",
        table: {
          name: "Tags",
          color: "Color",
          contacts: "Contacts",
          actions: "Action"
        },
        toasts: {
          deleted: "Tag deleted successfully!",
          deletedAll: "All Tags deleted successfully!",
        },
        buttons: {
          add: "Add",
          deleteAll: "Delete All",
        },
        confirmationModal: {
          deleteTitle: "Delete ",
          deleteAllTitle: "Delete All",
          deleteMessage: "Are you sure you want to delete this Tag?",
          deleteAllMessage: "Are you sure you want to delete all Tags?",
        },
      },
      tagModal: {
        title: {
          add: "Add Tag",
          edit: "Edit Tag",
        },
        buttons: {
          okAdd: "Save",
          okEdit: "Edit",
          cancel: "Cancel",
        },
        form: {
          name: "Tag Name",
          color: "Tag Color"
        },
        success: "Tag saved successfully!",
      },
      ticketsManager: {
        buttons: {
          newTicket: "New",
        },
      },
      ticketsQueueSelect: {
        placeholder: "Sectors",
      },
      tickets: {
        toasts: {
          deleted: "The ticket you were in has been deleted.",
        },
        notification: {
          message: "Message from",
        },
        tabs: {
          open: { title: "Inbox" },
          closed: { title: "Closed" },
          search: { title: "Search" },
        },
        search: {
          placeholder: "Search tickets and messages",
        },
        buttons: {
          showAll: "All",
        },
      },
      transferTicketModal: {
        title: "Transfer Ticket",
        fieldLabel: "Enter to search for an agent",
        fieldConnectionLabel: "Select Channel",
        fieldQueueLabel: "Transfer to Sector",
        fieldConnectionPlaceholder: "Select a Channel",
        noOptions: "No agent found with that name",
        buttons: {
          ok: "Transfer",
          cancel: "Cancel",
        },
      },
      ticketsList: {
        pendingHeader: "Pending",
        assignedHeader: "In Attendance",
        noTicketsTitle: "Nothing here!",
        noTicketsMessage: "No tickets found with this status or search term",
        connectionTitle: "Currently used channel.",
        items: {
          queueless: "No Sector",
          accept: "Accept",
          spy: "Spy",
          close: "Close",
          reopen: "Reopen",
          return: "Move to pending",
          connection: "Channel",
          user: "Agent",
          queue: "Sector",
          tags: "Tags"
        },
        buttons: {
          accept: "Respond",
          acceptBeforeBot: "Accept",
          start: "Start",
          cancel: "Cancel"
        },
        acceptModal: {
          title: "Accept Chat",
          queue: "Select sector"
        },
        errors: {
          ticketAlreadyOpen: "There is already an open ticket for this contact with agent {{atendente}}."
        }
      },
      ticketOptionsMenu: {
        delete: "Delete",
        transfer: "Transfer",
        confirmationModal: {
          title: "Delete the ticket ",
          titleFrom: "from contact ",
          message: "Warning! All messages related to the ticket will be lost.",
        },
        buttons: {
          delete: "Delete",
          cancel: "Cancel",
        },
      },
      uploads: {
        titles: {
          titleUploadMsgDragDrop: "⬇️ DRAG AND DROP FILES BELOW ⬇️",
          titleFileList: "File list"
        },
      },
      users: {
        title: "Agents",
        table: {
          id: "ID",
          name: "Name",
          email: "Email",
          profile: "Profile",
          whatsapp: "Channel",
          queue: "Sector",
          startWork: "Start time",
          endWork: "End time",
          actions: "Actions",
        },
        buttons: {
          add: "Add agent",
        },
        modalTitle: {
          channel: "Channels",
          queue: "Sectors"
        },
        modalTable: {
          id: "ID",
          name: "Name"
        },
        toasts: {
          deleted: "Agent successfully deleted.",
          updated: "Agent successfully updated."
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage: "All data for this agent will be lost. Tickets opened by this agent will be moved to pending.",
        },
      },
      userModal: {
        title: {
          add: "Add agent",
          edit: "Edit agent",
        },
        form: {
          name: "Name",
          email: "Email",
          password: "Password",
          profile: "Profile",
          admin: "Administrator",
          user: "Agent",
          startWork: "Start",
          endWork: "End",
          isTricked: "View Contacts",
          enabled: "Enabled",
          disabled: "Disabled"
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "Agent saved successfully.",
      },
      whatsappModal: {
        title: {
          add: "Add WhatsApp",
          edit: "Edit WhatsApp",
        },
        form: {
          name: "Name",
          default: "Default",
          display: "Show sector schedules",
          farewellMessage: "Farewell message"
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "WhatsApp saved successfully.",
      },
      whatsappSelect: {
        inputLabel: "Channels",
      },
      backendErrors: {
        ERR_CREATING_MESSAGE: "Error creating message in the database.",
        ERR_CREATING_TICKET: "Error creating ticket in the database.",
        ERR_CONNECTION_CREATION_COUNT: "Channel limit reached, contact support to modify.",
        ERR_DELETE_WAPP_MSG: "Could not delete WhatsApp message.",
        ERR_DUPLICATED_CONTACT: "A contact with this number already exists.",
        ERR_EDITING_WAPP_MSG: "Could not edit WhatsApp message.",
        ERR_FETCH_WAPP_MSG: "Error fetching message from WhatsApp, it may be too old.",
        ERR_INVALID_CREDENTIALS: "Authentication error. Please try again.",
        ERR_NO_CONTACT_FOUND: "No contact found with this ID.",
        ERR_NO_DEF_WAPP_FOUND: "No default WhatsApp found. Check the channels page.",
        ERR_NO_INTEGRATION_FOUND: "Integration not found.",
        ERR_NO_PERMISSION: "You do not have permission to access this resource.",
        ERR_NO_SETTING_FOUND: "No settings found with this ID.",
        ERR_NO_TAG_FOUND: "Tag not found.",
        ERR_NO_TICKET_FOUND: "No ticket found with this ID.",
        ERR_NO_USER_FOUND: "No agent found with this ID.",
        ERR_NO_WAPP_FOUND: "No WhatsApp found with this ID.",
        ERR_NO_OTHER_WHATSAPP: "There must be at least one default WhatsApp.",
        ERR_OUT_OF_HOURS: "Out of operating hours!",
        ERR_OPEN_USER_TICKET: "There is already an open ticket for this contact with ",
        ERR_OTHER_OPEN_TICKET: "There is already an open ticket for this contact.",
        ERR_SESSION_EXPIRED: "Session expired. Please log in.",
        ERR_SENDING_WAPP_MSG: "Error sending WhatsApp message. Check the channels page.",
        ERR_USER_CREATION_COUNT: "Agent creation limit reached, contact support to modify.",
        ERR_USER_CREATION_DISABLED: "Agent creation has been disabled by the administrator.",
        ERR_WAPP_CHECK_CONTACT: "Could not verify WhatsApp contact. Check the channels page.",
        ERR_WAPP_DOWNLOAD_MEDIA: "Could not download media from WhatsApp. Check the channels page.",
        ERR_WAPP_GREETING_REQUIRED: "A greeting message is required when there is more than one sector.",
        ERR_WAPP_INVALID_CONTACT: "This is not a valid WhatsApp number.",
        ERR_WAPP_NOT_INITIALIZED: "This WhatsApp session has not been initialized. Check the channels page.",
        ERR_WAPP_SESSION_EXPIRED: "WhatsApp session expired."
      },
    },
  },
};

export { messages };