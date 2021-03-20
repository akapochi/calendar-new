'use strict';
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost/schedule_arranger',
  {
    dialectOptions: {
      ssl: true,
    },
  }
);
require('pg').defaults.ssl = true;
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost/eventmanagement'
);

module.exports = {
  database: sequelize,
  Sequelize: Sequelize
};