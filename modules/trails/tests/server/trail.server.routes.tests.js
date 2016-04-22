'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Trail = mongoose.model('Trail'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, trail;

/**
 * trail routes tests
 */
describe('Trail CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new trail
    user.save(function () {
      trail = {
        properties: {
          Name: 'Test name',
          boundary: 'Test bounds'
        }, 
        geometry: { 
          type: 'Point',
          coordinates: [ -82.22820807639421, 29.59590886748321 ] 
        }
      };

      done();
    });
  });

  it('should be able to save a trail if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new trail
        agent.post('/api/trails')
          .send(trail)
          .expect(200)
          .end(function (trailSaveErr, trailSaveRes) {
            // Handle trail save error
            if (trailSaveErr) {
              return done(trailSaveErr);
            }

            // Get a list of trails
            agent.get('/api/trails')
              .end(function (trailsGetErr, trailsGetRes) {
                // Handle trail save error
                if (trailsGetErr) {
                  return done(trailsGetErr);
                }

                // Get trail list
                var trails = trailsGetRes.body;

                // Set assertions
                console.log(trail[0]);
                (trails[0].properties.Name).should.match('Test name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save a trail if not logged in', function (done) {
    agent.post('/api/trails')
      .send(trail)
      .expect(403)
      .end(function (trailSaveErr, trailSaveRes) {
        // Call the assertion callback
        done(trailSaveErr);
      });
  });

  it('should not be able to save a trail if no geometry is provided', function (done) {
    trail.geometry = null;

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new trail
        agent.post('/api/trails')
          .send(trail)
          .expect(400)
          .end(function (trailSaveErr, trailSaveRes) {
            // Set message assertion
            (trailSaveRes.body.message).should.match('Path `geometry` is required.');

            // Handle trail save error
            done(trailSaveErr);
          });
      });
  });

  it('should be able to update an trail if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new trail
        agent.post('/api/trails')
          .send(trail)
          .expect(200)
          .end(function (trailSaveErr, trailSaveRes) {
            // Handle trail save error
            if (trailSaveErr) {
              return done(trailSaveErr);
            }


            // Update trail
            trail.properties.Name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing trail
            agent.put('/api/trails/' + trailSaveRes.body._id)
              .send(trail)
              .expect(200)
              .end(function (trailUpdateErr, trailUpdateRes) {
                // Handle trail update error
                if (trailUpdateErr) {
                  return done(trailUpdateErr);
                }

                // Set assertions
                (trailUpdateRes.body._id).should.equal(trailSaveRes.body._id);
                (trailUpdateRes.body.properties.Name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of trails if not signed in', function (done) {
    // Create new trail model instance
    var trailObj = new Trail(trail);

    // Save the trail
    trailObj.save(function () {
      // Request trails
      request(app).get('/api/trails')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single trail if not signed in', function (done) {
    // Create new trail model instance
    var trailObj = new Trail(trail);

    // Save the trail
    trailObj.save(function () {
      request(app).get('/api/trails/' + trailObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('properties', trail.properties);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return error for single trail with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/trails/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Trail is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return error for single trail which doesnt exist', function (done) {
    // This is a valid mongoose Id but a non-existent trail
    request(app).get('/api/trails/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No trail with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete a trail', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new trail
        agent.post('/api/trails')
          .send(trail)
          .expect(200)
          .end(function (trailSaveErr, trailSaveRes) {
            // Handle trail save error
            if (trailSaveErr) {
              return done(trailSaveErr);
            }

            // Delete an existing trail
            agent.delete('/api/trails/' + trailSaveRes.body._id)
              .send(trail)
              .expect(200)
              .end(function (trailDeleteErr, trailDeleteRes) {
                // Handle trail error error
                if (trailDeleteErr) {
                  return done(trailDeleteErr);
                }

                // Set assertions
                (trailDeleteRes.body._id).should.equal(trailSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('get error message for non-existent trail search', function (done) {

    // Create new trail model instance
    var trailObj = new Trail();

    // Save the trail
    trailObj.save(function () {
      // Try deleting trail
      request(app).delete('/api/trails/' + trailObj._id)
        .expect(403)
        .end(function (trailDeleteErr, trailDeleteRes) {
          // Set message assertion
          (trailDeleteRes.body.message).should.match('No trail with that identifier has been found');
         
          done();
        });

    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Trail.remove().exec(done);
    });
  });
});
