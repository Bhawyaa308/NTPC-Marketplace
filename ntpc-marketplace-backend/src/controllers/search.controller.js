const searchService = require('../services/search.service');

async function getSuggestions(req, res, next) {
  try {
    const query = req.query.q;
    const suggestions = await searchService.getSuggestions(query);
    return res.status(200).json(suggestions);
  } catch (err) {
    return next(err);
  }
}

async function searchListings(req, res, next) {
  try {
    const query = req.query.q;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const listings = await searchService.searchListings(query, page, limit);
    return res.status(200).json(listings);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getSuggestions,
  searchListings,
};
