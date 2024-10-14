import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Whatsapps", "type", {
      type: DataTypes.TEXT
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Whatsapps", "type");
  }
};
