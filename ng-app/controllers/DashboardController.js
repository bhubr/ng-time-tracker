DashboardController.$inject = ['$rootScope', '$scope', 'lodash', 'moment', 'dataService', 'optionService', 'data'];

function DashboardController($rootScope, $scope, _, moment, dataService, optionService, data) {
  $scope.dailyPost = {
    markdown: ''
  };

  // Populate options
  optionService.populate(data.options);

  // 5 most recent timers
  var numTimers = data.timers.length;
  var sortedTimers = _.sortBy(data.timers, 'createdAt');
  $scope.latestTimers = _.slice(sortedTimers, numTimers - 5);

  // Projects for which there have been timers in the last 7 days
  var oneWeekAgo = moment().subtract(7, 'days');
  var recentTimers = _.filter(sortedTimers, function(t) {
    return moment(t.createdAt).diff(oneWeekAgo, 'minutes') > 0;
  });
  var recentProjectIds = _.map(recentTimers, 'projectId');
  $scope.activeProjects = _.filter(data.projects, function(p) {
    return recentProjectIds.indexOf(p.id) !== -1;
  });

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