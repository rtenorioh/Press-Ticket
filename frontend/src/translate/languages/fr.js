const messages = {
    fr: {
        translations: {
            auth: {
                toasts: {
                    success: "Connexion réussie !"
                }
            },
            chat: {
                noTicketMessage: "Sélectionnez un ticket pour commencer à discuter."
            },
            confirmationModal: {
                buttons: {
                    confirm: "Ok",
                    cancel: "Annuler"
                }
            },
            connections: {
                title: "Connexions",
                toasts: {
                    deleted: "Connexion WhatsApp supprimée avec succès !"
                },
                confirmationModal: {
                    deleteTitle: "Supprimer",
                    deleteMessage: "Êtes-vous sûr ? Cette action ne peut pas être annulée.",
                    disconnectTitle: "Déconnecter",
                    disconnectMessage: "Êtes-vous sûr ? Vous devrez scanner à nouveau le QR Code."
                },
                buttons: {
                    add: "Ajouter WhatsApp",
                    shutdown: "Supprimer",
                    restart: "Redémarrer",
                    disconnect: "Déconnecter",
                    tryAgain: "Réessayer",
                    qrcode: "QR CODE",
                    newQr: "Nouveau QR CODE",
                    connecting: "Connexion en cours"
                },
                toolTips: {
                    disconnected: {
                        title: "Échec du démarrage de la session WhatsApp",
                        content: "Assurez-vous que votre téléphone est connecté à Internet et réessayez, ou demandez un nouveau QR Code."
                    },
                    qrcode: {
                        title: "En attente de la lecture du QR Code",
                        content: "Cliquez sur le bouton 'QR CODE' et scannez le QR Code avec votre téléphone pour démarrer la session."
                    },
                    connected: {
                        title: "Connexion établie !"
                    },
                    timeout: {
                        title: "La connexion avec le téléphone a été perdue",
                        content: "Assurez-vous que votre téléphone est connecté à Internet et que WhatsApp est ouvert, ou cliquez sur 'Déconnecter' pour obtenir un nouveau QR Code."
                    }
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
                    session: "Session"
                }
            },
            contactModal: {
                title: {
                    add: "Ajouter un contact",
                    edit: "Modifier un contact"
                },
                form: {
                    mainInfo: "Informations du contact",
                    extraInfo: "Informations supplémentaires",
                    name: "Nom",
                    number: "Numéro WhatsApp",
                    email: "E-mail",
                    extraName: "Nom du champ",
                    extraValue: "Valeur"
                },
                buttons: {
                    addExtraInfo: "Ajouter une information",
                    okAdd: "Ajouter",
                    okEdit: "Enregistrer",
                    cancel: "Annuler"
                },
                success: "Contact enregistré avec succès."
            },
            backendErrors: {
                ERR_CONNECTION_CREATION_COUNT: "Nombre maximum de connexions atteint. Veuillez contacter le support pour des modifications.",
                ERR_CREATING_MESSAGE: "Erreur lors de la création du message dans la base de données.",
                ERR_CREATING_TICKET: "Erreur lors de la création du ticket dans la base de données.",
                ERR_DELETE_WAPP_MSG: "Impossible de supprimer le message WhatsApp.",
                ERR_DUPLICATED_CONTACT: "Un contact avec ce numéro existe déjà.",
                ERR_EDITING_WAPP_MSG: "Impossible de modifier le message WhatsApp.",
                ERR_FETCH_WAPP_MSG: "Erreur lors de la récupération du message WhatsApp. Il est peut-être trop ancien.",
                ERR_INVALID_CREDENTIALS: "Identifiants incorrects. Veuillez réessayer.",
                ERR_NO_CONTACT_FOUND: "Aucun contact trouvé avec cet ID.",
                ERR_NO_DEF_WAPP_FOUND: "Aucun WhatsApp par défaut trouvé. Vérifiez la page des connexions.",
                ERR_NO_INTEGRATION_FOUND: "Intégration introuvable.",
                ERR_NO_OTHER_WHATSAPP: "Il doit y avoir au moins un WhatsApp par défaut.",
                ERR_NO_PERMISSION: "Vous n'avez pas la permission d'accéder à cette ressource.",
                ERR_NO_SETTING_FOUND: "Aucun paramètre trouvé avec cet ID.",
                ERR_NO_TAG_FOUND: "Tag introuvable.",
                ERR_NO_TICKET_FOUND: "Aucun ticket trouvé avec cet ID.",
                ERR_NO_USER_FOUND: "Aucun utilisateur trouvé avec cet ID.",
                ERR_NO_WAPP_FOUND: "Aucun WhatsApp trouvé avec cet ID.",
                ERR_OPEN_USER_TICKET: "Un ticket ouvert existe déjà pour ce contact avec",
                ERR_OTHER_OPEN_TICKET: "Un ticket ouvert existe déjà pour ce contact.",
                ERR_OUT_OF_HOURS: "Hors des heures d'ouverture !",
                ERR_QUEUE_COLOR_ALREADY_EXISTS: "Cette couleur est déjà utilisée. Veuillez en choisir une autre.",
                ERR_SENDING_WAPP_MSG: "Erreur lors de l'envoi du message WhatsApp. Vérifiez la page des connexions.",
                ERR_SESSION_EXPIRED: "Session expirée. Veuillez vous reconnecter.",
                ERR_USER_CREATION_COUNT: "Nombre maximum d'utilisateurs atteint. Veuillez contacter le support pour des modifications.",
                ERR_USER_CREATION_DISABLED: "La création d'utilisateur a été désactivée par l'administrateur.",
                ERR_WAPP_CHECK_CONTACT: "Impossible de vérifier le contact WhatsApp. Vérifiez la page des connexions.",
                ERR_WAPP_DOWNLOAD_MEDIA: "Impossible de télécharger les médias depuis WhatsApp. Vérifiez la page des connexions.",
                ERR_WAPP_GREETING_REQUIRED: "Un message de bienvenue est requis lorsqu'il y a plus d'une file d'attente.",
                ERR_WAPP_INVALID_CONTACT: "Ce n'est pas un numéro WhatsApp valide.",
                ERR_WAPP_NOT_INITIALIZED: "Cette session WhatsApp n'a pas été initialisée. Vérifiez la page des connexions.",
            },
        },
    },
};

export { messages };

