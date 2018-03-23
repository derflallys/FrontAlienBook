var app= angular.module('alienbook', ["ngRoute"]);
    app.config(function ($routeProvider) {
        $routeProvider
            .when("/main",{
                controller: "MainController",
                templateUrl:  "views/main.html"
            })
            .when("/register",{
                controller: "RegisterController",
                templateUrl:  "views/register.html"
            })
            .when("/login",{
                controller: "LoginController",
                templateUrl:  "views/login.html"
            })
            .when("/listalien",{
                controller: "ListAlien",
                templateUrl:  "views/listalien.html"
            })
            .when("/alien/:username",{
                controller: "MainController",
                templateUrl:  "views/alien.html"
            })


            .otherwise({redirectTo: "/main"})
    });

app.controller('MainController', function ($scope,alienservice,$routeParams) {
    $scope.welcome = "Welcome Alien";
    var onError = function(reason) {
        $scope.error = "Could not fetch the data.";
    };

        alienservice.getAlien($routeParams.username).then(function (value) {
            $scope.alien = value;
        },onError);



});
app.controller('RegisterController',function ($scope,alienservice,$location) {
    $scope.register = "Register";
    $scope.Onregister = function (alien) {
        alienservice.register(alien).
        then(function (value) {
            $location.path("/login");
        },function (reason) { console.log(reason) });;
    };
});

app.controller('LoginController',function ($scope,alienservice) {

});

app.controller('ListAlien',function ($scope,alienservice) {
    var onError = function(reason) {
        $scope.error = "Could not fetch the data.";
    };
    alienservice.listalien().then(function (value) {
        $scope.aliens = value;
    },onError);

    $scope.search = function(username) {
        $scope.aliens = {} ;
        alienservice.searchAlien(username).then(function (value) {
            $scope.aliens = value;
        },onError)
    }

});

app.factory("alienservice", function ($http) {
    var getAlien = function (username) {
        return $http.get("http://localhost:8000/api/alien/"+username)
            .then(function (response) {
                return response.data;
            });
    };
    
    var register = function (alien) {
     return   $http.post("http://localhost:8000/api/register",alien,{method:"POST",headers : {'Content-Type': 'application/json'}})
    };

    var login = function (alien) {
        $http.post("http://localhost:8000/api/login",alien).then(function (value) {
            return value;
        });
    };
    var listalien =function () {
       return $http.get("http://localhost:8000/api/aliens")
            .then(function (response) {
                return response.data;
            });
    } ;

    var searchAlien = function (username) {
        return $http.get("http://localhost:8000/api/search/"+username)
            .then(function (response) {
                return response.data;
            });
    };

    return {
        getAlien: getAlien,
        register: register,
        login: login,
        listalien: listalien,
        searchAlien: searchAlien
    };
});


