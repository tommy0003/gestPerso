/**
 * Created by thomas on 18/07/2014.
 *
 * Controller pour les relevés d'indexs
 */

(function () {

    var relevesController = appControllers.controller("RelevesFioulController", function($scope, ReleveFioul, $route, DateService) {

        $scope.releves = null;
        $scope.lastReleve=null;

        //permet de selectionner un releve
        $scope.selectReleve = function(releve) {
            $scope.releve = releve;
            //convertit millisecond en date
            $scope.releve.dateHeure = new Date(releve.dateHeure);
        }

        // je fais un update si mon releve a une propriété _id renseignée, sinon c'est une création
        $scope.saveReleve = function(releve) {
            //stock en milliseconde
            releve.dateHeure = Date.parse(releve.dateHeure);
            releve._id !== undefined ? $scope.updateReleve(releve) : $scope.createReleve(releve);
            //recharge la page pour maj le pager
            $route.reload();
        }

        //reset le releve en cours
        $scope.newReleve = function() {
        	$scope.releve = { dateHeure : new Date() };
        	$scope.releve.volume.focus();
        }

        $scope.getAllReleves = function() {
        	ReleveFioul.query().$promise.then(
                function(data) {
                    $scope.releves = data;
                    if(data.length > 0){
                    	$scope.lastReleve = data[data.length-1];
                    }
                },
                function(error) {
                    console.log("getAllReleves", error);
                }
            )
        }

        $scope.createReleve = function(releve) {
        	ReleveFioul.save(releve).$promise.then(
                function(data) {
                    //recharge la liste des releves
                    $scope.getAllReleves();
                },
                function(error) {
                    console.log("createReleve", error);
                }
            )
        }

        $scope.updateReleve = function(releve) {
        	ReleveFioul.update({id: releve._id}, releve).$promise.then(
                function(data) {
                    //recharge la liste des releves
                    $scope.getAllReleves();
                },
                function(error) {
                    console.log("updateReleve", error);
                }
            )
        }

        $scope.getReleve = function(id) {
        	ReleveFioul.get({id:id}).$promise.then(
                function(data) {
                    console.log(data);
                    $scope.releve = data;
                },
                function(error) {
                    console.log("getReleve", error);
                }
            )
        }

        $scope.deleteReleve = function(id) {
        	ReleveFioul.delete({id: id}).$promise.then(
                function(data) {
                    $scope.getAllReleves();
                },
                function(error) {
                    console.log("Erreur de suppression du releve", error);
                }
            )
        }

        $scope.getAllReleves();

        //affiche la 1ere page du pager si un utilise le filtre de recherche
        $scope.$watch('search', function(newValue, oldValue) {
            if (newValue != oldValue) {
                $scope.firstPage();
            }
        });

        //initialisation datepicker
        //evenement ouverture du monthpicker
        $scope.open = function($event) { $event.preventDefault();  $event.stopPropagation(); $scope.opened = true;  };
        //option du datepicker
        $scope.dateOptions = { 'year-format': "'yy'",  'datepicker-mode':"'day'",  'min-mode':"day"	};


    });


}());