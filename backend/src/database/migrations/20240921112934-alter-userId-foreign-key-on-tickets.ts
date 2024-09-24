import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.removeConstraint("tickets", "tickets_ibfk_2");

    await queryInterface.addConstraint("tickets", ["userId"], {
      type: "foreign key",
      name: "tickets_ibfk_2",
      references: {
        table: "users",
        field: "id"
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeConstraint("tickets", "tickets_ibfk_2");

    await queryInterface.addConstraint("tickets", ["userId"], {
      type: "foreign key",
      name: "tickets_ibfk_2",
      references: {
        table: "users",
        field: "id"
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE"
    });
  }
};
