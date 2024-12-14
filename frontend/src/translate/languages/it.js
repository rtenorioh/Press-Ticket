const messages = {
    it: {
        translations: {
            "auth": {
                "toasts": {
                    "success": "Accesso effettuato con successo!"
                }
            },
            "chat": {
                "noTicketMessage": "Seleziona un ticket per iniziare a chattare."
            },
            "confirmationModal": {
                "buttons": {
                    "confirm": "OK",
                    "cancel": "Annulla"
                }
            },
            "connections": {
                "title": "Connessioni",
                "toasts": {
                    "deleted": "Connessione WhatsApp eliminata con successo!"
                },
                "confirmationModal": {
                    "deleteTitle": "Elimina",
                    "deleteMessage": "Sei sicuro? Questa azione non può essere annullata.",
                    "disconnectTitle": "Disconnetti",
                    "disconnectMessage": "Sei sicuro? Dovrai scansionare nuovamente il QR Code."
                },
                "buttons": {
                    "add": "Aggiungi WhatsApp",
                    "shutdown": "Elimina",
                    "restart": "Riavvia",
                    "disconnect": "Disconnetti",
                    "tryAgain": "Riprova",
                    "qrcode": "QR CODE",
                    "newQr": "NUOVO QR CODE",
                    "connecting": "Connessione in corso"
                },
                "toolTips": {
                    "disconnected": {
                        "title": "Errore nell'avvio della sessione WhatsApp",
                        "content": "Assicurati che il tuo cellulare sia connesso a Internet e riprova, oppure richiedi un nuovo QR Code."
                    },
                    "qrcode": {
                        "title": "In attesa di lettura del QR Code",
                        "content": "Fai clic sul pulsante 'QR CODE' e scansiona il QR Code con il tuo cellulare per avviare la sessione."
                    },
                    "connected": {
                        "title": "Connessione stabilita!"
                    },
                    "timeout": {
                        "title": "Connessione con il cellulare persa",
                        "content": "Assicurati che il tuo cellulare sia connesso a Internet e WhatsApp sia aperto, oppure fai clic sul pulsante 'Disconnetti' per ottenere un nuovo QR Code."
                    }
                },
                "table": {
                    "id": "ID",
                    "channel": "Canale",
                    "name": "Nome",
                    "color": "Colore",
                    "number": "Numero",
                    "status": "Stato",
                    "lastUpdate": "Ultimo aggiornamento",
                    "default": "Predefinito",
                    "actions": "Azioni",
                    "session": "Sessione"
                }
            },
            "contactModal": {
                "title": {
                    "add": "Aggiungi contatto",
                    "edit": "Modifica contatto"
                },
                "form": {
                    "mainInfo": "Informazioni contatto",
                    "extraInfo": "Informazioni aggiuntive",
                    "name": "Nome",
                    "number": "Numero WhatsApp",
                    "email": "Email",
                    "extraName": "Nome del campo",
                    "extraValue": "Valore"
                },
                "buttons": {
                    "addExtraInfo": "Aggiungi informazione",
                    "okAdd": "Aggiungi",
                    "okEdit": "Salva",
                    "cancel": "Annulla"
                },
                "success": "Contatto salvato con successo."
            },
            "contacts": {
                "title": "Contatti",
                "toasts": {
                    "deleted": "Contatto eliminato con successo!",
                    "deletedAll": "Tutti i contatti eliminati con successo!"
                },
                "searchPlaceholder": "Cerca...",
                "confirmationModal": {
                    "deleteTitle": "Elimina",
                    "deleteAllTitle": "Elimina tutti",
                    "importTitle": "Importa contatti",
                    "deleteMessage": "Sei sicuro di voler eliminare questo contatto? Tutti i ticket correlati saranno persi."
                }
            },
            backendErrors: {
                ERR_CONNECTION_CREATION_COUNT: "Limite di connessioni raggiunto. Contatta il supporto per modifiche.",
                ERR_CREATING_MESSAGE: "Errore durante la creazione del messaggio nel database.",
                ERR_CREATING_TICKET: "Errore durante la creazione del ticket nel database.",
                ERR_DELETE_WAPP_MSG: "Impossibile eliminare il messaggio di WhatsApp.",
                ERR_DUPLICATED_CONTACT: "Esiste già un contatto con questo numero.",
                ERR_EDITING_WAPP_MSG: "Impossibile modificare il messaggio di WhatsApp.",
                ERR_FETCH_WAPP_MSG: "Errore durante il recupero del messaggio di WhatsApp. Potrebbe essere troppo vecchio.",
                ERR_INVALID_CREDENTIALS: "Credenziali non valide. Riprova.",
                ERR_NO_CONTACT_FOUND: "Nessun contatto trovato con questo ID.",
                ERR_NO_DEF_WAPP_FOUND: "Nessun WhatsApp predefinito trovato. Controlla la pagina delle connessioni.",
                ERR_NO_INTEGRATION_FOUND: "Integrazione non trovata.",
                ERR_NO_OTHER_WHATSAPP: "Deve esserci almeno un WhatsApp predefinito.",
                ERR_NO_PERMISSION: "Non hai i permessi per accedere a questa risorsa.",
                ERR_NO_SETTING_FOUND: "Nessuna impostazione trovata con questo ID.",
                ERR_NO_TAG_FOUND: "Tag non trovato.",
                ERR_NO_TICKET_FOUND: "Nessun ticket trovato con questo ID.",
                ERR_NO_USER_FOUND: "Nessun utente trovato con questo ID.",
                ERR_NO_WAPP_FOUND: "Nessun WhatsApp trovato con questo ID.",
                ERR_OPEN_USER_TICKET: "Esiste già un ticket aperto per questo contatto.",
                ERR_OTHER_OPEN_TICKET: "Esiste già un ticket aperto per questo contatto.",
                ERR_OUT_OF_HOURS: "Fuori dall'orario di lavoro!",
                ERR_QUEUE_COLOR_ALREADY_EXISTS: "Questo colore è già in uso, scegline un altro.",
                ERR_SENDING_WAPP_MSG: "Errore durante l'invio del messaggio WhatsApp. Controlla la pagina delle connessioni.",
                ERR_SESSION_EXPIRED: "Sessione scaduta. Effettua di nuovo l'accesso.",
                ERR_USER_CREATION_COUNT: "Limite di utenti raggiunto. Contatta il supporto per modifiche.",
                ERR_USER_CREATION_DISABLED: "La creazione degli utenti è stata disabilitata dall'amministratore.",
                ERR_WAPP_CHECK_CONTACT: "Impossibile verificare il contatto di WhatsApp. Controlla la pagina delle connessioni.",
                ERR_WAPP_DOWNLOAD_MEDIA: "Impossibile scaricare i media da WhatsApp. Controlla la pagina delle connessioni.",
                ERR_WAPP_GREETING_REQUIRED: "Il messaggio di benvenuto è obbligatorio se ci sono più di una coda.",
                ERR_WAPP_INVALID_CONTACT: "Questo non è un numero di WhatsApp valido.",
                ERR_WAPP_NOT_INITIALIZED: "Questa sessione di WhatsApp non è stata avviata. Controlla la pagina delle connessioni.",
            },
        },
    },
};

export { messages };

