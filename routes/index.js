'use strict';
const express = require('express');
const router = express.Router();
const Schedule = require('../models/schedule');
const Availability = require('../models/availability');
const moment = require('moment-timezone');

/* GET home page. */
router.get('/', (req, res, next) => {
  const title = 'イベント管理くん';
  if (req.user) {
    Schedule.findAll({
      // where: {
      //   createdBy: req.user.id
      // },
      order: [['day', 'ASC']]
    }).then(schedules => {
      res.render('index', {
        title: title,
        user: req.user,
        schedules: schedules,
        day: Schedule.day
      });
    });
  } else {
    res.render('index', { title: title, user: req.user });
  }
});

module.exports = router;