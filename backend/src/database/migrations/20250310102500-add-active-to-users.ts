import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Users", "active", {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });

    await queryInterface.bulkUpdate(
      "Users",
      { active: true },
      { active: null }
    );
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Users", "active");
  }
};
