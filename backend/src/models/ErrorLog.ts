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
class ErrorLog extends Model<ErrorLog> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  source: string; 

  @Column
  userId: number; 

  @Column
  username: string; 

  @Column(DataType.TEXT)
  message: string; 

  @Column(DataType.TEXT)
  stack: string; 

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
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;
}

export default ErrorLog;
