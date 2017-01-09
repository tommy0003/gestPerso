/**
 * Created by thomas on 30/08/2014.
 *
 * Controller pour la sauvegarde des factures
 */

(function () {

    var facturesController = appControllers.controller("FacturesEauController", function($scope, FactureEau, $route, DateService, $upload) {

        $scope.factures = null;
        $scope.lastFacture=null;
        
        //$scope.paginator.pageSize=5;

        //permet de selectionner une facture
        $scope.selectFacture = function(facture) {
            $scope.facture = facture;
            //convertit millisecond en date
            $scope.facture.dateDebut = new Date(facture.dateDebut);
            $scope.facture.dateFin = new Date(facture.dateFin);
            $scope.facture.dateFacturation = new Date(facture.dateFacturation);
        }

        // je fais un update si ma facture a une propriété _id renseignée, sinon c'est une création
        $scope.saveFacture = function(facture) {
            facture.dateDebut = Date.parse(facture.dateDebut);
            facture.dateFin = Date.parse(facture.dateFin);
            facture.dateFacturation = Date.parse(facture.dateFacturation);
            facture._id !== undefined ? $scope.updateFacture(facture) : $scope.createFacture(facture);
            //recharge la page pour maj liste
            $route.reload();
        }

        //reset la facture en cours
        $scope.newFacture = function() {
        	if($scope.lastFacture != null){
        		var dateDebut = new Date($scope.lastFacture.dateFin + DateService.getNbJoursEnMillis(1));
        		var ancienIndex = $scope.lastFacture.nouvelIndex;
        		var dateDebut = new Date($scope.lastFacture.dateFin + DateService.getNbJoursEnMillis(1));
        		
        		$scope.facture = { dateDebut : dateDebut, ancienIndex : ancienIndex };
        	} else {
        		$scope.facture = {};
        	}            
        }

        $scope.getAllFactures = function() {
            FactureEau.query().$promise.then(
                function(data) {
                    $scope.factures = data;
                    $scope.lastFacture = data[0];
                },
                function(error) {
                    console.log("getAllFactures", error);
                }
            )
        }

        $scope.createFacture = function(facture) {
            FactureEau.save(facture).$promise.then(
                function(data) {
                    $scope.getAllFactures();
                },
                function(error) {
                    console.log("createFacture", error);
                }
            )
        }

        $scope.updateFacture = function(facture) {
            FactureEau.update({id: facture._id}, facture).$promise.then(
                function(data) {
                    $scope.getAllFactures();
                },
                function(error) {
                    console.log("updateFacture", error);
                }
            )
        }

        $scope.getFacture = function(id) {
            FactureEau.get({id:id}).$promise.then(
                function(data) {
                    console.log(data);
                    $scope.facture = data;
                },
                function(error) {
                    console.log("getFacture", error);
                }
            )
        }

        $scope.deleteFacture = function(id) {
            FactureEau.delete({id: id}).$promise.then(
                function(data) {
                    $scope.getAllFactures();
                },
                function(error) {
                    console.log("Erreur de suppression du facture", error);
                }
            )
        }

        $scope.getAllFactures();
        
        //affiche la 1ere page du pager si un utilise le filtre de recherche
        $scope.$watch('search', function(newValue, oldValue) {
            if (newValue != oldValue) {
                $scope.firstPage();
            }
        });

        //initialisation datepickers
        $scope.open = function($event, opened) { $event.preventDefault();  $event.stopPropagation(); $scope[opened] = true;  };
        //option du datepicker
        $scope.dateOptions = { 'year-format': "'yy'",  'datepicker-mode':"'day'",  'min-mode':"day"	};


        //init du file upload

        $scope.onFileSelect = function($files) {

            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var $file = $files[i];
                $scope.facture.pieceJointe=$file.name;
                $upload.upload({
                    url: 'http://localhost:3000/upload',
                    file: $file,
                    progress: function(e){}
                }).then(function(data, status, headers, config) {
                    // file is uploaded successfully
                    console.log(data);
                });
            }
        }

        $scope.hasPJ = function(facture) {
            return facture.pieceJointe!=null;
        }
    });


}());
