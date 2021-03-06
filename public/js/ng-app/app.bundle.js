webpackJsonp([0],{

/***/ 119:
/***/ (function(module, exports) {

ProjectEditorController.$inject = ['$rootScope', '$scope', '$http', '$window', 'lodash', 'jsonapiUtils', 'notificationService'];

function ProjectEditorController($rootScope, $scope, $http, $window, _, jsonapiUtils, notificationService) {
  const ctrl = this;
  console.log('ProjectEditorController scope', $scope)

  // this.$onChanges = function(changesObj) {
  //   console.log('$onChanges', changesObj);
  // };

  /**
   * Create a project
   */
  $scope.createProject = function(project) {
    // console.log('createProject', this, this.project);
    const { name, description, color, remoteProjectId } = project;
    // $scope.newProject();
    
    $http.post("/api/v1/projects",
    { data: { type: 'projects',
      attributes: { name, description, color },
      relationships: {
        owner: { data: { type: 'users', id: $rootScope.currentUser.userId } },
        'remote-project': { data: { type: 'remote-projects', id: remoteProjectId } }
      }
    } } )
    .then(function(response) {
      const newRecord = jsonapiUtils.unmapRecord( response.data.data );
      ctrl.onCreate(newRecord);
      // $scope.projects.push( newRecord );
      notificationService.notify('success', 'Project created');
    })
    .catch(err => {
      notificationService.notify('danger', 'Project could not be created: ' + err);
    });
  }

  /**
   * Update a project
   */
  this.updateProject = function(id) {
    const { name, description, color, active, remoteProjectId } = ctrl.project;
    // console.log('updateProject', name, description, color, remoteProjectId, { data: { type: 'projects', id,
    //   attributes: { name, description, color } },
    //   relationships: {
    //     'remote-project': { data: { type: 'remote-projects', id: remoteProjectId } }
    //   }
    // });
    $http.put("/api/v1/projects/" + id,
    { data:
      {
        type: 'projects', id,
        attributes: { name, description, color, active },
        relationships: {
          'remote-project': { data: { type: 'remote-projects', id: remoteProjectId } }
        }
      }
    } )
    .then(function(response) {
      const updatedProject = jsonapiUtils.unmapRecord( response.data.data );
      ctrl.onProjectUpdated({ project: updatedProject });

      notificationService.notify('success', 'Project updated');
    })
    .catch(err => {
      notificationService.notify('danger', 'Project could not be updated: ' + err);
    });
  }


  /**
   * Sync issues
   */
  this.syncIssues = function(id) {
    const { name, description, remoteProjectId } = ctrl.project;
    $http.post("/api/v1/sync/issues/" + remoteProjectId,
    {} )
    .then(function(response) {
      console.log("## syncIssues returned");
      console.log(response.data);
      // const updatedProject = jsonapiUtils.unmapRecord( response.data.data );
      // ctrl.onProjectUpdated({ project: updatedProject });

      // notificationService.notify('success', 'Project updated');
    })
    .catch(err => {
      // notificationService.notify('danger', 'Project could not be updated: ' + err);
    });
  }


  /**
   * Delete a project
   */
  this.deleteProject = function( project ) {
    if($window.confirm('Are you sure you want to delete "' + project.name + '"?')) {
      $http.delete('/api/v1/projects/' + project.id)
      .then(function(response) {
        // _.remove(ctrl.projects, project);
        ctrl.onProjectDeleted({ project });
        notificationService.notify('success', 'Project deleted');
      })
      .catch(err => {
        notificationService.notify('danger', 'Project could not be deleted: ' + err);
      });
    }
  }
  /**
   * Assign a color to project
   */
  $scope.pickColor = function( evt ) {
    $scope.project.color = $( evt.target ).data( 'color' );
  }

}

module.exports = {
  templateUrl: 'project-editor.html',
  controller: ProjectEditorController,
  bindings: {
    project: '=',
    remoteProjects: '=',
    onCreate: '&',
    onDelete: '&',
    onUpdate: '&',
    onIssuesSynced: '&',
    onProjectUpdated: '&',
    onProjectDeleted: '&'
  }
};

/***/ }),

/***/ 120:
/***/ (function(module, exports) {

ProjectListController.$inject = ['lodash']; // '$scope', '$rootScope', '$window', '$http', 'jsonapiUtils', 'notificationService', 'flatUiColors', 'data'];

function ProjectListController(_) { //$scope, $rootScope, $window, $http, , jsonapiUtils, notificationService, flatUiColors, data) {
  var ctrl = this;
  if(this.projects.length > 0) {
    this.project = this.projects[0];
  }
  console.log("ProjectListController", this.projects, 'has projects?', this.projects.length > 0, this.project);

  /**
   * Select project in list
   */
  this.selectProject = function( id ) {
    const project = _.find(this.projects, { id });
    console.log('select project', id, project);
    ctrl.project = angular.copy(project);
    // ctrl.onSelect(angular.copy(project));
  };

  this.updateProjectInList = function(updatedProject) {
    console.log('updateProject in list', updatedProject);
    const existingProject = _.find(ctrl.projects, { id: updatedProject.id });
    const indexInProjects = ctrl.projects.indexOf(existingProject);
    ctrl.projects[indexInProjects] = updatedProject;
  };

  this.deleteProjectFromList = function(deletedProject) {
    console.log('deleteProjectFromList', deletedProject);
    _.remove(ctrl.projects, deletedProject);
  };

}


module.exports = {
  templateUrl: 'project-list.html',
  controller: ProjectListController,
  bindings: {
    projects: '=',
    remoteProjects: '=',
    colors: '=',
    onSelect: '&'
    // onDelete: '&',
    // onUpdate: '&'
  }
};

/***/ }),

/***/ 121:
/***/ (function(module, exports) {

TimerSetupController.$inject = ['$interval', 'lodash', 'dataService', 'optionService', 'notificationService'];

function TimerSetupController($interval, _, dataService, optionService, notificationService) {
  console.log('TimerSetupController init', this);
  const self = this;
  const MYSQL_OFFSET = 7200;
  const storedProjectId = localStorage.getItem('storedProjectId');
  const storedIssueId = localStorage.getItem('storedIssueId');

  this.timer = {
    id: 0,
    summary: '',
    markdown: '',
    status: '',
    ownerId: '',
    type: 'pomodoro',
    duration: optionService.get('pomodoro'),
    projectId: storedProjectId !== null ? storedProjectId : 0,
    issueId: storedIssueId !== null ? storedIssueId : 0
  };

  this.statusOptions = ['new', 'done', 'interrupted'];
  this.issueOptions = [];
  this.timerInterval = null;
  this.timeRemaining = 0;
  // this.lastTimer = {};
  // this.currentTimer = {};
  this.allTimers = [];
  this.timers = [];

  this.selectProject = function() {
    console.log('TimerSetupController.selectProject', this.timer);
    const id = this.timer.projectId;
    if(id !== 0) {
      const project = _.find(this.projectOptions,{ id })
      this.syncProjectIssues(project);
    }
    localStorage.setItem('storedProjectId', id);
    localStorage.removeItem('storedIssueId');
  }


  this.syncProjectIssues = function(project) {
    console.log('TimerSetupController.syncProjectIssues', project);
    dataService.syncProjectIssues(project)
    .then(issues => {
      self.issueOptions = [{ id: 0, title: '' }].concat(issues);
      console.log('TimerSetupController this.issueOptions', self.issueOptions);
    })
  }

  this.selectIssue = function() {
    console.log('TimerSetupController.selectIssue', this.timer);
    const id = this.timer.issueId;
    localStorage.setItem('storedIssueId', id);
  }


  this.startTimer = function( duration ) {
    this.timeRemaining = duration === undefined ? optionService.get('pomodoro') : duration;
    this.timerInterval = $interval( () => {
      // this.$apply(function(){
        self.timeRemaining -= 1;
        if( self.timeRemaining === 0 ) {
          $interval.cancel( self.timerInterval );
          self.timerInterval = null;
        }
      // });
    }, 1000 );

  }

  this.startPomodoro = function() {
    console.log("startPomodoro", this.currentUser, this.timer)
    const type = "pomodoro";
    this.currentTimer = null;
    // console.log('before createPomodoro', this.currentUser, this.currentUser.id);
    dataService.createTimer(this.timer)
    .then(timer => {
      console.log('startPomodoro timer returned', timer);
      this.startTimer();
      this.timer = timer;
      this.timers.push( this.timer );
      notificationService.notify('success', 'timer started');
    })
    .catch(err => {
      notificationService.notify('danger', 'timer creation failed: ' + err);
    })
  }

  this.updatePomodoro = function() {

    dataService.updateTimer(this.timer)
    .then(timer => {
      console.log('startPomodoro timer returned', timer);
      this.startTimer();
      this.timer = timer;
      notificationService.notify('success', 'timer update');
    })
    .catch(err => {
      notificationService.notify('danger', 'timer update failed: ' + err);
    })

  }

  if(this.lastTimer) {
    console.log('has lastTimer', this.lastTimer);
    var timeStampStart = new Date( this.lastTimer.createdAt ).getTime();
    var timeStampNow = Date.now();
    console.log('timer start, now, diff:', timeStampStart, timeStampNow, Math.floor( ( timeStampNow - timeStampStart ) / 1000 ) - MYSQL_OFFSET);
    var timeDiff = Math.floor( ( timeStampNow - timeStampStart ) / 1000 ) - MYSQL_OFFSET;
    if( timeDiff < optionService.get('pomodoro') ) {
      this.startTimer( optionService.get('pomodoro') - timeDiff );
      this.timer = this.lastTimer;
    }
  }

}


module.exports = {
  templateUrl: 'timer-setup.html',
  controller: TimerSetupController,
  bindings: {
    projectOptions: '=',
    lastTimer: '=',
    onProjectSelected: '&'
    // onProjectDeleted: '&'
  }
};

/***/ }),

/***/ 122:
/***/ (function(module, exports) {

function JwtConfig($httpProvider, jwtOptionsProvider) {
  // Please note we're annotating the function so that the $injector works when the file is minified
  jwtOptionsProvider.config({
    whiteListedDomains: 'bitbucket.org',
    tokenGetter: ['authService', 'options', function(authService, options) {

      if (options.url.indexOf('https://api.bitbucket.org') === 0) {
        return localStorage.getItem('bb_at');
      } else {
        return localStorage.getItem('id_token');
      }

      return authService.getToken();
    }]

  });

  $httpProvider.interceptors.push('jwtInterceptor');
}

module.exports = JwtConfig;

/***/ }),

/***/ 123:
/***/ (function(module, exports) {

RouterConfig.$inject = ['$routeProvider', '$httpProvider', '$locationProvider'];

function RouterConfig($routeProvider, $httpProvider, $locationProvider) {
  $routeProvider
  .when("/signin", {
    templateUrl : "signin.html",
    controller : "signinCtrl"
  })
  .when("/signup", {
    templateUrl : "signup.html",
    controller : "signupCtrl"
  })
  .when("/", {
    templateUrl : "dashboard.html",
    controller : "dashboardCtrl",
    resolve: {
      data: ['dataService', function(dataService) {
        return dataService.get(['projects', 'options', 'timers', 'daily-posts', 'client-ids']);
      }]
    }
  })
  .when("/accounts", {
    templateUrl : "accounts.html",
    controller : "accountsCtrl",
    resolve: {
      data: ['$rootScope', '$http', '$q', 'dataService', function($rootScope, $http, $q, dataService) {
        console.log('/accounts data resolution', $rootScope.currentUser);
        return dataService.get(['client-ids', 'accounts?userId=' + $rootScope.currentUser.userId]);
        // .then(responses => ({
        //   'client-ids': responses[0]['client-ids'],
        //   accounts: responses[1].data
        // }));
      }]
    }
  })
  .when("/repos", {
    templateUrl : "repositories.html",
    controller : "reposCtrl",
    resolve: {
      data: ['bitbucketService', function(bitbucketService) {
        return bitbucketService.getRepos();
      }]
    }
  })
  .when("/cb/:provider", {
    templateUrl : "accounts.html",
    controller : "accountsCtrl",
    resolve: {
      data: ['dataService', function(dataService) {
        return dataService.get(['client-ids']);
      }]
    }
  })
  .when("/projects", {
    templateUrl : "projects.html",
    controller : "projectsCtrl",
    resolve: {
      flatUiColors: ['$http', function($http) {
        return $http.get('/flat-ui-colors.json')
        .then(response => (response.data));
      }],
      data: ['dataService', function(dataService) {
        return dataService.get(['projects', 'remote-projects']);
      }]
    }
  })
  .when("/projects/:projectId", {
    templateUrl : "project-details.html",
    controller : "projectsDetailsCtrl",
    resolve: {
      flatUiColors: ['$http', function($http) {
        return $http.get('/flat-ui-colors.json')
        .then(response => (response.data));
      }],
      data: ['dataService', function(dataService) {
        return dataService.get(['remote-projects']);
      }]
    }
  })
  .when("/timer", {
    templateUrl : "timer.html",
    controller : "timerCtrl",
    // resolve: {
    //   currentUser: ['authService', function(authService) {
    //     return authService.getCurrentUser();
    //   }]
    // }
  })
  .when("/stats", {
    templateUrl : "stats.html",
    controller : "statsCtrl"
  });

  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false,
    rewriteLinks: true
  });

}
module.exports = RouterConfig;

/***/ }),

