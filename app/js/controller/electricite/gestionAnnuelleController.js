/**
 * Created by thomas on 30/07/2014.
 *
 * Controller pour la gestion annuelle
 */

(function () {

    var GestionAnnuelleController = appControllers.controller("GestionAnnuelleController", function($scope, $timeout, ReleveService, TarifService, MathService, DateService) {

        $scope.releves=null;
        //l'annee est positionné sur l'annee en cours pour le tableau
        $scope.anneeEnCours = DateService.getCurrentDateAAAAMM().substring(0,4);
        //le tableau des donnees anuelle � afficher
        $scope.donneesAnnuelles = new Array();

        //le tableau des sommes et moyenne globales
        $scope.sommesEtMoy = new Array();

        //liste des annees pour les comparaison (case a cocher)
        //TODO a gerer dynamiquement
        $scope.anneesGraph = [  {checked:true, annee:'2015', index:1}, {checked:true, annee:'2016', index:2}, {checked:true, annee:'2017', index:3}];
        $scope.initDonneesAnnuelles = function(annee) {
            //si pas deja en cache
            if($scope.donneesAnnuelles[annee] == undefined || $scope.donneesAnnuelles[annee] == null) {
                //reset du tableau des sommes et moyenne globales
                $scope.sommesEtMoy[annee] = {sommeConsoHP: 0, sommeConsoHC: 0, sommeConsoTotale: 0, pourcentageMoyen: 0, moyenneConsoJour: 0, sommeMontantConso: 0, moyennePrixJour: 0, sommeFacture: 0, nbJour: 0};
                if (annee.length == 4) {
                    $scope.donneesAnnuelles[annee] = new Array();
                    var relevesDuMois = null;
                    ReleveService.getReleveMySqlAnneeDernierReleve(annee).then(function(data) {
                        //pour chaque mois
                        for (var i = 1; i < 13; i++) {
                            var donnees = { indexMois: i, mois: (i < 10) ? "0" + i : i, libMois: DateService.getLibelleMonth(i) };
                            $scope.donneesAnnuelles[annee].push(donnees);
                            var relevemois = getReleveMois(data, annee, i);
                            $scope.initDonneesDuMois(donnees.indexMois, annee, relevemois);
                        }
                        //chargement du graphique avec l'annee en cours
                        $scope.updateGraphique($scope.anneesGraph );
                    });
                }
            }
        };

        //init des donnees lies au releves
        $scope.initDonneesDuMois = function(indexMois, annee, data) {
        	var mois = (indexMois<10)?"0"+indexMois:indexMois;
        	var anneeMois = annee + mois;
           	$scope.donneesAnnuelles[annee][indexMois-1].releves = data;
            $scope.donneesAnnuelles[annee][indexMois-1].consoTotale = 0;
            var donneeMois=null;
            if(data.length > 1){
                donneeMois = $scope.donneesAnnuelles[annee][indexMois-1];
                donneeMois.consoHP = MathService.divide(MathService.subtract(data[data.length-1].indexHP,data[0].indexHP),1000) ;
                donneeMois.consoHC = MathService.divide(MathService.subtract(data[data.length-1].indexHC,data[0].indexHC),1000) ;
                donneeMois.consoTotale = MathService.add(donneeMois.consoHP, donneeMois.consoHC);
                donneeMois.pourcentageHC = MathService.divide( donneeMois.consoHC , donneeMois.consoTotale );
                donneeMois.nbJour= DateService.getNbDaysInMonth(indexMois, annee);
                donneeMois.consoJour=MathService.divide( donneeMois.consoTotale , donneeMois.nbJour );
                //maj sommes et moyennes
                var donneesSomme = $scope.sommesEtMoy[annee];
                donneesSomme.sommeConsoHP = MathService.add(donneesSomme.sommeConsoHP, donneeMois.consoHP);
                donneesSomme.sommeConsoHC = MathService.add(donneesSomme.sommeConsoHC, donneeMois.consoHC);
                donneesSomme.sommeConsoTotale = MathService.add(donneesSomme.sommeConsoTotale, donneeMois.consoTotale);
                donneesSomme.pourcentageMoyen = MathService.divide( donneesSomme.sommeConsoHC , donneesSomme.sommeConsoTotale );
                donneesSomme.nbJour = MathService.add(donneesSomme.nbJour, donneeMois.nbJour);
                donneesSomme.moyenneConsoJour = MathService.divide(donneesSomme.sommeConsoTotale, donneesSomme.nbJour);
                //init des donnees lie au tarifs
                $scope.initDonneesTarifDuMois(data[data.length-1].dateHeure, indexMois, annee);
            }
        };

        //init des donnees lie au tarifs
        $scope.initDonneesTarifDuMois = function(date, indexMois, annee) {
            TarifService.getTarifDate(date, function(data) {
            	var donneeMois=null;
            	if(data.length > 0){
            		donneeMois = $scope.donneesAnnuelles[annee][indexMois-1];
            		donneeMois.tarif = data[0];
                    //init avec le cout des HP
            		var prixConso = MathService.multiply( donneeMois.consoHP, donneeMois.tarif.tarifHP );
                    //ajout du cout des HC
            		prixConso += MathService.multiply( donneeMois.consoHC, donneeMois.tarif.tarifHC );
                    donneeMois.montantConso = prixConso;
                    donneeMois.prixJour=MathService.divide( donneeMois.montantConso , donneeMois.nbJour );
                    donneeMois.factureCalculee=donneeMois.montantConso+donneeMois.tarif.tarifAbo;

                    //si les donnees de l'annee precedente sont renseignés : evolution n-1
                    if($scope.donneesAnnuelles[annee-1] != undefined
                        && $scope.donneesAnnuelles[annee-1][indexMois-1] != undefined
                        && $scope.donneesAnnuelles[annee-1][indexMois-1] != null){
                        donneeMois.evolutionN1= 1 - (MathService.divide( $scope.donneesAnnuelles[annee-1][indexMois-1].consoTotale, donneeMois.consoTotale ));
                    }
                    //calcul des sommes et moyennes liees au tarifs
                    var donneesSomme = $scope.sommesEtMoy[annee];
                    donneesSomme.sommeMontantConso = MathService.add(donneesSomme.sommeMontantConso, donneeMois.montantConso);
                    donneesSomme.moyennePrixJour = MathService.divide(donneesSomme.sommeMontantConso, donneesSomme.nbJour);
                    donneesSomme.sommeFacture = MathService.add(donneesSomme.sommeFacture, donneeMois.factureCalculee);
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

            $scope.data = new Array();
            $scope.series = new Array();
            $scope.labels = new Array();
            if(anneesList != undefined && anneesList != null){

                angular.forEach(anneesList, function(annee) {
                    if(annee.checked){
                        var anneeCourante = annee.annee;
                        //reset des donnees du graphique
                        var tabConso = new Array();
                        //si les donnees en cache sont presentes
                        if ($scope.donneesAnnuelles[anneeCourante] != undefined && $scope.donneesAnnuelles[anneeCourante].length > 0) {
                            //parcours les mois
                            for (var i = 1; i < 13; i++) {
                                var mois = (i < 10) ? "0" + i : i;
                                var consoTotaleMois = ($scope.donneesAnnuelles[anneeCourante][i - 1].consoTotale != undefined) ? $scope.donneesAnnuelles[anneeCourante][i - 1].consoTotale : 0;
                                //ajout des libellé des mois
                                if ($scope.labels[i-1] == undefined ) {
                                    $scope.labels.push(DateService.getLibelleMonth(mois));
                                }
                                tabConso.push( consoTotaleMois );
                            }
                            $scope.data.push(tabConso);
                            $scope.series.push(anneeCourante);
                        }
                    }
                });
            }
        };
        //fin gestion du graphique

        //charge toute les années checked
        angular.forEach($scope.anneesGraph, function(annee) {
            $scope.initDonneesAnnuelles(annee.annee);
        });

        //ajouter ou supprime l'annee sur le graphique
        $scope.gererCase = function() {
        	//ajouter ou supprime l'annee sur le graphique
            $scope.updateGraphique($scope.anneesGraph);
        };

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


        function getReleveMois(releves, annee, mois){

            mois--;
            var timestampMin = DateService.getTimestampDate( annee, mois,1, 0, 1, 0);
            var timestampMax = DateService.getTimestampDate( annee, mois, DateService.getNbDaysInMonth(mois+1,annee ), 23, 59 , 59);
            var releveMois =  new Array();
            angular.forEach(releves, function(releve, key) {
                if( releve.dateHeure >= timestampMin && releve.dateHeure <= timestampMax){
                    releveMois.push(releve);
                }
            });
            return releveMois;
        }

    });


}());