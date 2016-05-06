require('./index.css');
require('./icons.css');
var texts = require('json!textual-app-texts');
var getText = require('get-text')(texts, 'en-GB');
var angular = require('angular');
require('angular-route');
require('./elastic.js');

angular.module('app', ['ngRoute', 'monospaced.elastic']);

angular.module('app').config(['$routeProvider', '$locationProvider', config]);
angular.module('app').config(['$httpProvider', handle401]);

angular.module('app').controller('CreateProjectController', ['$scope', '$location', 'ProjectService', 'UserService', CreateProjectController]);
angular.module('app').controller('ProjectListController', ['$scope', 'ProjectService', ProjectListController]);
angular.module('app').controller('ProjectSettingsController', ['$scope', '$routeParams', 'ProjectService', ProjectSettingsController]);
angular.module('app').controller('UserProfileController', ['$scope', 'UserService', UserProfileController]);
angular.module('app').controller('UserSettingsController', ['$scope', 'UserService', UserSettingsController]);
angular.module('app').controller('NavBarController', ['$scope', '$location', '$routeParams', 'ProjectService', 'UserService', NavBarController]);
angular.module('app').controller('RepositoryController', ['$scope', '$routeParams', '$location', 'RepositoryTextsService', 'UserService', RepositoryController]);

angular.module('app').service('RepositoryTextsService', ['$http', '$q', RepositoryTextsService]);
angular.module('app').service('UserService', ['$http', '$q', UserService]);
angular.module('app').service('ProjectService', ['$http', '$q', ProjectService]);

angular.module('app').constant('getText', getText);

angular.module('app').filter('text', ['getText', textFilter]);

angular.module('app').directive('text', ['getText', textDirective]);
angular.module('app').directive('viewHeader', [viewHeader]);
angular.module('app').directive('viewFooter', [viewFooter]);
angular.module('app').directive('projectSidebar', [projectSidebar]);



function config ($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'project-list.html',
      controller: 'ProjectListController'
    })
    .when('/create-project', {
      templateUrl: 'create-project.html',
      controller: 'CreateProjectController'
    })
    .when('/projects/:projectName/settings', {
      templateUrl: 'project-settings.html',
      controller: 'ProjectSettingsController'
    })
    .when('/projects/:projectName/repository', {
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
    });

    $locationProvider.html5Mode(true);
}

