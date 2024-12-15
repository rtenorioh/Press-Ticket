const messages = {
    de: {
        translations: {
            auth: {
                toasts: {
                    success: "Erfolgreich eingeloggt!"
                }
            },
            chat: {
                noTicketMessage: "Wählen Sie ein Ticket aus, um mit dem Chat zu beginnen."
            },
            confirmationModal: {
                buttons: {
                    confirm: "Ok",
                    cancel: "Abbrechen"
                }
            },
            connections: {
                title: "Verbindungen",
                toasts: {
                    deleted: "WhatsApp-Verbindung erfolgreich gelöscht!"
                },
                confirmationModal: {
                    deleteTitle: "Löschen",
                    deleteMessage: "Sind Sie sicher? Diese Aktion kann nicht rückgängig gemacht werden.",
                    disconnectTitle: "Trennen",
                    disconnectMessage: "Sind Sie sicher? Sie müssen den QR-Code erneut scannen."
                },
                buttons: {
                    add: "WhatsApp hinzufügen",
                    shutdown: "Löschen",
                    restart: "Neustart",
                    disconnect: "Trennen",
                    tryAgain: "Erneut versuchen",
                    qrcode: "QR CODE",
                    newQr: "Neuer QR CODE",
                    connecting: "Verbindung wird hergestellt"
                },
                toolTips: {
                    disconnected: {
                        title: "Fehler beim Starten der WhatsApp-Sitzung",
                        content: "Stellen Sie sicher, dass Ihr Handy mit dem Internet verbunden ist und versuchen Sie es erneut, oder fordern Sie einen neuen QR-Code an."
                    },
                    qrcode: {
                        title: "Warten auf QR-Code-Scan",
                        content: "Klicken Sie auf die Schaltfläche 'QR CODE' und scannen Sie den QR-Code mit Ihrem Handy, um die Sitzung zu starten."
                    },
                    connected: {
                        title: "Verbindung hergestellt!"
                    },
                    timeout: {
                        title: "Verbindung zum Handy wurde unterbrochen",
                        content: "Stellen Sie sicher, dass Ihr Handy mit dem Internet verbunden ist und WhatsApp geöffnet ist, oder klicken Sie auf 'Trennen', um einen neuen QR-Code zu erhalten."
                    }
                },
                table: {
                    id: "ID",
                    channel: "Kanal",
                    name: "Name",
                    color: "Farbe",
                    number: "Nummer",
                    status: "Status",
                    lastUpdate: "Letzte Aktualisierung",
                    default: "Standard",
                    actions: "Aktionen",
                    session: "Sitzung"
                }
            },
            contactModal: {
                title: {
                    add: "Kontakt hinzufügen",
                    edit: "Kontakt bearbeiten"
                },
                form: {
                    mainInfo: "Kontaktdaten",
                    extraInfo: "Zusätzliche Informationen",
                    name: "Name",
                    number: "WhatsApp-Nummer",
                    email: "E-Mail",
                    extraName: "Feldname",
                    extraValue: "Wert"
                },
                buttons: {
                    addExtraInfo: "Information hinzufügen",
                    okAdd: "Hinzufügen",
                    okEdit: "Speichern",
                    cancel: "Abbrechen"
                },
                success: "Kontakt erfolgreich gespeichert."
            },
            contacts: {
                title: "Kontakte",
                toasts: {
                    deleted: "Kontakt erfolgreich gelöscht!",
                    deletedAll: "Alle Kontakte erfolgreich gelöscht!"
                },
                searchPlaceholder: "Suchen...",
                confirmationModal: {
                    deleteTitle: "Löschen",
                    deleteAllTitle: "Alle löschen",
                    importTitle: "Kontakte importieren",
                    deleteMessage: "Sind Sie sicher, dass Sie diesen Kontakt löschen möchten? Alle damit verbundenen Tickets gehen verloren."
                }
            },
            backendErrors: {
                ERR_CONNECTION_CREATION_COUNT: "Maximale Verbindungen erreicht. Bitte kontaktieren Sie den Support für Änderungen.",
                ERR_CREATING_MESSAGE: "Fehler beim Erstellen der Nachricht in der Datenbank.",
                ERR_CREATING_TICKET: "Fehler beim Erstellen des Tickets in der Datenbank.",
                ERR_DELETE_WAPP_MSG: "WhatsApp-Nachricht konnte nicht gelöscht werden.",
                ERR_DUPLICATED_CONTACT: "Ein Kontakt mit dieser Nummer existiert bereits.",
                ERR_EDITING_WAPP_MSG: "WhatsApp-Nachricht konnte nicht bearbeitet werden.",
                ERR_FETCH_WAPP_MSG: "Fehler beim Abrufen der WhatsApp-Nachricht. Sie ist möglicherweise zu alt.",
                ERR_INVALID_CREDENTIALS: "Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.",
                ERR_NO_CONTACT_FOUND: "Kein Kontakt mit dieser ID gefunden.",
                ERR_NO_DEF_WAPP_FOUND: "Kein Standard-WhatsApp gefunden. Überprüfen Sie die Verbindungsseite.",
                ERR_NO_INTEGRATION_FOUND: "Integration nicht gefunden.",
                ERR_NO_OTHER_WHATSAPP: "Es muss mindestens ein Standard-WhatsApp vorhanden sein.",
                ERR_NO_PERMISSION: "Sie haben keine Berechtigung, auf diese Ressource zuzugreifen.",
                ERR_NO_SETTING_FOUND: "Keine Einstellung mit dieser ID gefunden.",
                ERR_NO_TAG_FOUND: "Tag nicht gefunden.",
                ERR_NO_TICKET_FOUND: "Kein Ticket mit dieser ID gefunden.",
                ERR_NO_USER_FOUND: "Kein Benutzer mit dieser ID gefunden.",
                ERR_NO_WAPP_FOUND: "Kein WhatsApp mit dieser ID gefunden.",
                ERR_OPEN_USER_TICKET: "Es gibt bereits ein offenes Ticket für diesen Kontakt mit ",
                ERR_OTHER_OPEN_TICKET: "Es gibt bereits ein offenes Ticket für diesen Kontakt.",
                ERR_OUT_OF_HOURS: "Außerhalb der Geschäftszeiten!",
                ERR_QUEUE_COLOR_ALREADY_EXISTS: "Diese Farbe wird bereits verwendet. Wählen Sie eine andere.",
                ERR_SENDING_WAPP_MSG: "Fehler beim Senden der WhatsApp-Nachricht. Überprüfen Sie die Verbindungsseite.",
                ERR_SESSION_EXPIRED: "Sitzung abgelaufen. Bitte melden Sie sich erneut an.",
                ERR_USER_CREATION_COUNT: "Maximale Benutzeranzahl erreicht. Bitte kontaktieren Sie den Support für Änderungen.",
                ERR_USER_CREATION_DISABLED: "Benutzererstellung wurde vom Administrator deaktiviert.",
                ERR_WAPP_CHECK_CONTACT: "WhatsApp-Kontakt konnte nicht überprüft werden. Überprüfen Sie die Verbindungsseite.",
                ERR_WAPP_DOWNLOAD_MEDIA: "Medien konnten nicht von WhatsApp heruntergeladen werden. Überprüfen Sie die Verbindungsseite.",
                ERR_WAPP_GREETING_REQUIRED: "Begrüßungsnachricht ist erforderlich, wenn mehr als eine Warteschlange vorhanden ist.",
                ERR_WAPP_INVALID_CONTACT: "Dies ist keine gültige WhatsApp-Nummer.",
                ERR_WAPP_NOT_INITIALIZED: "Diese WhatsApp-Sitzung wurde nicht gestartet. Überprüfen Sie die Verbindungsseite.",
            },
        },
    },
};

export { messages };

