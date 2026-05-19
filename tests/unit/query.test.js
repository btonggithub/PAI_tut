const { buildFilterQuery, buildSortQuery } = require('../../src/utils/query');

describe('query utilities', () => {
  describe('buildFilterQuery', () => {
    it('includes only allowed non-reserved fields', () => {
      const filter = buildFilterQuery(
        { name: 'John', email: 'john@example.com', page: '2', sort: '-createdAt' },
        ['name']
      );

      expect(filter).toEqual({ name: 'John' });
    });

    it('allows all non-reserved fields when allowed list is empty', () => {
      const filter = buildFilterQuery({ status: 'active', type: 'admin', limit: '10' });

      expect(filter).toEqual({ status: 'active', type: 'admin' });
    });
  });

  describe('buildSortQuery', () => {
    it('returns fallback when sort input is invalid', () => {
      expect(buildSortQuery(undefined, ['name'], '-createdAt')).toBe('-createdAt');
    });

    it('returns validated sort fields only', () => {
      const sort = buildSortQuery('name,-createdAt,-unknown', ['name', 'createdAt']);

      expect(sort).toBe('name -createdAt');
    });
  });
});
