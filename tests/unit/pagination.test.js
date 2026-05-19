const { normalizePagination, createPaginationMeta } = require('../../src/utils/pagination');

describe('pagination utilities', () => {
  describe('normalizePagination', () => {
    it('applies defaults for invalid input', () => {
      const pagination = normalizePagination({ page: '0', limit: '-1' });

      expect(pagination).toEqual({ page: 1, limit: 10, skip: 0 });
    });

    it('calculates page, limit and skip for valid input', () => {
      const pagination = normalizePagination({ page: '3', limit: '20' });

      expect(pagination).toEqual({ page: 3, limit: 20, skip: 40 });
    });

    it('caps max limit at 100', () => {
      const pagination = normalizePagination({ page: '1', limit: '200' });

      expect(pagination).toEqual({ page: 1, limit: 100, skip: 0 });
    });
  });

  describe('createPaginationMeta', () => {
    it('returns expected metadata fields', () => {
      const meta = createPaginationMeta({ total: 55, page: 2, limit: 10 });

      expect(meta).toEqual({
        total: 55,
        page: 2,
        limit: 10,
        totalPages: 6,
        hasNextPage: true,
        hasPrevPage: true,
      });
    });
  });
});
