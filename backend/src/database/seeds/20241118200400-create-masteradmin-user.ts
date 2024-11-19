import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Users",
      [
        {
          name: "MasterAdmin",
          email: "masteradmin@pressticket.com.br",
          passwordHash:
            "$2a$08$nLlBSlHj.6XJNFLq.FSjVOjp4rSFHtFYHSUewBIQhceOv4gXU3yLC",
          profile: "masteradmin",
          tokenVersion: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Users", {});
  }
};
