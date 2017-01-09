/**
 * Created by thomas on 31/08/2014.
 *
 * Controller pour les stats de consommation d'eau
 */

(function () {

    var GestionAnnuelleController = appControllers.controller("GestionAnnuelleEauController", function($scope, $timeout, FactureEau, MathService, DateService) {

        $scope.factures=null;
        //le tableau des donnees anuelle
        $scope.donnees = new Array();

        //init des donnees a partir des factures (seul reference)
        $scope.initDonnees = function() {

            //parcours des factures
            angular.forEach($scope.factures, function(facture) {
                var dateDebut = facture.dateDebut;
                var dateFin = facture.dateFin;
                var nbJour = DateService.getNbJoursEntreDeuxDate(facture.dateDebut, facture.dateFin);
                var nbMois = MathService.divide(nbJour, MathService.divide(365, 12));
                var volume = facture.volume;
                var volumeMoyMois = MathService.divide(volume, nbMois);
                var volumeMoyJour = MathService.divide(volume*1000, nbJour);
                var montant = facture.montantTTC;
                var prixMoyMois = MathService.divide(montant, nbMois);

                var donnees = { dateDebut: dateDebut, dateFin: dateFin, nbJour: nbJour, volume:volume ,volumeMoyMois:volumeMoyMois, volumeMoyJour:volumeMoyJour, prixMoyMois:prixMoyMois, montant:montant};
                $scope.donnees.push(donnees);


            });
            $scope.initDonneesGraphique();

        };

        $scope.initDonneesGraphique = function() {

            $scope.data = new Array();
            $scope.series = new Array();
            $scope.labels = new Array();
            var tabConso = new Array();

            //debut date premiere facture
            angular.forEach($scope.donnees.reverse(), function(donnee) {
                //init données du graphique
                if(donnee.volumeMoyJour != undefined) {
                    var label = new Date(donnee.dateDebut).toLocaleDateString() + " - " + new Date(donnee.dateFin).toLocaleDateString()
                    $scope.labels.push(label);
                    var volMois = Math.round(donnee.volumeMoyMois*1000)
                    tabConso.push(volMois);
                }


            });
            $scope.series.push('Evolution');
            $scope.data.push(tabConso);



        };

        $scope.getAllFactures = function() {
            FactureEau.query().$promise.then(
                function(data) {
                    $scope.factures = data;
                    $scope.initDonnees();
                },
                function(error) {
                    console.log("getAllFactures", error);
                }
            )
        };

        $scope.getAllFactures();


    });


}());