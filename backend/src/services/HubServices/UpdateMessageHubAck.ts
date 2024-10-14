import Message from "../../models/Message";

export const UpdateMessageAck = async (messageId: string): Promise<void> => {
  const message = await Message.findOne({
    where: {
      id: messageId
    }
  });

  if (!message) {
    return;
  }

  await message.update({
    ack: 3
  });
};
