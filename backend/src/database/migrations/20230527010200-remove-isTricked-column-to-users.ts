import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Users", "isTricked");
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Users", "isTricked", {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    });
  }
};