function handle401($httpProvider) {
    $httpProvider.interceptors.push(function($q) {
        return {
            'responseError': function(rejection){
                var defer = $q.defer();

                if(rejection.status == 401){
                    window.location.href = '/login';
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
  };
}

function textDirective(getText) {
  return {
    restrict: 'A',
    link: function (scope, elem) {
        elem.html(getText(elem.html()));
    }
  };
}

function viewHeader() {
  return {
    transclude: true,
    templateUrl: 'view-header.html',
    replace: true
  };
}

function viewFooter() {
  return {
    transclude: true,
    templateUrl: 'view-footer.html',
    replace: true
  };
}

function projectSidebar() {
  return {
    transclude: true,
    templateUrl: 'project-sidebar.html',
    replace: true
  };
}

function CreateProjectController ($scope, $location, ProjectService, UserService) {
  $scope.createProjectFormData = {};

  UserService.getUserRepositories().then(function(repositories) {
    $scope.repositories = repositories;
  })

  $scope.submitCreateProjectForm = function() {
    ProjectService.createProject($scope.createProjectFormData.projectName, $scope.createProjectFormData.repositoryUrl).then(function() {
       $location.path('/projects/' + $scope.createProjectFormData.projectName + '/repository');
    });
  }
}

function ProjectListController ($scope, ProjectService) {
  ProjectService.getProjects().then(function(projects) {
    $scope.projects = projects;
  });
}

function ProjectSettingsController ($scope, $routeParams, ProjectService) {
  ProjectService.getProjectSettings($routeParams.projectName).then(function(projectSettings) {
    $scope.projectSettings = projectSettings;
  });

  $scope.submitUpdateProjectSettingsForm = function() {
    if($scope.updateProjectSettingsForm.$valid) {
      ProjectService.updateProjectSettings($routeParams.projectName, $scope.projectSettings);
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
  $scope.currentProjectName = function() {
    return $routeParams.projectName;
  }

  ProjectService.getProjects().then(function(projects) {
    $scope.projects = projects;
  });

  UserService.getUserProfile().then(function(userProfile) {
    $scope.userProfile = userProfile;
  });
}

function RepositoryController ($scope, $routeParams, $location, RepositoryTextsService, UserService) {
  $scope.allTexts = [];
  $scope.availableColumns = [];
  $scope.projectName = $routeParams.projectName;
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

    RepositoryTextsService.addText($routeParams.projectName, $scope.addTextFormData.textId, $scope.addTextFormData.languages).then(success);

    function success () {
      $scope.texts[$scope.addTextFormData.textId] = $scope.addTextFormData.languages;
      $scope.resetAddTextFormData();
    }
  }

  function error (message) {
    console.error(message);
  }

  function moveText (fromTextId, toTextId) {
    console.info('moveText()');

    RepositoryTextsService.moveText($routeParams.projectName, fromTextId, toTextId).then(success, error);

    function success () {
    }

    function error () {
    }
  }

  function removeText (textId) {
    console.info('removeText()');

    RepositoryTextsService.removeText($routeParams.projectName, textId).then(success);

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

    RepositoryTextsService.getTexts($routeParams.projectName).then(function(texts) {
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
      RepositoryTextsService.addTextValue($routeParams.projectName, textId, languageCode, value).then(success, error);
    } else if (oldValue !== '' && value === '') {
      RepositoryTextsService.removeTextValue($routeParams.projectName, textId, languageCode, value).then(success, error);
    } else if (oldValue !== '' && value !== '') {
      RepositoryTextsService.replaceTextValue($routeParams.projectName, textId, languageCode, value).then(success, error);
    }

    function success () {
    }

    function error () {
      $scope.texts[textId][languageCode] = oldValue;
    }
  }
}

function RepositoryTextsService($http, $q) {
  function getResponseData(response) {
    return $q.resolve(response.data);
  }

  function getResponseStatusCode(response) {
    return $q.reject(response.status);
  }

  function getTexts(projectIdOrName) {
    return $http({
      method: 'GET',
      url: '/api/projects/' + projectIdOrName + '/repository/texts'
    })
    .then(getResponseData, getResponseStatusCode)
  }

  function patchRepositoryTexts(projectIdOrName, patch) {
    return $http({
      method: 'PATCH',
      url: '/api/projects/' + projectIdOrName + '/repository/texts',
      data: patch
    })
    .then(getResponseData, getResponseStatusCode)
  }

  function addText(projectIdOrName, textId, text) {
    return patchRepositoryTexts(projectIdOrName, [
      {
        op: 'add',
        path: '/' + textId,
        value: text
      }
    ]);
  }

  function addTextValue(projectIdOrName, textId, languageCode, value) {
    return patchRepositoryTexts(projectIdOrName, [
      {
        op: 'add',
        path: '/' + textId + '/' + languageCode,
        value: value
      }
    ]);
  }

  function replaceTextValue(projectIdOrName, textId, languageCode, value) {
    return patchRepositoryTexts(projectIdOrName, [
      {
        op: 'replace',
        path: '/' + textId + '/' + languageCode,
        value: value
      }
    ]);
  }

  function removeTextValue(projectIdOrName, textId, languageCode) {
    return patchRepositoryTexts(projectIdOrName, [
      {
        op: 'remove',
        path: '/' + textId + '/' + languageCode
      }
    ]);
  }

  function removeText(projectIdOrName, textId) {
    return patchRepositoryTexts(projectIdOrName, [
      {
        op: 'remove',
        path: '/' + textId
      }
    ]);
  }

  function moveText(projectIdOrName, fromTextId, toTextId) {
    return patchRepositoryTexts(projectIdOrName, [
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

  function getProjectSettings(projectIdOrName) {
    return $http({
      method: 'GET',
      url: '/api/projects/' + projectIdOrName + '/settings'
    }).then(getResponseData, getResponseStatusCode)
  }

  function updateProjectSettings(projectIdOrName, projectSettings) {
    return $http({
      method: 'POST',
      url: '/api/projects/' + projectIdOrName + '/settings',
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
