(function() {
  'use strict';

  function controller($scope, QueriesFactory){
    $scope.selectedQuery = '';
    $scope.queryResults = [];
    $scope.auxResults = [];
    $scope.electionStatYear = '2016';
    $scope.candidateName = '';
    $scope.partyName = 'Republican';

    function onGetQuerySuccess(queryName, response) {
      switch (queryName) {
        case 'profiles':
          $scope.queryResults = "";
          break;
        case 'stateStats':
          $scope.queryResults = response.data;
          break;
        case 'championPoliticalParties':
          $scope.queryResults = response.data;
          break;
        case 'thirdPartyStats':
          $scope.queryResults = response.data;
          break;
        case 'electoralUpsets':
          $scope.queryResults = response.data;
          break;
        case 'surpriseVictors':
          $scope.queryResults = response.data;
          break;
        case 'biggestLosers':
          $scope.queryResults = response.data;
          break;
        case 'firstNames':
          $scope.queryResults = response.data;
          break;
        case 'lastNames':
          $scope.auxResults = response.data;
          break;
        case 'electionStatsByYear':
          $scope.queryResults = response.data;
          break;
        case 'pollData':
          $scope.auxResults = response.data;
          break;
        case 'statsByCandidate':
          $scope.queryResults = response.data;
          break;
        case 'nonContiguous':
          $scope.queryResults = response.data;
          break;
        case 'swingCandidates':
          $scope.queryResults = response.data;
          break;
        case 'partyHistory':
          $scope.queryResults = response.data;
          break;
        case 'winsVsLoses':
          $scope.auxResults = response.data;
          break;
        default:
          break;
      }
    }

    function onGetQueryError(error) {
      console.log(error);
    }

    function getQuery(queryName, queryString) {
        var q = queryName;
        if (queryString){
          q += queryString;
        }
        QueriesFactory.getQuery(q)
          .then(onGetQuerySuccess.bind(null, queryName), onGetQueryError);
          /*
              $http.get doesn't actually return the array right away because
              it is asynchronous. It returns a "promise". So, we use ".then" to
              say that when the results are returned call either our success or
              failure functions.
           */
    }

    function clearQueryResults() {
      $scope.queryResults = [];
    }

    function clearAuxResults() {
      $scope.auxResults = [];
    }

    $scope.switchSelectedQuery = function(queryName, delayQuery) {
      clearQueryResults();
      clearAuxResults();
      $scope.selectedQuery = queryName;
      if (!delayQuery){
        switch ($scope.selectedQuery) {
          case 'profiles':
            getQuery(queryName);
            break;
          case 'stateStats':
            getQuery(queryName);
            break;
          case 'championPoliticalParties':
            getQuery(queryName);
            break;
          case 'thirdPartyStats':
            getQuery(queryName);
            break;
          case 'electoralUpsets':
            getQuery(queryName);
            break;
          case 'surpriseVictors':
            getQuery(queryName);
            break;
          case 'biggestLosers':
            getQuery(queryName);
            break;
          case 'firstNames':
            getQuery(queryName);
            getQuery('lastNames');
            break;
          case 'electionStatsByYear':
            getQuery(queryName, '?year=' + $scope.electionStatYear);
            getQuery('pollData', '?year=' + $scope.electionStatYear);
            break;
          case 'statsByCandidate':
            getQuery(queryName, '?name=' + $scope.candidateName);
            break;
          case 'nonContiguous':
            getQuery(queryName);
            break;
          case 'swingCandidates':
            getQuery(queryName);
            break;
          case 'partyHistory':
            getQuery(queryName, '?name=' + $scope.partyName);
            getQuery('winsVsLoses', '?name=' + $scope.partyName);
            break;
          default:
            break;
        }
      }
    }
  }

  /* This is here in case we were to "minify" our files */
  controller.$inject = ['$scope', 'QueriesFactory'];

  angular
    .module('prez')
    .controller('MainCtrl', controller);
})();
