import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("GroupEvents", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      whatsappId: {
        type: DataTypes.INTEGER,
        references: { model: "Whatsapps", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      groupId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      groupName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      eventType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      participantId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      participantName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      oldValue: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      newValue: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      performedBy: {
        type: DataTypes.STRING,
        allowNull: true
      },
      performedByName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: true
      },
      metadata: {
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
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("GroupEvents");
  }
};
