import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Queues", "startBreak", {
        type: DataTypes.STRING,
        allowNull: true
      }),
      queryInterface.addColumn("Queues", "endBreak", {
        type: DataTypes.STRING,
        allowNull: true
      }),
      queryInterface.addColumn("Queues", "breakMessage", {
        type: DataTypes.TEXT,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Queues", "startBreak"),
      queryInterface.removeColumn("Queues", "endBreak"),
      queryInterface.removeColumn("Queues", "breakMessage")
    ]);
  }
};
