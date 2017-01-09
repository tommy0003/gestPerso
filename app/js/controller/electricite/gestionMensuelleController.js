/**
 * Created by thomas on 21/07/2014.
 *
 * Controller pour la gestion mensuelle
 */

(function () {

    var GestionMensuelleController = appControllers.controller("GestionMensuelleController", function($scope, ReleveService, TarifService, MathService, DateService) {

        $scope.releves=null;
        $scope.firstReleve=null;
        $scope.tarifApplique=null;
        //l'annee mois est positionné sur le mois en cours
        $scope.anneeMoisEnCours = DateService.getCurrentDateAAAAMM();

        $scope.getRelevesDuMois = function(anneeMois) {

            ReleveService.getReleveMySqlAnneeMoisDernierReleve(anneeMois).then(function(data) {
                $scope.releves = data;
                if(data.length > 0){
                    $scope.firstReleve = data[0];
                    //le tarif appliqué est celui du premier relevé
                    $scope.getTarifApplicable($scope.firstReleve.dateHeure);
                    //initialise les données du graphique
                    $scope.initGraphique();
                }
            });
        };


        $scope.getTarifApplicable = function(date) {
            TarifService.getTarifDate(date, function(data) {
                $scope.tarifApplique = data[0];
            })
        };

        $scope.getRelevesDuMois($scope.anneeMoisEnCours);

        //detecte si le releve en cours est le premiere du mois
        $scope.isFirstReleve = function(releve){
            return  $scope.firstReleve != null &&  releve == $scope.firstReleve
        };

        //initialise les données mensuelle
        $scope.initDonneesMensuelle = function(){
            var annee = $scope.anneeMoisEnCours.substring(0,4);
            var mois = $scope.anneeMoisEnCours.substring(4,6);
            $scope.libelleAnneeMois = DateService.getLibelleMonth(mois) + " "+annee;
            $scope.nbJourDuMois = DateService.getNbDaysInMonth(mois, annee);
        };
        $scope.initDonneesMensuelle();

        // retourne la consommation HP depuis le dernier releve
        $scope.consoHPJour = function(releve){
            var index = $scope.releves.indexOf(releve) - 1;
            return (index > 0) ? MathService.subtract($scope.consoHPCumul(releve), $scope.consoHPCumul($scope.releves[index])) : $scope.consoHPCumul(releve);
        };

        // retourne la consommation HP depuis le dernier releve
        $scope.consoHCJour = function(releve){
            var index = $scope.releves.indexOf(releve) - 1;
            return (index > 0) ? MathService.subtract($scope.consoHCCumul(releve), $scope.consoHCCumul($scope.releves[index])) : $scope.consoHCCumul(releve);
        };

        // retourne la consommation HP depuis le dernier releve
        $scope.consoTotaleJour = function(releve){
            return MathService.add($scope.consoHPJour(releve), $scope.consoHCJour(releve));
        };

        //consommation HP
        $scope.consoHPCumul = function(releve){return ($scope.isFirstReleve(releve)) ? "---" : MathService.divide(releve.indexHP - $scope.firstReleve.indexHP,1000) ;};
        //consommation HC
        $scope.consoHCCumul = function(releve){return ($scope.isFirstReleve(releve)) ? "---" : MathService.divide(releve.indexHC - $scope.firstReleve.indexHC,1000) ;};
        //consommation totale
        $scope.consoTotaleCumul = function(releve){return ($scope.isFirstReleve(releve)) ? "---" : $scope.consoHPCumul(releve) + $scope.consoHCCumul(releve) ;};
        //pourcentage heure creuse
        $scope.pourcentageHC = function(releve){return ($scope.isFirstReleve(releve)) ? "---" : $scope.consoHCCumul(releve) / $scope.consoTotaleCumul(releve) ;};
        //consommation journaliere
        $scope.consoJour = function(releve){
            return ($scope.isFirstReleve(releve)) ? "---" : $scope.consoTotaleCumul(releve) /  new Date(releve.dateHeure).getDate()
        };

        //montant des consommation à la date du relevé
        $scope.montantConso = function(releve){

            if($scope.isFirstReleve(releve))    return "---";
            if($scope.tarifApplique != null && $scope.tarifApplique.tarifHP != null && $scope.tarifApplique.tarifHC != null  ){
                //initialise avec le prix de l'abonnement
                var prixTotal = 0;

                //calcul du cout des HP
                prixTotal += MathService.multiply( $scope.consoHPJour(releve), $scope.tarifApplique.tarifHP );
                //calcul du cout des HC
                prixTotal += MathService.multiply( $scope.consoHCJour(releve), $scope.tarifApplique.tarifHC );
                return prixTotal;
            } else{
                console.log("prixJour;erreur:pas de tarif definit à la date du 1er relevé")
            }
        };


        //montant des consommation cumulées à la date du relevé
        $scope.montantConsoCumul = function(releve){

            if($scope.isFirstReleve(releve))    return "---";
            if($scope.tarifApplique != null && $scope.tarifApplique.tarifHP != null && $scope.tarifApplique.tarifHC != null  ){
                //initialise avec le prix de l'abonnement
                var prixTotal = 0;

                //calcul du cout des HP
                prixTotal += MathService.multiply( $scope.consoHPCumul(releve), $scope.tarifApplique.tarifHP );
                //calcul du cout des HC
                prixTotal += MathService.multiply( $scope.consoHCCumul(releve), $scope.tarifApplique.tarifHC );
                return prixTotal;
            } else{
                console.log("prixJour;erreur:pas de tarif definit à la date du 1er relevé")
            }
        };



        //prix journalier
        $scope.prixJour = function(releve){
        	//jour du mois
            var nbJour = new Date(releve.dateHeure).getDate();
            return MathService.divide($scope.montantConsoCumul(releve), nbJour );
        };

        //facture estime
        $scope.factureEstime = function(releve){

            if($scope.isFirstReleve(releve))    return "---";
            if($scope.tarifApplique != null && $scope.tarifApplique.tarifAbo != null  ){
            	//abonnement + prix jour * nbJour
            	var montantConsoEstime = MathService.multiply($scope.prixJour(releve), $scope.nbJourDuMois);
                var montantFacture =  MathService.add($scope.tarifApplique.tarifAbo, montantConsoEstime);
                return montantFacture;
            } else{
               console.log("factureEstime;erreur:pas de tarif de l'abonnement definit")
            }
        };

        //change le mois en cours
        $scope.changeMois = function() {        	
        	$scope.anneeMoisEnCours = DateService.getDateAAAAMM($scope.dt);
            //recharge les releves
            $scope.getRelevesDuMois($scope.anneeMoisEnCours);
            $scope.initDonneesMensuelle();
            $scope.updateGraphique();
        };



        //gestion du graphique de consommation

        $scope.getRelevePrecedentOuSuivant = function(date, precedent) {
            var indexPrec=0;
            var dateHeureTemp=null;
            //regarde dans la liste le premier releve precedent
            if($scope.releves != null){
                for( var i =0;  i< $scope.releves.length; i++){
                    releve = $scope.releves[i];
                    dateHeureTemp = releve.dateHeure;
                    if(dateHeureTemp <= date) {
                        indexPrec = i;
                    }
                }
                return (precedent) ?$scope.releves[indexPrec]:$scope.releves[indexPrec+1];
            }
        };


        //consommation journaliere graphique (calcule sur la difference de 2 releve)
        $scope.consoJourGraphique = function(){

            var annee = $scope.anneeMoisEnCours.substring(0,4);
            var mois = parseInt($scope.anneeMoisEnCours.substring(4,6)) -1;
            var tabHP = new Array();
            var tabHC = new Array();
            var tabTot = new Array();
            //pour chaque jour du mois
            for(var jour = 1 ; jour <= $scope.nbJourDuMois ; jour++ ){

                // recherche des 2 releves bornant le jour du mois
                var dateEnCoursMillis = Date.parse(new Date(annee, mois, jour));
                var relevePrec = $scope.getRelevePrecedentOuSuivant(dateEnCoursMillis, true);
                var releveSuiv = $scope.getRelevePrecedentOuSuivant(dateEnCoursMillis, false);
                if(relevePrec != null && releveSuiv != null){

                    var difHP = releveSuiv.indexHP - relevePrec.indexHP;
                    var difHC = releveSuiv.indexHC - relevePrec.indexHC;
                    var nbJour = DateService.getNbJoursEntreDeuxDate(relevePrec.dateHeure, releveSuiv.dateHeure);
                    var consoHPJour = parseInt(MathService.divide(difHP, nbJour));
                    var consoHCJour = parseInt(MathService.divide(difHC, nbJour));
                    tabHP.push(consoHPJour);
                    tabHC.push(consoHCJour);
                    tabTot.push(consoHPJour+consoHCJour);
                    $scope.labels.push((jour));
                 }
            }
            $scope.series.push("HP");
            $scope.data.push(tabHP);
            $scope.series.push("HC");
            $scope.data.push(tabHC);
            $scope.series.push("Total");
            $scope.data.push(tabTot);
        };

        $scope.initGraphique = function() {

            $scope.data = new Array();
            $scope.series = new Array();
            $scope.labels = new Array();
            //donnees graphique
            $scope.consoJourGraphique();
        };
        //fin gestion du graphique
        
        
        //gestion du month picker
        
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
		$scope.dateOptions = { 'year-format': "'yy'",  'starting-day': 1,  'datepicker-mode':"'month'",  'min-mode':"month"	};

    });


}());