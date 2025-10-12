import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  HasMany
} from "sequelize-typescript";
import Contact from "./Contact";

@Table({ tableName: "ClientStatus" })
class ClientStatus extends Model<ClientStatus> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  color: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Contact, { foreignKey: "status", sourceKey: "name" })
  contacts: Contact[];
}

export default ClientStatus;
