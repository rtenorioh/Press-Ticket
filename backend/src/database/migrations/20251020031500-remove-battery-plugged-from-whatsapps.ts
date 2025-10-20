import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Whatsapps", "battery");
    await queryInterface.removeColumn("Whatsapps", "plugged");
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Whatsapps", "battery", {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.addColumn("Whatsapps", "plugged", {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null
    });
  }
};
