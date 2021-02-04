'use strict';
const express = require('express');
const router = express.Router();
const Schedule = require('../models/schedule');
const Availability = require('../models/availability');
const moment = require('moment-timezone');

// let myAvailability = require('./schedules').myAvailability;
let availabilityMap = require('./schedules').availabilityMap;

/* GET home page. */
router.get('/', (req, res, next) => {
  // let myAvailability = availabilityMap.get(req.user.id);

  const title = 'イベント管理くん';
  if (req.user) {
    Schedule.findAll({
      order: [['day', 'ASC']]
    }).then(schedules => {
      res.render('index', {
        title: title,
        user: req.user,
        schedules: schedules,
        day: Schedule.day,
        // myAvailability: myAvailability,
      });
    });
  } else {
    res.render('index', { title: title, user: req.user });
  }
});

module.exports = router;