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
class Personalization extends Model<Personalization> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column(DataType.STRING)
  theme: string;

  @Column(DataType.STRING)
  company: string;

  @Column(DataType.STRING)
  url: string;

  @Column(DataType.STRING)
  primaryColor: string;

  @Column(DataType.STRING)
  secondaryColor: string;

  @Column(DataType.STRING)
  backgroundDefault: string;

  @Column(DataType.STRING)
  backgroundPaper: string;

  @Column(DataType.TEXT)
  favico: string | null;

  @Column(DataType.TEXT)
  logo: string | null;

  @Column(DataType.TEXT)
  logoTicket: string | null;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;
}

export default Personalization;
