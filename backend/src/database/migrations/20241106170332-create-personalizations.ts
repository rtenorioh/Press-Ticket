import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("Personalizations", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      theme: {
        type: DataTypes.STRING,
        allowNull: false
      },
      company: {
        type: DataTypes.STRING,
        allowNull: false
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false
      },
      primaryColor: {
        type: DataTypes.STRING,
        allowNull: false
      },
      secondaryColor: {
        type: DataTypes.STRING,
        allowNull: false
      },
      backgroundDefault: {
        type: DataTypes.STRING,
        allowNull: false
      },
      backgroundPaper: {
        type: DataTypes.STRING,
        allowNull: false
      },
      favico: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      logo: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      logoTicket: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("Personalizations");
  }
};
