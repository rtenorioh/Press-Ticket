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
class UserSession extends Model<InferAttributes<UserSession>, InferCreationAttributes<UserSession>> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @Column
  sessionId: string;

  @Column
  loginAt: Date;

  @Column(DataType.DATE)
  logoutAt: Date | null;

  @Column
  lastActivity: Date;

  @BelongsTo(() => User)
  declare user: NonAttribute<User>;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;
}

export default UserSession;
