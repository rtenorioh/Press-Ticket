import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("GroupEvents", "participants");
    await queryInterface.removeColumn("GroupEvents", "action");
    
    await queryInterface.addColumn("GroupEvents", "participantId", {
      type: DataTypes.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn("GroupEvents", "participantName", {
      type: DataTypes.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn("GroupEvents", "oldValue", {
      type: DataTypes.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn("GroupEvents", "newValue", {
      type: DataTypes.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn("GroupEvents", "performedBy", {
      type: DataTypes.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn("GroupEvents", "performedByName", {
      type: DataTypes.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn("GroupEvents", "timestamp", {
      type: DataTypes.DATE,
      allowNull: true
    });
    
    await queryInterface.changeColumn("GroupEvents", "eventType", {
      type: DataTypes.STRING,
      allowNull: false
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("GroupEvents", "participantId");
    await queryInterface.removeColumn("GroupEvents", "participantName");
    await queryInterface.removeColumn("GroupEvents", "oldValue");
    await queryInterface.removeColumn("GroupEvents", "newValue");
    await queryInterface.removeColumn("GroupEvents", "performedBy");
    await queryInterface.removeColumn("GroupEvents", "performedByName");
    await queryInterface.removeColumn("GroupEvents", "timestamp");
    
    await queryInterface.addColumn("GroupEvents", "participants", {
      type: DataTypes.JSON,
      allowNull: true
    });
    
    await queryInterface.addColumn("GroupEvents", "action", {
      type: DataTypes.STRING,
      allowNull: true
    });
    
    await queryInterface.changeColumn("GroupEvents", "eventType", {
      type: DataTypes.ENUM("join", "leave", "update", "admin_changed", "membership_request"),
      allowNull: false
    });
  }
};
