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
        allowNull: true
      },
      company: {
        type: DataTypes.STRING,
        allowNull: true
      },
      url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      primaryColor: {
        type: DataTypes.STRING,
        allowNull: true
      },
      secondaryColor: {
        type: DataTypes.STRING,
        allowNull: true
      },
      backgroundDefault: {
        type: DataTypes.STRING,
        allowNull: true
      },
      backgroundPaper: {
        type: DataTypes.STRING,
        allowNull: true
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
      toolbarColor: {
        type: DataTypes.STRING,
        allowNull: true
      },
      toolbarIconColor: {
        type: DataTypes.STRING,
        allowNull: true
      },
      menuItens: {
        type: DataTypes.STRING,
        allowNull: true
      },
      sub: {
        type: DataTypes.STRING,
        allowNull: true
      },
      textPrimary: {
        type: DataTypes.STRING,
        allowNull: true
      },
      textSecondary: {
        type: DataTypes.STRING,
        allowNull: true
      },
      divide: {
        type: DataTypes.STRING,
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
