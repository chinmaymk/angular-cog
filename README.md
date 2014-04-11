angular-cog
===========
declarative ajax requests for angularjs 

###Cog?
A subordinate member of an organization who performs necessary but usually minor or routine functions.

###Groundwork first
angular-cog exposes few directives that act as helpers for ajax requests. For every request 4 attributes are most important

1. Url
2. Data to be sent
3. Headers
3. Whether reponse is success or error

angular-cog allows you to configure these from html directive and remove the clutter from javascript.

###Installation
Installation is very straight forward. Grab the latest zip from github. Copy angular-cog.min.js in your root, and refer it in your page.
```html
<script type='text/javascript' href='path/to/js/angular-cog.min.js'></script>
```
Then,add it as dependency in your module
```javascript
angular.module('yourApp', ['angularCog']);
```
###Directive
```html
<!-- verb in cog-verb could be - get, post, put or delete -->
<div cog-verb="{url}" 
		cog-model="{ng-model}" 
		cog-success="{angular.expression}" 
		cog-error="{angular.expression}"
		cog-trigger="{angular.expression}"
		cog-no-spinner="{true|false}" 
		cog-absolute-url="{true|false}" 
		cog-config="{object}">
</div>
```

Attribute | Meaning | Example
--- | --- | ---
```cog-*verb*``` | url to call, [get,post,put,delete] decides the http verb | ```cog-get="/users"```, ```cog-post="/users"```
```cog-model``` | data that will be passed with post and put request  | ```cog-model="user"```
```cog-success``` | expression to evaluate if response is 200 | ```cog-success="users = $data"```, ```cog-success="setUsers($data)```
```cog-error``` | expression to evaluate if response is not 200 | ```cog-error="error($headers)"```
```cog-trigger``` | by default, request will be sent as soon as directive is compiled, in case you would like to delay the request you could use cog-trigger. angular-cog will watch the expression and fire the request as soon as it becomes true. **applicable to cog-get only** | ```cog-trigger="user != null"```
```cog-no-spinner``` | if you don't want to display spinner for this particular request, refer [spinner](#spinner) for more information | ```cog-no-spinner="true"```
```cog-absolute-url``` | by default CogConfig.rootUrl will be prepended to every url, if you don't want to then use this attribute  | ```cog-absolute-url="true"```
```cog-config``` | header object to pass to angular $http  | 

**Note:** ```cog-post``` and ```cog-put``` are only allowed on ```<form>``` elements. Refer [sample](#sample-usages) usages for more information.

**Special attributes available from directive**
```
$data //angularjs data object
$status //angularjs status object
$headers //angularjs headers object
$config //angularjs config object
```
for more information please visit [$http](http://docs.angularjs.org/api/ng/service/$http) documentation

###Configuration
angular-cog allows you to configure following, comment in front of attribute states default value
```javascript
angular.module('example').config(function(CogConfigProvider) {
  	//prepended to every request url
	CogConfigProvider.rootUrl = {url}; //""
	//log function to call after every request, could be used for tracing
	CogConfigProvider.log = {function}; //angular.noop;
	//angular-cog can show a nice spinner on page if you want, refer spinner section for more
	CogConfigProvider.imagePath = {path to spinner}; //"spinner.gif";
	//this will be called if request returns with error
	CogConfigProvider.error = {function}; //angular.noop;
	//this will be called if request returns with success
	CogConfigProvider.success = {function}; //angular.noop;
	//enables, disables spinner. refer spinner section for more
	CogConfigProvider.enableSpinner = {true|false}; //true
});
```

###Sample usages
**cog-get**
```html
<!-- By default, get requests are made as soon as directive is linked
if you would like to manually trigger the request use cog-trigger -->

<!-- this will trigger a GET /users request and 
if successful, fill returned data in $scope.users -->
<div cog-get="/users" cog-success="users = $data"></div>

<!-- this will trigger a GET /users request and 
if failed, call  $scope.checkError function with status code as argument -->
<div cog-get="/users" cog-error="checkError($status)"></div>
```
**cog-post**
```html
<!-- POST /users will be sent once form is submitted, 
model defined in cog-model will be sent as payload -->
<!-- on success angular-cog will push newly returned user to $scope.users -->
<!-- notice the usage of $data, this is inserted by angular-cog -->
<form cog-post="/users" cog-model="newUser" cog-success="users.push($data)">
  <input type="text" ng-model="newUser.name" required/>
  <input type="text" ng-model="newUser.email" required/>
  <input type="text" ng-model="newUser.password" required/>
  <button type="submit" value="submit">Submit</button>
</form>
```
**cog-put**
```html
<!-- PUT /users will be sent once form is submitted, 
model defined in cog-model will be sent as data -->
<!-- on success angular-cog will call $scope.enjoySuccess() function -->
<form cog-put="/users" cog-model="newUser" cog-success="enjoySuccess()">
  <input type="text" ng-model="newUser.name" required/>
  <input type="text" ng-model="newUser.email" required/>
  <input type="text" ng-model="newUser.password" required/>
  <button type="submit" value="submit">Submit</button>
</form>
```
**Note:** for ```cog-put``` and ```cog-post```, ```cog-model``` is necessary. else the request will be sent with blank payload. Also, ```cog-put``` and ```cog-post``` can be only used with ```<form>``` elements, this restriction is imposed so we can leverage validations provided by angularjs.

**cog-delete**
```html
<!-- this will trigger a DELETE /users/1 request on click event of this div and 
if successful, call  $scope.removeUser function with returned data as argument -->
<div cog-delete="/users/1" cog-success="removeUser($data)"></div>
```

###Spinner
It could be a lot of pain to track all ajax requests from view and display loaders accordingly. angular-cog provides an easy fix for this problem. Each request is pushed to a stack and poped once returned, and till the stack has atleast one element we display the spinner.

To get spinner working in your project follow these steps:

1. Copy ```spinner.gif``` from ```dist ``` folder to appropriate lcoation
2. Set ```CogConfigProvider.imagePath``` to that location (refer [configuration](#configuration))
3. Set ```CogConfigProvider.enableSpinner``` to ```true```
4. Drink tea, tea is good.


By default all requests made by angular-cog will be tracked, to get spinner for your own ajax requests follow this:

1. Add ```SpinnerService``` as an argument to your controller
2. Call ```SpinnerService.spin()``` before making the request
3. Call ```SpinnerService.stop()``` once the response is received (either success or error!)
4. Finish your tea. 

###Read too much ? Enjoy this meme
![Why don't we](https://raw.githubusercontent.com/chinmaymk/angular-cog/master/why.jpg)

###License
The MIT License (MIT)

Copyright (c) 2014 Chinmay Kulkarni

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

###Got suggestions ?
Feel free to submit a pull request, file an issue, or get in touch on twitter [@_chinmaymk](https://twitter.com/_chinmaymk)
