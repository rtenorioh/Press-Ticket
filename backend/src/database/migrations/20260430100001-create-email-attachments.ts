import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("EmailAttachments", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      emailId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "Emails", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      filename: {
        type: DataTypes.STRING,
        allowNull: false
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: true
      },
      fileUrl: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      direction: {
        type: DataTypes.ENUM("in", "out"),
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
    return queryInterface.dropTable("EmailAttachments");
  }
};
