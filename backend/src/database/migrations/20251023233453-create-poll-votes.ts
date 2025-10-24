import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("PollVotes", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      pollMessageId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "Messages",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      voterId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      voterName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      selectedOptions: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false
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
    return queryInterface.dropTable("PollVotes");
  }
};
