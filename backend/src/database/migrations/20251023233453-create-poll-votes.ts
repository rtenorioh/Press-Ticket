import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("PollVotes", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      pollMessageId: {
        type: DataTypes.STRING,
        allowNull: false
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

    await queryInterface.sequelize.query(
      "ALTER TABLE PollVotes MODIFY pollMessageId VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL"
    );

    await queryInterface.addConstraint("PollVotes", {
      fields: ["pollMessageId"],
      type: "foreign key",
      name: "PollVotes_pollMessageId_fkey",
      references: {
        table: "Messages",
        field: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    } as any);
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("PollVotes");
  }
};
