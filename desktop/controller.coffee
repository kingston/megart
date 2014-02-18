class Controller
  constructor: (@id, @socket) ->
    hue = Util.randInt(0, 360)
    saturation = Util.randInt(25, 100)
    value = Util.randInt(75, 100)
    @paper = window.globals.controllerhandler.add(@id)
    @setColor(Color().hsv(hue, saturation, value))

  beginPress: ->
    @paper.startPress()

  endPress: ->
    @paper.endPress()

  update: (angle, magnitude) ->
    @paper.setVelocity(angle, magnitude)

  setColor: (color) ->
    @socket.emit('color change', @id, color)
    @paper.setColor(color)
    @color = color

  remove: ->
    @paper.remove()
