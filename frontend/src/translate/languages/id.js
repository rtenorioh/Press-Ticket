const messages = {
    id: {
        translations: {
            "auth": {
                "toasts": {
                    "success": "Login berhasil!"
                }
            },
            "chat": {
                "noTicketMessage": "Pilih tiket untuk mulai mengobrol."
            },
            "confirmationModal": {
                "buttons": {
                    "confirm": "Oke",
                    "cancel": "Batal"
                }
            },
            "connections": {
                "title": "Koneksi",
                "toasts": {
                    "deleted": "Koneksi WhatsApp berhasil dihapus!"
                },
                "confirmationModal": {
                    "deleteTitle": "Hapus",
                    "deleteMessage": "Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan.",
                    "disconnectTitle": "Putuskan Koneksi",
                    "disconnectMessage": "Apakah Anda yakin? Anda perlu memindai ulang QR Code."
                },
                "buttons": {
                    "add": "Tambah WhatsApp",
                    "shutdown": "Hapus",
                    "restart": "Mulai Ulang",
                    "disconnect": "Putuskan Koneksi",
                    "tryAgain": "Coba Lagi",
                    "qrcode": "QR CODE",
                    "newQr": "QR CODE Baru",
                    "connecting": "Menghubungkan"
                },
                "toolTips": {
                    "disconnected": {
                        "title": "Gagal memulai sesi WhatsApp",
                        "content": "Pastikan ponsel Anda terhubung ke internet dan coba lagi, atau minta QR Code baru."
                    },
                    "qrcode": {
                        "title": "Menunggu pemindaian QR Code",
                        "content": "Klik tombol 'QR CODE' dan pindai QR Code dengan ponsel Anda untuk memulai sesi."
                    },
                    "connected": {
                        "title": "Koneksi berhasil!"
                    },
                    "timeout": {
                        "title": "Koneksi dengan ponsel terputus",
                        "content": "Pastikan ponsel Anda terhubung ke internet dan WhatsApp terbuka, atau klik tombol 'Putuskan Koneksi' untuk mendapatkan QR Code baru."
                    }
                },
                "table": {
                    "id": "ID",
                    "channel": "Saluran",
                    "name": "Nama",
                    "color": "Warna",
                    "number": "Nomor",
                    "status": "Status",
                    "lastUpdate": "Pembaruan Terakhir",
                    "default": "Default",
                    "actions": "Tindakan",
                    "session": "Sesi"
                }
            },
            "contactModal": {
                "title": {
                    "add": "Tambah Kontak",
                    "edit": "Edit Kontak"
                },
                "form": {
                    "mainInfo": "Detail Kontak",
                    "extraInfo": "Informasi Tambahan",
                    "name": "Nama",
                    "number": "Nomor WhatsApp",
                    "email": "Email",
                    "extraName": "Nama Kolom",
                    "extraValue": "Nilai"
                },
                "buttons": {
                    "addExtraInfo": "Tambah Informasi",
                    "okAdd": "Tambah",
                    "okEdit": "Simpan",
                    "cancel": "Batal"
                },
                "success": "Kontak berhasil disimpan."
            },
            "contacts": {
                "title": "Kontak",
                "toasts": {
                    "deleted": "Kontak berhasil dihapus!",
                    "deletedAll": "Semua kontak berhasil dihapus!"
                },
                "searchPlaceholder": "Cari...",
                "confirmationModal": {
                    "deleteTitle": "Hapus ",
                    "deleteAllTitle": "Hapus Semua",
                    "importTitle": "Impor Kontak",
                    "deleteMessage": "Apakah Anda yakin ingin menghapus kontak ini? Semua tiket terkait akan hilang."
                }
            },
            backendErrors: {
                ERR_CONNECTION_CREATION_COUNT: "Batas koneksi tercapai. Hubungi dukungan untuk perubahan.",
                ERR_CREATING_MESSAGE: "Kesalahan saat membuat pesan dalam basis data.",
                ERR_CREATING_TICKET: "Kesalahan saat membuat tiket dalam basis data.",
                ERR_DELETE_WAPP_MSG: "Tidak dapat menghapus pesan WhatsApp.",
                ERR_DUPLICATED_CONTACT: "Kontak dengan nomor ini sudah ada.",
                ERR_EDITING_WAPP_MSG: "Tidak dapat mengedit pesan WhatsApp.",
                ERR_FETCH_WAPP_MSG: "Kesalahan mengambil pesan WhatsApp. Mungkin sudah terlalu lama.",
                ERR_INVALID_CREDENTIALS: "Kredensial tidak valid. Coba lagi.",
                ERR_NO_CONTACT_FOUND: "Tidak ada kontak ditemukan dengan ID ini.",
                ERR_NO_DEF_WAPP_FOUND: "Tidak ada WhatsApp default ditemukan. Periksa halaman koneksi.",
                ERR_NO_INTEGRATION_FOUND: "Integrasi tidak ditemukan.",
                ERR_NO_OTHER_WHATSAPP: "Setidaknya harus ada satu WhatsApp default.",
                ERR_NO_PERMISSION: "Anda tidak memiliki izin untuk mengakses sumber daya ini.",
                ERR_NO_SETTING_FOUND: "Pengaturan dengan ID ini tidak ditemukan.",
                ERR_NO_TAG_FOUND: "Tag tidak ditemukan.",
                ERR_NO_TICKET_FOUND: "Tidak ada tiket ditemukan dengan ID ini.",
                ERR_NO_USER_FOUND: "Tidak ada pengguna ditemukan dengan ID ini.",
                ERR_NO_WAPP_FOUND: "Tidak ada WhatsApp ditemukan dengan ID ini.",
                ERR_OPEN_USER_TICKET: "Tiket untuk kontak ini sudah dibuka.",
                ERR_OTHER_OPEN_TICKET: "Tiket untuk kontak ini sudah dibuka.",
                ERR_OUT_OF_HOURS: "Di luar jam kerja!",
                ERR_QUEUE_COLOR_ALREADY_EXISTS: "Warna ini sudah digunakan, pilih warna lain.",
                ERR_SENDING_WAPP_MSG: "Kesalahan mengirim pesan WhatsApp. Periksa halaman koneksi.",
                ERR_SESSION_EXPIRED: "Sesi telah berakhir. Harap masuk kembali.",
                ERR_USER_CREATION_COUNT: "Batas pengguna tercapai. Hubungi dukungan untuk perubahan.",
                ERR_USER_CREATION_DISABLED: "Pembuatan pengguna telah dinonaktifkan oleh admin.",
                ERR_WAPP_CHECK_CONTACT: "Tidak dapat memverifikasi kontak WhatsApp. Periksa halaman koneksi.",
                ERR_WAPP_DOWNLOAD_MEDIA: "Tidak dapat mengunduh media dari WhatsApp. Periksa halaman koneksi.",
                ERR_WAPP_GREETING_REQUIRED: "Pesan sambutan wajib jika ada lebih dari satu antrian.",
                ERR_WAPP_INVALID_CONTACT: "Ini bukan nomor WhatsApp yang valid.",
                ERR_WAPP_NOT_INITIALIZED: "Sesi WhatsApp ini belum dimulai. Periksa halaman koneksi.",
            },
        },
    },
};

export { messages };

