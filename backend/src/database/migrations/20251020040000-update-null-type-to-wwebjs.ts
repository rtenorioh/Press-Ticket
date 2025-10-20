import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(
      "UPDATE `Whatsapps` SET `type` = 'wwebjs' WHERE `type` IS NULL OR `type` = ''"
    );
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(
      "UPDATE `Whatsapps` SET `type` = NULL WHERE `type` = 'wwebjs'"
    );
  }
};
