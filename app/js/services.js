'use strict';

/* Services */

var electrikAppServices = angular.module('myApp.services', ['ngResource']);

electrikAppServices.value('version', '0.1');

/**
 * NB: * If the parameter value is prefixed with @ then the value of that parameter will be taken from the corresponding key on the data object (useful for non-GET operations).
 */
//factory pour les relevés d'index (gere les services CRUD)
electrikAppServices.factory("Releve", function($resource) {
    return $resource("/releves/:id", {id: '@id'},{
        update: { method: 'PUT' , params: {id: '@id'}, isArray: false }
    });
});

//factory pour les tarifs (gere les services CRUD)
electrikAppServices.factory("Tarif", function($resource) {
    return $resource("/tarifs/:id", {id: '@id'},{
        update: { method: 'PUT' , params: {id: '@id'}, isArray: false }
    });
});

//factory pour les factures (gere les services CRUD)
electrikAppServices.factory("Facture", function($resource) {
    return $resource("/factures/:id", {id: '@id'},{
        update: { method: 'PUT' , params: {id: '@id'}, isArray: false }
    });
});

//factory pour les factures d'eau (gere les services CRUD)
electrikAppServices.factory("FactureEau", function($resource) {
    return $resource("/facturesEau/:id", {id: '@id'},{
        update: { method: 'PUT' , params: {id: '@id'}, isArray: false }
    });
});

//factory pour les relevés de fioul (gere les services CRUD)
electrikAppServices.factory("ReleveFioul", function($resource) {
    return $resource("/relevesFioul/:id", {id: '@id'},{
        update: { method: 'PUT' , params: {id: '@id'}, isArray: false }
    });
});

//factory pour les factures de fioul (gere les services CRUD)
electrikAppServices.factory("FactureFioul", function($resource) {
    return $resource("/facturesFioul/:id", {id: '@id'},{
        update: { method: 'PUT' , params: {id: '@id'}, isArray: false }
    });
});


//services autre que CRUD liés au releves
electrikAppServices.service("ReleveService", function($resource, $http, $q) {

    //recuperation de la liste des releves sur un mois (mois : AAAAMM)
    var releveRessourceMois = $resource("/relevesMois/:anneeMois", {anneeMois: 'anneeMois'},{  });
    this.getReleveAnneeMois = function(anneeMois, callback) {
        releveRessourceMois.query({anneeMois:anneeMois}).$promise.then(function(data) {
            callback(data);
        }, function(error) { console.log("ReleveService.getReleveAnneeMois;erreur de connection")});
    };

    /** Fonction pour récupérer tous les produits de la base Mysql
     *  stocker sur le serveur distant free
     * **/
    this.getReleveMySql = function() {
        return $http.get('http://futuramahouse.free.fr/teleinformation/apiTeleInfo.php').then(function(result) {
              return result.data;
        });
    };


    //liste des releve d'un mois
    this.getReleveMySqlAnneeMois = function(anneeMois) {
        return $http.get('http://futuramahouse.free.fr/teleinformation/apiTeleInfo.php?anneeMois='+anneeMois).then(function(result) {
            return result.data;
        });
    };
    //liste des releves dans une journee
    this.getReleveMySqlAnneeMoisJour = function(anneeMois, jour) {
        return $http.get('http://futuramahouse.free.fr/teleinformation/apiTeleInfo.php?anneeMois='+anneeMois+"&jour"+jour).then(function(result) {
            return result.data;
        });
    };

    //liste des releve d'une annee
    this.getReleveMySqlAnneeDernierReleve = function(annee) {
        return $http.get('http://futuramahouse.free.fr/teleinformation/apiTeleInfo.php?anneeMois='+annee+'00&last=1').then(function(result) {
            return result.data;
        });
    };

    //liste des releve de chaque jour d'un mois (dernier releve de chaque jour d'un mois)
    this.getReleveMySqlAnneeMoisDernierReleve = function(anneeMois) {
        return $http.get('http://futuramahouse.free.fr/teleinformation/apiTeleInfo.php?anneeMois='+anneeMois+"&last=1").then(function(result) {
            return result.data;
        });
    };

    //dernier releve d'une journee
    this.getReleveMySqlAnneeMoisJourDernierReleve = function(anneeMois, jour) {
        return $http.get('http://futuramahouse.free.fr/teleinformation/apiTeleInfo.php?anneeMois='+anneeMois+"&last=1&jour="+jour).then(function(result) {
            return result.data;
        });
    };

});


//services autre que CRUD liés au tarifs
electrikAppServices.service("TarifService", function($resource) {

    //recuperation d'un tarif applicaqle à la date en millis
    var tarifRessourceDate = $resource("/tarifDate/:date", {date: 'date'},{  });
    this.getTarifDate = function(date, callback) {
        tarifRessourceDate.query({date:date}).$promise.then(function(data) {
            callback(data);
        }, function(error) { console.log("TarifService.getTarifDate;erreur;erreur de connection")});
    };
});

//services autre que CRUD liés au releves de fioul
electrikAppServices.service("ReleveFioulService", function($resource) {

    //recuperation de la liste des releves sur un mois (mois : AAAAMM)
    var releveRessourceMois = $resource("/relevesFioulMois/:anneeMois", {anneeMois: 'anneeMois'},{  });
    this.getReleveAnneeMois = function(anneeMois, callback) {
        releveRessourceMois.query({anneeMois:anneeMois}).$promise.then(function(data) {
            callback(data);
        }, function(error) { console.log("ReleveFioulService.getReleveFioulAnneeMois;erreur de connection")});
    };

});

