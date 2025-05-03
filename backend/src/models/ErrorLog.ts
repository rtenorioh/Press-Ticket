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
  source: string; // 'backend' ou 'frontend'

  @Column
  userId: number; // ID do usuário, se disponível

  @Column
  username: string; // Nome do usuário, se disponível

  @Column(DataType.TEXT)
  message: string; // Mensagem de erro

  @Column(DataType.TEXT)
  stack: string; // Stack trace do erro

  @Column
  url: string; // URL onde ocorreu o erro (para frontend)

  @Column
  userAgent: string; // Informações do navegador (para frontend)

  @Column
  component: string; // Componente onde ocorreu o erro

  @Column
  severity: string; // 'error', 'warning', 'info'

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;
}

export default ErrorLog;
