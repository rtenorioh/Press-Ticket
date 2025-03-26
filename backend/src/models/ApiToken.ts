import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType
} from "sequelize-typescript";

@Table
class ApiToken extends Model<ApiToken> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  token: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    get(this: ApiToken): string[] {
      const rawValue = this.getDataValue("permissions");
      if (!rawValue) return [];

      try {
        const parsedValue = JSON.parse(rawValue);
        return Array.isArray(parsedValue) ? parsedValue : [];
      } catch (error) {
        console.error("Error parsing permissions:", error);
        return [];
      }
    },
    set(this: ApiToken, value: string[] | null): void {
      if (Array.isArray(value)) {
        this.setDataValue("permissions", JSON.stringify(value));
      } else {
        this.setDataValue("permissions", JSON.stringify([]));
      }
    }
  })
  permissions: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ApiToken;
