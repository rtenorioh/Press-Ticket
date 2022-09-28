import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  BelongsToMany,
  HasMany
} from "sequelize-typescript";
import Contact from "./Contact";
import ContactTag from "./ContactTag";

@Table
class Tag extends Model<Tag> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  color: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsToMany(() => Contact, () => ContactTag)
  contacts: Array<Contact & { ContactTag: ContactTag }>;

  @HasMany(() => ContactTag)
  contacttag: ContactTag[];
}

export default Tag;
