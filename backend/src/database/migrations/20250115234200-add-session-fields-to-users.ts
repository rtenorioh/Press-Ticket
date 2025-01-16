import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        "Users",
        "currentSessionId",
        {
          type: DataTypes.STRING,
          allowNull: true
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "Users",
        "lastLoginAt",
        {
          type: DataTypes.DATE,
          allowNull: true
        },
        { transaction }
      );
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn("Users", "currentSessionId", { transaction });
      await queryInterface.removeColumn("Users", "lastLoginAt", { transaction });
    });
  }
};
