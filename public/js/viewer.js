// the PaperScript for the viewer...

var ARTIST_RADIUS = 20;
var MAX_SPEED = 100; // pixels per second

// handle controllers
var controllers = {};
var controller = function(id) {
  // drop it off somewhere random
  var x = Util.randInt(ARTIST_RADIUS, view.size.width - ARTIST_RADIUS);
  var y = Util.randInt(ARTIST_RADIUS, view.size.height - ARTIST_RADIUS);
  var path = new Path.Circle({
    center: new Point(x, y),
    radius: ARTIST_RADIUS
  });

  return {
    id: id,
    setVelocity: function(angle, magnitude) {
      this.angle = angle;
      this.magnitude = magnitude;
    },
    startPress: function() {
    },
    endPress: function() {
    },
    setColor: function(color) {
      this.color = color;
      path.fillColor = color.rgbString();
    },
    update: function(dt) {
      if (!this.hasOwnProperty('angle')) return;
      var dx = MAX_SPEED * this.magnitude * Math.sin(this.angle);
      var dy = - MAX_SPEED * this.magnitude * Math.cos(this.angle);
      path.position.x += dx * dt;
      path.position.y += dy * dt;
      // boundary detection
      if (path.position.x < -ARTIST_RADIUS) {
        path.position.x = view.size.width + ARTIST_RADIUS;
      } else if (path.position.x > view.size.width + ARTIST_RADIUS) {
        path.position.x = -ARTIST_RADIUS;
      }
      if (path.position.y < -ARTIST_RADIUS) {
        path.position.y = view.size.height + ARTIST_RADIUS;
      } else if (path.position.y > view.size.height + ARTIST_RADIUS) {
        path.position.y = -ARTIST_RADIUS;
      }
    },
    remove: function() {
      path.remove();
      // not pretty but for 7am...
      delete controllers[id];
    }
  };
};

window.globals.controllerhandler = {
  add: function(id) {
    controllers[id] = controller(id);
    return controllers[id];
  }
};

var lastTime = 0;

function onFrame(event) {
  var dt = (new Date()).getTime() - lastTime;
  dt /= 1000;
  for (var id in controllers) {
    if (controllers.hasOwnProperty(id)) {
      controllers[id].update(dt);
    }
  }
  lastTime = (new Date()).getTime();
}
