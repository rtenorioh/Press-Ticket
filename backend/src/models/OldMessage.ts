import { InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from "sequelize";
import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";

import Message from "./Message";

@Table
class OldMessage extends Model<InferAttributes<OldMessage>, InferCreationAttributes<OldMessage>> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @Column(DataType.TEXT)
  body: string;

  @CreatedAt
  @Column(DataType.DATE(6))
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  @Column(DataType.DATE(6))
  declare updatedAt: CreationOptional<Date>;

  @ForeignKey(() => Message)
  @Column(DataType.STRING)
  messageId: string;

  @BelongsTo(() => Message, "messageId")
  declare message: NonAttribute<Message>;
}

export default OldMessage;
