/**
 * Main module
 */
angular.module('angularCog', []);
/**
 * GET directive, this sends request immedietly
 * @param  {[type]} MakeRequestService [description]
 * @return {[type]}                    [description]
 */
angular.module('angularCog').directive('cogGet', [
  'MakeRequestService',
  function (MakeRequestService) {
    return {
      restrict: 'A',
      scope: true,
      link: function (scope, element, attrs) {
        //check if there's a trigger
        if (attrs.cogTrigger) {
          //watch for the expression
          scope.$watch(attrs.cogTrigger, function (newVal, oldVal) {
            //if the changed value becomes true, fire away request!
            if (newVal) {
              MakeRequestService('get', null, scope, attrs);
            }
          });
        } else {
          //make immediate request if there isn't
          MakeRequestService('get', null, scope, attrs);
        }
      }
    };
  }
]);
/**
 * POST directive, listens to form submit
 * @param  {[type]} MakeRequestService [description]
 * @return {[type]}                    [description]
 */
angular.module('angularCog').directive('cogPost', [
  'MakeRequestService',
  function (MakeRequestService) {
    return {
      restrict: 'A',
      require: '^form',
      scope: true,
      link: function (scope, element, attrs) {
        element.bind('submit', function () {
          var data = scope[attrs.cogModel];
          MakeRequestService('post', data, scope, attrs);
        });
      }
    };
  }
]);
/**
 * PUT directive, listens to form submit
 * @param  {[type]} MakeRequestService [description]
 * @return {[type]}                    [description]
 */
angular.module('angularCog').directive('cogPut', [
  'MakeRequestService',
  function (MakeRequestService) {
    return {
      restrict: 'A',
      require: '^form',
      scope: true,
      link: function (scope, element, attrs) {
        element.bind('submit', function () {
          var data = scope[attrs.cogModel];
          MakeRequestService('put', data, scope, attrs);
        });
      }
    };
  }
]);
/**
 * DELETE directive, listens to click event
 * @param  {[type]} MakeRequestService [description]
 * @return {[type]}                    [description]
 */
angular.module('angularCog').directive('cogDelete', [
  'MakeRequestService',
  function (MakeRequestService) {
    return {
      restrict: 'A',
      scope: true,
      link: function (scope, element, attrs) {
        element.bind('click', function () {
          console.log('called');
          MakeRequestService('delete', null, scope, attrs);
        });
      }
    };
  }
]);
/**
 * Helper service for making http calls, just to DRY up directives
 * @param  {[type]} $http          [description]
 * @param  {[type]} CogConfig     [description]
 * @param  {[type]} SpinnerService [description]
 * @return {[type]}                [description]
 */
angular.module('angularCog').factory('MakeRequestService', [
  '$http',
  'CogConfig',
  'SpinnerService',
  function ($http, CogConfig, SpinnerService) {
    /**
   * Does actual request
   * @param {string} verb  http verb
   * @param {object|string} data  data to be sent to server
   * @param {object} scope angularjs scope
   * @param {object} attrs attributes of element
   */
    function MakeRequest(verb, data, scope, attrs) {
      //send the http request
      $http({
        method: verb,
        url: getUrl(verb, attrs),
        data: data,
        config: scope[attrs.CogConfig]
      }).success(function (data, status, headers, config) {
        //common function to set scope variables
        responseReceived(data, status, headers, config);
        //evaluates cog-success expression of directive
        scope.$eval(attrs.cogSuccess);
        //global success handler
        CogConfig.success(data, status, headers, config);
      }).error(function (data, status, headers, config) {
        //common function to set scope variables
        responseReceived(data, status, headers, config);
        //evaluates cog-error expression of directive
        scope.$eval(attrs.cogError);
        //global error handler
        CogConfig.error(data, status, headers, config);
      });
      //sometimes $apply is not called immedietly, so this fix
      if (!scope.$$phase) {
        scope.$apply();
      }
      //start the spinner if enabled
      if (CogConfig.enableSpinner && !attrs.cogNoSpinner) {
        SpinnerService.spin();
      }
      /**
     * Common function that gets called for setting scope variables
     * @param  {object|string} data    http response
     * @param  {int} status  response code
     * @param  {object} headers [description]
     * @param  {object} config  [description]
     * @return {[type]}         [description]
     */
      function responseReceived(data, status, headers, config) {
        scope.$data = data;
        scope.$status = status;
        scope.$headers = headers;
        scope.$config = config;
        //stop the spinner once response is recieved
        if (CogConfig.enableSpinner && !attrs.cogNoSpinner) {
          SpinnerService.stop();
        }
        //pass the data to global log
        CogConfig.log(data, status, headers, config);
      }
    }
    ;
    /**
   * return appropriate url based on verb
   * @param  {string} verb  http verb
   * @param  {object} attrs [description]
   * @return {[type]}       [description]
   */
    function getUrl(verb, attrs) {
      var url = attrs.cogAbsoluteUrl ? '' : CogConfig.rootUrl;
      switch (verb) {
      case 'get':
        url += attrs.cogGet;
        break;
      case 'post':
        url += attrs.cogPost;
        break;
      case 'put':
        url += attrs.cogPut;
        break;
      case 'delete':
        url += attrs.cogDelete;
        break;
      }
      return url;
    }
    //return MakeRequest as factory handler
    return MakeRequest;
  }
]);
/**
 * Hacked a service to display spinner on screen
 * I'm not proud of it, but it had to be done.
 * @param  {[type]} CogConfig [description]
 * @return {[type]}            [description]
 */
