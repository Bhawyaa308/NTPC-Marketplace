const reservationsService = require('../services/reservations.service');

async function createReservation(req, res, next) {
  try {
    const reservation = await reservationsService.createReservation(req.user.user_id, req.body);
    return res.status(201).json(reservation);
  } catch (err) {
    return next(err);
  }
}

async function approveReservation(req, res, next) {
  try {
    const reservation = await reservationsService.approveReservation(req.user.user_id, req.params.id);
    return res.status(200).json(reservation);
  } catch (err) {
    return next(err);
  }
}

async function rejectReservation(req, res, next) {
  try {
    const reservation = await reservationsService.rejectReservation(req.user.user_id, req.params.id);
    return res.status(200).json(reservation);
  } catch (err) {
    return next(err);
  }
}

async function getMyReservations(req, res, next) {
  try {
    const reservations = await reservationsService.getMyReservations(req.user.user_id);
    return res.status(200).json(reservations);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createReservation,
  approveReservation,
  rejectReservation,
  getMyReservations,
};
