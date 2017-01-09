/**
 * Created by thomas on 03/08/2015.
 *
 * Controller pour la gestion Journaliere
 */

(function () {

    var GestionJournaliereController = appControllers.controller("GestionJournaliereController", function($scope, $timeout, ReleveService, TarifService, MathService, DateService) {

        $scope.releves=null;
        //l'annee est positionné sur l'annee en cours pour le tableau
        $scope.jourEnCours = DateService.getCurrentDateAAAAMMJJ();
        $scope.libJour = new Date().toLocaleDateString();
        //le tableau des donnees anuelle � afficher
        $scope.donneesJournaliere = new Array();

        //le tableau des sommes et moyenne globales
        $scope.sommesEtMoy = new Array();

        $scope.initDonneesjournaliere = function(dateList, reset) {

            angular.forEach(dateList, function(date, key) {

                //reset du tableau des sommes et moyenne globales
                $scope.sommesEtMoy[date] = {sommeConsoHP: 0, sommeConsoHC: 0, sommeConsoTotale: 0, pourcentageMoyen: 0, sommePrixJour: 0};

                //si pas deja en cache
                if ($scope.donneesJournaliere[date] == undefined || $scope.donneesJournaliere[date] == null) {

                    if (date.length == 8) {
                        $scope.donneesJournaliere[date] = new Array();
                        var relevesJour = null;

                        ReleveService.getReleveMySqlAnneeMoisJour(date.substring(0, 6), date.substring(6, 8)).then(function (data) {

                            //pour chaque heure
                            for (var i = 0; i < 24; i++) {
                                var donnees = { indexHeure: i, libHeure: i + "h00-" + i + "h59"};
                                $scope.donneesJournaliere[date].push(donnees);
                                var consoHeure = getConsoHeure(data, date, i);
                                $scope.initDonneesDuJour(donnees.indexHeure, date, consoHeure.consoHP, consoHeure.consoHC);
                            }
                            //maj graphique
                            $scope.updateGraphique(dateList, reset);
                        });
                    }
                }else{
                    //pour chaque heure
                    for (var i = 0; i < 24; i++) {
                       $scope.initDonneesDuJour(i, date, $scope.donneesJournaliere[date][i].consoHP, $scope.donneesJournaliere[date][i].consoHC);
                    }
                    $scope.updateGraphique(dateList, reset);


                }
            });
        };





        //init des donnees lies au releves
        $scope.initDonneesDuJour = function(indexHeure, date, consoHP, consoHC) {

            //$scope.donneesJournaliere[date][indexHeure].releves = data;
            $scope.donneesJournaliere[date][indexHeure].consoTotale = 0;
            var donneeJour=null;
            if(consoHP != null && consoHC != null){

                donneeJour = $scope.donneesJournaliere[date][indexHeure];
                donneeJour.consoHP = consoHP;
                donneeJour.consoHC = consoHC ;
                donneeJour.consoTotale = MathService.add(donneeJour.consoHP, donneeJour.consoHC);
                donneeJour.pourcentageHC = MathService.divide( donneeJour.consoHC , donneeJour.consoTotale );

                //maj sommes et moyennes
                var donneesSomme = $scope.sommesEtMoy[date];
                donneesSomme.sommeConsoHP = MathService.add(donneesSomme.sommeConsoHP, donneeJour.consoHP);
                donneesSomme.sommeConsoHC = MathService.add(donneesSomme.sommeConsoHC, donneeJour.consoHC);
                donneesSomme.sommeConsoTotale = MathService.add(donneesSomme.sommeConsoTotale, donneeJour.consoTotale);
                donneesSomme.pourcentageMoyen = MathService.divide(donneesSomme.sommeConsoHC, donneesSomme.sommeConsoTotale);
                //init des donnees lie au tarifs

                var annee = date.substring(0,4);
                var mois = date.substring(4,6);
                var jour = date.substring(6,8);
                var timestamp = DateService.getTimestampDate(annee, mois, jour, 2,0,1  );
                $scope.initDonneesTarifDuMois(timestamp , date, indexHeure);

            }

        };

        //init des donnees lie au tarifs
        $scope.initDonneesTarifDuMois = function(timestamp, date, indexHeure) {
            TarifService.getTarifDate(timestamp, function(data) {
                var donneeHeure=null;
                if(data.length > 0){
                    donneeHeure = $scope.donneesJournaliere[date][indexHeure];
                    donneeHeure.tarif = data[0];
                    //init avec le cout des HP
                    var prixConso = MathService.multiply( MathService.divide(donneeHeure.consoHP,1000), donneeHeure.tarif.tarifHP );
                    //ajout du cout des HC
                    prixConso += MathService.multiply( MathService.divide(donneeHeure.consoHC,1000), donneeHeure.tarif.tarifHC );
                    donneeHeure.coutHoraire = prixConso;

                    //calcul des sommes et moyennes liees au tarifs
                    var donneesSomme = $scope.sommesEtMoy[date];
                    donneesSomme.sommePrixJour = MathService.add(donneesSomme.sommePrixJour, donneeHeure.coutHoraire);
                }
            })
        };

        //change l'annee en cours, pas d'impact sur le graphique
        $scope.changeJour = function() {
            //recharge les donnees
            $scope.jourEnCours = DateService.getDateAAAAMMJJ($scope.dt);
            $scope.dtCompare = null
           // $scope.jourComparaison = DateService.getDateAAAAMMJJ($scope.dtCompare);
            $scope.libJour =$scope.dt.toLocaleDateString();
            var tabdate =new Array($scope.jourEnCours);
            $scope.initDonneesjournaliere(tabdate, true);
        };

        //maj donnees du graphique
        $scope.updateGraphique = function(dateList, reset) {

            if(reset == true){
                $scope.data = new Array();
                $scope.series = new Array();
                $scope.labels = new Array();
            }
            angular.forEach(dateList, function(date) {
                //si les donnees en cache sont presentes
                if ($scope.donneesJournaliere[date] != undefined) {
                    //parcours les heures
                    var tabConso = new Array();
                    for (var i = 0; i < 24; i++) {
                        var heure = (i < 10) ? "0" + i : i;
                        var consoTotaleHeure = ($scope.donneesJournaliere[date][i].consoTotale != undefined) ? $scope.donneesJournaliere[date][i].consoTotale : 0;

                        if ($scope.labels[i] == undefined ) {
                            $scope.labels.push(heure+"h");
                            tabConso.push( consoTotaleHeure );
                          } else {
                            tabConso.push( consoTotaleHeure );
                        }
                    }
                    $scope.data.push(tabConso);
                    $scope.series.push(DateService.getDateFrance(date));
                }
            });
        };

        //fin gestion du graphique
        $scope.initDonneesjournaliere(new Array($scope.jourEnCours), true);

        //gestion du year picker

        //initialise a la date du jour
        $scope.dt = new Date();
        $scope.showWeeks = false;

        //initialisation datepicker
        $scope.open = function($event, opened) { $event.preventDefault();  $event.stopPropagation(); $scope[opened] = true;  };
        //option du datepicker
        $scope.dateOptions = { 'year-format': "'yyyy'",  'starting-day': 1,  'datepicker-mode':"'day'",  'min-mode':"day"	};

        // Retour le premier releve de l'heure dans la plage de minute 0-10 et le dernier releve de la plage de minute 50-59
        function getConsoHeure(releves, date, indexHeure){

            var annee = date.substring(0,4);
            var mois = date.substring(4,6);
            var jour = date.substring(6,8);

            var timestampPlageMinDebut = DateService.getTimestampDate( annee, mois-1, jour, indexHeure, 0,0);
            var timestampPlageMinFin = DateService.getTimestampDate( annee, mois-1, jour, indexHeure, 10,59);

            var timestampPlageMaxDebut = DateService.getTimestampDate( annee, mois-1, jour, indexHeure, 49 ,0);
            var timestampPlageMaxFin = DateService.getTimestampDate( annee, mois-1, jour, indexHeure, 59 ,59);
            var relevesHeure =  new Array();

            var firstReleveHeure = null;
            var lastReleveHeure = null;

            var precReleveCalculInterval=null;
            var suivReleveCalculInterval=null;

            angular.forEach(releves, function(releve, key) {

                // on n'ajoute que les releves fait dans les intervalles 0-10 et 50-59
                if( releve.dateHeure >= timestampPlageMinDebut && releve.dateHeure <= timestampPlageMinFin
                    && (firstReleveHeure == null || firstReleveHeure.dateHeure > releve.dateHeure )){
                        firstReleveHeure = releve;
                }
                else if(releve.dateHeure >= timestampPlageMaxDebut && releve.dateHeure <= timestampPlageMaxFin
                    && (lastReleveHeure == null || lastReleveHeure.dateHeure < releve.dateHeure)){
                        lastReleveHeure = releve;
                }

                //recherche du releve precedent l'heure au cas ou releve absent
                if(releve.dateHeure < timestampPlageMinDebut &&
                    (precReleveCalculInterval == null || releve.dateHeure > precReleveCalculInterval.dateHeure)){
                    precReleveCalculInterval = releve;
                }

                //recherche du releve suivant l'heure au cas ou releve absent
                if(releve.dateHeure > timestampPlageMaxFin &&
                    (suivReleveCalculInterval == null || releve.dateHeure < suivReleveCalculInterval.dateHeure  )){
                    suivReleveCalculInterval = releve;
                }

            });

            var consoHP =0;
            var consoHC =0;
            if(firstReleveHeure != null && lastReleveHeure != null){
                consoHP = MathService.subtract(lastReleveHeure.indexHP,firstReleveHeure.indexHP) ;
                consoHC = MathService.subtract(lastReleveHeure.indexHC,firstReleveHeure.indexHC) ;
            }
            else if(precReleveCalculInterval!=null && suivReleveCalculInterval != null){


                //calcul l'intervalle entre les 2 releves en nombre d'heure
                var nbHeureinterval = DateService.getNbHeureEntreDeuxDate(precReleveCalculInterval.dateHeure, suivReleveCalculInterval.dateHeure);
                //la consommation correspond a la soustraction des 2 releves divisé par le nombre d'heure en interval
                consoHP = MathService.subtract(suivReleveCalculInterval.indexHP,precReleveCalculInterval.indexHP) ;
                consoHP = MathService.divide(consoHP, parseInt(nbHeureinterval));
                consoHC = MathService.subtract(suivReleveCalculInterval.indexHC,precReleveCalculInterval.indexHC);
                consoHC = MathService.divide(consoHC, parseInt(nbHeureinterval));
             }



            return {consoHP : consoHP, consoHC :  consoHC };
        }


        //change l'annee en cours, pas d'impact sur le graphique
        $scope.compare = function() {
            //charg les donnes du jour à comparer
            $scope.jourEnCours = DateService.getDateAAAAMMJJ($scope.dt);
            $scope.jourComparaison = DateService.getDateAAAAMMJJ($scope.dtCompare);
            //TODO resoudre pb lié au timezone
            $scope.jourComparaison++;
            $scope.jourComparaison = $scope.jourComparaison.toString();
            var tabdate =new Array($scope.jourEnCours, $scope.jourComparaison);
            $scope.initDonneesjournaliere(tabdate, true);
        };

    });


}());