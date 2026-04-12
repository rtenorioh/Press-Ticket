import { InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey
} from "sequelize-typescript";
import User from "./User";
import Video from "./Video";

@Table
class VideoUser extends Model<InferAttributes<VideoUser>, InferCreationAttributes<VideoUser>> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @ForeignKey(() => Video)
  @Column
  videoId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;
}

export default VideoUser;
