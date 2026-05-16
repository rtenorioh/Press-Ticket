import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from "sequelize";
import { logger } from "../utils/logger";
import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";

@Table
class ApiToken extends Model<
  InferAttributes<ApiToken>,
  InferCreationAttributes<ApiToken>
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @Column
  name: string;

  @Column
  token: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    defaultValue: "[]",
    get(this: ApiToken): string[] {
      try {
        const value = this.getDataValue("permissions") as string;
        return value ? JSON.parse(value) : [];
      } catch (error) {
        logger.error(`Error parsing permissions: ${error}`);
        return [];
      }
    },
    set(this: ApiToken, value: string[] | string): void {
      if (Array.isArray(value)) {
        this.setDataValue("permissions", JSON.stringify(value));
      } else if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            this.setDataValue("permissions", value);
          } else {
            this.setDataValue("permissions", "[]");
          }
        } catch {
          this.setDataValue("permissions", "[]");
        }
      } else {
        this.setDataValue("permissions", "[]");
      }
    }
  })
  permissions: string;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;
}

export default ApiToken;
