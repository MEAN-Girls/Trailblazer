'use strict';

(function () {
  // Boundarys Controller Spec
  describe('Boundarys Controller Tests', function () {
    // Initialize global variables
    var BoundarysController,
      scope,
      $httpBackend,
      $stateParams,
      $location,
      Authentication,
      Boundarys,
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
    beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _Authentication_, _Boundarys_) {
      // Set a new global scope
      scope = $rootScope.$new();

      // Point global variables to injected services
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      Authentication = _Authentication_;
      Boundarys = _Boundarys_;

      // create mock boundary
      mockBoundary = new Boundarys({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Boundary about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Boundarys controller.
      BoundarysController = $controller('BoundarysController', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one boundary object fetched from XHR', inject(function (Boundarys) {
      // Create a sample boundarys array that includes the new boundary
      var sampleBoundarys = [mockBoundary];

      // Set GET response
      $httpBackend.expectGET('api/boundarys').respond(sampleBoundarys);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.boundarys).toEqualData(sampleBoundarys);
    }));

    it('$scope.findOne() should create an array with one boundary object fetched from XHR using a boundaryId URL parameter', inject(function (Boundarys) {
      // Set the URL parameter
      $stateParams.boundaryId = mockBoundary._id;

      // Set GET response
      $httpBackend.expectGET(/api\/boundarys\/([0-9a-fA-F]{24})$/).respond(mockBoundary);

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
        sampleBoundaryPostData = new Boundarys({
          title: 'An Boundary about MEAN',
          content: 'MEAN rocks!'
        });

        // Fixture mock form input values
        scope.title = 'An Boundary about MEAN';
        scope.content = 'MEAN rocks!';

        spyOn($location, 'path');
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (Boundarys) {
        // Set POST response
        $httpBackend.expectPOST('api/boundarys', sampleBoundaryPostData).respond(mockBoundary);

        // Run controller functionality
        scope.create(true);
        $httpBackend.flush();

        // Test form inputs are reset
        expect(scope.title).toEqual('');
        expect(scope.content).toEqual('');

        // Test URL redirection after the boundary was created
        expect($location.path.calls.mostRecent().args[0]).toBe('boundarys/' + mockBoundary._id);
      }));

      it('should set scope.error if save error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/boundarys', sampleBoundaryPostData).respond(400, {
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

      it('should update a valid boundary', inject(function (Boundarys) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/boundarys\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        scope.update(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($location.path()).toBe('/boundarys/' + mockBoundary._id);
      }));

      it('should set scope.error to error response message', inject(function (Boundarys) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/boundarys\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        scope.update(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      }));
    });

    describe('$scope.remove(boundary)', function () {
      beforeEach(function () {
        // Create new boundarys array and include the boundary
        scope.boundarys = [mockBoundary, {}];

        // Set expected DELETE response
        $httpBackend.expectDELETE(/api\/boundarys\/([0-9a-fA-F]{24})$/).respond(204);

        // Run controller functionality
        scope.remove(mockBoundary);
      });

      it('should send a DELETE request with a valid boundaryId and remove the boundary from the scope', inject(function (Boundarys) {
        expect(scope.boundarys.length).toBe(1);
      }));
    });

    describe('scope.remove()', function () {
      beforeEach(function () {
        spyOn($location, 'path');
        scope.boundary = mockBoundary;

        $httpBackend.expectDELETE(/api\/boundarys\/([0-9a-fA-F]{24})$/).respond(204);

        scope.remove();
        $httpBackend.flush();
      });

      it('should redirect to boundarys', function () {
        expect($location.path).toHaveBeenCalledWith('boundarys');
      });
    });
  });
}());
