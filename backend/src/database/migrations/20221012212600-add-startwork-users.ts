import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Users", "startWork", {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "00:00"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Users", "startWork");
  }
};
