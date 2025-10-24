interface FormatLastMessageParams {
  body: string;
  mediaType?: string;
  mimetype?: string;
  messageType?: string;
  fromMe: boolean;
  filename?: string;
}

const FormatLastMessage = ({
  body,
  mediaType,
  mimetype,
  messageType,
  fromMe,
  filename
}: FormatLastMessageParams): string => {
  const arrow = fromMe ? "🢅" : "🢇";

  if (messageType === "location") {
    return `${arrow} 🗺 Localização - Ver no Google Maps`;
  }

  if (mediaType && mediaType !== "chat" && mediaType !== "text") {
    let fileIcon: string;
    
    const mimeTypePrefix = mimetype ? mimetype.split("/")[0] : mediaType;

    switch (mimeTypePrefix) {
      case "audio":
        fileIcon = "🔉 Mensagem de áudio";
        break;

      case "image":
        fileIcon = "🖼️ Arquivo de imagem";
        break;

      case "video":
        fileIcon = "🎬 Arquivo de vídeo";
        break;

      case "document":
        fileIcon = "📘 Documento";
        break;

      case "application":
        fileIcon = "📎 Arquivo";
        break;

      case "poll_creation":
        fileIcon = "📊 Enquete";
        break;  

      case "ciphertext":
        fileIcon = "⚠️ Notificação";
        break;

      case "e2e_notification":
        fileIcon = "⛔ Notificação";
        break;

      case "revoked":
        fileIcon = "❌ Apagado";
        break;

      default:
        fileIcon = filename || "🤷‍♂️ Tipo Desconhecido";
        break;
    }

    return `${arrow} ${fileIcon}`;
  }

  if (!body || body.trim() === "") {
    return `${arrow} `;
  }

  return `${arrow} ${body}`;
};

export default FormatLastMessage;
