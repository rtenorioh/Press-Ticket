import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Message from "./Message";

@Table
class PollVote extends Model<PollVote> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

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
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Message)
  message: Message;
}

export default PollVote;
