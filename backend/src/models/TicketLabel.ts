import { InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from "sequelize";
import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";

import Ticket from "./Ticket";
import WhatsappLabel from "./WhatsappLabel";

@Table({ tableName: "TicketLabels" })
class TicketLabel extends Model<InferAttributes<TicketLabel>, InferCreationAttributes<TicketLabel>> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @ForeignKey(() => Ticket)
  @Column(DataType.INTEGER)
  ticketId: number;

  @ForeignKey(() => WhatsappLabel)
  @Column(DataType.INTEGER)
  whatsappLabelId: number;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;

  @BelongsTo(() => Ticket)
  declare ticket: NonAttribute<Ticket>;

  @BelongsTo(() => WhatsappLabel)
  declare whatsappLabel: NonAttribute<WhatsappLabel>;
}

export default TicketLabel;
