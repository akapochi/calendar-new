'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Availability = require('../models/availability');

router.post(
  '/:scheduleId/users/:userId',
  authenticationEnsurer,
  (req, res, next) => {
    const scheduleId = req.params.scheduleId;
    const userId = req.params.userId;
    let availability = req.body.availability;
    availability = availability ? parseInt(availability) : 0;

    Availability.upsert({
      scheduleId: scheduleId,
      userId: userId,
      availability: availability
    }).then(() => {
      res.json({ status: 'OK', availability: availability });
    });
  }
);

module.exports = router;