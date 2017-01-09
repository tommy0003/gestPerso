
/**
 * Created by thomas on 08/08/2014.
 *
 * Controller pour le decorateur
 */

(function () {

    //controller sur la page principal
    var headerController = appControllers.controller("HeaderController", function($scope, $location, authenticationSvc) {

        //gere la surbrillance des element du menu
        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };

        //deconnecte l'utilisateur
        $scope.logout = function () {
            authenticationSvc.logout()
                .then(function (result) {
                    $scope.userInfo = null;
                    $location.path("/login");
                }, function (error) {
                    console.log(error);
                });
        };
        //verifie si un autilisateur est connecte
        $scope.isAuthentifie = function () {
            return authenticationSvc.getUserInfo() != null;
        };

    });

    //controller page de login
    appControllers.controller("LoginController", ["$scope", "$location", "authenticationSvc",function ($scope, $location, authenticationSvc) {
        $scope.userInfo = null;
        $scope.invalid = false;

        //connection de l'utilisateur
        $scope.login = function () {
            authenticationSvc.login($scope.userName, $scope.password)
                .then(function (result) {
                    $scope.userInfo = result;
                    $location.path("/");
                }, function (error) {
                    $scope.invalid = true;
                    console.log(error);
                });
        };

        //reset du formulaire d'identification
        $scope.cancel = function () {
            $scope.userName = "";
            $scope.password = "";
        };
    }]);

}());
