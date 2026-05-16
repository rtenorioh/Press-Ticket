import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute
} from "sequelize";
import {
  AllowNull,
  AutoIncrement,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt
} from "sequelize-typescript";
import Queue from "./Queue";
import Ticket from "./Ticket";
import WhatsappQueue from "./WhatsappQueue";

@Table
class Whatsapp extends Model<
  InferAttributes<Whatsapp>,
  InferCreationAttributes<Whatsapp>
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @AllowNull
  @Unique
  @Column(DataType.TEXT)
  name: string;

  @Column(DataType.TEXT)
  session: CreationOptional<string>;

  @Column(DataType.TEXT)
  qrcode: CreationOptional<string>;

  @Column(DataType.STRING)
  status: CreationOptional<string>;

  @Column(DataType.STRING)
  number: CreationOptional<string>;

  @Column(DataType.INTEGER)
  retries: CreationOptional<number>;

  @Column(DataType.TEXT)
  greetingMessage: CreationOptional<string>;

  @Column(DataType.TEXT)
  farewellMessage: CreationOptional<string>;

  @Column(DataType.STRING)
  type: CreationOptional<string>;

  @Default(false)
  @AllowNull
  @Column(DataType.BOOLEAN)
  isDefault: CreationOptional<boolean>;

  @Default(false)
  @AllowNull
  @Column(DataType.BOOLEAN)
  isDisplay: CreationOptional<boolean>;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isBusiness: CreationOptional<boolean>;

  @AllowNull
  @Column({
    type: DataType.STRING,
    defaultValue: "#5C59A0"
  })
  color: CreationOptional<string>;

  @AllowNull
  @Column(DataType.STRING(20))
  pairingCode: CreationOptional<string>;

  @AllowNull
  @Column(DataType.DATE)
  pairingCodeExpiresAt: CreationOptional<Date>;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;

  @HasMany(() => Ticket)
  declare tickets: NonAttribute<Ticket[]>;

  @BelongsToMany(() => Queue, () => WhatsappQueue)
  declare queues: NonAttribute<Array<Queue & { WhatsappQueue: WhatsappQueue }>>;

  @HasMany(() => WhatsappQueue)
  declare whatsappQueues: NonAttribute<WhatsappQueue[]>;
}

export default Whatsapp;
