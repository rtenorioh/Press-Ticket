import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("Contacts", "profilePicUrl", {
      type: DataTypes.STRING(500),
      allowNull: true,
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("Contacts", "profilePicUrl", {
      type: DataTypes.STRING,
      allowNull: true,
    });
  }
};
