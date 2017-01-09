'use strict';

/* Filters */

var electrikAppFilters = angular.module('myApp.filters', []);

electrikAppFilters.filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }]);

electrikAppFilters.filter("stars", function() {
    return function(data) {
        switch (data) {
            case "trés bon":
                return "***";
                break;
            case "bon":
                return "**";
                break;
            case "débutant":
                return "*";
                break;
            default:
                return "";
        }
    }
});

//filtre pourcentage
electrikAppFilters.filter("pourcentage", ['$filter',function($filter) {
    return function(input, decimals) {
        return (isNaN(input))? "---" : $filter('number')(input*100, decimals)+'%';
    };
}]);

//ajoute le plus si le pourcentage est positif
electrikAppFilters.filter("pourcentageEvolution", ['$filter',function($filter) {
    return function(input, decimals) {
        return ((!isNaN(input) && input > 0)?"+":"")+ $filter('pourcentage')(input, decimals);
    };
}]);


electrikAppFilters.filter('OuiNon', ['$filter',function($filter) {
    return function(input) {
        return input == 1 ? 'Oui' : 'Non';
    };
}]);
