import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute
} from "sequelize";
import {
  AutoIncrement,
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
import Message from "./Message";
import Queue from "./Queue";
import TicketLabel from "./TicketLabel";
import User from "./User";
import Whatsapp from "./Whatsapp";

@Table
class Ticket extends Model<
  InferAttributes<Ticket>,
  InferCreationAttributes<Ticket>
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @Column({ type: DataType.STRING, defaultValue: "pending" })
  status: CreationOptional<string>;

  @Column(DataType.INTEGER)
  unreadMessages: CreationOptional<number>;

  @Column(DataType.STRING)
  lastMessage: CreationOptional<string>;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isGroup: CreationOptional<boolean>;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId: number | null;

  @BelongsTo(() => User, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  declare user: NonAttribute<User>;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  declare contact: NonAttribute<Contact>;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  declare whatsapp: NonAttribute<Whatsapp>;

  @ForeignKey(() => Queue)
  @Column(DataType.INTEGER)
  queueId: number | null;

  @BelongsTo(() => Queue, {
    onDelete: "SET NULL",
    onUpdate: "CASCADE"
  })
  declare queue: NonAttribute<Queue>;

  @Column(DataType.STRING)
  channel: string | null;

  @Default(false)
  @Column(DataType.BOOLEAN)
  pinnedChat: CreationOptional<boolean>;

  @Default(false)
  @Column(DataType.BOOLEAN)
  mutedChat: CreationOptional<boolean>;

  @Default(false)
  @Column(DataType.BOOLEAN)
  favoritedChat: CreationOptional<boolean>;

  @HasMany(() => Message)
  declare messages: NonAttribute<Message[]>;

  @HasMany(() => TicketLabel)
  declare ticketLabels: NonAttribute<TicketLabel[]>;
}

export default Ticket;
