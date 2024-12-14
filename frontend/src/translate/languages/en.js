const messages = {
  en: {
    translations: {
      auth: {
        toasts: {
          success: "Login successful!",
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
        title: "Connections",
        toasts: {
          deleted: "WhatsApp connection deleted successfully!",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage: "Are you sure? This action cannot be undone.",
          disconnectTitle: "Disconnect",
          disconnectMessage: "Are you sure? You will need to scan the QR Code again.",
        },
        buttons: {
          add: "Add WhatsApp",
          shutdown: "Delete",
          restart: "Restart",
          disconnect: "Disconnect",
          tryAgain: "Try Again",
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
            title: "Connection with phone lost",
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
          lastUpdate: "Last Update",
          default: "Default",
          actions: "Actions",
          session: "Session",
        },
      },
      contactModal: {
        title: {
          add: "Add Contact",
          edit: "Edit Contact",
        },
        form: {
          mainInfo: "Contact Details",
          extraInfo: "Additional Information",
          name: "Name",
          number: "WhatsApp Number",
          email: "Email",
          extraName: "Field Name",
          extraValue: "Value",
        },
        buttons: {
          addExtraInfo: "Add Information",
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
        searchPlaceholder: "Search...",
        confirmationModal: {
          deleteTitle: "Delete",
          deleteAllTitle: "Delete All",
          importTitle: "Import Contacts",
          deleteMessage: "Are you sure you want to delete this contact? All related tickets will be lost.",
          deleteAllMessage: "Are you sure you want to delete all contacts? All related tickets will be lost.",
          importMessage: "Do you want to import all contacts from your phone?",
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
          channels: "Channels",
          actions: "Actions",
        },
      },
      contactDrawer: {
        header: "Contact Details",
        buttons: {
          edit: "Edit Contact",
        },
        extraInfo: "Other Information",
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
            title: "Resolved"
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
          title: "Tickets per user",
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
            title: "Tickets per connection"
          }
        },
        chartPerQueue: {
          date: {
            title: "Filter"
          },
          perQueue: {
            title: "Tickets per Department"
          }
        },
        newContacts: {
          contact: "Contacts",
          date: {
            start: "Start Date",
            end: "End Date"
          },
          title: "New contacts per day"
        },
        contactsWithTickets: {
          message: "No contacts found for this date.",
          unique: "Unique Contact",
          date: {
            start: "Start Date",
            end: "End Date"
          },
          title: "Contacts that opened tickets in the period"
        },
        tags: {
          cloudTitle: "Tags: ",
          noTags: "No tags at the moment!"
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
            urlApiN8N: "N8N API URL"
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
        title: "Log in now",
        form: {
          email: "Enter your email",
          password: "Enter your password",
        },
        buttons: {
          submit: "Log in",
          register: "Don't have an account? Sign up!",
        },
      },
      mainDrawer: {
        listItems: {
          general: "General",
          dashboard: "Dashboard",
          connections: "Connections",
          tickets: "Tickets",
          contacts: "Contacts",
          quickAnswers: "Quick Answers",
          tags: "Tags",
          queues: "Departments",
          administration: "Administration",
          users: "Agents",
          company: "Company",
          integrations: "Integrations",
          settings: "Settings",
          sendMsg: "Send Messages",
          sendMedia: "Send Media",
          api: "API Usage",
          apidocs: "Documentation",
          apititle: "API",
          apikey: "API Key",
          token: "Token"
        },
        appBar: {
          message: {
            hi: "Hello",
            text: "Welcome to the System"
          },
          user: {
            profile: "Profile",
            logout: "Log out",
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
        title: "Message Edit History"
      },
      messageVariablesPicker: {
        label: "Available Variables",
        vars: {
          contactName: "Name",
          user: "Agent",
          greeting: "Greeting",
          protocolNumber: "Protocol",
          date: "Date",
          hour: "Time",
          ticket_id: "Ticket ID",
          queue: "Department",
          connection: "Connection"
        }
      },
      newTicketModal: {
        title: "Create Ticket",
        fieldLabel: "Type to search for contact",
        add: "Add",
        buttons: {
          ok: "Save",
          cancel: "Cancel",
        },
      },
      newTicketModalContactPage: {
        title: "Create Ticket",
        queue: "Select a Department",
        fieldLabel: "Type to search for contact",
        add: "Add",
        buttons: {
          ok: "Save",
          cancel: "Cancel",
        },
      },
      notifications: {
        allow: "Allow notifications in the browser?",
        noTickets: "No notifications.",
        permissionGranted: "Permission granted.",
        permissionDenied: "Permission denied.",
      },
      qrCode: {
        message: "Scan the QR Code to start the session",
      },
      queueModal: {
        title: {
          add: "Add Department",
          edit: "Edit Department",
        },
        notification: {
          title: "Department saved successfully!",
        },
        form: {
          name: "Name",
          color: "Color",
          greetingMessage: "Greeting Message",
          startWork: "Opening Time",
          endWork: "Closing Time",
          absenceMessage: "Absence Message",
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
      },
      queues: {
        title: "Queues",
        notifications: {
          queueDeleted: "The queue has been deleted.",
        },
        table: {
          id: "ID",
          name: "Name",
          color: "Color",
          greeting: "Greeting Message",
          actions: "Actions",
          startWork: "Opening",
          endWork: "Closing",
        },
        buttons: {
          add: "Add Queue",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage: "Are you sure? This action cannot be undone! Tickets in this queue will still exist but will no longer have any queue assigned.",
        },
      },
      queueSelect: {
        inputLabel: "Queues",
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
          deleted: "Quick Answer successfully deleted.",
          deletedAll: "All Quick Answers successfully deleted.",
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
        success: "Quick Answer successfully saved.",
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
            name: "Agent Creation",
            note: "Allow agent creation",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          allTicket: {
            name: "Everyone can see tickets without a department",
            note: "Enable this feature to allow all users to see tickets without an assigned department",
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
            name: "Accept Calls",
            note: "If disabled, the customer will receive a message saying that voice/video calls are not accepted.",
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
            name: "Quick Responses",
            note: "If enabled, you will be able to edit quick responses",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          closeTicketApi: {
            name: "Close Ticket via API",
            note: "Automatically closes the ticket when sent via API",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          darkMode: {
            name: "Enable Dark Mode",
            note: "Toggle between light mode and dark mode",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          ASC: {
            name: "Ticket Sorting (ASC or DESC)",
            note: "When enabled, it will sort in ascending (ASC) order, and disabling will sort in descending (DESC) order.",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          created: {
            name: "Ticket Sorting (createdAt or updateAt)",
            note: "When enabled, it will sort by creation date (createdAt), and disabling will sort by update date (updateAt).",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          timeCreateNewTicket: {
            name: "New Ticket in:",
            note: "Select the time required to open a new ticket if the customer contacts again.",
            options: {
              "10": "10 Seconds",
              "30": "30 Seconds",
              "60": "1 Minute",
              "300": "5 Minutes",
              "1800": "30 Minutes",
              "3600": "1 Hour",
              "7200": "2 Hours",
              "21600": "6 Hours",
              "43200": "12 Hours",
              "86400": "24 Hours",
              "604800": "7 Days",
              "1296000": "15 Days",
              "2592000": "30 Days"
            }
          }
        },
        personalize: {
          success: {
            company: "Company data saved successfully!",
            logos: "Logos saved successfully!",
            colors: "Colors saved successfully!",
          },
          error: {
            invalid: "Error retrieving customizations.",
            company: "Error saving company data.",
            logos: "Error saving the logo.",
            logs: "Error saving customization:",
            colors: "Error saving theme colors:"
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
              default: "Default Background",
              paper: "Paper Background",
            },
            button: {
              save: "Save",
              saveLight: "Save Light Theme",
              saveDark: "Save Dark Theme",
            }
          },
        }
      },
      signup: {
        title: "Sign Up",
        toasts: {
          success: "Attendant created successfully! Please log in!!!",
          fail: "Error creating attendant. Please check the information provided.",
        },
        form: {
          name: "Name",
          email: "Email",
          password: "Password",
        },
        buttons: {
          submit: "Sign Up",
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
          deletedAll: "All tags deleted successfully!",
        },
        buttons: {
          add: "Add",
          deleteAll: "Delete All",
        },
        confirmationModal: {
          deleteTitle: "Delete ",
          deleteAllTitle: "Delete All",
          deleteMessage: "Are you sure you want to delete this tag?",
          deleteAllMessage: "Are you sure you want to delete all tags?",
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
        placeholder: "Departments",
      },
      tickets: {
        toasts: {
          deleted: "The ticket you were viewing has been deleted.",
        },
        notification: {
          message: "Message from",
        },
        tabs: {
          open: { title: "Inbox" },
          closed: { title: "Resolved" },
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
        fieldLabel: "Type to search for an attendant",
        fieldConnectionLabel: "Transfer to connection",
        fieldQueueLabel: "Transfer to Department",
        fieldConnectionPlaceholder: "Select a connection",
        noOptions: "No attendant found with this name",
        buttons: {
          ok: "Transfer",
          cancel: "Cancel",
        },
      },
      ticketsList: {
        pendingHeader: "Waiting",
        assignedHeader: "Attending",
        noTicketsTitle: "Nothing here!",
        noTicketsMessage: "No ticket found with this status or search term",
        connectionTitle: "The connection currently being used.",
        items: {
          queueless: "No Department",
          accept: "Accept",
          spy: "Spy",
          close: "Close",
          reopen: "Reopen",
          return: "Move to waiting",
          connection: "Connection",
          user: "Attendant",
          queue: "Department",
          tags: "Tags"
        },
        buttons: {
          accept: "Reply",
          acceptBeforeBot: "Accept",
          start: "Start",
          cancel: "Cancel"
        },
        acceptModal: {
          title: "Accept Chat",
          queue: "Select department"
        },
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
          titleFileList: "File(s) List"
        },
      },
      users: {
        title: "Attendants",
        table: {
          id: "ID",
          name: "Name",
          email: "Email",
          profile: "Profile",
          whatsapp: "Default Connection",
          startWork: "Start Time",
          endWork: "End Time",
          actions: "Actions",
        },
        buttons: {
          add: "Add Attendant",
        },
        toasts: {
          deleted: "Attendant deleted successfully.",
          updated: "Attendant updated successfully."
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage: "All the attendant's data will be lost. Open tickets from this attendant will be moved to waiting.",
        },
      },
      userModal: {
        title: {
          add: "Add Attendant",
          edit: "Edit Attendant",
        },
        form: {
          name: "Name",
          email: "Email",
          password: "Password",
          profile: "Profile",
          admin: "Administrator",
          whatsapp: "Default Connection",
          user: "Attendant",
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
        success: "Attendant saved successfully.",
      },
      whatsappModal: {
        title: {
          add: "Add WhatsApp",
          edit: "Edit WhatsApp",
        },
        form: {
          name: "Name",
          default: "Default",
          display: "Show department times",
          farewellMessage: "Farewell message"
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "WhatsApp saved successfully.",
      },
      backendErrors: {
        ERR_CONNECTION_CREATION_COUNT: "Connection limit reached, contact support to modify.",
        ERR_CREATING_MESSAGE: "Error creating message in the database.",
        ERR_CREATING_TICKET: "Error creating ticket in the database.",
        ERR_DELETE_WAPP_MSG: "Unable to delete WhatsApp message.",
        ERR_DUPLICATED_CONTACT: "A contact with this number already exists.",
        ERR_EDITING_WAPP_MSG: "Unable to edit WhatsApp message.",
        ERR_FETCH_WAPP_MSG: "Error fetching message from WhatsApp, it may be too old.",
        ERR_INVALID_CREDENTIALS: "Authentication error. Please try again.",
        ERR_NO_CONTACT_FOUND: "No contact found with this ID.",
        ERR_NO_DEF_WAPP_FOUND: "No default WhatsApp found. Check the connections page.",
        ERR_NO_INTEGRATION_FOUND: "Integration not found.",
        ERR_NO_OTHER_WHATSAPP: "There must be at least one default WhatsApp.",
        ERR_NO_PERMISSION: "You do not have permission to access this resource.",
        ERR_NO_SETTING_FOUND: "No configuration found with this ID.",
        ERR_NO_TAG_FOUND: "Tag not found.",
        ERR_NO_TICKET_FOUND: "No ticket found with this ID.",
        ERR_NO_USER_FOUND: "No agent found with this ID.",
        ERR_NO_WAPP_FOUND: "No WhatsApp found with this ID.",
        ERR_OPEN_USER_TICKET: "An open ticket already exists for this contact with ",
        ERR_OTHER_OPEN_TICKET: "An open ticket already exists for this contact.",
        ERR_OUT_OF_HOURS: "Out of working hours!",
        ERR_QUEUE_COLOR_ALREADY_EXISTS: "This color is already in use, please choose another.",
        ERR_SENDING_WAPP_MSG: "Error sending WhatsApp message. Check the connections page.",
        ERR_SESSION_EXPIRED: "Session expired. Please log in.",
        ERR_USER_CREATION_COUNT: "Agent limit reached, contact support to modify.",
        ERR_USER_CREATION_DISABLED: "Agent creation has been disabled by the administrator.",
        ERR_WAPP_CHECK_CONTACT: "Unable to verify WhatsApp contact. Check the connections page.",
        ERR_WAPP_DOWNLOAD_MEDIA: "Unable to download WhatsApp media. Check the connections page.",
        ERR_WAPP_GREETING_REQUIRED: "Greeting message is mandatory when there is more than one sector.",
        ERR_WAPP_INVALID_CONTACT: "This is not a valid WhatsApp number.",
        ERR_WAPP_NOT_INITIALIZED: "This WhatsApp session was not initialized. Check the connections page.",
      },
    },
  },
};

export { messages };

