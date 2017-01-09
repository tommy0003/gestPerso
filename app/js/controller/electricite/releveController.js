/**
 * Created by thomas on 18/07/2014.
 *
 * Controller pour les relevés d'indexs
 */

(function () {

    var relevesController = appControllers.controller("RelevesController", function($scope, Releve, $route, DateService, ReleveService) {

        $scope.releves = null;
        $scope.lastReleve=null;

        $scope.getAllReleves = function() {
            ReleveService.getReleveMySql().then(function(data) {
                //this will execute when the AJAX call completes.
                $scope.releves = data;
            });
        };

        $scope.getAllReleves();

        //affiche la 1ere page du pager si un utilise le filtre de recherche
        $scope.$watch('search', function(newValue, oldValue) {
            if (newValue != oldValue) {
                $scope.firstPage();
            }
        });
    });
}());