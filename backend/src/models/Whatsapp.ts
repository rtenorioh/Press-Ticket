import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Default,
  AllowNull,
  HasMany,
  Unique,
  BelongsToMany
} from "sequelize-typescript";
import Queue from "./Queue";
import Ticket from "./Ticket";
import WhatsappQueue from "./WhatsappQueue";

@Table
class Whatsapp extends Model<Whatsapp> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull
  @Unique
  @Column(DataType.TEXT)
  name: string;

  @Column(DataType.TEXT)
  session: string;

  @Column(DataType.TEXT)
  qrcode: string;

  @Column
  status: string;

  @Column
  number: string;

  @Column
  battery: string;

  @Column
  plugged: boolean;

  @Column
  retries: number;

  @Column(DataType.TEXT)
  greetingMessage: string;

  @Column(DataType.TEXT)
  farewellMessage: string;

  @Default("")
  @Column(DataType.TEXT)
  ratingMessage: string;


  // __________________________________________________________________ Reconhecimento do horario de atendimento
  @Column(DataType.BOOLEAN)
  defineWorkHours: boolean;

  // __________________________________________________________________ Reconhecimento do texto de mensagem, fora de atendimento
  @Column(DataType.TEXT)
  outOfWorkMessage: string;

  // __________________________________________________________________ Reconhecimento dos dias que vão ou não atender
  @Column(DataType.BOOLEAN)
  monday: boolean;

  @Column(DataType.BOOLEAN)
  tuesday: boolean;

  @Column(DataType.BOOLEAN)
  wednesday: boolean;

  @Column(DataType.BOOLEAN)
  thursday: boolean;

  @Column(DataType.BOOLEAN)
  friday: boolean;

  @Column(DataType.BOOLEAN)
  saturday: boolean;

  @Column(DataType.BOOLEAN)
  sunday: boolean;

  // __________________________________________________________________ Reconhecimento do horario de atendimento da segunda feira
  @Column(DataType.TEXT)
  StartDefineWorkHoursMonday: string;

  @Column(DataType.TEXT)
  EndDefineWorkHoursMonday: string;

  @Column(DataType.TEXT)
  StartDefineWorkHoursMondayLunch: string;

  @Column(DataType.TEXT)
  EndDefineWorkHoursMondayLunch: string;

  // __________________________________________________________________ Reconhecimento do horario de atendimento da terça feira
  @Column(DataType.TEXT)
  StartDefineWorkHoursTuesday: string;

  @Column(DataType.TEXT)
  EndDefineWorkHoursTuesday: string;

  @Column(DataType.TEXT)
  StartDefineWorkHoursTuesdayLunch: string;

  @Column(DataType.TEXT)
  EndDefineWorkHoursTuesdayLunch: string;

  // __________________________________________________________________ Reconhecimento do horario de atendimento da quarta feira
  @Column(DataType.TEXT)
  StartDefineWorkHoursWednesday: string;

  @Column(DataType.TEXT)
  EndDefineWorkHoursWednesday: string;

  @Column(DataType.TEXT)
  StartDefineWorkHoursWednesdayLunch: string;

  @Column(DataType.TEXT)
  EndDefineWorkHoursWednesdayLunch: string;

  // __________________________________________________________________ Reconhecimento do horario de atendimento da quinta feira
  @Column(DataType.TEXT)
  StartDefineWorkHoursThursday: string;

  @Column(DataType.TEXT)
  EndDefineWorkHoursThursday: string;

  @Column(DataType.TEXT)
  StartDefineWorkHoursThursdayLunch: string;

  @Column(DataType.TEXT)
  EndDefineWorkHoursThursdayLunch: string;

  // __________________________________________________________________ Reconhecimento do horario de atendimento da quinta feira
  @Column(DataType.TEXT)
  StartDefineWorkHoursFriday: string;

  @Column(DataType.TEXT)
  EndDefineWorkHoursFriday: string;

  @Column(DataType.TEXT)
  StartDefineWorkHoursFridayLunch: string;

  @Column(DataType.TEXT)
  EndDefineWorkHoursFridayLunch: string;

  // __________________________________________________________________ Reconhecimento do horario de atendimento da quinta feira
  @Column(DataType.TEXT)
  StartDefineWorkHoursSaturday: string;

  @Column(DataType.TEXT)
  EndDefineWorkHoursSaturday: string;

  @Column(DataType.TEXT)
  StartDefineWorkHoursSaturdayLunch: string;

  @Column(DataType.TEXT)
  EndDefineWorkHoursSaturdayLunch: string;

  // __________________________________________________________________ Reconhecimento do horario de atendimento da quinta feira
  @Column(DataType.TEXT)
  StartDefineWorkHoursSunday: string;

  @Column(DataType.TEXT)
  EndDefineWorkHoursSunday: string;

  @Column(DataType.TEXT)
  StartDefineWorkHoursSundayLunch: string;

  @Column(DataType.TEXT)
  EndDefineWorkHoursSundayLunch: string;


  @Default(false)
  @AllowNull
  @Column
  isDefault: boolean;

  @Default(false)
  @AllowNull
  @Column
  isDisplay: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Default(false)
  @Column
  isGroup: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  useNPS: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  sendInactiveMessage: boolean;

  @Default("")
  @Column(DataType.TEXT)
  inactiveMessage: string;

  @Default("")
  @Column(DataType.TEXT)
  timeInactiveMessage: string;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @BelongsToMany(() => Queue, () => WhatsappQueue)
  queues: Array<Queue & { WhatsappQueue: WhatsappQueue }>;

  @HasMany(() => WhatsappQueue)
  whatsappQueues: WhatsappQueue[];
}

export default Whatsapp;
