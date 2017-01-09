/**
 * Created by thomas on 27/08/2014.
 *
 * Controller pour l'estimation de la prochaine facture
 */

(function () {

    var facturesController = appControllers.controller("ProchaineFactureController", function($scope, Facture, TarifService, ReleveService, $route, DateService, MathService) {

        $scope.lastFacture=null;
        $scope.lastReleve=null;
        $scope.tarifApplicable=null;
        $scope.annee = new Date().getFullYear();
        
        //TODO seolis facture l'abonnement par trimestre
        $scope.nbMoisAbo = 3;
        //la prochaine facture estim�e
        $scope.prochaineFacture = { montantAbo : 0, ancienIndexHC :0, ancienIndexHP :0, nouvelIndexHC :0, nouvelIndexHP :0, consoHC:0, consoHP:0, montantHC :0, montantHP :0, montantTotal:0 };
        
        //initialisation de la derniere facture
        $scope.getLastFacture = function() {
            Facture.query().$promise.then(
                function(data) {
                	if(data.length > 0){
                		$scope.lastFacture = data[0];
                		$scope.getLastReleves();
                	}
                },
                function(error) {
                    console.log("getLastFacture", error);
                }
            )
        }
        
        //initialisation du dernier releve
        $scope.getLastReleves = function() {

            ReleveService.getReleveMySqlAnneeDernierReleve($scope.annee).then(function(data) {
                if(data.length > 0){
                    $scope.lastReleve = data[data.length-1];
                    $scope.initTarifApplicable($scope.lastReleve.dateHeure);
                }
            },
            function(error) {
                console.log("getReleveMySqlAnneeDernierReleve", error);
            }

            );

        };

        //initialisation du tarif applicable depuis la derniere facture
        $scope.initTarifApplicable = function(date) {
            TarifService.getTarifDate(date, function(data) {
            	if(data.length > 0){
            		$scope.tarifApplicable = data[0];
            		$scope.initDerniereFacture();
            	}
            })
        };
        
       //initialisation des donn�es de la derniere facture
        $scope.initDerniereFacture = function() {

            		
            		$scope.prochaineFacture.montantAbo=MathService.multiply($scope.tarifApplicable.tarifAbo, $scope.nbMoisAbo);
            		$scope.prochaineFacture.ancienIndexHC=$scope.lastFacture.nouvelIndexHC;
            		$scope.prochaineFacture.ancienIndexHP=$scope.lastFacture.nouvelIndexHP;
            		$scope.prochaineFacture.nouvelIndexHC=Math.round(MathService.divide( $scope.lastReleve.indexHC, 1000));
            		$scope.prochaineFacture.nouvelIndexHP=Math.round(MathService.divide($scope.lastReleve.indexHP, 1000));
            		$scope.prochaineFacture.consoHC=MathService.subtract($scope.prochaineFacture.nouvelIndexHC, $scope.lastFacture.nouvelIndexHC);
            		$scope.prochaineFacture.consoHP=MathService.subtract($scope.prochaineFacture.nouvelIndexHP, $scope.lastFacture.nouvelIndexHP);
            		$scope.prochaineFacture.montantHC=MathService.multiply($scope.prochaineFacture.consoHC, $scope.tarifApplicable.tarifHC);
            		$scope.prochaineFacture.montantHP=MathService.multiply($scope.prochaineFacture.consoHP, $scope.tarifApplicable.tarifHP);
            		$scope.prochaineFacture.montantTotal=$scope.prochaineFacture.montantHP + $scope.prochaineFacture.montantHC + $scope.prochaineFacture.montantAbo;

                 };

        $scope.getLastFacture();
                

    });


}());
