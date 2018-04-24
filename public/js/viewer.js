// the PaperScript for the viewer...

var ARTIST_RADIUS = 15;
var MAX_SPEED = 200; // pixels per second

// handle stars
var stars = [];

// layer handling
var backLayer = project.activeLayer;
var controllerLayer = new Layer();

var nyanMusic = new Howl({
  urls: ['http://dl.dropbox.com/u/31703/nyan.mp3'],
  loop: true
});
var runningMusic = new Howl({
  urls: ['https://dl.dropboxusercontent.com/u/4863004/running.mp3'],
  loop: true
});

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

var nyan = (function() {
  var NYAN_START = 30000; // time when first nyan is possible
  var NYAN_RARITY = 1500;

  var nyanElem = $("#nyan");

  var startTime = Util.now();
  var nx, ny;

  var hide = function() {
    nyanElem.fadeOut();
    state = 0;
  };

  var state = 0; // 0-hidden, 1-available, 2-taken

  var showTime;
  var nyanedController;

  var width = nyanElem.width(),
      height = nyanElem.height();

  var NYAN_RADIUS = width / 2.0; // time when first nyan is possible

  return {
    update: function(dt) {
      if (state == 0) {
        // hidden
        if (Util.now() - startTime > NYAN_START) {
          if (Util.randInt(0, NYAN_RARITY) == 10) {
            var x = Util.randInt(ARTIST_RADIUS, view.size.width - ARTIST_RADIUS);
            var y = Util.randInt(ARTIST_RADIUS, view.size.height - ARTIST_RADIUS);
            this.setPosition(x, y);
            state = 1;
            showTime = Util.now();
            nyanElem.fadeIn();
          }
        }
      } else if (state === 1) {
        if (Util.now() - showTime > 5000) {
          hide();
        }
      } else if (state === 2) {
        if (Util.now() - showTime > 22000) {
          nyanedController.stopNyan();
          nyanMusic.fade(1.0, 0.0, 1000, function() {
            nyanMusic.pause();
            runningMusic.play();
            runningMusic.fade(0.0, 1.0, 1000);
          });
          hide();
        }
      }
    },
    setPosition: function(x, y) {
      nx = x;
      ny = y;

      nyanElem.css('left', nx - width / 2.0);
      nyanElem.css('top', ny - height / 2.0);
    },
    hit: function(controller) {
      state = 2;
      showTime = Util.now();
      nyanedController = controller;
      runningMusic.fade(1.0, 0.0, 1000, function() {
        runningMusic.pause();
        nyanMusic.play();
        nyanMusic.fade(0.0, 1.0, 1000);
      });
    },
    isHit: function(x, y) {
      if (state != 1) return false;
      var dx = x - nx;
      var dy = y - ny;
      if (Math.sqrt(dx * dx + dy * dy) < ARTIST_RADIUS + NYAN_RADIUS) {
        return true;
      }
      return false;
    }
  }
})();

// handle controllers
var controllers = {};
var renderers = {};
var controller = function(master, id, type) { // drop it off somewhere random
  var startX = Util.randInt(ARTIST_RADIUS, view.size.width - ARTIST_RADIUS);
  var startY = Util.randInt(ARTIST_RADIUS, view.size.height - ARTIST_RADIUS);
  controllerLayer.activate();
  var path = new Path.Circle({
    center: new Point(startX, startY),
    radius: ARTIST_RADIUS
  });
  backLayer.activate();

  var renderer = renderers[type]();

  var startTime = Util.now();
  var randomTime = 0;
  var lastColorChangeTime = 0;

  var isNyaned = false;

  var targetAngle = 0;

  return {
    id: id,
    angle: -1,
    setVelocity: function(angle, magnitude) {
      if (this.angle == -1) this.angle = angle;
      targetAngle = angle;
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
    stopNyan: function() {
      renderer = renderers[type]();
      renderer.setColor(this.color);
      isNyaned = false;
    },
    update: function(dt) {
      // update angle

      // complex angle stuff (mini-code hack)
      var c = this.angle;
      var t = targetAngle;
      var l = Math.PI * 2;

      var offset = ((l/2) - c);
      var newT = (offset + t + l) % l;
      var newC = newT * 0.1 + (l/2) * 0.9;
      
      this.angle = (newC - offset + 2 * l) % l;

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
      renderer.move(path.position, this.angle);

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

      if (nyan.isHit(path.position.x, path.position.y)) {
        renderer = renderers['nyan']();
        isNyaned = true;
        nyan.hit(this);
      }

      if (isNyaned) {
        nyan.setPosition(path.position.x, path.position.y);
      }

      if (Util.now() - randomTime < 1000 || isNyaned) {
        if (Util.now() - lastColorChangeTime > 100) {
          master.setRandomColor();
          lastColorChangeTime = Util.now();
          if (!isNyaned) {
            renderer.reset(path.position);
          }
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
  var randomWidth = Util.randInt(10,15);
  return {
    color: new Color(0,0,0),
    startPress: function(position) {
      isDrawing = true;
      currentPath = new Path({
        segments: [position],
        strokeColor: this.color,
        strokeWidth: randomWidth,
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

renderers['shape'] = function() {
  var isDrawing = false;
  var currentPath = null;
  var radiusGrowth = Util.randInt(10,20)/50.0;
  var maxGrowth = Util.randInt(25,100);
  var radius;
  return {
    color: new Color(0,0,0),
    startPress: function(position) {
      isDrawing = true;
      radius = ARTIST_RADIUS;
      currentPath = new Path.Circle({
        center: position,
        radius: radius,
        fillColor: this.color
      });

    },
    setColor: function(color) {
      this.color = color;
      if (isDrawing) {
        currentPath.fillColor = color;
      }
    },
    endPress: function(position) {
      if (!isDrawing) return;
      isDrawing = false;
    },
    reset: function(position) {
    },
    move: function(position) {
      if (!isDrawing) return;
      radius += radiusGrowth;
      currentPath.remove();
      currentPath = new Path.Circle({
        center: position,
        radius: radius,
        fillColor: this.color
      });
      if (radius > maxGrowth) {
        this.endPress();
      }
    }
  };
};

renderers['nyan'] = function() {
  var isDrawing = false;
  var currentPath = null;
  var colors = ['red', 'orange', 'yellow', 'lime', 'blue', 'purple'];
  var paths = null;
  return {
    color: new Color(0,0,0),
    startPress: function(position) {
      isDrawing = true;
      paths = [];
      for (var i = 0; i < colors.length; i++) {
        paths.push(new Path({
          fillColor: colors[i]
        }));
      }
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
    move: function(position, angle) {
      if (!isDrawing) return;
      
      var middle = paths.length / 2;
      angle += Math.PI / 2;
      var rotated = new Point(Math.sin(angle), Math.cos(angle));
      for (var j = 0; j < paths.length; j++) {
        var path = paths[j];
        var unitLength = 7;
        var length = (j - middle) * unitLength;
        var top = position + rotated.normalize(length)
        var bottom = position + rotated.normalize(length + unitLength);
        path.add(top);
        path.insert(0, bottom);
        if (path.segments.length > 200) {
          this.reset();
          //var index = Math.round(path.segments.length / 2);
          //path.segments[index].remove();
          //path.segments[index - 1].remove();
        }
        path.smooth();
      }
    }
  };
};

window.globals.initializePaper = function() {
  runningMusic.play();
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
    if (Util.randInt(1, (stars.length + 1) * 400) == 2) {
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
  nyan.update(dt);
  lastTime = (new Date()).getTime();
}