/***/ 124:
/***/ (function(module, exports) {

function TranslationConfig($translateProvider) {
  $translateProvider.translations('en', {
    ACTIVE_PROJECTS: 'Active projects',
    LAST_7_DAYS: 'last 7 days',
    LATEST_TIMERS: 'Latest timers',
    SOURCE_CODE_HOST: 'Source code host',
    ACTIVE_ACCOUNTS: 'Active accounts',
    EDIT_ACCOUNT: 'Edit account',
    REQUEST_AUTHORIZATION: 'Request authorization',
    CREATE_PROJECT: 'Create project',
    EDIT_PROJECT: 'Edit project',
    SELECT_PROJECT: 'Select project',
    PROJECT_LIST: 'Project list',
    PROJECT_NAME: 'Project name',
    PROJECT_DESC: 'Project description',
    PROJECT_COLORS: 'Color (colors by <a href="https://flatuicolors.com/" target="_blank">https://flatuicolors.com/</a>)',
    PROJECT_REMOTE: 'Associated remote repo',
    NEW: 'New',
    CREATE: 'Create',
    UPDATE: 'Update',
    DELETE: 'Delete'
  });
  $translateProvider.preferredLanguage('en');
}

module.exports = TranslationConfig;

/***/ }),

/***/ 125:
/***/ (function(module, exports) {

AccountsController.$inject = ['$rootScope', '$scope', '$http', '$location', '$routeParams', 'lodash', 'notificationService', 'bitbucketService', 'repoApis', 'data'];

// https://www.liquidint.com/blog/angularjs-and-instagram-a-single-page-application-with-oauth2/
function AccountsController($rootScope, $scope, $http, $location, $routeParams, _, notificationService, bitbucketService, repoApis, data) {
  console.log('AccountsController log data', data);
  $scope.accounts = data.accounts;
  $rootScope.providers = {};
  _.each(data['client-ids'], entry => {
    $rootScope.providers[entry.provider] = entry;
  });
  // console.log($rootScope.providers);

  if($routeParams.provider) {
    var afterHash = $location.hash();
    // var splitPerAmps = afterHash.split('&');
    // var params = {};
    // _.each(splitPerAmps, kv => {
    //   const bits = kv.split('=');
    //   const key = bits.shift();
    //   const value = bits.join('=');
    //   params[key] = decodeURI(value);
    // });
    var params = $location.search();
    console.log(params);
    $http({
      method: 'POST',
      url: '/api/v1/got/' + $routeParams.provider,
      data: { code: params.code }
    })
    .then(res => {
      console.log('Server returned', res.data);
      notificationService.notify('info', JSON.stringify(res.data));
    })
    // $scope.code = params.code;
    // localStorage.setItem('bb_at', params.access_token);
    // requestStrategy.setAuthToken(params.access_token);
    // repoApis.setAuthToken('bitbucket', params.access_token);

  }

  $scope.requestAuth = function(provider) {
    bitbucketService.authorize(provider);
  }

  $scope.syncRepos = function(accountId) {
    $http({
      method: 'POST',
      url: '/api/v1/sync/repos/' + accountId,
      data: {}
    })
    .then(res => {
      console.log('Server returned', res.data);
      notificationService.notify('info', JSON.stringify(res.data));
    })
  }
}

module.exports = AccountsController;

/***/ }),

