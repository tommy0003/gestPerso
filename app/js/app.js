'use strict';

// Declare app level module which depends on filters, and services
var myApp  =angular.module('myApp', [
  'ngRoute',
  'chart.js',
  'angularFileUpload',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'ui.bootstrap'

]).
config(['$routeProvider', function($routeProvider) {

  //ecran d'authentification
  $routeProvider.when("/login", { templateUrl: "partials/login.html", controller: "LoginController"});

  //gestion elecricite
  $routeProvider.when('/relevesGestion', {templateUrl: '../partials/electricite/releves/relevesGestion.html', controller: 'RelevesController'});
  $routeProvider.when('/tarifsGestion', {templateUrl: '../partials/electricite/tarifs/tarifsGestion.html', controller: 'TarifsController'});
  $routeProvider.when('/facturesGestion', {templateUrl: '../partials/electricite/factures/facturesGestion.html', controller: 'FacturesController'});
  $routeProvider.when('/gestionMensuelle', {templateUrl: '../partials/electricite/gestionMensuelle/gestionMensuelle.html', controller: 'GestionMensuelleController'});
  $routeProvider.when('/gestionAnnuelle', {templateUrl: '../partials/electricite/gestionAnnuelle/gestionAnnuelle.html', controller: 'GestionAnnuelleController'});
  $routeProvider.when('/prochaineFacture', {templateUrl: '../partials/electricite/prochaineFacture/prochaineFacture.html', controller: 'ProchaineFactureController'});
  $routeProvider.when('/gestionJournaliere', {templateUrl: '../partials/electricite/gestionJournaliere/gestionJournaliere.html', controller: 'GestionJournaliereController'});
  //gestion eau
  $routeProvider.when('/facturesEauGestion', {templateUrl: '../partials/eau/facturesEau/facturesEauGestion.html', controller: 'FacturesEauController'});
  $routeProvider.when('/gestionEauAnnuelle', {templateUrl: '../partials/eau/gestionAnnuelleEau/gestionAnnuelleEau.html', controller: 'GestionAnnuelleEauController'});
  //gestion fioul
  $routeProvider.when('/relevesFioulGestion', {templateUrl: '../partials/fioul/relevesFioul/relevesFioulGestion.html', controller: 'FacturesFioulController'});
  $routeProvider.when('/facturesFioulGestion', {templateUrl: '../partials/fioul/facturesFioul/facturesFioulGestion.html', controller: 'FacturesEauController'});
  $routeProvider.when('/gestionFioulAnnuelle', {templateUrl: '../partials/fioul/gestionAnnuelleFioul/gestionAnnuelleFioul.html', controller: 'GestionAnnuelleFioulController'});

  $routeProvider.otherwise({redirectTo: '/relevesGestion'});
}]);

var appControllers = angular.module('myApp.controllers', []);

//verification de l'authentification en cas de changement de route
myApp.run(['$rootScope', '$location', 'authenticationSvc', function ($rootScope, $location, authenticationSvc) {
    $rootScope.$on('$routeChangeStart', function (event) {
        var userInfo = authenticationSvc.getUserInfo();
        if (userInfo) {
            console.log('ALLOW');
            $rootScope.userInfo = userInfo;
        } else {
            console.log('DENY');
            event.preventDefault();
            $rootScope.userInfo = {};
            $location.path('/login');
        }
    });
}]);