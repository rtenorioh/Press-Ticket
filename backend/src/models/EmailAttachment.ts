import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute
} from "sequelize";
import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import Email from "./Email";

@Table
class EmailAttachment extends Model<
  InferAttributes<EmailAttachment>,
  InferCreationAttributes<EmailAttachment>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @ForeignKey(() => Email)
  @Column(DataType.UUID)
  emailId: string;

  @BelongsTo(() => Email)
  declare email: NonAttribute<Email>;

  @Column(DataType.STRING)
  filename: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  mimeType: CreationOptional<string>;

  @Column(DataType.TEXT)
  fileUrl: string;

  @Column(DataType.ENUM("in", "out"))
  direction: "in" | "out";

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;
}

export default EmailAttachment;