/***/ 126:
/***/ (function(module, exports) {

AlertController.$inject = ['$rootScope', '$scope', '$timeout'];

// https://www.liquidint.com/blog/angularjs-and-instagram-a-single-page-application-with-oauth2/
function AlertController($rootScope, $scope, $timeout) {
  $rootScope.$on('alert', (event, data) => {
    console.log('received alert', event, data);
    $scope.alertClass = 'alert-' + data.alertClass;
    $scope.message = data.message;
    $timeout(() => {
      $scope.alertClass = 'hidden';
      $scope.message = '';
    }, 3000);
  });
}

module.exports = AlertController;

/***/ }),

/***/ 127:
/***/ (function(module, exports) {

DashboardController.$inject = ['$rootScope', '$scope', 'lodash', 'moment', 'dataService', 'optionService', 'data'];

function DashboardController($rootScope, $scope, _, moment, dataService, optionService, data) {
  $scope.hideFooterTimer = true;

  $scope.dailyPost = {
    markdown: ''
  };

  // Populate options
  optionService.populate(data.options);

  // 5 most recent timers
  var numTimers = data.timers.length;
  var sortedTimers = _.sortBy(data.timers, 'createdAt');
  $scope.latestTimers = _.slice(sortedTimers, numTimers - 5);
  $scope.lastTimer = _.findLast( data.timers, { status: 'new' } );
  console.log('DashboardController lastTimer', $scope.lastTimer);

  // Projects for which there have been timers in the last 7 days
  var oneWeekAgo = moment().subtract(7, 'days');
  var recentTimers = _.filter(sortedTimers, function(t) {
    return moment(t.createdAt).diff(oneWeekAgo, 'minutes') > 0;
  });
  var recentProjectIds = _.map(recentTimers, 'projectId');
  $scope.activeProjects = _.filter(data.projects, function(p) {
    return recentProjectIds.indexOf(p.id) !== -1 || p.active;
  });

  $scope.projectOptions = [{ id: 0, name: '' }].concat($scope.activeProjects);

  // Daily posts
  var today = moment().format('YYYY-MM-DD');
  var dailyPost = _.find(data.dailyposts, function(post) {
    return post.userId === $rootScope.currentUser.userId &&
      post.createdAt.substr(0, 10) === today;
  });
  if(dailyPost === undefined) {
    dataService.create('daily-posts', {
      markdown: '### Daily post for ' + today
    }, {
      user: { id: $rootScope.currentUser.userId, type: 'users' }
    })
    .then(post => {
      $scope.dailyPost = post;
    });
  }
  else {
    $scope.dailyPost = dailyPost;
  }
}

module.exports = DashboardController;

/***/ }),

