import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Users", "allHistoric", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "desabled"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Users", "allHistoric");
  }
};
