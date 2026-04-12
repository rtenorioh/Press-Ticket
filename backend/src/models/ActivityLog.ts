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
import User from "./User";

@Table
class ActivityLog extends Model<InferAttributes<ActivityLog>, InferCreationAttributes<ActivityLog>> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  declare user: NonAttribute<User>;

  @Column
  action: string;

  @Column
  description: string;

  @Column(DataType.STRING)
  entityType: CreationOptional<string>;

  @Column(DataType.INTEGER)
  entityId: CreationOptional<number>;

  @Column(DataType.JSON)
  additionalData: object | null;

  @Column(DataType.STRING)
  ip: string | null;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;
}

export default ActivityLog;
