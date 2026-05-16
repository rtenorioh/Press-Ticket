import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from "sequelize";
import {
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
  AutoIncrement
} from "sequelize-typescript";

@Table
class ErrorLog extends Model<
  InferAttributes<ErrorLog>,
  InferCreationAttributes<ErrorLog>
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @Column
  source: string;

  @Column(DataType.INTEGER)
  userId: CreationOptional<number>;

  @Column(DataType.STRING)
  username: CreationOptional<string>;

  @Column(DataType.TEXT)
  message: string;

  @Column(DataType.TEXT)
  stack: CreationOptional<string>;

  @Column
  url: string;

  @Column
  userAgent: string;

  @Column
  component: string;

  @Column
  severity: string;

  @CreatedAt
  @Column(DataType.DATE(6))
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  @Column(DataType.DATE(6))
  declare updatedAt: CreationOptional<Date>;
}

export default ErrorLog;
