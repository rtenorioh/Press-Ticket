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
  BelongsToMany,
  DataType,
  Default
} from "sequelize-typescript";
import User from "./User";
import VideoUser from "./VideoUser";

@Table
class Video extends Model<
  InferAttributes<Video>,
  InferCreationAttributes<Video>
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @Column
  title: string;

  @Column
  url: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  active: CreationOptional<boolean>;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;

  @BelongsToMany(() => User, () => VideoUser)
  declare users: NonAttribute<User[]>;
}

export default Video;
