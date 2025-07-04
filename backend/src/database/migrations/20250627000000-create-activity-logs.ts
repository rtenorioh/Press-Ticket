import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("ActivityLogs", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      entityType: {
        type: DataTypes.STRING,
        allowNull: true
      },
      entityId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      additionalData: {
        type: DataTypes.JSON,
        allowNull: true
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

    await queryInterface.addIndex("ActivityLogs", ["userId"]);
    await queryInterface.addIndex("ActivityLogs", ["action"]);
    await queryInterface.addIndex("ActivityLogs", ["entityType", "entityId"]);
    await queryInterface.addIndex("ActivityLogs", ["createdAt"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("ActivityLogs");
  }
};
