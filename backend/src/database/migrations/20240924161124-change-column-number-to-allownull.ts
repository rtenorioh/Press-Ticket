import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("Contacts", "number", {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("Contacts", "number", {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    });
  }
};
