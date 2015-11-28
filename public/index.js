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
      .when('/repository/:repositoryName', {
        templateUrl: 'repository.html',
        controller: 'RepositoryController'
      })
      .when('/repository/:repositoryName/design', {
        templateUrl: 'design.html',
        controller: 'DesignController'
      })
      .when('/repository/:repositoryName/source', {
        templateUrl: 'source.html',
        controller: 'SourceController'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);

angular.module('app').controller('AboutController', [AboutController]);
angular.module('app').controller('CloneRepositoryController', ['$scope', '$location', 'RepositoryService', CloneRepositoryController]);
angular.module('app').controller('HelpController', [HelpController]);
angular.module('app').controller('IndexController', ['$scope', 'RepositoryService', IndexController]);
angular.module('app').controller('LicenseController', [LicenseController]);
angular.module('app').controller('NavBarController', ['$scope', '$location', '$routeParams', 'RepositoryService', NavBarController]);
angular.module('app').controller('RepositoryController', ['$routeParams', '$location', RepositoryController]);
angular.module('app').controller('DesignController', ['$scope', '$routeParams', '$location', '$uibModal', 'RepositoryService', DesignController]);
angular.module('app').controller('SourceController', ['$scope', '$routeParams', '$location', '$uibModal', 'RepositoryService', SourceController]);
angular.module('app').controller('CommitModalController', ['$scope', '$uibModalInstance', CommitModalController]);
angular.module('app').service('RepositoryService', ['$http', RepositoryService]);

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

function IndexController ($scope, RepositoryService) {
  RepositoryService.getRepositoryNames().then(function(repositoryNames) {
    $scope.repositoryNames = repositoryNames;
  });

  $scope.cloneRepositoryFormData = { };

  $scope.submitCloneRepositoryForm = function() {
    RepositoryService.cloneRepository($scope.cloneRepositoryFormData.repositoryUrl, $scope.cloneRepositoryFormData.repositoryName);
  }
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

function RepositoryController ($routeParams, $location) {
  $location.path('/repository/' + $routeParams.repositoryName + '/design');
}

function DesignController ($scope, $routeParams, $location, $uibModal, RepositoryService) {
  $scope.repositoryName = $routeParams.repositoryName;

  RepositoryService.getRepository($routeParams.repositoryName).then(function(repository) {
    $scope.repository = repository;
  });

  $scope.checkout = function() {
    RepositoryService.checkoutRepository($routeParams.repositoryName);
  }

  $scope.commit = function() {
    var commitModal = $uibModal.open({
      templateUrl: 'commitModal.html',
      controller: 'CommitModalController'
    });

    commitModal.result.then(function (message) {
       RepositoryService.commitRepository($routeParams.repositoryName, message);
    });
  }

  $scope.push = function() {
    RepositoryService.pushRepository($routeParams.repositoryName);
  }

  $scope.source = function() {
    $location.path('/repository/' + $routeParams.repositoryName + '/source');
  }

  $scope.saveRepository = function() {
    RepositoryService.saveRepository($routeParams.repositoryName, $scope.repository);
  }

  $scope.columns = ['da-DK', 'en-GB', 'fr-FR', 'de-DE', 'it-IT', 'es-ES'];

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
}

function SourceController ($scope, $routeParams, $location, $uibModal, RepositoryService) {
  $scope.repositoryName = $routeParams.repositoryName;

  RepositoryService.getRepository($routeParams.repositoryName).then(function(repository) {
    $scope.repository = repository;
  });

  $scope.checkout = function() {
    RepositoryService.checkoutRepository($routeParams.repositoryName);
  }

  $scope.commit = function() {
    var commitModal = $uibModal.open({
      templateUrl: 'commitModal.html',
      controller: 'CommitModalController'
    });

    commitModal.result.then(function (message) {
       RepositoryService.commitRepository($routeParams.repositoryName, message);
    });
  }

  $scope.push = function() {
    RepositoryService.pushRepository($routeParams.repositoryName);
  }

  $scope.design = function() {
    $location.path('/repository/' + $routeParams.repositoryName + '/design');
  }
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

  return {
    getRepositoryNames: getRepositoryNames,
    getRepository: getRepository,
    saveRepository: saveRepository,
    cloneRepository: cloneRepository,
    pullRepository: pullRepository,
    checkoutRepository: checkoutRepository,
    commitRepository: commitRepository,
    pushRepository: pushRepository
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
