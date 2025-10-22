import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Settings",
      [
        {
          key: "autoRejectCalls",
          value: "disabled",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "autoRejectCallsMessage",
          value: "Desculpe, não atendemos chamadas no momento. Por favor, envie uma mensagem de texto que responderemos em breve.",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Settings", {
      key: ["autoRejectCalls", "autoRejectCallsMessage"]
    });
  }
};