/***/ 128:
/***/ (function(module, exports) {

MainController.$inject = ['$rootScope', '$scope', '$location', 'authService'];

function MainController($rootScope, $scope, $location, authService) {
  $scope.logout = function() {
    console.log('MainController.logout');
    authService.signout();
    $location.path('/signin');
  }
}

module.exports = MainController;

/***/ }),

/***/ 129:
/***/ (function(module, exports) {

ProjectDetailsController.$inject = ['$scope', '$rootScope', '$window', '$http', '$routeParams', 'lodash', 'jsonapiUtils', 'notificationService', 'flatUiColors', 'data'];

 function ProjectDetailsController($scope, $rootScope, $window, $http, $routeParams, _, jsonapiUtils, notificationService, flatUiColors, data) {

  /*-------------------*
   | Scope variables
   *-------------------*
   |
   */
  console.log('ProjectDetailsController params', $routeParams);
  const projectId = parseInt($routeParams.projectId, 10);
  $scope.colors = flatUiColors;
  $scope.remoteProjects = data['remote-projects'];

  $http.get('/api/v1/projects/' + projectId)
  .then(res => {
    $scope.project = jsonapiUtils.unmapRecord(res.data.data);
    console.log("got project", res, $scope.project);
  })

  $scope.loadIssues = function() {
    console.log('loadIssues');
    $http.get('/api/v1/issues?projectId=' + projectId)
    .then(res => {
      const allIssues = jsonapiUtils.unmapRecords(res.data.data);
      $scope.issues = _.filter(allIssues, issue => (issue.projectId === projectId));
      console.log("got issues", allIssues, $scope.issues);
    })
  }
  $scope.loadIssues();

}

module.exports = ProjectDetailsController;

/***/ }),

/***/ 130:
/***/ (function(module, exports) {

ProjectsController.$inject = ['$scope', '$rootScope', '$window', '$http', 'lodash', 'jsonapiUtils', 'notificationService', 'flatUiColors', 'data'];

 function ProjectsController($scope, $rootScope, $window, $http, _, jsonapiUtils, notificationService, flatUiColors, data) {


  /*-------------------*
   | Private variables
   *-------------------*
   |
   */
  var blankProject = {
    name: 'New project',
    description: '',
    color: '#fff'
  };


  /*-------------------*
   | Scope variables
   *-------------------*
   |
   */
console.log('ProjectsController', data);
  $scope.projects = data.projects;
  // $scope.project = angular.copy(blankProject);
  $scope.colors = flatUiColors;
  $scope.remoteProjects = data['remote-projects'];

  /*-------------------*
   | CRUD
   *-------------------*
   |
   */

  $scope.onCreate = function(proj) {
    console.log('onCreate bubbled', proj);
  }


  /*-------------------*
   | Misc
   *-------------------*
   |
   */

  /**
   * Reset project
   */
  $scope.newProject = function() {
    $scope.project = angular.copy(blankProject);
  }

}

module.exports = ProjectsController;

/***/ }),

/***/ 131:
/***/ (function(module, exports) {

ReposController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', 'repoApis', 'lodash', 'bitbucketService', 'data'];

// https://www.liquidint.com/blog/angularjs-and-instagram-a-single-page-application-with-oauth2/
function ReposController($rootScope, $scope, $location, $routeParams, repoApis, _, bitbucketService, data) {
  console.log('ReposController data', data);
  $scope.repos = data.values;
}

module.exports = ReposController;

/***/ }),

/***/ 132:
/***/ (function(module, exports) {

SigninController.$inject = ['$rootScope', '$scope', '$location', 'authService'];

function SigninController($rootScope, $scope, $location, authService) {
  $scope.hideFooterTimer = true;
  $scope.payload = {
    email: '',
    password: ''
  };

  $scope.signin = function() {
    authService.signin($scope.payload)
    .then(() => $location.path('/'));
  }
}

module.exports = SigninController;

/***/ }),

/***/ 133:
/***/ (function(module, exports) {

SignupController.$inject = ['$rootScope', '$scope', 'authService'];

function SignupController($rootScope, $scope, authService) {
  $scope.hideFooterTimer = true;
  // $scope.payload = {
  //   email: '',
  //   username: '',
  //   firstName: '',
  //   lastName: '',
  //   password: '',
  // };

  $scope.signup = function() {
    authService.signup($scope.payload);
  }
}

module.exports = SignupController;

/***/ }),

