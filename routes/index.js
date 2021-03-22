'use strict';
const express = require('express');
const router = express.Router();
const Schedule = require('../models/schedule');
const User = require('../models/user');
const Availability = require('../models/availability');
// const moment = require('moment-timezone');

// let myAvailability = require('./schedules').myAvailability;
// let availabilityMap = require('./schedules').availabilityMap;
// let myAvailability = availabilityMap.get(req.user.id);

let myAvailability;
// const availabilityMap = new Map(); // key: userId, value: availability

/* GET home page. */
router.get('/', (req, res, next) => {
  const title = 'イベント管理くん';
  // const myAvailabilityMap = new Map();

  //   if (req.user) {
  //     Schedule.findAll({
  //       include: [
  //         {
  //           model: User,
  //           attributes: ['userId', 'username']
  //         }],
  //       order: [['day', 'ASC']]
  //     }).then(schedules => {
  //       schedules.forEach((s) => {
  //         Availability.findOne({
  //           include: [
  //             {
  //               model: User,
  //               attributes: ['userId', 'username', 'mailAddress']
  //             },
  //             {
  //               model: Schedule,
  //               attributes: ['scheduleId']
  //             }
  //           ],
  //           where: { scheduleId: s.scheduleId, userId: req.user.id },
  //           order: [[User, 'username', 'ASC']]
  //         }).then((a) => {
  //           myAvailabilityMap.set(a.schedule.scheduleId, a.availability);
  //           // console.log(a.dataValues.availability);
  //           // console.log(a.dataValues);
  //           // console.log(a.scheduleId);
  //           // console.log('===============');
  //           // console.log(a);
  //           // console.log(myAvailabilityMap);

  //           myAvailability = myAvailabilityMap.get(a.scheduleId);

  //           // console.log('===============');
  //           // console.log(myAvailability);

  //           res.render('index', {
  //             title: title,
  //             user: req.user,
  //             userId: req.user.id,
  //             schedules: schedules,
  //             day: Schedule.day,
  //             myAvailability: myAvailability,
  //             myAvailabilityMap: myAvailabilityMap,
  //           });
  //         });

  //       });

  //     });
  //   } else {
  //     res.render('index', { title: title, user: req.user });
  //   }
  // });

  if (req.user) {
    Schedule.findAll({
      order: [['day', 'ASC']]
    }).then(schedules => {
      res.render('index', {
        title: title,
        user: req.user,
        userId: req.user.id,
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