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

  @Column({ type: DataType.STRING, allowNull: true })
  theme: string;

  @Column({ type: DataType.STRING, allowNull: true })
  company: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  url: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  primaryColor: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  secondaryColor: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  backgroundDefault: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  backgroundPaper: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  favico: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  logo: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  logoTicket: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  toolbarColor: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  toolbarIconColor: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  menuItens: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  sub: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  textPrimary: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  textSecondary: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  divide: string | null;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;
}

export default Personalization;
