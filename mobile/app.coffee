$(->
  (new ControllerApplication()).run()
)

class ControllerApplication
  socket: null

  # overlay logic
  # =============

  run: ->
    @socket = io.connect('/controller')
    @_registerSocketEvents(@socket)

    # start connection
    @socket.emit('register', (success) =>
      if (!success)
        @_setOverlayStatus("Unable to join server...")
      else
        if (success == 'active')
          @_startController()
        else
          @_setOverlayStatus("Waiting for canvas...")
    )

    # set theme color to gray
    @_setThemeColor(Color().rgb(255,0,0))

  _showOverlay: (status) ->
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

  _setOverlayStatus: (status) ->
    $("#status").text(status)

  # canvas logic
  # ============

  _startController: ->
    $("#overlay").fadeOut()

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

