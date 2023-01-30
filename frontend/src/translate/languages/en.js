const messages = {
  en: {
    translations: {
      signup: {
        title: "Register",
        toasts: {
          success: "Attendant created successfully! Please login!!!.",
          fail: "Error creating attendant. Please check the entered data.",
        },
        form: {
          name: "Name",
          email: "Email",
          password: "Password",
        },
        buttons: {
          submit: "Register",
          login: "Already have an account? Login!",
        },
      },
      Login: {
        title: "Login now",
        form: {
          email: "Enter email",
          password: "Enter your password",
        },
        buttons: {
          submit: "Sign in",
          register: "Don't have an account? Register!",
        },
      },
      auth: {
        toasts: {
          success: "Login was successful!",
        },
      },
      messageVariablesPicker: {
        label: "Available variables",
        vars: {
          contactName: "Name",
          user: "Attendant",
          greeting: "Greeting",
          protocolNumber: "Protocol",
          date: "Date",
          hour: "Hour",
          date_hour: "Date and Time",
          ticket_id: "Ticked ID",
          queue: "Sector",
          connection: "Connection"
        }
      },
      dashboard: {
        charts: {
          perDay: {
            title: "Today's Tickets: ",
          },
        },
        messages: {
          inAttendance: {
            title: "In Attendance"
          },
          waiting: {
            title: "Waiting"
          },
          closed: {
            title: "Solved"
          }
        }
      },
      connections: {
        title: "Connections",
        toasts: {
          deleted: "WhatsApp connection deleted successfully!",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage: "Are you sure? This action cannot be reversed.",
          disconnectTitle: "Disconnect",
          disconnectMessage: "Are you sure? You will need to scan the QR Code again.",
        },
        buttons: {
          add: "Add WhatsApp",
          disconnect: "disconnect",
          tryAgain: "Try again",
          qrcode: "QR CODE",
          newQr: "New QR CODE",
          connecting: "Connecting",
        },
        toolTips: {
          disconnected: {
            title: "Failed to sign in to WhatsApp",
            content: "Make sure your cell phone is connected to the internet and try again, or request a new QR Code",
          },
          qrcode: {
            title: "Waiting to read QR Code",
            content: "Click the 'QR CODE' button and scan the QR Code with your cell phone to log in",
          },
          connected: {
            title: "Connection established!",
          },
          timeout: {
            title: "Connection to cell phone was lost",
            content: "Make sure your mobile is connected to the internet and WhatsApp is open, or click the 'Disconnect' button to get a new QR Code",
          },
        },
        table: {
          id: "Instance ID",
          name: "Name",
          number: "Number",
          status: "Status",
          lastUpdate: "Last update",
          default: "Default",
          actions: "Actions",
          session: "Session",
        },
      },
      whatsappModal: {
        title: {
          add: "Add WhatsApp",
          edit: "Edit WhatsApp",
        },
        form: {
          name: "Name",
          default: "Default",
          display: "Display sector time",
          farewellMessage: "Farewell Message"
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "WhatsApp saved successfully.",
      },
      qrCode: {
        message: "Read the QRCode to start the session",
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
          importMessage: "Do you want to import all phone contacts?",
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
          email: "Email",
          actions: "Actions",
        },
      },
      contactModal: {
        title: {
          add: "Add contact",
          edit: "Edit Contact",
        },
        form: {
          mainInfo: "Contact Data",
          extraInfo: "Additional Information",
          name: "Name",
          number: "WhatsApp number",
          email: "Email",
          extraName: "Field name",
          extraValue: "Value",
        },
        buttons: {
          addExtraInfo: "Add information",
          okAdd: "Addnar",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "Contact saved successfully.",
      },
      quickAnswersModal: {
        title: {
          add: "Add Quick Reply",
          edit: "Edit Quick Reply",
        },
        form: {
          shortcut: "Shortcut",
          message: "Quick Reply",
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "Quick Reply saved successfully.",
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
          deleteTitle: "Delete",
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
          greetingMessage: "Greeting Message",
          startWork: "Opening",
          endWork: "Closing",
          absenceMessage: "Absence Message",
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
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
          whatsapp: "Standard Connection",
          user: "Attendant",
          startWork: "Start",
          endWork: "Finish"
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "Attendant saved successfully.",
      },
      chat: {
        noTicketMessage: "Select a ticket to start chatting.",
      },
      uploads: {
        titles: {
          titleUploadMsgDragDrop: "⬇️ DRAG AND DROP FILES INTO THE FIELD BELOW ⬇️",
          titleFileList: "List of file(s)"
        },
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
          deleted: "The ticket you were on has been deleted.",
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
          placeholder: "Fetch tickets and messages",
        },
        buttons: {
          showAll: "All",
        },
      },
      transferTicketModal: {
        title: "Transfer Ticket",
        fieldLabel: "Enter to search for an attendant",
        fieldConnectionLabel: "Transfer to connection",
        fieldQueueLabel: "Transfer to Sector",
        fieldConnectionPlaceholder: "Select a connection",
        noOptions: "No attendant found with that name",
        buttons: {
          ok: "Transfer",
          cancel: "Cancel",
        },
      },
      ticketsList: {
        pendingHeader: "Waiting",
        assignedHeader: "Assigned",
        noTicketsTitle: "Nothing here!",
        noTicketsMessage: "No tickets found with this status or search term",
        connectionTitle: "Connection currently being used.",
        items: {
          queueless: "Without Sector",
          accept: "Accept",
          spy: "Spy",
          close: "Close",
          reopen: "Reopen",
          return: "Move to waiting"
        },
        buttons: {
          accept: "Reply",
          acceptBeforeBot: "Accept",
          start: "start",
          cancel: "Cancel"
        },
        acceptModal: {
          title: "Accept Chat",
          queue: "Select sector"
        },
      },
      newTicketModal: {
        title: "Create Ticket",
        fieldLabel: "Enter to search for contact",
        add: "Add",
        buttons: {
          ok: "Save",
          cancel: "Cancel",
        },
      },
      mainDrawer: {
        listItems: {
          dashboard: "Dashboard",
          connections: "Connections",
          tickets: "Tickets",
          contacts: "Contacts",
          quickAnswers: "Quick Answers",
          tags: "Tags",
          queues: "Sectors",
          administration: "Administration",
          users: "Attendants",
          settings: "Settings",
          sendMsg: "Sending Messages",
          sendMedia: "Sending Media",
          api: "API Usage",
          apidocs: "Documentation",
          apititle: "API",
          apikey: "API Key",
          token: "Token"
        },
        appBar: {
          user: {
            profile: "Profile",
            logout: "Logout",
          },
        },
      },
      notifications: {
        noTickets: "No notifications.",
      },
      queues: {
        title: "Sectors",
        notifications: {
          queueDeleted: "The sector has been deleted.",
        },
        table: {
          name: "Name",
          color: "Color",
          greeting: "Greeting message",
          actions: "Actions",
          startWork: "Opening",
          endWork: "Closing",
        },
        buttons: {
          add: "Add sector",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage: "Are you sure? This action cannot be reversed! Tickets from this sector will still exist, but will no longer have any sectors assigned.",
        },
      },
      queueSelect: {
        inputLabel: "Sectors",
      },
      quickAnswers: {
        title: "Quick Answers",
        table: {
          shortcut: "Shortcut",
          message: "Quick Reply",
          actions: "Actions",
        },
        buttons: {
          add: "Add Quick Reply",
          deleteAll: "Delete All Quick Replies",
        },
        toasts: {
          deleted: "Quick Reply deleted successfully.",
          deletedAll: "All Quick Replies deleted.",
        },
        searchPlaceholder: "Search...",
        confirmationModal: {
          deleteTitle: "Are you sure you want to delete this Quick Reply: ",
          deleteAllTitle: "Are you sure you want to delete all Quick Replies?",
          deleteMessage: "This action cannot be reversed.",
          deleteAllMessage: "This action cannot be reversed.",
        },
      },
      users: {
        title: "Attendants",
        table: {
          name: "Name",
          email: "Email",
          profile: "Profile",
          whatsapp: "Standard Connection",
          startWork: "Start time",
          endWork: "End Time",
          actions: "Actions",
        },
        buttons: {
          add: "Add Attendant",
        },
        toasts: {
          deleted: "Attendant deleted successfully.",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage: "All agent data will be lost. Open tickets for this agent will be moved to hold.",
        },
      },
      settings: {
        success: "Settings saved successfully.",
        title: "Settings",
        settings: {
          userCreation: {
            name: "Creating Attendant",
            note: "Allow attendant creation",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          allTicket: {
            name: "Everyone can see the ticket without department",
            note: "Activate this function to let all users see tickets without sector",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          CheckMsgIsGroup: {
            name: "Ignore Group Messages",
            note: "If you disable it, you will receive messages from groups.",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          call: {
            name: "Accept calls",
            note: "If disabled, the customer will receive a message that they do not accept voice/video calls",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          sideMenu: {
            name: "Home Side Menu",
            note: "If enabled, the side menu will start closed",
            options: {
              enabled: "Open",
              disabled: "Closed",
            },
          },
          closeTicketApi: {
            name: "Close Ticket sent API",
            note: "Automatically closes ticket when submitted via API",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          darkMode: {
            name: "Enable Dark Mode",
            note: "Switch between light mode and dark mode",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
          timeCreateNewTicket: {
            name: "Create new ticket after",
            note: "Select the time it will take to openlaugh a new ticket, in case the customer gets in touch again",
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
      },
      messagesList: {
        header: {
          assignedTo: "Assignee:",
          buttons: {
            return: "Return",
            resolve: "Solve",
            reopen: "Reopen",
            accept: "Accept",
          },
        },
      },
      messagesInput: {
        placeholderOpen: "Enter a message",
        placeholderClosed: "Reopen or accept this ticket to send a message.",
        signMessage: "Subscribe",
      },
      contactDrawer: {
        header: "Contact Data",
        buttons: {
          edit: "Edit Contact",
        },
        extraInfo: "Other information",
      },
      copyToClipboard: {
        copy: "Copy",
        copied: "Copied"
      },
      ticketOptionsMenu: {
        delete: "Delete",
        transfer: "Transfer",
        confirmationModal: {
          title: "Delete the ticket",
          titleFrom: "from contact",
          message: "Attention! All messages related to the ticket will be lost.",
        },
        buttons: {
          delete: "Delete",
          cancel: "Cancel",
        },
      },
      confirmationModal: {
        buttons: {
          confirm: "Okay",
          cancel: "Cancel",
        },
      },
      messageOptionsMenu: {
        delete: "Delete",
        reply: "Reply",
        confirmationModal: {
          title: "Delete message?",
          message: "This action cannot be reversed.",
        },
      },
      backendErrors: {
        ERR_NO_OTHER_WHATSAPP: "There must be at least one default WhatsApp.",
        ERR_NO_DEF_WAPP_FOUND: "No default WhatsApp found. Check connections page.",
        ERR_WAPP_NOT_INITIALIZED: "This WhatsApp session was not initialized. Please check the connections page.",
        ERR_WAPP_CHECK_CONTACT: "Could not verify WhatsApp contact. Please check connections page",
        ERR_WAPP_INVALID_CONTACT: "This is not a valid Whatsapp number.",
        ERR_WAPP_DOWNLOAD_MEDIA: "Unable to download media from WhatsApp. Please check connections page.",
        ERR_INVALID_CREDENTIALS: "Authentication error. Please try again.",
        ERR_SENDING_WAPP_MSG: "Error sending WhatsApp message. Check connections page.",
        ERR_DELETE_WAPP_MSG: "Unable to delete WhatsApp message.",
        ERR_OTHER_OPEN_TICKET: "There is already an open ticket for this contact.",
        ERR_SESSION_EXPIRED: "Session expired. Please sign in.",
        ERR_USER_CREATION_DISABLED: "Creation of the attendant has been disabled by the administrator.",
        ERR_NO_PERMISSION: "You do not have permission to access this resource.",
        ERR_DUPLICATED_CONTACT: "A contact with this number already exists.",
        ERR_NO_SETTING_FOUND: "No settings found with this ID.",
        ERR_NO_CONTACT_FOUND: "No contact found with this ID.",
        ERR_NO_TICKET_FOUND: "No tickets found with this ID.",
        ERR_NO_USER_FOUND: "No attendant found with this ID.",
        ERR_NO_WAPP_FOUND: "No WhatsApp found with this ID.",
        ERR_CREATING_MESSAGE: "Error creating message in database.",
        ERR_CREATING_TICKET: "Error creating ticket in database.",
        ERR_FETCH_WAPP_MSG: "Error fetching message on WhatsApp, it may be too old.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS: "This color is already in use, choose another one.",
        ERR_WAPP_GREETING_REQUIRED: "The greeting message is required when there is more than one Sector.",
        ERR_USER_CREATION_COUNT: "Attendant limit reached, contact support to change.",
        ERR_CONNECTION_CREATION_COUNT: "Connection limit reached, contact support to change.",
        ERR_NO_TAG_FOUND: "Tag not found.",
        ERR_OUT_OF_HOURS: "Out of Office Hours!",
      },
    },
  },
};

export { messages };
