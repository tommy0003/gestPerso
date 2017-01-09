/**
 * Created by thomas on 27/07/2014.
 *
 * Controller pour la sauvegarde des factures
 */

(function () {

    var facturesController = appControllers.controller("FacturesController", function($scope, Facture, $route, DateService, $upload) {

        $scope.factures = null;
        $scope.lastFacture=null;
        
        //$scope.paginator.pageSize=5;

        //permet de selectionner une facture
        $scope.selectFacture = function(facture) {
            $scope.facture = facture;
            //convertit millisecond en date
            $scope.facture.dateDebutConso = new Date(facture.dateDebutConso);
            $scope.facture.dateFinConso = new Date(facture.dateFinConso);
            $scope.facture.dateDebutAbo = new Date(facture.dateDebutAbo);
            $scope.facture.dateFinAbo = new Date(facture.dateFinAbo);
        }

        // je fais un update si ma facture a une propriété _id renseignée, sinon c'est une création
        $scope.saveFacture = function(facture) {
            facture.dateDebutConso = Date.parse(facture.dateDebutConso);
            facture.dateFinConso = Date.parse(facture.dateFinConso);
            facture.dateDebutAbo = Date.parse(facture.dateDebutAbo);
            facture.dateFinAbo = Date.parse(facture.dateFinAbo);
            facture._id !== undefined ? $scope.updateFacture(facture) : $scope.createFacture(facture);
            //recharge la page pour maj liste
            $route.reload();
        }

        //reset la facture en cours
        $scope.newFacture = function() {
        	if($scope.lastFacture != null){
        		var dateDebutConso = new Date($scope.lastFacture.dateFinConso + DateService.getNbJoursEnMillis(1));
        		var ancienIndexHP = $scope.lastFacture.nouvelIndexHP;
        		var ancienIndexHC = $scope.lastFacture.nouvelIndexHC;
        		var dateDebutAbo = new Date($scope.lastFacture.dateFinAbo + DateService.getNbJoursEnMillis(1));
        		
        		$scope.facture = { dateDebutConso : dateDebutConso, ancienIndexHP : ancienIndexHP, ancienIndexHC : ancienIndexHC, dateDebutAbo :dateDebutAbo 	};
        	} else {
        		$scope.facture = {};
        	}            
        }

        $scope.getAllFactures = function() {
            Facture.query().$promise.then(
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
            Facture.save(facture).$promise.then(
                function(data) {
                    $scope.getAllFactures();
                },
                function(error) {
                    console.log("createFacture", error);
                }
            )
        }

        $scope.updateFacture = function(facture) {
            Facture.update({id: facture._id}, facture).$promise.then(
                function(data) {
                    $scope.getAllFactures();
                },
                function(error) {
                    console.log("updateFacture", error);
                }
            )
        }

        $scope.getFacture = function(id) {
            Facture.get({id:id}).$promise.then(
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
            Facture.delete({id: id}).$promise.then(
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
