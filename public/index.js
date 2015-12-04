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
angular.module('app').controller('RepositoryController', ['$scope', '$routeParams', '$location', '$uibModal', 'RepositoryService', 'UserService', RepositoryController]);
angular.module('app').controller('RepositoryListController', ['$scope', 'RepositoryService', RepositoryListController]);
angular.module('app').controller('CommitModalController', ['$scope', '$uibModalInstance', CommitModalController]);
angular.module('app').controller('ErrorModalController', ['$scope', '$uibModalInstance', ErrorModalController]);
angular.module('app').service('RepositoryService', ['$http', '$q', RepositoryService]);
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

function RepositoryController ($scope, $routeParams, $location, $uibModal, RepositoryService, UserService) {
  $scope.repositoryName = $routeParams.repositoryName;
  $scope.userSettings = { columns: [] };

  $scope.update = function () {
    RepositoryService.getRepository($routeParams.repositoryName).then(function(repository) {
      $scope.repository = repository;
    });

    UserService.getUserSettings().then(function(userSettings) {
      $scope.userSettings = userSettings;
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
    RepositoryService.checkoutRepository($routeParams.repositoryName).then($scope.update, $scope.error);
  }

  $scope.commit = function() {
    var commitModal = $uibModal.open({
      templateUrl: 'commitModal.html',
      controller: 'CommitModalController'
    });

    commitModal.result.then(function (message) {
       RepositoryService.commitRepository($routeParams.repositoryName, message).then($scope.update, $scope.error);
    });
  }

  $scope.error = function(message) {
    console.log(message);
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

  $scope.pull = function() {
    RepositoryService.pullRepository($routeParams.repositoryName).then($scope.update, $scope.error);
  }

  $scope.push = function() {
    RepositoryService.pushRepository($routeParams.repositoryName).then($scope.update, $scope.error);
  }

  $scope.sync = function() {
    RepositoryService.syncRepository($routeParams.repositoryName).then($scope.update, $scope.error);
  }

  $scope.saveRepository = function() {
    RepositoryService.saveRepository($routeParams.repositoryName, $scope.repository).then($scope.update, $scope.error);
  }

  $scope.availableColumns = ['da-DK', 'en-GB', 'fr-FR', 'de-DE', 'it-IT', 'es-ES'].sort();

  $scope.toggleColumn = function(column) {
    var indexOfColumn = $scope.userSettings.columns.indexOf(column);

    if (indexOfColumn > -1) {
      $scope.userSettings.columns.splice(indexOfColumn, 1);
    } else {
      $scope.userSettings.columns.push(column);
      $scope.userSettings.columns.sort();

      UserService.setUserSettings($scope.userSettings);
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

  function saveRepository(repositoryName, repository) {
    return $http({
      method: 'POST',
      url: '/api/repository/' + repositoryName,
      data: repository
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

  function pullRepository(repositoryName) {
    return $http({
      method: 'POST',
      url: '/api/repository/' + repositoryName + '/pull'
    })
    .then(getResponseData, getResponseStatusCode)
  }

  function checkoutRepository(repositoryName) {
    return $http({
      method: 'POST',
      url: '/api/repository/' + repositoryName + '/checkout'
    })
    .then(getResponseData, getResponseStatusCode)
  }

  function commitRepository(repositoryName, message) {
    return $http({
      method: 'POST',
      url: '/api/repository/' + repositoryName + '/commit',
      data: { message: message }
    })
    .then(getResponseData, getResponseStatusCode)
  }

  function pushRepository(repositoryName) {
    return $http({
      method: 'POST',
      url: '/api/repository/' + repositoryName + '/push',
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
    saveRepository: saveRepository,
    cloneRepository: cloneRepository,
    pullRepository: pullRepository,
    checkoutRepository: checkoutRepository,
    commitRepository: commitRepository,
    pushRepository: pushRepository,
    syncRepository: syncRepository
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