/***/ 134:
/***/ (function(module, exports) {

StatsController.$inject = ['$scope', 'dataService', 'lodash'];

function StatsController($scope, store, lodash) {

  $scope.data = [];

  function getDates(firstDay, stopDate) {
    var dateArray = new Array();
    var currentDate = new Date(firstDay);
    console.log(currentDate);
    while (currentDate <= stopDate) {
        dateArray.push( ( new Date (currentDate) ).toISOString().substr(0,10) );
        currentDate.setDate( currentDate.getDate() + 1 );
    }
    return dateArray;
}
  $scope.title = 'Daily stats';
  store.get(['projects', 'timers'])
  .then(({ projects, timers }) => {
    const todayDate = new Date();
    const firstDay = timers.reduce((oldestDay, timer) => {
      const timerDay = timer.createdAt.substr(0,10);
      return timerDay < oldestDay ? timerDay : oldestDay;
    }, todayDate.toISOString().substr(0,10));

    const daysArr = getDates(firstDay, todayDate);
    console.log(daysArr);

    const timersByDay = lodash.groupBy(timers, timer => (timer.createdAt.substr(0, 10)));
    const dataByDay = daysArr.map((day, dayIdx) => {
      const timersForDay = timersByDay[day] !== undefined ? timersByDay[day] : [];
      const timersByProj = lodash.countBy(timersForDay, timer => (timer.projectId));
      return projects.reduce((dataBefore, project, projIdx) => {
        const numTimers = timersByProj[project.id] !== undefined ? timersByProj[project.id] : 0;
        const y0 = dataBefore.reduce((totalBefore, obj) => { return totalBefore + obj.y; }, 0);
        return dataBefore.concat([{
          key: project.name,
          series: projIdx, // stream (project) index
          size: numTimers, // # of timers for project
          x: dayIdx, // day index
          y: numTimers, // equals size
          y0, // # of timers before
          y1: y0 + numTimers, // # y0 + size
        }]);
      }, []);
    });

    $scope.options = {
        chart: {
            type: 'multiBarChart',
            height: 450,
            margin : {
                top: 20,
                right: 20,
                bottom: 45,
                left: 45
            },
            clipEdge: true,
            duration: 500,
            stacked: true,
            xAxis: {
                axisLabel: 'Time (ms)',
                showMaxMin: false,
                tickFormat: function(d){
                    return daysArr[d];
                }
            },
            yAxis: {
                axisLabel: 'Y Axis',
                axisLabelDistance: -20,
                tickFormat: function(d){
                    return d;
                }
            }
        }
    };

    $scope.data = projects.map((project, projIdx) => {
      let obj = {
        key: project.name
      };
      obj.values = dataByDay.map(valuesForDay => (valuesForDay[projIdx]));
      return obj;
    });

  });
}

module.exports = StatsController;

/***/ }),

/***/ 135:
/***/ (function(module, exports) {

const MYSQL_OFFSET = 7200;

TimersController.$inject = ['$scope', '$rootScope', '$http', 'lodash', 'optionService', 'notificationService', 'jsonapiUtils'];

function getTimersAndProjects( $scope, $http, lodash, optionService, jsonapiUtils ) {
  // Get existing projects
  $http.get("/api/v1/projects")
  .then(function(response) {
    $scope.projects = jsonapiUtils.unmapRecords(response.data.data);
  })
  .then( () => $http.get("/api/v1/timers") )
  .then(function(response) {
    $scope.timers = jsonapiUtils.unmapRecords(response.data.data);
    $scope.timers.forEach( (timer, index, timers) => {
      if( timer.projectId ) {
        timers[index].project = lodash.find( $scope.projects, { id: timer.projectId } );
      }
    } );
    $scope.allTimers = $scope.timers;
    $scope.lastTimer = lodash.findLast( $scope.timers, { status: 'new' } );
    if( $scope.lastTimer !== undefined ) {
      var timeStampStart = new Date( $scope.lastTimer.createdAt ).getTime();
      var timeStampNow = Date.now();
      console.log('timer start, now, diff:', timeStampStart, timeStampNow, Math.floor( ( timeStampNow - timeStampStart ) / 1000 ) - MYSQL_OFFSET);
      var timeDiff = Math.floor( ( timeStampNow - timeStampStart ) / 1000 ) - MYSQL_OFFSET;
      if( timeDiff < optionService.get('pomodoro') ) {
        $scope.startTimer( optionService.get('pomodoro') - timeDiff );
        $scope.currentTimer = $scope.lastTimer;
      }
    }
  })
  .catch(err => {
    $scope.statustext = err;
  } );
}

function TimersController($scope, $rootScope, $http, lodash, optionService, notificationService, jsonapiUtils) {

  // const DURATION_POMO = 5;
  // const IDLE = 0;
  // const RUNNING = 1;
  // $scope.timerStatus = IDLE;
  // console.log('timerCtrl', optionService.get('pomodoro'), currentUser);
  $scope.timer = null;
  $scope.timeRemaining = 0;
  $scope.lastTimer = {};
  $scope.currentTimer = {};
  $scope.allTimers = [];
  $scope.timers = [];
  $scope.projects = [];
  $scope.projectOptions = [];
  $scope.statuses = ['new', 'done', 'interrupted'];
  $scope.filters = {
    project: null
  };
  $scope.$watch('filters', filters, true);
  $scope.$watch('projects', projectOptions, true);

  function projectOptions() {
    $scope.projectOptions = [{ id: 0, name: '' }].concat($scope.projects);
  }

  function filters() {
    $scope.timers = ! $scope.filters.project ? $scope.allTimers :
      lodash.filter($scope.allTimers, timer => (timer.projectId === $scope.filters.project));
  }

  $scope.select = function( evt ) {
    var $parentLi = $( evt.target ).closest('li');
    var id = parseInt( $parentLi.data( 'id' ), 10 );
    var timer = lodash.find( $scope.timers, { id } );
    $scope.currentTimer = timer;
  }


  getTimersAndProjects( $scope, $http, lodash, optionService, jsonapiUtils );

}
module.exports = TimersController;

/***/ }),

