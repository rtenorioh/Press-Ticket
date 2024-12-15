const messages = {
    ru: {
        translations: {
            auth: {
                toasts: {
                    success: "Вход выполнен успешно!",
                },
            },
            chat: {
                noTicketMessage: "Выберите тикет, чтобы начать разговор.",
            },
            confirmationModal: {
                buttons: {
                    cancel: "Отмена",
                    confirm: "ОК",
                },
            },
            connections: {
                buttons: {
                    add: "Добавить WhatsApp",
                    connecting: "Подключение",
                    disconnect: "Отключить",
                    newQr: "Новый QR-код",
                    qrcode: "QR-код",
                    restart: "Перезапуск",
                    shutdown: "Удалить",
                    tryAgain: "Попробовать снова",
                },
                confirmationModal: {
                    deleteMessage: "Вы уверены? Это действие нельзя отменить.",
                    deleteTitle: "Удалить",
                    disconnectMessage: "Вы уверены? Вам нужно будет снова отсканировать QR-код.",
                    disconnectTitle: "Отключить",
                },
                table: {
                    actions: "Действия",
                    channel: "Канал",
                    color: "Цвет",
                    default: "По умолчанию",
                    id: "ID",
                    lastUpdate: "Последнее обновление",
                    name: "Имя",
                    number: "Номер",
                    session: "Сессия",
                    status: "Статус",
                },
                title: "Подключения",
                toasts: {
                    deleted: "Подключение к WhatsApp успешно удалено!",
                },
                toolTips: {
                    connected: {
                        title: "Подключение установлено!",
                    },
                    disconnected: {
                        content: "Убедитесь, что ваш телефон подключен к интернету, и попробуйте снова или запросите новый QR-код.",
                        title: "Не удалось запустить сеанс WhatsApp",
                    },
                    qrcode: {
                        content: "Нажмите на кнопку 'QR-код' и отсканируйте QR-код с помощью телефона, чтобы начать сеанс.",
                        title: "Ожидание сканирования QR-кода",
                    },
                    timeout: {
                        content: "Убедитесь, что ваш телефон подключен к интернету и WhatsApp открыт, или нажмите 'Отключить', чтобы получить новый QR-код.",
                        title: "Соединение с телефоном потеряно",
                    },
                },
            },
            contactDrawer: {
                buttons: {
                    edit: "Редактировать контакт",
                },
                extraInfo: "Дополнительная информация",
                header: "Данные контакта",
            },
            contactModal: {
                buttons: {
                    addExtraInfo: "Добавить информацию",
                    cancel: "Отмена",
                    okAdd: "Добавить",
                    okEdit: "Сохранить",
                },
                form: {
                    email: "Электронная почта",
                    extraName: "Название поля",
                    extraValue: "Значение",
                    mainInfo: "Основная информация о контакте",
                    name: "Имя",
                    number: "Номер WhatsApp",
                },
                success: "Контакт успешно сохранен.",
                title: {
                    add: "Добавить контакт",
                    edit: "Редактировать контакт",
                },
            },
            contacts: {
                buttons: {
                    add: "Добавить контакт",
                    delete: "Удалить все контакты",
                    export: "Экспортировать контакты",
                    import: "Импортировать контакты",
                },
                confirmationModal: {
                    deleteAllMessage: "Вы уверены, что хотите удалить все контакты? Все связанные тикеты будут утеряны.",
                    deleteAllTitle: "Удалить все",
                    deleteMessage: "Вы уверены, что хотите удалить этот контакт? Все связанные тикеты будут утеряны.",
                    deleteTitle: "Удалить",
                    importMessage: "Вы хотите импортировать все контакты из телефона?",
                    importTitle: "Импортировать контакты",
                },
                searchPlaceholder: "Поиск...",
                table: {
                    actions: "Действия",
                    channels: "Каналы",
                    name: "Имя",
                    whatsapp: "WhatsApp",
                },
                title: "Контакты",
                toasts: {
                    deleted: "Контакт успешно удален!",
                    deletedAll: "Все контакты успешно удалены!",
                },
            },
            copyToClipboard: {
                copy: "Копировать",
                copied: "Скопировано",
            },
            dashboard: {
                chartPerConnection: {
                    date: {
                        title: "Фильтр",
                    },
                    perConnection: {
                        title: "Тикеты по подключениям",
                    },
                },
                chartPerQueue: {
                    date: {
                        title: "Фильтр",
                    },
                    perQueue: {
                        title: "Тикеты по очередям",
                    },
                },
                chartPerUser: {
                    date: {
                        title: "Фильтр",
                    },
                    ticket: "Тикет",
                    title: "Тикеты по пользователям",
                },
                charts: {
                    date: {
                        title: "Фильтр",
                    },
                    perDay: {
                        title: "Тикеты по дням:",
                    },
                },
                contactsWithTickets: {
                    date: {
                        end: "Конечная дата",
                        start: "Начальная дата",
                    },
                    message: "Контакты за эту дату не найдены.",
                    title: "Контакты, открывшие тикеты за период",
                    unique: "Уникальный контакт",
                },
                messages: {
                    closed: {
                        title: "Решено",
                    },
                    inAttendance: {
                        title: "В процессе",
                    },
                    waiting: {
                        title: "Ожидание",
                    },
                },
                newContacts: {
                    contact: "Контакты",
                    date: {
                        end: "Конечная дата",
                        start: "Начальная дата",
                    },
                    title: "Новые контакты по дням",
                },
                tags: {
                    cloudTitle: "Теги:",
                    noTags: "На данный момент тегов нет!",
                },
            },
            backendErrors: {
                ERR_CONNECTION_CREATION_COUNT: "Достигнут лимит подключений. Обратитесь в поддержку для изменений.",
                ERR_CREATING_MESSAGE: "Ошибка при создании сообщения в базе данных.",
                ERR_CREATING_TICKET: "Ошибка при создании тикета в базе данных.",
                ERR_DELETE_WAPP_MSG: "Не удалось удалить сообщение WhatsApp.",
                ERR_DUPLICATED_CONTACT: "Контакт с этим номером уже существует.",
                ERR_EDITING_WAPP_MSG: "Не удалось отредактировать сообщение WhatsApp.",
                ERR_FETCH_WAPP_MSG: "Ошибка при получении сообщения WhatsApp. Возможно, оно слишком старое.",
                ERR_INVALID_CREDENTIALS: "Ошибка аутентификации. Попробуйте снова.",
                ERR_NO_CONTACT_FOUND: "Контакт с этим ID не найден.",
                ERR_NO_DEF_WAPP_FOUND: "Не найден WhatsApp по умолчанию. Проверьте страницу подключений.",
                ERR_NO_INTEGRATION_FOUND: "Интеграция не найдена.",
                ERR_NO_OTHER_WHATSAPP: "Необходим хотя бы один WhatsApp по умолчанию.",
                ERR_NO_PERMISSION: "У вас нет доступа к этому ресурсу.",
                ERR_NO_SETTING_FOUND: "Настройка с этим ID не найдена.",
                ERR_NO_TAG_FOUND: "Тег не найден.",
                ERR_NO_TICKET_FOUND: "Тикет с этим ID не найден.",
                ERR_NO_USER_FOUND: "Пользователь с этим ID не найден.",
                ERR_NO_WAPP_FOUND: "WhatsApp с этим ID не найден.",
                ERR_OPEN_USER_TICKET: "Тикет для этого контакта уже открыт.",
                ERR_OTHER_OPEN_TICKET: "Тикет для этого контакта уже открыт.",
                ERR_OUT_OF_HOURS: "Вне рабочего времени!",
                ERR_QUEUE_COLOR_ALREADY_EXISTS: "Этот цвет уже используется. Выберите другой.",
                ERR_SENDING_WAPP_MSG: "Ошибка при отправке сообщения WhatsApp. Проверьте страницу подключений.",
                ERR_SESSION_EXPIRED: "Сессия истекла. Пожалуйста, войдите снова.",
                ERR_USER_CREATION_COUNT: "Достигнут лимит пользователей. Обратитесь в поддержку для изменений.",
                ERR_USER_CREATION_DISABLED: "Создание пользователя отключено администратором.",
                ERR_WAPP_CHECK_CONTACT: "Не удалось проверить контакт WhatsApp. Проверьте страницу подключений.",
                ERR_WAPP_DOWNLOAD_MEDIA: "Не удалось загрузить медиафайл из WhatsApp. Проверьте страницу подключений.",
                ERR_WAPP_GREETING_REQUIRED: "Приветственное сообщение обязательно при наличии более одной очереди.",
                ERR_WAPP_INVALID_CONTACT: "Это не действительный номер WhatsApp.",
                ERR_WAPP_NOT_INITIALIZED: "Сессия WhatsApp не инициализирована. Проверьте страницу подключений.",
            },
        },
    },
};

export { messages };

