import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Tickets", "pinnedChat", {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    await queryInterface.addColumn("Tickets", "mutedChat", {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Tickets", "pinnedChat");
    await queryInterface.removeColumn("Tickets", "mutedChat");
  }
};
