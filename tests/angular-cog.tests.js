describe('angular-cog directive', function() {

    // we declare some global vars to be used in the tests
    var elm, // our directive jqLite element
        scope, // the scope where our directive is inserted
        httpBackend;

    // load the modules we want to test
    beforeEach(module('angularCog'));

    // before each test, creates a new fresh scope
    // the inject function interest is to make use of the angularJS
    // dependency injection to get some other services in our test
    // here we need $rootScope to create a new scope
    beforeEach(inject(function($rootScope, $compile, $httpBackend) {
        scope = $rootScope.$new();
        scope.success = function() {
            scope.done = true;
        }
        scope.error = function() {
            scope.notdone = true;
        }
        httpBackend = $httpBackend;
        httpBackend.when("GET", "/users").respond([{}, {}, {}]);
        httpBackend.when("GET", "/notusers").respond(404);
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    function compileDirective(tpl) {
        // function to compile a fresh directive with the given template, or a default one
        // compile the tpl with the $rootScope created above
        // wrap our directive inside a form to be able to test
        // that our form integration works well (via ngModelController)
        // our directive instance is then put in the global 'elm' variable for further tests
        var template = tpl || '<div cog-get="/users" cog-success="users = $data"></div>';

        // inject allows you to use AngularJS dependency injection
        // to retrieve and use other services
        inject(function($compile) {
            $compile(template)(scope);
        });
        // $digest is necessary to finalize the directive generation
        scope.$digest();
    }

    // make successful request
    it('should make a get request to /users', function() {
        compileDirective('<div cog-get="/users" cog-success="success()"></div>');
        httpBackend.flush();
        expect(scope.done).toBe(true);
    });

    // make successful request
    it('should make a failed get request to /users', function() {
        compileDirective('<div cog-get="/notusers" cog-error="error()" cog-success="success()"></div>');
        httpBackend.flush();
        expect(scope.notdone).toBe(true);
    });
});