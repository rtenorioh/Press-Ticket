import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Whatsapps", "pairingCode", {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn("Whatsapps", "pairingCodeExpiresAt", {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Whatsapps", "pairingCode");
    await queryInterface.removeColumn("Whatsapps", "pairingCodeExpiresAt");
  }
};
