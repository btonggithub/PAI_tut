const RESERVED_QUERY_KEYS = new Set(['page', 'limit', 'sort', 'fields']);

const buildFilterQuery = (query = {}, allowedFilters = []) => {
  const filter = {};

  Object.keys(query).forEach((key) => {
    if (RESERVED_QUERY_KEYS.has(key)) {
      return;
    }

    if (allowedFilters.length > 0 && !allowedFilters.includes(key)) {
      return;
    }

    filter[key] = query[key];
  });

  return filter;
};

const buildSortQuery = (sortInput, allowedSortFields = [], fallback = '-createdAt') => {
  if (!sortInput || typeof sortInput !== 'string') {
    return fallback;
  }

  const fields = sortInput
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean)
    .filter((field) => {
      const normalizedField = field.startsWith('-') ? field.slice(1) : field;

      if (allowedSortFields.length === 0) {
        return true;
      }

      return allowedSortFields.includes(normalizedField);
    });

  return fields.length > 0 ? fields.join(' ') : fallback;
};

module.exports = {
  buildFilterQuery,
  buildSortQuery,
};
