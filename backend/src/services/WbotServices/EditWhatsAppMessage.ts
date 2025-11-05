import AppError from "../../errors/AppError";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import OldMessage from "../../models/OldMessage";

const EditWhatsAppMessage = async (
  messageId: string,
  newBody: string
): Promise<Message> => {
  const message = await Message.findByPk(messageId, {
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["contact"]
      }
    ]
  });
  if (!message) {
    throw new AppError("No message found with this ID.");
  }

  if (!newBody || newBody.trim() === "") {
    throw new AppError("O novo texto da mensagem não pode estar vazio.");
  }

  const { ticket } = message;

  const oldBody = message.body;
  console.log(`[EditWhatsAppMessage] ========================================`);
  console.log(`[EditWhatsAppMessage] Iniciando edição da mensagem ${messageId}`);
  console.log(`[EditWhatsAppMessage] Corpo ATUAL no banco: "${oldBody}"`);
  console.log(`[EditWhatsAppMessage] Corpo NOVO solicitado: "${newBody}"`);
  console.log(`[EditWhatsAppMessage] ========================================`);

  let messageToEdit;
  try {
    messageToEdit = await GetWbotMessage(ticket, messageId);
  } catch (getMessageError: any) {
    console.error(`[EditWhatsAppMessage] Erro ao buscar mensagem no WhatsApp:`, getMessageError);
    throw new AppError("ERR_FETCH_WAPP_MSG_TO_EDIT");
  }

  try {
    console.log(`[EditWhatsAppMessage] Tentando editar mensagem com novo texto: "${newBody.substring(0, 50)}..."`);
    const res = await messageToEdit.edit(newBody);
    
    if (res === null) {
      console.error(`[EditWhatsAppMessage] Edição retornou null - mensagem pode ser muito antiga ou não editável`);
      throw new Error("Não foi possível editar a mensagem. Ela pode ser muito antiga (mais de 15 minutos) ou não ser editável.");
    }
    
    console.log(`[EditWhatsAppMessage] Mensagem editada com sucesso no WhatsApp`);
  } catch (err: any) {
    console.error(`[EditWhatsAppMessage] Erro ao editar mensagem no WhatsApp:`, err.message);
    throw new AppError("ERR_EDITING_WAPP_MSG");
  }


  if (typeof oldBody === "string" && oldBody !== newBody) {
    console.log(`[EditWhatsAppMessage] Salvando histórico: "${oldBody}" -> "${newBody}"`);
    
    const existingHistory = await OldMessage.findOne({
      where: {
        messageId: message.id,
        body: oldBody
      }
    });

    if (!existingHistory) {
      const newHistory = await OldMessage.create({
        messageId: message.id,
        body: oldBody
      });
      console.log(`[EditWhatsAppMessage] Histórico salvo com ID: ${newHistory.id}, body: "${newHistory.body}"`);
    } else {
      console.log(`[EditWhatsAppMessage] Histórico já existe (ID: ${existingHistory.id}), pulando duplicata`);
    }
  } else {
    console.log(`[EditWhatsAppMessage] Histórico não salvo - oldBody: "${oldBody}", newBody: "${newBody}", são iguais: ${oldBody === newBody}`);
  }

  await message.update({
    body: newBody,
    isEdited: true,
    updatedAt: new Date()
  });

  const mostRecentMessage = await Message.findOne({
    where: { ticketId: ticket.id },
    order: [["updatedAt", "DESC"]]
  });

  if (mostRecentMessage && mostRecentMessage.id === messageId) {
    await ticket.update({ lastMessage: newBody });
    await ticket.reload();
  }

  await message.reload({
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["contact"]
      },
      {
        model: OldMessage,
        as: "oldMessages",
        separate: true,
        order: [["createdAt", "DESC"]]
      }
    ]
  });

  console.log(`[EditWhatsAppMessage] Mensagem recarregada com ${message.oldMessages?.length || 0} históricos`);
  if (message.oldMessages && message.oldMessages.length > 0) {
    console.log(`[EditWhatsAppMessage] Históricos encontrados:`, 
      message.oldMessages.map((om: any) => ({ id: om.id, body: om.body?.substring(0, 30) }))
    );
  }

  return message;
};

export default EditWhatsAppMessage;
