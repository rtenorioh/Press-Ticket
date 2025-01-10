import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.addColumn("Users", "passwordResetToken", {
            type: DataTypes.STRING,
            allowNull: true,
        });

        await queryInterface.addColumn("Users", "passwordResetExpires", {
            type: DataTypes.DATE,
            allowNull: true,
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeColumn("Users", "passwordResetToken");
        await queryInterface.removeColumn("Users", "passwordResetExpires");
    },
};
