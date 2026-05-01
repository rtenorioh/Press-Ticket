import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute
} from "sequelize";
import {
  AllowNull,
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
import EmailAttachment from "./EmailAttachment";
import Whatsapp from "./Whatsapp";

@Table
class Email extends Model<
  InferAttributes<Email>,
  InferCreationAttributes<Email>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @AllowNull(true)
  @Column(DataType.STRING)
  messageId: CreationOptional<string>;

  @ForeignKey(() => Whatsapp)
  @Column(DataType.INTEGER)
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  declare whatsapp: NonAttribute<Whatsapp>;

  @AllowNull(true)
  @ForeignKey(() => Contact)
  @Column(DataType.INTEGER)
  contactId: CreationOptional<number>;

  @BelongsTo(() => Contact)
  declare contact: NonAttribute<Contact>;

  @Column(DataType.ENUM("in", "out"))
  direction: "in" | "out";

  @Column(DataType.STRING)
  fromAddress: string;

  @Column(DataType.STRING)
  toAddress: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  subject: CreationOptional<string>;

  @AllowNull(true)
  @Column(DataType.TEXT)
  bodyHtml: CreationOptional<string>;

  @AllowNull(true)
  @Column(DataType.TEXT)
  bodyText: CreationOptional<string>;

  @Default("inbox")
  @Column(DataType.ENUM("inbox", "sent", "trash", "draft"))
  folder: CreationOptional<"inbox" | "sent" | "trash" | "draft">;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isRead: CreationOptional<boolean>;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isStarred: CreationOptional<boolean>;

  @AllowNull(true)
  @Column(DataType.DATE)
  deletedAt: CreationOptional<Date>;

  @AllowNull(true)
  @Column(DataType.STRING)
  hubStatus: CreationOptional<string>;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;

  @HasMany(() => EmailAttachment)
  declare attachments: NonAttribute<EmailAttachment[]>;
}

export default Email;
