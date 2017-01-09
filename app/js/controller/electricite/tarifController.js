/**
 * Created by thomas on 18/07/2014.
 *
 * Controller pour la sauvegarde des tarifs
 */

(function () {

    var tarifsController = appControllers.controller("TarifsController", function($scope, Tarif, $route) {

        $scope.tarifs = null;

        //permet de selectionner un tarif
        $scope.selectTarif = function(tarif) {
            $scope.tarif = tarif;
            $scope.tarif.dateDebut = new Date(tarif.dateDebut);
            $scope.tarif.dateFin = new Date(tarif.dateFin);
        }

        // je fais un update si mon tarif a une propriété _id renseignée, sinon c'est une création
        $scope.saveTarif = function(tarif) {
            tarif.dateDebut = Date.parse(tarif.dateDebut);
            tarif.dateFin = Date.parse(tarif.dateFin);
            tarif._id !== undefined ? $scope.updateTarif(tarif) : $scope.createTarif(tarif);
            //recharge la page pour maj liste
            $route.reload();
        }

        //reset le tarif en cours
        $scope.newTarif = function() {
            $scope.tarif = {};
        }

        $scope.getAllTarifs = function() {
            Tarif.query().$promise.then(
                function(data) {
                    $scope.tarifs = data;
                },
                function(error) {
                    console.log("getAllTarifs", error);
                }
            )
        }

        $scope.createTarif = function(tarif) {
            Tarif.save(tarif).$promise.then(
                function(data) {
                    $scope.getAllTarifs();
                },
                function(error) {
                    console.log("createTarif", error);
                }
            )
        }

        $scope.updateTarif = function(tarif) {
            Tarif.update({id: tarif._id}, tarif).$promise.then(
                function(data) {
                    $scope.getAllTarifs();
                },
                function(error) {
                    console.log("updateTarif", error);
                }
            )
        }

        $scope.getTarif = function(id) {
            Tarif.get({id:id}).$promise.then(
                function(data) {
                    console.log(data);
                    $scope.tarif = data;
                },
                function(error) {
                    console.log("getTarif", error);
                }
            )
        }

        $scope.deleteTarif = function(id) {
            Tarif.delete({id: id}).$promise.then(
                function(data) {
                    $scope.getAllTarifs();
                },
                function(error) {
                    console.log("Erreur de suppression du tarif", error);
                }
            )
        }

        $scope.getAllTarifs();

        //initialisation datepicker
        $scope.open = function($event, opened) { $event.preventDefault();  $event.stopPropagation(); $scope[opened] = true;  };
        //option du datepicker
        $scope.dateOptions = { 'year-format': "'yy'",  'datepicker-mode':"'day'",  'min-mode':"day"	};

    });


}());