/***/ 136:
/***/ (function(module, exports) {

AuthService.$inject = ['$rootScope', '$http', 'jwtHelper'];

function AuthService($rootScope, $http, jwtHelper) {

  let currentUser = null;

  function getToken() {
    return localStorage.getItem('id_token');
  }

  function setToken(jwt) {
    return localStorage.setItem('id_token', jwt);
  }

  function getCurrentUser() {
    return currentUser;
  }

  function init() {
    const token = getToken();
    if(token !== null) {
      $rootScope.currentUser = currentUser = jwtHelper.decodeToken(token);
    }
  }


  return {
    setToken,
    getToken,
    getCurrentUser,
    init,

    signup: function(attributes) {
      return $http.post('/api/v1/users', { data:
       { type: "users", attributes } 
     })
      .then(function(response) {
        // var token = response.data.token;
        // return { token: token, user: self.user };
        // console.log(response);
      });
    },

    signin: function(attributes) {
      let token;
      const self = this;
      return $http.post('/api/v1/signin', { data: { attributes } })
      .then(response => {
        const { jwt, userId } = response.data.data;
        token = jwt;
        return $http.get('/api/v1/users/' + userId);
      })
      .then(response => {
        return response.data.data.attributes;
      })
      .then(user => {
        setToken(token);
        $rootScope.currentUser = currentUser = user;
        console.log(currentUser);
      });
    },

    signout: function() {
      localStorage.removeItem('id_token');
      $rootScope.currentUser = currentUser = null;
    } 

  };
}

module.exports = AuthService;


/***/ }),

/***/ 137:
/***/ (function(module, exports) {

BitbucketService.$inject = ['$rootScope', '$window', '$http', 'repoApis'];

function BitbucketService($rootScope, $window, $http, repoApis) {
  // var apiUrl = 'https://api.bitbucket.org/2.0';
  var authorizeUrls = {
    bitbucket: "https://bitbucket.org/site/oauth2/authorize",
    github: "https://github.com/login/oauth/authorize",
    gitlab: "https://gitlab.com/oauth/authorize"
  }
  console.log('BitbucketService providers', $rootScope.providers);
  var service = {
    authorize: function (provider) {
      var providerParams = $rootScope.providers[provider];
      console.log('provider entry', providerParams);
      var clientId = providerParams.clientId;
      var authorizeUrl = authorizeUrls[provider];
      var url = authorizeUrl + "?client_id=" + clientId + "&response_type=code" +
        (providerParams.redirectUri ? ('&redirect_uri=' + providerParams.redirectUri) : '');
      $window.location.href = url;
    },

    getRepos: function() {
      // const accessToken = localStorage.getItem('bb_at');
      console.log('BitbucketService.getRepos', repoApis);
      return repoApis.bitbucket.getProjects();
      // console.log('Bearer ' + accessToken);
      // return $http({
      //   method: 'GET',
      //   url: apiUrl + '/repositories/bhubr',
      //   // skipAuthorization: true,
      //   headers: {
      //     Authorization: 'Bearer ' + accessToken
      //   }
      // });
    }
  };
  return service;
}

module.exports = BitbucketService;

/***/ }),

/***/ 138:
/***/ (function(module, exports) {

/*----------------------------------------
 | Data service
 *----------------------------------------
 |
 */
DataService.$inject = ['$rootScope', '$http', '$q', 'lodash', 'jsonapiUtils'];

function DataService($rootScope, $http, $q, _, jsonapiUtils) {
  return {
    get: function(keys) {
      if(typeof keys === 'string') {
        keys = [keys];
      }
      var urlsWithQs = keys.map(key => {
        const bits = key.split('?');
        let entry = {
          url: bits[0]
        };
        if(bits.length > 1) {
          entry.qs = bits[1];
        }
        return entry;
      });
      console.log(urlsWithQs);
      var promises = urlsWithQs.map(
        entry => $http.get('/api/v1/' + entry.url + (entry.qs ? ('?' + entry.qs) : ''))
          .then(response => (response.data.data))
      );
      return $q.all(promises)
      .then(results => results.reduce(
        (dataSet, dataItems, index) => {
          dataSet[urlsWithQs[index].url] = jsonapiUtils.unmapRecords(dataItems);
          return dataSet;
        }, {}
      ));
    },

    create: function(type, attributes, rawRelationships) {
      const relationships = {};
      _.forOwn(rawRelationships, (data, key) => {
        relationships[key] = { data };
      });
      return $http.post('/api/v1/' + type, {
        data: { type, attributes, relationships }
      })
      .then(response => (response.data));
    },

    syncProjectIssues: function(project) {
      const { name, description, remoteProjectId } = project;
      return $http.post("/api/v1/sync/issues/" + remoteProjectId,
      {} )
      .then(function(response) {
        console.log("## syncIssues returned");
        console.log(response.data);
        return response.data;
        // const updatedProject = jsonapiUtils.unmapRecord( response.data.data );
        // ctrl.onProjectUpdated({ project: updatedProject });

        notificationService.notify('success', 'syncProjectIssues ok');
      })
      .catch(err => {
        notificationService.notify('danger', 'syncProjectIssues err: ' + err);
      });
    },

    createTimer: function(timer) {
      console.log('DS.createTimer ### 1', timer, $rootScope.currentUser.userId)
      const { type, summary, markdown, duration, issueId, ownerId, projectId } = timer;
      console.log('DS.createTimer ### 2', type, summary, markdown, duration, issueId, ownerId, projectId);
      const relationships = {
        owner: { data: { type: 'users', id: $rootScope.currentUser.userId } },
        project: { data: { type: 'projects', id: projectId } },
        // issue: 
      };
      if(issueId) {
        relationships.issue = { data: { type: 'issues', id: issueId } };
      }
      const data = {
        type: 'timers',
        attributes: { type, summary, markdown, duration },
        relationships
      };
      console.log('DS.createTimer ### 3', { data });
      return $http.post("/api/v1/timers", { data } )
      .then(function(response) {
        // this.currentTimer = jsonapiUtils.unmapRecords(response.data.data);
        return jsonapiUtils.unmapRecord(response.data.data);
        // this.timers.push( this.currentTimer );
      })
      // .catch(err => {
      //   this.statustext = err;
      // });
    },

    updateTimer: function(timer) {
      return $http.put("/api/v1/timers/" + timer.id, {
        data: {
          type: 'timers',
          id: timer.id,
          attributes: {
            summary: timer.summary,
            markdown: timer.markdown
          }
        } 
      } )
      .then(function(response) {
        return jsonapiUtils.unmapRecord(response.data.data);
      })
      .catch(err => {
        this.statustext = err;
      });
    }
  };
}

module.exports = DataService;

/***/ }),

