DashboardController.$inject = ['$scope', 'lodash', 'moment', 'data'];

function DashboardController($scope, _, moment, data) {
  var numTimers = data.timers.length;
  var sortedTimers = _.sortBy(data.timers, 'createdAt');
  $scope.latestTimers = _.slice(sortedTimers, numTimers - 5);
  var dateNow = moment().subtract(7, 'days');
  // dateNow mo;
  // .toDate();
  console.log(dateNow.toDate(), new Date());
  var recentTimers = _.filter(sortedTimers, function(t) {
    return moment(t.createdAt).diff(dateNow, 'minutes') > 0;
  });
  var recentProjectIds = _.map(recentTimers, 'projectId');
  $scope.activeProjects = _.filter(data.projects, function(p) {
    return recentProjectIds.indexOf(p.id) !== -1;
  });
  console.log($scope.recentTimers, recentProjectIds);
}

module.exports = DashboardController;