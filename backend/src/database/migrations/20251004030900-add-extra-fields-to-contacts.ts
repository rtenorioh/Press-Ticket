import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const addString = async (name: string) =>
      queryInterface.addColumn("Contacts", name, {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ""
      });

    const addDate = async (name: string) =>
      queryInterface.addColumn("Contacts", name, {
        type: DataTypes.DATE,
        allowNull: true
      });

    await addDate("birthdate");
    await addString("gender");
    await addString("status");
    await addDate("lastContactAt");
    await addString("country");
    await addString("zip");
    await addString("addressNumber");
    await addString("addressComplement");
    await addString("neighborhood");
    await addString("city");
    await addString("state");
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Contacts", "birthdate");
    await queryInterface.removeColumn("Contacts", "gender");
    await queryInterface.removeColumn("Contacts", "status");
    await queryInterface.removeColumn("Contacts", "lastContactAt");
    await queryInterface.removeColumn("Contacts", "country");
    await queryInterface.removeColumn("Contacts", "zip");
    await queryInterface.removeColumn("Contacts", "addressNumber");
    await queryInterface.removeColumn("Contacts", "addressComplement");
    await queryInterface.removeColumn("Contacts", "neighborhood");
    await queryInterface.removeColumn("Contacts", "city");
    await queryInterface.removeColumn("Contacts", "state");
  }
};
