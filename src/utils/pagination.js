const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const normalizePagination = (input = {}) => {
  const rawPage = Number.parseInt(input.page, 10);
  const rawLimit = Number.parseInt(input.limit, 10);

  const page = Number.isNaN(rawPage) || rawPage < 1 ? DEFAULT_PAGE : rawPage;
  const limit = Number.isNaN(rawLimit) || rawLimit < 1
    ? DEFAULT_LIMIT
    : Math.min(rawLimit, MAX_LIMIT);

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const createPaginationMeta = ({ total, page, limit }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = {
  normalizePagination,
  createPaginationMeta,
};
