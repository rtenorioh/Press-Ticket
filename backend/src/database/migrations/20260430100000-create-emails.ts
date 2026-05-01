import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Emails", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      messageId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      whatsappId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Whatsapps", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      contactId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Contacts", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      direction: {
        type: DataTypes.ENUM("in", "out"),
        allowNull: false
      },
      fromAddress: {
        type: DataTypes.STRING,
        allowNull: false
      },
      toAddress: {
        type: DataTypes.STRING,
        allowNull: false
      },
      subject: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      bodyHtml: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      bodyText: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      folder: {
        type: DataTypes.ENUM("inbox", "sent", "trash", "draft"),
        defaultValue: "inbox",
        allowNull: false
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      isStarred: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      hubStatus: {
        type: DataTypes.STRING,
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
    return queryInterface.dropTable("Emails");
  }
};
