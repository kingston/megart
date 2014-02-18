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
