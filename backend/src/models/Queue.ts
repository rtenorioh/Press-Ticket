import { InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from "sequelize";
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  DataType,
  BelongsToMany
} from "sequelize-typescript";
import User from "./User";
import UserQueue from "./UserQueue";

import Whatsapp from "./Whatsapp";
import WhatsappQueue from "./WhatsappQueue";

@Table
class Queue extends Model<InferAttributes<Queue>, InferCreationAttributes<Queue>> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @AllowNull(false)
  @Unique
  @Column
  name: string;

  @AllowNull(false)
  @Unique
  @Column
  color: string;

  @Column(DataType.STRING)
  greetingMessage: CreationOptional<string>;

  @Column(DataType.STRING)
  startWork: CreationOptional<string>;

  @Column(DataType.STRING)
  endWork: CreationOptional<string>;

  @Column(DataType.STRING)
  absenceMessage: CreationOptional<string>;

  @Column(DataType.STRING)
  startBreak: CreationOptional<string>;

  @Column(DataType.STRING)
  endBreak: CreationOptional<string>;

  @Column(DataType.STRING)
  breakMessage: CreationOptional<string>;

  @Column(DataType.STRING)
  n8nUrl: CreationOptional<string>;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  n8nEnabled: CreationOptional<boolean>;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;

  @BelongsToMany(() => Whatsapp, () => WhatsappQueue)
  declare whatsapps: NonAttribute<Array<Whatsapp & { WhatsappQueue: WhatsappQueue }>>;

  @BelongsToMany(() => User, () => UserQueue)
  declare users: NonAttribute<Array<User & { UserQueue: UserQueue }>>;
}

export default Queue;
