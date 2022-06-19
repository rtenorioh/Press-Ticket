import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Settings",
      [
        {
          key: "userCreation",
          value: "enabled",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "CheckMsgIsGroup",
          value: "enabled",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "call",
          value: "disabled",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "sideMenu",
          value: "disabled",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "timeCreateNewTicket",
          value: "10",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "closeTicketApi",
          value: "disabled",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "darkMode",
          value: "disabled",
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
