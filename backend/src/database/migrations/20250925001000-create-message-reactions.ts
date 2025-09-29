import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("MessageReactions", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      messageId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "Messages",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      emoji: {
        type: DataTypes.STRING,
        allowNull: false
      },
      senderId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE(6),
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE(6),
        allowNull: false
      }
    });

    await queryInterface.addIndex("MessageReactions", ["messageId"], { name: "idx_message_reactions_messageId" });
    await queryInterface.addIndex("MessageReactions", ["emoji"], { name: "idx_message_reactions_emoji" });
    await queryInterface.addIndex("MessageReactions", ["senderId"], { name: "idx_message_reactions_senderId" });
    await queryInterface.addIndex("MessageReactions", ["messageId", "senderId"], { name: "uniq_message_reactions_message_sender", unique: true });
    await queryInterface.addIndex("MessageReactions", ["messageId", "emoji"], { name: "idx_message_reactions_message_emoji" });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex("MessageReactions", "idx_message_reactions_message_emoji");
    await queryInterface.removeIndex("MessageReactions", "uniq_message_reactions_message_sender");
    await queryInterface.removeIndex("MessageReactions", "idx_message_reactions_senderId");
    await queryInterface.removeIndex("MessageReactions", "idx_message_reactions_emoji");
    await queryInterface.removeIndex("MessageReactions", "idx_message_reactions_messageId");
    await queryInterface.dropTable("MessageReactions");
  }
};