/***/ 139:
/***/ (function(module, exports) {

/*----------------------------------------
 | Lang related stuff
 *----------------------------------------
 |
 */
JsonapiUtils.$inject = ['lodash'];

function JsonapiUtils(_) {

  function lowerFirstChar(string) {
    return string.charAt(0).toLowerCase() + string.substring(1);
  }

  function lowerCamelAttributes(attributes) {
    var newAttrs = {};
    for(var a in attributes) {
      var lowerCamelAttrKey = lowerFirstChar( _.camelCase(a));
      newAttrs[lowerCamelAttrKey] = attributes[a];
    }
    return newAttrs;
  }


  function kebabAttributes(attributes) {
    var newAttrs = {};
    for(var a in attributes) {
    var snakedAttrKey = _.kebabCase(a);
    newAttrs[snakedAttrKey] = attributes[a];
    }
    return newAttrs;
  }

  function unmapRecords(records) {
    return _.map(records, unmapRecord);
  }

  function unmapRecord(record) {
    return Object.assign({ id: record.id },
      lowerCamelAttributes(record.attributes)
    );
  }

  return {
    lowerCamelAttributes,
    kebabAttributes,
    unmapRecords,
    unmapRecord
  }

}

module.exports = JsonapiUtils;

/***/ }),

/***/ 140:
/***/ (function(module, exports) {

NotificationService.$inject = ['$rootScope'];

function NotificationService($rootScope) {

  /**
   * Send browser desktop notification.
   * Source: http://stackoverflow.com/questions/2271156/chrome-desktop-notification-example
   */
  function notifyMe(data) {
    const textsPerType = {
      idle: {
        title: "Don't stay idle!!!",
        body: data => {
          return "Hey there! You've been idle for " + data.idleTime + ' minute(s)';
        }
      },
      done: {
        title: 'Timer complete',
        body: data => {
          return "Feel free to take a break! Do it!";
        }
      }
    };
    const texts = textsPerType[data.type];
    // Request permission if not yet granted
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    else {
      var notification = new Notification(texts.title, {
        icon: 'https://ares.gods.ovh/img/Tomato_icon-icons.com_68675.png',
        body: texts.body(data),
      });

      notification.onclick = function () {
        window.open("http://stackoverflow.com/a/13328397/1269037");      
      };
    }
  }
  
  function notify(alertClass, message) {
    $rootScope.$emit('alert', {
      alertClass, message
    });
  }

  function init() {
    console.log('init notificationService');

    var socket = io();
    socket.on('idle', function(idleTime){
      console.log(idleTime);
      notifyMe({ type: 'idle', idleTime: idleTime });
    });
    socket.on('server ready', function(msg){
      // console.log(msg);
      const token = localStorage.getItem('id_token');
      if(token !== null) {
        socket.emit('client ready', token);
      }
    });
    socket.on('timer done', () => {
      notifyMe({ type: 'done' })
    });
  }

  return {
    notify,
    init
  }
}

module.exports = NotificationService;

/***/ }),

/***/ 141:
/***/ (function(module, exports) {

OptionService.$inject = ['dataService'];

function OptionService(dataService) {

  var options = {};

  /**
   * Set an option value
   */
  function set(key, value) {
    options[key] = value;
  }

  /**
   * Get an option value
   */
  function get(key) {
    return options[key];
  }

  /**
   * Fetch options from backend and populate data
   */
  function populate(records) {
    records.forEach(record => {
      let { key, value } = record;
      if( key.endsWith('Duration')) {
        key = key.replace('Duration', '');
        value = parseInt(value, 10);
      }
      set(key, value);
    });
  }

  /**
   * Expose functions
   */
  return {
    set, get, populate
  };
}

module.exports = OptionService;

/***/ }),

/***/ 142:
/***/ (function(module, exports) {

TokenCheckInterceptor.$inject = ['$q', '$location'];

function TokenCheckInterceptor($q, $location) {
    var responseInterceptor = {
        responseError: function(rejection) {
            if(typeof rejection.data === 'string' && rejection.data.includes('Token expired by')) {
                $location.path('/signin');
            }
            return rejection;
        }
    };

    return responseInterceptor;
}

module.exports = TokenCheckInterceptor;

/***/ }),

/***/ 143:
/***/ (function(module, exports) {

/*----------------------------------------
 | Lang related stuff
 *----------------------------------------
 |
 */
TranslationService.$inject = ['$rootScope', '$translate'];

function TranslationService($rootScope, $translate) {

  return {
    init: function() {

      // Get preferred language is set, and tell $translate to use it
      var preferredLang = localStorage.getItem('preferred_lang');
      if(preferredLang) {
        $translate.use(preferredLang);
      }

      // Set preferred language and configure $translate,
      // so that language pref is remembered on page reload
      $rootScope.changeLanguage = function (key) {
        localStorage.setItem('preferred_lang', key);
        $translate.use(key);
      };
    }
  }

}

module.exports = TranslationService;

/***/ }),

/***/ 144:
/***/ (function(module, exports) {

/**
 * You first need to create a formatting function to pad numbers to two digits…
 **/
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

function formatTimer( seconds ) {
  const minutes = Math.floor( seconds / 60 );
  seconds = seconds % 60;
  return twoDigits( minutes ) + ':' + twoDigits( seconds );
}

module.exports = function() {
  return formatTimer;
};

/***/ }),

