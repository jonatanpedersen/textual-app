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
	        templateUrl: 'index.html',
	        controller: 'IndexController'
	      })
	      .when('/about', {
	        templateUrl: 'about.html',
	        controller: 'AboutController'
	      })
	      .when('/clone-repository', {
	        templateUrl: 'clone-repository.html',
	        controller: 'CloneRepositoryController'
	      })
	      .when('/help', {
	        templateUrl: 'help.html',
	        controller: 'HelpController'
	      })
	      .when('/license', {
	        templateUrl: 'license.html',
	        controller: 'LicenseController'
	      })
	      .when('/repository/', {
	        templateUrl: 'repository-list.html',
	        controller: 'RepositoryListController'
	      })
	      .when('/repository/:repositoryName', {
	        templateUrl: 'repository.html',
	        controller: 'RepositoryController'
	      })
	      .otherwise({
	        redirectTo: '/'
	      });
	  }]);

	angular.module('app').controller('AboutController', [AboutController]);
	angular.module('app').controller('CloneRepositoryController', ['$scope', '$location', 'RepositoryService', CloneRepositoryController]);
	angular.module('app').controller('HelpController', [HelpController]);
	angular.module('app').controller('IndexController', [IndexController]);
	angular.module('app').controller('LicenseController', [LicenseController]);
	angular.module('app').controller('NavBarController', ['$scope', '$location', '$routeParams', 'RepositoryService', NavBarController]);
	angular.module('app').controller('RepositoryController', ['$scope', '$routeParams', '$location', '$uibModal', 'RepositoryService', RepositoryController]);
	angular.module('app').controller('RepositoryListController', ['$scope', 'RepositoryService', RepositoryListController]);
	angular.module('app').controller('CommitModalController', ['$scope', '$uibModalInstance', CommitModalController]);
	angular.module('app').service('RepositoryService', ['$http', RepositoryService]);
	angular.module('app').constant('getText', getText);
	angular.module('app').filter('text', ['getText', textFilter]);
	angular.module('app').directive('text', ['getText', textDirective]);

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

	function AboutController () {
	}

	function CloneRepositoryController ($scope, $location, RepositoryService) {
	  $scope.cloneRepositoryFormData = { };

	  $scope.submitCloneRepositoryForm = function() {
	    RepositoryService.cloneRepository($scope.cloneRepositoryFormData.repositoryUrl, $scope.cloneRepositoryFormData.repositoryName).then(function() {
	       $location.path('/repository/' +  $scope.cloneRepositoryFormData.repositoryName);
	    });
	  }
	}

	function HelpController () {
	}

	function IndexController () {
	}

	function RepositoryListController ($scope, RepositoryService) {
	  RepositoryService.getRepositoryNames().then(function(repositoryNames) {
	    $scope.repositoryNames = repositoryNames;
	  });
	}

	function LicenseController () {
	}

	function NavBarController ($scope,  $location, $routeParams, RepositoryService) {
	  $scope.currentRepositoryName = function() {
	    return  $routeParams.repositoryName;
	  }

	  RepositoryService.getRepositoryNames().then(function(repositoryNames) {
	    $scope.repositoryNames = repositoryNames;
	  });
	}

	function RepositoryController ($scope, $routeParams, $location, $uibModal, RepositoryService) {
	  $scope.repositoryName = $routeParams.repositoryName;

	  $scope.update = function () {
	    RepositoryService.getRepository($routeParams.repositoryName).then(function(repository) {
	      $scope.repository = repository;
	    });

	    RepositoryService.getRepositoryStatus($routeParams.repositoryName).then(function(repositoryStatus) {
	      $scope.repositoryStatus = repositoryStatus;
	    });
	  }

	  $scope.allTexts = [];

	  $scope.$watch('repository', function() {
	    if (!$scope.repository)
	      return;

	    $scope.allTexts = Object.keys($scope.repository.texts).reduce(function(array, key) {
	      var value = $scope.repository.texts[key];
	      array.push({
	        key: key,
	        value: value
	      });

	      return array;
	    }, []);
	  }, true);

	  $scope.searchText = undefined;

	  $scope.checkout = function() {
	    RepositoryService.checkoutRepository($routeParams.repositoryName).then($scope.update);
	  }

	  $scope.commit = function() {
	    var commitModal = $uibModal.open({
	      templateUrl: 'commitModal.html',
	      controller: 'CommitModalController'
	    });

	    commitModal.result.then(function (message) {
	       RepositoryService.commitRepository($routeParams.repositoryName, message).then($scope.update);
	    });
	  }

	  $scope.pull = function() {
	    RepositoryService.pullRepository($routeParams.repositoryName).then($scope.update);
	  }

	  $scope.push = function() {
	    RepositoryService.pushRepository($routeParams.repositoryName).then($scope.update);
	  }

	  $scope.sync = function() {
	    RepositoryService.syncRepository($routeParams.repositoryName).then($scope.update);
	  }

	  $scope.saveRepository = function() {
	    RepositoryService.saveRepository($routeParams.repositoryName, $scope.repository).then($scope.update);
	  }

	  $scope.availableColumns = ['da-DK', 'en-GB', 'fr-FR', 'de-DE', 'it-IT', 'es-ES'].sort();
	  $scope.selectedColumns = ['da-DK', 'en-GB', 'de-DE'].sort();

	  $scope.toggleColumn = function(column) {
	    var indexOfColumn = $scope.selectedColumns.indexOf(column);

	    if (indexOfColumn > -1) {
	      $scope.selectedColumns.splice(indexOfColumn, 1);
	    } else {
	      $scope.selectedColumns.push(column);
	      $scope.selectedColumns.sort();
	    }
	  };

	  $scope.orderByColumn = function(column) {
	    console.log('orderByColumn', column);
	    $scope.selectedOrderByColumn = column;
	  };

	  $scope.resetAddForm = function() {
	    $scope.addForm = {
	      key: undefined,
	      value: {}
	    }
	  };

	  $scope.resetAddForm();

	  $scope.add = function() {
	    $scope.repository.texts[$scope.addForm.key] = $scope.addForm.value;

	    $scope.resetAddForm();
	    $scope.saveRepository();
	  }

	  $scope.deleteKey = function(key) {
	    delete $scope.repository.texts[key];
	    $scope.saveRepository();
	  }

	  $scope.renameKey = function(oldKey, newKey) {
	    $scope.repository.texts[newKey] = $scope.repository.texts[oldKey];
	    delete $scope.repository.texts[oldKey];

	    $scope.saveRepository();
	  }

	  $scope.update();
	}

	function CommitModalController ($scope, $uibModalInstance) {
	  $scope.commit = {};

	  $scope.ok = function () {
	    $uibModalInstance.close($scope.commit.message);
	  };

	  $scope.cancel = function () {
	    $uibModalInstance.dismiss('cancel');
	  };
	}

	function RepositoryService($http) {
	  function getRepositoryNames() {
	    return $http({
	      method: 'GET',
	      url: '/api/repository'
	    }).then(function(response) { return response.data; })
	  }

	  function getRepository(repositoryName) {
	    return $http({
	      method: 'GET',
	      url: '/api/repository/' + repositoryName
	    }).then(function(response) { return response.data; })
	  }

	  function getRepositoryStatus(repositoryName) {
	    return $http({
	      method: 'GET',
	      url: '/api/repository/' + repositoryName + '/status'
	    }).then(function(response) { return response.data; })
	  }

	  function saveRepository(repositoryName, repository) {
	    return $http({
	      method: 'POST',
	      url: '/api/repository/' + repositoryName,
	      data: repository
	    }).then(function(response) { return response.data; })
	  }

	  function cloneRepository(repositoryUrl, repositoryName) {
	    return $http({
	      method: 'POST',
	      url: '/api/clone-repository',
	      data: {
	        repositoryUrl: repositoryUrl,
	        repositoryName: repositoryName
	      }
	    }).then(function(response) { return response.data; })
	  }

	  function pullRepository(repositoryName) {
	    return $http({
	      method: 'POST',
	      url: '/api/repository/' + repositoryName + '/pull'
	    }).then(function(response) { return response.data; })
	  }

	  function checkoutRepository(repositoryName) {
	    return $http({
	      method: 'POST',
	      url: '/api/repository/' + repositoryName + '/checkout'
	    }).then(function(response) { return response.data; })
	  }

	  function commitRepository(repositoryName, message) {
	    return $http({
	      method: 'POST',
	      url: '/api/repository/' + repositoryName + '/commit',
	      data: { message: message }
	    }).then(function(response) { return response.data; })
	  }

	  function pushRepository(repositoryName) {
	    return $http({
	      method: 'POST',
	      url: '/api/repository/' + repositoryName + '/push',
	    }).then(function(response) { return response.data; })
	  }

	  function syncRepository(repositoryName) {
	    return $http({
	      method: 'POST',
	      url: '/api/repository/' + repositoryName + '/sync',
	    }).then(function(response) { return response.data; })
	  }

	  return {
	    getRepositoryNames: getRepositoryNames,
	    getRepository: getRepository,
	    getRepositoryStatus: getRepositoryStatus,
	    saveRepository: saveRepository,
	    cloneRepository: cloneRepository,
	    pullRepository: pullRepository,
	    checkoutRepository: checkoutRepository,
	    commitRepository: commitRepository,
	    pushRepository: pushRepository,
	    syncRepository: syncRepository
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
			module.hot.accept("!!./../node_modules/css-loader/index.js!./index.css", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./index.css");
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
	exports.push([module.id, ".section { padding: 30px 0;}\r\n.section-default { }\r\n.toolbar { background-color: #eee; margin-bottom: 50px; position: fixed; width: 100%; }\r\n\r\n.toolbar + * { padding-top: 73px;}\r\n\r\n.btn-toolbar { margin: 15px -5px; }\r\n.btn-toolbar form { margin: 0; }\r\n.navbar-bottom { margin-bottom: 0;}\r\n.main { margin: 50px 0; }\r\npre {\r\n  margin: 0;\r\n  padding: 0;\r\n  background: none;\r\n  border: none;\r\n}\r\n\r\nbutton .glyphicon {\r\n  line-height: 1.4em;\r\n}\r\n\r\n.table-input > tbody > tr > td,\r\n.table-input > tfoot > tr > td {\r\n  padding: 0 !important;\r\n}\r\n\r\ntable input {\r\n  border: none !important;\r\n  box-shadow: none !important;\r\n}\r\n\r\n.table-texts td:last-child { width: 35px;}\r\n", ""]);

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
		"Clone repository": {
			"en-GB": "Clone repository",
			"da-DK": "Klon arkiv"
		},
		"Commit": {
			"en-GB": "Commit",
			"da-DK": "Arkivér"
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
		"Repositories": {
			"en-GB": "Repositories",
			"da-DK": "Arkiver"
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
		"search": {
			"da-DK": "søg",
			"en-GB": "search"
		},
		"Message": {
			"en-GB": "Message",
			"da-DK": "Besked"
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