//services autre que CRUD liés au releves de fioul
electrikAppServices.service("FactureFioulService", function($resource) {
    //recuperation de facture correspondante au mois (mois : AAAAMM)
    var factureRessourceMois = $resource("/factureFioulMois/:anneeMois", {anneeMois: 'anneeMois'},{  });
    this.getFactureAnneeMois = function(anneeMois, callback) {
        factureRessourceMois.query({anneeMois:anneeMois}).$promise.then(function(data) {
            callback(data);
        }, function(error) { console.log("ReleveFioulService.getFactureFioulAnneeMois;erreur de connection")});
    };

});


//services transverses
electrikAppServices.service('MathService', function() {
    this.add = function(a, b) { return a + b };
    this.subtract = function(a, b) { return a - b };
    this.multiply = function(a, b) { return a * b };
    this.divide = function(a, b) {
        if(b==0) console.log("MathService.divide;erreur:division par 0");
        else return a / b;
    };
});

electrikAppServices.service('DateService', function() {

    //nombre de jour dans un mois
    this.getNbDaysInMonth = function(month,year) {
        var m = [31,28,31,30,31,30,31,31,30,31,30,31];
        if (month != 2) return m[month - 1]; //tout sauf février
        if (year%4 != 0) return m[1]; //février normal non bissextile
        if (year%100 == 0 && year%400 != 0) return m[1];  //février bissextile siècle non divisible par 400
        return m[1] + 1; //tous les autres févriers = 29 jours
    };


    this.getLibelleMonth = function(month) {
        var m = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "décembre"];
        return m[parseInt(month)-1];
    };

    //renvoi la date actuelle au format AAAAMM
    this.getCurrentDateAAAAMM = function() {
        var date = new Date().toJSON();
        var year =  date.substring(0,4);
        var month = date.substring(5,7);
        return String.prototype.concat(year, month);
    };

    //renvoi la date actuelle au format AAAAMM
    this.getCurrentDateAAAAMMJJ = function() {
        var date = new Date().toJSON();
        var year =  date.substring(0,4);
        var month = date.substring(5,7);
        var day = date.substring(8,10);
        return String.prototype.concat(year, month, day);
    };
    
    //renvoi la date en parametre au format AAAAMM
    this.getDateAAAAMM = function(date) {
        var dateStr = date.toJSON();
        var year =  dateStr.substring(0,4);
        var month = dateStr.substring(5,7);
        return String.prototype.concat(year, month);
    };

    //renvoi la date actuelle au format AAAAMM
    this.getDateAAAAMMJJ = function(date) {
        var dateStr = date.toJSON();
        var year =  dateStr.substring(0,4);
        var month = dateStr.substring(5,7);
        var day = dateStr.substring(8,10);
        return String.prototype.concat(year, month, day);
    };

    //renvoi le nombre de jour entre 2 date en millis
    this.getNbJoursEntreDeuxDate = function(d1,d2){
        var WNbJours = new Date(d2).getTime() - new Date(d1).getTime();
        return WNbJours/(1000*60*60*24);
    };

    //renvoi le nombre d'heure entre 2 date en millis
    this.getNbHeureEntreDeuxDate = function(d1,d2){
        var WNbJours = new Date(d2).getTime() - new Date(d1).getTime();
        return WNbJours/(1000*60*60);
    };
    
    //convertit un nombre de jour en millis
    this.getNbJoursEnMillis = function(nbJour){
    	return 86400000*nbJour;
    };

    //retroune le timestamp d'une date de type 201
    this.getTimestampDate = function(annee, mois, jour, heure, minute, seconde){
        var date1 = new Date(annee, mois, jour, heure, minute, seconde);
        return date1.getTime();
    };

    //renvoi la date au format AAAAMMJJ vers JJ/MM/AAAA
    this.getDateFrance = function(dateStr) {
        var year =  dateStr.substring(0,4);
        var month = dateStr.substring(4,6);
        var day = dateStr.substring(6,8);
        return String.prototype.concat(day, "/", month,"/", year);
    };
    

});



//service d'authentification
electrikAppServices.factory("authenticationSvc", ["$http","$q","$window",function ($http, $q, $window) {
    var userInfo;

    function login(userName, password) {
        var deferred = $q.defer();

        $http.post("/api/login", { userName: userName, password: password })
            .then(function (result) {
                userInfo = {
                    accessToken: result.data.access_token,
                    userName: result.data.userName
                };
                $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
                deferred.resolve(userInfo);
            }, function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    }

    function logout() {
        var deferred = $q.defer();

        $http({
            method: "POST",
            url: "/api/logout",
            headers: {
                "access_token": userInfo.accessToken
            }
        }).then(function (result) {
            userInfo = null;
            $window.sessionStorage["userInfo"] = null;
            deferred.resolve(result);
        }, function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function getUserInfo() {
        return userInfo;
    }

    function init() {
        if ($window.sessionStorage["userInfo"]) {
            userInfo = JSON.parse($window.sessionStorage["userInfo"]);
        }
    }
    init();

    return {
        login: login,
        logout: logout,
        getUserInfo: getUserInfo
    };
}]);


