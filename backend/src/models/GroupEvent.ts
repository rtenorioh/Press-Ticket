import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Whatsapp from "./Whatsapp";

@Table
class GroupEvent extends Model<GroupEvent> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @Column
  groupId: string;

  @Column
  groupName: string;

  @Column
  eventType: string;

  @Column
  participantId: string;

  @Column
  participantName: string;

  @Column(DataType.TEXT)
  oldValue: string;

  @Column(DataType.TEXT)
  newValue: string;

  @Column
  performedBy: string;

  @Column
  performedByName: string;

  @Column
  timestamp: Date;

  @Column(DataType.JSON)
  metadata: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;
}

export default GroupEvent;
