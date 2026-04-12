import { InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from "sequelize";
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Message from "./Message";

@Table
class PollVote extends Model<InferAttributes<PollVote>, InferCreationAttributes<PollVote>> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @ForeignKey(() => Message)
  @Column
  pollMessageId: string;

  @Column
  voterId: string;

  @Column
  voterName: string;

  @Column
  selectedOptions: string;

  @Column
  timestamp: Date;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;

  @BelongsTo(() => Message)
  declare message: NonAttribute<Message>;
}

export default PollVote;
