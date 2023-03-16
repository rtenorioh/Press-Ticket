import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Whatsapps", "outOfWorkMessage", {
      type: DataTypes.TEXT,
      defaultValue: ""
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Whatsapps", "outOfWorkMessage");
  }
};
