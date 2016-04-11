'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Boundary = mongoose.model('Boundary');

/**
 * Globals
 */
var user, boundary;

/**
 * Unit tests
 */
describe('Boundary Model Unit Tests:', function () {

  beforeEach(function (done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    });

    user.save(function () {
      boundary = new Boundary({
        properties: {
          MANAME: 'Test management',
          OWNER:'Test owner',
          MGRINST: 'Test institution',
          MANAGER: 'Test Manager',
          MGRCITY: 'Test city',
          MGRPHONE: 'Test phone',  
          COMMENTS1: 'Test comment1',
          COMMENTS2: 'Test comment2',
          MA_WEBSITE: 'Test website'
        },
        geometry: { 
          type: 'Point',
          coordinates: [ -82.22820807639421, 29.59590886748321 ] 
        }
      });

      done();
    });
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(10000);
      return boundary.save(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without any geometry', function (done) {
      boundary.geometry = null;

      return boundary.save(function (err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function (done) {
    Boundary.remove().exec(function () {
      User.remove().exec(done);
    });
  });
});
