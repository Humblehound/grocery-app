angular.module('starter.services', [])

  .factory('Variables', function () {
    return {
      serverAddress: 'http://grocery-servnamespace.rhcloud.com:8000/'
    }
  })

  .factory("Item", function ($resource, Variables) {
    return $resource(Variables.serverAddress + 'item/:id', null, {
      'update': { method:'PUT' }
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
