$(->
  (new ControllerApplication()).run()
)

class ControllerApplication
  socket: null
  isActive: false
  updatesPaused: false

  # overlay logic
  # =============

  run: ->
    @socket = io.connect('/controller')
    @_registerSocketEvents(@socket)

    # start connection
    @socket.on('connect', =>
      @socket.emit('register', (success) =>
        if (!success)
          @_setOverlayStatus("Unable to join server...")
        else
          if (success == 'active')
            @_startController()
          else
            @_setOverlayStatus("Waiting for canvas...")
      )
    )

    # set theme color to gray
    @_setThemeColor(Color().rgb(255,255,255))

    # set handlers
    button = $("#thebutton")
    button.on('touchstart', (e) =>
      @_startPress()
      e.stopPropagation()
      e.preventDefault()
    )
    button.mousedown((e) =>
      @_startPress()
    )
    button.on('touchend', (e) =>
      @_endPress()
      e.stopPropagation()
      e.preventDefault()
    )
    button.mouseup((e) =>
      @_endPress()
    )

    $(window).keydown((e) =>
      if (e.keyCode == 37)
        @angle = Math.PI / 2 + Math.PI
      else if (e.keyCode == 38)
        @angle = 0
      else if (e.keyCode == 39)
        @angle = Math.PI / 2
      else if (e.keyCode == 40)
        @angle = Math.PI
    )

    # attach gyro handlers
    gyro.startTracking (o) =>
      @_updateServer(o.alpha, o.beta)

  _showOverlay: (status) ->
    @isActive = false
    $("#overlay").fadeIn()
    @_setOverlayStatus(status)

  _registerSocketEvents: (socket) ->
    socket.on('viewer live', =>
      @_startController()
    )
    socket.on('no viewer', =>
      @_showOverlay("Waiting for canvas...")
    )
    socket.on('disconnect', =>
      @_showOverlay("Lost connection...")
    )

    socket.on('color change', (r, g, b) =>
      @_setThemeColor(Color().rgb(r,g,b))
    )

  _setOverlayStatus: (status) ->
    $("#status").text(status)
    @isActive = false

  # canvas logic
  # ============

  _startController: ->
    $("#overlay").fadeOut()
    @isActive = true

  _setThemeColor: (color) ->
    backgroundColor = new Color(color.rgb())
    backgroundColor.lighten(0.9)
    $("body").css('background-color', backgroundColor.rgbString())

    topColor = new Color(color.rgb())
    bottomColor = new Color(color.rgb())
    bottomColor.darken(0.2)
    gradientSpecifier = "top, " + topColor.hexString() + ", " + bottomColor.hexString();
    $("#thebutton").css('background-image', '-webkit-linear-gradient(' + gradientSpecifier + ')');
    #$("#thebutton").css('background-image', '-moz-linear-gradient(' + gradientSpecifier + ')');
    #$("#thebutton").css('background-image', '-o-linear-gradient(' + gradientSpecifier + ')');
    #$("#thebutton").css('background-image', 'linear-gradient(' + gradientSpecifier + ')');
    $("#thebutton").css('background-color', topColor.rgbString());
    console.log(gradientSpecifier)

  _startPress: ->
    if @isActive
      @socket.emit('start press')

  _endPress: ->
    if @isActive
      @socket.emit('end press')

  _updateServer: (alpha, beta) ->
    return if !@isActive

    if (@lastUpdate == undefined || (new Date()).getTime() - @lastUpdate > 100)
      @lastUpdate = (new Date()).getTime()

      if (!alpha)
        # we're on a desktop or such like
        angle = @angle
        magnitude = 1
      else
        #normalize alpha
        maxBeta = 30.0
        maxAlpha = 30.0
        if (alpha > 180)
          alpha = alpha - 360
        
        beta = beta / maxBeta
        alpha = - alpha / maxAlpha

        angle = Math.atan2(alpha, beta)
        if (angle < 0)
          angle += 2 * Math.PI

        magnitude = Math.sqrt(alpha * alpha + beta * beta)
        if (magnitude > 1)
          magnitude = 1
        else if (magnitude < 0.1)
          magnitude = 0
      @socket.emit('update', angle, magnitude)
