const messages = {
  he: {
    translations: {
      signup: {
        title: "הרשם",
        toasts: {
          success: "המשתמש נוצר בהצלחה! אנא התחבר!",
          fail: "שגיאה ביצירת משתמש. בדוק את הנתונים המדווחים.",
        },
        form: {
          name: "שם",
          email: "אימייל",
          password: "סיסמה",
        },
        buttons: {
          submit: "רישום",
          login: "כבר יש לך חשבון? התחבר!",
        },
      },
      login: {
        title: "התחבר",
        form: {
          email: "אמייל",
          password: "סיסמה",
        },
        buttons: {
          submit: "כניסה",
          register: "אין לך חשבון? הירשם!",
        },
      },
      auth: {
        toasts: {
          success: "התחברת בהצלחה!",
        },
      },
      dashboard: {
        charts: {
          perDay: {
            title: "פניות להיום: ",
          },
        },
        messages: {
          inAttendance: {
            title: "בתהליך"
          },
          waiting: {
            title: "ממתינים"
          },
          closed: {
            title: "סגור"
          }
        }
      },
      connections: {
        title: "חיבורים",
        toasts: {
          deleted: "חיבור WhatsApp נמחק בהצלחה!",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage: "Are you sure? It cannot be reverted.",
          disconnectTitle: "Disconnect",
          disconnectMessage: "Are you sure? You'll need to read QR Code again.",
        },
        buttons: {
          add: "Add WhatsApp",
          disconnect: "Disconnect",
          tryAgain: "Try Again",
          qrcode: "QR CODE",
          newQr: "New QR CODE",
          connecting: "Connectiing",
        },
        toolTips: {
          disconnected: {
            title: "Failed to start WhatsApp session",
            content:
              "Make sure your cell phone is connected to the internet and try again, or request a new QR Code",
          },
          qrcode: {
            title: "Waiting for QR Code read",
            content:
              "Click on 'QR CODE' button and read the QR Code with your cell phone to start session",
          },
          connected: {
            title: "Connection established",
          },
          timeout: {
            title: "Connection with cell phone has been lost",
            content:
              "Make sure your cell phone is connected to the internet and WhatsApp is open, or click on 'Disconnect' button to get a new QRcode",
          },
        },
        table: {
          name: "שם",
          status: "סטטוס",
          lastUpdate: "העדכון אחרון",
          default: "ברירת מחדל",
          actions: "פעולות",
          session: "חיבורים",
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
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "WhatsApp saved successfully.",
      },
      qrCode: {
        message: "Read QrCode to start the session",
      },
      contacts: {
        title: "אנשי קשר",
        toasts: {
          deleted: "איש הקשר נמחק בהצלחה!",
        },
        searchPlaceholder: "חיפוש...",
        confirmationModal: {
          deleteTitle: "מחיקה",
          importTitlte: "יבוא אשני קשר",
          deleteMessage:
            "האם אתה בטוח שברצונך למחוק איש קשר זה? כל הכרטיסים הקשורים יאבדו.",
          importMessage: "האם ברצונך לייבא את כל אנשי הקשר מהטלפון?",
        },
        buttons: {
          import: "ייבוא אנשי קשר",
          add: "הוסף איש קשר",
        },
        table: {
          name: "שם",
          whatsapp: "WhatsApp",
          email: "Email",
          actions: "פעולות",
        },
      },
      contactModal: {
        title: {
          add: "הוסף איש קשר",
          edit: "ערוך איש קשר",
        },
        form: {
          mainInfo: "Contact details",
          extraInfo: "Additional information",
          name: "Name",
          number: "Whatsapp number",
          email: "Email",
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
      quickAnswersModal: {
        title: {
          add: "הוסף תשובה מהירה",
          edit: "ערוך תשובה מהירה",
        },
        form: {
          shortcut: "קיצור",
          message: "תגובה מהירה",
        },
        buttons: {
          okAdd: "הוספה",
          okEdit: "שמירה",
          cancel: "ביטול",
        },
        success: "התשובה המהירה נשמרה בהצלחה.",
      },
      queueModal: {
        title: {
          add: "הוסף תור",
          edit: "ערוך תור",
        },
        form: {
          name: "שם",
          color: "צבע",
          greetingMessage: "הודעת שלום",
        },
        buttons: {
          okAdd: "הוספה",
          okEdit: "שמירה",
          cancel: "ביטול",
        },
      },
      userModal: {
        title: {
          add: "Add user",
          edit: "Edit user",
        },
        form: {
          name: "שם",
          email: "Email",
          password: "סיסמה",
          profile: "פרופיל",
        },
        buttons: {
          okAdd: "הוספה",
          okEdit: "שמירה",
          cancel: "ביטול",
        },
        success: "המשתמש נשמר בהצלחה.",
      },
      chat: {
        noTicketMessage: "בחר כרטיס כדי להתחיל בצ'אט.",
      },
      ticketsManager: {
        buttons: {
          newTicket: "חדש",
        },
      },
      ticketsQueueSelect: {
        placeholder: "תורים",
      },
      tickets: {
        toasts: {
          deleted: "הכרטיס שהיית בו נמחק.",
        },
        notification: {
          message: "הודעה מאת",
        },
        tabs: {
          open: { title: "נכנס" },
          closed: { title: "נסגר" },
          search: { title: "חיפוש" },
        },
        search: {
          placeholder: "חפש כרטיסים והודעות.",
        },
        buttons: {
          showAll: "הכל",
        },
      },
      transferTicketModal: {
        title: "העבר כרטיס",
        fieldLabel: "הקלד כדי לחפש משתמשים",
        fieldQueueLabel: "העברה לתור",
        fieldQueuePlaceholder: "אנא בחר תור",
        noOptions: "לא נמצא משתמש בשם זה",
        buttons: {
          ok: "העבר",
          cancel: "בטל",
        },
      },
      ticketsList: {
        pendingHeader: "תוֹר",
        assignedHeader: "עובד על",
        noTicketsTitle: "אין פה כלום!",
        noTicketsMessage: "לא נמצאו כרטיסים עם סטטוס או מונח חיפוש זה.",
        buttons: {
          accept: "אשר",
        },
      },
      newTicketModal: {
        title: "צור כרטיס",
        fieldLabel: "הקלד כדי לחפש איש קשר",
        add: "הוסף",
        buttons: {
          ok: "שמור",
          cancel: "בטל",
        },
      },
      mainDrawer: {
        listItems: {
          dashboard: "דף בית",
          connections: "חיבורים",
          tickets: "כרטיסים",
          contacts: "אנשי קשר",
          quickAnswers: "תשובות מהירות",
          queues: "תורים",
          administration: "ניהול",
          users: "משתמשים",
          settings: "הגדרות",
        },
        appBar: {
          user: {
            profile: "פרופיל",
            logout: "התנתק",
          },
        },
      },
      notifications: {
        noTickets: "אין התראות.",
      },
      queues: {
        title: "תורים",
        table: {
          name: "שם",
          color: "צבע",
          greeting: "הודעת שלום",
          actions: "פעולות",
        },
        buttons: {
          add: "הוסף תור",
        },
        confirmationModal: {
          deleteTitle: "מחיקה",
          deleteMessage:
            "האם אתה בטוח? אי אפשר להחזיר את זה! כרטיסים בתור זה עדיין יהיו קיימים, אך לא יוקצו להם תורים.",
        },
      },
      queueSelect: {
        inputLabel: "תורים",
      },
      quickAnswers: {
        title: "תשובות מהירות",
        table: {
          shortcut: "קיצור",
          message: "תגובה מהירה",
          actions: "פעולות",
        },
        buttons: {
          add: "הוסף תשובה מהירה",
        },
        toasts: {
          deleted: "תשובה מהירה נמחקה בהצלחה.",
        },
        searchPlaceholder: "חיפוש...",
        confirmationModal: {
          deleteTitle: "האם אתה בטוח שברצונך למחוק את התשובה המהירה הזו:",
          deleteMessage: "לא ניתן לבטל פעולה זו.",
        },
      },
      users: {
        title: "משתמשים",
        table: {
          name: "שם",
          email: "Email",
          profile: "פרופיל",
          actions: "פעולה",
        },
        buttons: {
          add: "הוסף משתמש",
        },
        toasts: {
          deleted: "המשתמש נמחק בהצלחה.",
        },
        confirmationModal: {
          deleteTitle: "מחק",
          deleteMessage:
            "כל נתוני המשתמש יאבדו. הכרטיסים הפתוחים של המשתמשים יועברו לתור.",
        },
      },
      settings: {
        success: "ההגדרות נשמרו בהצלחה.",
        title: "הגדרות",
        settings: {
          userCreation: {
            name: "יצירת משתמש",
            options: {
              enabled: "מאופשר",
              disabled: "לא מאופשר",
            },
          },

            timeCreateNewTicket: {
        name: "פרק זמן ליצירת כרטיס חדש",
        note: "בחר את הזמן שיידרש לפתיחת כרטיס חדש אם הלקוח ייצור איתך קשר שוב",
        options: {
          "10": "10 שניות",
          "30": "30 שניות",
          "60": "1 דקה",
          "300": "5 דקות",
          "1800" : "30 דקות",
          "3600" : "1 שעה",
          "7200" : "2 שעות",
          "21600" : "6 שעות",
          "43200" : "12 שעות",
        },
      },
      CheckMsgIsGroup: {
        name: "התעלם מהודעות קבוצתיות",
        options: {
          enabled: "מאופשר",
          disabled: "לא מאופשר",
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
        name: "תפריט צד",
        note: "אם מופעל, תפריט הצד יתחיל לסגור",
        options: {
          enabled: "פתוח",
          disabled: "סגור",
        },
      },
	          },
      },
      messagesList: {
        header: {
          assignedTo: "בטיפול של:",
          buttons: {
            return: "חזור",
            resolve: "סגור",
            reopen: "פתח מחדש",
            accept: "לאשר",
          },
        },
      },
      messagesInput: {
        placeholderOpen: "הקלד הודעה או הקש ''/'' כדי להשתמש בתגובות המהירות הרשומות",
        placeholderClosed: "פתח מחדש או קבל כרטיס זה כדי לשלוח הודעה.",
        signMessage: "שם נציג",
      },
      contactDrawer: {
        header: "פרטי איש קשר",
        buttons: {
          edit: "ערוך איש קשר",
        },
        extraInfo: "מידע אחר",
      },
      ticketOptionsMenu: {
        delete: "מחק",
        transfer: "העבר",
        confirmationModal: {
          title: "מחק כרטיס מס #",
          titleFrom: "מאת ",
          message: "שימו לב! כל ההודעות הקשורות לכרטיס יאבדו.",
        },
        buttons: {
          delete: "מחק",
          cancel: "בטל",
        },
      },
      confirmationModal: {
        buttons: {
          confirm: "Ok",
          cancel: "בטל",
        },
      },
      messageOptionsMenu: {
        delete: "מחק",
        reply: "השב",
        confirmationModal: {
          title: "למחוק הודעה?",
          message: "לא ניתן לבטל פעולה זו.",
        },
      },
      backendErrors: {
        ERR_NO_OTHER_WHATSAPP:
          "חייב להיות חיבור WhatsApp אחד לפחות.",
        ERR_NO_DEF_WAPP_FOUND:
          "לא נמצאה WhatsApp ברירת מחדל. בדוק את דף החיבורים.",
        ERR_WAPP_NOT_INITIALIZED:
          "הפעלת וואטסאפ זו אינה מאותחלת. בדוק את דף החיבורים.",
        ERR_WAPP_CHECK_CONTACT:
          "Could not check WhatsApp contact. Check connections page.",
        ERR_WAPP_INVALID_CONTACT: "This is not a valid whatsapp number.",
        ERR_WAPP_DOWNLOAD_MEDIA:
          "Could not download media from WhatsApp. Check connections page.",
        ERR_INVALID_CREDENTIALS: "Authentication error. Please try again.",
        ERR_SENDING_WAPP_MSG:
          "Error sending WhatsApp message. Check connections page.",
        ERR_DELETE_WAPP_MSG: "לא ניתן היה למחוק הודעה מוואטסאפ.",
        ERR_OTHER_OPEN_TICKET:
          "יש כבר כרטיס פתוח לאיש הקשר הזה.",
        ERR_SESSION_EXPIRED: "פג תוקף ההפעלה. אנא התחבר.",
        ERR_USER_CREATION_DISABLED:
          "User creation was disabled by administrator.",
        ERR_NO_PERMISSION: "אין לך הרשאה לגשת למשאב זה.",
        ERR_DUPLICATED_CONTACT: "איש קשר עם המספר הזה כבר קיים.",
        ERR_NO_SETTING_FOUND: "לא נמצאה הגדרה עם מזהה זה.",
        ERR_NO_CONTACT_FOUND: "לא נמצא איש קשר עם מזהה זה.",
        ERR_NO_TICKET_FOUND: "No ticket found with this ID.",
        ERR_NO_USER_FOUND: "No user found with this ID.",
        ERR_NO_WAPP_FOUND: "No WhatsApp found with this ID.",
        ERR_CREATING_MESSAGE: "Error while creating message on database.",
        ERR_CREATING_TICKET: "Error while creating ticket on database.",
        ERR_FETCH_WAPP_MSG:
          "Error fetching the message in WhtasApp, maybe it is too old.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS:
          "צבע זה כבר בשימוש, בחר אחד אחר.",
        ERR_WAPP_GREETING_REQUIRED:
          "נדרשת הודעת ברכה אם יש יותר מתור אחד.",
      },
    },
  },
};

export { messages };
