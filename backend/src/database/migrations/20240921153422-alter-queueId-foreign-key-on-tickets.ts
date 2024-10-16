import { QueryInterface } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    const [results]: any = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_NAME = 'Tickets' AND COLUMN_NAME = 'queueId';
    `);

    if (results.length > 0) {
      const constraintName = results[0].CONSTRAINT_NAME;
      if (constraintName) {
        await queryInterface.removeConstraint("Tickets", constraintName);
      }
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
    await queryInterface.removeConstraint(
      "Tickets",
      "Tickets_queueId_custom_foreign"
    );

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
