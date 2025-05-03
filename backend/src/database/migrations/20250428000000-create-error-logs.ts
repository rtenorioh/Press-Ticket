import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("ErrorLogs", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      source: {
        type: DataTypes.STRING,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      username: {
        type: DataTypes.STRING
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      stack: {
        type: DataTypes.TEXT
      },
      url: {
        type: DataTypes.STRING
      },
      userAgent: {
        type: DataTypes.STRING
      },
      component: {
        type: DataTypes.STRING
      },
      severity: {
        type: DataTypes.STRING,
        defaultValue: "error"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("ErrorLogs");
  }
};
