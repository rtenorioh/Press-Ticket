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
    defaultValue: "[]",
    get(this: ApiToken): string[] {
      try {
        const value = this.getDataValue("permissions") as string;
        return value ? JSON.parse(value) : [];
      } catch (error) {
        console.error("Error parsing permissions:", error);
        return [];
      }
    },
    set(this: ApiToken, value: string[] | string): void {
      if (Array.isArray(value)) {
        this.setDataValue("permissions", JSON.stringify(value));
      } else if (typeof value === 'string') {
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
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ApiToken;
