import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Settings",
      [
        {
          key: "hubToken",
          value: "",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Settings", {});
  }
};
