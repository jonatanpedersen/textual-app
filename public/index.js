require('./index.css');

var texts = require('json!translator-app-texts');
var getText = require('get-text')(texts, 'en-GB');

angular.module('app', ['ngRoute', 'ui.bootstrap']);

angular.module('app').config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'repository-list.html',
        controller: 'RepositoryListController'
      })
      .when('/clone-repository', {
        templateUrl: 'clone-repository.html',
        controller: 'CloneRepositoryController'
      })
      .when('/repository/:repositoryName', {
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

angular.module('app').controller('CloneRepositoryController', ['$scope', '$location', 'RepositoryService', CloneRepositoryController]);
angular.module('app').controller('UserProfileController', ['$scope', 'UserService', UserProfileController]);
angular.module('app').controller('UserSettingsController', ['$scope', 'UserService', UserSettingsController]);
angular.module('app').controller('NavBarController', ['$scope', '$location', '$routeParams', 'RepositoryService', 'UserService', NavBarController]);
angular.module('app').controller('RepositoryController', ['$scope', '$routeParams', '$location', '$uibModal', 'RepositoryService', 'RepositoryTextsService', 'UserService', RepositoryController]);
angular.module('app').controller('RepositoryListController', ['$scope', 'RepositoryService', RepositoryListController]);
angular.module('app').controller('ErrorModalController', ['$scope', '$uibModalInstance', ErrorModalController]);
angular.module('app').service('RepositoryService', ['$http', '$q', RepositoryService]);
angular.module('app').service('RepositoryTextsService', ['$http', '$q', RepositoryTextsService]);
angular.module('app').service('UserService', ['$http', '$q', UserService]);
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

function CloneRepositoryController ($scope, $location, RepositoryService) {
  $scope.cloneRepositoryFormData = { };

  $scope.submitCloneRepositoryForm = function() {
    RepositoryService.cloneRepository($scope.cloneRepositoryFormData.repositoryUrl, $scope.cloneRepositoryFormData.repositoryName).then(function() {
       $location.path('/repository/' +  $scope.cloneRepositoryFormData.repositoryName);
    });
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
      UserService.setUserSettings($scope.userSettings);
    }
  }
}

function RepositoryListController ($scope, RepositoryService) {
  RepositoryService.getRepositoryNames().then(function(repositoryNames) {
    $scope.repositoryNames = repositoryNames;
  });
}

function LicenseController () {
}

function NavBarController ($scope,  $location, $routeParams, RepositoryService, UserService) {
  $scope.currentRepositoryName = function() {
    return  $routeParams.repositoryName;
  }

  RepositoryService.getRepositoryNames().then(function(repositoryNames) {
    $scope.repositoryNames = repositoryNames;
  });

  UserService.getUserProfile().then(function(userProfile) {
    $scope.userProfile = userProfile;
  });
}

function RepositoryController ($scope, $routeParams, $location, $uibModal, RepositoryService, RepositoryTextsService, UserService) {
  $scope.allTexts = [];
  $scope.availableColumns = [];
  $scope.repositoryName = $routeParams.repositoryName;
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

    RepositoryTextsService.addText($routeParams.repositoryName, $scope.addTextFormData.textId, $scope.addTextFormData.languages).then(success);

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

    RepositoryTextsService.moveText($routeParams.repositoryName, fromTextId, toTextId).then(success, error);

    function success () {
    }

    function error () {
    }
  }

  function removeText (textId) {
    console.info('removeText()');

    RepositoryTextsService.removeText($routeParams.repositoryName, textId).then(success);

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
    RepositoryService.syncRepository($routeParams.repositoryName).then($scope.update, $scope.error);
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

    UserService.setUserSettings($scope.userSettings).then(function() {
      updateSelectedColumns();
    });
  };

  function update () {
    console.info('update()');

    $scope.updatingTexts = true;

    RepositoryTextsService.getTexts($routeParams.repositoryName).then(function(texts) {
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
      RepositoryTextsService.addTextValue($routeParams.repositoryName, textId, languageCode, value).then(success, error);
    } else if (oldValue !== '' && value === '') {
      RepositoryTextsService.removeTextValue($routeParams.repositoryName, textId, languageCode, value).then(success, error);
    } else if (oldValue !== '' && value !== '') {
      RepositoryTextsService.replaceTextValue($routeParams.repositoryName, textId, languageCode, value).then(success, error);
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

  function getRepositoryNames() {
    return $http({
      method: 'GET',
      url: '/api/repository'
    })
    .then(getResponseData, getResponseStatusCode)
  }

  function getRepository(repositoryName) {
    return $http({
      method: 'GET',
      url: '/api/repository/' + repositoryName
    })
    .then(getResponseData, getResponseStatusCode)
  }

  function getRepositoryStatus(repositoryName) {
    return $http({
      method: 'GET',
      url: '/api/repository/' + repositoryName + '/status'
    })
    .then(getResponseData, getResponseStatusCode)
  }

  function cloneRepository(repositoryUrl, repositoryName) {
    return $http({
      method: 'POST',
      url: '/api/clone-repository',
      data: {
        repositoryUrl: repositoryUrl,
        repositoryName: repositoryName
      }
    })
    .then(getResponseData, getResponseStatusCode)
  }

  function syncRepository(repositoryName) {
    return $http({
      method: 'POST',
      url: '/api/repository/' + repositoryName + '/sync',
    })
    .then(getResponseData, getResponseStatusCode)
  }

  return {
    getRepositoryNames: getRepositoryNames,
    getRepository: getRepository,
    getRepositoryStatus: getRepositoryStatus,
    cloneRepository: cloneRepository,
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

  function getTexts(repositoryName) {
    return $http({
      method: 'GET',
      url: '/api/repository/' + repositoryName + '/texts'
    })
    .then(getResponseData, getResponseStatusCode)
  }

  function patchRepositoryTexts(repositoryName, patch) {
    return $http({
      method: 'PATCH',
      url: '/api/repository/' + repositoryName + '/texts',
      data: patch
    })
    .then(getResponseData, getResponseStatusCode)
  }

  function addText(repositoryName, textId, text) {
    return patchRepositoryTexts(repositoryName, [
      {
        op: 'add',
        path: '/' + textId,
        value: text
      }
    ]);
  }

  function addTextValue(repositoryName, textId, languageCode, value) {
    return patchRepositoryTexts(repositoryName, [
      {
        op: 'add',
        path: '/' + textId + '/' + languageCode,
        value: value
      }
    ]);
  }

  function replaceTextValue(repositoryName, textId, languageCode, value) {
    return patchRepositoryTexts(repositoryName, [
      {
        op: 'replace',
        path: '/' + textId + '/' + languageCode,
        value: value
      }
    ]);
  }

  function removeTextValue(repositoryName, textId, languageCode) {
    return patchRepositoryTexts(repositoryName, [
      {
        op: 'remove',
        path: '/' + textId + '/' + languageCode
      }
    ]);
  }

  function removeText(repositoryName, textId) {
    return patchRepositoryTexts(repositoryName, [
      {
        op: 'remove',
        path: '/' + textId
      }
    ]);
  }

  function moveText(repositoryName, fromTextId, toTextId) {
    return patchRepositoryTexts(repositoryName, [
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

  function getUserSettings() {
    return $http({
      method: 'GET',
      url: '/api/user/settings'
    }).then(getResponseData, getResponseStatusCode)
  }

  function setUserSettings(userSettings) {
    return $http({
      method: 'POST',
      url: '/api/user/settings',
      data: userSettings
    }).then(getResponseData, getResponseStatusCode)
  }

  return {
    getUserProfile: getUserProfile,
    updateUserProfile: updateUserProfile,
    getUserSettings: getUserSettings,
    setUserSettings: setUserSettings
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
