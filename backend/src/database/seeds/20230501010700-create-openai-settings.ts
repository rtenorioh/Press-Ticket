import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Integrations",
      [
        {
          key: "organization",
          value: "",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "apikey",
          value: "",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Integrations", {});
  }
};
