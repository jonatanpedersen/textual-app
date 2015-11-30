require('./index.css');

var texts = require('json!translator-app-texts');
var getText = require('get-text')(texts, 'en-GB');

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
