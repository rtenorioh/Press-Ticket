const messages = {
  fr: {
    translations: {
      auth: {
        toasts: {
          success: "Connexion réussie!",
        },
      },
      chat: {
        noTicketMessage: "Sélectionnez un ticket pour commencer à discuter.",
      },
      confirmationModal: {
        buttons: {
          confirm: "Ok",
          cancel: "Annuler",
        },
      },
      connections: {
        title: "Canaux",
        toasts: {
          deleted: "Canal supprimé avec succès!",
        },
        confirmationModal: {
          deleteTitle: "Supprimer",
          deleteMessage: "Êtes-vous sûr? Cette action ne peut pas être annulée.",
          disconnectTitle: "Déconnecter",
          disconnectMessage: "Êtes-vous sûr? Vous devrez scanner à nouveau le code QR.",
        },
        buttons: {
          add: "Ajouter",
          shutdown: "Supprimer",
          restart: "Redémarrer",
          disconnect: "Déconnecter",
          tryAgain: "Réessayer",
          qrcode: "QR CODE",
          newQr: "Nouveau QR CODE",
          connecting: "Connexion en cours",
        },
        toolTips: {
          disconnected: {
            title: "Échec de la connexion au WhatsApp",
            content: "Assurez-vous que votre téléphone est connecté à Internet et réessayez, ou demandez un nouveau code QR.",
          },
          qrcode: {
            title: "En attente du scan du code QR",
            content: "Cliquez sur le bouton 'QR CODE' et scannez le code QR avec votre téléphone pour démarrer la session.",
          },
          connected: {
            title: "Connexion établie!",
          },
          timeout: {
            title: "La connexion avec le téléphone a été perdue",
            content: "Assurez-vous que votre téléphone est connecté à Internet et que WhatsApp est ouvert, ou cliquez sur 'Déconnecter' pour obtenir un nouveau code QR.",
          },
        },
        table: {
          id: "ID",
          channel: "Canal",
          name: "Nom",
          color: "Couleur",
          number: "Numéro",
          status: "Statut",
          lastUpdate: "Dernière mise à jour",
          default: "Par défaut",
          actions: "Actions",
          session: "Session",
        },
      },
      contactModal: {
        title: {
          add: "Ajouter un contact",
          edit: "Modifier le contact",
        },
        form: {
          mainInfo: "Informations du contact",
          extraInfo: "Informations supplémentaires",
          name: "Nom",
          number: "Numéro WhatsApp",
          email: "E-mail",
          address: "Adresse",
          extraName: "Nom du champ",
          extraValue: "Valeur",
        },
        buttons: {
          addExtraInfo: "Ajouter une information",
          okAdd: "Ajouter",
          okEdit: "Sauvegarder",
          cancel: "Annuler",
        },
        success: "Contact sauvegardé avec succès.",
      },
      contacts: {
        title: "Contacts",
        toasts: {
          deleted: "Contact supprimé avec succès!",
          deletedAll: "Tous les contacts ont été supprimés avec succès!",
        },
        errors: {
          "ticketAlreadyOpen": "Il existe déjà un ticket ouvert pour ce contact, attribué à {{atendente}}."
        },
        searchPlaceholder: "Rechercher...",
        confirmationModal: {
          deleteTitle: "Supprimer ",
          deleteAllTitle: "Supprimer tous",
          importTitle: "Importer des contacts",
          deleteMessage: "Êtes-vous sûr de vouloir supprimer ce contact? Tous les tickets associés seront perdus.",
          deleteAllMessage: "Êtes-vous sûr de vouloir supprimer tous les contacts? Tous les tickets associés seront perdus.",
          importMessage: "Souhaitez-vous importer tous les contacts du téléphone?",
        },
        buttons: {
          import: "Importer des contacts",
          add: "Ajouter un contact",
          export: "Exporter des contacts",
          delete: "Supprimer tous les contacts"
        },
        table: {
          name: "Nom",
          whatsapp: "WhatsApp",
          address: "Adresse",
          channels: "Canaux",
          actions: "Actions",
        },
      },
      contactDrawer: {
        header: "Données du contact",
        buttons: {
          edit: "Modifier le contact",
        },
        extraInfo: "Autres informations",
      },
      copyToClipboard: {
        copy: "Copier",
        copied: "Copié"
      },
      dashboard: {
        messages: {
          inAttendance: {
            title: "En cours"
          },
          waiting: {
            title: "En attente"
          },
          closed: {
            title: "Fermé"
          }
        },
        charts: {
          perDay: {
            title: "Tickets par jour: ",
          },
          date: {
            title: "Filtrer"
          }
        },
        chartPerUser: {
          title: "Tickets par utilisateur",
          ticket: "Ticket",
          date: {
            title: "Filtrer"
          }
        },
        chartPerConnection: {
          date: {
            title: "Filtrer"
          },
          perConnection: {
            title: "Tickets par canal"
          }
        },
        chartPerQueue: {
          date: {
            title: "Filtrer"
          },
          perQueue: {
            title: "Tickets par secteur"
          }
        },
        newContacts: {
          contact: "Contacts",
          date: {
            start: "Date de début",
            end: "Date de fin"
          },
          title: "Nouveaux contacts par jour"
        },
        contactsWithTickets: {
          message: "Aucun contact trouvé pour cette date.",
          unique: "Contact unique",
          date: {
            start: "Date de début",
            end: "Date de fin"
          },
          title: "Contacts ayant ouvert des tickets pendant la période"
        },
        tags: {
          cloudTitle: "Tags: ",
          noTags: "Aucun tag pour le moment!"
        }
      },
      forgotPassword: {
        title: "Mot de passe oublié?",
        form: {
          email: "Entrez votre e-mail"
        },
        buttons: {
          submit: "Envoyer le lien de réinitialisation",
          backToLogin: "Retour à la connexion"
        },
        success: "Si un e-mail valide a été trouvé, un lien de réinitialisation du mot de passe a été envoyé!",
        error: {
          invalidEmail: "Veuillez entrer une adresse e-mail valide.",
          generic: "Erreur lors de la demande de réinitialisation du mot de passe. Veuillez réessayer plus tard."
        }
      },
      integrations: {
        success: "Intégration enregistrée avec succès.",
        title: "Intégrations",
        integrations: {
          openai: {
            title: "OpenAI",
            organization: "ID de l'organisation",
            apikey: "Clé API"
          },
          n8n: {
            title: "N8N",
            urlApiN8N: "URL API N8N"
          },
          hub: {
            title: "Notificame Hub",
            hubToken: "Jeton"
          },
          maps: {
            title: "API Google Maps",
            apiMaps: "Clé API"
          }
        },
      },
      login: {
        title: "Connectez-vous maintenant",
        form: {
          email: "Entrez votre e-mail",
          password: "Entrez votre mot de passe",
        },
        buttons: {
          forgotPassword: "Mot de passe oublié?",
          submit: "Connexion",
          register: "Pas de compte? Inscrivez-vous!",
        },
      },
      mainDrawer: {
        listItems: {
          general: "Général",
          dashboard: "Tableau de bord",
          connections: "Canaux",
          tickets: "Tickets",
          contacts: "Contacts",
          quickAnswers: "Réponses rapides",
          tags: "Tags",
          queues: "Secteurs",
          administration: "Administration",
          users: "Agents",
          settings: "Paramètres",
          api: "Utilisation de l'API",
          apidocs: "Documentation",
          apititle: "API",
          apikey: "Clé API",
          token: "Jeton"
        },
        appBar: {
          message: {
            hi: "Bonjour",
            text: "Bienvenue dans le système."
          },
          user: {
            profile: "Profil",
            logout: "Déconnexion",
          },
        },
      },
      messageOptionsMenu: {
        edit: "Modifier",
        history: "Historique",
        delete: "Supprimer",
        reply: "Répondre",
        confirmationModal: {
          title: "Supprimer le message?",
          message: "Cette action est irréversible.",
        },
      },
      messageHistoryModal: {
        close: "Fermer",
        title: "Historique des modifications du message"
      },
      messagesList: {
        header: {
          assignedTo: "Assigné à:",
          buttons: {
            return: "Retourner",
            resolve: "Terminer",
            reopen: "Rouvrir",
            accept: "Accepter"
          },
        },
        message: {
          download: "Télécharger",
          ticketNumber: "#ticket:",
          voiceVideoLost: "Message vocal ou vidéo perdu à",
          deleted: "Message supprimé",
          edited: "Modifié",
        }
      },
      messagesInput: {
        placeholderOpen: "Tapez un message",
        placeholderClosed: "Rouvrez ou acceptez ce ticket pour envoyer un message.",
        signMessage: "Signer",
      },
      messageVariablesPicker: {
        label: "Variables disponibles",
        vars: {
          contactName: "Nom",
          user: "Agent",
          greeting: "Salutation",
          protocolNumber: "Protocole",
          date: "Date",
          hour: "Heure",
          ticket_id: "ID du ticket",
          queue: "Secteur",
          connection: "Canal"
        }
      },
      newTicketModal: {
        title: "Créer un ticket",
        fieldLabel: "Tapez pour rechercher un contact",
        add: "Ajouter",
        select: {
          none: "Sélectionnez",
          queue: "Sélectionner un secteur",
          channel: "Sélectionner un canal"
        },
        buttons: {
          ok: "Sauvegarder",
          cancel: "Annuler",
        },
      },
      newTicketModalContactPage: {
        title: "Créer un ticket",
        queue: "Sélectionnez un secteur",
        fieldLabel: "Tapez pour rechercher un contact",
        add: "Ajouter",
        buttons: {
          ok: "Sauvegarder",
          cancel: "Annuler",
        },
      },
      notifications: {
        allow: "Autoriser les notifications dans le navigateur?",
        noTickets: "Aucune notification.",
        permissionGranted: "Permission accordée.",
        permissionDenied: "Permission refusée.",
      },
      qrCode: {
        message: "Scannez le code QR pour démarrer la session",
      },
      queueModal: {
        title: {
          add: "Ajouter un secteur",
          edit: "Modifier un secteur",
        },
        notification: {
          title: "Secteur enregistré avec succès!",
        },
        form: {
          name: "Nom",
          color: "Couleur",
          greetingMessage: "Message de bienvenue",
          startWork: "Ouverture",
          endWork: "Fermeture",
          absenceMessage: "Message d'absence",
        },
        buttons: {
          okAdd: "Ajouter",
          okEdit: "Sauvegarder",
          cancel: "Annuler",
        },
      },
      queues: {
        title: "Secteurs",
        notifications: {
          queueDeleted: "Le secteur a été supprimé.",
        },
        table: {
          id: "ID",
          name: "Nom",
          color: "Couleur",
          greeting: "Message de bienvenue",
          actions: "Actions",
          startWork: "Ouverture",
          endWork: "Fermeture",
        },
        buttons: {
          add: "Ajouter un secteur",
        },
        confirmationModal: {
          deleteTitle: "Supprimer",
          deleteMessage: "Êtes-vous sûr? Cette action est irréversible! Les tickets de ce secteur continueront d'exister, mais n'auront plus de secteur attribué.",
        },
      },
      queueSelect: {
        inputLabel: "Secteurs",
      },
      quickAnswers: {
        title: "Réponses rapides",
        table: {
          shortcut: "Raccourci",
          message: "Réponse rapide",
          actions: "Actions",
        },
        buttons: {
          add: "Ajouter une réponse rapide",
          deleteAll: "Supprimer toutes les réponses rapides",
        },
        toasts: {
          deleted: "Réponse rapide supprimée avec succès.",
          deletedAll: "Toutes les réponses rapides ont été supprimées.",
        },
        searchPlaceholder: "Rechercher...",
        confirmationModal: {
          deleteTitle: "Êtes-vous sûr de vouloir supprimer cette réponse rapide : ",
          deleteAllTitle: "Êtes-vous sûr de vouloir supprimer toutes les réponses rapides?",
          deleteMessage: "Cette action est irréversible.",
          deleteAllMessage: "Cette action est irréversible.",
        },
      },
      quickAnswersModal: {
        title: {
          add: "Ajouter une réponse rapide",
          edit: "Modifier une réponse rapide",
        },
        form: {
          shortcut: "Raccourci",
          message: "Réponse rapide",
        },
        buttons: {
          okAdd: "Ajouter",
          okEdit: "Sauvegarder",
          cancel: "Annuler",
        },
        success: "Réponse rapide enregistrée avec succès.",
      },
      resetPassword: {
        title: "Réinitialiser le mot de passe",
        form: {
          password: "Nouveau mot de passe",
          confirmPassword: "Confirmez le nouveau mot de passe",
        },
        buttons: {
          submit: "Réinitialiser le mot de passe",
          backToLogin: "Retour à la connexion",
        },
        success: "Mot de passe réinitialisé avec succès!",
        error: {
          passwordMismatch: "Les mots de passe ne correspondent pas.",
          generic: "Erreur lors de la réinitialisation du mot de passe. Veuillez réessayer.",
        },
      },
      settings: {
        success: "Paramètres enregistrés avec succès.",
        tabs: {
          general: "Général",
          personalize: "Personnaliser",
          integrations: "Intégrations",
        },
        general: {
          userCreation: {
            name: "Création d'agent",
            note: "Permettre la création d'agent",
            options: {
              enabled: "Activé",
              disabled: "Désactivé",
            },
          },
          allTicket: {
            name: "Tout le monde peut voir les tickets sans secteur",
            note: "Activez cette fonction pour permettre à tous les utilisateurs de voir les tickets sans secteur",
            options: {
              enabled: "Activé",
              disabled: "Désactivé",
            },
          },
          CheckMsgIsGroup: {
            name: "Ignorer les messages de groupe",
            note: "Si désactivé, vous recevrez des messages des groupes.",
            options: {
              enabled: "Activé",
              disabled: "Désactivé",
            },
          },
          call: {
            name: "Accepter les appels",
            note: "Si désactivé, le client recevra un message indiquant que les appels vocaux/vidéo ne sont pas acceptés",
            options: {
              enabled: "Activé",
              disabled: "Désactivé",
            },
          },
          sideMenu: {
            name: "Menu latéral initial",
            note: "Si activé, le menu latéral s'ouvrira fermé",
            options: {
              enabled: "Ouvert",
              disabled: "Fermé",
            },
          },
          quickAnswer: {
            name: "Réponses rapides",
            note: "Si activé, vous pouvez éditer les réponses rapides",
            options: {
              enabled: "Activé",
              disabled: "Désactivé",
            },
          },
          closeTicketApi: {
            name: "Fermer le ticket envoyé par API",
            note: "Ferme automatiquement le ticket lorsqu'il est envoyé via l'API",
            options: {
              enabled: "Activé",
              disabled: "Désactivé",
            },
          },
          darkMode: {
            name: "Activer le mode sombre",
            note: "Alterner entre le mode clair et le mode sombre",
            options: {
              enabled: "Activé",
              disabled: "Désactivé",
            },
          },
          ASC: {
            name: "Tri des tickets (ASC ou DESC)",
            note: "Si activé, les tickets seront triés par ordre croissant (ASC), sinon par ordre décroissant (DESC)",
            options: {
              enabled: "Activé",
              disabled: "Désactivé",
            },
          },
          created: {
            name: "Tri des tickets (createdAt ou updateAt)",
            note: "Si activé, trié par date de création (createdAt), sinon par date de mise à jour (updateAt)",
            options: {
              enabled: "Activé",
              disabled: "Désactivé",
            },
          },
          openTickets: {
            name: "Empêcher plusieurs tickets pour un même contact",
            note: "Si activé, empêche l'ouverture de tickets pour les contacts ayant déjà un ticket ouvert",
            options: {
              enabled: "Activé",
              disabled: "Désactivé",
            },
          },
          timeCreateNewTicket: {
            name: "Nouveau ticket dans :",
            note: "Sélectionnez le temps nécessaire pour ouvrir un nouveau ticket si le client contacte à nouveau",
            options: {
              "10": "10 secondes",
              "30": "30 secondes",
              "60": "1 minute",
              "300": "5 minutes",
              "1800": "30 minutes",
              "3600": "1 heure",
              "7200": "2 heures",
              "21600": "6 heures",
              "43200": "12 heures",
              "86400": "24 heures",
              "604800": "7 jours",
              "1296000": "15 jours",
              "2592000": "30 jours",
            },
          },
        },
        personalize: {
          success: {
            company: "Données de l'entreprise enregistrées avec succès!",
            logos: "Logos enregistrés avec succès!",
            colors: "Couleurs enregistrées avec succès!",
          },
          error: {
            invalid: "Erreur lors de la récupération des personnalisations.",
            company: "Erreur lors de l'enregistrement des données de l'entreprise.",
            logos: "Erreur lors de l'enregistrement du logo.",
            logs: "Erreur lors de l'enregistrement de la personnalisation :",
            colors: "Erreur lors de l'enregistrement des couleurs du thème : ",
          },
          tabs: {
            data: "Données",
            logos: "Logos",
            colors: "Couleurs",
          },
          tabpanel: {
            company: "Entreprise",
            url: "URL",
            light: "Thème clair",
            dark: "Thème sombre",
            input: {
              primary: "Couleur principale",
              secondary: "Couleur secondaire",
              default: "Fond par défaut",
              paper: "Fond papier",
            },
            button: {
              save: "Sauvegarder",
              saveLight: "Enregistrer le thème clair",
              saveDark: "Enregistrer le thème sombre",
            },
          },
        },
      },
      signup: {
        title: "Inscrivez-vous",
        toasts: {
          success: "Agent créé avec succès ! Connectez-vous !!!.",
          fail: "Erreur lors de la création de l'agent. Vérifiez les données saisies.",
        },
        form: {
          name: "Nom",
          email: "E-mail",
          password: "Mot de passe",
        },
        buttons: {
          submit: "S'inscrire",
          login: "Vous avez déjà un compte ? Connectez-vous !",
        },
      },
      tags: {
        title: "Tags",
        table: {
          name: "Tags",
          color: "Couleur",
          contacts: "Contacts",
          actions: "Action",
        },
        toasts: {
          deleted: "Tag supprimé avec succès !",
          deletedAll: "Tous les tags ont été supprimés avec succès !",
        },
        buttons: {
          add: "Ajouter",
          deleteAll: "Supprimer tout",
        },
        confirmationModal: {
          deleteTitle: "Supprimer ",
          deleteAllTitle: "Supprimer tout",
          deleteMessage: "Êtes-vous sûr de vouloir supprimer ce tag ?",
          deleteAllMessage: "Êtes-vous sûr de vouloir supprimer tous les tags ?",
        },
      },
      tagModal: {
        title: {
          add: "Ajouter un tag",
          edit: "Modifier un tag",
        },
        buttons: {
          okAdd: "Sauvegarder",
          okEdit: "Modifier",
          cancel: "Annuler",
        },
        form: {
          name: "Nom du tag",
          color: "Couleur du tag",
        },
        success: "Tag enregistré avec succès !",
      },
      ticketsManager: {
        buttons: {
          newTicket: "Nouveau",
        },
      },
      ticketsQueueSelect: {
        placeholder: "Secteurs",
      },
      tickets: {
        toasts: {
          deleted: "Le ticket que vous suiviez a été supprimé.",
        },
        notification: {
          message: "Message de",
        },
        tabs: {
          open: { title: "Boîte de réception" },
          closed: { title: "Terminés" },
          search: { title: "Recherche" },
        },
        search: {
          placeholder: "Rechercher des tickets et des messages",
        },
        buttons: {
          showAll: "Tous",
        },
      },
      transferTicketModal: {
        title: "Transférer un ticket",
        fieldLabel: "Tapez pour rechercher un agent",
        fieldConnectionLabel: "Sélectionner un canal",
        fieldQueueLabel: "Transférer au secteur",
        fieldConnectionPlaceholder: "Sélectionnez un canal",
        noOptions: "Aucun agent trouvé avec ce nom",
        buttons: {
          ok: "Transférer",
          cancel: "Annuler",
        },
      },
      ticketsList: {
        pendingHeader: "En attente",
        assignedHeader: "En cours",
        noTicketsTitle: "Rien ici !",
        noTicketsMessage: "Aucun ticket trouvé avec ce statut ou ce terme recherché",
        connectionTitle: "Canal actuellement utilisé.",
        items: {
          queueless: "Sans secteur",
          accept: "Accepter",
          spy: "Espionner",
          close: "Clôturer",
          reopen: "Rouvrir",
          return: "Déplacer en attente",
          connection: "Canal",
          user: "Agent",
          queue: "Secteur",
          tags: "Tags",
        },
        buttons: {
          accept: "Répondre",
          acceptBeforeBot: "Accepter",
          start: "Commencer",
          cancel: "Annuler",
        },
        acceptModal: {
          title: "Accepter le chat",
          queue: "Sélectionner un secteur",
        },
        errors: {
          ticketAlreadyOpen: "Un ticket est déjà ouvert pour ce contact avec l'agent {{atendente}}.",
        },
      },
      ticketOptionsMenu: {
        delete: "Supprimer",
        transfer: "Transférer",
        confirmationModal: {
          title: "Supprimer le ticket ",
          titleFrom: "du contact ",
          message: "Attention ! Tous les messages liés au ticket seront perdus.",
        },
        buttons: {
          delete: "Supprimer",
          cancel: "Annuler",
        },
      },
      uploads: {
        titles: {
          titleUploadMsgDragDrop: "⬇️ GLISSEZ ET DÉPOSEZ DES FICHIERS CI-DESSOUS ⬇️",
          titleFileList: "Liste des fichiers",
        },
      },
      users: {
        title: "Agents",
        table: {
          id: "ID",
          name: "Nom",
          email: "E-mail",
          profile: "Profil",
          whatsapp: "Canal",
          queue: "Secteur",
          startWork: "Heure de début",
          endWork: "Heure de fin",
          actions: "Actions",
        },
        buttons: {
          add: "Ajouter un agent",
        },
        modalTitle: {
          channel: "Canaux",
          queue: "Secteurs",
        },
        modalTable: {
          id: "ID",
          name: "Nom",
        },
        toasts: {
          deleted: "Agent supprimé avec succès.",
          updated: "Agent mis à jour avec succès.",
        },
        confirmationModal: {
          deleteTitle: "Supprimer",
          deleteMessage: "Toutes les données de cet agent seront perdues. Les tickets ouverts de cet agent seront déplacés en attente.",
        },
      },
      userModal: {
        title: {
          add: "Ajouter un agent",
          edit: "Modifier un agent",
        },
        form: {
          name: "Nom",
          email: "E-mail",
          password: "Mot de passe",
          profile: "Profil",
          admin: "Administrateur",
          user: "Agent",
          startWork: "Début",
          endWork: "Fin",
          isTricked: "Voir les contacts",
          enabled: "Activé",
          disabled: "Désactivé",
        },
        buttons: {
          okAdd: "Ajouter",
          okEdit: "Sauvegarder",
          cancel: "Annuler",
        },
        success: "Agent enregistré avec succès.",
      },
      whatsappModal: {
        title: {
          add: "Ajouter WhatsApp",
          edit: "Modifier WhatsApp",
        },
        form: {
          name: "Nom",
          default: "Défaut",
          display: "Afficher les horaires des secteurs",
          farewellMessage: "Message d'au revoir",
        },
        buttons: {
          okAdd: "Ajouter",
          okEdit: "Sauvegarder",
          cancel: "Annuler",
        },
        success: "WhatsApp enregistré avec succès.",
      },
      whatsappSelect: {
        inputLabel: "Canaux",
      },
      backendErrors: {
        ERR_CREATING_MESSAGE: "Erreur lors de la création du message dans la base de données.",
        ERR_CREATING_TICKET: "Erreur lors de la création du ticket dans la base de données.",
        ERR_CONNECTION_CREATION_COUNT: "Limite de canaux atteinte, contactez le support pour modifier.",
        ERR_DELETE_WAPP_MSG: "Impossible de supprimer le message WhatsApp.",
        ERR_DUPLICATED_CONTACT: "Un contact avec ce numéro existe déjà.",
        ERR_EDITING_WAPP_MSG: "Impossible de modifier le message WhatsApp.",
        ERR_FETCH_WAPP_MSG: "Erreur lors de la récupération du message sur WhatsApp, peut-être trop ancien.",
        ERR_INVALID_CREDENTIALS: "Erreur d'authentification. Veuillez réessayer.",
        ERR_NO_CONTACT_FOUND: "Aucun contact trouvé avec cet ID.",
        ERR_NO_DEF_WAPP_FOUND: "Aucun WhatsApp par défaut trouvé. Vérifiez la page des canaux.",
        ERR_NO_INTEGRATION_FOUND: "Intégration introuvable.",
        ERR_NO_PERMISSION: "Vous n'avez pas la permission d'accéder à cette ressource.",
        ERR_NO_SETTING_FOUND: "Aucun paramètre trouvé avec cet ID.",
        ERR_NO_TAG_FOUND: "Tag introuvable.",
        ERR_NO_TICKET_FOUND: "Aucun ticket trouvé avec cet ID.",
        ERR_NO_USER_FOUND: "Aucun agent trouvé avec cet ID.",
        ERR_NO_WAPP_FOUND: "Aucun WhatsApp trouvé avec cet ID.",
        ERR_NO_OTHER_WHATSAPP: "Il doit y avoir au moins un WhatsApp par défaut.",
        ERR_OUT_OF_HOURS: "Hors des heures de travail !",
        ERR_OPEN_USER_TICKET: "Un ticket est déjà ouvert pour ce contact avec ",
        ERR_OTHER_OPEN_TICKET: "Un ticket est déjà ouvert pour ce contact.",
        ERR_SESSION_EXPIRED: "Session expirée. Veuillez vous connecter.",
        ERR_SENDING_WAPP_MSG: "Erreur lors de l'envoi du message WhatsApp. Vérifiez la page des canaux.",
        ERR_USER_CREATION_COUNT: "Limite d'agents atteinte, contactez le support pour modifier.",
        ERR_USER_CREATION_DISABLED: "La création d'agent a été désactivée par l'administrateur.",
        ERR_WAPP_CHECK_CONTACT: "Impossible de vérifier le contact WhatsApp. Vérifiez la page des canaux.",
        ERR_WAPP_DOWNLOAD_MEDIA: "Impossible de télécharger le média depuis WhatsApp. Vérifiez la page des canaux.",
        ERR_WAPP_GREETING_REQUIRED: "Le message d'accueil est obligatoire lorsqu'il y a plus d'un secteur.",
        ERR_WAPP_INVALID_CONTACT: "Ce n'est pas un numéro WhatsApp valide.",
        ERR_WAPP_NOT_INITIALIZED: "Cette session WhatsApp n'a pas été initialisée. Vérifiez la page des canaux.",
        ERR_WAPP_SESSION_EXPIRED: "Session WhatsApp expirée.",
      },
    },
  },
};

export { messages };                        