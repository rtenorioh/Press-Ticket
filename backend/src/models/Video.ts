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
class Video extends Model<Video> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  title: string;

  @Column
  url: string;

  @Default(true)
  @Column
  active: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsToMany(() => User, () => VideoUser)
  users: User[];
}

export default Video;
