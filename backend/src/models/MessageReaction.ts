import { InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import {
  Table,
  Model,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Index
} from "sequelize-typescript";

@Table
class MessageReaction extends Model<InferAttributes<MessageReaction>, InferCreationAttributes<MessageReaction>> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @Index
  @Column({ allowNull: false })
  messageId!: string;

  @Index
  @Column({ allowNull: false })
  emoji!: string;

  @Index
  @Column({ allowNull: false })
  senderId!: string;

  @Column(DataType.DATE)
  declare createdAt: CreationOptional<Date>;

  @Column(DataType.DATE)
  declare updatedAt: CreationOptional<Date>;
}

export default MessageReaction;
