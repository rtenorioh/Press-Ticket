import { QueryInterface } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    const [results]: any = await queryInterface.sequelize.query(
      "SHOW CREATE TABLE Tickets;"
    );
    const createTableSql = results[0]["Create Table"];

    if (
      createTableSql.includes("CONSTRAINT `Tickets_queueId_custom_foreign`")
    ) {
      await queryInterface.removeConstraint(
        "Tickets",
        "Tickets_queueId_custom_foreign"
      );
    }

    await queryInterface.addConstraint("Tickets", ["queueId"], {
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
    const [results]: any = await queryInterface.sequelize.query(
      "SHOW CREATE TABLE Tickets;"
    );
    const createTableSql = results[0]["Create Table"];

    if (
      createTableSql.includes("CONSTRAINT `Tickets_queueId_custom_foreign`")
    ) {
      await queryInterface.removeConstraint(
        "Tickets",
        "Tickets_queueId_custom_foreign"
      );
    }

    await queryInterface.addConstraint("Tickets", ["queueId"], {
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
