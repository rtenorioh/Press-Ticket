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
  HasMany
} from "sequelize-typescript";
import Contact from "./Contact";

@Table({ tableName: "ClientStatus" })
class ClientStatus extends Model<InferAttributes<ClientStatus>, InferCreationAttributes<ClientStatus>> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @Column
  name: string;

  @Column
  color: string;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;

  @HasMany(() => Contact, { foreignKey: "status", sourceKey: "name" })
  declare contacts: NonAttribute<Contact[]>;
}

export default ClientStatus;
