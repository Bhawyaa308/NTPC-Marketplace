const listingsRepository = require('./../repositories/listings.repository');
const reservationsRepository = require('../repositories/reservations.repository');
const ordersRepository = require('../repositories/orders.repository');
const { createNotification } = require('../utils/notificationHelper');

function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function createReservation(buyer_id, { listing_id, expires_at = null }) {
  // ensure listing exists and is ACTIVE
  const listing = await listingsRepository.findListingById(listing_id);
  if (!listing) throw createError(404, 'Listing not found');
  if (listing.status !== 'ACTIVE') throw createError(400, 'Listing is not available for reservation');
  if (listing.seller_id === buyer_id) throw createError(400, 'Cannot reserve your own listing');

  // create reservation
  const reservation = await reservationsRepository.createReservation({
    listing_id,
    buyer_id,
    seller_id: listing.seller_id,
    expires_at,
  });

  // Notify seller of new reservation
  await createNotification({
    user_id: listing.seller_id,
    title: 'New Reservation',
    message: `A buyer has reserved your listing: ${listing.title}`,
    type: 'RESERVATION',
    related_entity_type: 'RESERVATION',
    related_entity_id: reservation.reservation_id,
  });

  const auditService = require('./audit.service');
  await auditService.logEvent({
    user_id: buyer_id,
    action: 'RESERVATION_CREATED',
    entity_type: 'RESERVATION',
    entity_id: reservation.reservation_id,
  });

  return reservation;
}

async function approveReservation(seller_id, reservation_id) {
  const reservation = await reservationsRepository.findReservationById(reservation_id);
  if (!reservation) throw createError(404, 'Reservation not found');
  if (reservation.seller_id !== seller_id) throw createError(403, 'Not authorized');
  if (reservation.status !== 'PENDING') throw createError(400, 'Reservation is not pending');

  // mark reservation approved
  const updatedReservation = await reservationsRepository.updateReservationApprove(reservation_id);

  // mark listing RESERVED
  await listingsRepository.updateListingById(reservation.listing_id, { status: 'RESERVED' });

  const listing = await listingsRepository.findListingById(reservation.listing_id);
  const existingOrder = await ordersRepository.findOrderByReservationId(reservation_id);
  if (!existingOrder) {
    await ordersRepository.createOrderFromReservation({
      reservation_id,
      buyer_id: reservation.buyer_id,
      seller_id: reservation.seller_id,
      amount: listing?.price || 0,
    });
  }

  // reject all other pending reservations for the same listing
  await reservationsRepository.rejectPendingReservationsForListing(reservation.listing_id, reservation_id);

  // Notify buyer of approval
  await createNotification({
    user_id: reservation.buyer_id,
    title: 'Reservation Approved',
    message: 'Your reservation has been approved by the seller',
    type: 'RESERVATION_APPROVED',
    related_entity_type: 'RESERVATION',
    related_entity_id: reservation_id,
  });

  const auditService = require('./audit.service');
  await auditService.logEvent({
    user_id: seller_id,
    action: 'RESERVATION_APPROVED',
    entity_type: 'RESERVATION',
    entity_id: reservation_id,
  });

  return updatedReservation;
}

async function rejectReservation(seller_id, reservation_id) {
  const reservation = await reservationsRepository.findReservationById(reservation_id);
  if (!reservation) throw createError(404, 'Reservation not found');
  if (reservation.seller_id !== seller_id) throw createError(403, 'Not authorized');
  if (reservation.status !== 'PENDING') throw createError(400, 'Reservation is not pending');

  const updatedReservation = await reservationsRepository.updateReservationReject(reservation_id);

  // Notify buyer of rejection
  await createNotification({
    user_id: reservation.buyer_id,
    title: 'Reservation Rejected',
    message: 'Your reservation has been rejected by the seller',
    type: 'RESERVATION_REJECTED',
    related_entity_type: 'RESERVATION',
    related_entity_id: reservation_id,
  });

  const auditService = require('./audit.service');
  await auditService.logEvent({
    user_id: seller_id,
    action: 'RESERVATION_REJECTED',
    entity_type: 'RESERVATION',
    entity_id: reservation_id,
  });

  return updatedReservation;
}

async function getMyReservations(user_id) {
  return reservationsRepository.getMyReservations(user_id);
}

module.exports = {
  createReservation,
  approveReservation,
  rejectReservation,
  getMyReservations,
};
