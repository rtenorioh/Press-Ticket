import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  ForeignKey
} from "sequelize-typescript";
import Tag from "./Tag";
import Contact from "./Contact";

@Table({
  tableName: "ContactTags"
})
class ContactTag extends Model<ContactTag> {
  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @ForeignKey(() => Tag)
  @Column
  tagId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ContactTag;
