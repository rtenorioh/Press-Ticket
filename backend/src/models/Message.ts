import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import Contact from "./Contact";
import OldMessage from "./OldMessage";
import Ticket from "./Ticket";

@Table
class Message extends Model<Message> {
  @PrimaryKey
  @Column
  id: string;

  @Default(0)
  @Column
  ack: number;

  @Default(false)
  @Column
  read: boolean;

  @Default(false)
  @Column
  fromMe: boolean;

  @Column(DataType.TEXT)
  body: string;

  @Column(DataType.STRING)
  get mediaUrl(): string | null {
    if (this.getDataValue("mediaUrl")) {
      const backendUrl = (process.env.BACKEND_URL || "").replace(/\/$/, "");
      const proxyPort = process.env.PROXY_PORT;
      const hostPart = backendUrl.replace(/^https?:\/\//, "").split("/")[0];
      const hasPort = /:\d+$/.test(hostPart);
      const baseUrl = hasPort ? backendUrl : `${backendUrl}:${proxyPort}`;
      return `${baseUrl}/public/${this.getDataValue("mediaUrl")}`;
    }
    return null;
  }

  @Column
  mediaType: string;

  @Column
  albumId: string;

  @Column
  fileSize: number;

  @Column
  userId: number;

  @Default(false)
  @Column
  isDeleted: boolean;

  @Default(false)
  @Column
  isEdited: boolean;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  @ForeignKey(() => Message)
  @Column
  quotedMsgId: string;

  @BelongsTo(() => Message, "quotedMsgId")
  quotedMsg: Message;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @HasMany(() => OldMessage)
  oldMessages: OldMessage[];

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact, "contactId")
  contact: Contact;
}

export default Message;
