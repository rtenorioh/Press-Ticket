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
class MessageReaction extends Model<MessageReaction> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

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
  createdAt!: Date;

  @Column(DataType.DATE)
  updatedAt!: Date;
}

export default MessageReaction;
