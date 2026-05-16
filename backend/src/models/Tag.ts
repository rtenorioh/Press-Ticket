import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute
} from "sequelize";
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BelongsToMany,
  HasMany
} from "sequelize-typescript";
import Contact from "./Contact";
import ContactTag from "./ContactTag";

@Table
class Tag extends Model<InferAttributes<Tag>, InferCreationAttributes<Tag>> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @Column
  name: string;

  @Column
  color: string;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;

  @BelongsToMany(() => Contact, () => ContactTag)
  declare contacts: NonAttribute<Array<Contact & { ContactTag: ContactTag }>>;

  @HasMany(() => ContactTag)
  declare contacttag: NonAttribute<ContactTag[]>;
}

export default Tag;
