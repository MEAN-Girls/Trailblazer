'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Boundary = mongoose.model('Boundary'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, boundary;

/**
 * boundary routes tests
 */
describe('Boundary CRUD tests', function () {

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

    // Save a user to the test db and create new boundary
    user.save(function () {
      boundary = {
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
      };

      done();
    });
  });

  it('should be able to save an boundary if logged in', function (done) {
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

        // Save a new boundary
        agent.post('/api/boundaries')
          .send(boundary)
          .expect(200)
          .end(function (boundarySaveErr, boundarySaveRes) {
            // Handle boundary save error
            if (boundarySaveErr) {
              return done(boundarySaveErr);
            }

            // Get a list of boundaries
            agent.get('/api/boundaries')
              .end(function (boundariesGetErr, boundariesGetRes) {
                // Handle boundary save error
                if (boundariesGetErr) {
                  return done(boundariesGetErr);
                }

                // Get boundary list
                var boundaries = boundariesGetRes.body;

                // Set assertions
                (boundaries[0].properties.MANAME).should.match('Test management');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save a boundary if not logged in', function (done) {
    agent.post('/api/boundaries')
      .send(boundary)
      .expect(403)
      .end(function (boundarySaveErr, boundarySaveRes) {
        // Call the assertion callback
        done(boundarySaveErr);
      });
  });

  it('should not be able to save a boundary if no geometry is provided', function (done) {
    boundary.geometry = null;

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

        // Save a new boundary
        agent.post('/api/boundaries')
          .send(boundary)
          .expect(400)
          .end(function (boundarySaveErr, boundarySaveRes) {
            // Set message assertion
            (boundarySaveRes.body.message).should.match('Path `geometry` is required.');

            // Handle boundary save error
            done(boundarySaveErr);
          });
      });
  });

  it('should be able to update an boundary if signed in', function (done) {
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

        // Save a new boundary
        agent.post('/api/boundaries')
          .send(boundary)
          .expect(200)
          .end(function (boundarySaveErr, boundarySaveRes) {
            // Handle boundary save error
            if (boundarySaveErr) {
              return done(boundarySaveErr);
            }


            // Update boundary title
            boundary.properties.MANAME = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing boundary
            agent.put('/api/boundaries/' + boundarySaveRes.body._id)
              .send(boundary)
              .expect(200)
              .end(function (boundaryUpdateErr, boundaryUpdateRes) {
                // Handle boundary update error
                if (boundaryUpdateErr) {
                  return done(boundaryUpdateErr);
                }

                // Set assertions
                (boundaryUpdateRes.body._id).should.equal(boundarySaveRes.body._id);
                (boundaryUpdateRes.body.properties.MANAME).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of boundaries if not signed in', function (done) {
    // Create new boundary model instance
    var boundaryObj = new Boundary(boundary);

    // Save the boundary
    boundaryObj.save(function () {
      // Request boundaries
      request(app).get('/api/boundaries')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single boundary if not signed in', function (done) {
    // Create new boundary model instance
    var boundaryObj = new Boundary(boundary);

    // Save the boundary
    boundaryObj.save(function () {
      request(app).get('/api/boundaries/' + boundaryObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('properties', boundary.properties);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return error for single boundary with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/boundaries/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Boundary is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return error for single boundary which doesnt exist', function (done) {
    // This is a valid mongoose Id but a non-existent boundary
    request(app).get('/api/boundaries/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No boundary with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete a boundary', function (done) {
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

        // Save a new boundary
        agent.post('/api/boundaries')
          .send(boundary)
          .expect(200)
          .end(function (boundarySaveErr, boundarySaveRes) {
            // Handle boundary save error
            if (boundarySaveErr) {
              return done(boundarySaveErr);
            }

            // Delete an existing boundary
            agent.delete('/api/boundaries/' + boundarySaveRes.body._id)
              .send(boundary)
              .expect(200)
              .end(function (boundaryDeleteErr, boundaryDeleteRes) {
                // Handle boundary error error
                if (boundaryDeleteErr) {
                  return done(boundaryDeleteErr);
                }

                // Set assertions
                (boundaryDeleteRes.body._id).should.equal(boundarySaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('get error message for non-existent boundary search', function (done) {

    // Create new boundary model instance
    var boundaryObj = new Boundary();

    // Save the boundary
    boundaryObj.save(function () {
      // Try deleting boundary
      request(app).delete('/api/boundaries/' + boundaryObj._id)
        .expect(403)
        .end(function (boundaryDeleteErr, boundaryDeleteRes) {
          // Set message assertion
          (boundaryDeleteRes.body.message).should.match('No boundary with that identifier has been found');
         
          done();
        });

    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Boundary.remove().exec(done);
    });
  });
});
