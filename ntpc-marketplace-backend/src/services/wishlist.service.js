const wishlistRepository = require('../repositories/wishlist.repository');

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function addToWishlist(user_id, listing_id) {
  if (!listing_id || isNaN(listing_id)) {
    throw createError(400, 'Valid listing ID is required');
  }

  // Check if listing exists and is ACTIVE
  const listing = await wishlistRepository.getListingById(listing_id);
  if (!listing) {
    throw createError(404, 'Listing not found');
  }

  if (listing.status !== 'ACTIVE') {
    throw createError(400, 'Cannot wishlist an inactive listing');
  }

  // Check if already wishlisted
  const alreadyWishlisted = await wishlistRepository.checkIfWishlisted(user_id, listing_id);
  if (alreadyWishlisted) {
    throw createError(400, 'Listing is already in your wishlist');
  }

  // Add to wishlist
  const wishlistItem = await wishlistRepository.addWishlistItem(user_id, listing_id);
  return wishlistItem;
}

async function removeFromWishlist(user_id, listing_id) {
  if (!listing_id || isNaN(listing_id)) {
    throw createError(400, 'Valid listing ID is required');
  }

  // Check if exists in wishlist
  const exists = await wishlistRepository.checkIfWishlisted(user_id, listing_id);
  if (!exists) {
    throw createError(404, 'This listing is not in your wishlist');
  }

  await wishlistRepository.removeWishlistItem(user_id, listing_id);
}

async function getWishlist(user_id) {
  const wishlist = await wishlistRepository.getUserWishlist(user_id);
  return wishlist;
}

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};
