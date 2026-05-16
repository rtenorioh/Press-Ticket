import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from "sequelize";
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
class ContactTag extends Model<
  InferAttributes<ContactTag>,
  InferCreationAttributes<ContactTag>
> {
  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @ForeignKey(() => Tag)
  @Column
  tagId: number;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;
}

export default ContactTag;
