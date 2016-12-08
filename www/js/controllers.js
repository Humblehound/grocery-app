angular.module('starter.controllers', [])

  .controller('ItemController', function ($scope, $state, Item, $http) {

    $scope.title = "New item";
    $scope.item = {};
    $scope.action = function (item) {
      Item.save(item);
    }

    $scope.back = function () {
      $state.go('itemList', {}, {reload: true});
    };

    $scope.save = function (form) {
      if (form.$valid) {
        var token = sessionStorage.getItem("token");
        var userId = sessionStorage.getItem("userId");
        $http.defaults.headers.common['x-access-token'] = token;
        $scope.item.owner = userId;
        $scope.item.amount = 0;
        $scope.action($scope.item);
        $state.go('itemList', {}, {reload: true});
      }
    };
  })

  .controller('UpdateItemController', function ($scope, $state, Item, $http, $stateParams, StorageService) {
    if ($stateParams.id != "") {
      $http.defaults.headers.common['x-access-token'] = sessionStorage.getItem("token");
      $scope.item = Item.get({id: $stateParams.id}, function () {
        $scope.amount = StorageService.get($scope.item._id)
      });
      $scope.title = "Edit item";
      $scope.edit = true;
    }

    $scope.back = function () {
      $state.go('itemList', {}, {reload: true});
    };

    $scope.increase = function () {
      StorageService.increase($scope.item._id);
      $scope.amount = StorageService.get($scope.item._id)
    };

    $scope.decrease = function () {
      StorageService.decrease($scope.item._id);
      $scope.amount = StorageService.get($scope.item._id)
    };

    $scope.sync = function () {
      $scope.amount = StorageService.sync($scope.item)
      $scope.amount = StorageService.get($scope.item._id)
    }
  })

  .controller('ItemListController', function ($scope, $http, $ionicPopup, $state, $stateParams, $ionicHistory, $resource, $ionicSideMenuDelegate, Notification, User, Item, StorageService) {

    $scope.data = {
      showDelete: false
    };

    $scope.items = {}

    $scope.$on('$ionicView.afterEnter', function () {
      console.log("LOADED!")
    });

    $scope.loadNotes = function () {
      var token = sessionStorage.getItem("token");
      var userId = sessionStorage.getItem("userId");
      $http.defaults.headers.common['x-access-token'] = token;
      Item.query({userId: userId}, function (data) {
        $scope.items = data;
        console.log($scope.items)
        for (var i = 0; i < $scope.items.length; i++)
        {
          StorageService.sync($scope.items[i])
          $scope.items[i].amount = StorageService.get($scope.items[i]._id)
        }

      })
    };

    $scope.showConfirm = function (execute) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Delete account',
        template: 'Are you sure you want to delete this account?'
      });

      confirmPopup.then(function (res) {
        if (res) {
          execute()
        } else {
        }
      });
    };

    $scope.deleteItem = function (item) {
      Item.delete({id: item._id});
      var index = $scope.items.indexOf(item);
      $scope.items.splice(index, 1);
    };

    $scope.toggleSideMenu = function () {
      $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.addNewItem = function () {
      $state.go('item');
    };

    $scope.logout = function () {
      $ionicHistory.clearCache();
      $state.go('login', {}, {reload: true});
    };

    $scope.deleteAccount = function () {
      $scope.showConfirm(function () {
        var token = sessionStorage.getItem("token");
        var userId = sessionStorage.getItem("userId");
        $http.defaults.headers.common['x-access-token'] = token;
        User.delete({id: userId});
        $state.go('login', {}, {reload: true});
        Notification.show(response.message);
      })
    };

    $scope.reloadNotes = function () {
      $scope.items = {};
      $scope.loadNotes();
      $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.loadNotes();


  })

  .controller('RegisterController', function ($state, $http, $scope, Variables, Notification) {

    $scope.user = {}

    $scope.back = function () {
      $state.go("login")
    };

    $scope.register = function (form) {
      if (form.$valid) {
        var user = $scope.user;
        var registerUrl = Variables.serverAddress + "register"
        $http({
          method: 'POST',
          url: registerUrl,
          data: {email: user.username, password: user.password}
        }).success(function (response) {
          $http.defaults.headers.common['x-access-token'] = response.token;
          sessionStorage.setItem("token", response.token);
          sessionStorage.setItem("userId", response.userId);
          Notification.show(response.message);
          $state.go("itemList")
        }).error(function (err) {
          Notification.show(err);
        });
      }
    };
  })

  .controller('LoginController', function ($state, $http, $scope, Variables, Notification) {

    $scope.user = {};
    $scope.hideError = true;
    $scope.loginError = "Placeholder";

    $scope.signIn = function () {
      var user = $scope.user;
      var loginUrl = Variables.serverAddress + "login";

      $http({
        method: 'POST',
        url: loginUrl,
        data: {email: user.username, password: user.password}
      }).success(function (response) {
        $http.defaults.headers.common['x-access-token'] = response.token;
        sessionStorage.setItem("token", response.token);
        sessionStorage.setItem("userId", response.userId);
        $state.go("itemList")
      }).error(function (data, status) {
        $scope.loginError = data.message;
        $scope.hideError = false;
      });
    };
  });
