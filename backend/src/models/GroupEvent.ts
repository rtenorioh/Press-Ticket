import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute
} from "sequelize";
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
class GroupEvent extends Model<
  InferAttributes<GroupEvent>,
  InferCreationAttributes<GroupEvent>
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @Column(DataType.STRING)
  groupId: CreationOptional<string>;

  @Column(DataType.STRING)
  groupName: CreationOptional<string>;

  @Column
  eventType: string;

  @Column(DataType.STRING)
  participantId: CreationOptional<string>;

  @Column(DataType.STRING)
  participantName: CreationOptional<string>;

  @Column(DataType.TEXT)
  oldValue: CreationOptional<string>;

  @Column(DataType.TEXT)
  newValue: CreationOptional<string>;

  @Column(DataType.STRING)
  performedBy: CreationOptional<string>;

  @Column(DataType.STRING)
  performedByName: CreationOptional<string>;

  @Column(DataType.DATE)
  timestamp: CreationOptional<Date>;

  @Column(DataType.JSON)
  metadata: CreationOptional<Record<string, unknown>>;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;

  @BelongsTo(() => Whatsapp)
  declare whatsapp: NonAttribute<Whatsapp>;
}

export default GroupEvent;
