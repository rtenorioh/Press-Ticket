import {
  AllowNull,
  AutoIncrement,
  BelongsToMany,
  Column,
  CreatedAt,
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
class Contact extends Model<Contact> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @AllowNull(true)
  @Unique
  @Column
  number: string;

  @AllowNull(true)
  @Default("")
  @Column
  email: string;

  @Column
  profilePicUrl: string;

  @Default(false)
  @Column
  isGroup: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @Column
  messengerId: string;

  @Column
  instagramId: string;

  @Column
  telegramId: string;

  @Column
  webchatId: string;

  @BelongsToMany(() => Tag, () => ContactTag)
  tags: Array<Tag & { ContactTag: ContactTag }>;

  @HasMany(() => ContactCustomField)
  extraInfo: ContactCustomField[];
}

export default Contact;
