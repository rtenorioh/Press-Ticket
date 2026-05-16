import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from "sequelize";
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey
} from "sequelize-typescript";

@Table
class Setting extends Model<
  InferAttributes<Setting>,
  InferCreationAttributes<Setting>
> {
  @PrimaryKey
  @Column
  key: string;

  @Column
  value: string;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;
}

export default Setting;
