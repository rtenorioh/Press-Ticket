import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const [results] = await queryInterface.sequelize.query(`
      UPDATE Messages m
      INNER JOIN Tickets t ON m.ticketId = t.id
      SET m.userId = t.userId
      WHERE m.userId IS NULL;
    `);

    return results;
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query(`
      UPDATE Messages
      SET userId = NULL
      WHERE userId IS NOT NULL;
    `);
  }
};
