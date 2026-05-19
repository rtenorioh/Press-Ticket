import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Settings",
      [
        {
          key: "notifyQueueUsersMessage",
          value:
            "🔔 *Press Ticket - Novo Atendimento*\n\n{{ms}}, *{{user_name}}*!\nUm novo ticket foi direcionado para seu setor.\n\n*Ticket:* #{{ticket_id}}\n*Setor:* {{queue}}\n*Contato:* {{contact}}\n*Data:* {{date}} {{hour}}\n*Link:* {{link}}",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Settings", {
      key: ["notifyQueueUsersMessage"]
    });
  }
};