/***/ 145:
/***/ (function(module, exports) {

/*
 * @license
 * angular-socket-io v0.7.0
 * (c) 2014 Brian Ford http://briantford.com
 * License: MIT
 */

angular.module('btford.socket-io', []).
  provider('socketFactory', function () {

    'use strict';

    // when forwarding events, prefix the event name
    var defaultPrefix = 'socket:',
      ioSocket;

    // expose to provider
    this.$get = ['$rootScope', '$timeout', function ($rootScope, $timeout) {

      var asyncAngularify = function (socket, callback) {
        return callback ? function () {
          var args = arguments;
          $timeout(function () {
            callback.apply(socket, args);
          }, 0);
        } : angular.noop;
      };

      return function socketFactory (options) {
        options = options || {};
        var socket = options.ioSocket || io.connect();
        var prefix = options.prefix === undefined ? defaultPrefix : options.prefix ;
        var defaultScope = options.scope || $rootScope;

        var addListener = function (eventName, callback) {
          socket.on(eventName, callback.__ng = asyncAngularify(socket, callback));
        };

        var addOnceListener = function (eventName, callback) {
          socket.once(eventName, callback.__ng = asyncAngularify(socket, callback));
        };

        var wrappedSocket = {
          on: addListener,
          addListener: addListener,
          once: addOnceListener,

          emit: function (eventName, data, callback) {
            var lastIndex = arguments.length - 1;
            var callback = arguments[lastIndex];
            if(typeof callback == 'function') {
              callback = asyncAngularify(socket, callback);
              arguments[lastIndex] = callback;
            }
            return socket.emit.apply(socket, arguments);
          },

          removeListener: function (ev, fn) {
            if (fn && fn.__ng) {
              arguments[1] = fn.__ng;
            }
            return socket.removeListener.apply(socket, arguments);
          },

          removeAllListeners: function() {
            return socket.removeAllListeners.apply(socket, arguments);
          },

          disconnect: function (close) {
            return socket.disconnect(close);
          },

          connect: function() {
            return socket.connect();
          },

          // when socket.on('someEvent', fn (data) { ... }),
          // call scope.$broadcast('someEvent', data)
          forward: function (events, scope) {
            if (events instanceof Array === false) {
              events = [events];
            }
            if (!scope) {
              scope = defaultScope;
            }
            events.forEach(function (eventName) {
              var prefixedEvent = prefix + eventName;
              var forwardBroadcast = asyncAngularify(socket, function () {
                Array.prototype.unshift.call(arguments, prefixedEvent);
                scope.$broadcast.apply(scope, arguments);
              });
              scope.$on('$destroy', function () {
                socket.removeListener(eventName, forwardBroadcast);
              });
              socket.on(eventName, forwardBroadcast);
            });
          }
        };

        return wrappedSocket;
      };
    }];
  });

/***/ }),

/***/ 155:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(145);

const DURATION_POMO = 1500;


/**
 * …and then create the method to output the date string as desired.
 * Some people hate using prototypes this way, but if you are going
 * to apply this to more than one Date object, having it as a prototype
 * makes sense.
 **/

function lowerCamelAttributes(attributes) {
  var newAttrs = {};
  for(var a in attributes) {
    var lowerCamelAttrKey = a.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
    newAttrs[lowerCamelAttrKey] = attributes[a];
  }
  return newAttrs;
}

function mapAttributes( item ) {
  return Object.assign( {}, { id: item.id }, lowerCamelAttributes(item.attributes) );
}



// http://0xfe.blogspot.fr/2010/04/desktop-notifications-with-webkit.html
function Notifier() {}

// Returns "true" if this browser supports notifications.
document.addEventListener('DOMContentLoaded', function () {
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.'); 
    return;
  }

  if (Notification.permission !== "granted")
    Notification.requestPermission();
});



// Declare app
var app = angular.module("ngTimeTracker", [
  'ngRoute',
  'ngLodash',
  'ngSanitize',
  'angularMoment',
  'markdown',
  'nvd3',
  'angular-jwt',
  'btford.socket-io',
  'pascalprecht.translate',
  'ngCodeRepoApis'
]);
// app.config(['$locationProvider', function($locationProvider) {
//   $locationProvider.hashPrefix('');
// }]);
app.directive('templateComment', function () {
    return {
        restrict: 'E',
        compile: function (tElement, attrs) {
            tElement.remove();
        }
    };
});
// angular.module('markdown')
// .config(function(markdownProvider) {
//   markdownProvider.config({
//     extensions: ['table']
//   });
// });
// angular.module('myApp', ['nvd3'])
app
.config(__webpack_require__(122))
.config(__webpack_require__(123))
.config(__webpack_require__(124))
.component('timerSetup', __webpack_require__(121))
.component('projectList', __webpack_require__(120))
.component('projectEditor', __webpack_require__(119))
.factory('notificationService', __webpack_require__(140))
.factory('authService', __webpack_require__(136))
.factory('dataService', __webpack_require__(138))
.factory('optionService', __webpack_require__(141))
.factory('translationService', __webpack_require__(143))
.factory('jsonapiUtils', __webpack_require__(139))
.factory('tokenCheckInterceptor', __webpack_require__(142))
.factory('bitbucketService', __webpack_require__(137))
.config(['$httpProvider', function($httpProvider) {  
    $httpProvider.interceptors.push('tokenCheckInterceptor');
}])
.controller('mainCtrl', __webpack_require__(128))
.controller('alertCtrl', __webpack_require__(126))
.controller('dashboardCtrl', __webpack_require__(127))
.controller('signinCtrl', __webpack_require__(132))
.controller('signupCtrl', __webpack_require__(133))
.controller('accountsCtrl', __webpack_require__(125))
.controller('statsCtrl', __webpack_require__(134))
.controller('projectsCtrl', __webpack_require__(130))
.controller('projectsDetailsCtrl', __webpack_require__(129))
.controller('timerCtrl', __webpack_require__(135))
.controller('reposCtrl', __webpack_require__(131))
.filter('formatTimer', __webpack_require__(144))
.run(['translationService', 'authService', 'notificationService',
  function(translationService, authService, notificationService) {
    translationService.init();
    authService.init();
    notificationService.init();
  }
])



/***/ })

},[155]);