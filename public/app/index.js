require('./index.css');

var texts = require('json!translator-app-texts');
var getText = require('get-text')(texts, 'en-GB');

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
angular.module('app').controller('RepositoryController', ['$scope', '$routeParams', '$location', '$uibModal', 'RepositoryTextsService', 'UserService', RepositoryController]);

angular.module('app').controller('ErrorModalController', ['$scope', '$uibModalInstance', ErrorModalController]);
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

function RepositoryController ($scope, $routeParams, $location, $uibModal, RepositoryTextsService, UserService) {
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
