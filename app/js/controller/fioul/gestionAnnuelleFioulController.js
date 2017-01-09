/**
 * Created by thomas on 30/07/2014.
 *
 * Controller pour la gestion annuelle
 */

(function () {

    var GestionAnnuelleController = appControllers.controller("GestionAnnuelleFioulController", function($scope, $timeout, ReleveFioulService, FactureFioulService, MathService, DateService) {

        $scope.releves=null;
        //l'annee est positionnee sur l'annee en cours pour le tableau
        $scope.anneeEnCours = DateService.getCurrentDateAAAAMM().substring(0,4);
        //le tableau des donnees anuelle a afficher
        $scope.donneesAnnuelles = new Array();

        //le tableau des sommes et moyenne globales
        $scope.sommesEtMoy = new Array();

        //liste des annees pour les comparaison (case a cocher)
        //TODO a gerer dynamiquement
        $scope.anneesGraph = [  { checked:true, annee:'2015', index:1}, {checked:true, annee:'2016', index:2}, {checked:true, annee:'2017', index:2}];

        $scope.initDonneesAnnuelles = function(annee) {

        	//reset du tableau des sommes et moyenne globales
            $scope.sommesEtMoy[annee] = {sommeConso:0, moyenneConsoJour:0, sommeMontantConso:0,  moyennePrixJour:0};

        	if(annee.length == 4 ){
	        	$scope.donneesAnnuelles[annee] = new Array();
	        	var relevesDuMois = null;
	        	for(var i=1; i<13 ;i++ ){
	        		var donnees = { indexMois: i, mois :(i<10)?"0"+i:i, libMois :DateService.getLibelleMonth(i) }
                    //insertion
                    $scope.donneesAnnuelles[annee].push(donnees);
	        		$scope.initDonneesDuMois(donnees.indexMois, annee);
	        	}
        	}
        };

        //init des donnees lies au releves
        $scope.initDonneesDuMois = function(indexMois, annee) {

        	var mois = (indexMois<10)?"0"+indexMois:indexMois;
        	var anneeMois = annee + mois;
            ReleveFioulService.getReleveAnneeMois(anneeMois, function(data) {
            	$scope.donneesAnnuelles[annee][indexMois-1].releves = data;
                $scope.donneesAnnuelles[annee][indexMois-1].consoTotale = 0;
            	var donneeMois=null;
                if(data.length > 1){
                	donneeMois = $scope.donneesAnnuelles[annee][indexMois-1];
                	donneeMois.conso = MathService.subtract(data[0].volume,data[data.length-1].volume) ;
                	donneeMois.nbJour= DateService.getNbDaysInMonth(indexMois, annee);
                 	donneeMois.consoJour=MathService.divide( donneeMois.conso , donneeMois.nbJour );
                 	//maj sommes et moyennes
                    var donneesSomme = $scope.sommesEtMoy[annee];
                    donneesSomme.sommeConso = MathService.add(donneesSomme.sommeConso, donneeMois.conso);
                    donneesSomme.nbJour = MathService.add(donneesSomme.nbJour, donneeMois.nbJour);
                    donneesSomme.moyenneConsoJour = MathService.divide(donneesSomme.sommeConso, donneesSomme.nbJour);
                    //init des donnees lie au tarifs
                    $scope.initDonneesTarifDuMois(anneeMois, indexMois, annee);
                }
            })
        };

        //init des donnees lie au tarifs
        $scope.initDonneesTarifDuMois = function(anneeMois, indexMois, annee) {
        	
        	//recuperer la facture correspondante au mois (derniere facture precedent le mois)
        	FactureFioulService.getFactureAnneeMois(anneeMois, function(data) {
            	var donneeMois=null;
            	if(data.length > 0){
            		donneeMois = $scope.donneesAnnuelles[annee][indexMois-1];
            		donneeMois.facture = data[0];
            		donneeMois.montant = MathService.multiply( donneeMois.conso, donneeMois.facture.prixUnitaire );
                    donneeMois.prixJour=MathService.divide( donneeMois.montant , donneeMois.nbJour );
                    //calcul des sommes et moyennes liees au tarifs
                    var donneesSomme = $scope.sommesEtMoy[annee];
                    donneesSomme.sommeMontantConso = MathService.add(donneesSomme.sommeMontantConso, donneeMois.montant);
                    donneesSomme.moyennePrixJour = MathService.divide(donneesSomme.sommeMontantConso, donneesSomme.nbJour);
            	}
            })
        };

        //change l'annee en cours, pas d'impact sur le graphique
        $scope.changeAnnee = function() {
            //recharge les donnees
            $scope.anneeEnCours = ""+$scope.dt.getFullYear()+"";
          	$scope.initDonneesAnnuelles($scope.anneeEnCours);
        };


        //maj donnees du graphique
        $scope.updateGraphique = function(anneesList) {

            if(anneesList != undefined && anneesList != null){
                //reset des donnees du graphique
                $scope.data = new Array();
                $scope.series = new Array();
                $scope.labels = new Array();
                angular.forEach(anneesList, function(annee) {
                    if(annee.checked){
                        var anneeEnCours = annee.annee;
                        var tabConso = new Array();
                        //si les donnees en cache sont presentes
                        if ($scope.donneesAnnuelles[anneeEnCours] != undefined) {
                            //parcours les mois
                            for (var i = 1; i < 13; i++) {
                                var mois = (i < 10) ? "0" + i : i;
                                var consoTotaleMois = ($scope.donneesAnnuelles[anneeEnCours][i - 1].conso != undefined) ? $scope.donneesAnnuelles[anneeEnCours][i - 1].conso : 0;
                                if ($scope.labels[i-1] == undefined ) {
                                    $scope.labels.push(DateService.getLibelleMonth(mois));
                                }
                                tabConso.push( consoTotaleMois );
                            }
                            $scope.data.push(tabConso);
                            $scope.series.push(anneeEnCours);

                        }                        
                    }
                });
            }
        };

        //charge toute les années checked
        angular.forEach($scope.anneesGraph, function(annee) {
            $scope.initDonneesAnnuelles(annee.annee);
        });

        //chargement 1 seconde apres                
        $timeout(function() {
        	//chargement du graphique avec l'annee en cours
            $scope.updateGraphique($scope.anneesGraph );
            //chargement des autres annees que l'annee en cours en cache
            angular.forEach($scope.anneesGraph, function(annee) {
            	$scope.initDonneesAnnuelles(annee.annee);
            });            
        }, 1000);

        //ajouter ou supprime l'annee sur le graphique
        $scope.gererCase = function() {
        	//ajouter ou supprime l'annee sur le graphique
            $scope.updateGraphique($scope.anneesGraph);
        }

        //gestion du year picker

        //initialise a la date du jour
        $scope.dt = new Date();
        $scope.showWeeks = false;
        //evenement ouverture du monthpicker
        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };
        //option du month picker
        $scope.dateOptions = { 'year-format': "'yy'",  'starting-day': 1,  'datepicker-mode':"'year'",  'min-mode':"year"	};

    });


}());