'use strict';

/* Directives */

var appDirecties = angular.module('myApp.directives', []);

appDirecties.directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
}]);

/*test d'une directive*/
appDirecties.directive('customButton', [function() {
	  return {
	   restrict: 'A',
	   replace: true,
		transclude: true,
		template: '<a href="" class="myawesomebutton" ng-transclude>' + '<i class="icon-ok-sign"></i>' + '</a>',

		link: function (scope, element, attrs) {
		  // manipulation du DOM et événements
		}
  };

}]);




//pagination cote client
// url : http://www.frangular.com/2012/12/pagination-cote-client-directive-angularjs.html

appDirecties.directive('paginator', function () {
    var pageSizeLabel = "Page size";
    return {
        priority: 0,
        restrict: 'A',
        scope: {items: '&'},
        template:
            '<button ng-disabled="isFirstPage()" ng-click="decPage()">&lt;</button>'
            + '{{paginator.currentPage+1}}/{{numberOfPages()}}'
            + '<button ng-disabled="isLastPage()" ng-click="incPage()">&gt;</button>'
            + '<span>' + pageSizeLabel + '</span>'
            + '<select ng-model="paginator.pageSize" ng-options="size for size in pageSizeList"></select>',
        replace: false,
        compile: function compile(tElement, tAttrs, transclude) {
            return {
                pre: function preLink(scope, iElement, iAttrs, controller) {
                    scope.pageSizeList = [5, 10, 20, 50, 100];
                    scope.paginator = {
                        pageSize: 20,
                        currentPage: 0
                    };

                    scope.isFirstPage = function () {
                        return scope.paginator.currentPage == 0;
                    };
                    scope.isLastPage = function () {
                        return scope.paginator.currentPage
                            >= scope.items().length / scope.paginator.pageSize - 1;
                    };
                    scope.incPage = function () {
                        if (!scope.isLastPage()) {
                            scope.paginator.currentPage++;
                        }
                    };
                    scope.decPage = function () {
                        if (!scope.isFirstPage()) {
                            scope.paginator.currentPage--;
                        }
                    };
                    scope.firstPage = function () {
                        scope.paginator.currentPage = 0;
                    };
                    scope.numberOfPages = function () {
                        return Math.ceil(scope.items().length / scope.paginator.pageSize);
                    };
                    scope.$watch('paginator.pageSize', function(newValue, oldValue) {
                        if (newValue != oldValue) {
                            scope.firstPage();
                        }
                    });

                    // ---- Functions available in parent scope -----

                    scope.$parent.firstPage = function () {
                        scope.firstPage();
                    };
                    // Function that returns the reduced items list, to use in ng-repeat
                    scope.$parent.pageItems = function () {
                        var start = scope.paginator.currentPage * scope.paginator.pageSize;
                        var limit = scope.paginator.pageSize;
                        return scope.items().slice(start, start + limit);
                    };
                },
                post: function postLink(scope, iElement, iAttrs, controller) {}
            };
        }
    };
    
    
    
});
  

  

  


