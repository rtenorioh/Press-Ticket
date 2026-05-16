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
class Integration extends Model<
  InferAttributes<Integration>,
  InferCreationAttributes<Integration>
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

export default Integration;
