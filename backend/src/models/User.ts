import { compare, hash } from "bcryptjs";
import { InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from "sequelize";
import {
  AutoIncrement,
  BeforeCreate,
  BeforeUpdate,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import Queue from "./Queue";
import Ticket from "./Ticket";
import UserQueue from "./UserQueue";
import UserWhatsapp from "./UserWhatsapp";
import Whatsapp from "./Whatsapp";

@Table
class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @Column
  name: string;

  @Column
  email: string;

  @Column(DataType.VIRTUAL)
  password: CreationOptional<string>;

  @Column(DataType.STRING)
  passwordHash: CreationOptional<string>;

  @Default("admin")
  @Column(DataType.STRING)
  profile: CreationOptional<string>;

  @Default(true)
  @Column(DataType.BOOLEAN)
  active: CreationOptional<boolean>;

  @Default(false)
  @Column(DataType.BOOLEAN)
  online: CreationOptional<boolean>;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isTricked: CreationOptional<boolean>;

  @Default(0)
  @Column(DataType.INTEGER)
  tokenVersion: CreationOptional<number>;

  @Default("00:00")
  @Column(DataType.STRING)
  startWork: CreationOptional<string>;

  @Default("23:59")
  @Column(DataType.STRING)
  endWork: CreationOptional<string>;

  @Column(DataType.STRING)
  whatsappNumber: string | null;

  @Column(DataType.STRING)
  passwordResetToken: string | null;

  @Column(DataType.DATE)
  passwordResetExpires: Date | null;

  @Column(DataType.STRING)
  currentSessionId: string | null;

  @Column(DataType.DATE)
  lastLoginAt: CreationOptional<Date>;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;

  @HasMany(() => Ticket)
  declare tickets: NonAttribute<Ticket[]>;

  @BelongsToMany(() => Queue, () => UserQueue)
  declare queues: NonAttribute<Queue[]>;

  @BelongsToMany(() => Whatsapp, () => UserWhatsapp)
  declare whatsapps: NonAttribute<Whatsapp[]>;

  @BeforeUpdate
  @BeforeCreate
  static hashPassword = async (instance: User): Promise<void> => {
    if (instance.password) {
      instance.passwordHash = await hash(instance.password, 8);
    }
  };

  public checkPassword = async (password: string): Promise<boolean> => {
    return compare(password, this.passwordHash);
  };
}

export default User;
