var app= angular.module('alienbook', ["ngRoute","ngCookies"]);

    app.config(function ($routeProvider,$locationProvider) {
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
                controller: "ProfileController",
                templateUrl:  "views/alien.html"
            })
            .when("/logout",{
                controller: "MainController",
                templateUrl:  "views/alien.html"
            })
            .when("/edit",{
                controller: "ProfileController",
                templateUrl:  "views/edit.html"
            })

            .otherwise({redirectTo: "/main"});
        $locationProvider.html5Mode(true)
    });

app.controller('MainController', function ($scope,alienservice,$cookies,$routeParams,$route,$location) {
    $scope.welcome = "Welcome Alien";
    var onError = function(reason) {
        $scope.error = "Could not fetch the data.";
    };
    if($cookies.get('alien'))
        $scope.username = $cookies.get('alien').replace(/['"]+/g, '');
    else
        $scope.username ='';

    $scope.Onlogout = function () {
        $cookies.remove('token');
        $cookies.remove('alien');
        $location.path('/');
    };

    $scope.profile = function (username) {
        alienservice.getAlien(username).then(function (value) {
            $scope.user = value;
            console.log(value);
        },onError);
    }


});

app.controller('ProfileController',function ($scope,alienservice,$routeParams,$location) {
    var onError = function(reason) {
        $scope.error = "Could not fetch the data.";
    };

    alienservice.getAlien($routeParams.username).then(function (value) {
        $scope.user = value;
    },onError);
    $scope.myfriend = function () {
        alienservice.getFriends().then(function (value) {
            $scope.friends = value;
            console.log(value);
        },onError);
    };

    $scope.remove = function (id) {
        console.log(id);
        alienservice.removeFriend(id).then(function (value) {
            $scope.friends = value;
        })
    };

    $scope.edit = function () {

        console.log($scope.user);
        $location.path("/edit");
    }

    $scope.Onedit = function (alien) {

        alienservice.editProfile(alien).then(function (value) {
            $scope.user = value;
        },onError);
    }
});

app.controller('RegisterController',function ($scope,alienservice,$location) {
    $scope.register = "Register";
    var onError = function(reason) {
        $scope.error = "Could not fetch the data.";
    };
    $scope.Onregister = function (alien) {
        alienservice.register(alien).then(function (value) {

            console.log(value);
            $location.path("/login");
        },onError);
    };
});

app.controller('LoginController',function ($scope,alienservice,$location,$cookies,$cookieStore,$route) {
    $scope.token ='';

    $scope.Onlogin =function (alien) {
        alienservice.login(alien).then(function (value) {
            console.log(value);

            $cookieStore.put('token',value.data.token);
            $cookieStore.put('alien',value.data.alien.username);
            $scope.token  = $cookies.get('token');
            console.log('dans login');
            console.log($scope.token);

            $location.path("/main");

        },function (reason) { console.log(reason) });
    };

});

app.controller('ListAlien',function ($scope,alienservice,$cookies,$location) {
    $scope.error = "";
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
    };
    $scope.me_username = $cookies.get('alien').replace(/['"]+/g, '');
    console.log($scope.me_username);
    $scope.add = function (username) {
        alienservice.addfriend(username).then(function (value) {

            $location.path("/alien/"+$scope.me_username);
        },onError)
    }

});

app.factory("alienservice", function ($http,$cookies) {
   var auth ='';
    if($cookies.get('token'))
        auth = "Bearer "+$cookies.get('token').replace(/['"]+/g, '');

    console.log(auth);
    var getAlien = function (username) {

        return $http.get("http://localhost:8000/api/alien/"+username,{method:"POST",headers : {'Content-Type': 'application/json','Authorization': auth }})
            .then(function (response) {
                return response.data;
            });
    };
    
    var register = function (alien) {
        var data ={
            email: alien.email,
            username: alien.username,
            age: alien.age,
            family:alien.family,
            race:alien.race,
            food:alien.food,
            password:alien.password

        };
     return   $http.post("http://localhost:8000/pai/register",JSON.stringify(data),{data:JSON.stringify(data),method:"POST",headers : {'Content-Type': 'application/json','Authorization': auth}})
         .then(function (response) {
             return response.data;
         });
    };

    var editProfile = function (alien) {
        var data ={
            email: alien.email,
            username: alien.username,
            age: alien.age,
            family:alien.family,
            race:alien.race,
            food:alien.food,
            password:alien.password

        };
     return   $http.patch("http://localhost:8000/api/edit",JSON.stringify(data),{data:JSON.stringify(data),method:"PATCH",headers : {'Content-Type': 'application/json','Authorization': auth}})
         .then(function (response) {
             return response.data;
         });
    };



    var login = function (alien) {

        const credentials = 'Basic ' + btoa(alien.username + ':' + alien.password);
       return $http.post("http://localhost:8000/api/login",alien,{method:"POST", headers : {'Content-Type': 'application/json','PHP_AUTH_USER': alien.username,'PHP_AUTH_PW': alien.password,'Authorization': 'Basic '+credentials }});
    };
    var listalien =function () {

       return $http.get("http://localhost:8000/api/aliens",{headers :{'Content-Type': 'application/json','Authorization': auth}})
            .then(function (response) {
                return response.data;
            });
    } ;

    var searchAlien = function (username) {
        return $http.get("http://localhost:8000/api/search/"+username,{headers :{'Authorization': auth}})
            .then(function (response) {
                return response.data;
            });
    };
    
    var addfriend = function (username) {
        var data ={
            username: username

        };

        return $http.post("http://localhost:8000/api/addfriend",JSON.stringify(data),{data:JSON.stringify(data), method:"POST" ,headers : {'Content-Type': 'application/json','Authorization': auth}}).then(function (response) {
            return response.data;
        });
    };
    var getFriends = function () {
        return $http.get("http://localhost:8000/api/myfriends",{headers : {'Content-Type': 'application/json','Authorization': auth}}).then(function (response) {
            return response.data;
        });
    };

    var removeFriend = function (id) {
        return $http.delete("http://localhost:8000/api/removefriend/"+id,{method:"DELETE",headers : {'Content-Type': 'application/json','Authorization': auth}}).then(function (response) {
            return response.data;
        });
    };






    return {
        getAlien: getAlien,
        register: register,
        login: login,
        listalien: listalien,
        searchAlien: searchAlien,
        addfriend: addfriend,
        getFriends: getFriends,
        removeFriend: removeFriend,
        editProfile: editProfile

    };
});


