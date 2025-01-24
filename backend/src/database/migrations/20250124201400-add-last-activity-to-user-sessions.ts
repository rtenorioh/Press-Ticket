import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("UserSessions", "lastActivity", {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date()
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("UserSessions", "lastActivity");
  }
};
