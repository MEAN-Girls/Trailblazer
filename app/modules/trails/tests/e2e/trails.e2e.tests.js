'use strict';

describe('Boundaries E2E Tests:', function () {
  describe('Test boundaries page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/boundaries');
      expect(element.all(by.repeater('boundary in boundaries')).count()).toEqual(0);
    });
  });
});
