'use strict';

(function () {
  // Boundaries Controller Spec
  describe('Boundaries Controller Tests', function () {
    // Initialize global variables
    var BoundariesController,
      scope,
      $httpBackend,
      $stateParams,
      $location,
      Authentication,
      Boundaries,
      mockBoundary;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _Authentication_, _Boundaries_) {
      // Set a new global scope
      scope = $rootScope.$new();

      // Point global variables to injected services
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      Authentication = _Authentication_;
      Boundaries = _Boundaries_;

      // create mock boundary
      mockBoundary = new Boundaries({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Boundary about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Boundaries controller.
      BoundariesController = $controller('BoundariesController', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one boundary object fetched from XHR', inject(function (Boundaries) {
      // Create a sample boundaries array that includes the new boundary
      var sampleBoundaries = [mockBoundary];

      // Set GET response
      $httpBackend.expectGET('api/boundaries').respond(sampleBoundaries);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.boundaries).toEqualData(sampleBoundaries);
    }));

    it('$scope.findOne() should create an array with one boundary object fetched from XHR using a boundaryId URL parameter', inject(function (Boundaries) {
      // Set the URL parameter
      $stateParams.boundaryId = mockBoundary._id;

      // Set GET response
      $httpBackend.expectGET(/api\/boundaries\/([0-9a-fA-F]{24})$/).respond(mockBoundary);

      // Run controller functionality
      scope.findOne();
      $httpBackend.flush();

      // Test scope value
      expect(scope.boundary).toEqualData(mockBoundary);
    }));

    describe('$scope.create()', function () {
      var sampleBoundaryPostData;

      beforeEach(function () {
        // Create a sample boundary object
        sampleBoundaryPostData = new Boundaries({
          title: 'An Boundary about MEAN',
          content: 'MEAN rocks!'
        });

        // Fixture mock form input values
        scope.title = 'An Boundary about MEAN';
        scope.content = 'MEAN rocks!';

        spyOn($location, 'path');
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (Boundaries) {
        // Set POST response
        $httpBackend.expectPOST('api/boundaries', sampleBoundaryPostData).respond(mockBoundary);

        // Run controller functionality
        scope.create(true);
        $httpBackend.flush();

        // Test form inputs are reset
        expect(scope.title).toEqual('');
        expect(scope.content).toEqual('');

        // Test URL redirection after the boundary was created
        expect($location.path.calls.mostRecent().args[0]).toBe('boundaries/' + mockBoundary._id);
      }));

      it('should set scope.error if save error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/boundaries', sampleBoundaryPostData).respond(400, {
          message: errorMessage
        });

        scope.create(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      });
    });

    describe('$scope.update()', function () {
      beforeEach(function () {
        // Mock boundary in scope
        scope.boundary = mockBoundary;
      });

      it('should update a valid boundary', inject(function (Boundaries) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/boundaries\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        scope.update(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($location.path()).toBe('/boundaries/' + mockBoundary._id);
      }));

      it('should set scope.error to error response message', inject(function (Boundaries) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/boundaries\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        scope.update(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      }));
    });

    describe('$scope.remove(boundary)', function () {
      beforeEach(function () {
        // Create new boundaries array and include the boundary
        scope.boundaries = [mockBoundary, {}];

        // Set expected DELETE response
        $httpBackend.expectDELETE(/api\/boundaries\/([0-9a-fA-F]{24})$/).respond(204);

        // Run controller functionality
        scope.remove(mockBoundary);
      });

      it('should send a DELETE request with a valid boundaryId and remove the boundary from the scope', inject(function (Boundaries) {
        expect(scope.boundaries.length).toBe(1);
      }));
    });

    describe('scope.remove()', function () {
      beforeEach(function () {
        spyOn($location, 'path');
        scope.boundary = mockBoundary;

        $httpBackend.expectDELETE(/api\/boundaries\/([0-9a-fA-F]{24})$/).respond(204);

        scope.remove();
        $httpBackend.flush();
      });

      it('should redirect to boundaries', function () {
        expect($location.path).toHaveBeenCalledWith('boundaries');
      });
    });
  });
}());
