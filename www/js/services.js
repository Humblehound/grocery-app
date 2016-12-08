angular.module('starter.services', [])

  .factory('Variables', function () {
    return {
      serverAddress: 'http://192.168.0.223:8080/',
      deviceId: function () {
        if (ionic.Platform.isAndroid()) {
          return window.device.uuid;
        } else {
          return ionic.Platform.platform();
        }
      }
    }
  })

  .factory("Item", function ($resource, Variables) {
    return $resource(Variables.serverAddress + 'item/:id', null, {
      'update': {method: 'PUT'}
    });
  })


  .factory('User', function ($resource, Variables) {
    return $resource(Variables.serverAddress + 'user/:id');
  })


  .factory('Notification', function ($q, $cordovaToast) {
    return {
      show: function (message) {
        try {
          $cordovaToast.show(message, 'short', 'top');
        } catch (err) {
          alert(message);
        }
      }
    };
  })

  .factory('httpRequestInterceptor', function () {
    return {
      request: function (config) {

        config.headers['Authorization'] = 'Basic d2VudHdvcnRobWFuOkNoYW5nZV9tZQ==';
        config.headers['Accept'] = 'application/json;odata=verbose';

        return config;
      }
    };
  })

  .factory('StorageService', function ($localStorage, $http, $cordovaDevice, Variables) {
    $localStorage = $localStorage.$default({
      localDeltas: []
    });

    var _increase = function (itemId) {

      var myDelta = $localStorage.localDeltas.filter(function (delta) {
        return (delta.device == Variables.deviceId() && delta.item == itemId);
      })[0];


      if (myDelta == undefined) {
        myDelta = {
          item: itemId,
          device: Variables.deviceId(),
          delta: 0
        };
        $localStorage.localDeltas.push(myDelta);
      }

      var index = $localStorage.localDeltas.indexOf(myDelta);
      $localStorage.localDeltas[index].delta++;
    };

    var _decrease = function (itemId) {
      var myDelta = $localStorage.localDeltas.filter(function (delta) {
        return (delta.device == Variables.deviceId() && delta.item == itemId);
      })[0];


      if (myDelta == undefined) {
        myDelta = {
          item: itemId,
          device: Variables.deviceId(),
          delta: 0
        };
        $localStorage.localDeltas.push(myDelta);
      }

      var index = $localStorage.localDeltas.indexOf(myDelta);
      $localStorage.localDeltas[index].delta--;
    };

    var _get = function (itemId) {
      var deltas = $localStorage.localDeltas.filter(function (delta) {
        return delta.device == Variables.deviceId() && delta.item == itemId;
      });

      var myTotal = 0;

      for (var i = 0, len = deltas.length; i < len; i++) {
        myTotal += deltas[i].delta;
      }
      return myTotal;
    };

    var _myDelta = function (itemId) {
      var myDelta = $localStorage.localDeltas.filter(function (delta) {
        return delta.device == Variables.deviceId() && delta.item == itemId;
      })[0];
      if (myDelta == undefined) {
        return 0
      } else {
        return myDelta.delta;
      }
    };

    var _sync = function (item) {
      $http.defaults.headers.common['x-access-token'] = sessionStorage.getItem("token");
      $http({
        method: 'POST',
        url: Variables.serverAddress + 'item/' + item._id + '/synchronize',
        data: {item: item._id, delta: _myDelta(item._id), device: Variables.deviceId()}
      }).success(function (serverDeltas) {

        var localItemDeltas = $localStorage.localDeltas.filter(function (delta) {
          return delta.item == item._id;
        });

        // remove all deltas related to this item from local storage
        $localStorage.localDeltas = $localStorage.localDeltas.filter(function (el) {
          return !localItemDeltas.includes(el);
        });
        // and add all received from the server
        $localStorage.localDeltas = $localStorage.localDeltas.concat(serverDeltas)

      }).error(function (err) {
        console.log(err)
      })
    };

    var _remove = function (productId) {
      // $localStorage.localDeltas[productId] = 0;
    };

    return {
      increase: _increase,
      decrease: _decrease,
      remove: _remove,
      get: _get,
      sync: _sync
    };
  })

  .factory('Chats', function () {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var chats = [{
      id: 0,
      name: 'Ben Sparrow',
      lastText: 'You on your way?',
      face: 'img/ben.png'
    }, {
      id: 1,
      name: 'Max Lynx',
      lastText: 'Hey, it\'s me',
      face: 'img/max.png'
    }, {
      id: 2,
      name: 'Adam Bradleyson',
      lastText: 'I should buy a boat',
      face: 'img/adam.jpg'
    }, {
      id: 3,
      name: 'Perry Governor',
      lastText: 'Look at my mukluks!',
      face: 'img/perry.png'
    }, {
      id: 4,
      name: 'Mike Harrington',
      lastText: 'This is wicked good ice cream.',
      face: 'img/mike.png'
    }];

    return {
      all: function () {
        return chats;
      },
      remove: function (chat) {
        chats.splice(chats.indexOf(chat), 1);
      },
      get: function (chatId) {
        for (var i = 0; i < chats.length; i++) {
          if (chats[i].id === parseInt(chatId)) {
            return chats[i];
          }
        }
        return null;
      }
    };
  });
