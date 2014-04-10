/**
 * Main module
 */
angular.module('angularCog', []);


/**
 * GET directive, this sends request immedietly
 * @param  {[type]} MakeRequestService [description]
 * @return {[type]}                    [description]
 */
angular.module('angularCog').directive('cogGet', function(MakeRequestService) {
  return {
    restrict: 'A',
    scope: true,
    link: function(scope, element, attrs) {
      //check if there's a trigger
      if (attrs.cogTrigger) {
        //watch for the expression
        scope.$watch(attrs.cogTrigger, function(newVal, oldVal) {
          //if the changed value becomes true, fire away request!
          if (newVal) {
            MakeRequestService('get', null, scope, attrs);
          }
        })
      } else {
        //make immediate request if there isn't
        MakeRequestService('get', null, scope, attrs);
      }
    }
  }
});

/**
 * POST directive, listens to form submit
 * @param  {[type]} MakeRequestService [description]
 * @return {[type]}                    [description]
 */
angular.module('angularCog').directive('cogPost', function(MakeRequestService) {
  return {
    restrict: 'A',
    require: '^form',
    scope: true,
    link: function(scope, element, attrs) {
      element.bind("submit", function() {
        var data = scope[attrs.cogModel];
        MakeRequestService('post', data, scope, attrs);
      });
    }
  }
})

/**
 * PUT directive, listens to form submit
 * @param  {[type]} MakeRequestService [description]
 * @return {[type]}                    [description]
 */
angular.module('angularCog').directive('cogPut', function(MakeRequestService) {
  return {
    restrict: 'A',
    require: '^form',
    scope: true,
    link: function(scope, element, attrs) {
      element.bind("submit", function() {
        var data = scope[attrs.cogModel];
        MakeRequestService('put', data, scope, attrs);
      });
    }
  }
})

/**
 * DELETE directive, listens to click event
 * @param  {[type]} MakeRequestService [description]
 * @return {[type]}                    [description]
 */
angular.module('angularCog').directive('cogDelete', function(MakeRequestService) {
  return {
    restrict: 'A',
    scope: true,
    link: function(scope, element, attrs) {
      element.bind("click", function() {
        console.log('called');
        MakeRequestService('delete', null, scope, attrs);
      });
    }
  }
});

/**
 * Helper service for making http calls, just to DRY up directives
 * @param  {[type]} $http          [description]
 * @param  {[type]} CogConfig     [description]
 * @param  {[type]} SpinnerService [description]
 * @return {[type]}                [description]
 */
angular.module('angularCog').factory('MakeRequestService', function($http, CogConfig, SpinnerService) {
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
      //gets url based on verb and attribute
      url: getUrl(verb, attrs),
      data: data,
      config: scope[attrs.CogConfig]
    }).success(function(data, status, headers, config) {
      //common function to set scope variables
      responseReceived(data, status, headers, config);
      //evaluates cog-success expression of directive
      scope.$eval(attrs.cogSuccess);
      //global success handler
      CogConfig.success(data, status, headers, config);
    }).error(function(data, status, headers, config) {
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
  };

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
})

/**
 * Hacked a service to display spinner on screen
 * I'm not proud of it, but it had to be done.
 * @param  {[type]} CogConfig [description]
 * @return {[type]}            [description]
 */
angular.module('angularCog').service("SpinnerService", function(CogConfig) {

  //html elements and styles
  var spinnerStyle = [
    "position:absolute;",
    "top:50%;",
    "left:50%;",
    "z-index:2000"
  ].join('');
  var spinner = angular.element("<div><img /></div>");
  spinner.attr("style", spinnerStyle)
  spinner.find("img").attr("src", CogConfig.imagePath);

  var backdropStyle = ["position:fixed;",
    "top:0;",
    "left:0;",
    "width:100%;",
    "height:100%;",
    "background:white;",
    "text-align:center;",
    "opacity:0.7;"
  ].join('');
  var backdrop = angular.element("<div></div>");
  backdrop.attr("style", backdropStyle);

  //keep track of all requests
  //makes life easier when multiple ajax requests are fired from same view
  var requests = [];
  var isSpinning = false;
  return {
    //enqueue the request 
    //append backdrop
    //append the spinner 
    //if you dont spinner for a particular request set this to true
    spin: function() {
      requests.push(1);
      if (!isSpinning) {
        angular.element(document.body).append(backdrop);
        angular.element(document.body).append(spinner);
        isSpinning = true;
      }
    },
    //dequeue the request
    //remove the backdrop
    //remove spinner
    stop: function() {
      requests.pop();
      if (requests.length == 0) {
        backdrop.remove();
        spinner.remove();
        isSpinning = false;
      }
    }
  }
});

/**
 * Configuration for angular-cog
 * @return {[type]} [description]
 */
angular.module('angularCog').provider('CogConfig', function() {
  this.rootUrl = '';
  this.log = angular.noop;
  this.imagePath = "spinner.gif";
  this.error = angular.noop;
  this.success = angular.noop;
  this.enableSpinner = true;
  var self = this;
  this.$get = function() {
    return self;
  }
});