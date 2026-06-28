const wishlistService = require('../services/wishlist.service');

async function addToWishlist(req, res, next) {
  try {
    const wishlistItem = await wishlistService.addToWishlist(req.user.user_id, req.params.listingId);
    return res.status(201).json(wishlistItem);
  } catch (err) {
    return next(err);
  }
}

async function removeFromWishlist(req, res, next) {
  try {
    await wishlistService.removeFromWishlist(req.user.user_id, req.params.listingId);
    return res.status(200).json({ message: 'Listing removed from wishlist' });
  } catch (err) {
    return next(err);
  }
}

async function getWishlist(req, res, next) {
  try {
    const wishlist = await wishlistService.getWishlist(req.user.user_id);
    return res.status(200).json(wishlist);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};
