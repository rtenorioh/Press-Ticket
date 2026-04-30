import { InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from "sequelize";
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
class Message extends Model<InferAttributes<Message>, InferCreationAttributes<Message>> {
  @PrimaryKey
  @Column
  id: string;

  @Default(0)
  @Column(DataType.INTEGER)
  ack: CreationOptional<number>;

  @Default(false)
  @Column(DataType.BOOLEAN)
  read: CreationOptional<boolean>;

  @Default(false)
  @Column(DataType.BOOLEAN)
  fromMe: CreationOptional<boolean>;

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

  @Column(DataType.STRING)
  mediaType: CreationOptional<string>;

  @Column(DataType.STRING)
  albumId: CreationOptional<string>;

  @Column(DataType.INTEGER)
  fileSize: CreationOptional<number>;

  @Column(DataType.INTEGER)
  userId: CreationOptional<number>;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isDeleted: CreationOptional<boolean>;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isEdited: CreationOptional<boolean>;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isStarred: CreationOptional<boolean>;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isPinned: CreationOptional<boolean>;

  @CreatedAt
  @Column(DataType.DATE(6))
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  @Column(DataType.DATE(6))
  declare updatedAt: CreationOptional<Date>;

  @ForeignKey(() => Message)
  @Column(DataType.STRING)
  quotedMsgId: CreationOptional<string>;

  @BelongsTo(() => Message, "quotedMsgId")
  declare quotedMsg: NonAttribute<Message>;

  @ForeignKey(() => Ticket)
  @Column(DataType.INTEGER)
  ticketId: CreationOptional<number>;

  @BelongsTo(() => Ticket)
  declare ticket: NonAttribute<Ticket>;

  @HasMany(() => OldMessage)
  declare oldMessages: NonAttribute<OldMessage[]>;

  @ForeignKey(() => Contact)
  @Column(DataType.INTEGER)
  contactId: CreationOptional<number>;

  @BelongsTo(() => Contact, "contactId")
  declare contact: NonAttribute<Contact>;
}

export default Message;
