import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from "sequelize";
import {
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import User from "./User";
import Whatsapp from "./Whatsapp";

@Table
class UserWhatsapp extends Model<
  InferAttributes<UserWhatsapp>,
  InferCreationAttributes<UserWhatsapp>
> {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;
}

export default UserWhatsapp;
