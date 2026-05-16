import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from "sequelize";
import {
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement
} from "sequelize-typescript";

@Table
class QuickAnswer extends Model<
  InferAttributes<QuickAnswer>,
  InferCreationAttributes<QuickAnswer>
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @Column(DataType.TEXT)
  shortcut: string;

  @Column(DataType.TEXT)
  message: string;

  @Column(DataType.STRING)
  mediaPath: CreationOptional<string>;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;
}

export default QuickAnswer;
