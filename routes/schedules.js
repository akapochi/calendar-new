'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('uuid');
const Schedule = require('../models/schedule');
const User = require('../models/user');
const Availability = require('../models/availability');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

router.get('/new', authenticationEnsurer, csrfProtection, (req, res, next) => {
  res.render('new', { user: req.user, csrfToken: req.csrfToken() });
});

router.post('/', authenticationEnsurer, csrfProtection, (req, res, next) => {
  const scheduleId = uuid.v4();
  const updatedAt = new Date();
  Schedule.create({
    scheduleId: scheduleId,
    scheduleName: req.body.scheduleName.slice(0, 255) || '（名称未設定）',
    memo: req.body.memo,
    createdBy: req.user.id,
    updatedAt: updatedAt,
    day: req.body.day
  }).then((schedule) => {
    res.redirect('/schedules/' + schedule.scheduleId);
  });
});

router.get('/:scheduleId', authenticationEnsurer, (req, res, next) => {
  Schedule.findOne({
    include: [
      {
        model: User,
        attributes: ['userId', 'username']
      }],
    where: {
      scheduleId: req.params.scheduleId
    },
    order: [['updatedAt', 'DESC']]
  }).then((schedule) => {
    if (schedule) {
      // データベースからその予定の全ての出欠を取得する
      Availability.findAll({
        include: [
          {
            model: User,
            attributes: ['userId', 'username', 'mailAddress']
          }
        ],
        where: { scheduleId: schedule.scheduleId },
        order: [[User, 'username', 'ASC']]
      }).then((availabilities) => {
        // 出欠 Map(キー:ユーザー ID, 値:出欠) を作成する
        const availabilityMap = new Map(); // key: userId, value: availability
        availabilities.forEach((a) => {
          availabilityMap.set(a.user.userId, a.availability);
        });

        // 閲覧ユーザーと出欠に紐づくユーザーからユーザー Map (キー:ユーザー ID, 値:ユーザー) を作る
        const userMap = new Map(); // key: userId, value: User
        userMap.set(BigInt(req.user.id), {
          isSelf: true,
          userId: BigInt(req.user.id),
          username: req.user.username
          // mailAddress: a.user.mailAddress
        });
        availabilities.forEach((a) => {
          userMap.set(a.user.userId, {
            isSelf: BigInt(req.user.id) === a.user.userId, // 閲覧ユーザー自身であるかを含める
            userId: a.user.userId,
            username: a.user.username,
            mailAddress: a.user.mailAddress
          });
        });

        // availability という変数に出欠情報を格納（教材でいうところの、94行目の a と同じ）
        const users = Array.from(userMap).map((keyValue) => keyValue[1]);
        users.forEach((u) => {
          let availability = availabilityMap.get(u.userId) || 0;
          availabilityMap.set(u.userId, availability);
        });

        console.log(req.user);
        console.log(parseInt(req.user.id));
        console.log(BigInt(req.user.id));

        let myAvailability = availabilityMap.get(BigInt(req.user.id));

        res.render('schedule', {
          user: req.user,
          userId: BigInt(req.user.id),
          schedule: schedule,
          users: users,
          myAvailability: myAvailability,
        });
      });
    } else {
      const err = new Error('指定された予定は見つかりません');
      err.status = 404;
      next(err);
    }
  });
});

router.get('/:scheduleId/edit', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Schedule.findOne({
    where: {
      scheduleId: req.params.scheduleId
    }
  }).then((schedule) => {
    if (isMine(req, schedule)) { // 作成者のみが編集フォームを開ける
      res.render('edit', {
        user: req.user,
        schedule: schedule,
        csrfToken: req.csrfToken()
      });
    } else {
      const err = new Error('指定された予定がない、または、予定する権限がありません');
      err.status = 404;
      next(err);
    }
  });
});

function isMine(req, schedule) {
  return schedule && BigInt(schedule.createdBy) === BigInt(req.user.id);
}

router.post('/:scheduleId', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Schedule.findOne({
    where: {
      scheduleId: req.params.scheduleId
    }
  }).then((schedule) => {
    if (schedule && isMine(req, schedule)) {
      if (parseInt(req.query.edit) === 1) {
        const updatedAt = new Date();
        schedule.update({
          scheduleId: schedule.scheduleId,
          scheduleName: req.body.scheduleName.slice(0, 255) || '（名称未設定）',
          memo: req.body.memo,
          createdBy: req.user.id,
          updatedAt: updatedAt,
          day: req.body.day
        }).then((schedule) => {
          res.redirect('/schedules/' + schedule.scheduleId);
        });
      } else if (parseInt(req.query.delete) === 1) {
        deleteScheduleAggregate(req.params.scheduleId, () => {
          res.redirect('/');
        });
      } else {
        const err = new Error('不正なリクエストです');
        err.status = 400;
        next(err);
      }
    } else {
      const err = new Error('指定された予定がない、または、編集する権限がありません');
      err.status = 404;
      next(err);
    }
  });
});

function deleteScheduleAggregate(scheduleId, done, err) {
  Availability.findAll({
    where: { scheduleId: scheduleId }
  }).then((availabilities) => {
    const promises = availabilities.map((a) => { return a.destroy(); });
    return Promise.all(promises);
  }).then(() => {
    return Schedule.findByPk(scheduleId).then((s) => { return s.destroy(); });
  }).then(() => {
    if (err) return done(err);
    done();
  });
}

router.deleteScheduleAggregate = deleteScheduleAggregate;

module.exports = router;