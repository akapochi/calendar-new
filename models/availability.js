'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Availability = loader.database.define(
  'availabilities',
  {
    scheduleId: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false
    },
    availability: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        fields: ['scheduleId']
      }
    ]
  }
);

module.exports = Availability;