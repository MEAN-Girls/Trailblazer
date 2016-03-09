'use strict';

describe('Boundarys E2E Tests:', function () {
  describe('Test boundarys page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/boundarys');
      expect(element.all(by.repeater('boundary in boundarys')).count()).toEqual(0);
    });
  });
});
