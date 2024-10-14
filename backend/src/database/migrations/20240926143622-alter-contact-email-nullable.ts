import { DataTypes, QueryInterface } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.changeColumn("Contacts", "email", {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: ""
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.changeColumn("Contacts", "email", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ""
    });
  }
};
