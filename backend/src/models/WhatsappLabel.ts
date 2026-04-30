import { InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from "sequelize";
import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";

import Whatsapp from "./Whatsapp";
import TicketLabel from "./TicketLabel";

@Table({ tableName: "WhatsappLabels" })
class WhatsappLabel extends Model<InferAttributes<WhatsappLabel>, InferCreationAttributes<WhatsappLabel>> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @ForeignKey(() => Whatsapp)
  @Column(DataType.INTEGER)
  whatsappId: number;

  @Column(DataType.STRING)
  labelId: string;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  hexColor: string | null;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;

  @BelongsTo(() => Whatsapp)
  declare whatsapp: NonAttribute<Whatsapp>;

  @HasMany(() => TicketLabel)
  declare ticketLabels: NonAttribute<TicketLabel[]>;
}

export default WhatsappLabel;
