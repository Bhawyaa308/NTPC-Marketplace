const searchRepository = require('../repositories/search.repository');

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeQuery(query) {
  if (!query || typeof query !== 'string' || query.trim() === '') {
    throw createError(400, 'Query parameter q is required');
  }

  return query.trim();
}

async function getSuggestions(query) {
  const normalizedQuery = normalizeQuery(query);
  return searchRepository.getSearchSuggestions(normalizedQuery);
}

async function searchListings(query, page = 1, limit = 10) {
  const normalizedQuery = normalizeQuery(query);
  const parsedPage = Number.isNaN(Number(page)) ? 1 : Number(page);
  const parsedLimit = Number.isNaN(Number(limit)) ? 10 : Number(limit);

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    throw createError(400, 'Page must be a positive integer');
  }

  if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
    throw createError(400, 'Limit must be a positive integer');
  }

  const { data, total } = await searchRepository.searchActiveListings(normalizedQuery, parsedPage, parsedLimit);
  const totalPages = Math.ceil(total / parsedLimit);

  return {
    data,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages,
    },
  };
}

module.exports = {
  getSuggestions,
  searchListings,
};
