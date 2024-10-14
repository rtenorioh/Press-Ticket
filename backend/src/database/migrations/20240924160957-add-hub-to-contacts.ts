import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Contacts", "messengerId", {
        type: DataTypes.TEXT,
        allowNull: true
      }),
      queryInterface.addColumn("Contacts", "instagramId", {
        type: DataTypes.TEXT,
        allowNull: true
      }),
      queryInterface.addColumn("Contacts", "telegramId", {
        type: DataTypes.TEXT,
        allowNull: true
      }),
      queryInterface.addColumn("Contacts", "webchatId", {
        type: DataTypes.TEXT,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Contacts", "messengerId"),
      queryInterface.removeColumn("Contacts", "instagramId"),
      queryInterface.removeColumn("Contacts", "telegramId"),
      queryInterface.removeColumn("Contacts", "webchatId")
    ]);
  }
};
