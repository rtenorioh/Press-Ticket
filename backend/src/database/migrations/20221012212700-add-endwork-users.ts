import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Users", "endWork", {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "23:59"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Users", "endWork");
  }
};
