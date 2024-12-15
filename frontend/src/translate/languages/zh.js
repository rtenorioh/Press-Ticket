const messages = {
    zh: {
        translations: {
            auth: {
                toasts: {
                    success: "登录成功！",
                },
            },
            chat: {
                noTicketMessage: "请选择一个工单开始对话。",
            },
            confirmationModal: {
                buttons: {
                    cancel: "取消",
                    confirm: "确认",
                },
            },
            connections: {
                buttons: {
                    add: "添加 WhatsApp",
                    connecting: "连接中",
                    disconnect: "断开连接",
                    newQr: "新的 QR 码",
                    qrcode: "QR 码",
                    restart: "重启",
                    shutdown: "删除",
                    tryAgain: "重试",
                },
                confirmationModal: {
                    deleteMessage: "确定吗？此操作无法撤销。",
                    deleteTitle: "删除",
                    disconnectMessage: "确定吗？您需要重新扫描 QR 码。",
                    disconnectTitle: "断开连接",
                },
                table: {
                    actions: "操作",
                    channel: "渠道",
                    color: "颜色",
                    default: "默认",
                    id: "ID",
                    lastUpdate: "最后更新",
                    name: "名称",
                    number: "号码",
                    session: "会话",
                    status: "状态",
                },
                title: "连接",
                toasts: {
                    deleted: "WhatsApp 连接成功删除！",
                },
                toolTips: {
                    connected: {
                        title: "连接已建立！",
                    },
                    disconnected: {
                        content: "确保您的手机已连接到互联网，然后重试，或者请求一个新的 QR 码。",
                        title: "无法启动 WhatsApp 会话",
                    },
                    qrcode: {
                        content: "点击 'QR 码' 按钮，用手机扫描 QR 码以启动会话。",
                        title: "等待扫描 QR 码",
                    },
                    timeout: {
                        content: "确保您的手机已连接到互联网并打开 WhatsApp，或者点击 '断开连接' 以获取新的 QR 码。",
                        title: "与手机的连接已丢失",
                    },
                },
            },
            contactDrawer: {
                buttons: {
                    edit: "编辑联系人",
                },
                extraInfo: "其他信息",
                header: "联系数据",
            },
            contactModal: {
                buttons: {
                    addExtraInfo: "添加信息",
                    cancel: "取消",
                    okAdd: "添加",
                    okEdit: "保存",
                },
                form: {
                    email: "邮箱",
                    extraName: "字段名称",
                    extraValue: "值",
                    mainInfo: "联系主要信息",
                    name: "名称",
                    number: "WhatsApp 号码",
                },
                success: "联系人保存成功。",
                title: {
                    add: "添加联系人",
                    edit: "编辑联系人",
                },
            },
            contacts: {
                buttons: {
                    add: "添加联系人",
                    delete: "删除所有联系人",
                    export: "导出联系人",
                    import: "导入联系人",
                },
                confirmationModal: {
                    deleteAllMessage: "确定删除所有联系人吗？所有相关工单将会丢失。",
                    deleteAllTitle: "删除所有",
                    deleteMessage: "确定删除此联系人吗？所有相关工单将会丢失。",
                    deleteTitle: "删除",
                    importMessage: "是否导入手机上的所有联系人？",
                    importTitle: "导入联系人",
                },
                searchPlaceholder: "搜索...",
                table: {
                    actions: "操作",
                    channels: "渠道",
                    name: "名称",
                    whatsapp: "WhatsApp",
                },
                title: "联系人",
                toasts: {
                    deleted: "联系人已成功删除！",
                    deletedAll: "所有联系人已成功删除！",
                },
            },
            copyToClipboard: {
                copy: "复制",
                copied: "已复制",
            },
            dashboard: {
                chartPerConnection: {
                    date: {
                        title: "筛选",
                    },
                    perConnection: {
                        title: "按连接的工单",
                    },
                },
                chartPerQueue: {
                    date: {
                        title: "筛选",
                    },
                    perQueue: {
                        title: "按队列的工单",
                    },
                },
                chartPerUser: {
                    date: {
                        title: "筛选",
                    },
                    ticket: "工单",
                    title: "按用户的工单",
                },
                charts: {
                    date: {
                        title: "筛选",
                    },
                    perDay: {
                        title: "每天的工单: ",
                    },
                },
                contactsWithTickets: {
                    date: {
                        end: "结束日期",
                        start: "开始日期",
                    },
                    message: "在此日期未找到联系人。",
                    title: "期间打开工单的联系人",
                    unique: "唯一联系人",
                },
                messages: {
                    closed: {
                        title: "已解决",
                    },
                    inAttendance: {
                        title: "处理中",
                    },
                    waiting: {
                        title: "等待中",
                    },
                },
                newContacts: {
                    contact: "联系人",
                    date: {
                        end: "结束日期",
                        start: "开始日期",
                    },
                    title: "每天新增联系人",
                },
                tags: {
                    cloudTitle: "标签: ",
                    noTags: "当前无标签！",
                },
            },
            backendErrors: {
                ERR_CONNECTION_CREATION_COUNT: "已达到连接限制。请联系支持更改。",
                ERR_CREATING_MESSAGE: "在数据库中创建消息时出错。",
                ERR_CREATING_TICKET: "在数据库中创建工单时出错。",
                ERR_DELETE_WAPP_MSG: "无法删除 WhatsApp 消息。",
                ERR_DUPLICATED_CONTACT: "此号码的联系人已存在。",
                ERR_EDITING_WAPP_MSG: "无法编辑 WhatsApp 消息。",
                ERR_FETCH_WAPP_MSG: "获取 WhatsApp 消息时出错，可能消息太旧。",
                ERR_INVALID_CREDENTIALS: "认证错误，请重试。",
                ERR_NO_CONTACT_FOUND: "未找到此 ID 的联系人。",
                ERR_NO_DEF_WAPP_FOUND: "未找到默认的 WhatsApp。请检查连接页面。",
                ERR_NO_INTEGRATION_FOUND: "未找到集成。",
                ERR_NO_OTHER_WHATSAPP: "必须至少有一个默认的 WhatsApp。",
                ERR_NO_PERMISSION: "您无权访问此资源。",
                ERR_NO_SETTING_FOUND: "未找到此 ID 的设置。",
                ERR_NO_TAG_FOUND: "未找到标签。",
                ERR_NO_TICKET_FOUND: "未找到此 ID 的工单。",
                ERR_NO_USER_FOUND: "未找到此 ID 的用户。",
                ERR_NO_WAPP_FOUND: "未找到此 ID 的 WhatsApp。",
                ERR_OPEN_USER_TICKET: "此联系人的工单已打开。",
                ERR_OTHER_OPEN_TICKET: "此联系人的工单已打开。",
                ERR_OUT_OF_HOURS: "超出工作时间！",
                ERR_QUEUE_COLOR_ALREADY_EXISTS: "此颜色已被使用，请选择其他颜色。",
                ERR_SENDING_WAPP_MSG: "发送 WhatsApp 消息时出错。请检查连接页面。",
                ERR_SESSION_EXPIRED: "会话已过期，请重新登录。",
                ERR_USER_CREATION_COUNT: "已达到用户限制。请联系支持更改。",
                ERR_USER_CREATION_DISABLED: "管理员已禁用用户创建。",
                ERR_WAPP_CHECK_CONTACT: "无法验证 WhatsApp 联系人。请检查连接页面。",
                ERR_WAPP_DOWNLOAD_MEDIA: "无法下载 WhatsApp 媒体文件。请检查连接页面。",
                ERR_WAPP_GREETING_REQUIRED: "如果有多个队列，则需要欢迎消息。",
                ERR_WAPP_INVALID_CONTACT: "此号码不是有效的 WhatsApp 号码。",
                ERR_WAPP_NOT_INITIALIZED: "WhatsApp 会话未初始化。请检查连接页面。",
            },
        },
    },
};

export { messages };

