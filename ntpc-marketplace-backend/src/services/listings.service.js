const listingsRepository = require('../repositories/listings.repository');

const VALID_CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'];

function normalizeListing(listing) {
  if (!listing) {
    return listing;
  }

  return {
    ...listing,
    image_urls: Array.isArray(listing.image_urls)
      ? listing.image_urls.filter(Boolean).map((url) => {
          if (typeof url !== 'string') {
            return '';
          }

          const trimmed = url.trim();
          if (!trimmed) {
            return '';
          }

          if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
            return trimmed;
          }

          return `http://localhost:3000${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
        }).filter(Boolean)
      : [],
  };
}

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function createListing(seller_id, payload) {
  // Sellers are not allowed to set status or sold_at manually
  if (payload.status !== undefined) {
    throw createError(400, 'Setting status is not allowed');
  }
  if (payload.sold_at !== undefined) {
    throw createError(400, 'Setting sold_at is not allowed');
  }
  const listing = await listingsRepository.createListing({
    seller_id,
    category_id: payload.category_id,
    township_id: payload.township_id,
    title: payload.title,
    description: payload.description,
    price: payload.price,
    condition: payload.condition,
    is_negotiable: payload.is_negotiable || false,
    status: 'ACTIVE',
    view_count: 0,
    expires_at: payload.expires_at || null,
    sold_at: null,
  });

  const auditService = require('./audit.service');
  await auditService.logEvent({
    user_id: seller_id,
    action: 'LISTING_CREATED',
    entity_type: 'LISTING',
    entity_id: listing.listing_id,
  });

  return listing;
}

function validatePagination(page, limit) {
  if (!Number.isInteger(page) || page < 1) {
    throw createError(400, 'Page must be a positive integer');
  }

  if (!Number.isInteger(limit) || limit < 1) {
    throw createError(400, 'Limit must be a positive integer');
  }
}

async function getAllListings(page = 1, limit = 10) {
  const parsedPage = Number.isNaN(Number(page)) ? 1 : Number(page);
  const parsedLimit = Number.isNaN(Number(limit)) ? 10 : Number(limit);

  validatePagination(parsedPage, parsedLimit);

  const { data, total } = await listingsRepository.getListings(parsedPage, parsedLimit);
  const totalPages = Math.ceil(total / parsedLimit);

  return {
    data: data.map(normalizeListing),
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages,
    },
  };
}

async function getListingById(listing_id) {
  const listing = await listingsRepository.incrementViewCount(listing_id);

  if (!listing) {
    throw createError(404, 'Listing not found');
  }

  return normalizeListing(listing);
}

async function updateListing(seller_id, listing_id, payload) {
  const existingListing = await listingsRepository.findListingById(listing_id);

  if (!existingListing) {
    throw createError(404, 'Listing not found');
  }

  if (existingListing.seller_id !== seller_id) {
    throw createError(403, 'You are not allowed to update this listing');
  }

  if (existingListing.status === 'SOLD') {
    throw createError(400, 'Cannot update a sold listing');
  }

  const updateFields = {};

  if (payload.category_id !== undefined) {
    updateFields.category_id = payload.category_id;
  }
  if (payload.township_id !== undefined) {
    updateFields.township_id = payload.township_id;
  }
  if (payload.title !== undefined) {
    updateFields.title = payload.title;
  }
  if (payload.description !== undefined) {
    updateFields.description = payload.description;
  }
  if (payload.price !== undefined) {
    updateFields.price = payload.price;
  }
  if (payload.condition !== undefined) {
    if (!VALID_CONDITIONS.includes(payload.condition)) {
      throw createError(400, 'Invalid condition value');
    }
    updateFields.condition = payload.condition;
  }
  if (payload.is_negotiable !== undefined) {
    updateFields.is_negotiable = payload.is_negotiable;
  }
  if (payload.expires_at !== undefined) {
    updateFields.expires_at = payload.expires_at;
  }
  // Sellers can only mark a listing as sold through the normal update flow
  if (payload.status !== undefined) {
    if (payload.status !== 'SOLD') {
      throw createError(400, 'Only status SOLD is allowed');
    }
    updateFields.status = 'SOLD';
    updateFields.sold_at = new Date();
  }
  if (payload.sold_at !== undefined) {
    throw createError(400, 'Updating sold_at is not allowed');
  }

  if (Object.keys(updateFields).length === 0) {
    return existingListing;
  }

  let updatedListing;
  if (payload.status === 'SOLD' && Object.keys(updateFields).length === 2) {
    updatedListing = await listingsRepository.updateListingToSold(listing_id);
  } else {
    updatedListing = await listingsRepository.updateListingById(listing_id, updateFields);
  }

  const auditService = require('./audit.service');
  await auditService.logEvent({
    user_id: seller_id,
    action: 'LISTING_UPDATED',
    entity_type: 'LISTING',
    entity_id: listing_id,
  });

  return updatedListing;
}

async function deleteListing(seller_id, listing_id) {
  const existingListing = await listingsRepository.findListingById(listing_id);

  if (!existingListing) {
    throw createError(404, 'Listing not found');
  }

  if (existingListing.seller_id !== seller_id) {
    throw createError(403, 'You are not allowed to delete this listing');
  }

  await listingsRepository.expireListing(listing_id);

  const auditService = require('./audit.service');
  await auditService.logEvent({
    user_id: seller_id,
    action: 'LISTING_EXPIRED',
    entity_type: 'LISTING',
    entity_id: listing_id,
  });
}

async function addListingImages(seller_id, listing_id, imageUrls) {
  // Verify seller owns the listing
  const listing = await listingsRepository.findListingById(listing_id);
  if (!listing) {
    throw createError(404, 'Listing not found');
  }
  if (listing.seller_id !== seller_id) {
    throw createError(403, 'Not authorized to modify this listing');
  }

  // Add images to image_urls JSONB array
  const updatedListing = await listingsRepository.addListingImages(listing_id, imageUrls);

  const auditService = require('./audit.service');
  await auditService.logEvent({
    user_id: seller_id,
    action: 'LISTING_IMAGES_ADDED',
    entity_type: 'LISTING',
    entity_id: listing_id,
  });

  return updatedListing;
}

async function deleteListingImage(seller_id, listing_id, imageUrl) {
  // Verify seller owns the listing
  const listing = await listingsRepository.findListingById(listing_id);
  if (!listing) {
    throw createError(404, 'Listing not found');
  }
  if (listing.seller_id !== seller_id) {
    throw createError(403, 'Not authorized to modify this listing');
  }

  // Remove image from image_urls JSONB array
  const updatedListing = await listingsRepository.removeListingImage(listing_id, imageUrl);

  const auditService = require('./audit.service');
  await auditService.logEvent({
    user_id: seller_id,
    action: 'LISTING_IMAGE_DELETED',
    entity_type: 'LISTING',
    entity_id: listing_id,
  });

  return updatedListing;
}

async function getListingImages(listing_id) {
  const listing = await listingsRepository.findListingById(listing_id);
  if (!listing) {
    throw createError(404, 'Listing not found');
  }
  return normalizeListing(listing).image_urls || [];
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
};
