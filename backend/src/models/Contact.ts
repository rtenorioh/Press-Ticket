import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute
} from "sequelize";
import {
  AllowNull,
  AutoIncrement,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt
} from "sequelize-typescript";
import ContactCustomField from "./ContactCustomField";
import ContactTag from "./ContactTag";
import Tag from "./Tag";
import Ticket from "./Ticket";

@Table
class Contact extends Model<
  InferAttributes<Contact>,
  InferCreationAttributes<Contact>
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @Column
  name: string;

  @AllowNull(true)
  @Unique
  @Column(DataType.STRING)
  number: string | null;

  @AllowNull(true)
  @Default("")
  @Column(DataType.STRING)
  address: CreationOptional<string>;

  @AllowNull(true)
  @Default("")
  @Column(DataType.STRING)
  email: CreationOptional<string>;

  @AllowNull(true)
  @Column(DataType.DATE)
  birthdate: Date | null;

  @AllowNull(true)
  @Default("")
  @Column(DataType.STRING)
  gender: CreationOptional<string>;

  @AllowNull(true)
  @Default("")
  @Column(DataType.STRING)
  status: CreationOptional<string>;

  @AllowNull(true)
  @Column(DataType.DATE)
  lastContactAt: Date | null;

  @AllowNull(true)
  @Default("")
  @Column(DataType.STRING)
  country: CreationOptional<string>;

  @AllowNull(true)
  @Default("")
  @Column(DataType.STRING)
  zip: CreationOptional<string>;

  @AllowNull(true)
  @Default("")
  @Column(DataType.STRING)
  addressNumber: CreationOptional<string>;

  @AllowNull(true)
  @Default("")
  @Column(DataType.STRING)
  addressComplement: CreationOptional<string>;

  @AllowNull(true)
  @Default("")
  @Column(DataType.STRING)
  neighborhood: CreationOptional<string>;

  @AllowNull(true)
  @Default("")
  @Column(DataType.STRING)
  city: CreationOptional<string>;

  @AllowNull(true)
  @Default("")
  @Column(DataType.STRING)
  state: CreationOptional<string>;

  @AllowNull(true)
  @Default("")
  @Column(DataType.STRING)
  cpf: CreationOptional<string>;

  @Column(DataType.STRING)
  profilePicUrl: CreationOptional<string>;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isGroup: CreationOptional<boolean>;

  @Default(false)
  @Column(DataType.BOOLEAN)
  nameManuallyEdited: CreationOptional<boolean>;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;

  @HasMany(() => Ticket)
  declare tickets: NonAttribute<Ticket[]>;

  @AllowNull(true)
  @Column(DataType.STRING)
  numberLid: string | null;

  @Column(DataType.STRING)
  messengerId: string | null;

  @Column(DataType.STRING)
  instagramId: string | null;

  @Column(DataType.STRING)
  telegramId: string | null;

  @Column(DataType.STRING)
  webchatId: string | null;

  @BelongsToMany(() => Tag, () => ContactTag)
  declare tags: NonAttribute<Array<Tag & { ContactTag: ContactTag }>>;

  @HasMany(() => ContactCustomField)
  declare extraInfo: NonAttribute<ContactCustomField[]>;
}

export default Contact;
