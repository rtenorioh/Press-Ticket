import { InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  ForeignKey
} from "sequelize-typescript";
import Queue from "./Queue";
import User from "./User";

@Table
class UserQueue extends Model<InferAttributes<UserQueue>, InferCreationAttributes<UserQueue>> {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;
}

export default UserQueue;
