/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);

	var texts = __webpack_require__(5);
	var getText = __webpack_require__(6)(texts, 'en-GB');

	angular.module('app', ['ngRoute', 'ui.bootstrap']);

	angular.module('app').config(['$routeProvider',
	  function($routeProvider) {
	    $routeProvider
	      .when('/', {
	        templateUrl: 'project-list.html',
	        controller: 'ProjectListController'
	      })
	      .when('/create-project', {
	        templateUrl: 'create-project.html',
	        controller: 'CreateProjectController'
	      })
	      .when('/projects/:projectId/settings', {
	        templateUrl: 'project-settings.html',
	        controller: 'ProjectSettingsController'
	      })
	      .when('/projects/:projectId/repository', {
	        templateUrl: 'repository.html',
	        controller: 'RepositoryController'
	      })
	      .when('/user/profile', {
	        templateUrl: 'user-profile.html',
	        controller: 'UserProfileController'
	      })
	      .when('/user/settings', {
	        templateUrl: 'user-settings.html',
	        controller: 'UserSettingsController'
	      })
	      .otherwise({
	        redirectTo: '/'
	      });
	  }]);

	angular.module('app').controller('CreateProjectController', ['$scope', '$location', 'ProjectService', 'UserService', CreateProjectController]);
	angular.module('app').controller('ProjectListController', ['$scope', 'ProjectService', ProjectListController]);
	angular.module('app').controller('ProjectSettingsController', ['$scope', '$routeParams', 'ProjectService', ProjectSettingsController]);

	angular.module('app').controller('UserProfileController', ['$scope', 'UserService', UserProfileController]);
	angular.module('app').controller('UserSettingsController', ['$scope', 'UserService', UserSettingsController]);
	angular.module('app').controller('NavBarController', ['$scope', '$location', '$routeParams', 'ProjectService', 'UserService', NavBarController]);
	angular.module('app').controller('RepositoryController', ['$scope', '$routeParams', '$location', '$uibModal', 'RepositoryService', 'RepositoryTextsService', 'UserService', RepositoryController]);

	angular.module('app').controller('ErrorModalController', ['$scope', '$uibModalInstance', ErrorModalController]);
	angular.module('app').service('RepositoryService', ['$http', '$q', RepositoryService]);
	angular.module('app').service('RepositoryTextsService', ['$http', '$q', RepositoryTextsService]);
	angular.module('app').service('UserService', ['$http', '$q', UserService]);
	angular.module('app').service('ProjectService', ['$http', '$q', ProjectService]);
	angular.module('app').constant('getText', getText);
	angular.module('app').filter('text', ['getText', textFilter]);
	angular.module('app').directive('text', ['getText', textDirective]);

	angular.module('app').config(['$httpProvider', handle401]);

	function handle401($httpProvider) {
	    $httpProvider.interceptors.push(function($q) {
	        return {
	            'responseError': function(rejection){
	                var defer = $q.defer();

	                if(rejection.status == 401){
	                    window.location.href = '/';
	                }

	                defer.reject(rejection);

	                return defer.promise;
	            }
	        };
	    });
	}

	function textFilter(getText) {
	  return function(text) {
	    return getText(text);
	  }
	}

	function textDirective(getText) {
	  return {
	    restrict: 'A',
	    link: function (scope, elem, attrs) {
	        elem.html(getText(elem.html()));
	    }
	  }
	}

	function CreateProjectController ($scope, $location, ProjectService, UserService) {
	  $scope.createProjectFormData = {};

	  UserService.getUserRepositories().then(function(repositories) {
	    $scope.repositories = repositories;
	  })

	  $scope.submitCreateProjectForm = function() {
	    ProjectService.createProject($scope.createProjectFormData.projectName, $scope.createProjectFormData.repositoryUrl).then(function(projectId) {
	       $location.path('/projects/' + projectId + '/repository');
	    });
	  }
	}

	function ProjectListController ($scope, ProjectService) {
	  ProjectService.getProjects().then(function(projects) {
	    $scope.projects = projects;
	  });
	}

	function ProjectSettingsController ($scope, $routeParams, ProjectService) {
	  ProjectService.getProjectSettings($routeParams.projectId).then(function(projectSettings) {
	    $scope.projectSettings = projectSettings;
	  });

	  $scope.submitUpdateProjectSettingsForm = function() {
	    if($scope.updateProjectSettingsForm.$valid) {
	      ProjectService.updateProjectSettings($routeParams.projectId, $scope.projectSettings);
	    }
	  }
	}

	function UserProfileController ($scope, UserService) {
	  UserService.getUserProfile().then(function(userProfile) {
	    $scope.userProfile = userProfile;
	  });

	  $scope.submitUserProfileForm = function() {
	    if($scope.userProfileForm.$valid) {
	      UserService.updateUserProfile($scope.userProfile);
	    }
	  }
	}

	function UserSettingsController ($scope, UserService) {
	  UserService.getUserSettings().then(function(userSettings) {
	    $scope.userSettings = userSettings;
	  });

	  $scope.submitUserSettingsForm = function() {
	    if($scope.userSettingsForm.$valid) {
	      UserService.updateUserSettings($scope.userSettings);
	    }
	  }
	}

	function NavBarController ($scope,  $location, $routeParams, ProjectService, UserService) {
	  $scope.currentProjectId = function() {
	    return $routeParams.projectId;
	  }

	  ProjectService.getProjects().then(function(projects) {
	    $scope.projects = projects;
	  });

	  UserService.getUserProfile().then(function(userProfile) {
	    $scope.userProfile = userProfile;
	  });
	}

	function RepositoryController ($scope, $routeParams, $location, $uibModal, RepositoryService, RepositoryTextsService, UserService) {
	  $scope.allTexts = [];
	  $scope.availableColumns = [];
	  $scope.projectId = $routeParams.projectId;
	  $scope.searchText = undefined;
	  $scope.selectedColumns = [];
	  $scope.userSettings = { columns: [] };

	  $scope.addText = addText;
	  $scope.moveText = moveText;
	  $scope.error = error;
	  $scope.removeText = removeText;
	  $scope.resetAddTextFormData = resetAddTextFormData;
	  $scope.sync = sync;
	  $scope.toggleColumn = toggleColumn;
	  $scope.update = update;
	  $scope.updateTextValue = updateTextValue;

	  $scope.$watch('texts', function() {
	    if (!$scope.texts)
	      return;

	    $scope.allTexts = Object.keys($scope.texts).reduce(function(array, id) {
	      array.push({
	        id: id,
	        languages: $scope.texts[id]
	      });

	      return array;
	    }, []);

	    updateAvailableColumns();
	    updateSelectedColumns();
	  }, true);

	  $scope.resetAddTextFormData();
	  $scope.update();

	  function addText () {
	    console.info('addText()');

	    $scope.addTextFormData.languages = $scope.addTextFormData.languages || {};

	    RepositoryTextsService.addText($routeParams.projectId, $scope.addTextFormData.textId, $scope.addTextFormData.languages).then(success);

	    function success () {
	      $scope.texts[$scope.addTextFormData.textId] = $scope.addTextFormData.languages;
	      $scope.resetAddTextFormData();
	    }
	  }

	  function error (message) {
	    console.info('error()');

	    var errorModal = $uibModal.open({
	      templateUrl: 'errorModal.html',
	      controller: 'ErrorModalController',
	      resolve: {
	           message: function () {
	               return message;
	           }
	       }
	    });
	  }

	  function moveText (fromTextId, toTextId) {
	    console.info('moveText()');

	    RepositoryTextsService.moveText($routeParams.projectId, fromTextId, toTextId).then(success, error);

	    function success () {
	    }

	    function error () {
	    }
	  }

	  function removeText (textId) {
	    console.info('removeText()');

	    RepositoryTextsService.removeText($routeParams.projectId, textId).then(success);

	    function success () {
	      delete $scope.texts[textId];
	    }
	  }

	  function resetAddTextFormData () {
	    console.info('resetAddTextFormData()');

	    $scope.addTextFormData = {
	      textId: undefined,
	      languages: {}
	    }
	  };

	  function sync () {
	    console.info('sync()');

	    $scope.updatingTexts = true;
	    RepositoryService.syncRepository($routeParams.projectId).then($scope.update, $scope.error);
	  }

	  function toggleColumn (column) {
	    console.info('toggleColumn()');

	    var indexOfColumn = $scope.userSettings.columns.indexOf(column);

	    if (indexOfColumn > -1) {
	      $scope.userSettings.columns.splice(indexOfColumn, 1);
	    } else {
	      $scope.userSettings.columns.push(column);
	      $scope.userSettings.columns.sort();
	    }

	    UserService.updateUserSettings($scope.userSettings).then(function() {
	      updateSelectedColumns();
	    });
	  };

	  function update () {
	    console.info('update()');

	    $scope.updatingTexts = true;

	    RepositoryTextsService.getTexts($routeParams.projectId).then(function(texts) {
	      UserService.getUserSettings().then(function(userSettings) {
	        $scope.texts = texts;
	        $scope.userSettings = userSettings;
	        $scope.updatingTexts = false;
	      });
	    });
	  }

	  function updateAvailableColumns () {
	    console.info('updateAvailableColumns()');

	    if ($scope.texts) {
	      var languageMap = Object.keys($scope.texts).reduce(function(memo, textKey) {
	        var text = $scope.texts[textKey];

	        Object.keys(text).forEach(function(language) {
	          memo[language] = (memo[language] || 0) + 1;
	        });

	        return memo;
	      }, {});

	      $scope.availableColumns = Object.keys(languageMap).sort();
	    } else {
	      $scope.availableColumns = [];
	    }
	  };

	  function updateSelectedColumns() {
	    console.info('updateSelectedColumns()');

	    if ($scope.userSettings && $scope.userSettings.columns) {
	      $scope.selectedColumns = $scope.availableColumns.filter(function(column) {
	        return $scope.userSettings.columns.indexOf(column) > -1;
	      });
	    } else {
	      $scope.selectedColumns = [];
	    }
	  };

	  function updateTextValue (textId, languageCode, oldValue) {
	    console.info('updateTextValue()');

	    var value = $scope.texts[textId][languageCode];

	    if (oldValue === '' && value !== '') {
	      RepositoryTextsService.addTextValue($routeParams.projectId, textId, languageCode, value).then(success, error);
	    } else if (oldValue !== '' && value === '') {
	      RepositoryTextsService.removeTextValue($routeParams.projectId, textId, languageCode, value).then(success, error);
	    } else if (oldValue !== '' && value !== '') {
	      RepositoryTextsService.replaceTextValue($routeParams.projectId, textId, languageCode, value).then(success, error);
	    }

	    function success () {
	    }

	    function error () {
	      $scope.texts[textId][languageCode] = oldValue;
	    }
	  }
	}

	function ErrorModalController ($scope, $uibModalInstance, message) {
	  $scope.message = message;
	  $scope.ok = function () {
	    $uibModalInstance.close();
	  };
	}

	function RepositoryService($http, $q) {
	  function getResponseData(response) {
	    return response.data;
	  }

	  function getResponseStatusCode(response) {
	    return $q.reject(response.status);
	  }

	  function syncRepository(projectId) {
	    return $http({
	      method: 'POST',
	      url: '/api/projects/' + projectId + '/repository/sync',
	    })
	    .then(getResponseData, getResponseStatusCode)
	  }

	  return {
	    syncRepository: syncRepository
	  };
	}

	function RepositoryTextsService($http, $q) {
	  function getResponseData(response) {
	    return $q.resolve(response.data);
	  }

	  function getResponseStatusCode(response) {
	    return $q.reject(response.status);
	  }

	  function getTexts(projectId) {
	    return $http({
	      method: 'GET',
	      url: '/api/projects/' + projectId + '/repository/texts'
	    })
	    .then(getResponseData, getResponseStatusCode)
	  }

	  function patchRepositoryTexts(projectId, patch) {
	    return $http({
	      method: 'PATCH',
	      url: '/api/projects/' + projectId + '/repository/texts',
	      data: patch
	    })
	    .then(getResponseData, getResponseStatusCode)
	  }

	  function addText(projectId, textId, text) {
	    return patchRepositoryTexts(projectId, [
	      {
	        op: 'add',
	        path: '/' + textId,
	        value: text
	      }
	    ]);
	  }

	  function addTextValue(projectId, textId, languageCode, value) {
	    return patchRepositoryTexts(projectId, [
	      {
	        op: 'add',
	        path: '/' + textId + '/' + languageCode,
	        value: value
	      }
	    ]);
	  }

	  function replaceTextValue(projectId, textId, languageCode, value) {
	    return patchRepositoryTexts(projectId, [
	      {
	        op: 'replace',
	        path: '/' + textId + '/' + languageCode,
	        value: value
	      }
	    ]);
	  }

	  function removeTextValue(projectId, textId, languageCode) {
	    return patchRepositoryTexts(projectId, [
	      {
	        op: 'remove',
	        path: '/' + textId + '/' + languageCode
	      }
	    ]);
	  }

	  function removeText(projectId, textId) {
	    return patchRepositoryTexts(projectId, [
	      {
	        op: 'remove',
	        path: '/' + textId
	      }
	    ]);
	  }

	  function moveText(projectId, fromTextId, toTextId) {
	    return patchRepositoryTexts(projectId, [
	      {
	        op: 'move',
	        from: '/' + fromTextId,
	        path: '/' + toTextId
	      }
	    ]);
	  }

	  return {
	    addText: addText,
	    addTextValue: addTextValue,
	    getTexts: getTexts,
	    moveText: moveText,
	    removeText: removeText,
	    removeTextValue: removeTextValue,
	    replaceTextValue: replaceTextValue
	  };
	}

	function UserService($http, $q) {
	  function getResponseData(response) {
	    return response.data;
	  }

	  function getResponseStatusCode(response) {
	    return $q.reject(response.status);
	  }

	  function getUserProfile() {
	    return $http({
	      method: 'GET',
	      url: '/api/user/profile'
	    }).then(getResponseData, getResponseStatusCode)
	  }

	  function updateUserProfile(userProfile) {
	    return $http({
	      method: 'POST',
	      url: '/api/user/profile',
	      data: userProfile
	    }).then(getResponseData, getResponseStatusCode)
	  }

	  function getUserRepositories() {
	    return $http({
	      method: 'GET',
	      url: '/api/user/repositories'
	    })
	    .then(getResponseData, getResponseStatusCode)
	  }

	  function getUserSettings() {
	    return $http({
	      method: 'GET',
	      url: '/api/user/settings'
	    }).then(getResponseData, getResponseStatusCode)
	  }

	  function updateUserSettings(userSettings) {
	    return $http({
	      method: 'POST',
	      url: '/api/user/settings',
	      data: userSettings
	    }).then(getResponseData, getResponseStatusCode)
	  }

	  return {
	    getUserProfile: getUserProfile,
	    getUserRepositories: getUserRepositories,
	    getUserSettings: getUserSettings,
	    updateUserProfile: updateUserProfile,
	    updateUserSettings: updateUserSettings
	  };
	}

	function ProjectService($http, $q) {
	  function getResponseData(response) {
	    return response.data;
	  }

	  function getResponseStatusCode(response) {
	    return $q.reject(response.status);
	  }

	  function createProject(projectName, repositoryUrl) {
	    return $http({
	      method: 'POST',
	      url: '/api/projects',
	      data: {
	        projectName: projectName,
	        repositoryUrl: repositoryUrl
	      }
	    }).then(getResponseData, getResponseStatusCode)
	  }

	  function getProjects() {
	    return $http({
	      method: 'GET',
	      url: '/api/projects'
	    }).then(getResponseData, getResponseStatusCode)
	  }

	  function getProjectSettings(projectId) {
	    return $http({
	      method: 'GET',
	      url: '/api/projects/' + projectId + '/settings'
	    }).then(getResponseData, getResponseStatusCode)
	  }

	  function updateProjectSettings(projectId, projectSettings) {
	    return $http({
	      method: 'POST',
	      url: '/api/projects/' + projectId + '/settings',
	      data: projectSettings
	    }).then(getResponseData, getResponseStatusCode)
	  }

	  return {
	    createProject: createProject,
	    getProjects: getProjects,
	    getProjectSettings: getProjectSettings,
	    updateProjectSettings: updateProjectSettings
	  };
	}

	angular.module('app').filter('objectLimitTo', [function(){
	    return function(obj, limit){
	        var keys = Object.keys(obj);
	        if(keys.length < 1){
	            return [];
	        }

	        var ret = new Object,
	        count = 0;
	        angular.forEach(keys, function(key, arrayIndex){
	            if(count >= limit){
	                return false;
	            }
	            ret[key] = obj[key];
	            count++;
	        });
	        return ret;
	    };
	}]);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(2);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(4)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./index.css", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./index.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(3)();
	// imports


	// module
	exports.push([module.id, "* {\r\n    box-sizing: border-box;\r\n}\r\n\r\nhtml, body, .main {\r\n  margin:0;\r\n  height:100%;\r\n  min-height:100%;\r\n}\r\nform {margin : 0}\r\n.main {\r\n  padding-top: 50px;\r\n  padding-bottom: 50px;\r\n}\r\n\r\n.dropdown-menu .active {\r\n  font-weight: bold;\r\n}\r\n\r\n.section { padding: 30px 0;}\r\n.section-default { }\r\n.section-primary { background-color: #eee; }\r\n\r\n.jumbotron  {\r\n    background-color: #2780e3;\r\n    color: #fff;\r\n}\r\n\r\n.beta {\r\n  background-color: #333;\r\n  color: #ccc;\r\n  border-radius: 3px;\r\n  padding: 2px 5px;\r\n}\r\n\r\n.jumbotron h1 {\r\n    font-size: 12rem;\r\n}\r\n\r\n.jumbotron .lead {\r\n    margin-bottom: 4rem;\r\n}\r\n\r\n.jumbotron .btn-primary {\r\n    background-color: #1967be;\r\n    border-color: #1862b5;\r\n    font-size: 4rem;\r\n}\r\n\r\n.toolbar { background-color: #eee; margin-bottom: 50px; position: fixed; width: 100%; }\r\n\r\n.toolbar + * { padding-top: 73px; }\r\n\r\n.btn-toolbar { margin: 15px -5px; }\r\n.btn-toolbar form { margin: 0; }\r\n.navbar-bottom { margin-bottom: 0;}\r\n\r\n.navbar-text {\r\n  margin-left: 0;\r\n}\r\n\r\npre {\r\n  margin: 0;\r\n  padding: 0;\r\n  background: none;\r\n  border: none;\r\n}\r\n\r\nbutton .glyphicon {\r\n  line-height: 1.4em;\r\n}\r\n\r\n.table-flex {\r\n  height:100%;\r\n  min-height:100%;\r\n  display: flex;\r\n  flex-direction: column;\r\n}\r\n\r\n.table-flex .table-header,\r\n.table-flex .table-body,\r\n.table-flex .table-footer {\r\n  border-top: 1px solid #ccc;\r\n}\r\n\r\n.table-flex .table-header .table-column  {\r\n  border-left: 1px solid #ccc;\r\n}\r\n\r\n.table-flex .table-body .table-column  {\r\n  border-width: 0;\r\n}\r\n\r\n.table-flex .table-header,\r\n.table-flex .table-footer {\r\n  background-color: #eee;\r\n  flex: 0 0 32px;\r\n  padding-right: 17px;\r\n}\r\n\r\n.table-flex .table-body {\r\n   flex: 1;\r\n   overflow-y: scroll;\r\n}\r\n\r\n.table-flex .table-header .table-column {\r\n  padding: 5px 10px;\r\n  font-weight: bold;\r\n}\r\n\r\n.table-flex .table-row {\r\n  display: flex;\r\n  flex-direction: row;\r\n}\r\n\r\n.table-flex .table-column {\r\n  flex: 1;\r\n}\r\n\r\n.table-flex .table-column:hover {\r\n  background-color: #eee;\r\n}\r\n\r\n.table-flex .table-column input {\r\n  font-size: 1.1em;\r\n  border-top-width: 0;\r\n  border-right-width: 0;\r\n  background: transparent;\r\n}\r\n\r\n.table-flex .table-column:first-child {\r\n  flex: 0 0 480px;\r\n}\r\n\r\n.table-flex .table-column:last-child {\r\n  flex: 0 0 36px;\r\n}\r\n", ""]);

	// exports


