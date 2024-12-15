const messages = {
    ar: {
        translations: {
            auth: {
                toasts: {
                    success: "تم تسجيل الدخول بنجاح!"
                }
            },
            chat: {
                noTicketMessage: "حدد تذكرة لبدء الدردشة."
            },
            confirmationModal: {
                buttons: {
                    confirm: "موافق",
                    cancel: "إلغاء"
                }
            },
            connections: {
                title: "الاتصالات",
                toasts: {
                    deleted: "تم حذف الاتصال بـ WhatsApp بنجاح!"
                },
                confirmationModal: {
                    deleteTitle: "حذف",
                    deleteMessage: "هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.",
                    disconnectTitle: "فصل",
                    disconnectMessage: "هل أنت متأكد؟ ستحتاج إلى مسح رمز الاستجابة السريعة مرة أخرى."
                },
                buttons: {
                    add: "إضافة WhatsApp",
                    shutdown: "حذف",
                    restart: "إعادة تشغيل",
                    disconnect: "فصل",
                    tryAgain: "إعادة المحاولة",
                    qrcode: "رمز الاستجابة السريعة",
                    newQr: "رمز استجابة سريعة جديد",
                    connecting: "جاري الاتصال"
                },
                toolTips: {
                    disconnected: {
                        title: "فشل في بدء جلسة WhatsApp",
                        content: "تأكد من أن هاتفك متصل بالإنترنت وحاول مرة أخرى، أو اطلب رمز استجابة سريعة جديد."
                    },
                    qrcode: {
                        title: "انتظار مسح رمز الاستجابة السريعة",
                        content: "انقر على زر 'رمز الاستجابة السريعة' وامسح رمز الاستجابة السريعة باستخدام هاتفك لبدء الجلسة."
                    },
                    connected: {
                        title: "تم إنشاء الاتصال!"
                    },
                    timeout: {
                        title: "تم فقد الاتصال بالهاتف",
                        content: "تأكد من أن هاتفك متصل بالإنترنت وأن WhatsApp مفتوح، أو انقر على زر 'فصل' للحصول على رمز استجابة سريعة جديد."
                    }
                },
                table: {
                    id: "ID",
                    channel: "القناة",
                    name: "الاسم",
                    color: "اللون",
                    number: "الرقم",
                    status: "الحالة",
                    lastUpdate: "آخر تحديث",
                    default: "افتراضي",
                    actions: "الإجراءات",
                    session: "الجلسة"
                }
            },
            contactModal: {
                title: {
                    add: "إضافة اتصال",
                    edit: "تحرير الاتصال"
                },
                form: {
                    mainInfo: "بيانات الاتصال",
                    extraInfo: "معلومات إضافية",
                    name: "الاسم",
                    number: "رقم WhatsApp",
                    email: "البريد الإلكتروني",
                    extraName: "اسم الحقل",
                    extraValue: "القيمة"
                },
                buttons: {
                    addExtraInfo: "إضافة معلومات",
                    okAdd: "إضافة",
                    okEdit: "حفظ",
                    cancel: "إلغاء"
                },
                success: "تم حفظ الاتصال بنجاح."
            },
            contacts: {
                title: "الاتصالات",
                toasts: {
                    deleted: "تم حذف الاتصال بنجاح!",
                    deletedAll: "تم حذف جميع الاتصالات بنجاح!"
                },
                searchPlaceholder: "بحث...",
                confirmationModal: {
                    deleteTitle: "حذف",
                    deleteAllTitle: "حذف الكل",
                    importTitle: "استيراد..."
                }
            },
            backendErrors: {
                ERR_CONNECTION_CREATION_COUNT: "تم الوصول إلى الحد الأقصى للاتصالات، يرجى التواصل مع الدعم لتعديله.",
                ERR_CREATING_MESSAGE: "خطأ في إنشاء الرسالة في قاعدة البيانات.",
                ERR_CREATING_TICKET: "خطأ في إنشاء التذكرة في قاعدة البيانات.",
                ERR_DELETE_WAPP_MSG: "تعذر حذف رسالة واتساب.",
                ERR_DUPLICATED_CONTACT: "يوجد بالفعل جهة اتصال بهذا الرقم.",
                ERR_EDITING_WAPP_MSG: "تعذر تعديل رسالة واتساب.",
                ERR_FETCH_WAPP_MSG: "خطأ في جلب رسالة واتساب، قد تكون قديمة جدًا.",
                ERR_INVALID_CREDENTIALS: "خطأ في المصادقة. حاول مرة أخرى.",
                ERR_NO_CONTACT_FOUND: "لم يتم العثور على جهة اتصال بهذا المعرف.",
                ERR_NO_DEF_WAPP_FOUND: "لم يتم العثور على واتساب افتراضي. تحقق من صفحة الاتصالات.",
                ERR_NO_INTEGRATION_FOUND: "لم يتم العثور على التكامل.",
                ERR_NO_OTHER_WHATSAPP: "يجب أن يكون هناك واتساب افتراضي واحد على الأقل.",
                ERR_NO_PERMISSION: "ليس لديك الإذن للوصول إلى هذا المورد.",
                ERR_NO_SETTING_FOUND: "لم يتم العثور على إعداد بهذا المعرف.",
                ERR_NO_TAG_FOUND: "لم يتم العثور على العلامة.",
                ERR_NO_TICKET_FOUND: "لم يتم العثور على تذكرة بهذا المعرف.",
                ERR_NO_USER_FOUND: "لم يتم العثور على مستخدم بهذا المعرف.",
                ERR_NO_WAPP_FOUND: "لم يتم العثور على واتساب بهذا المعرف.",
                ERR_OPEN_USER_TICKET: "يوجد بالفعل تذكرة مفتوحة لهذا الاتصال مع ",
                ERR_OTHER_OPEN_TICKET: "يوجد بالفعل تذكرة مفتوحة لهذا الاتصال.",
                ERR_OUT_OF_HOURS: "خارج ساعات العمل!",
                ERR_QUEUE_COLOR_ALREADY_EXISTS: "هذا اللون مستخدم بالفعل، اختر لونًا آخر.",
                ERR_SENDING_WAPP_MSG: "خطأ في إرسال رسالة واتساب. تحقق من صفحة الاتصالات.",
                ERR_SESSION_EXPIRED: "انتهت الجلسة. يرجى تسجيل الدخول.",
                ERR_USER_CREATION_COUNT: "تم الوصول إلى الحد الأقصى لعدد المستخدمين، يرجى التواصل مع الدعم لتعديله.",
                ERR_USER_CREATION_DISABLED: "تم تعطيل إنشاء المستخدم بواسطة المدير.",
                ERR_WAPP_CHECK_CONTACT: "تعذر التحقق من جهة اتصال واتساب. تحقق من صفحة الاتصالات.",
                ERR_WAPP_DOWNLOAD_MEDIA: "تعذر تنزيل الوسائط من واتساب. تحقق من صفحة الاتصالات.",
                ERR_WAPP_GREETING_REQUIRED: "رسالة الترحيب مطلوبة عند وجود أكثر من قسم.",
                ERR_WAPP_INVALID_CONTACT: "هذا ليس رقم واتساب صالحًا.",
                ERR_WAPP_NOT_INITIALIZED: "لم يتم بدء جلسة واتساب هذه. تحقق من صفحة الاتصالات.",
            },
        },
    },
};

export { messages };

