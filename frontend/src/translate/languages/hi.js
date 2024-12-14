const messages = {
    hi: {
        translations: {
            auth: {
                toasts: {
                    success: "सफलतापूर्वक लॉगिन हुआ!"
                }
            },
            chat: {
                noTicketMessage: "चर्चा शुरू करने के लिए एक टिकट चुनें।"
            },
            confirmationModal: {
                buttons: {
                    confirm: "ठीक है",
                    cancel: "रद्द करें"
                }
            },
            connections: {
                title: "कनेक्शन",
                toasts: {
                    deleted: "व्हाट्सएप कनेक्शन सफलतापूर्वक हटा दिया गया!"
                },
                confirmationModal: {
                    deleteTitle: "हटाएं",
                    deleteMessage: "क्या आप सुनिश्चित हैं? यह क्रिया अपरिवर्तनीय है।",
                    disconnectTitle: "डिस्कनेक्ट करें",
                    disconnectMessage: "क्या आप सुनिश्चित हैं? आपको QR कोड फिर से स्कैन करना होगा।"
                },
                buttons: {
                    add: "व्हाट्सएप जोड़ें",
                    shutdown: "हटाएं",
                    restart: "रीस्टार्ट",
                    disconnect: "डिस्कनेक्ट करें",
                    tryAgain: "फिर से प्रयास करें",
                    qrcode: "QR कोड",
                    newQr: "नया QR कोड",
                    connecting: "कनेक्ट हो रहा है"
                },
                toolTips: {
                    disconnected: {
                        title: "व्हाट्सएप सत्र शुरू करने में विफल",
                        content: "सुनिश्चित करें कि आपका फोन इंटरनेट से जुड़ा है और फिर से प्रयास करें, या एक नया QR कोड अनुरोध करें।"
                    },
                    qrcode: {
                        title: "QR कोड स्कैन करने का इंतजार कर रहे हैं",
                        content: "'QR कोड' बटन पर क्लिक करें और अपने फोन से QR कोड स्कैन करें ताकि सत्र शुरू हो सके।"
                    },
                    connected: {
                        title: "कनेक्शन स्थापित!"
                    },
                    timeout: {
                        title: "फोन के साथ कनेक्शन खो गया",
                        content: "सुनिश्चित करें कि आपका फोन इंटरनेट से जुड़ा है और व्हाट्सएप खुला है, या 'डिस्कनेक्ट करें' बटन पर क्लिक करें ताकि एक नया QR कोड प्राप्त किया जा सके।"
                    }
                },
                table: {
                    id: "ID",
                    channel: "चैनल",
                    name: "नाम",
                    color: "रंग",
                    number: "नंबर",
                    status: "स्थिति",
                    lastUpdate: "अंतिम अपडेट",
                    default: "डिफ़ॉल्ट",
                    actions: "क्रियाएँ",
                    session: "सत्र"
                }
            },
            contactModal: {
                title: {
                    add: "संपर्क जोड़ें",
                    edit: "संपर्क संपादित करें"
                },
                form: {
                    mainInfo: "संपर्क विवरण",
                    extraInfo: "अतिरिक्त जानकारी",
                    name: "नाम",
                    number: "व्हाट्सएप नंबर",
                    email: "ईमेल",
                    extraName: "फील्ड नाम",
                    extraValue: "मूल्य"
                },
                buttons: {
                    addExtraInfo: "जानकारी जोड़ें",
                    okAdd: "जोड़ें",
                    okEdit: "सहेजें",
                    cancel: "रद्द करें"
                },
                success: "संपर्क सफलतापूर्वक सहेजा गया।"
            },
            backendErrors: {
                ERR_CONNECTION_CREATION_COUNT: "अधिकतम कनेक्शन सीमा तक पहुँचा गया। कृपया संशोधन के लिए समर्थन से संपर्क करें।",
                ERR_CREATING_MESSAGE: "डेटाबेस में संदेश बनाते समय त्रुटि।",
                ERR_CREATING_TICKET: "डेटाबेस में टिकट बनाते समय त्रुटि।",
                ERR_DELETE_WAPP_MSG: "WhatsApp संदेश को हटाने में विफल।",
                ERR_DUPLICATED_CONTACT: "इस नंबर के साथ एक संपर्क पहले से मौजूद है।",
                ERR_EDITING_WAPP_MSG: "WhatsApp संदेश संपादित करने में विफल।",
                ERR_FETCH_WAPP_MSG: "WhatsApp संदेश प्राप्त करने में त्रुटि। यह बहुत पुराना हो सकता है।",
                ERR_INVALID_CREDENTIALS: "अमान्य क्रेडेंशियल। कृपया पुनः प्रयास करें।",
                ERR_NO_CONTACT_FOUND: "इस ID के साथ कोई संपर्क नहीं मिला।",
                ERR_NO_DEF_WAPP_FOUND: "कोई डिफ़ॉल्ट WhatsApp नहीं मिला। कृपया कनेक्शन पृष्ठ की जाँच करें।",
                ERR_NO_INTEGRATION_FOUND: "एकीकरण नहीं मिला।",
                ERR_NO_OTHER_WHATSAPP: "कम से कम एक डिफ़ॉल्ट WhatsApp होना चाहिए।",
                ERR_NO_PERMISSION: "इस संसाधन तक पहुँचने की आपकी अनुमति नहीं है।",
                ERR_NO_SETTING_FOUND: "इस ID के साथ कोई सेटिंग नहीं मिली।",
                ERR_NO_TAG_FOUND: "टैग नहीं मिला।",
                ERR_NO_TICKET_FOUND: "इस ID के साथ कोई टिकट नहीं मिला।",
                ERR_NO_USER_FOUND: "इस ID के साथ कोई उपयोगकर्ता नहीं मिला।",
                ERR_NO_WAPP_FOUND: "इस ID के साथ कोई WhatsApp नहीं मिला।",
                ERR_OPEN_USER_TICKET: "इस संपर्क के लिए पहले से एक खुला हुआ टिकट है।",
                ERR_OTHER_OPEN_TICKET: "इस संपर्क के लिए पहले से एक खुला हुआ टिकट है।",
                ERR_OUT_OF_HOURS: "काम के घंटे के बाहर!",
                ERR_QUEUE_COLOR_ALREADY_EXISTS: "यह रंग पहले से उपयोग में है। कृपया कोई और रंग चुनें।",
                ERR_SENDING_WAPP_MSG: "WhatsApp संदेश भेजने में त्रुटि। कृपया कनेक्शन पृष्ठ की जाँच करें।",
                ERR_SESSION_EXPIRED: "सत्र समाप्त। कृपया पुनः लॉगिन करें।",
                ERR_USER_CREATION_COUNT: "अधिकतम उपयोगकर्ता सीमा तक पहुँच गया। कृपया संशोधन के लिए समर्थन से संपर्क करें।",
                ERR_USER_CREATION_DISABLED: "प्रयोक्ता निर्माण को व्यवस्थापक द्वारा निष्क्रिय कर दिया गया है।",
                ERR_WAPP_CHECK_CONTACT: "WhatsApp संपर्क की जाँच करने में विफल। कृपया कनेक्शन पृष्ठ की जाँच करें।",
                ERR_WAPP_DOWNLOAD_MEDIA: "WhatsApp से मीडिया डाउनलोड करने में असमर्थ। कृपया कनेक्शन पृष्ठ की जाँच करें।",
                ERR_WAPP_GREETING_REQUIRED: "जब एक से अधिक पंक्तियाँ होती हैं, तो अभिवादन संदेश अनिवार्य होता है।",
                ERR_WAPP_INVALID_CONTACT: "यह एक मान्य WhatsApp नंबर नहीं है।",
                ERR_WAPP_NOT_INITIALIZED: "यह WhatsApp सत्र प्रारंभ नहीं हुआ है। कृपया कनेक्शन पृष्ठ की जाँच करें।",
            },
        },
    },
};

export { messages };

