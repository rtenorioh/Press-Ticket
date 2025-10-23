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

  @Column(DataType.ENUM("join", "leave", "update", "admin_changed", "membership_request"))
  eventType: string;

  @Column(DataType.JSON)
  participants: string[];

  @Column
  action: string;

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