angular.module('angularCog').service('SpinnerService', [
  'CogConfig',
  function (CogConfig) {
    //html elements and styles
    var spinnerStyle = [
        'position:absolute;',
        'top:50%;',
        'left:50%;',
        'z-index:2000'
      ].join('');
    var spinner = angular.element('<div><img src=\'data:image/gif;base64,R0lGODlhHwAfAPUAAP///wAAAOjo6NLS0ry8vK6urqKiotzc3Li4uJqamuTk5NjY2KqqqqCgoLCwsMzMzPb29qioqNTU1Obm5jY2NiYmJlBQUMTExHBwcJKSklZWVvr6+mhoaEZGRsbGxvj4+EhISDIyMgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+GkNyZWF0ZWQgd2l0aCBhamF4bG9hZC5pbmZvACH5BAAKAAAAIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAHwAfAAAG/0CAcEgUDAgFA4BiwSQexKh0eEAkrldAZbvlOD5TqYKALWu5XIwnPFwwymY0GsRgAxrwuJwbCi8aAHlYZ3sVdwtRCm8JgVgODwoQAAIXGRpojQwKRGSDCRESYRsGHYZlBFR5AJt2a3kHQlZlERN2QxMRcAiTeaG2QxJ5RnAOv1EOcEdwUMZDD3BIcKzNq3BJcJLUABBwStrNBtjf3GUGBdLfCtadWMzUz6cDxN/IZQMCvdTBcAIAsli0jOHSJeSAqmlhNr0awo7RJ19TJORqdAXVEEVZyjyKtE3Bg3oZE2iK8oeiKkFZGiCaggelSTiA2LhxiZLBSjZjBL2siNBOFQ84LxHA+mYEiRJzBO7ZCQIAIfkEAAoAAQAsAAAAAB8AHwAABv9AgHBIFAwIBQPAUCAMBMSodHhAJK5XAPaKOEynCsIWqx0nCIrvcMEwZ90JxkINaMATZXfju9jf82YAIQxRCm14Ww4PChAAEAoPDlsAFRUgHkRiZAkREmoSEXiVlRgfQgeBaXRpo6MOQlZbERN0Qx4drRUcAAJmnrVDBrkVDwNjr8BDGxq5Z2MPyUQZuRgFY6rRABe5FgZjjdm8uRTh2d5b4NkQY0zX5QpjTc/lD2NOx+WSW0++2RJmUGJhmZVsQqgtCE6lqpXGjBchmt50+hQKEAEiht5gUcTIESR9GhlgE9IH0BiTkxrMmWIHDkose9SwcQlHDsOIk9ygiVbl5JgMLuV4HUmypMkTOkEAACH5BAAKAAIALAAAAAAfAB8AAAb/QIBwSBQMCAUDwFAgDATEqHR4QCSuVwD2ijhMpwrCFqsdJwiK73DBMGfdCcZCDWjAE2V347vY3/NmdXNECm14Ww4PChAAEAoPDltlDGlDYmQJERJqEhGHWARUgZVqaWZeAFZbERN0QxOeWwgAAmabrkMSZkZjDrhRkVtHYw+/RA9jSGOkxgpjSWOMxkIQY0rT0wbR2LQV3t4UBcvcF9/eFpdYxdgZ5hUYA73YGxruCbVjt78G7hXFqlhY/fLQwR0HIQdGuUrTz5eQdIc0cfIEwByGD0MKvcGSaFGjR8GyeAPhIUofQGNQSgrB4IsdOCqx7FHDBiYcOQshYjKDxliVDpRjunCjdSTJkiZP6AQBACH5BAAKAAMALAAAAAAfAB8AAAb/QIBwSBQMCAUDwFAgDATEqHR4QCSuVwD2ijhMpwrCFqsdJwiK73DBMGfdCcZCDWjAE2V347vY3/NmdXNECm14Ww4PChAAEAoPDltlDGlDYmQJERJqEhGHWARUgZVqaWZeAFZbERN0QxOeWwgAAmabrkMSZkZjDrhRkVtHYw+/RA9jSGOkxgpjSWOMxkIQY0rT0wbR2I3WBcvczltNxNzIW0693MFYT7bTumNQqlisv7BjswAHo64egFdQAbj0RtOXDQY6VAAUakihN1gSLaJ1IYOGChgXXqEUpQ9ASRlDYhT0xQ4cACJDhqDD5mRKjCAYuArjBmVKDP9+VRljMyMHDwcfuBlBooSCBQwJiqkJAgAh+QQACgAEACwAAAAAHwAfAAAG/0CAcEgUDAgFA8BQIAwExKh0eEAkrlcA9oo4TKcKwharHScIiu9wwTBn3QnGQg1owBNld+O72N/zZnVzRApteFsODwoQABAKDw5bZQxpQ2JkCRESahIRh1gEVIGVamlmXgBWWxETdEMTnlsIAAJmm65DEmZGYw64UZFbR2MPv0QPY0hjpMYKY0ljjMZCEGNK09MG0diN1gXL3M5bTcTcyFtOvdzBWE+207pjUKpYrL+wY7MAB4EerqZjUAG4lKVCBwMbvnT6dCXUkEIFK0jUkOECFEeQJF2hFKUPAIkgQwIaI+hLiJAoR27Zo4YBCJQgVW4cpMYDBpgVZKL59cEBhw+U+QROQ4bBAoUlTZ7QCQIAIfkEAAoABQAsAAAAAB8AHwAABv9AgHBIFAwIBQPAUCAMBMSodHhAJK5XAPaKOEynCsIWqx0nCIrvcMEwZ90JxkINaMATZXfju9jf82Z1c0QKbXhbDg8KEAAQCg8OW2UMaUNiZAkREmoSEYdYBFSBlWppZl4AVlsRE3RDE55bCAACZpuuQxJmRmMOuFGRW0djD79ED2NIY6TGCmNJY4zGQhBjStPTFBXb21DY1VsGFtzbF9gAzlsFGOQVGefIW2LtGhvYwVgDD+0V17+6Y6BwaNfBwy9YY2YBcMAPnStTY1B9YMdNiyZOngCFGuIBxDZAiRY1eoTvE6UoDEIAGrNSUoNBUuzAaYlljxo2M+HIeXiJpRsRNMaq+JSFCpsRJEqYOPH2JQgAIfkEAAoABgAsAAAAAB8AHwAABv9AgHBIFAwIBQPAUCAMBMSodHhAJK5XAPaKOEynCsIWqx0nCIrvcMEwZ90JxkINaMATZXfjywjlzX9jdXNEHiAVFX8ODwoQABAKDw5bZQxpQh8YiIhaERJqEhF4WwRDDpubAJdqaWZeAByoFR0edEMTolsIAA+yFUq2QxJmAgmyGhvBRJNbA5qoGcpED2MEFrIX0kMKYwUUslDaj2PA4soGY47iEOQFY6vS3FtNYw/m1KQDYw7mzFhPZj5JGzYGipUtESYowzVmF4ADgOCBCZTgFQAxZBJ4AiXqT6ltbUZhWdToUSR/Ii1FWbDnDkUyDQhJsQPn5ZU9atjUhCPHVhgTNy/RSKsiqKFFbUaQKGHiJNyXIAAh+QQACgAHACwAAAAAHwAfAAAG/0CAcEh8JDAWCsBQIAwExKhU+HFwKlgsIMHlIg7TqQeTLW+7XYIiPGSAymY0mrFgA0LwuLzbCC/6eVlnewkADXVECgxcAGUaGRdQEAoPDmhnDGtDBJcVHQYbYRIRhWgEQwd7AB52AGt7YAAIchETrUITpGgIAAJ7ErdDEnsCA3IOwUSWaAOcaA/JQ0amBXKa0QpyBQZyENFCEHIG39HcaN7f4WhM1uTZaE1y0N/TacZoyN/LXU+/0cNyoMxCUytYLjm8AKSS46rVKzmxADhjlCACMFGkBiU4NUQRxS4OHijwNqnSJS6ZovzRyJAQo0NhGrgs5bIPmwWLCLHsQsfhxBWTe9QkOzCwC8sv5Ho127akyRM7QQAAOwAAAAAAAAAAAA==\'/></div>');
    spinner.attr('style', spinnerStyle);
    //spinner.find("img").attr("src", CogConfig.imagePath);
    var backdropStyle = [
        'position:fixed;',
        'top:0;',
        'left:0;',
        'width:100%;',
        'height:100%;',
        'background:white;',
        'text-align:center;',
        'opacity:0.7;'
      ].join('');
    var backdrop = angular.element('<div></div>');
    backdrop.attr('style', backdropStyle);
    //keep track of all requests
    //makes life easier when multiple ajax requests are fired from same view
    var requests = [];
    var isSpinning = false;
    return {
      spin: function () {
        requests.push(1);
        if (!isSpinning) {
          angular.element(document.body).append(backdrop);
          angular.element(document.body).append(spinner);
          isSpinning = true;
        }
      },
      stop: function () {
        requests.pop();
        if (requests.length == 0) {
          backdrop.remove();
          spinner.remove();
          isSpinning = false;
        }
      }
    };
  }
]);
/**
 * Configuration for angular-cog
 * @return {[type]} [description]
 */
angular.module('angularCog').provider('CogConfig', function () {
  this.rootUrl = '';
  this.log = angular.noop;
  this.imagePath = 'spinner.gif';
  this.error = angular.noop;
  this.success = angular.noop;
  this.enableSpinner = true;
  var self = this;
  this.$get = function () {
    return self;
  };
});