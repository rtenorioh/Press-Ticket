import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey
} from "sequelize-typescript";
import User from "./User";
import Video from "./Video";

@Table
class VideoUser extends Model<VideoUser> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Video)
  @Column
  videoId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default VideoUser;
