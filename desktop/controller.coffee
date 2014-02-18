class Controller
  constructor: (@id, @socket) ->
    hue = Util.randInt(0, 360)
    saturation = Util.randInt(25, 100)
    value = Util.randInt(75, 100)
    console.log(hue);
    console.log(saturation);
    console.log(value);
    @setColor(Color().hsv(hue, saturation, value))

  beginPress: ->

  endPress: ->

  update: (angle, magnitude) ->

  setColor: (color) ->
    @socket.emit('color change', @id, color)
    @color = color
