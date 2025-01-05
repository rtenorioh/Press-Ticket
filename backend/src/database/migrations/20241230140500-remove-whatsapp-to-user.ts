import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Users", "whatsappId");
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Users", "whatsappId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Whatsapps", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },
};
