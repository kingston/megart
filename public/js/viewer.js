// the PaperScript for the viewer...

var ARTIST_RADIUS = 20;
var MAX_SPEED = 200; // pixels per second

// handle stars
var stars = [];

var star = function() {
  var startX = Util.randInt(ARTIST_RADIUS, view.size.width - ARTIST_RADIUS);
  var startY = Util.randInt(ARTIST_RADIUS, view.size.height - ARTIST_RADIUS);
  var raster = new Raster('star');

  raster.position = new Point(startX, startY);
  raster.scale(0.1);

  var startTime = Util.now();

  return {
    x: startX,
    y: startY,
    update: function(dt) {
      raster.rotate(1);
      if (Util.now() - startTime > 20000) {
        this.remove();
      }
    },
    remove: function() {
      raster.remove();
      stars.splice(stars.indexOf(this), 1);
    }
  }
};

// handle controllers
var controllers = {};
var renderers = {};
var controller = function(master, id, type) { // drop it off somewhere random
  var startX = Util.randInt(ARTIST_RADIUS, view.size.width - ARTIST_RADIUS);
  var startY = Util.randInt(ARTIST_RADIUS, view.size.height - ARTIST_RADIUS);
  var path = new Path.Circle({
    center: new Point(startX, startY),
    radius: ARTIST_RADIUS
  });

  var renderer = renderers[type]();

  var startTime = Util.now();
  var randomTime = 0;
  var lastColorChangeTime = 0;

  return {
    id: id,
    setVelocity: function(angle, magnitude) {
      this.angle = angle;
      this.magnitude = magnitude;
    },
    startPress: function() {
      renderer.startPress(path.position);
    },
    endPress: function() {
      renderer.endPress(path.position);
    },
    setColor: function(color) {
      color = new Color(color.red() / 256.0, color.green() / 256.0, color.blue() / 256.0);
      this.color = color;
      path.fillColor = color;
      renderer.setColor(color);
    },
    update: function(dt) {
      if (Util.now() - startTime < 500) {
        var percentage = 1 - (Util.now() - startTime) / 500.0
        path.position.y = startY - 20 + percentage * 20 * Math.abs(Math.sin((Util.now() - startTime) / 50.0));
        return;
      }
      if (!this.hasOwnProperty('angle')) return;
      var dx = MAX_SPEED * this.magnitude * Math.sin(this.angle);
      var dy = - MAX_SPEED * this.magnitude * Math.cos(this.angle);
      path.position.x += dx * dt;
      path.position.y += dy * dt;
      // boundary detection
      if (path.position.x < -ARTIST_RADIUS) {
        path.position.x = view.size.width + ARTIST_RADIUS;
        renderer.reset(path.position);
      } else if (path.position.x > view.size.width + ARTIST_RADIUS) {
        path.position.x = -ARTIST_RADIUS;
        renderer.reset(path.position);
      }
      if (path.position.y < -ARTIST_RADIUS) {
        path.position.y = view.size.height + ARTIST_RADIUS;
        renderer.reset(path.position);
      } else if (path.position.y > view.size.height + ARTIST_RADIUS) {
        path.position.y = -ARTIST_RADIUS;
        renderer.reset(path.position);
      }
      renderer.move(path.position);

      // hit tests
      for (var i = 0; i < stars.length; i++) {
        var star = stars[i];
        var dx = star.x - path.position.x;
        var dy = star.y - path.position.y;
        if (Math.sqrt(dx * dx + dy * dy) < ARTIST_RADIUS * 2 + 10) {
          star.remove();
          randomTime = Util.now();
        }
      }

      if (Util.now() - randomTime < 1000) {
        if (Util.now() - lastColorChangeTime > 100) {
          master.setRandomColor();
          lastColorChangeTime = Util.now();
          renderer.reset(path.position);
        }
      }
    },
    remove: function() {
      path.remove();
      // not pretty but for 7am...
      delete controllers[id];
    }
  };
};

renderers['pen'] = function() {
  var isDrawing = false;
  var currentPath = null;
  return {
    color: new Color(0,0,0),
    startPress: function(position) {
      isDrawing = true;
      currentPath = new Path({
        segments: [position],
        strokeColor: this.color,
        strokeWidth: 20,
        strokeCap: 'round'
      });

    },
    setColor: function(color) {
      this.color = color;
    },
    endPress: function(position) {
      if (!isDrawing) return;
      isDrawing = false;
    },
    reset: function(position) {
      if (!isDrawing) return;
      this.endPress(position);
      this.startPress(position);
    },
    move: function(position) {
      if (!isDrawing) return;
      currentPath.add(position);
      currentPath.smooth();
    }
  };
};

window.globals.controllerhandler = {
  add: function(master, id, type) {
    controllers[id] = controller(master, id, type);
    return controllers[id];
  }
};

var lastTime = 0;

function onFrame(event) {
  var dt = (new Date()).getTime() - lastTime;
  dt /= 1000;
  if (stars.length < 3) {
    if (Util.randInt(1, (stars.length + 1) * 500) == 2) {
      stars.push(star());
    }
  }
  for (var i = 0; i < stars.length; i++) {
    stars[i].update(dt);
  }
  for (var id in controllers) {
    if (controllers.hasOwnProperty(id)) {
      controllers[id].update(dt);
    }
  }
  lastTime = (new Date()).getTime();
}
