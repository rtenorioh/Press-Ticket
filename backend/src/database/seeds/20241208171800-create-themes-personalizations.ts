import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Personalizations",
      [
        {
          theme: "light",
          company: "Press Ticket",
          url: "https://pressticket.com.br",
          primaryColor: "#5C4B9B",
          secondaryColor: "#D5C6F0",
          backgroundDefault: "#FFFFFF",
          backgroundPaper: "#F7F7F7",
          toolbarColor: "#5C4B9B",
          toolbarIconColor: "#FFFFFF",
          menuItens: "#FFFFFF",
          sub: "#F7F7F7",
          textPrimary: "#000000",
          textSecondary: "#333333",
          divide: "#E0E0E0",
          favico: null,
          logo: null,
          logoTicket: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          theme: "dark",
          primaryColor: "#8A7DCC",
          secondaryColor: "#CCCCCC",
          backgroundDefault: "#2E2E3A",
          backgroundPaper: "#383850",
          toolbarColor: "#8A7DCC",
          toolbarIconColor: "#FFFFFF",
          menuItens: "#181D22",
          sub: "#383850",
          textPrimary: "#FFFFFF",
          textSecondary: "#CCCCCC",
          divide: "#2E2E3A",
          favico: null,
          logo: null,
          logoTicket: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Personalizations", {});
  }
};
