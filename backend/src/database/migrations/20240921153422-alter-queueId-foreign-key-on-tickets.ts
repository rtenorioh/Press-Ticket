import { QueryInterface } from "sequelize";

type ShowCreateResult = { "Create Table": string };

export default {
  up: async (queryInterface: QueryInterface) => {
    const [results] = (await queryInterface.sequelize.query(
      "SHOW CREATE TABLE Tickets;"
    )) as unknown as [ShowCreateResult[]];
    const createTableSql = results[0]["Create Table"];

    if (
      createTableSql.includes("CONSTRAINT `Tickets_queueId_custom_foreign`")
    ) {
      await queryInterface.removeConstraint(
        "Tickets",
        "Tickets_queueId_custom_foreign"
      );
    }

    await queryInterface.addConstraint("Tickets", {
      fields: ["queueId"],
      type: "foreign key",
      name: "Tickets_queueId_custom_foreign",
      references: {
        table: "Queues",
        field: "id"
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    const [results] = (await queryInterface.sequelize.query(
      "SHOW CREATE TABLE Tickets;"
    )) as unknown as [ShowCreateResult[]];
    const createTableSql = results[0]["Create Table"];

    if (
      createTableSql.includes("CONSTRAINT `Tickets_queueId_custom_foreign`")
    ) {
      await queryInterface.removeConstraint(
        "Tickets",
        "Tickets_queueId_custom_foreign"
      );
    }

    await queryInterface.addConstraint("Tickets", {
      fields: ["queueId"],
      type: "foreign key",
      name: "Tickets_queueId_foreign_idx",
      references: {
        table: "Queues",
        field: "id"
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE"
    });
  }
};
