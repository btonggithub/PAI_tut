const { normalizePagination, createPaginationMeta } = require('../../utils/pagination');
const { buildFilterQuery, buildSortQuery } = require('../../utils/query');

class BaseRepository {
  constructor(model = null) {
    this.model = model;
  }

  buildFilters(query, allowedFilters = []) {
    return buildFilterQuery(query, allowedFilters);
  }

  buildSort(sortInput, allowedSortFields = [], fallback = '-createdAt') {
    return buildSortQuery(sortInput, allowedSortFields, fallback);
  }

  buildPagination(query = {}) {
    return normalizePagination(query);
  }

  buildMeta(total, pagination) {
    return createPaginationMeta({
      total,
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  async create(payload) {
    return this.model.create(payload);
  }

  async findOne(filter, projection = null) {
    return this.model.findOne(filter, projection);
  }

  async findById(id, projection = null) {
    return this.model.findById(id, projection);
  }

  async findMany(query = {}, options = {}) {
    const {
      allowedFilters = [],
      allowedSortFields = [],
      defaultSort = '-createdAt',
      projection = null,
      useLean = true,
    } = options;

    const filters = this.buildFilters(query, allowedFilters);
    const sort = this.buildSort(query.sort, allowedSortFields, defaultSort);
    const pagination = this.buildPagination(query);

    const [items, total] = await Promise.all([
      this.model
        .find(filters, projection)
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(useLean),
      this.model.countDocuments(filters),
    ]);

    return {
      items,
      meta: this.buildMeta(total, pagination),
    };
  }
}

module.exports = BaseRepository;
