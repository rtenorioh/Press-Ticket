import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.removeConstraint("Tickets", "Tickets_ibfk_2");

    await queryInterface.addConstraint("Tickets", ["userId"], {
      type: "foreign key",
      name: "Tickets_ibfk_2",
      references: {
        table: "Users",
        field: "id"
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeConstraint("Tickets", "Tickets_ibfk_2");

    await queryInterface.addConstraint("Tickets", ["userId"], {
      type: "foreign key",
      name: "Tickets_ibfk_2",
      references: {
        table: "Users",
        field: "id"
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE"
    });
  }
};
