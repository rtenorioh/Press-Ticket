const messages = {
    ja: {
        translations: {
            auth: {
                toasts: {
                    success: "ログインに成功しました！"
                }
            },
            chat: {
                noTicketMessage: "チケットを選択して会話を開始してください。"
            },
            confirmationModal: {
                buttons: {
                    confirm: "OK",
                    cancel: "キャンセル"
                }
            },
            connections: {
                title: "接続",
                toasts: {
                    deleted: "WhatsApp接続が正常に削除されました！"
                },
                confirmationModal: {
                    deleteTitle: "削除",
                    deleteMessage: "本当に削除してもよろしいですか？ この操作は元に戻せません。",
                    disconnectTitle: "切断",
                    disconnectMessage: "本当に切断してもよろしいですか？ QRコードを再度読み取る必要があります。"
                },
                buttons: {
                    add: "WhatsAppを追加",
                    shutdown: "削除",
                    restart: "再起動",
                    disconnect: "切断",
                    tryAgain: "再試行",
                    qrcode: "QRコード",
                    newQr: "新しいQRコード",
                    connecting: "接続中"
                },
                toolTips: {
                    disconnected: {
                        title: "WhatsAppセッションの開始に失敗しました",
                        content: "携帯電話がインターネットに接続されていることを確認し、再試行してください。または、新しいQRコードを要求してください。"
                    },
                    qrcode: {
                        title: "QRコードの読み取り待機中",
                        content: "'QRコード'ボタンをクリックして、携帯電話でQRコードを読み取ってセッションを開始してください。"
                    },
                    connected: {
                        title: "接続が確立しました！"
                    },
                    timeout: {
                        title: "携帯電話との接続が失われました",
                        content: "携帯電話がインターネットに接続されていることを確認し、WhatsAppが開いていることを確認してください。または、'切断'ボタンをクリックして新しいQRコードを取得してください。"
                    }
                },
                table: {
                    id: "ID",
                    channel: "チャンネル",
                    name: "名前",
                    color: "色",
                    number: "番号",
                    status: "状態",
                    lastUpdate: "最終更新",
                    default: "デフォルト",
                    actions: "アクション",
                    session: "セッション"
                }
            },
            contactModal: {
                title: {
                    add: "連絡先を追加",
                    edit: "連絡先を編集"
                },
                form: {
                    mainInfo: "連絡先情報",
                    extraInfo: "追加情報",
                    name: "名前",
                    number: "WhatsApp番号",
                    email: "メール"
                },
                buttons: {
                    addExtraInfo: "情報を追加",
                    okAdd: "追加",
                    okEdit: "保存",
                    cancel: "キャンセル"
                },
                success: "連絡先が正常に保存されました。"
            },
            contacts: {
                title: "連絡先",
                toasts: {
                    deleted: "連絡先が正常に削除されました！",
                    deletedAll: "すべての連絡先が正常に削除されました！"
                },
                searchPlaceholder: "検索...",
                confirmationModal: {
                    deleteTitle: "削除",
                    deleteAllTitle: "すべて削除",
                    importTitle: "インポート"
                }
            },
            backendErrors: {
                ERR_CONNECTION_CREATION_COUNT: "接続の上限に達しました。変更についてはサポートにお問い合わせください。",
                ERR_CREATING_MESSAGE: "データベース内でメッセージの作成中にエラーが発生しました。",
                ERR_CREATING_TICKET: "データベース内でチケットの作成中にエラーが発生しました。",
                ERR_DELETE_WAPP_MSG: "WhatsAppメッセージを削除できませんでした。",
                ERR_DUPLICATED_CONTACT: "この番号の連絡先はすでに存在します。",
                ERR_EDITING_WAPP_MSG: "WhatsAppメッセージを編集できませんでした。",
                ERR_FETCH_WAPP_MSG: "WhatsAppメッセージの取得中にエラーが発生しました。メッセージが古すぎる可能性があります。",
                ERR_INVALID_CREDENTIALS: "認証エラー。もう一度お試しください。",
                ERR_NO_CONTACT_FOUND: "このIDの連絡先は見つかりませんでした。",
                ERR_NO_DEF_WAPP_FOUND: "デフォルトのWhatsAppが見つかりません。接続ページを確認してください。",
                ERR_NO_INTEGRATION_FOUND: "統合が見つかりませんでした。",
                ERR_NO_OTHER_WHATSAPP: "デフォルトのWhatsAppが少なくとも1つ必要です。",
                ERR_NO_PERMISSION: "このリソースにアクセスする権限がありません。",
                ERR_NO_SETTING_FOUND: "このIDの設定は見つかりませんでした。",
                ERR_NO_TAG_FOUND: "タグが見つかりません。",
                ERR_NO_TICKET_FOUND: "このIDのチケットは見つかりませんでした。",
                ERR_NO_USER_FOUND: "このIDのユーザーは見つかりませんでした。",
                ERR_NO_WAPP_FOUND: "このIDのWhatsAppは見つかりませんでした。",
                ERR_OPEN_USER_TICKET: "この連絡先のチケットはすでに開かれています。",
                ERR_OTHER_OPEN_TICKET: "この連絡先のチケットはすでに開かれています。",
                ERR_OUT_OF_HOURS: "営業時間外です！",
                ERR_QUEUE_COLOR_ALREADY_EXISTS: "この色はすでに使用されています。別の色を選択してください。",
                ERR_SENDING_WAPP_MSG: "WhatsAppメッセージの送信中にエラーが発生しました。接続ページを確認してください。",
                ERR_SESSION_EXPIRED: "セッションが期限切れです。再度ログインしてください。",
                ERR_USER_CREATION_COUNT: "ユーザーの上限に達しました。変更についてはサポートにお問い合わせください。",
                ERR_USER_CREATION_DISABLED: "ユーザー作成は管理者によって無効化されています。",
                ERR_WAPP_CHECK_CONTACT: "WhatsAppの連絡先を確認できませんでした。接続ページを確認してください。",
                ERR_WAPP_DOWNLOAD_MEDIA: "WhatsAppからメディアをダウンロードできませんでした。接続ページを確認してください。",
                ERR_WAPP_GREETING_REQUIRED: "キューが複数ある場合、挨拶メッセージは必須です。",
                ERR_WAPP_INVALID_CONTACT: "これは有効なWhatsApp番号ではありません。",
                ERR_WAPP_NOT_INITIALIZED: "このWhatsAppセッションは初期化されていません。接続ページを確認してください。",
            },
        },
    },
};

export { messages };

