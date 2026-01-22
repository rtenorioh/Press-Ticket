import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Settings",
      [
        {
          key: "emailUser",
          value: "",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "emailPass",
          value: "",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "emailHost",
          value: "smtp.gmail.com",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "emailPort",
          value: "587",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Settings", {
      key: ["emailUser", "emailPass", "emailHost", "emailPort"]
    } as any);
  }
};
