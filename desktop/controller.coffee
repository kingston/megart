class Controller
  constructor: (@id, @socket) ->
    @paper = window.globals.controllerhandler.add(@, @id, 'pen')
    @setRandomColor()

  setRandomColor: () ->
    hue = Util.randInt(0, 360)
    saturation = Util.randInt(50, 100)
    value = Util.randInt(50, 100)
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