/***/ },
/* 3 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = {
		"About": {
			"en-GB": "About",
			"da-DK": "Om"
		},
		"Cancel": {
			"en-GB": "Cancel",
			"da-DK": "Annullér"
		},
		"Help": {
			"en-GB": "Help",
			"da-DK": "Hjælp"
		},
		"License": {
			"en-GB": "License",
			"da-DK": "Licens"
		},
		"OK": {
			"en-GB": "Ok",
			"da-DK": "Ok"
		},
		"Repository name": {
			"en-GB": "Repository name",
			"da-DK": "Arkivnavn"
		},
		"Repository url": {
			"en-GB": "Repository url",
			"da-DK": "Arkivadresse"
		},
		"Translator App": {
			"da-DK": "Translator App",
			"en-GB": "Translator App"
		},
		"Key": {
			"da-DK": "Nøgle",
			"en-GB": "Key"
		},
		"Columns": {
			"da-DK": "Kolonner",
			"en-GB": "Columns"
		},
		"Checkout": {
			"da-DK": "Check ud",
			"en-GB": "Checkout"
		},
		"Sync": {
			"da-DK": "Synkronisér",
			"en-GB": "Sync"
		},
		"Order by": {
			"da-DK": "Sorter efter",
			"en-GB": "Order by"
		},
		"Message": {
			"en-GB": "Message",
			"da-DK": "Besked"
		},
		"search": {
			"da-DK": "søg",
			"en-GB": "search"
		}
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	function create(texts, language) {
	  function getText(text) {
	    return (texts[text] || {})[language] || text;
	  }

	  return getText;
	}

	module.exports = create;


/***/ }
/******/ ]);