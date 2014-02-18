'use strict';

// socket.io communication-handling

var viewer;
var controller;

var currentViewer = null;

var controllers = {};

// from http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function registerViewerEvents(socket) {
  socket.on('register', function(fn) {
    if (currentViewer) {
      fn(false);
      return;
    }
    console.log(Object.keys(controllers));
    console.log("Viewer has joined!");
    controller.emit('viewer live');
    currentViewer = socket;
    socket.set('active', true, function() {
      fn(true, Object.keys(controllers));
    });
  });

  socket.on('color change', function(id, r, g, b) {
    controllers[id].emit('color change', r, g, b);
  });

  socket.on('disconnect', function() {
    if (currentViewer === socket) {
      currentViewer = null;
      controller.emit('no viewer');
      viewer.emit('no viewer');
    }
  });
}

function registerControllerEvents(socket) {
  socket.on('register', function(fn) {
    var newId = "";
    while (true) {
      newId = makeid();
      if (!(newId in controllers)) break;
    }
    controllers[newId] = socket;
    socket.set('id', newId, function() {
      console.log(newId + " has joined as an artist");
      if (currentViewer) {
        currentViewer.emit('joined', newId);
        fn('active');
      } else {
        fn('inactive');
      }
    });
  });

  socket.on('start press', function() {
    socket.get('id', function(err, id) {
      if (err) {
        console.log("Error getting id: " + err.toString());
      } else {
        if (currentViewer) {
          currentViewer.emit('start press', id);
        }
      }
    });
  });

  socket.on('end press', function() {
    socket.get('id', function(err, id) {
      if (err) {
        console.log("Error getting id: " + err.toString());
      } else {
        if (currentViewer) {
          currentViewer.emit('end press', id);
        }
      }
    });
  });

  socket.on('update', function(angle, magnitude, fn) {
    socket.get('id', function(err, id) {
      if (err) {
        console.log("Error getting id: " + err.toString());
      } else {
        if (currentViewer) {
          currentViewer.volatile.emit('update', id, angle, magnitude);
        }
      }
    });
  });

  socket.on('disconnect', function() {
    socket.get('id', function(err, id) {
      if (err) {
        console.log("Error getting id: " + err.toString());
      } else {
        if (currentViewer) {
          currentViewer.emit('left', id);
          if (id in controllers) {
            delete controllers[id];
          }
          console.log(id + " has left.");
        }
      }
    });
  });
}

module.exports = function(io) {
  viewer = io.of('/viewer').on('connection', function(socket) {
    registerViewerEvents(socket);
  });

  controller = io.of('/controller').on('connection', function(socket) {
    registerControllerEvents(socket);
  });
};
