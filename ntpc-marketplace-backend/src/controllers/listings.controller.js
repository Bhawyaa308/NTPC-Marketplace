const listingsService = require('../services/listings.service');

async function createListing(req, res, next) {
  try {
    const listing = await listingsService.createListing(req.user.user_id, req.body);
    return res.status(201).json(listing);
  } catch (error) {
    return next(error);
  }
}

async function getAllListings(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const listingResult = await listingsService.getAllListings(page, limit);
    return res.status(200).json(listingResult);
  } catch (error) {
    return next(error);
  }
}

async function getListingById(req, res, next) {
  try {
    const listing = await listingsService.getListingById(req.params.id);
    return res.status(200).json(listing);
  } catch (error) {
    return next(error);
  }
}

async function updateListing(req, res, next) {
  try {
    const listing = await listingsService.updateListing(req.user.user_id, req.params.id, req.body);
    return res.status(200).json(listing);
  } catch (error) {
    return next(error);
  }
}

async function deleteListing(req, res, next) {
  try {
    await listingsService.deleteListing(req.user.user_id, req.params.id);
    return res.status(200).json({ message: 'Listing expired successfully' });
  } catch (error) {
    return next(error);
  }
}

async function addListingImages(req, res, next) {
  try {
    const { id } = req.params;
    const { imageUrls } = req.body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'imageUrls must be a non-empty array',
      });
    }

    const updatedListing = await listingsService.addListingImages(
      req.user.user_id,
      id,
      imageUrls
    );

    return res.status(200).json({
      success: true,
      message: 'Images added successfully',
      data: updatedListing,
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteListingImage(req, res, next) {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'imageUrl is required',
      });
    }

    const updatedListing = await listingsService.deleteListingImage(
      req.user.user_id,
      id,
      imageUrl
    );

    return res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: updatedListing,
    });
  } catch (error) {
    return next(error);
  }
}

async function getListingImages(req, res, next) {
  try {
    const { id } = req.params;
    const images = await listingsService.getListingImages(id);
    return res.status(200).json({
      success: true,
      data: images,
    });
  } catch (error) {
    return next(error);
  }
}

async function uploadImages(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const imageUrls = req.files.map(
      (file) => `/uploads/${file.filename}`
    );

    return res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      imageUrls,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  addListingImages,
  deleteListingImage,
  getListingImages,
  uploadImages,
};
