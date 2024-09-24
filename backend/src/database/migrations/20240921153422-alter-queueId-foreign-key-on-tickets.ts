import { QueryInterface } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    // Remover a constraint antiga
    await queryInterface.removeConstraint(
      "tickets",
      "Tickets_queueId_foreign_idx"
    );

    // Adicionar a nova constraint com SET NULL e CASCADE
    await queryInterface.addConstraint("tickets", ["queueId"], {
      type: "foreign key",
      name: "Tickets_queueId_foreign_idx",
      references: {
        table: "queues",
        field: "id"
      },
      onDelete: "SET NULL", // Ao deletar, coloca NULL no campo queueId
      onUpdate: "CASCADE" // Ao atualizar o id na tabela queues, atualiza o queueId em tickets
    });
  },

  down: async (queryInterface: QueryInterface) => {
    // Remover a constraint recém adicionada
    await queryInterface.removeConstraint(
      "tickets",
      "Tickets_queueId_foreign_idx"
    );

    // Restaurar a constraint antiga
    await queryInterface.addConstraint("tickets", ["queueId"], {
      type: "foreign key",
      name: "Tickets_queueId_foreign_idx",
      references: {
        table: "queues",
        field: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    });
  }
};
